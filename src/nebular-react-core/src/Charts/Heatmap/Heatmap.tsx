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
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import {
  ChartExportFormat,
  exportChartPng,
  exportChartSvg,
  resolveChartFileName
} from '../chart-export';

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

export type HeatmapDataTableMode = 'hidden' | 'visible' | false;

export interface HeatmapProps extends DefaultProps<HeatmapStylesNames> {
  data: HeatmapCell[];
  xLabels?: string[];
  yLabels?: string[];
  cellSize?: number;
  gap?: number;
  colors?: string[];
  min?: number;
  max?: number;
  showValues?: boolean;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onCellClick?(cell: HeatmapCell): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: HeatmapDataTableMode;
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

    axisText: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.65rem'
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

    emptyCell: {
      fill: 'var(--heatmap-empty-cell-color, var(--background-basic-color-2, #f7f9fc))'
    },

    value: {
      fontSize: '0.65rem',
      fontWeight: 600,
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

    legend: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'var(--chart-legend-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.7rem'
    },

    legendGradient: {
      width: '8rem',
      height: '0.6rem',
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

export type HeatmapStylesNames = Selectors<typeof useStyles>;

const DEFAULT_COLORS = ['#e6f0ff', '#9ec5ff', '#3366ff', '#0b2ba8'];

const defaultProps: Partial<HeatmapProps> = {
  cellSize: 36,
  gap: 4,
  showValues: false,
  showLegend: true,
  ariaLabel: 'Heatmap',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'heatmap',
  animated: false
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function parseHexColor(color: string): [number, number, number] | null {
  const hex = color.replace('#', '').trim();

  if (hex.length === 3) {
    return [
      parseInt(`${hex[0]}${hex[0]}`, 16),
      parseInt(`${hex[1]}${hex[1]}`, 16),
      parseInt(`${hex[2]}${hex[2]}`, 16)
    ];
  }

  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }

  return null;
}

function getColorScale(colors: string[], ratio: number) {
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS;

  if (palette.length === 1) {
    return { fill: palette[0], luminance: 255 };
  }

  const bounded = Math.min(1, Math.max(0, ratio));
  const scaled = bounded * (palette.length - 1);
  const index = Math.min(palette.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const start = parseHexColor(palette[index]);
  const end = parseHexColor(palette[index + 1]);

  if (!start || !end) {
    return { fill: palette[index], luminance: 255 };
  }

  const channel = (from: number, to: number) => Math.round(from + (to - from) * local);
  const r = channel(start[0], end[0]);
  const g = channel(start[1], end[1]);
  const b = channel(start[2], end[2]);

  return {
    fill: `rgb(${r}, ${g}, ${b})`,
    luminance: (r * 299 + g * 587 + b * 114) / 1000
  };
}

const _Heatmap = forwardRef<HTMLDivElement, HeatmapProps>((props, ref) => {
  const {
    data,
    xLabels,
    yLabels,
    cellSize,
    gap,
    colors,
    min,
    max,
    showValues,
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
    name: 'heatmap',
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

  if (data.length === 0) {
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

  const resolvedX =
    xLabels && xLabels.length > 0 ? xLabels : uniqueValues(data.map((cell) => cell.x));
  const resolvedY =
    yLabels && yLabels.length > 0 ? yLabels : uniqueValues(data.map((cell) => cell.y));
  const cellMap = new Map(data.map((cell) => [`${cell.x}\u0000${cell.y}`, cell]));
  const values = data.map((cell) => cell.value);
  const scaleMin = min ?? Math.min(...values);
  const scaleMax = max ?? Math.max(...values);
  const scaleRange = scaleMax - scaleMin;
  const leftPad = Math.max(
    44,
    resolvedY.reduce((widest, label) => Math.max(widest, label.length), 0) * 6.5 + 16
  );
  const topPad = 22;
  const rightPad = 8;
  const bottomPad = 12;
  const gridWidth = resolvedX.length * cellSize + (resolvedX.length - 1) * gap;
  const gridHeight = resolvedY.length * cellSize + (resolvedY.length - 1) * gap;
  const width = leftPad + gridWidth + rightPad;
  const height = topPad + gridHeight + bottomPad;
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const getColor = (value: number) =>
    getColorScale(
      palette,
      scaleRange > 0 ? (value - scaleMin) / scaleRange : value >= scaleMax ? 1 : 0.5
    );
  const interactive = typeof onCellClick === 'function';

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
        {resolvedX.map((label, columnIndex) => (
          <text
            key={`x-label-${label}`}
            className={cx(classes.axisText)}
            x={leftPad + columnIndex * (cellSize + gap) + cellSize / 2}
            y={topPad - 8}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
        {resolvedY.map((label, rowIndex) => (
          <text
            key={`y-label-${label}`}
            className={cx(classes.axisText)}
            x={leftPad - 8}
            y={topPad + rowIndex * (cellSize + gap) + cellSize / 2 + 3}
            textAnchor="end"
          >
            {label}
          </text>
        ))}
        {resolvedY.map((row, rowIndex) =>
          resolvedX.map((column, columnIndex) => {
            const cellX = leftPad + columnIndex * (cellSize + gap);
            const cellY = topPad + rowIndex * (cellSize + gap);
            const cell = cellMap.get(`${column}\u0000${row}`);

            if (!cell) {
              return (
                <rect
                  key={`empty-${row}-${column}`}
                  className={cx(classes.emptyCell)}
                  x={cellX}
                  y={cellY}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  aria-hidden="true"
                />
              );
            }

            const scale = getColor(cell.value);
            const text = `${cell.x}, ${cell.y}: ${valueFormatter(cell.value)}`;
            const tooltip = `${cell.x} · ${cell.y}: ${valueFormatter(cell.value)}`;

            return (
              <g key={`${row}-${column}`}>
                <rect
                  className={cx(classes.cell)}
                  x={cellX}
                  y={cellY}
                  width={cellSize}
                  height={cellSize}
                  rx={3}
                  fill={scale.fill}
                  role={interactive ? 'button' : 'img'}
                  tabIndex={0}
                  aria-label={text}
                  onMouseEnter={() =>
                    setActiveCell({ x: cellX + cellSize / 2, y: cellY, text: tooltip })
                  }
                  onFocus={() =>
                    setActiveCell({ x: cellX + cellSize / 2, y: cellY, text: tooltip })
                  }
                  onBlur={() => setActiveCell(null)}
                  onClick={() => onCellClick?.(cell)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onCellClick?.(cell);
                    }
                  }}
                />
                {showValues && (
                  <text
                    className={cx(classes.value)}
                    x={cellX + cellSize / 2}
                    y={cellY + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fill:
                        scale.luminance > 150
                          ? 'var(--heatmap-value-color, var(--text-basic-color, #222b45))'
                          : 'var(--heatmap-value-contrast-color, #ffffff)'
                    }}
                  >
                    {valueFormatter(cell.value)}
                  </text>
                )}
              </g>
            );
          })
        )}
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
      {showLegend && (
        <div className={cx(classes.legend)} role="group" aria-label="Color scale">
          <span
            className={cx(classes.legendGradient)}
            style={{ backgroundImage: `linear-gradient(90deg, ${palette.join(', ')})` }}
            aria-hidden="true"
          />
          <span>{valueFormatter(scaleMin)}</span>
          <span>{valueFormatter(scaleMax)}</span>
        </div>
      )}
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Row', 'Column', 'Value']}
          rows={data.map((cell) => [cell.y, cell.x, valueFormatter(cell.value)])}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_Heatmap.displayName = 'Heatmap';

export { _Heatmap as Heatmap };
