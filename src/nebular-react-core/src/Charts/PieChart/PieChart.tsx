import React, { forwardRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { ChartDataTable } from '../ChartDataTable';
import { usePrefersReducedMotion } from '../ChartContainer/chart-motion';
import { CHART_COLORS, ChartLegend } from '../LineChart';

export interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

export type PieChartDataTableMode = 'hidden' | 'visible' | false;

export interface PieChartProps extends DefaultProps<PieChartStylesNames> {
  data: PieChartData[];
  size?: number;
  innerRadius?: number;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  /** `visible` renders a data table below the chart, `hidden` keeps it screen-reader only. */
  showDataTable?: PieChartDataTableMode;
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

    svg: {
      display: 'block',
      flex: '0 0 auto',
      overflow: 'visible'
    },

    sector: {
      cursor: 'pointer',
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

export type PieChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<PieChartProps> = {
  size: 220,
  innerRadius: 0,
  showLegend: true,
  ariaLabel: 'Pie chart',
  valueFormatter: (value: number) => String(value),
  showDataTable: false,
  animated: false
};

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function fullCirclePath(cx: number, cy: number, outerRadius: number, innerRadius: number) {
  const outer = [
    `M ${cx} ${cy - outerRadius}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy + outerRadius}`,
    `A ${outerRadius} ${outerRadius} 0 1 1 ${cx} ${cy - outerRadius}`,
    'Z'
  ].join(' ');

  if (innerRadius <= 0) {
    return outer;
  }

  const inner = [
    `M ${cx} ${cy - innerRadius}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}`,
    'Z'
  ].join(' ');

  return `${outer} ${inner}`;
}

function sectorPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const sweep = endAngle - startAngle;

  if (sweep >= 359.999) {
    return fullCirclePath(cx, cy, outerRadius, innerRadius);
  }

  const largeArc = sweep > 180 ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);

  if (innerRadius <= 0) {
    return [
      `M ${cx} ${cy}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      'Z'
    ].join(' ');
  }

  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z'
  ].join(' ');
}

const _PieChart = forwardRef<HTMLDivElement, PieChartProps>((props, ref) => {
  const {
    data,
    size,
    innerRadius,
    showLegend,
    valueFormatter,
    ariaLabel,
    showDataTable,
    dataTableCaption,
    animated,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'pie-chart',
    classNames,
    styles,
    unstyled
  });
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeSector, setActiveSector] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const isAnimated = animated && !prefersReducedMotion;
  const dataTable = showDataTable
    ? {
        columns: ['Label', 'Value'],
        rows: data.map((item) => [item.label, valueFormatter(item.value)])
      }
    : undefined;

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

  const center = size / 2;
  const outerRadius = Math.max(1, center - 2);
  const inner = Math.min(Math.max(0, innerRadius), outerRadius - 1);
  const legendSeries = data.map((item, index) => ({
    name: item.label,
    color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
    data: [item.value]
  }));
  let angle = 0;
  const sectors = data
    .map((item, index) => {
      const value = Math.max(0, item.value);
      const sweep = (value / total) * 360;
      const startAngle = angle;
      const endAngle = angle + sweep;
      const percent = Math.round((value / total) * 100);
      const anchorRadius = inner > 0 ? (inner + outerRadius) / 2 : outerRadius * 0.65;
      const anchor = polarToCartesian(center, center, anchorRadius, startAngle + sweep / 2);

      angle = endAngle;

      return {
        item,
        index,
        value,
        startAngle,
        endAngle,
        percent,
        anchor,
        color: item.color ?? CHART_COLORS[index % CHART_COLORS.length]
      };
    })
    .filter((sector) => sector.value > 0);

  return (
    <div
      ref={ref}
      className={cx(classes.root, isAnimated && classes.animated, className)}
      data-animated={isAnimated ? 'true' : undefined}
    >
      <svg
        className={cx(classes.svg)}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveSector(null)}
      >
        <title>{ariaLabel}</title>
        {sectors.map((sector) => {
          const text = `${sector.item.label}: ${valueFormatter(sector.item.value)} (${
            sector.percent
          }%)`;

          return (
            <path
              key={`${sector.item.label}-${sector.index}`}
              className={cx(classes.sector)}
              d={sectorPath(center, center, outerRadius, inner, sector.startAngle, sector.endAngle)}
              fill={sector.color}
              fillRule="evenodd"
              role="img"
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() => setActiveSector({ x: sector.anchor.x, y: sector.anchor.y, text })}
              onFocus={() => setActiveSector({ x: sector.anchor.x, y: sector.anchor.y, text })}
              onBlur={() => setActiveSector(null)}
            />
          );
        })}
        {activeSector && (
          <g transform={`translate(${activeSector.x}, ${activeSector.y - 12})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeSector.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeSector.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeSector.text}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
      {dataTable && (
        <div style={{ flex: '1 0 100%', minWidth: 0 }}>
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

_PieChart.displayName = 'PieChart';

export { _PieChart as PieChart };
