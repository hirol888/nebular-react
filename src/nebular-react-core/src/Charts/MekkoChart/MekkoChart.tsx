import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Button } from '../../Button';
import { CHART_COLORS, ChartLegend } from '../LineChart';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export interface MekkoChartSegment {
  label: string;
  value: number;
  color?: string;
}

export interface MekkoChartColumn {
  label: string;
  segments: MekkoChartSegment[];
}

export type MekkoChartDataTableMode = 'hidden' | 'visible' | false;

export interface MekkoChartProps extends DefaultProps<MekkoChartStylesNames> {
  data: MekkoChartColumn[];
  height?: number;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onSegmentClick?(column: MekkoChartColumn, segment: MekkoChartSegment): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: MekkoChartDataTableMode;
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
const PADDING = { top: 16, right: 16, bottom: 44, left: 48 };
const COLUMN_GAP = 4;

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
      gap: '0.5rem',
      width: '100%'
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

    grid: {
      stroke: 'var(--chart-grid-color, var(--border-basic-color-3, #e4e9f2))',
      strokeWidth: 1
    },

    axis: {
      stroke: 'var(--chart-axis-color, var(--border-basic-color-4, #c5cee0))',
      strokeWidth: 1
    },

    axisText: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.65rem'
    },

    columnLabel: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem',
      fontWeight: 600
    },

    segment: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
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

    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      margin: 0,
      padding: 0,
      listStyle: 'none'
    },

    legendItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      color: 'var(--chart-legend-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.75rem'
    },

    legendSwatch: {
      width: '0.65rem',
      height: '0.65rem',
      borderRadius: '2px',
      flex: '0 0 auto'
    },

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type MekkoChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<MekkoChartProps> = {
  height: 300,
  showLegend: true,
  ariaLabel: 'Mekko chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'mekko-chart',
  animated: false
};

interface MekkoSegmentLayout {
  segment: MekkoChartSegment;
  value: number;
  share: number;
  color: string;
  y: number;
  height: number;
}

