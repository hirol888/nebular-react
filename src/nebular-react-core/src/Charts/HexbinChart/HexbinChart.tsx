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

export interface HexbinPoint {
  x: number;
  y: number;
}

export interface HexbinBin {
  /** Horizontal center of the bin in data coordinates. */
  x: number;
  /** Vertical center of the bin in data coordinates. */
  y: number;
  /** Number of points aggregated into the bin. */
  count: number;
}

export type HexbinChartDataTableMode = 'hidden' | 'visible' | false;

export interface HexbinChartProps extends DefaultProps<HexbinChartStylesNames> {
  data: HexbinPoint[];
  radius?: number;
  width?: number;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  xLabel?: string;
  yLabel?: string;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onBinClick?(bin: HexbinBin): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: HexbinChartDataTableMode;
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

    bin: {
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

export type HexbinChartStylesNames = Selectors<typeof useStyles>;

const DEFAULT_COLORS = ['#e6f0ff', '#9ec5ff', '#3366ff', '#0b2ba8'];
const AXIS_STEPS = 4;
const SQRT3 = Math.sqrt(3);

const defaultProps: Partial<HexbinChartProps> = {
  radius: 18,
  width: 480,
  height: 280,
  showLegend: true,
  ariaLabel: 'Hexbin chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'hexbin-chart',
  animated: false
};

interface AxialCoordinate {
  q: number;
  r: number;
}

interface HiveBin extends AxialCoordinate {
  count: number;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function pixelToAxial(x: number, y: number, size: number): AxialCoordinate {
  return {
    q: ((SQRT3 / 3) * x - y / 3) / size,
    r: ((2 / 3) * y) / size
  };
}

/** Rounds fractional axial coordinates to the nearest hexagonal cell. */
function axialRound(axial: AxialCoordinate): AxialCoordinate {
  const roundedQ = Math.round(axial.q);
  const roundedR = Math.round(axial.r);
  const roundedS = Math.round(-axial.q - axial.r);
  const deltaQ = Math.abs(roundedQ - axial.q);
  const deltaR = Math.abs(roundedR - axial.r);
  const deltaS = Math.abs(roundedS + axial.q + axial.r);

  if (deltaQ > deltaR && deltaQ > deltaS) {
    return { q: -roundedR - roundedS, r: roundedR };
  }

  if (deltaR > deltaS) {
    return { q: roundedQ, r: -roundedQ - roundedS };
  }

  return { q: roundedQ, r: roundedR };
}

function axialToPixel(axial: AxialCoordinate, size: number) {
  return {
    x: size * SQRT3 * (axial.q + axial.r / 2),
    y: size * 1.5 * axial.r
  };
}

function hexagonPoints(cx: number, cy: number, size: number) {
  return Array.from({ length: 6 }, (_item, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;

    return `${round(cx + size * Math.cos(angle))},${round(cy + size * Math.sin(angle))}`;
  }).join(' ');
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
    return palette[0];
  }

  const bounded = Math.min(1, Math.max(0, ratio));
  const scaled = bounded * (palette.length - 1);
  const index = Math.min(palette.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const start = parseHexColor(palette[index]);
  const end = parseHexColor(palette[index + 1]);

  if (!start || !end) {
    return palette[index];
  }

  const channel = (from: number, to: number) => Math.round(from + (to - from) * local);

  return `rgb(${channel(start[0], end[0])}, ${channel(start[1], end[1])}, ${channel(
    start[2],
    end[2]
  )})`;
}

function getPaddingAmount(min: number, max: number) {
  const range = max - min;

  if (range === 0) {
    return Math.max(Math.abs(max) * 0.25, 1);
  }

  return range * 0.1;
}

function getPadding(hasXLabel: boolean, hasYLabel: boolean) {
  return {
    top: 16,
    right: 16,
    bottom: hasXLabel ? 46 : 32,
    left: hasYLabel ? 56 : 44
  };
}

const _HexbinChart = forwardRef<HTMLDivElement, HexbinChartProps>((props, ref) => {
  const {
    data,
    radius,
    width,
    height,
    colors,
    showLegend,
    xLabel,
    yLabel,
    valueFormatter,
    ariaLabel,
    onBinClick,
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
    name: 'hexbin-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeBin, setActiveBin] = useState<{
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

  const padding = getPadding(Boolean(xLabel), Boolean(yLabel));
  const plotWidth = Math.max(1, width - padding.left - padding.right);
  const plotHeight = Math.max(1, height - padding.top - padding.bottom);
  const xValues = data.map((point) => point.x);
  const yValues = data.map((point) => point.y);
  const xPadding = getPaddingAmount(Math.min(...xValues), Math.max(...xValues));
  const yPadding = getPaddingAmount(Math.min(...yValues), Math.max(...yValues));
  const xMin = Math.min(...xValues) - xPadding;
  const xMax = Math.max(...xValues) + xPadding;
  const yMin = Math.min(...yValues) - yPadding;
  const yMax = Math.max(...yValues) + yPadding;
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  const hexRadius = Math.max(1, radius);
  const getPlotX = (value: number) => ((value - xMin) / xRange) * plotWidth;
  const getPlotY = (value: number) => plotHeight - ((value - yMin) / yRange) * plotHeight;
  const hive = new Map<string, HiveBin>();

  data.forEach((point) => {
    const axial = axialRound(pixelToAxial(getPlotX(point.x), getPlotY(point.y), hexRadius));
    const key = `${axial.q}\u0000${axial.r}`;
    const existing = hive.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      hive.set(key, { q: axial.q, r: axial.r, count: 1 });
    }
  });

  const bins = Array.from(hive.values()).sort(
    (first, second) => first.q - second.q || first.r - second.r
  );
  const counts = bins.map((bin) => bin.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const countRange = maxCount - minCount;
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const interactive = typeof onBinClick === 'function';
  const xTicks = Array.from(
    { length: AXIS_STEPS + 1 },
    (_item, index) => xMin + (xRange * index) / AXIS_STEPS
  );
  const yTicks = Array.from(
    { length: AXIS_STEPS + 1 },
    (_item, index) => yMin + (yRange * index) / AXIS_STEPS
  );
  const formatPoints = (count: number) =>
    `${valueFormatter(count)} ${count === 1 ? 'point' : 'points'}`;

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
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveBin(null)}
      >
        <title>{ariaLabel}</title>
        {yTicks.map((value, index) => (
          <g key={`y-tick-${index}`}>
            <line
              className={cx(classes.grid)}
              x1={padding.left}
              x2={width - padding.right}
              y1={padding.top + getPlotY(value)}
              y2={padding.top + getPlotY(value)}
            />
            <text
              className={cx(classes.axisText)}
              x={padding.left - 8}
              y={padding.top + getPlotY(value) + 3}
              textAnchor="end"
            >
              {valueFormatter(value)}
            </text>
          </g>
        ))}
        {xTicks.map((value, index) => (
          <g key={`x-tick-${index}`}>
            <line
              className={cx(classes.grid)}
              x1={padding.left + getPlotX(value)}
              x2={padding.left + getPlotX(value)}
              y1={padding.top}
              y2={height - padding.bottom}
            />
            <text
              className={cx(classes.axisText)}
              x={padding.left + getPlotX(value)}
              y={height - padding.bottom + 14}
              textAnchor="middle"
            >
              {valueFormatter(value)}
            </text>
          </g>
        ))}
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
        {bins.map((bin, binIndex) => {
          const center = axialToPixel(bin, hexRadius);
          const cxBin = padding.left + center.x;
          const cyBin = padding.top + center.y;
          const ratio =
            countRange > 0 ? (bin.count - minCount) / countRange : bin.count >= maxCount ? 1 : 0.5;
          const text = `Bin ${binIndex + 1}: ${formatPoints(bin.count)}`;
          const tooltip = formatPoints(bin.count);
          const dataX = xMin + (center.x / plotWidth) * xRange;
          const dataY = yMin + ((plotHeight - center.y) / plotHeight) * yRange;

          return (
            <polygon
              key={`${bin.q}-${bin.r}`}
              className={cx(classes.bin)}
              data-hexbin-bin={binIndex}
              data-hexbin-q={bin.q}
              data-hexbin-r={bin.r}
              data-hexbin-count={bin.count}
              points={hexagonPoints(cxBin, cyBin, Math.max(1, hexRadius - 1))}
              fill={getColorScale(palette, ratio)}
              role={interactive ? 'button' : 'img'}
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() => setActiveBin({ x: cxBin, y: cyBin - hexRadius, text: tooltip })}
              onFocus={() => setActiveBin({ x: cxBin, y: cyBin - hexRadius, text: tooltip })}
              onBlur={() => setActiveBin(null)}
              onClick={() => onBinClick?.({ x: dataX, y: dataY, count: bin.count })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onBinClick?.({ x: dataX, y: dataY, count: bin.count });
                }
              }}
            />
          );
        })}
        {activeBin && (
          <g transform={`translate(${activeBin.x}, ${activeBin.y - 8})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeBin.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeBin.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeBin.text}
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
          <span>{valueFormatter(minCount)}</span>
          <span>{valueFormatter(maxCount)}</span>
        </div>
      )}
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['X', 'Y', 'Count']}
          rows={bins.map((bin) => {
            const center = axialToPixel(bin, hexRadius);
            const dataX = xMin + (center.x / plotWidth) * xRange;
            const dataY = yMin + ((plotHeight - center.y) / plotHeight) * yRange;

            return [valueFormatter(dataX), valueFormatter(dataY), valueFormatter(bin.count)];
          })}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_HexbinChart.displayName = 'HexbinChart';

export { _HexbinChart as HexbinChart };
