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

export interface BoxPlotChartData {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
}

export type BoxPlotChartDataTableMode = 'hidden' | 'visible' | false;

export interface BoxPlotChartProps extends DefaultProps<BoxPlotChartStylesNames> {
  data: BoxPlotChartData[];
  height?: number;
  showGrid?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: BoxPlotChartDataTableMode;
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

    whisker: {
      stroke: 'var(--boxplot-whisker-color, var(--text-hint-color, #8f9bb3))',
      strokeWidth: 1
    },

    cap: {
      stroke: 'var(--boxplot-whisker-color, var(--text-hint-color, #8f9bb3))',
      strokeWidth: 1
    },

    box: {
      fill: 'var(--boxplot-box-color, var(--color-primary-500, #3366ff))',
      fillOpacity: 0.85
    },

    median: {
      stroke: 'var(--boxplot-median-color, #ffffff)',
      strokeWidth: 2
    },

    outlier: {
      fill: 'var(--boxplot-outlier-color, var(--color-primary-500, #3366ff))',
      stroke: 'var(--background-basic-color-1, #ffffff)',
      strokeWidth: 1
    },

    hitArea: {
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

export type BoxPlotChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<BoxPlotChartProps> = {
  height: 280,
  showGrid: true,
  ariaLabel: 'Box plot chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'box-plot-chart',
  animated: false
};

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

const _BoxPlotChart = forwardRef<HTMLDivElement, BoxPlotChartProps>((props, ref) => {
  const {
    data,
    height,
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
    name: 'box-plot-chart',
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

  if (data.length === 0) {
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

  const allValues = data
    .flatMap((item) => [
      item.min,
      item.q1,
      item.median,
      item.q3,
      item.max,
      ...(item.outliers ?? [])
    ])
    .filter((value) => Number.isFinite(value));

  if (allValues.length === 0) {
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

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const domainMin = rawMin === rawMax ? rawMin - 1 : rawMin;
  const domainMax = rawMin === rawMax ? rawMax + 1 : rawMax;
  const range = domainMax - domainMin;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const getY = (value: number) =>
    PADDING.top + plotHeight - ((value - domainMin) / range) * plotHeight;
  const groupWidth = plotWidth / data.length;
  const boxWidth = Math.min(48, groupWidth * 0.5);
  const capHalf = boxWidth / 2;
  const dataTable = showDataTable
    ? {
        columns: ['Label', 'Min', 'Q1', 'Median', 'Q3', 'Max'],
        rows: data.map((item) => [
          item.label,
          valueFormatter(item.min),
          valueFormatter(item.q1),
          valueFormatter(item.median),
          valueFormatter(item.q3),
          valueFormatter(item.max)
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
                  data-boxplot-grid="true"
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
        {data.map((item, index) => {
          const groupLeft = PADDING.left + groupWidth * index;
          const centerX = groupLeft + groupWidth / 2;
          const boxLeft = centerX - boxWidth / 2;
          const boxTop = getY(Math.max(item.q1, item.q3));
          const boxBottom = getY(Math.min(item.q1, item.q3));
          const whiskerTop = getY(item.max);
          const whiskerBottom = getY(item.min);
          const medianY = getY(item.median);
          const outliers = item.outliers ?? [];
          const outlierText =
            outliers.length > 0
              ? `, outliers ${outliers.map((value) => valueFormatter(value)).join(', ')}`
              : '';
          const text = `${item.label}: min ${valueFormatter(item.min)}, Q1 ${valueFormatter(
            item.q1
          )}, median ${valueFormatter(item.median)}, Q3 ${valueFormatter(
            item.q3
          )}, max ${valueFormatter(item.max)}${outlierText}`;

          return (
            <g
              key={`${item.label}-${index}`}
              data-boxplot-label={item.label}
              data-boxplot-min={item.min}
              data-boxplot-q1={item.q1}
              data-boxplot-median={item.median}
              data-boxplot-q3={item.q3}
              data-boxplot-max={item.max}
            >
              <line
                className={cx(classes.whisker)}
                data-boxplot-whisker="true"
                x1={centerX}
                x2={centerX}
                y1={whiskerTop}
                y2={whiskerBottom}
                aria-hidden="true"
              />
              <line
                className={cx(classes.cap)}
                data-boxplot-cap="max"
                x1={centerX - capHalf}
                x2={centerX + capHalf}
                y1={whiskerTop}
                y2={whiskerTop}
                aria-hidden="true"
              />
              <line
                className={cx(classes.cap)}
                data-boxplot-cap="min"
                x1={centerX - capHalf}
                x2={centerX + capHalf}
                y1={whiskerBottom}
                y2={whiskerBottom}
                aria-hidden="true"
              />
              <rect
                className={cx(classes.box)}
                data-boxplot-box="true"
                x={boxLeft}
                y={boxTop}
                width={boxWidth}
                height={Math.max(0, boxBottom - boxTop)}
                rx={2}
                aria-hidden="true"
              />
              <line
                className={cx(classes.median)}
                data-boxplot-median="true"
                x1={boxLeft}
                x2={boxLeft + boxWidth}
                y1={medianY}
                y2={medianY}
                aria-hidden="true"
              />
              {outliers.map((value, outlierIndex) => (
                <circle
                  key={`outlier-${value}-${outlierIndex}`}
                  className={cx(classes.outlier)}
                  data-boxplot-outlier="true"
                  cx={centerX}
                  cy={getY(value)}
                  r={3}
                  aria-hidden="true"
                />
              ))}
              <rect
                className={cx(classes.hitArea)}
                data-boxplot-hit="true"
                x={groupLeft}
                y={PADDING.top}
                width={groupWidth}
                height={plotHeight}
                fill="transparent"
                role="img"
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveItem({ x: centerX, y: boxTop, text })}
                onFocus={() => setActiveItem({ x: centerX, y: boxTop, text })}
                onBlur={() => setActiveItem(null)}
              />
              <text className={cx(classes.axisText)} x={centerX} y={height - 8} textAnchor="middle">
                {item.label}
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

_BoxPlotChart.displayName = 'BoxPlotChart';

export { _BoxPlotChart as BoxPlotChart };
