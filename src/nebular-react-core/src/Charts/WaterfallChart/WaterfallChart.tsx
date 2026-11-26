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

export type WaterfallChartBarType = 'increase' | 'decrease' | 'total';

export interface WaterfallChartData {
  label: string;
  value: number;
  type?: WaterfallChartBarType;
}

export type WaterfallChartDataTableMode = 'hidden' | 'visible' | false;

export interface WaterfallChartProps extends DefaultProps<WaterfallChartStylesNames> {
  data: WaterfallChartData[];
  height?: number;
  showGrid?: boolean;
  showConnectors?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: WaterfallChartDataTableMode;
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

    bar: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    connector: {
      stroke: 'var(--waterfall-connector-color, var(--border-basic-color-4, #c5cee0))',
      strokeWidth: 1,
      strokeDasharray: '3 3'
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

export type WaterfallChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<WaterfallChartProps> = {
  height: 280,
  showGrid: true,
  showConnectors: true,
  ariaLabel: 'Waterfall chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'waterfall-chart',
  animated: false
};

interface WaterfallBar {
  item: WaterfallChartData;
  index: number;
  type: WaterfallChartBarType;
  magnitude: number;
  start: number;
  end: number;
  cumulative: number;
}

interface ActiveBar {
  x: number;
  y: number;
  text: string;
}

function resolveBars(data: WaterfallChartData[]): WaterfallBar[] {
  let running = 0;

  return data.map((item, index) => {
    const type = item.type ?? (item.value < 0 ? 'decrease' : 'increase');
    const magnitude = Math.abs(item.value);

    if (type === 'total') {
      return {
        item,
        index,
        type,
        magnitude: running,
        start: 0,
        end: running,
        cumulative: running
      };
    }

    const start = running;
    const end = type === 'decrease' ? start - magnitude : start + magnitude;

    running = end;

    return {
      item,
      index,
      type,
      magnitude,
      start,
      end,
      cumulative: end
    };
  });
}

const _WaterfallChart = forwardRef<HTMLDivElement, WaterfallChartProps>((props, ref) => {
  const {
    data,
    height,
    showGrid,
    showConnectors,
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
    name: 'waterfall-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeBar, setActiveBar] = useState<ActiveBar | null>(null);
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

  const bars = resolveBars(data);
  const allValues = bars.flatMap((bar) => [bar.start, bar.end]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues, 1);
  const range = maxValue - minValue || 1;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const getY = (value: number) =>
    PADDING.top + plotHeight - ((value - minValue) / range) * plotHeight;
  const groupWidth = plotWidth / bars.length;
  const barWidth = Math.max(4, groupWidth * 0.6);
  const barX = (index: number) => PADDING.left + groupWidth * index + (groupWidth - barWidth) / 2;
  const formatValue = (bar: WaterfallBar) => {
    if (bar.type === 'decrease') {
      return `-${valueFormatter(bar.magnitude)}`;
    }

    if (bar.type === 'increase') {
      return `+${valueFormatter(bar.magnitude)}`;
    }

    return valueFormatter(bar.magnitude);
  };
  const barColor = (bar: WaterfallBar) => {
    if (bar.type === 'decrease') {
      return 'var(--waterfall-decrease-color, #ff3d71)';
    }

    if (bar.type === 'increase') {
      return 'var(--waterfall-increase-color, #00d68f)';
    }

    return 'var(--waterfall-total-color, #3366ff)';
  };
  const dataTable = showDataTable
    ? {
        columns: ['Label', 'Value', 'Type'],
        rows: bars.map((bar) => [bar.item.label, formatValue(bar), bar.type])
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
        onMouseLeave={() => setActiveBar(null)}
      >
        <title>{ariaLabel}</title>
        {Array.from({ length: GRID_STEPS + 1 }, (_, index) => {
          const value = minValue + (range * index) / GRID_STEPS;
          const y = getY(value);

          return (
            <g key={`grid-${index}`}>
              {showGrid && (
                <line
                  className={cx(classes.grid)}
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
        {bars.map((bar) => (
          <text
            key={`label-${bar.item.label}-${bar.index}`}
            className={cx(classes.axisText)}
            x={barX(bar.index) + barWidth / 2}
            y={height - 8}
            textAnchor="middle"
          >
            {bar.item.label}
          </text>
        ))}
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
        {showConnectors &&
          bars.map((bar, index) => {
            if (index === 0) {
              return null;
            }

            const previous = bars[index - 1];
            const y = getY(previous.end);

            return (
              <line
                key={`connector-${bar.item.label}-${bar.index}`}
                className={cx(classes.connector)}
                data-connector="true"
                x1={barX(index - 1) + barWidth}
                x2={barX(index)}
                y1={y}
                y2={y}
              />
            );
          })}
        {bars.map((bar) => {
          const top = getY(Math.max(bar.start, bar.end));
          const bottom = getY(Math.min(bar.start, bar.end));
          const text = `${bar.item.label}: ${formatValue(bar)} (total ${valueFormatter(
            bar.cumulative
          )})`;
          const tooltip = `${bar.item.label} · ${formatValue(bar)} (total ${valueFormatter(
            bar.cumulative
          )})`;

          return (
            <rect
              key={`bar-${bar.item.label}-${bar.index}`}
              className={cx(classes.bar)}
              x={barX(bar.index)}
              y={top}
              width={barWidth}
              height={Math.max(0, bottom - top)}
              rx={2}
              fill={barColor(bar)}
              data-type={bar.type}
              data-label={bar.item.label}
              data-start={bar.start}
              data-end={bar.end}
              role="img"
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() =>
                setActiveBar({ x: barX(bar.index) + barWidth / 2, y: top, text: tooltip })
              }
              onFocus={() =>
                setActiveBar({ x: barX(bar.index) + barWidth / 2, y: top, text: tooltip })
              }
              onBlur={() => setActiveBar(null)}
            />
          );
        })}
        {activeBar && (
          <g transform={`translate(${activeBar.x}, ${activeBar.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeBar.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeBar.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeBar.text}
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

_WaterfallChart.displayName = 'WaterfallChart';

export { _WaterfallChart as WaterfallChart };
