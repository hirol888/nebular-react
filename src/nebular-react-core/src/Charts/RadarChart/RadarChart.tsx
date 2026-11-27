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

export interface RadarChartSeries {
  name: string;
  values: number[];
  color?: string;
}

export type RadarChartDataTableMode = 'hidden' | 'visible' | false;

export type RadarChartExportFormat = 'svg' | 'png';

export interface RadarChartProps extends DefaultProps<RadarChartStylesNames> {
  axes: string[];
  series: RadarChartSeries[];
  size?: number;
  levels?: number;
  maxValue?: number;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: RadarChartDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
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
      alignItems: 'center',
      gap: '0.5rem',
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
      alignSelf: 'stretch',
      gap: '0.5rem'
    },

    status: {
      color: 'var(--chart-status-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    tableContainer: {
      alignSelf: 'stretch',
      minWidth: 0
    },

    svg: {
      display: 'block',
      flex: '0 0 auto',
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
      justifyContent: 'center',
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

export type RadarChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<RadarChartProps> = {
  size: 260,
  levels: 4,
  showLegend: true,
  ariaLabel: 'Radar chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'radar-chart',
  animated: false
};

const labelPadding = 42;
const vertexRadius = 3.5;

function getAngle(index: number, total: number) {
  return -90 + (360 * index) / total;
}

function getRadians(index: number, total: number) {
  return (getAngle(index, total) * Math.PI) / 180;
}

function getTextAnchor(index: number, total: number) {
  const cos = Math.cos(getRadians(index, total));

  if (Math.abs(cos) < 0.15) {
    return 'middle';
  }

  return cos > 0 ? 'start' : 'end';
}

function getLabelOffset(index: number, total: number) {
  const sin = Math.sin(getRadians(index, total));

  if (sin > 0.5) {
    return 8;
  }

  return sin < -0.5 ? -4 : 3;
}

const _RadarChart = forwardRef<HTMLDivElement, RadarChartProps>((props, ref) => {
  const {
    axes,
    series,
    size,
    levels,
    maxValue,
    showLegend,
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
    name: 'radar-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeVertex, setActiveVertex] = useState<{
    x: number;
    y: number;
    label: string;
    value: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;

  const handleExport = async (format: RadarChartExportFormat) => {
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

  if (axes.length === 0 || series.length === 0) {
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

  const center = size / 2;
  const radius = Math.max(1, center - labelPadding);
  const allValues = series.reduce<number[]>((acc, item) => acc.concat(item.values), []);
  const scaleMax = maxValue > 0 ? maxValue : Math.max(1, ...allValues);
  const levelCount = Math.max(1, levels);
  const getRatio = (value: number) => Math.min(Math.max(value, 0), scaleMax) / scaleMax;
  const levelPolygons = Array.from({ length: levelCount }, (_, levelIndex) => {
    const levelRadius = (radius * (levelIndex + 1)) / levelCount;

    return axes
      .map((_axis, axisIndex) => {
        const radians = getRadians(axisIndex, axes.length);

        return `${center + Math.cos(radians) * levelRadius},${
          center + Math.sin(radians) * levelRadius
        }`;
      })
      .join(' ');
  });
  const legendSeries = series.map((item, index) => ({
    name: item.name,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
    data: item.values
  }));
  const dataTable = showDataTable
    ? {
        columns: ['Axis', ...series.map((item) => item.name)],
        rows: axes.map((axis, axisIndex) => [
          axis,
          ...series.map((item) => {
            const value = item.values[axisIndex];

            return value === undefined ? '' : valueFormatter(value);
          })
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
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveVertex(null)}
      >
        <title>{ariaLabel}</title>
        {levelPolygons.map((points, index) => (
          <polygon
            key={`level-${index}`}
            className={cx(classes.grid)}
            points={points}
            fill="none"
          />
        ))}
        {axes.map((axis, axisIndex) => {
          const radians = getRadians(axisIndex, axes.length);

          return (
            <line
              key={`axis-${axis}`}
              className={cx(classes.axis)}
              x1={center}
              y1={center}
              x2={center + Math.cos(radians) * radius}
              y2={center + Math.sin(radians) * radius}
            />
          );
        })}
        {axes.map((axis, axisIndex) => {
          const radians = getRadians(axisIndex, axes.length);
          const labelRadius = radius + 14;

          return (
            <text
              key={`axis-label-${axis}`}
              className={cx(classes.axisText)}
              x={center + Math.cos(radians) * labelRadius}
              y={center + Math.sin(radians) * labelRadius + getLabelOffset(axisIndex, axes.length)}
              textAnchor={getTextAnchor(axisIndex, axes.length)}
            >
              {axis}
            </text>
          );
        })}
        {series.map((item, seriesIndex) => {
          const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];
          const points = item.values
            .slice(0, axes.length)
            .map((value, axisIndex) => {
              const radians = getRadians(axisIndex, axes.length);
              const valueRadius = radius * getRatio(value);

              return `${center + Math.cos(radians) * valueRadius},${
                center + Math.sin(radians) * valueRadius
              }`;
            })
            .join(' ');

          return (
            <polygon
              key={item.name}
              points={points}
              fill={color}
              fillOpacity={0.15}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          );
        })}
        {series.map((item, seriesIndex) => {
          const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];

          return item.values.slice(0, axes.length).map((value, axisIndex) => {
            const radians = getRadians(axisIndex, axes.length);
            const valueRadius = radius * getRatio(value);
            const x = center + Math.cos(radians) * valueRadius;
            const y = center + Math.sin(radians) * valueRadius;
            const axis = axes[axisIndex];
            const label = `${item.name} · ${axis}`;
            const formatted = valueFormatter(value);

            return (
              <circle
                key={`${item.name}-${axis}`}
                className={cx(classes.point)}
                cx={x}
                cy={y}
                r={vertexRadius}
                fill={color}
                role="img"
                tabIndex={0}
                aria-label={`${item.name}, ${axis}: ${formatted}`}
                onMouseEnter={() => setActiveVertex({ x, y, label, value: formatted })}
                onFocus={() => setActiveVertex({ x, y, label, value: formatted })}
                onBlur={() => setActiveVertex(null)}
              />
            );
          });
        })}
        {activeVertex && (
          <g transform={`translate(${activeVertex.x}, ${activeVertex.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeVertex.label.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeVertex.label.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeVertex.label}: {activeVertex.value}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {dataTable && (
        <div className={cx(classes.tableContainer)}>
          <ChartDataTable
            caption={dataTableCaption}
            columns={dataTable.columns}
            rows={dataTable.rows}
            visuallyHidden={showDataTable === 'hidden'}
          />
        </div>
      )}
    </div>
  );
});

_RadarChart.displayName = 'RadarChart';

export { _RadarChart as RadarChart };
