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

export type ChordChartDataTableMode = 'hidden' | 'visible' | false;

export interface ChordChartProps extends DefaultProps<ChordChartStylesNames> {
  matrix: number[][];
  labels: string[];
  size?: number;
  colors?: string[];
  showLabels?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: ChordChartDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const PADDING = 28;
const INNER_RADIUS_RATIO = 0.72;

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

    arc: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    ribbon: {
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
      fill: 'var(--chart-chord-label-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem',
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

export type ChordChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ChordChartProps> = {
  size: 320,
  showLabels: true,
  ariaLabel: 'Chord chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'chord-chart',
  animated: false
};

interface ChordArc {
  label: string;
  index: number;
  value: number;
  startAngle: number;
  endAngle: number;
  color: string;
}

interface ChordRibbon {
  source: ChordArc;
  target: ChordArc;
  value: number;
  sourceStartAngle: number;
  sourceEndAngle: number;
  targetStartAngle: number;
  targetEndAngle: number;
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function largeArcFlag(startAngle: number, endAngle: number) {
  return endAngle - startAngle > 180 ? 1 : 0;
}

function fullRingPath(cx: number, cy: number, outerRadius: number, innerRadius: number) {
  return [
    `M ${cx} ${cy - outerRadius}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius}`,
    'Z',
    `M ${cx} ${cy - innerRadius}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}`,
    'Z'
  ].join(' ');
}

function annulusPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  if (endAngle - startAngle >= 359.999) {
    return fullRingPath(cx, cy, outerRadius, innerRadius);
  }

  const largeArc = largeArcFlag(startAngle, endAngle);
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ');
}

function ribbonPath(
  cx: number,
  cy: number,
  radius: number,
  sourceStartAngle: number,
  sourceEndAngle: number,
  targetStartAngle: number,
  targetEndAngle: number
) {
  const sourceStart = polarToCartesian(cx, cy, radius, sourceStartAngle);
  const sourceEnd = polarToCartesian(cx, cy, radius, sourceEndAngle);
  const targetStart = polarToCartesian(cx, cy, radius, targetStartAngle);
  const targetEnd = polarToCartesian(cx, cy, radius, targetEndAngle);

  return [
    `M ${sourceStart.x} ${sourceStart.y}`,
    `Q ${cx} ${cy} ${targetStart.x} ${targetStart.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag(targetStartAngle, targetEndAngle)} 1 ${targetEnd.x} ${
      targetEnd.y
    }`,
    `Q ${cx} ${cy} ${sourceEnd.x} ${sourceEnd.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag(sourceStartAngle, sourceEndAngle)} 0 ${sourceStart.x} ${
      sourceStart.y
    }`,
    'Z'
  ].join(' ');
}

function readCell(matrix: number[][], row: number, column: number) {
  const value = matrix[row]?.[column];

  return Number.isFinite(value) && value > 0 ? value : 0;
}

const _ChordChart = forwardRef<HTMLDivElement, ChordChartProps>((props, ref) => {
  const {
    matrix,
    labels,
    size,
    colors,
    showLabels,
    valueFormatter,
    ariaLabel,
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
    name: 'chord-chart',
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
  const count = Math.min(matrix.length, labels.length);
  const outgoing = Array.from({ length: count }, (_item, row) =>
    Array.from({ length: count }, (_cell, column) => readCell(matrix, row, column)).reduce(
      (total, value) => total + value,
      0
    )
  );
  const incoming = Array.from({ length: count }, (_item, column) =>
    Array.from({ length: count }, (_cell, row) => readCell(matrix, row, column)).reduce(
      (total, value) => total + value,
      0
    )
  );
  const arcValues = Array.from({ length: count }, (_item, index) =>
    Math.max(outgoing[index], incoming[index])
  );
  const total = arcValues.reduce((sum, value) => sum + value, 0);

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

  if (count === 0 || total <= 0) {
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

  const center = size / 2;
  const outerRadius = Math.max(1, center - PADDING);
  const innerRadius = Math.max(1, outerRadius * INNER_RADIUS_RATIO);
  const colorAt = (index: number) => {
    if (colors && colors.length > 0) {
      return colors[index % colors.length];
    }

    return CHART_COLORS[index % CHART_COLORS.length];
  };
  let angle = 0;
  const arcs: ChordArc[] = labels.slice(0, count).map((label, index) => {
    const sweep = (arcValues[index] / total) * 360;
    const arc = {
      label,
      index,
      value: arcValues[index],
      startAngle: angle,
      endAngle: angle + sweep,
      color: colorAt(index)
    };

    angle += sweep;

    return arc;
  });
  const outgoingOffset = new Array<number>(count).fill(0);
  const incomingOffset = new Array<number>(count).fill(0);
  const ribbons: ChordRibbon[] = [];

  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      const value = readCell(matrix, row, column);

      if (row !== column && value > 0) {
        const source = arcs[row];
        const target = arcs[column];
        const sweep = (value / total) * 360;
        const sourceStartAngle = source.startAngle + (outgoingOffset[row] / total) * 360;
        const targetStartAngle = target.startAngle + (incomingOffset[column] / total) * 360;

        outgoingOffset[row] += value;
        incomingOffset[column] += value;

        ribbons.push({
          source,
          target,
          value,
          sourceStartAngle,
          sourceEndAngle: sourceStartAngle + sweep,
          targetStartAngle,
          targetEndAngle: targetStartAngle + sweep
        });
      }
    }
  }

  const dataTable = showDataTable
    ? {
        columns: ['Source', 'Target', 'Value'],
        rows: ribbons.map((ribbon) => [
          ribbon.source.label,
          ribbon.target.label,
          valueFormatter(ribbon.value)
        ])
      }
    : null;

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
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveItem(null)}
      >
        <title>{ariaLabel}</title>
        {ribbons.map((ribbon) => {
          const text = `${ribbon.source.label} → ${ribbon.target.label}: ${valueFormatter(
            ribbon.value
          )}`;
          const midAngle = (ribbon.sourceStartAngle + ribbon.sourceEndAngle) / 2;
          const anchor = polarToCartesian(
            center,
            center,
            (outerRadius + innerRadius) / 2,
            midAngle
          );

          return (
            <path
              key={`${ribbon.source.index}-${ribbon.target.index}`}
              className={cx(classes.ribbon)}
              d={ribbonPath(
                center,
                center,
                outerRadius,
                ribbon.sourceStartAngle,
                ribbon.sourceEndAngle,
                ribbon.targetStartAngle,
                ribbon.targetEndAngle
              )}
              fill={ribbon.source.color}
              fillOpacity={0.35}
              data-chord-link={`${ribbon.source.label}->${ribbon.target.label}`}
              data-chord-value={ribbon.value}
              data-source-start-angle={ribbon.sourceStartAngle}
              data-source-end-angle={ribbon.sourceEndAngle}
              data-target-start-angle={ribbon.targetStartAngle}
              data-target-end-angle={ribbon.targetEndAngle}
              role="img"
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() => setActiveItem({ x: anchor.x, y: anchor.y, text })}
              onFocus={() => setActiveItem({ x: anchor.x, y: anchor.y, text })}
              onBlur={() => setActiveItem(null)}
            />
          );
        })}
        {arcs
          .filter((arc) => arc.value > 0)
          .map((arc) => {
            const text = `${arc.label}: ${valueFormatter(arc.value)}`;
            const midAngle = (arc.startAngle + arc.endAngle) / 2;
            const anchor = polarToCartesian(
              center,
              center,
              (outerRadius + innerRadius) / 2,
              midAngle
            );
            const labelPoint = polarToCartesian(center, center, outerRadius + 12, midAngle);

            return (
              <g key={`${arc.label}-${arc.index}`}>
                <path
                  className={cx(classes.arc)}
                  d={annulusPath(
                    center,
                    center,
                    outerRadius,
                    innerRadius,
                    arc.startAngle,
                    arc.endAngle
                  )}
                  fill={arc.color}
                  fillRule="evenodd"
                  data-chord-label={arc.label}
                  data-chord-value={arc.value}
                  data-start-angle={arc.startAngle}
                  data-end-angle={arc.endAngle}
                  role="img"
                  tabIndex={0}
                  aria-label={text}
                  onMouseEnter={() => setActiveItem({ x: anchor.x, y: anchor.y, text })}
                  onFocus={() => setActiveItem({ x: anchor.x, y: anchor.y, text })}
                  onBlur={() => setActiveItem(null)}
                />
                {showLabels && (
                  <text
                    className={cx(classes.label)}
                    x={labelPoint.x}
                    y={labelPoint.y}
                    textAnchor={Math.cos(((midAngle - 90) * Math.PI) / 180) >= 0 ? 'start' : 'end'}
                    dominantBaseline="middle"
                  >
                    {arc.label}
                  </text>
                )}
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

_ChordChart.displayName = 'ChordChart';

export { _ChordChart as ChordChart };