interface MekkoColumnLayout {
  column: MekkoChartColumn;
  total: number;
  x: number;
  width: number;
  segments: MekkoSegmentLayout[];
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

const _MekkoChart = forwardRef<HTMLDivElement, MekkoChartProps>((props, ref) => {
  const {
    data,
    height,
    showLegend,
    valueFormatter,
    ariaLabel,
    onSegmentClick,
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
    name: 'mekko-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const hasPositiveValue = (segment: MekkoChartSegment) =>
    Number.isFinite(segment.value) && segment.value > 0;
  const columnsWithValues = data
    .map((column) => ({
      column,
      segments: column.segments.filter(hasPositiveValue),
      total: column.segments
        .filter(hasPositiveValue)
        .reduce((total, segment) => total + segment.value, 0)
    }))
    .filter((column) => column.total > 0);
  const grandTotal = columnsWithValues.reduce((total, column) => total + column.total, 0);

  const handleExport = async (format: ChartExportFormat) => {
    const svg = rootRef.current?.querySelector('svg');

    if (!svg) {
      setExportStatus('No chart to export');
      return;
    }

    try {
      if (format === 'svg') {
        exportChartSvg(svg, exportFileName);
        setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'svg')}`);
        return;
      }

      await exportChartPng(svg, exportFileName, { scale: 2 });
      setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'png')}`);
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  if (columnsWithValues.length === 0 || grandTotal <= 0) {
    return (
      <div
        ref={mergedRef}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const legendEntries: { label: string; color: string }[] = [];
  const colorByLabel = new Map<string, string>();

  columnsWithValues.forEach((column) => {
    column.segments.forEach((segment) => {
      if (!colorByLabel.has(segment.label)) {
        const color = segment.color ?? CHART_COLORS[legendEntries.length % CHART_COLORS.length];

        colorByLabel.set(segment.label, color);
        legendEntries.push({ label: segment.label, color });
      }
    });
  });

  const availableWidth = plotWidth - COLUMN_GAP * Math.max(0, columnsWithValues.length - 1);
  let offsetX = PADDING.left;
  const columnLayouts: MekkoColumnLayout[] = columnsWithValues.map((column) => {
    const width = Math.max(0, (column.total / grandTotal) * availableWidth);
    const x = offsetX;
    let offsetY = PADDING.top;
    const segments = column.segments.map((segment) => {
      const share = segment.value / column.total;
      const segmentHeight = share * plotHeight;
      const layout = {
        segment,
        value: segment.value,
        share,
        color: segment.color ?? colorByLabel.get(segment.label) ?? CHART_COLORS[0],
        y: offsetY,
        height: segmentHeight
      };

      offsetY += segmentHeight;

      return layout;
    });

    offsetX += width + COLUMN_GAP;

    return {
      column: column.column,
      total: column.total,
      x,
      width,
      segments
    };
  });
  const yTicks = Array.from({ length: 5 }, (_item, index) => index / 4);
  const interactive = typeof onSegmentClick === 'function';
  const legendSeries = legendEntries.map((entry) => ({
    name: entry.label,
    color: entry.color,
    data: []
  }));

  return (
    <div
      ref={mergedRef}
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
        {yTicks.map((fraction) => {
          const y = PADDING.top + plotHeight - fraction * plotHeight;

          return (
            <g key={`tick-${fraction}`}>
              <line
                className={cx(classes.grid)}
                x1={PADDING.left}
                x2={CHART_WIDTH - PADDING.right}
                y1={y}
                y2={y}
              />
              <text
                className={cx(classes.axisText)}
                x={PADDING.left - 8}
                y={y + 3}
                textAnchor="end"
              >
                {`${Math.round(fraction * 100)}%`}
              </text>
            </g>
          );
        })}
        <line
          className={cx(classes.axis)}
          x1={PADDING.left}
          x2={PADDING.left}
          y1={PADDING.top}
          y2={PADDING.top + plotHeight}
        />
        <line
          className={cx(classes.axis)}
          x1={PADDING.left}
          x2={CHART_WIDTH - PADDING.right}
          y1={PADDING.top + plotHeight}
          y2={PADDING.top + plotHeight}
        />
        {columnLayouts.map((columnLayout) => {
          const centerX = columnLayout.x + columnLayout.width / 2;

          return (
            <g
              key={`column-${columnLayout.column.label}`}
              data-mekko-column={columnLayout.column.label}
              data-mekko-total={columnLayout.total}
              data-mekko-x={columnLayout.x}
              data-mekko-width={columnLayout.width}
            >
              {columnLayout.segments.map((segmentLayout) => {
                const text = `${columnLayout.column.label} · ${
                  segmentLayout.segment.label
                }: ${valueFormatter(segmentLayout.value)}`;

                return (
                  <rect
                    key={`segment-${segmentLayout.segment.label}`}
                    className={cx(classes.segment)}
                    data-mekko-segment={`${columnLayout.column.label}/${segmentLayout.segment.label}`}
                    data-mekko-value={segmentLayout.value}
                    data-mekko-share={segmentLayout.share}
                    data-mekko-height={segmentLayout.height}
                    x={columnLayout.x}
                    y={segmentLayout.y}
                    width={columnLayout.width}
                    height={segmentLayout.height}
                    fill={segmentLayout.color}
                    role={interactive ? 'button' : 'img'}
                    tabIndex={0}
                    aria-label={text}
                    onMouseEnter={() =>
                      setActiveItem({
                        x: centerX,
                        y: segmentLayout.y + segmentLayout.height / 2,
                        text
                      })
                    }
                    onFocus={() =>
                      setActiveItem({
                        x: centerX,
                        y: segmentLayout.y + segmentLayout.height / 2,
                        text
                      })
                    }
                    onBlur={() => setActiveItem(null)}
                    onClick={() => onSegmentClick?.(columnLayout.column, segmentLayout.segment)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSegmentClick?.(columnLayout.column, segmentLayout.segment);
                      }
                    }}
                  />
                );
              })}
              <text
                className={cx(classes.columnLabel)}
                data-mekko-label={columnLayout.column.label}
                x={centerX}
                y={PADDING.top + plotHeight + 18}
                textAnchor="middle"
              >
                {columnLayout.column.label}
              </text>
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
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Column', 'Segment', 'Value']}
          rows={columnsWithValues.flatMap((column) =>
            column.segments.map((segment) => [
              column.column.label,
              segment.label,
              valueFormatter(segment.value)
            ])
          )}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_MekkoChart.displayName = 'MekkoChart';

export { _MekkoChart as MekkoChart };
