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
import { CHART_COLORS, ChartLegend, ChartSeries } from '../LineChart';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export interface StepLineSeries {
  name: string;
  data: number[];
  color?: string;
}

export type StepLineChartDataTableMode = 'hidden' | 'visible' | false;

export interface StepLineChartProps extends DefaultProps<StepLineChartStylesNames> {
  labels: string[];
  series: StepLineSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: StepLineChartDataTableMode;
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
const PADDING = { top: 16, right: 16, bottom: 32, left: 44 };
const POINT_RADIUS = 3;

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

    point: {
      cursor: 'pointer',
      outline: 'none',

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

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type StepLineChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<StepLineChartProps> = {
  height: 280,
  showLegend: true,
  showGrid: true,
  ariaLabel: 'Step line chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'step-line',
  animated: false
};

interface StepPoint {
  x: number;
  y: number;
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

function stepPath(points: StepPoint[]) {
  if (points.length === 0) {
    return '';
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    path += ` L ${points[index].x} ${points[index - 1].y} L ${points[index].x} ${points[index].y}`;
  }

  return path;
}

const _StepLineChart = forwardRef<HTMLDivElement, StepLineChartProps>((props, ref) => {
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
    name: 'step-line-chart',
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

  const allValues = series.flatMap((item) => item.data.filter((value) => Number.isFinite(value)));
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(1, ...allValues);
  const range = maxValue - minValue || 1;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const getX = (index: number) =>
    PADDING.left + (labels.length <= 1 ? plotWidth / 2 : (index / (labels.length - 1)) * plotWidth);
  const getY = (value: number) =>
    PADDING.top + plotHeight - ((value - minValue) / range) * plotHeight;
  const legendSeries: ChartSeries[] = series.map((item, index) => ({
    name: item.name,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
    data: item.data
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
        {Array.from({ length: GRID_STEPS + 1 }, (_item, index) => {
          const value = minValue + (range * index) / GRID_STEPS;
          const y = getY(value);

          return (
            <g key={`grid-${index}`}>
              {showGrid && (
                <line
                  className={cx(classes.grid)}
                  data-step-grid="true"
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                />
              )}
              <text
                className={cx(classes.axisText)}
                x={PADDING.left - 8}
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
            x={getX(index)}
            y={height - 8}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
        <line
          className={cx(classes.axis)}
          x1={PADDING.left}
          x2={PADDING.left}
          y1={PADDING.top}
          y2={height - PADDING.bottom}
        />
        <line
          className={cx(classes.axis)}
          x1={PADDING.left}
          x2={CHART_WIDTH - PADDING.right}
          y1={height - PADDING.bottom}
          y2={height - PADDING.bottom}
        />
        {series.map((item, seriesIndex) => {
          const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];
          const points = item.data.map((value, index) => ({
            x: getX(index),
            y: getY(value)
          }));

          return (
            <g key={item.name}>
              <path
                data-step-line={item.name}
                d={stepPath(points)}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              />
              {points.map((point, index) => {
                const label = labels[index] ?? index;
                const value = item.data[index];
                const text = `${item.name} · ${label}: ${valueFormatter(value)}`;

                return (
                  <circle
                    key={`${item.name}-${index}`}
                    className={cx(classes.point)}
                    cx={point.x}
                    cy={point.y}
                    r={POINT_RADIUS}
                    fill={color}
                    role="img"
                    tabIndex={0}
                    aria-label={`${item.name}, ${label}: ${valueFormatter(value)}`}
                    onMouseEnter={() => setActiveItem({ x: point.x, y: point.y, text })}
                    onFocus={() => setActiveItem({ x: point.x, y: point.y, text })}
                    onBlur={() => setActiveItem(null)}
                  />
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
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Label', ...series.map((item) => item.name)]}
          rows={labels.map((label, index) => [
            label,
            ...series.map((item) => valueFormatter(item.data[index]))
          ])}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_StepLineChart.displayName = 'StepLineChart';

export { _StepLineChart as StepLineChart };
