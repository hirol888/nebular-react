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
import { CHART_COLORS } from '../LineChart';

export interface FunnelChartData {
  label: string;
  value: number;
  color?: string;
}

export type FunnelChartDataTableMode = 'hidden' | 'visible' | false;

export interface FunnelChartProps extends DefaultProps<FunnelChartStylesNames> {
  data: FunnelChartData[];
  height?: number;
  showValues?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onSegmentClick?(item: FunnelChartData, index: number): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: FunnelChartDataTableMode;
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
const PADDING = { top: 8, right: 24, bottom: 8, left: 24 };
const SEGMENT_GAP = 2;

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

    segment: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        stroke: 'var(--color-primary-500, #3366ff)',
        strokeWidth: 2
      }
    },

    label: {
      fill: 'var(--chart-segment-label-color, #ffffff)',
      fontSize: '0.7rem',
      fontWeight: 600,
      pointerEvents: 'none'
    },

    value: {
      fill: 'var(--chart-segment-value-color, #ffffff)',
      fontSize: '0.65rem',
      opacity: 0.92,
      pointerEvents: 'none'
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

export type FunnelChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<FunnelChartProps> = {
  height: 260,
  showValues: true,
  ariaLabel: 'Funnel chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'funnel-chart',
  animated: false
};

interface ActiveSegment {
  x: number;
  y: number;
  text: string;
}

const _FunnelChart = forwardRef<HTMLDivElement, FunnelChartProps>((props, ref) => {
  const {
    data,
    height,
    showValues,
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
    name: 'funnel-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeSegment, setActiveSegment] = useState<ActiveSegment | null>(null);
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
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const dataTable = showDataTable
    ? {
        columns: ['Stage', 'Value'],
        rows: data.map((item) => [item.label, valueFormatter(item.value)])
      }
    : null;

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

  if (data.length === 0 || total <= 0) {
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

  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(...data.map((item) => Math.max(0, item.value)), 1);
  const segmentHeight = plotHeight / data.length;
  const centerX = CHART_WIDTH / 2;
  const widths = data.map((item) => Math.max(2, (Math.max(0, item.value) / maxValue) * plotWidth));
  const interactive = typeof onSegmentClick === 'function';

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
        onMouseLeave={() => setActiveSegment(null)}
      >
        <title>{ariaLabel}</title>
        {data.map((item, index) => {
          const value = Math.max(0, item.value);
          const percent = Math.round((value / total) * 100);
          const color = item.color ?? CHART_COLORS[index % CHART_COLORS.length];
          const top = PADDING.top + segmentHeight * index;
          const bottom = top + segmentHeight - SEGMENT_GAP;
          const topWidth = index === 0 ? plotWidth : widths[index - 1];
          const bottomWidth = widths[index];
          const centerY = (top + bottom) / 2;
          const text = `${item.label}: ${valueFormatter(value)} (${percent}%)`;
          const labelFits =
            Math.min(topWidth, bottomWidth) >= 40 && segmentHeight - SEGMENT_GAP >= 18;
          const showSegmentValues = showValues && segmentHeight - SEGMENT_GAP >= 30;

          return (
            <g key={`${item.label}-${index}`}>
              <path
                className={cx(classes.segment)}
                d={[
                  `M ${centerX - topWidth / 2} ${top}`,
                  `L ${centerX + topWidth / 2} ${top}`,
                  `L ${centerX + bottomWidth / 2} ${bottom}`,
                  `L ${centerX - bottomWidth / 2} ${bottom}`,
                  'Z'
                ].join(' ')}
                fill={color}
                role={interactive ? 'button' : 'img'}
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveSegment({ x: centerX, y: centerY - 12, text })}
                onFocus={() => setActiveSegment({ x: centerX, y: centerY - 12, text })}
                onBlur={() => setActiveSegment(null)}
                onClick={() => onSegmentClick?.(item, index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSegmentClick?.(item, index);
                  }
                }}
              />
              {labelFits && (
                <text
                  className={cx(classes.label)}
                  x={centerX}
                  y={showSegmentValues ? centerY - 4 : centerY + 3}
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              )}
              {labelFits && showSegmentValues && (
                <text
                  className={cx(classes.value)}
                  x={centerX}
                  y={centerY + 10}
                  textAnchor="middle"
                >
                  {valueFormatter(value)} ({percent}%)
                </text>
              )}
            </g>
          );
        })}
        {activeSegment && (
          <g transform={`translate(${activeSegment.x}, ${activeSegment.y})`}>
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

_FunnelChart.displayName = 'FunnelChart';

export { _FunnelChart as FunnelChart };
