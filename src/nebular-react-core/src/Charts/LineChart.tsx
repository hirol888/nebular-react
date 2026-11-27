import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { ChartDataTable } from './ChartDataTable';
import { usePrefersReducedMotion } from './ChartContainer/chart-motion';

export interface ChartSeries {
  name: string;
  color?: string;
  data: number[];
}

export const CHART_COLORS = [
  '#3366ff',
  '#00d68f',
  '#ffaa00',
  '#ff3d71',
  '#8f9bb3',
  '#6c5ce7',
  '#00b8d9',
  '#ff6b6b'
];

export type ChartDataTableMode = 'hidden' | 'visible' | false;

export interface CartesianChartProps extends DefaultProps<CartesianChartStylesNames> {
  labels: string[];
  series: ChartSeries[];
  width?: number;
  height?: number;
  ariaLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  /** Allows toggling series visibility by clicking legend items. */
  interactiveLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  formatValue?(value: number): string;
  emptyState?: React.ReactNode;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: ChartDataTableMode;
  /** Accessible caption used by the generated data table. */
  dataTableCaption?: string;
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

    legendButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: 0,
      border: 0,
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      cursor: 'pointer',
      borderRadius: '0.2rem',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    },

    legendItemHidden: {
      opacity: 0.45,
      textDecoration: 'line-through'
    },

    zoomOverlay: {
      cursor: 'crosshair',
      touchAction: 'none'
    },

    zoomSelection: {
      fill: 'var(--chart-zoom-selection-color, rgba(51, 102, 255, 0.16))',
      stroke: 'var(--chart-zoom-selection-border-color, var(--color-primary-500, #3366ff))',
      strokeWidth: 1,
      pointerEvents: 'none'
    },

    zoomReset: {
      alignSelf: 'flex-start',
      padding: '0.15rem 0.4rem',
      border:
        '1px solid var(--chart-zoom-reset-border-color, var(--border-basic-color-3, #e4e9f2))',
      borderRadius: '0.25rem',
      background: 'var(--chart-zoom-reset-background-color, transparent)',
      color: 'var(--chart-zoom-reset-color, var(--color-primary-500, #3366ff))',
      font: 'inherit',
      fontSize: '0.75rem',
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      }
    },

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type CartesianChartStylesNames = Selectors<typeof useStyles>;

export function useChartStyles(
  classNames: CartesianChartProps['classNames'],
  styles: CartesianChartProps['styles'],
  unstyled: boolean
) {
  return useStyles(null, { name: 'chart', classNames, styles, unstyled });
}

export type ChartStyleApi = ReturnType<typeof useChartStyles>;

/**
 * Builds the accessible data table columns/rows shared by the cartesian charts.
 */
export function buildCartesianDataTable(
  labels: string[],
  series: ChartSeries[],
  formatValue?: (value: number) => string
): { columns: string[]; rows: React.ReactNode[][] } {
  const format = formatValue ?? ((value: number) => String(value));

  return {
    columns: ['Label', ...series.map((item) => item.name)],
    rows: labels.map((label, labelIndex) => [
      label,
      ...series.map((item) => {
        const value = item.data[labelIndex];

        return value === undefined ? '' : format(value);
      })
    ])
  };
}

