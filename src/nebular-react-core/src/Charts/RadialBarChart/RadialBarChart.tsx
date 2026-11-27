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

export interface RadialBarChartDatum {
  label: string;
  value: number;
  color?: string;
}

export type RadialBarChartDataTableMode = 'hidden' | 'visible' | false;

export interface RadialBarChartProps extends DefaultProps<RadialBarChartStylesNames> {
  data: RadialBarChartDatum[];
  size?: number;
  /** Inner hole radius as a fraction of the outer radius. */
  innerRadius?: number;
  /** Angle in degrees where every bar starts (0 = right, -90 = top). */
  startAngle?: number;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onBarClick?(datum: RadialBarChartDatum, index: number): void;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: RadialBarChartDataTableMode;
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
      alignItems: 'center',
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

    label: {
      fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.65rem',
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
      flexWrap: 'wrap',
      justifyContent: 'center',
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

    empty: {
      padding: '1.5rem',
      textAlign: 'center',
      color: 'var(--chart-empty-color, var(--text-hint-color, #8f9bb3))',
      fontSize: '0.8125rem'
    }
  };
});

export type RadialBarChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<RadialBarChartProps> = {
  size: 300,
  innerRadius: 0.35,
  startAngle: -90,
  showLegend: true,
  ariaLabel: 'Radial bar chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  exportable: false,
  exportFileName: 'radial-bar-chart',
  animated: false
};

const OUTER_MARGIN = 4;
const BAR_GAP = 2;
const FULL_CIRCLE_SWEEP = 359.999;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: round(cx + radius * Math.cos(radians)),
    y: round(cy + radius * Math.sin(radians))
  };
}

function ringPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const sweep = endAngle - startAngle;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerMid = polarToCartesian(cx, cy, outerRadius, startAngle + 180);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerMid = polarToCartesian(cx, cy, innerRadius, startAngle + 180);

  if (sweep >= FULL_CIRCLE_SWEEP) {
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${round(outerRadius)} ${round(outerRadius)} 0 1 1 ${outerMid.x} ${outerMid.y}`,
      `A ${round(outerRadius)} ${round(outerRadius)} 0 1 1 ${outerStart.x} ${outerStart.y}`,
      `M ${innerStart.x} ${innerStart.y}`,
      `A ${round(innerRadius)} ${round(innerRadius)} 0 1 0 ${innerMid.x} ${innerMid.y}`,
      `A ${round(innerRadius)} ${round(innerRadius)} 0 1 0 ${innerStart.x} ${innerStart.y}`,
      'Z'
    ].join(' ');
  }

  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArc = sweep > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${round(outerRadius)} ${round(outerRadius)} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${round(innerRadius)} ${round(innerRadius)} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ');
}

const _RadialBarChart = forwardRef<HTMLDivElement, RadialBarChartProps>((props, ref) => {
  const {
    data,
    size,
    innerRadius,
    startAngle,
    showLegend,
    valueFormatter,
    ariaLabel,
    onBarClick,
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
    name: 'radial-bar-chart',
    classNames,
    styles,
    unstyled
  });
  const [activeBar, setActiveBar] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAnimated = animated && !prefersReducedMotion;
  const clampedValues = data.map((item) => Math.max(0, item.value));
  const maxValue = clampedValues.reduce((max, value) => Math.max(max, value), 0);

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

  if (data.length === 0 || maxValue <= 0) {
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

  const center = size / 2;
  const outerRadius = Math.max(1, center - OUTER_MARGIN);
  const innerHole = Math.min(outerRadius * 0.95, Math.max(0, outerRadius * innerRadius));
  const thickness = (outerRadius - innerHole) / data.length;
  const gap = Math.min(BAR_GAP, thickness / 4);
  const interactive = typeof onBarClick === 'function';
  const bars = data
    .map((datum, index) => {
      const value = clampedValues[index];
      const percent = Math.round((value / maxValue) * 100);
      const sweep = (value / maxValue) * 360;
      const endAngle = startAngle + sweep;
      const ringOuter = outerRadius - index * thickness - gap / 2;
      const ringInner = Math.max(innerHole, ringOuter - thickness + gap);
      const midpoint = startAngle + sweep / 2;
      const labelRadius = (ringOuter + ringInner) / 2;
      const labelAnchor = polarToCartesian(center, center, labelRadius, midpoint);
      const text = `${datum.label}: ${valueFormatter(datum.value)} (${percent}%)`;

      return {
        datum,
        index,
        value,
        sweep,
        percent,
        endAngle,
        ringOuter,
        ringInner,
        labelAnchor,
        color: datum.color ?? CHART_COLORS[index % CHART_COLORS.length],
        text
      };
    })
    .filter((bar) => bar.value > 0);
  const legendSeries = bars.map((bar) => ({
    name: bar.datum.label,
    color: bar.color,
    data: [bar.value]
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
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveBar(null)}
      >
        <title>{ariaLabel}</title>
        {bars.map((bar) => (
          <path
            key={`bar-${bar.index}`}
            className={cx(classes.bar)}
            data-radial-bar={bar.index}
            data-radial-outer={bar.ringOuter}
            data-radial-inner={bar.ringInner}
            data-radial-start={startAngle}
            data-radial-end={bar.endAngle}
            d={ringPath(center, center, bar.ringOuter, bar.ringInner, startAngle, bar.endAngle)}
            fill={bar.color}
            fillRule="evenodd"
            role={interactive ? 'button' : 'img'}
            tabIndex={0}
            aria-label={bar.text}
            onMouseEnter={() =>
              setActiveBar({ x: bar.labelAnchor.x, y: bar.labelAnchor.y, text: bar.text })
            }
            onFocus={() =>
              setActiveBar({ x: bar.labelAnchor.x, y: bar.labelAnchor.y, text: bar.text })
            }
            onBlur={() => setActiveBar(null)}
            onClick={() => onBarClick?.(bar.datum, bar.index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onBarClick?.(bar.datum, bar.index);
              }
            }}
          />
        ))}
        {bars.map((bar) => (
          <text
            key={`label-${bar.index}`}
            className={cx(classes.label)}
            x={bar.labelAnchor.x}
            y={bar.labelAnchor.y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {bar.datum.label}
          </text>
        ))}
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
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {showDataTable && (
        <ChartDataTable
          caption={dataTableCaption}
          columns={['Label', 'Value']}
          rows={data.map((item) => [item.label, valueFormatter(item.value)])}
          visuallyHidden={showDataTable === 'hidden'}
        />
      )}
    </div>
  );
});

_RadialBarChart.displayName = 'RadialBarChart';

export { _RadialBarChart as RadialBarChart };
