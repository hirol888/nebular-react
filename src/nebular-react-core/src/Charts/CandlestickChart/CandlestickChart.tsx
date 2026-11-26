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

export interface CandlestickData {
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type CandlestickChartDataTableMode = 'hidden' | 'visible' | false;

export interface CandlestickChartProps extends DefaultProps<CandlestickChartStylesNames> {
  data: CandlestickData[];
  height?: number;
  showGrid?: boolean;
  showVolume?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onCandleClick?(candle: CandlestickData, index: number): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: CandlestickChartDataTableMode;
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
const PADDING = { top: 16, right: 16, bottom: 32, left: 52 };
const VOLUME_RATIO = 0.22;
const VOLUME_GAP = 8;
const UP_COLOR = '#00d68f';
const DOWN_COLOR = '#ff3d71';

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

export type CandlestickChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<CandlestickChartProps> = {
  height: 320,
  showGrid: true,
  showVolume: false,
  ariaLabel: 'Candlestick chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'candlestick-chart',
  animated: false
};

interface ActiveItem {
  x: number;
  y: number;
  text: string;
}

const _CandlestickChart = forwardRef<HTMLDivElement, CandlestickChartProps>((props, ref) => {
  const {
    data,
    height,
    showGrid,
    showVolume,
    valueFormatter,
    ariaLabel,
    onCandleClick,
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
    name: 'candlestick-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);
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

  const dataTableRows = data.map((item) => [
    item.label,
    valueFormatter(item.open),
    valueFormatter(item.high),
    valueFormatter(item.low),
    valueFormatter(item.close)
  ]);

  const rawMin = Math.min(...data.map((item) => item.low));
  const rawMax = Math.max(...data.map((item) => item.high));
  const domainMin = rawMin === rawMax ? rawMin - 1 : rawMin;
  const domainMax = rawMin === rawMax ? rawMax + 1 : rawMax;
  const range = domainMax - domainMin;
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const hasVolume = showVolume && data.some((item) => Number.isFinite(item.volume));
  const volumeHeight = hasVolume ? plotHeight * VOLUME_RATIO : 0;
  const volumeGap = hasVolume ? VOLUME_GAP : 0;
  const priceHeight = plotHeight - volumeHeight - volumeGap;
  const volumeBottom = PADDING.top + plotHeight;
  const volumes = data
    .map((item) => item.volume)
    .filter((volume): volume is number => Number.isFinite(volume));
  const maxVolume = Math.max(1, ...volumes);
  const getY = (value: number) =>
    PADDING.top + priceHeight - ((value - domainMin) / range) * priceHeight;
  const getVolumeY = (volume: number) => volumeBottom - (volume / maxVolume) * volumeHeight;
  const groupWidth = plotWidth / data.length;
  const candleWidth = Math.max(3, Math.min(20, groupWidth * 0.6));
  const getGroupLeft = (index: number) => PADDING.left + groupWidth * index;
  const getCenterX = (index: number) => getGroupLeft(index) + groupWidth / 2;

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
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveItem(null)}
      >
        <title>{ariaLabel}</title>
        {Array.from({ length: GRID_STEPS + 1 }, (_item, index) => {
          const value = domainMin + (range * index) / GRID_STEPS;
          const y = getY(value);

          return (
            <g key={`grid-${index}`}>
              {showGrid && (
                <line
                  className={cx(classes.grid)}
                  data-candle-grid="true"
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
        {data.map((item, index) => (
          <text
            key={`${item.label}-${index}`}
            className={cx(classes.axisText)}
            x={getCenterX(index)}
            y={height - 8}
            textAnchor="middle"
          >
            {item.label}
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
        {data.map((item, index) => {
          const isUp = item.close >= item.open;
          const color = isUp ? UP_COLOR : DOWN_COLOR;
          const direction = isUp ? 'up' : 'down';
          const centerX = getCenterX(index);
          const bodyTop = getY(Math.max(item.open, item.close));
          const bodyBottom = getY(Math.min(item.open, item.close));
          const bodyHeight = Math.max(1, bodyBottom - bodyTop);
          const volumeText = item.volume === undefined ? '' : `, V ${valueFormatter(item.volume)}`;
          const text = `${item.label}: O ${valueFormatter(item.open)}, H ${valueFormatter(
            item.high
          )}, L ${valueFormatter(item.low)}, C ${valueFormatter(item.close)}${volumeText}`;

          return (
            <g
              key={`${item.label}-${index}`}
              data-candle-label={item.label}
              data-candle-index={index}
              data-candle-direction={direction}
            >
              <line
                className={cx(classes.grid)}
                data-candle-wick="true"
                x1={centerX}
                x2={centerX}
                y1={getY(item.high)}
                y2={getY(item.low)}
                stroke={color}
                strokeWidth={1}
                aria-hidden="true"
              />
              <rect
                data-candle-body="true"
                data-candle-direction={direction}
                x={centerX - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                rx={1}
                fill={color}
                aria-hidden="true"
              />
              {hasVolume && Number.isFinite(item.volume) && (
                <rect
                  data-candle-volume="true"
                  x={centerX - candleWidth / 2}
                  y={getVolumeY(item.volume ?? 0)}
                  width={candleWidth}
                  height={Math.max(0, volumeBottom - getVolumeY(item.volume ?? 0))}
                  rx={1}
                  fill={color}
                  opacity={0.45}
                  aria-hidden="true"
                />
              )}
              <rect
                className={cx(classes.hitArea)}
                data-candle-hit="true"
                x={getGroupLeft(index)}
                y={PADDING.top}
                width={groupWidth}
                height={priceHeight}
                fill="transparent"
                role={typeof onCandleClick === 'function' ? 'button' : 'img'}
                tabIndex={0}
                aria-label={text}
                onMouseEnter={() => setActiveItem({ x: centerX, y: bodyTop, text })}
                onFocus={() => setActiveItem({ x: centerX, y: bodyTop, text })}
                onBlur={() => setActiveItem(null)}
                onClick={() => onCandleClick?.(item, index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onCandleClick?.(item, index);
                  }
                }}
              />
            </g>
          );
        })}
        {activeItem && (
          <g transform={`translate(${activeItem.x}, ${activeItem.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeItem.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeItem.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeItem.text}
            </text>
          </g>
        )}
      </svg>
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Date', 'Open', 'High', 'Low', 'Close']}
          rows={dataTableRows}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_CandlestickChart.displayName = 'CandlestickChart';

export { _CandlestickChart as CandlestickChart };
