import React, { forwardRef, useState } from 'react';
import { DefaultProps, useComponentDefaultProps } from '@nebular-react/styles';
import { CartesianChartStylesNames, CHART_COLORS, ChartLegend, useChartStyles } from '../LineChart';

export interface BubbleDatum {
  x: number;
  y: number;
  /** Bubble magnitude. The radius is proportional to its square root, so the area encodes it. */
  size: number;
  label?: string;
  color?: string;
}

export interface BubbleChartProps extends DefaultProps<CartesianChartStylesNames> {
  data: BubbleDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onBubbleClick?(datum: BubbleDatum, index: number): void;
}

const defaultProps: Partial<BubbleChartProps> = {
  width: 480,
  height: 320,
  showLegend: true,
  ariaLabel: 'Bubble chart',
  valueFormatter: (value: number) => String(value)
};

const axisSteps = 4;
const minRadius = 3;
/** Biggest bubble radius as a fraction of the smallest plot side. */
const maxRadiusRatio = 0.12;

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

/**
 * Radius proportional to `sqrt(size)`, so the painted area is proportional to the
 * data value. Deterministic for a given `maxSize` and plot size.
 */
export function getBubbleRadius(size: number, maxSize: number, maxRadius: number) {
  if (maxSize <= 0) {
    return minRadius;
  }

  return Math.max(minRadius, maxRadius * Math.sqrt(Math.max(0, size) / maxSize));
}

const _BubbleChart = forwardRef<HTMLDivElement, BubbleChartProps>((props, ref) => {
  const {
    data,
    width,
    height,
    xLabel,
    yLabel,
    showLegend,
    valueFormatter,
    ariaLabel,
    onBubbleClick,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useChartStyles(classNames, styles, unstyled);
  const [activeBubble, setActiveBubble] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  if (data.length === 0) {
    return (
      <div ref={ref} className={cx(classes.root, className)}>
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const xValues = data.map((item) => item.x);
  const yValues = data.map((item) => item.y);
  const xPadding = getPaddingAmount(Math.min(...xValues), Math.max(...xValues));
  const yPadding = getPaddingAmount(Math.min(...yValues), Math.max(...yValues));
  const xMin = Math.min(...xValues) - xPadding;
  const xMax = Math.max(...xValues) + xPadding;
  const yMin = Math.min(...yValues) - yPadding;
  const yMax = Math.max(...yValues) + yPadding;
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const padding = getPadding(Boolean(xLabel), Boolean(yLabel));
  const plotWidth = Math.max(1, width - padding.left - padding.right);
  const plotHeight = Math.max(1, height - padding.top - padding.bottom);
  const getX = (value: number) => padding.left + ((value - xMin) / xRange) * plotWidth;
  const getY = (value: number) => padding.top + plotHeight - ((value - yMin) / yRange) * plotHeight;
  const xTicks = Array.from(
    { length: axisSteps + 1 },
    (_item, index) => xMin + (xRange * index) / axisSteps
  );
  const yTicks = Array.from(
    { length: axisSteps + 1 },
    (_item, index) => yMin + (yRange * index) / axisSteps
  );
  const maxSize = Math.max(0, ...data.map((item) => item.size));
  const maxRadius = Math.max(8, Math.min(plotWidth, plotHeight) * maxRadiusRatio);
  const interactive = typeof onBubbleClick === 'function';
  const legendSeries = data.map((item, index) => ({
    name: item.label ?? `Point ${index + 1}`,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
    data: [item.size]
  }));

  return (
    <div ref={ref} className={cx(classes.root, className)}>
      <svg
        className={cx(classes.svg)}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveBubble(null)}
      >
        <title>{ariaLabel}</title>
        {yTicks.map((value, index) => {
          const y = getY(value);

          return (
            <g key={`y-tick-${index}`}>
              <line
                className={cx(classes.grid)}
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
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
              <line
                className={cx(classes.grid)}
                x1={x}
                x2={x}
                y1={padding.top}
                y2={height - padding.bottom}
              />
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
        {data.map((item, index) => {
          const x = getX(item.x);
          const y = getY(item.y);
          const radius = getBubbleRadius(item.size, maxSize, maxRadius);
          const name = item.label ?? `Point ${index + 1}`;
          const text = `${name}: (${valueFormatter(item.x)}, ${valueFormatter(
            item.y
          )}), size ${valueFormatter(item.size)}`;

          return (
            <circle
              key={`${name}-${index}`}
              className={cx(classes.point)}
              data-bubble-index={index}
              cx={x}
              cy={y}
              r={radius}
              fill={item.color ?? CHART_COLORS[index % CHART_COLORS.length]}
              role={interactive ? 'button' : 'img'}
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() => setActiveBubble({ x, y: y - radius - 8, text })}
              onFocus={() => setActiveBubble({ x, y: y - radius - 8, text })}
              onBlur={() => setActiveBubble(null)}
              onClick={() => onBubbleClick?.(item, index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onBubbleClick?.(item, index);
                }
              }}
            />
          );
        })}
        {activeBubble && (
          <g transform={`translate(${activeBubble.x}, ${activeBubble.y})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeBubble.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeBubble.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeBubble.text}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
    </div>
  );
});

_BubbleChart.displayName = 'BubbleChart';

export { _BubbleChart as BubbleChart };
