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
import { ChartDataTable } from '../ChartDataTable';
import { exportChartPng, exportChartSvg, resolveChartFileName } from '../chart-export';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import { CHART_COLORS, ChartLegend } from '../LineChart';

export interface StackedBarChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export type StackedBarChartDataTableMode = 'hidden' | 'visible' | false;

export type StackedBarChartExportFormat = 'svg' | 'png';

export interface StackedBarChartProps extends DefaultProps<StackedBarChartStylesNames> {
  labels: string[];
  series: StackedBarChartSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: StackedBarChartDataTableMode;
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
const GRID_STEPS = 4;

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

    segment: {
      cursor: 'pointer',
      outline: 'none',

      '&:focus-visible': {
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

export type StackedBarChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<StackedBarChartProps> = {
  height: 240,
  showLegend: true,
  showGrid: true,
  ariaLabel: 'Stacked bar chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'stacked-bar-chart',
  animated: false
};

interface StackedTooltip {
  x: number;
  y: number;
  text: string;
}

const _StackedBarChart = forwardRef<HTMLDivElement, StackedBarChartProps>((props, ref) => {
  const {
    labels,
    series,
    height,
    showLegend,
    showGrid,
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
    name: 'stacked-bar-chart',
    classNames,
    styles,
    unstyled
  });
  const [tooltip, setTooltip] = useState<StackedTooltip | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;

  const handleExport = async (format: StackedBarChartExportFormat) => {
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

      await exportChartPng(svg, exportFileName);
      setExportStatus(`Exported ${resolveChartFileName(exportFileName, 'png')}`);
    } catch {
      setExportStatus('Unable to export chart');
    }
  };

  if (series.length === 0 || labels.length === 0) {
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

  const totals = labels.map((_label, index) =>
    series.reduce((sum, item) => sum + (item.data[index] ?? 0), 0)
  );
  const positiveTotals = labels.map((_label, index) =>
    series.reduce((sum, item) => sum + Math.max(0, item.data[index] ?? 0), 0)
  );
  const negativeTotals = labels.map((_label, index) =>
    series.reduce((sum, item) => sum + Math.min(0, item.data[index] ?? 0), 0)
  );
  const minValue = Math.min(0, ...negativeTotals);
  const maxValue = Math.max(0, ...positiveTotals);
  const range = maxValue - minValue || 1;
  const padding = { top: 16, right: 16, bottom: 32, left: 44 };
  const plotWidth = CHART_WIDTH - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const getY = (value: number) =>
    padding.top + plotHeight - ((value - minValue) / range) * plotHeight;
  const groupWidth = plotWidth / Math.max(1, labels.length);
  const barX = (index: number) => padding.left + groupWidth * index + groupWidth * 0.15;
  const barWidth = Math.max(4, groupWidth * 0.7);
  const dataTable = showDataTable
    ? {
        columns: ['Label', ...series.map((item) => item.name)],
        rows: labels.map((label, labelIndex) => [
          label,
          ...series.map((item) => valueFormatter(item.data[labelIndex] ?? 0))
        ])
      }
    : undefined;

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
        onMouseLeave={() => setTooltip(null)}
      >
        <title>{ariaLabel}</title>
        {Array.from({ length: GRID_STEPS + 1 }, (_, index) => {
          const value = minValue + (range * index) / GRID_STEPS;
          const y = getY(value);

          return (
            <g key={`grid-${index}`}>
              {showGrid && (
                <line
                  className={cx(classes.grid)}
                  x1={padding.left}
                  x2={CHART_WIDTH - padding.right}
                  y1={y}
                  y2={y}
                />
              )}
              <text
                className={cx(classes.axisText)}
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
              >
                {valueFormatter(value)}
              </text>
            </g>
          );
        })}
        {labels.map((label, index) => (
          <text
            key={`${label}-${index}`}
            className={cx(classes.axisText)}
            x={barX(index) + barWidth / 2}
            y={height - 8}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
        <line
          className={cx(classes.axis)}
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={height - padding.bottom}
        />
        <line
          className={cx(classes.axis)}
          x1={padding.left}
          x2={CHART_WIDTH - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
        />
        {labels.map((label, index) => {
          const total = totals[index];
          let positiveOffset = 0;
          let negativeOffset = 0;

          return (
            <g key={`stack-${label}-${index}`}>
              {series.map((item, seriesIndex) => {
                const value = item.data[index] ?? 0;
                const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];
                const start = value >= 0 ? positiveOffset : negativeOffset;
                const end = start + value;

                if (value >= 0) {
                  positiveOffset = end;
                } else {
                  negativeOffset = end;
                }

                const top = getY(Math.max(start, end));
                const bottom = getY(Math.min(start, end));
                const text = `${item.name} · ${label}: ${valueFormatter(value)} (total ${valueFormatter(total)})`;

                return (
                  <rect
                    key={`${item.name}-${index}`}
                    className={cx(classes.segment)}
                    x={barX(index)}
                    y={top}
                    width={barWidth}
                    height={Math.max(0, bottom - top)}
                    rx={2}
                    fill={color}
                    role="img"
                    tabIndex={0}
                    aria-label={`${item.name}, ${label}: ${valueFormatter(
                      value
                    )} (total ${valueFormatter(total)})`}
                    onMouseEnter={() => setTooltip({ x: barX(index) + barWidth / 2, y: top, text })}
                    onFocus={() => setTooltip({ x: barX(index) + barWidth / 2, y: top, text })}
                    onBlur={() => setTooltip(null)}
                  />
                );
              })}
            </g>
          );
        })}
        {tooltip && (
          <g transform={`translate(${tooltip.x}, ${tooltip.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, tooltip.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, tooltip.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {tooltip.text}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={series} classes={classes} cx={cx} />}
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

_StackedBarChart.displayName = 'StackedBarChart';

export { _StackedBarChart as StackedBarChart };
