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

export interface StreamGraphSeries {
  name: string;
  data: number[];
  color?: string;
}

export type StreamGraphChartDataTableMode = 'hidden' | 'visible' | false;

export interface StreamGraphChartProps extends DefaultProps<StreamGraphChartStylesNames> {
  labels: string[];
  series: StreamGraphSeries[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: StreamGraphChartDataTableMode;
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
const PADDING = { top: 16, right: 16, bottom: 32, left: 48 };

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

    baseline: {
      stroke: 'var(--chart-axis-color, var(--border-basic-color-4, #c5cee0))',
      strokeWidth: 1,
      strokeDasharray: '4 3'
    },

    axisText: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.65rem'
    },

    layer: {
      transition: 'opacity 120ms ease'
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

export type StreamGraphChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<StreamGraphChartProps> = {
  height: 280,
  showLegend: true,
  showGrid: false,
  ariaLabel: 'Stream graph chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'stream-graph',
  animated: false
};

interface StreamPoint {
  x: number;
  y: number;
}

interface StreamLayer {
  name: string;
  color: string;
  data: number[];
  upper: StreamPoint[];
  lower: StreamPoint[];
  points: Array<StreamPoint & { value: number; label: string }>;
}

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

function valueAt(series: StreamGraphSeries, index: number) {
  const value = series.data[index];

  return Number.isFinite(value) ? value : 0;
}

function smoothPath(points: StreamPoint[]) {
  if (points.length === 0) {
    return '';
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const midX = (previous.x + current.x) / 2;

    path += ` C ${midX} ${previous.y} ${midX} ${current.y} ${current.x} ${current.y}`;
  }

  return path;
}

function areaPath(upper: StreamPoint[], lower: StreamPoint[]) {
  const top = smoothPath(upper);

  if (!top) {
    return '';
  }

  const reversed = [...lower].reverse();
  let path = `${top} L ${reversed[0].x} ${reversed[0].y}`;

  for (let index = 1; index < reversed.length; index += 1) {
    const previous = reversed[index - 1];
    const current = reversed[index];
    const midX = (previous.x + current.x) / 2;

    path += ` C ${midX} ${previous.y} ${midX} ${current.y} ${current.x} ${current.y}`;
  }

  return `${path} Z`;
}

const _StreamGraphChart = forwardRef<HTMLDivElement, StreamGraphChartProps>((props, ref) => {
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
    name: 'stream-graph-chart',
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

  const totals = labels.map((_label, index) =>
    series.reduce((sum, item) => sum + valueAt(item, index), 0)
  );
  const halfMax = Math.max(...totals.map((total) => Math.abs(total))) / 2 || 1;
  const domainMin = -halfMax;
  const domainMax = halfMax;
  const range = domainMax - domainMin;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const getX = (index: number) =>
    PADDING.left + (labels.length <= 1 ? plotWidth / 2 : (index / (labels.length - 1)) * plotWidth);
  const getY = (value: number) =>
    PADDING.top + plotHeight - ((value - domainMin) / range) * plotHeight;
  const offsets = labels.map((_label, index) => {
    const total = totals[index];
    let cumulative = 0;

    return series.map((item) => {
      const value = valueAt(item, index);
      const start = cumulative - total / 2;

      cumulative += value;

      return { value, start, end: cumulative - total / 2 };
    });
  });
  const layers: StreamLayer[] = series.map((item, seriesIndex) => ({
    name: item.name,
    color: item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length],
    data: item.data,
    upper: labels.map((_label, index) => ({
      x: getX(index),
      y: getY(offsets[index][seriesIndex].end)
    })),
    lower: labels.map((_label, index) => ({
      x: getX(index),
      y: getY(offsets[index][seriesIndex].start)
    })),
    points: labels.map((label, index) => ({
      x: getX(index),
      y: getY((offsets[index][seriesIndex].start + offsets[index][seriesIndex].end) / 2),
      value: offsets[index][seriesIndex].value,
      label
    }))
  }));
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
          const value = domainMin + (range * index) / GRID_STEPS;
          const y = getY(value);

          return (
            <g key={`grid-${index}`}>
              {showGrid && (
                <line
                  className={cx(classes.grid)}
                  data-stream-grid="true"
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
        <line
          className={cx(classes.baseline)}
          data-stream-baseline="true"
          x1={PADDING.left}
          x2={CHART_WIDTH - PADDING.right}
          y1={getY(0)}
          y2={getY(0)}
        />
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
        {layers.map((layer) => (
          <path
            key={layer.name}
            className={cx(classes.layer)}
            data-stream-layer={layer.name}
            d={areaPath(layer.upper, layer.lower)}
            fill={layer.color}
            fillOpacity={0.85}
            stroke={layer.color}
            strokeWidth={1}
            aria-hidden="true"
          />
        ))}
        {layers.map((layer) =>
          layer.points.map((point, index) => {
            const text = `${layer.name} · ${point.label}: ${valueFormatter(point.value)}`;

            return (
              <circle
                key={`${layer.name}-${point.label}-${index}`}
                className={cx(classes.point)}
                data-stream-point={layer.name}
                cx={point.x}
                cy={point.y}
                r={3}
                fill={layer.color}
                role="img"
                tabIndex={0}
                aria-label={`${layer.name}, ${point.label}: ${valueFormatter(point.value)}`}
                onMouseEnter={() => setActiveItem({ x: point.x, y: point.y, text })}
                onFocus={() => setActiveItem({ x: point.x, y: point.y, text })}
                onBlur={() => setActiveItem(null)}
              />
            );
          })
        )}
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
            ...series.map((item) => valueFormatter(valueAt(item, index)))
          ])}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_StreamGraphChart.displayName = 'StreamGraphChart';

export { _StreamGraphChart as StreamGraphChart };
