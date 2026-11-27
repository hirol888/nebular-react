import React, { forwardRef, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Button } from '../Button';
import { ChartDataTable } from './ChartDataTable';
import { exportChartPng, exportChartSvg, resolveChartFileName } from './chart-export';
import { usePrefersReducedMotion } from './ChartContainer/chart-motion';
import { CHART_COLORS } from './LineChart';

export interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

export type DonutChartDataTableMode = 'hidden' | 'visible' | false;

export type DonutChartExportFormat = 'svg' | 'png';

export interface DonutChartProps extends DefaultProps<DonutChartStylesNames> {
  data: DonutChartData[];
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  ariaLabel?: string;
  formatValue?(value: number): string;
  onSegmentClick?(segment: DonutChartData, index: number): void;
  emptyState?: React.ReactNode;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: DonutChartDataTableMode;
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
      flex: '1 0 100%',
      gap: '0.5rem'
    },

    status: {
      color: 'var(--chart-status-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    svg: {
      display: 'block',
      flex: '0 0 auto'
    },

    segment: {
      cursor: 'pointer',
      transition: 'opacity 120ms ease',

      '&:focus-visible': {
        outline: 'none',
        strokeWidth: 4
      }
    },

    centerLabel: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    centerValue: {
      fill: 'var(--chart-tooltip-text-color, var(--text-basic-color, #222b45))',
      fontSize: '1.1rem',
      fontWeight: 700
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
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      color: 'var(--chart-legend-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.75rem'
    },

    swatch: {
      width: '0.65rem',
      height: '0.65rem',
      borderRadius: '2px',
      flex: '0 0 auto'
    },

    legendValue: {
      marginLeft: 'auto',
      color: 'var(--chart-tooltip-text-color, var(--text-basic-color, #222b45))',
      fontWeight: 600
    },

    tableContainer: {
      flex: '1 0 100%',
      minWidth: 0
    },

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type DonutChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<DonutChartProps> = {
  size: 180,
  thickness: 22,
  showLegend: true,
  ariaLabel: 'Donut chart',
  formatValue: (value: number) => String(value),
  emptyState: 'No data',
  showDataTable: false,
  exportable: false,
  exportFileName: 'donut-chart',
  animated: false
};

const _DonutChart = forwardRef<HTMLDivElement, DonutChartProps>((props, ref) => {
  const {
    data,
    size,
    thickness,
    showLegend,
    centerLabel,
    centerValue,
    ariaLabel,
    formatValue,
    onSegmentClick,
    emptyState,
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
    name: 'donut-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);

  const handleExport = async (format: DonutChartExportFormat) => {
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

  if (total <= 0) {
    return (
      <div
        ref={mergedRef}
        className={cx(classes.root, isAnimated && classes.animated, className)}
        data-animated={isAnimated ? 'true' : undefined}
      >
        <div className={cx(classes.empty)}>{emptyState}</div>
      </div>
    );
  }

  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const activeSegment = activeIndex !== null ? data[activeIndex] : null;
  const displayLabel = activeSegment ? activeSegment.label : centerLabel;
  const displayValue = activeSegment
    ? formatValue(activeSegment.value)
    : (centerValue ?? formatValue(total));
  const dataTable = showDataTable
    ? {
        columns: ['Label', 'Value'],
        rows: data.map((item) => [item.label, formatValue(item.value)])
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
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveIndex(null)}
      >
        <title>{ariaLabel}</title>
        <g transform={`rotate(-90 ${center} ${center})`}>
          {data.map((item, index) => {
            const value = Math.max(0, item.value);
            const segmentLength = (value / total) * circumference;
            const dashLength = Math.max(0, segmentLength - 2);
            const color = item.color ?? CHART_COLORS[index % CHART_COLORS.length];
            const dashOffset = -offset;

            offset += segmentLength;

            if (value === 0) {
              return null;
            }

            return (
              <circle
                key={`${item.label}-${index}`}
                className={cx(classes.segment)}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={thickness}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                role={typeof onSegmentClick === 'function' ? 'button' : 'img'}
                tabIndex={typeof onSegmentClick === 'function' ? 0 : -1}
                aria-label={`${item.label}: ${formatValue(item.value)} (${Math.round(
                  (value / total) * 100
                )}%)`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                onClick={() => onSegmentClick?.(item, index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSegmentClick?.(item, index);
                  }
                }}
              />
            );
          })}
        </g>
        {displayLabel && (
          <text className={cx(classes.centerLabel)} x={center} y={center - 8} textAnchor="middle">
            {displayLabel}
          </text>
        )}
        <text
          className={cx(classes.centerValue)}
          x={center}
          y={center + (displayLabel ? 14 : 4)}
          textAnchor="middle"
        >
          {displayValue}
        </text>
      </svg>
      {showLegend && (
        <ul className={cx(classes.legend)} aria-label="Segments">
          {data.map((item, index) => {
            const color = item.color ?? CHART_COLORS[index % CHART_COLORS.length];

            return (
              <li key={`${item.label}-${index}`} className={cx(classes.legendItem)}>
                <span
                  className={cx(classes.swatch)}
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                <span className={cx(classes.legendValue)}>{formatValue(item.value)}</span>
              </li>
            );
          })}
        </ul>
      )}
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

_DonutChart.displayName = 'DonutChart';

export { _DonutChart as DonutChart };
