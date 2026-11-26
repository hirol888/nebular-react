import React, { forwardRef, useRef, useState } from 'react';
import { DefaultProps, createStyles, useComponentDefaultProps } from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Button } from '../../Button';
import { ChartDataTable } from '../ChartDataTable';
import { exportChartPng, exportChartSvg, resolveChartFileName } from '../chart-export';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import { CartesianChartStylesNames, CHART_COLORS, ChartLegend, useChartStyles } from '../LineChart';

export interface ScatterPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface ScatterSeries {
  name: string;
  data: ScatterPoint[];
  color?: string;
}

export type ScatterChartDataTableMode = 'hidden' | 'visible' | false;

export type ScatterChartExportFormat = 'svg' | 'png';

export interface ScatterChartProps extends DefaultProps<CartesianChartStylesNames> {
  series: ScatterSeries[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  pointRadius?: number;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: ScatterChartDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
  /** Renders the "Export SVG" and "Export PNG" controls. */
  exportable?: boolean;
  /** Base file name used by the export controls (without extension). */
  exportFileName?: string;
  /** Adds a light entry animation that respects `prefers-reduced-motion`. */
  animated?: boolean;
}

const useToolbarStyles = createStyles((_theme) => ({
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
  }
}));

const defaultProps: Partial<ScatterChartProps> = {
  width: 480,
  height: 240,
  showGrid: true,
  showLegend: true,
  pointRadius: 4,
  ariaLabel: 'Scatter chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'scatter-chart',
  animated: false
};

const axisSteps = 4;

function getPadding(hasXLabel: boolean, hasYLabel: boolean) {
  return {
    top: 16,
    right: 16,
    bottom: hasXLabel ? 46 : 32,
    left: hasYLabel ? 56 : 44
  };
}

function getPaddingAmount(min: number, max: number) {
  const range = max - min;

  if (range === 0) {
    return Math.max(Math.abs(max) * 0.25, 1);
  }

  return range * 0.1;
}

const _ScatterChart = forwardRef<HTMLDivElement, ScatterChartProps>((props, ref) => {
  const {
    series,
    width,
    height,
    xLabel,
    yLabel,
    showLegend,
    showGrid,
    pointRadius,
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
  const { classes, cx } = useChartStyles(classNames, styles, unstyled);
  const { classes: toolbarClasses } = useToolbarStyles(null, { name: 'scatter-chart-toolbar' });
  const [activePoint, setActivePoint] = useState<{
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
  const allPoints = series.reduce<ScatterPoint[]>((acc, item) => acc.concat(item.data), []);

  const handleExport = async (format: ScatterChartExportFormat) => {
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

  if (allPoints.length === 0) {
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

  const xValues = allPoints.map((point) => point.x);
  const yValues = allPoints.map((point) => point.y);
  const xPadding = getPaddingAmount(Math.min(...xValues), Math.max(...xValues));
  const yPadding = getPaddingAmount(Math.min(...yValues), Math.max(...yValues));
  const xMin = Math.min(...xValues) - xPadding;
  const xMax = Math.max(...xValues) + xPadding;
  const yMin = Math.min(...yValues) - yPadding;
  const yMax = Math.max(...yValues) + yPadding;
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const padding = getPadding(Boolean(xLabel), Boolean(yLabel));
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const getX = (value: number) => padding.left + ((value - xMin) / xRange) * plotWidth;
  const getY = (value: number) => padding.top + plotHeight - ((value - yMin) / yRange) * plotHeight;
  const xTicks = Array.from(
    { length: axisSteps + 1 },
    (_, index) => xMin + (xRange * index) / axisSteps
  );
  const yTicks = Array.from(
    { length: axisSteps + 1 },
    (_, index) => yMin + (yRange * index) / axisSteps
  );
  const legendSeries = series.map((item, index) => ({
    name: item.name,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
    data: item.data.map((point) => point.y)
  }));
  const dataTable = showDataTable
    ? {
        columns: ['Series', 'X', 'Y'],
        rows: series.flatMap((item) =>
          item.data.map((point) => [item.name, valueFormatter(point.x), valueFormatter(point.y)])
        )
      }
    : undefined;

  return (
    <div
      ref={mergedRef}
      className={cx(classes.root, isAnimated && classes.animated, className)}
      data-animated={isAnimated ? 'true' : undefined}
    >
      {exportable && (
        <div className={cx(toolbarClasses.toolbar)}>
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
            <span role="status" aria-live="polite" className={cx(toolbarClasses.status)}>
              {exportStatus}
            </span>
          )}
        </div>
      )}
      <svg
        className={cx(classes.svg)}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActivePoint(null)}
      >
        <title>{ariaLabel}</title>
        {yTicks.map((value, index) => {
          const y = getY(value);

          return (
            <g key={`y-tick-${index}`}>
              {showGrid && (
                <line
                  className={cx(classes.grid)}
                  x1={padding.left}
                  x2={width - padding.right}
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
        {xTicks.map((value, index) => {
          const x = getX(value);

          return (
            <g key={`x-tick-${index}`}>
              {showGrid && (
                <line
                  className={cx(classes.grid)}
                  x1={x}
                  x2={x}
                  y1={padding.top}
                  y2={height - padding.bottom}
                />
              )}
              <text
                className={cx(classes.axisText)}
                x={x}
                y={height - padding.bottom + 14}
                textAnchor="middle"
              >
                {valueFormatter(value)}
              </text>
            </g>
          );
        })}
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
          x2={width - padding.right}
          y1={height - padding.bottom}
          y2={height - padding.bottom}
        />
        {xLabel && (
          <text
            className={cx(classes.axisText)}
            x={padding.left + plotWidth / 2}
            y={height - 8}
            textAnchor="middle"
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            className={cx(classes.axisText)}
            transform={`translate(12 ${height / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {yLabel}
          </text>
        )}
        {series.map((item, seriesIndex) => {
          const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];

          return item.data.map((point, pointIndex) => {
            const x = getX(point.x);
            const y = getY(point.y);
            const name = `${item.name}${point.label ? `, ${point.label}` : ''}`;
            const label = `${item.name}${point.label ? ` · ${point.label}` : ''}`;
            const value = `(${valueFormatter(point.x)}, ${valueFormatter(point.y)})`;

            return (
              <circle
                key={`${item.name}-${pointIndex}`}
                className={cx(classes.point)}
                cx={x}
                cy={y}
                r={pointRadius}
                fill={point.color ?? color}
                role="img"
                tabIndex={0}
                aria-label={`${name}: ${value}`}
                onMouseEnter={() => setActivePoint({ x, y, label, value })}
                onFocus={() => setActivePoint({ x, y, label, value })}
                onBlur={() => setActivePoint(null)}
              />
            );
          });
        })}
        {activePoint && (
          <g transform={`translate(${activePoint.x}, ${activePoint.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activePoint.label.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activePoint.label.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activePoint.label}: {activePoint.value}
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

_ScatterChart.displayName = 'ScatterChart';

export { _ScatterChart as ScatterChart };
