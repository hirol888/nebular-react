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

export interface BulletChartData {
  label: string;
  value: number;
  target: number;
  max?: number;
  ranges?: number[];
}

export type BulletChartDataTableMode = 'hidden' | 'visible' | false;

export interface BulletChartProps extends DefaultProps<BulletChartStylesNames> {
  data: BulletChartData[];
  height?: number;
  orientation?: 'horizontal';
  showTarget?: boolean;
  showValues?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: BulletChartDataTableMode;
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
const PADDING = { top: 8, right: 16, bottom: 8 };
const RANGE_COLORS = ['#eef2f9', '#dfe6f2', '#ccd6e8'];

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

    axisText: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.65rem'
    },

    valueText: {
      fill: 'var(--bullet-value-text-color, var(--text-basic-color, #222b45))',
      fontSize: '0.65rem',
      fontWeight: 600
    },

    track: {
      fill: 'var(--bullet-track-color, var(--background-basic-color-2, #f7f9fc))'
    },

    range: {
      fill: 'var(--bullet-range-color, #dfe6f2)'
    },

    valueBar: {
      fill: 'var(--bullet-value-color, var(--color-primary-500, #3366ff))'
    },

    target: {
      stroke: 'var(--bullet-target-color, var(--text-basic-color, #222b45))',
      strokeWidth: 2,
      strokeLinecap: 'round'
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

export type BulletChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<BulletChartProps> = {
  height: 180,
  orientation: 'horizontal',
  showTarget: true,
  showValues: true,
  ariaLabel: 'Bullet chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'bullet-chart',
  animated: false
};

interface ActiveRow {
  x: number;
  y: number;
  text: string;
}

interface BulletRow {
  item: BulletChartData;
  index: number;
  max: number;
  valueRatio: number;
  targetRatio: number;
  bands: { start: number; end: number }[];
}

function resolveRows(data: BulletChartData[]): BulletRow[] {
  return data.map((item, index) => {
    const ranges = (item.ranges ?? [])
      .filter((range) => Number.isFinite(range) && range > 0)
      .sort((first, second) => first - second);
    const lastRange = ranges.length > 0 ? ranges[ranges.length - 1] : 0;
    const declaredMax = item.max ?? Math.max(item.value, item.target, lastRange);
    const max = declaredMax > 0 ? declaredMax : 1;
    const clamp = (value: number) => Math.min(1, Math.max(0, value / max));
    const bands: { start: number; end: number }[] = [];
    let previous = 0;

    ranges.forEach((range) => {
      const end = Math.min(range, max);

      if (end > previous) {
        bands.push({ start: previous, end });
        previous = end;
      }
    });

    return {
      item,
      index,
      max,
      valueRatio: clamp(item.value),
      targetRatio: clamp(item.target),
      bands
    };
  });
}

const _BulletChart = forwardRef<HTMLDivElement, BulletChartProps>((props, ref) => {
  const {
    data,
    height,
    showTarget,
    showValues,
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
    name: 'bullet-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeRow, setActiveRow] = useState<ActiveRow | null>(null);
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

  const rows = resolveRows(data);
  const dataTable = showDataTable
    ? {
        columns: ['Label', 'Value', 'Target', 'Max'],
        rows: rows.map((row) => [
          row.item.label,
          valueFormatter(row.item.value),
          valueFormatter(row.item.target),
          valueFormatter(row.max)
        ])
      }
    : null;
  const longestLabel = rows.reduce((widest, row) => Math.max(widest, row.item.label.length), 0);
  const leftPadding = Math.min(CHART_WIDTH * 0.3, Math.max(52, longestLabel * 6.5 + 12));
  const plotWidth = CHART_WIDTH - leftPadding - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const rowHeight = plotHeight / rows.length;
  const rangeColors = RANGE_COLORS;

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
        onMouseLeave={() => setActiveRow(null)}
      >
        <title>{ariaLabel}</title>
        {rows.map((row) => {
          const rowTop = PADDING.top + rowHeight * row.index;
          const textY = rowTop + rowHeight * 0.35;
          const barHeight = Math.min(12, Math.max(4, rowHeight * 0.36));
          const barCenter = rowTop + rowHeight * 0.68;
          const barY = barCenter - barHeight / 2;
          const valueBarHeight = Math.max(3, barHeight * 0.45);
          const valueBarY = barCenter - valueBarHeight / 2;
          const valueBarWidth = row.valueRatio * plotWidth;
          const targetX = leftPadding + row.targetRatio * plotWidth;
          const text = `${row.item.label}: ${valueFormatter(row.item.value)} (target ${valueFormatter(
            row.item.target
          )})`;
          const trackCenterX = leftPadding + plotWidth / 2;

          return (
            <g key={`${row.item.label}-${row.index}`} data-bullet-row={row.item.label}>
              <text className={cx(classes.axisText)} x={leftPadding - 8} y={textY} textAnchor="end">
                {row.item.label}
              </text>
              {showValues && (
                <text
                  className={cx(classes.valueText)}
                  x={CHART_WIDTH - PADDING.right}
                  y={textY}
                  textAnchor="end"
                >
                  {valueFormatter(row.item.value)}
                </text>
              )}
              <rect
                className={cx(classes.track)}
                x={leftPadding}
                y={barY}
                width={plotWidth}
                height={barHeight}
                rx={2}
                data-bullet-track="true"
                aria-hidden="true"
              />
              {row.bands.map((band, bandIndex) => (
                <rect
                  key={`band-${bandIndex}`}
                  x={leftPadding + (band.start / row.max) * plotWidth}
                  y={barY}
                  width={((band.end - band.start) / row.max) * plotWidth}
                  height={barHeight}
                  fill={rangeColors[Math.min(bandIndex, rangeColors.length - 1)]}
                  data-bullet-range="true"
                  aria-hidden="true"
                />
              ))}
              <rect
                className={cx(classes.valueBar)}
                x={leftPadding}
                y={valueBarY}
                width={valueBarWidth}
                height={valueBarHeight}
                rx={2}
                data-bullet-value="true"
                data-max={row.max}
                aria-hidden="true"
              />
              {showTarget && (
                <line
                  className={cx(classes.target)}
                  data-bullet-target="true"
                  data-ratio={row.targetRatio}
                  x1={targetX}
                  x2={targetX}
                  y1={barY - 3}
                  y2={barY + barHeight + 3}
                  aria-hidden="true"
                />
              )}
              <rect
                className={cx(classes.hitArea)}
                x={leftPadding}
                y={barY - 6}
                width={plotWidth}
                height={barHeight + 12}
                fill="transparent"
                role="img"
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveRow({ x: trackCenterX, y: barY, text })}
                onFocus={() => setActiveRow({ x: trackCenterX, y: barY, text })}
                onBlur={() => setActiveRow(null)}
              />
            </g>
          );
        })}
        {activeRow && (
          <g transform={`translate(${activeRow.x}, ${activeRow.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeRow.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeRow.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeRow.text}
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

_BulletChart.displayName = 'BulletChart';

export { _BulletChart as BulletChart };
