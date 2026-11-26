import React, { forwardRef, useState } from 'react';
import { useComponentDefaultProps } from '@nebular-react/styles';
import { ChartDataTable } from './ChartDataTable';
import { usePrefersReducedMotion } from './ChartContainer/chart-motion';
import {
  CartesianChartProps,
  CartesianChartStylesNames,
  CHART_COLORS,
  ChartLegend,
  ChartSeries,
  buildCartesianDataTable,
  useChartStyles
} from './LineChart';

export interface BarChartProps extends CartesianChartProps {
  onBarClick?(series: ChartSeries, label: string, value: number): void;
}

const barDefaults: Partial<BarChartProps> = {
  width: 480,
  height: 240,
  showGrid: true,
  showLegend: true,
  interactiveLegend: false,
  showXAxis: true,
  showYAxis: true,
  emptyState: 'No data',
  ariaLabel: 'Bar chart',
  showDataTable: false,
  animated: false
};

const _BarChart = forwardRef<HTMLDivElement, BarChartProps>((props, ref) => {
  const {
    labels,
    series,
    width,
    height,
    ariaLabel,
    showGrid,
    showLegend,
    interactiveLegend,
    showXAxis,
    showYAxis,
    formatValue = (value: number) => String(value),
    emptyState,
    onBarClick,
    showDataTable,
    dataTableCaption,
    animated,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(barDefaults, props);
  const { classes, cx } = useChartStyles(classNames, styles, unstyled);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeBar, setActiveBar] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const visibleSeries = interactiveLegend
    ? series.filter((item) => !hiddenSeries.includes(item.name))
    : series;
  const padding = { top: 16, right: 16, bottom: showXAxis ? 32 : 12, left: showYAxis ? 44 : 12 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const allValues = visibleSeries.flatMap((item) => item.data);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(1, ...allValues);
  const range = maxValue - minValue || 1;
  const getY = (value: number) =>
    padding.top + plotHeight - ((value - minValue) / range) * plotHeight;
  const groupWidth = plotWidth / Math.max(1, labels.length);
  const barWidth = Math.max(4, (groupWidth - 12) / Math.max(1, visibleSeries.length));
  const gridSteps = 4;
  const isAnimated = animated && !prefersReducedMotion;
  const dataTable = showDataTable
    ? buildCartesianDataTable(labels, visibleSeries, formatValue)
    : undefined;

  const toggleSeries = (name: string) => {
    setHiddenSeries((current) => {
      if (current.includes(name)) {
        return current.filter((item) => item !== name);
      }

      if (series.filter((item) => !current.includes(item.name)).length <= 1) {
        return current;
      }

      return [...current, name];
    });
  };

  if (series.length === 0 || labels.length === 0) {
    return (
      <div
        ref={ref}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <div className={cx(classes.empty)}>{emptyState}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cx(classes.root, isAnimated && classes.animated, className)}
      data-animated={isAnimated ? 'true' : undefined}
    >
      <svg
        className={cx(classes.svg)}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveBar(null)}
      >
        <title>{ariaLabel}</title>
        {showGrid &&
          Array.from({ length: gridSteps + 1 }, (_, index) => {
            const value = minValue + (range * index) / gridSteps;
            const y = getY(value);

            return (
              <g key={index}>
                <line
                  className={cx(classes.grid)}
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                />
                {showYAxis && (
                  <text
                    className={cx(classes.axisText)}
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                  >
                    {formatValue(value)}
                  </text>
                )}
              </g>
            );
          })}
        {labels.map((label, labelIndex) => (
          <text
            key={`${label}-${labelIndex}`}
            className={cx(classes.axisText)}
            x={padding.left + groupWidth * labelIndex + groupWidth / 2}
            y={height - 8}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
        {showYAxis && (
          <line
            className={cx(classes.axis)}
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={height - padding.bottom}
          />
        )}
        {showXAxis && (
          <line
            className={cx(classes.axis)}
            x1={padding.left}
            x2={width - padding.right}
            y1={height - padding.bottom}
            y2={height - padding.bottom}
          />
        )}
        {visibleSeries.map((item, seriesIndex) => {
          const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];

          return item.data.map((value, labelIndex) => {
            const x = padding.left + groupWidth * labelIndex + 6 + seriesIndex * barWidth;
            const y = getY(value);
            const barHeight = height - padding.bottom - y;

            return (
              <rect
                key={`${item.name}-${labelIndex}`}
                className={cx(classes.point)}
                x={x}
                y={y}
                width={Math.max(2, barWidth - 3)}
                height={Math.max(0, barHeight)}
                rx={2}
                fill={color}
                role={typeof onBarClick === 'function' ? 'button' : 'img'}
                tabIndex={typeof onBarClick === 'function' ? 0 : -1}
                aria-label={`${item.name}, ${labels[labelIndex] ?? labelIndex}: ${formatValue(value)}`}
                onMouseEnter={() =>
                  setActiveBar({
                    x: x + barWidth / 2,
                    y,
                    label: `${item.name} · ${labels[labelIndex] ?? labelIndex}`,
                    value
                  })
                }
                onFocus={() =>
                  setActiveBar({
                    x: x + barWidth / 2,
                    y,
                    label: `${item.name} · ${labels[labelIndex] ?? labelIndex}`,
                    value
                  })
                }
                onBlur={() => setActiveBar(null)}
                onClick={() => onBarClick?.(item, labels[labelIndex] ?? String(labelIndex), value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onBarClick?.(item, labels[labelIndex] ?? String(labelIndex), value);
                  }
                }}
              />
            );
          });
        })}
        {activeBar && (
          <g transform={`translate(${activeBar.x}, ${activeBar.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeBar.label.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeBar.label.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeBar.label}: {formatValue(activeBar.value)}
            </text>
          </g>
        )}
      </svg>
      {showLegend && (
        <ChartLegend
          series={series}
          classes={classes}
          cx={cx}
          interactive={interactiveLegend}
          hiddenSeries={hiddenSeries}
          onToggle={(item) => toggleSeries(item.name)}
        />
      )}
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

_BarChart.displayName = 'BarChart';

export { _BarChart as BarChart };
export type { CartesianChartStylesNames };
