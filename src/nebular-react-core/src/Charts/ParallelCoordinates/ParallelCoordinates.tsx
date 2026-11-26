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

export interface ParallelCoordinatesDimension {
  key: string;
  label: string;
  min?: number;
  max?: number;
}

export interface ParallelCoordinatesSeries {
  name: string;
  values: Record<string, number>;
  color?: string;
}

export type ParallelCoordinatesDataTableMode = 'hidden' | 'visible' | false;

export interface ParallelCoordinatesProps extends DefaultProps<ParallelCoordinatesStylesNames> {
  dimensions: ParallelCoordinatesDimension[];
  series: ParallelCoordinatesSeries[];
  height?: number;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onSeriesClick?(series: ParallelCoordinatesSeries): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: ParallelCoordinatesDataTableMode;
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
const PADDING = { top: 24, right: 24, bottom: 44, left: 24 };
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

    axis: {
      stroke: 'var(--chart-axis-color, var(--border-basic-color-4, #c5cee0))',
      strokeWidth: 1
    },

    axisText: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.65rem'
    },

    dimensionLabel: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem',
      fontWeight: 600
    },

    series: {
      fill: 'none',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      transition: 'opacity 120ms ease'
    },

    point: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

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

export type ParallelCoordinatesStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ParallelCoordinatesProps> = {
  height: 300,
  showLegend: true,
  ariaLabel: 'Parallel coordinates chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'parallel-coordinates',
  animated: false
};

interface DimensionLayout {
  dimension: ParallelCoordinatesDimension;
  min: number;
  max: number;
  x: number;
}

interface ActivePoint {
  x: number;
  y: number;
  text: string;
}

const _ParallelCoordinates = forwardRef<HTMLDivElement, ParallelCoordinatesProps>((props, ref) => {
  const {
    dimensions,
    series,
    height,
    showLegend,
    valueFormatter,
    ariaLabel,
    onSeriesClick,
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
    name: 'parallel-coordinates',
    classNames,
    styles,
    unstyled
  });
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const [activePoint, setActivePoint] = useState<ActivePoint | null>(null);
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

  if (dimensions.length === 0 || series.length === 0) {
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

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const lastDimension = Math.max(0, dimensions.length - 1);
  const getAxisX = (index: number) => {
    if (lastDimension === 0) {
      return PADDING.left + plotWidth / 2;
    }

    return PADDING.left + (index / lastDimension) * plotWidth;
  };
  const layouts: DimensionLayout[] = dimensions.map((dimension, index) => {
    const values = series
      .map((item) => item.values[dimension.key])
      .filter((value) => Number.isFinite(value));
    const min = dimension.min ?? (values.length > 0 ? Math.min(...values) : 0);
    const max = dimension.max ?? (values.length > 0 ? Math.max(...values) : 1);

    return {
      dimension,
      min,
      max,
      x: getAxisX(index)
    };
  });
  const getNormalized = (layout: DimensionLayout, value: number) => {
    const range = layout.max - layout.min;

    if (range === 0) {
      return 0.5;
    }

    return (value - layout.min) / range;
  };
  const getY = (normalized: number) => PADDING.top + plotHeight - normalized * plotHeight;
  const interactive = typeof onSeriesClick === 'function';
  const legendSeries = series.map((item, index) => ({
    name: item.name,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
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
        onMouseLeave={() => {
          setActiveSeries(null);
          setActivePoint(null);
        }}
      >
        <title>{ariaLabel}</title>
        {layouts.map((layout) => (
          <g key={`axis-${layout.dimension.key}`}>
            <line
              className={cx(classes.axis)}
              data-parallel-axis={layout.dimension.key}
              x1={layout.x}
              x2={layout.x}
              y1={PADDING.top}
              y2={height - PADDING.bottom}
            />
            <text
              className={cx(classes.axisText)}
              data-parallel-max={layout.dimension.key}
              x={layout.x}
              y={PADDING.top - 8}
              textAnchor="middle"
            >
              {valueFormatter(layout.max)}
            </text>
            <text
              className={cx(classes.axisText)}
              data-parallel-min={layout.dimension.key}
              x={layout.x}
              y={height - PADDING.bottom + 14}
              textAnchor="middle"
            >
              {valueFormatter(layout.min)}
            </text>
            <text
              className={cx(classes.dimensionLabel)}
              data-parallel-label={layout.dimension.key}
              x={layout.x}
              y={height - 8}
              textAnchor="middle"
            >
              {layout.dimension.label}
            </text>
          </g>
        ))}
        {series.map((item, seriesIndex) => {
          const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];
          const isActive = activeSeries === item.name;
          const isDimmed = activeSeries !== null && !isActive;
          const points = layouts.flatMap((layout) => {
            const value = item.values[layout.dimension.key];

            if (!Number.isFinite(value)) {
              return [];
            }

            return [
              {
                layout,
                value,
                x: layout.x,
                y: getY(getNormalized(layout, value))
              }
            ];
          });

          return (
            <g key={`series-${item.name}`}>
              <polyline
                className={cx(classes.series)}
                data-parallel-series={item.name}
                data-highlighted={isActive ? 'true' : 'false'}
                points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                stroke={color}
                opacity={isDimmed ? 0.2 : 1}
                aria-hidden="true"
              />
              {points.map((point) => {
                const text = `${item.name} · ${point.layout.dimension.label}: ${valueFormatter(
                  point.value
                )}`;
                const normalized = getNormalized(point.layout, point.value);

                return (
                  <circle
                    key={`point-${item.name}-${point.layout.dimension.key}`}
                    className={cx(classes.point)}
                    data-parallel-point={item.name}
                    data-parallel-key={point.layout.dimension.key}
                    data-parallel-value={point.value}
                    data-parallel-normalized={normalized}
                    cx={point.x}
                    cy={point.y}
                    r={POINT_RADIUS}
                    fill={color}
                    opacity={isDimmed ? 0.2 : 1}
                    role={interactive ? 'button' : 'img'}
                    tabIndex={0}
                    aria-label={text}
                    onMouseEnter={() => {
                      setActiveSeries(item.name);
                      setActivePoint({ x: point.x, y: point.y, text });
                    }}
                    onFocus={() => {
                      setActiveSeries(item.name);
                      setActivePoint({ x: point.x, y: point.y, text });
                    }}
                    onBlur={() => {
                      setActiveSeries(null);
                      setActivePoint(null);
                    }}
                    onClick={() => onSeriesClick?.(item)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSeriesClick?.(item);
                      }
                    }}
                  />
                );
              })}
            </g>
          );
        })}
        {activePoint && (
          <g transform={`translate(${activePoint.x}, ${activePoint.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activePoint.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activePoint.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activePoint.text}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Series', ...dimensions.map((dimension) => dimension.label)]}
          rows={series.map((item) => [
            item.name,
            ...dimensions.map((dimension) => {
              const value = item.values[dimension.key];

              return Number.isFinite(value) ? valueFormatter(value) : '—';
            })
          ])}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_ParallelCoordinates.displayName = 'ParallelCoordinates';

export { _ParallelCoordinates as ParallelCoordinates };
