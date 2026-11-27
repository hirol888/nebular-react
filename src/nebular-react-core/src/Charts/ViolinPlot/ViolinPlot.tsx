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
import { CHART_COLORS } from '../LineChart';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export interface ViolinPlotDatum {
  label: string;
  values: number[];
  color?: string;
}

export type ViolinPlotDataTableMode = 'hidden' | 'visible' | false;

export interface ViolinPlotProps extends DefaultProps<ViolinPlotStylesNames> {
  data: ViolinPlotDatum[];
  height?: number;
  bandwidth?: number;
  showMedian?: boolean;
  showGrid?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: ViolinPlotDataTableMode;
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

    violin: {
      cursor: 'pointer',
      outline: 'none',
      fillOpacity: 0.75,
      strokeWidth: 2,
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    median: {
      stroke: 'var(--violin-median-color, var(--text-basic-color, #222b45))',
      strokeWidth: 2
    },

    quartile: {
      stroke: 'var(--violin-quartile-color, var(--text-hint-color, #8f9bb3))',
      strokeWidth: 1,
      strokeDasharray: '3 2'
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

export type ViolinPlotStylesNames = Selectors<typeof useStyles>;

const CHART_WIDTH = 480;
const GRID_STEPS = 4;
const SAMPLE_COUNT = 64;
const PADDING = { top: 16, right: 16, bottom: 32, left: 44 };
const HALF_WIDTH = 42;

const defaultProps: Partial<ViolinPlotProps> = {
  height: 300,
  bandwidth: 0.35,
  showMedian: true,
  showGrid: true,
  ariaLabel: 'Violin plot',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'violin-plot',
  animated: false
};

function quantile(sortedValues: number[], ratio: number) {
  const position = (sortedValues.length - 1) * ratio;
  const base = Math.floor(position);
  const rest = position - base;
  const lower = sortedValues[base];
  const upper = sortedValues[base + 1];

  return upper === undefined ? lower : lower + rest * (upper - lower);
}

function gaussianKernel(value: number, center: number, bandwidth: number) {
  const normalized = (value - center) / bandwidth;

  return Math.exp(-0.5 * normalized * normalized);
}

function getDensity(values: number[], value: number, bandwidth: number) {
  const sum = values.reduce((total, center) => total + gaussianKernel(value, center, bandwidth), 0);

  return sum / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
}

interface ViolinSeries {
  datum: ViolinPlotDatum;
  index: number;
  color: string;
  values: number[];
  min: number;
  max: number;
  median: number;
  q1: number;
  q3: number;
}

const _ViolinPlot = forwardRef<HTMLDivElement, ViolinPlotProps>((props, ref) => {
  const {
    data,
    height,
    bandwidth,
    showMedian,
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
    name: 'violin-plot',
    classNames,
    styles,
    unstyled
  });
  const [activeViolin, setActiveViolin] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const series = data
    .map<ViolinSeries | null>((datum, index) => {
      const values = datum.values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);

      if (values.length === 0) {
        return null;
      }

      return {
        datum,
        index,
        color: datum.color ?? CHART_COLORS[index % CHART_COLORS.length],
        values,
        min: values[0],
        max: values[values.length - 1],
        median: quantile(values, 0.5),
        q1: quantile(values, 0.25),
        q3: quantile(values, 0.75)
      };
    })
    .filter((item): item is ViolinSeries => item !== null);

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

  if (series.length === 0) {
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

  const allValues = series.flatMap((item) => item.values);
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const domainMin = rawMin === rawMax ? rawMin - 1 : rawMin;
  const domainMax = rawMin === rawMax ? rawMax + 1 : rawMax;
  const range = domainMax - domainMin;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const getY = (value: number) =>
    PADDING.top + plotHeight - ((value - domainMin) / range) * plotHeight;
  const groupWidth = plotWidth / series.length;
  const halfWidth = Math.min(HALF_WIDTH, groupWidth * 0.4);
  const safeBandwidth = bandwidth > 0 ? bandwidth : 0.35;

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
        onMouseLeave={() => setActiveViolin(null)}
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
                  data-violin-grid="true"
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
          const centerX = PADDING.left + groupWidth * (seriesIndex + 0.5);
          const seriesSpan = item.max - item.min;
          const kernelBandwidth = Math.max(
            safeBandwidth * (seriesSpan > 0 ? seriesSpan : range),
            Number.EPSILON
          );
          const samples = Array.from({ length: SAMPLE_COUNT + 1 }, (_sample, sampleIndex) => {
            const value = domainMin + (range * sampleIndex) / SAMPLE_COUNT;

            return {
              value,
              density: getDensity(item.values, value, kernelBandwidth)
            };
          });
          const maxDensity = samples.reduce((max, sample) => Math.max(max, sample.density), 0);
          const widths = samples.map((sample) =>
            maxDensity > 0 ? halfWidth * (sample.density / maxDensity) : 0
          );
          const leftSide = samples.map(
            (sample, sampleIndex) => `${centerX - widths[sampleIndex]} ${getY(sample.value)}`
          );
          const rightSide = samples.map(
            (sample, sampleIndex) => `${centerX + widths[sampleIndex]} ${getY(sample.value)}`
          );
          const path = [
            `M ${leftSide[0]}`,
            ...leftSide.slice(1).map((point) => `L ${point}`),
            ...rightSide.reverse().map((point) => `L ${point}`),
            'Z'
          ].join(' ');
          const medianY = getY(item.median);
          const q1Y = getY(item.q1);
          const q3Y = getY(item.q3);
          const text = `${item.datum.label}: median ${valueFormatter(
            item.median
          )}, Q1 ${valueFormatter(item.q1)}, Q3 ${valueFormatter(item.q3)}, min ${valueFormatter(
            item.min
          )}, max ${valueFormatter(item.max)}`;
          const lineStart = centerX - halfWidth * 0.7;
          const lineEnd = centerX + halfWidth * 0.7;

          return (
            <g
              key={`${item.datum.label}-${item.index}`}
              data-violin-label={item.datum.label}
              data-violin-median-value={item.median}
              data-violin-q1-value={item.q1}
              data-violin-q3-value={item.q3}
            >
              <path
                className={cx(classes.violin)}
                data-violin-shape="true"
                d={path}
                fill={item.color}
                stroke={item.color}
                role="img"
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveViolin({ x: centerX, y: q3Y, text })}
                onFocus={() => setActiveViolin({ x: centerX, y: q3Y, text })}
                onBlur={() => setActiveViolin(null)}
              />
              <line
                className={cx(classes.quartile)}
                data-violin-quartile="q1"
                x1={lineStart}
                x2={lineEnd}
                y1={q1Y}
                y2={q1Y}
                aria-hidden="true"
              />
              <line
                className={cx(classes.quartile)}
                data-violin-quartile="q3"
                x1={lineStart}
                x2={lineEnd}
                y1={q3Y}
                y2={q3Y}
                aria-hidden="true"
              />
              {showMedian && (
                <line
                  className={cx(classes.median)}
                  data-violin-median="true"
                  x1={lineStart}
                  x2={lineEnd}
                  y1={medianY}
                  y2={medianY}
                  aria-hidden="true"
                />
              )}
              <text className={cx(classes.axisText)} x={centerX} y={height - 8} textAnchor="middle">
                {item.datum.label}
              </text>
            </g>
          );
        })}
        {activeViolin && (
          <g transform={`translate(${activeViolin.x}, ${activeViolin.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeViolin.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeViolin.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeViolin.text}
            </text>
          </g>
        )}
      </svg>
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Label', 'Min', 'Q1', 'Median', 'Q3', 'Max']}
          rows={series.map((item) => [
            item.datum.label,
            valueFormatter(item.min),
            valueFormatter(item.q1),
            valueFormatter(item.median),
            valueFormatter(item.q3),
            valueFormatter(item.max)
          ])}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_ViolinPlot.displayName = 'ViolinPlot';

export { _ViolinPlot as ViolinPlot };
