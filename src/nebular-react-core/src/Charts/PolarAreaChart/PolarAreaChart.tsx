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

export interface PolarAreaChartDatum {
  label: string;
  value: number;
  color?: string;
}

export interface PolarAreaChartSegment {
  label: string;
  value: number;
  color: string;
}

export type PolarAreaChartDataTableMode = 'hidden' | 'visible' | false;

export interface PolarAreaChartProps extends DefaultProps<PolarAreaChartStylesNames> {
  data: PolarAreaChartDatum[];
  size?: number;
  startAngle?: number;
  colors?: string[];
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onSegmentClick?(segment: PolarAreaChartSegment, index: number): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: PolarAreaChartDataTableMode;
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
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
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
      flex: '0 0 auto',
      overflow: 'visible'
    },

    grid: {
      fill: 'none',
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

    sector: {
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
      flexDirection: 'column',
      gap: '0.4rem',
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

export type PolarAreaChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<PolarAreaChartProps> = {
  size: 300,
  startAngle: -90,
  showLegend: true,
  ariaLabel: 'Polar area chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'polar-area',
  animated: false
};

const GRID_LEVELS = 4;
const LABEL_PADDING = 26;

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function sectorPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  if (radius <= 0) {
    return `M ${cx} ${cy}`;
  }

  const sweep = endAngle - startAngle;

  if (sweep >= 359.999) {
    return [
      `M ${cx} ${cy - radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius}`,
      `A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`,
      'Z'
    ].join(' ');
  }

  const outerStart = polarToCartesian(cx, cy, radius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, radius, endAngle);
  const largeArc = sweep > 180 ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    'Z'
  ].join(' ');
}

function getTextAnchor(angle: number) {
  const cos = Math.cos((angle * Math.PI) / 180);

  if (Math.abs(cos) < 0.2) {
    return 'middle';
  }

  return cos > 0 ? 'start' : 'end';
}

const _PolarAreaChart = forwardRef<HTMLDivElement, PolarAreaChartProps>((props, ref) => {
  const {
    data,
    size,
    startAngle,
    colors,
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
    name: 'polar-area-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeSegment, setActiveSegment] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0);
  const palette = colors?.length ? colors : CHART_COLORS;

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

  if (data.length === 0 || !(maxValue > 0)) {
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
  const maxRadius = Math.max(1, center - LABEL_PADDING);
  const sweep = 360 / data.length;
  const interactive = typeof onSegmentClick === 'function';
  const segments = data.map((item, index) => {
    const value = Math.max(0, item.value);
    const segmentStart = startAngle + index * sweep;
    const segmentEnd = segmentStart + sweep;
    const midpoint = segmentStart + sweep / 2;
    const radius = (maxRadius * value) / maxValue;
    const labelAnchor = polarToCartesian(center, center, maxRadius + 14, midpoint);
    const tooltipAnchor = polarToCartesian(center, center, Math.max(radius * 0.6, 8), midpoint);

    return {
      datum: item,
      index,
      value,
      radius,
      startAngle: segmentStart,
      endAngle: segmentEnd,
      midpoint,
      color: item.color ?? palette[index % palette.length],
      labelAnchor,
      tooltipAnchor
    };
  });
  const legendSeries = segments.map((segment) => ({
    name: segment.datum.label,
    color: segment.color,
    data: [segment.value]
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
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveSegment(null)}
      >
        <title>{ariaLabel}</title>
        {Array.from({ length: GRID_LEVELS }, (_item, levelIndex) => {
          const gridRadius = (maxRadius * (levelIndex + 1)) / GRID_LEVELS;

          return (
            <circle
              key={`grid-${levelIndex}`}
              className={cx(classes.grid)}
              data-polar-grid="true"
              cx={center}
              cy={center}
              r={gridRadius}
            />
          );
        })}
        {segments.map((segment) => {
          const axisEnd = polarToCartesian(center, center, maxRadius, segment.startAngle);

          return (
            <line
              key={`axis-${segment.index}`}
              className={cx(classes.axis)}
              x1={center}
              y1={center}
              x2={axisEnd.x}
              y2={axisEnd.y}
              aria-hidden="true"
            />
          );
        })}
        {segments.map((segment) => {
          const text = `${segment.datum.label}: ${valueFormatter(segment.datum.value)}`;

          return (
            <path
              key={`segment-${segment.index}`}
              className={cx(classes.sector)}
              data-polar-segment={`${segment.datum.label}-${segment.index}`}
              data-polar-start={segment.startAngle}
              data-polar-end={segment.endAngle}
              data-polar-radius={segment.radius}
              d={sectorPath(center, center, segment.radius, segment.startAngle, segment.endAngle)}
              fill={segment.color}
              role={interactive ? 'button' : 'img'}
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() =>
                setActiveSegment({
                  x: segment.tooltipAnchor.x,
                  y: segment.tooltipAnchor.y,
                  text
                })
              }
              onFocus={() =>
                setActiveSegment({
                  x: segment.tooltipAnchor.x,
                  y: segment.tooltipAnchor.y,
                  text
                })
              }
              onBlur={() => setActiveSegment(null)}
              onClick={() =>
                onSegmentClick?.(
                  {
                    label: segment.datum.label,
                    value: segment.datum.value,
                    color: segment.color
                  },
                  segment.index
                )
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSegmentClick?.(
                    {
                      label: segment.datum.label,
                      value: segment.datum.value,
                      color: segment.color
                    },
                    segment.index
                  );
                }
              }}
            />
          );
        })}
        {segments.map((segment) => (
          <text
            key={`label-${segment.index}`}
            className={cx(classes.axisText)}
            data-polar-label={segment.datum.label}
            x={segment.labelAnchor.x}
            y={segment.labelAnchor.y + 3}
            textAnchor={getTextAnchor(segment.midpoint)}
          >
            {segment.datum.label}
          </text>
        ))}
        {activeSegment && (
          <g transform={`translate(${activeSegment.x}, ${activeSegment.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeSegment.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeSegment.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeSegment.text}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {showDataTable && (
        <div style={{ flex: '1 0 100%', minWidth: 0 }}>
          <ChartDataTable
            caption={dataTableCaption}
            columns={['Label', 'Value']}
            rows={data.map((item) => [item.label, valueFormatter(item.value)])}
            visuallyHidden={showDataTable === 'hidden'}
          />
        </div>
      )}
    </div>
  );
});

_PolarAreaChart.displayName = 'PolarAreaChart';

export { _PolarAreaChart as PolarAreaChart };