export function ChartLegend({
  series,
  classes,
  cx,
  interactive,
  hiddenSeries = [],
  onToggle
}: {
  series: ChartSeries[];
  classes: Record<string, string>;
  cx: ChartStyleApi['cx'];
  interactive?: boolean;
  hiddenSeries?: string[];
  onToggle?(series: ChartSeries, index: number): void;
}) {
  return (
    <ul className={cx(classes.legend)} aria-label="Series">
      {series.map((item, index) => {
        const swatch = (
          <span
            className={cx(classes.legendSwatch)}
            style={{ backgroundColor: item.color ?? CHART_COLORS[index % CHART_COLORS.length] }}
            aria-hidden="true"
          />
        );
        const hidden = hiddenSeries.includes(item.name);

        return (
          <li
            key={item.name}
            className={cx(classes.legendItem, { [classes.legendItemHidden]: hidden })}
          >
            {interactive && onToggle ? (
              <button
                type="button"
                className={cx(classes.legendButton)}
                aria-pressed={!hidden}
                onClick={() => onToggle(item, index)}
              >
                {swatch}
                {item.name}
              </button>
            ) : (
              <>
                {swatch}
                {item.name}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export interface LineChartZoomRange {
  /** First visible label index (inclusive). */
  startIndex: number;
  /** Last visible label index (inclusive). */
  endIndex: number;
}

export interface LineChartProps extends CartesianChartProps {
  area?: boolean;
  showPoints?: boolean;
  pointRadius?: number;
  onPointClick?(series: ChartSeries, pointIndex: number, value: number): void;
  /** Enables drag-to-zoom on the x axis and a reset control. */
  zoomable?: boolean;
  onZoomChange?(range: LineChartZoomRange | null): void;
}

const lineDefaults: Partial<LineChartProps> = {
  width: 480,
  height: 240,
  showGrid: true,
  showLegend: true,
  interactiveLegend: false,
  showXAxis: true,
  showYAxis: true,
  area: false,
  showPoints: true,
  pointRadius: 3,
  zoomable: false,
  emptyState: 'No data',
  ariaLabel: 'Line chart',
  showDataTable: false,
  animated: false
};

const LineChartComponent = forwardRef<HTMLDivElement, LineChartProps>((props, ref) => {
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
    area,
    showPoints,
    pointRadius,
    onPointClick,
    zoomable,
    onZoomChange,
    showDataTable,
    dataTableCaption,
    animated,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(lineDefaults, props);
  const { classes, cx } = useChartStyles(classNames, styles, unstyled);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activePoint, setActivePoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    color: string;
  } | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const [zoomRange, setZoomRange] = useState<LineChartZoomRange | null>(null);
  const [dragRange, setDragRange] = useState<LineChartZoomRange | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const padding = { top: 16, right: 16, bottom: showXAxis ? 32 : 12, left: showYAxis ? 44 : 12 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const effectiveZoom =
    zoomRange && zoomRange.startIndex >= 0 && zoomRange.endIndex < labels.length ? zoomRange : null;
  const visibleSeries = interactiveLegend
    ? series.filter((item) => !hiddenSeries.includes(item.name))
    : series;
  const startIndex = effectiveZoom?.startIndex ?? 0;
  const endIndex = effectiveZoom?.endIndex ?? labels.length - 1;
  const viewLabels = labels.slice(startIndex, endIndex + 1);
  const viewSeries = visibleSeries.map((item) => ({
    ...item,
    data: item.data.slice(startIndex, endIndex + 1)
  }));
  const allValues = viewSeries.flatMap((item) => item.data);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(1, ...allValues);
  const range = maxValue - minValue || 1;
  const getX = (index: number) =>
    padding.left +
    (viewLabels.length <= 1 ? plotWidth / 2 : (index / (viewLabels.length - 1)) * plotWidth);
  const getY = (value: number) =>
    padding.top + plotHeight - ((value - minValue) / range) * plotHeight;
  const gridSteps = 4;
  const isAnimated = animated && !prefersReducedMotion;
  const dataTable = showDataTable
    ? buildCartesianDataTable(viewLabels, viewSeries, formatValue)
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

  const resetZoom = () => {
    setZoomRange(null);
    setDragRange(null);
    onZoomChange?.(null);
  };

  const indexFromClientX = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();

    if (!Number.isFinite(clientX) || !rect || rect.width === 0 || plotWidth <= 0) {
      return 0;
    }

    const x = ((clientX - rect.left) / rect.width) * width;
    const index = Math.round(((x - padding.left) / plotWidth) * (labels.length - 1));

    return Math.min(labels.length - 1, Math.max(0, index));
  };

  const handleZoomPointerDown = (event: React.PointerEvent<SVGRectElement>) => {
    if (!zoomable || effectiveZoom) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const index = indexFromClientX(event.clientX);
    setDragRange({ startIndex: index, endIndex: index });
  };

  const handleZoomPointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    if (!dragRange) {
      return;
    }

    setDragRange({ ...dragRange, endIndex: indexFromClientX(event.clientX) });
  };

  const handleZoomPointerUp = () => {
    if (!dragRange) {
      return;
    }

    const first = Math.min(dragRange.startIndex, dragRange.endIndex);
    const last = Math.max(dragRange.startIndex, dragRange.endIndex);

    if (last - first >= 1) {
      const nextRange = { startIndex: first, endIndex: last };
      setZoomRange(nextRange);
      onZoomChange?.(nextRange);
    }

    setDragRange(null);
  };

  const dragStart = dragRange ? Math.min(dragRange.startIndex, dragRange.endIndex) : 0;
  const dragEnd = dragRange ? Math.max(dragRange.startIndex, dragRange.endIndex) : 0;

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
        ref={svgRef}
        className={cx(classes.svg)}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActivePoint(null)}
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
        {showXAxis &&
          viewLabels.map((label, index) => (
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
        {zoomable && (
          <>
            <rect
              className={cx(classes.zoomOverlay)}
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={plotHeight}
              fill="transparent"
              aria-hidden="true"
              onPointerDown={handleZoomPointerDown}
              onPointerMove={handleZoomPointerMove}
              onPointerUp={handleZoomPointerUp}
              onPointerCancel={handleZoomPointerUp}
              onDoubleClick={resetZoom}
            />
            {dragRange && (
              <rect
                className={cx(classes.zoomSelection)}
                x={getX(dragStart)}
                y={padding.top}
                width={Math.max(1, getX(dragEnd) - getX(dragStart))}
                height={plotHeight}
                aria-hidden="true"
              />
            )}
          </>
        )}
        {viewSeries.map((item, seriesIndex) => {
          const color = item.color ?? CHART_COLORS[seriesIndex % CHART_COLORS.length];
          const path = item.data
            .map((value, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(value)}`)
            .join(' ');
          const areaPath = `${path} L ${getX(item.data.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

          return (
            <g key={item.name}>
              {area && <path d={areaPath} fill={color} opacity={0.15} pointerEvents="none" />}
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {showPoints &&
                item.data.map((value, pointIndex) => {
                  const x = getX(pointIndex);
                  const y = getY(value);

                  return (
                    <circle
                      key={`${item.name}-${pointIndex}`}
                      className={cx(classes.point)}
                      cx={x}
                      cy={y}
                      r={pointRadius}
                      fill={color}
                      role={typeof onPointClick === 'function' ? 'button' : 'img'}
                      tabIndex={typeof onPointClick === 'function' ? 0 : -1}
                      aria-label={`${item.name}, ${viewLabels[pointIndex] ?? pointIndex}: ${formatValue(value)}`}
                      onMouseEnter={() =>
                        setActivePoint({
                          x,
                          y,
                          label: `${item.name} · ${viewLabels[pointIndex] ?? pointIndex}`,
                          value,
                          color
                        })
                      }
                      onFocus={() =>
                        setActivePoint({
                          x,
                          y,
                          label: `${item.name} · ${viewLabels[pointIndex] ?? pointIndex}`,
                          value,
                          color
                        })
                      }
                      onBlur={() => setActivePoint(null)}
                      onClick={() => onPointClick?.(item, pointIndex, value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onPointClick?.(item, pointIndex, value);
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
              x={-Math.max(60, activePoint.label.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activePoint.label.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activePoint.label}: {formatValue(activePoint.value)}
            </text>
          </g>
        )}
      </svg>
      {zoomable && effectiveZoom && (
        <button type="button" className={cx(classes.zoomReset)} onClick={resetZoom}>
          Reset zoom
        </button>
      )}
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

LineChartComponent.displayName = 'LineChart';

const AreaChartComponent = forwardRef<HTMLDivElement, LineChartProps>((props, ref) => (
  <LineChartComponent ref={ref} area {...props} />
));

AreaChartComponent.displayName = 'AreaChart';

export { LineChartComponent as LineChart, AreaChartComponent as AreaChart };

export const chartUseStyles = useStyles;
