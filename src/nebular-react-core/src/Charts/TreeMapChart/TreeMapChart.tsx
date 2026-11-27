import React, { forwardRef, useCallback, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../../Button';
import { ChartDataTable } from '../ChartDataTable';
import { exportChartPng, exportChartSvg, resolveChartFileName } from '../chart-export';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import { CHART_COLORS } from '../LineChart';

export interface TreeMapChartChild {
  label: string;
  value: number;
  color?: string;
}

export interface TreeMapChartData {
  label: string;
  value: number;
  color?: string;
  children?: TreeMapChartChild[];
}

export type TreeMapChartDataTableMode = 'hidden' | 'visible' | false;

export interface TreeMapChartProps extends DefaultProps<TreeMapChartStylesNames> {
  data: TreeMapChartData[];
  height?: number;
  valueFormatter?(value: number): string;
  showValues?: boolean;
  ariaLabel?: string;
  onItemClick?(item: TreeMapChartData): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: TreeMapChartDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const CHART_WIDTH = 480;
const CHART_PADDING = 4;
const CHILD_PADDING = 2;
const LABEL_CHAR_WIDTH = 6;
const LABEL_ROW_HEIGHT = 14;

interface TreemapBox {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
}

interface MeasuredItem {
  index: number;
  area: number;
}

const useStyles = createStyles((_theme) => {
  const enter = keyframes({
    from: { opacity: 0, transform: 'translateY(4px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  });

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '100%',
      fontFamily: 'var(--chart-text-font-family, inherit)'
    },

    animated: {
      animation: `${enter} 220ms ease-out both`,

      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none'
      }
    },

    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },

    status: {
      color: 'var(--chart-status-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    svg: {
      display: 'block',
      width: '100%',
      height: 'auto',
      overflow: 'visible'
    },

    item: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    label: {
      fill: 'var(--chart-treemap-label-color, #ffffff)',
      fontSize: '0.65rem',
      fontWeight: 600,
      pointerEvents: 'none'
    },

    value: {
      fill: 'var(--chart-treemap-value-color, #ffffff)',
      fontSize: '0.6rem',
      opacity: 0.92,
      pointerEvents: 'none'
    },

    tooltipBox: {
      fill: 'var(--chart-tooltip-background-color, var(--background-basic-color-1, #ffffff))',
      stroke: 'var(--chart-tooltip-border-color, var(--border-basic-color-3, #e4e9f2))',
      strokeWidth: 1
    },

    tooltipText: {
      fill: 'var(--chart-tooltip-text-color, var(--text-basic-color, #222b45))',
      fontSize: '0.65rem'
    },

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type TreeMapChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<TreeMapChartProps> = {
  height: 280,
  showValues: true,
  ariaLabel: 'Treemap chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'treemap-chart',
  animated: false
};

function worstAspectRatio(row: number[], side: number) {
  if (row.length === 0 || side <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  const sum = row.reduce((total, area) => total + area, 0);
  const max = Math.max(...row);
  const min = Math.min(...row);

  if (sum <= 0 || min <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  const sideSquared = side * side;
  const sumSquared = sum * sum;

  return Math.max((sideSquared * max) / sumSquared, sumSquared / (sideSquared * min));
}

function layoutRow(row: number[], x: number, y: number, width: number, height: number) {
  const sum = row.reduce((total, area) => total + area, 0);

  if (sum <= 0 || width <= 0 || height <= 0) {
    return {
      boxes: row.map(() => ({ x, y, width: 0, height: 0 })),
      thickness: 0
    };
  }

  const column = width >= height;
  const thickness = Math.min(column ? width : height, column ? sum / height : sum / width);
  let offset = column ? y : x;
  const boxes = row.map((area) => {
    if (column) {
      const itemHeight = (area / sum) * height;
      const box = { x, y: offset, width: thickness, height: itemHeight };

      offset += itemHeight;

      return box;
    }

    const itemWidth = (area / sum) * width;
    const box = { x: offset, y, width: itemWidth, height: thickness };

    offset += itemWidth;

    return box;
  });

  return { boxes, thickness };
}

function squarify(items: MeasuredItem[], x: number, y: number, width: number, height: number) {
  const boxes: TreemapBox[] = [];
  const remaining = items.slice();
  let currentX = x;
  let currentY = y;
  let currentWidth = width;
  let currentHeight = height;
  let row: MeasuredItem[] = [];

  const flush = () => {
    if (row.length === 0) {
      return;
    }

    const laidOut = layoutRow(
      row.map((item) => item.area),
      currentX,
      currentY,
      currentWidth,
      currentHeight
    );

    laidOut.boxes.forEach((box, boxIndex) => {
      boxes.push({ ...box, index: row[boxIndex].index });
    });

    if (currentWidth >= currentHeight) {
      currentX += laidOut.thickness;
      currentWidth = Math.max(0, currentWidth - laidOut.thickness);
    } else {
      currentY += laidOut.thickness;
      currentHeight = Math.max(0, currentHeight - laidOut.thickness);
    }

    row = [];
  };

  while (remaining.length > 0) {
    const next = remaining[0];

    if (currentWidth <= 0 || currentHeight <= 0) {
      row.push(next);
      remaining.shift();
    } else {
      const side = Math.min(currentWidth, currentHeight);
      const candidate = [...row.map((item) => item.area), next.area];

      if (
        row.length === 0 ||
        worstAspectRatio(candidate, side) <=
          worstAspectRatio(
            row.map((item) => item.area),
            side
          )
      ) {
        row.push(next);
        remaining.shift();
      } else {
        flush();
      }
    }
  }

  flush();

  return boxes;
}

function truncateLabel(label: string, width: number) {
  const maxChars = Math.floor(width / LABEL_CHAR_WIDTH);

  if (maxChars <= 0) {
    return '';
  }

  if (label.length <= maxChars) {
    return label;
  }

  if (maxChars <= 1) {
    return '…';
  }

  return `${label.slice(0, maxChars - 1)}…`;
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

const _TreeMapChart = forwardRef<HTMLDivElement, TreeMapChartProps>((props, ref) => {
  const {
    data,
    height,
    valueFormatter,
    showValues,
    ariaLabel,
    onItemClick,
    showDataTable,
    dataTableCaption,
    exportable,
    exportFileName,
    animated,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'treemap-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const assignRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const hasChildren = data.some((item) => (item.children?.length ?? 0) > 0);
  const dataTable = showDataTable
    ? {
        columns: hasChildren ? ['Label', 'Value', 'Parent'] : ['Label', 'Value'],
        rows: data.flatMap((item) => [
          [item.label, valueFormatter(item.value), ...(hasChildren ? [''] : [])],
          ...(item.children ?? []).map((child) => [
            child.label,
            valueFormatter(child.value),
            ...(hasChildren ? [item.label] : [])
          ])
        ])
      }
    : null;

  const handleExport = async (format: 'svg' | 'png') => {
    const svg = rootRef.current?.querySelector('svg');

    if (!svg) {
      setExportStatus('No chart to export');
      return;
    }

    try {
      if (format === 'svg') {
        exportChartSvg(svg, exportFileName);
      } else {
        await exportChartPng(svg, exportFileName);
      }

      setExportStatus(`Exported ${resolveChartFileName(exportFileName, format)}`);
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  if (data.length === 0 || total <= 0) {
    return (
      <div
        ref={ref}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const plotWidth = CHART_WIDTH - CHART_PADDING * 2;
  const plotHeight = height - CHART_PADDING * 2;
  const plotArea = plotWidth * plotHeight;
  const measured = data
    .map((item, index) => ({
      index,
      area: (Math.max(0, item.value) / total) * plotArea
    }))
    .filter((item) => item.area > 0)
    .sort((first, second) => second.area - first.area || first.index - second.index);
  const boxes = squarify(measured, CHART_PADDING, CHART_PADDING, plotWidth, plotHeight);
  const interactive = typeof onItemClick === 'function';

  return (
    <div
      ref={assignRef}
      className={cx(classes.root, isAnimated && classes.animated, className)}
      data-animated={isAnimated ? 'true' : undefined}
    >
      {exportable && (
        <div className={cx(classes.toolbar)}>
          <Button
            size="tiny"
            appearance="outline"
            type="button"
            onClick={() => {
              handleExport('svg').catch(() => undefined);
            }}
          >
            Export SVG
          </Button>
          <Button
            size="tiny"
            appearance="outline"
            type="button"
            onClick={() => {
              handleExport('png').catch(() => undefined);
            }}
          >
            Export PNG
          </Button>
          {exportStatus && (
            <span role="status" aria-live="polite" className={cx(classes.status)}>
              {exportStatus}
            </span>
          )}
        </div>
      )}
      <svg
        className={cx(classes.svg)}
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveItem(null)}
      >
        <title>{ariaLabel}</title>
        {boxes.map((box) => {
          const item = data[box.index];
          const color = item.color ?? CHART_COLORS[box.index % CHART_COLORS.length];
          const text = `${item.label}: ${valueFormatter(item.value)}`;
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const label = truncateLabel(item.label, box.width - 8);
          const children = item.children ?? [];
          const childTotal = children.reduce((sum, child) => sum + Math.max(0, child.value), 0);
          const innerWidth = box.width - CHILD_PADDING * 2;
          const innerHeight = box.height - CHILD_PADDING * 2;
          const childBoxes =
            innerWidth > 4 && innerHeight > 4 && childTotal > 0
              ? squarify(
                  children
                    .map((child, childIndex) => ({
                      index: childIndex,
                      area: (Math.max(0, child.value) / childTotal) * innerWidth * innerHeight
                    }))
                    .filter((child) => child.area > 0),
                  box.x + CHILD_PADDING,
                  box.y + CHILD_PADDING,
                  innerWidth,
                  innerHeight
                ).sort((first, second) => first.index - second.index)
              : [];

          return (
            <g key={`${item.label}-${box.index}`}>
              <rect
                className={cx(classes.item)}
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                fill={color}
                data-treemap-depth="0"
                data-treemap-label={item.label}
                role={interactive ? 'button' : 'img'}
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveItem({ x: centerX, y: centerY, text })}
                onFocus={() => setActiveItem({ x: centerX, y: centerY, text })}
                onBlur={() => setActiveItem(null)}
                onClick={() => onItemClick?.(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onItemClick?.(item);
                  }
                }}
              />
              {box.width >= 24 && box.height >= LABEL_ROW_HEIGHT && label.length > 0 && (
                <text
                  className={cx(classes.label)}
                  x={centerX}
                  y={showValues ? centerY - 5 : centerY + 3}
                  textAnchor="middle"
                >
                  {label}
                </text>
              )}
              {showValues && box.width >= 24 && box.height >= LABEL_ROW_HEIGHT * 2 && (
                <text className={cx(classes.value)} x={centerX} y={centerY + 9} textAnchor="middle">
                  {valueFormatter(item.value)}
                </text>
              )}
              {childBoxes.map((childBox) => {
                const child = children[childBox.index];
                const childText = `${item.label} · ${child.label}: ${valueFormatter(child.value)}`;
                const childLabel = truncateLabel(child.label, childBox.width - 6);
                const childCenterX = childBox.x + childBox.width / 2;
                const childCenterY = childBox.y + childBox.height / 2;

                return (
                  <g key={`${child.label}-${childBox.index}`}>
                    <rect
                      className={cx(classes.item)}
                      x={childBox.x}
                      y={childBox.y}
                      width={childBox.width}
                      height={childBox.height}
                      fill={child.color ?? color}
                      stroke="var(--background-basic-color-1, #ffffff)"
                      strokeWidth={1}
                      data-treemap-depth="1"
                      data-treemap-label={child.label}
                      role={interactive ? 'button' : 'img'}
                      tabIndex={0}
                      aria-label={childText}
                      onMouseEnter={() =>
                        setActiveItem({ x: childCenterX, y: childCenterY, text: childText })
                      }
                      onFocus={() =>
                        setActiveItem({ x: childCenterX, y: childCenterY, text: childText })
                      }
                      onBlur={() => setActiveItem(null)}
                      onClick={() => onItemClick?.(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onItemClick?.(item);
                        }
                      }}
                    />
                    {childBox.width >= 20 && childBox.height >= 12 && childLabel.length > 0 && (
                      <text
                        className={cx(classes.value)}
                        x={childCenterX}
                        y={
                          showValues && childBox.height >= 30 ? childCenterY - 2 : childCenterY + 3
                        }
                        textAnchor="middle"
                      >
                        {childLabel}
                      </text>
                    )}
                    {showValues && childBox.width >= 20 && childBox.height >= 30 && (
                      <text
                        className={cx(classes.value)}
                        x={childCenterX}
                        y={childCenterY + 10}
                        textAnchor="middle"
                      >
                        {valueFormatter(child.value)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {activeItem && (
          <g transform={`translate(${activeItem.x}, ${activeItem.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeItem.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeItem.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeItem.text}
            </text>
          </g>
        )}
      </svg>
      {dataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={dataTable.columns}
          rows={dataTable.rows}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_TreeMapChart.displayName = 'TreeMapChart';

export { _TreeMapChart as TreeMapChart };
