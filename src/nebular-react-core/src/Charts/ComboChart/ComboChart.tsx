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

export type ComboChartSeriesType = 'bar' | 'line' | 'area';

export interface ComboChartSeries {
  name: string;
  type: ComboChartSeriesType;
  data: number[];
  color?: string;
}

export type ComboChartDataTableMode = 'hidden' | 'visible' | false;

export type ComboChartExportFormat = 'svg' | 'png';

export interface ComboChartProps extends DefaultProps<ComboChartStylesNames> {
  labels: string[];
  series: ComboChartSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: ComboChartDataTableMode;
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

    mark: {
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

export type ComboChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ComboChartProps> = {
  height: 240,
  showLegend: true,
  showGrid: true,
  ariaLabel: 'Combo chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'combo-chart',
  animated: false
};

interface ComboTooltip {
  x: number;
  y: number;
  text: string;
}

const _ComboChart = forwardRef<HTMLDivElement, ComboChartProps>((props, ref) => {
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
    name: 'combo-chart',
    classNames,
    styles,
    unstyled
  });
  const [tooltip, setTooltip] = useState<ComboTooltip | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const barSeries = series.filter((item) => item.type === 'bar');

  const handleExport = async (format: ComboChartExportFormat) => {
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

  const padding = { top: 16, right: 16, bottom: 32, left: 44 };
  const plotWidth = CHART_WIDTH - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const allValues = series.flatMap((item) => item.data);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const range = maxValue - minValue || 1;
  const getY = (value: number) =>
    padding.top + plotHeight - ((value - minValue) / range) * plotHeight;
  const zeroY = getY(0);
  const groupWidth = plotWidth / Math.max(1, labels.length);
  const barBand = groupWidth * 0.6;
  const barWidth = Math.max(3, barBand / Math.max(1, barSeries.length));
  const getGroupCenter = (index: number) => padding.left + groupWidth * index + groupWidth / 2;
  const legendSeries = series.map((item) => ({
    name: item.name,
    color: item.color,
    data: item.data
  }));
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
            x={getGroupCenter(index)}
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
        {barSeries.map((item, barIndex) => {
          const color = item.color ?? CHART_COLORS[series.indexOf(item) % CHART_COLORS.length];

          return labels.map((label, index) => {
            const value = item.data[index] ?? 0;
            const x = padding.left + groupWidth * index + groupWidth * 0.2 + barIndex * barWidth;
            const y = value >= 0 ? getY(value) : zeroY;
            const barHeight = Math.abs(getY(value) - zeroY);
            const text = `${item.name} · ${label}: ${valueFormatter(value)}`;

            return (
              <rect
                key={`${item.name}-${index}`}
                className={cx(classes.mark)}
                x={x}
                y={y}
                width={Math.max(2, barWidth - 2)}
                height={Math.max(0, barHeight)}
                rx={2}
                fill={color}
                role="img"
                tabIndex={0}
                aria-label={`${item.name}, ${label}: ${valueFormatter(value)}`}
                onMouseEnter={() => setTooltip({ x: x + barWidth / 2, y, text })}
                onFocus={() => setTooltip({ x: x + barWidth / 2, y, text })}
                onBlur={() => setTooltip(null)}
              />
            );
          });
        })}
        {series
          .filter((item) => item.type === 'area')
          .map((item) => {
            const index = series.indexOf(item);
            const color = item.color ?? CHART_COLORS[index % CHART_COLORS.length];
            const points = labels.map((_label, pointIndex) => ({
              x: getGroupCenter(pointIndex),
              y: getY(item.data[pointIndex] ?? 0)
            }));
            const linePath = points
              .map((point, pointIndex) => `${pointIndex === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
              .join(' ');
            const areaPath = `${linePath} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`;

            return (
              <g key={`area-${item.name}`}>
                <path d={areaPath} fill={color} opacity={0.15} />
                <path d={linePath} fill="none" stroke={color} strokeWidth={2} />
              </g>
            );
          })}
        {series
          .filter((item) => item.type === 'line' || item.type === 'area')
          .map((item) => {
            const index = series.indexOf(item);
            const color = item.color ?? CHART_COLORS[index % CHART_COLORS.length];
            const linePath = labels
              .map((_label, pointIndex) => {
                const value = item.data[pointIndex] ?? 0;
                return `${pointIndex === 0 ? 'M' : 'L'} ${getGroupCenter(pointIndex)} ${getY(value)}`;
              })
              .join(' ');

            return (
              <g key={`line-${item.name}`}>
                <path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {labels.map((label, pointIndex) => {
                  const value = item.data[pointIndex] ?? 0;
                  const x = getGroupCenter(pointIndex);
                  const y = getY(value);
                  const text = `${item.name} · ${label}: ${valueFormatter(value)}`;

                  return (
                    <circle
                      key={`${item.name}-${pointIndex}`}
                      className={cx(classes.mark)}
                      cx={x}
                      cy={y}
                      r={3}
                      fill={color}
                      role="img"
                      tabIndex={0}
                      aria-label={`${item.name}, ${label}: ${valueFormatter(value)}`}
                      onMouseEnter={() => setTooltip({ x, y, text })}
                      onFocus={() => setTooltip({ x, y, text })}
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
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
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

_ComboChart.displayName = 'ComboChart';

export { _ComboChart as ComboChart };
