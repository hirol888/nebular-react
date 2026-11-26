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
import { CHART_COLORS, ChartLegend } from '../LineChart';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export interface WaffleChartDatum {
  label: string;
  value: number;
  color?: string;
}

export type WaffleChartDataTableMode = 'hidden' | 'visible' | false;

export interface WaffleChartProps extends DefaultProps<WaffleChartStylesNames> {
  data: WaffleChartDatum[];
  rows?: number;
  columns?: number;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onCellClick?(datum: WaffleChartDatum, index: number): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: WaffleChartDataTableMode;
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
      flex: '0 0 auto',
      overflow: 'visible'
    },

    cell: {
      cursor: 'pointer',
      outline: 'none',
      transition: 'opacity 120ms ease',

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

    legend: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
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

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type WaffleChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<WaffleChartProps> = {
  rows: 10,
  columns: 10,
  showLegend: true,
  ariaLabel: 'Waffle chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'waffle-chart',
  animated: false
};

const CELL_SIZE = 24;
const CELL_GAP = 3;

/**
 * Splits the grid slots proportionally to the values.
 *
 * Floors every share and distributes the remaining slots by largest fractional
 * part (ties resolved by data index), so the allocation is deterministic and
 * always fills the whole grid.
 */
function allocateCells(values: number[], cellCount: number): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  const exact = values.map((value) => (total > 0 ? (value / total) * cellCount : 0));
  const allocation = exact.map((value) => Math.floor(value));
  let remaining = cellCount - allocation.reduce((sum, value) => sum + value, 0);
  const byFraction = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((first, second) => second.fraction - first.fraction || first.index - second.index);
  let cursor = 0;

  while (remaining > 0) {
    allocation[byFraction[cursor % byFraction.length].index] += 1;
    remaining -= 1;
    cursor += 1;
  }

  return allocation;
}

const _WaffleChart = forwardRef<HTMLDivElement, WaffleChartProps>((props, ref) => {
  const {
    data,
    rows,
    columns,
    showLegend,
    valueFormatter,
    ariaLabel,
    onCellClick,
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
    name: 'waffle-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeCell, setActiveCell] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);

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

  if (data.length === 0 || total <= 0) {
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

  const rowCount = Math.max(1, Math.floor(rows));
  const columnCount = Math.max(1, Math.floor(columns));
  const cellCount = rowCount * columnCount;
  const allocation = allocateCells(
    data.map((item) => Math.max(0, item.value)),
    cellCount
  );
  const interactive = typeof onCellClick === 'function';
  const cells = allocation.reduce<{ datum: WaffleChartDatum; datumIndex: number; color: string }[]>(
    (acc, count, datumIndex) => {
      const datum = data[datumIndex];
      const color = datum.color ?? CHART_COLORS[datumIndex % CHART_COLORS.length];

      for (let index = 0; index < count; index += 1) {
        acc.push({ datum, datumIndex, color });
      }

      return acc;
    },
    []
  );
  const width = columnCount * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const height = rowCount * (CELL_SIZE + CELL_GAP) - CELL_GAP;
  const legendSeries = data.map((item, index) => ({
    name: item.label,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
    data: [item.value]
  }));

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
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveCell(null)}
      >
        <title>{ariaLabel}</title>
        {cells.map((cell, cellIndex) => {
          const row = Math.floor(cellIndex / columnCount);
          const column = cellIndex % columnCount;
          const x = column * (CELL_SIZE + CELL_GAP);
          const y = row * (CELL_SIZE + CELL_GAP);
          const text = `${cell.datum.label}: ${valueFormatter(cell.datum.value)}`;

          return (
            <rect
              key={`${cell.datumIndex}-${cellIndex}`}
              className={cx(classes.cell)}
              data-waffle-cell={cell.datumIndex}
              x={x}
              y={y}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              fill={cell.color}
              role={interactive ? 'button' : 'img'}
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() => setActiveCell({ x: x + CELL_SIZE / 2, y, text })}
              onFocus={() => setActiveCell({ x: x + CELL_SIZE / 2, y, text })}
              onBlur={() => setActiveCell(null)}
              onClick={() => onCellClick?.(cell.datum, cell.datumIndex)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onCellClick?.(cell.datum, cell.datumIndex);
                }
              }}
            />
          );
        })}
        {activeCell && (
          <g transform={`translate(${activeCell.x}, ${activeCell.y - 8})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeCell.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeCell.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeCell.text}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {showDataTable && (
        <div style={{ flex: '1 0 100%', minWidth: 0 }}>
          <ChartDataTable
            caption={dataTableCaption}
            columns={['Label', 'Value']}
            rows={data.map((item) => [item.label, valueFormatter(item.value)])}
            visuallyHidden={showDataTable === 'hidden'}
          />
        </div>
      )}
    </div>
  );
});

_WaffleChart.displayName = 'WaffleChart';

export { _WaffleChart as WaffleChart };
