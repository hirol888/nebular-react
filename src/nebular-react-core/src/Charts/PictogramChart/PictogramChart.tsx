import React, { forwardRef, useId, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { CHART_COLORS, ChartLegend } from '../LineChart';

export interface PictogramChartDatum {
  label: string;
  value: number;
  /** Custom glyph for the item. SVG content drawn inside a 32x32 box; inherits the item color. */
  icon?: React.ReactNode;
  color?: string;
}

export interface PictogramChartProps extends DefaultProps<PictogramChartStylesNames> {
  data: PictogramChartDatum[];
  /** Total number of icons in the grid. */
  maxUnits?: number;
  /** Number of icons per row. */
  columns?: number;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  ariaLabel?: string;
  onItemClick?(datum: PictogramChartDatum, index: number): void;
}

const GLYPH_SIZE = 32;
const GLYPH_GAP = 6;
const GLYPH_RADIUS = 7;

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    fontFamily: 'var(--chart-text-font-family, inherit)'
  },

  svg: {
    display: 'block',
    width: '100%',
    height: 'auto',
    overflow: 'visible'
  },

  slot: {
    fill: 'var(--chart-pictogram-empty-color, var(--background-basic-color-2, #f0f3f9))'
  },

  glyph: {
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
}));

export type PictogramChartStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<PictogramChartProps> = {
  maxUnits: 10,
  columns: 10,
  showLegend: true,
  ariaLabel: 'Pictogram chart',
  valueFormatter: (value: number) => String(value)
};

/** A slice of a single icon unit covered by one data item. */
export interface PictogramChartSegment {
  itemIndex: number;
  /** Start of the slice inside the unit, from 0 to 1. */
  from: number;
  /** End of the slice inside the unit, from 0 to 1. */
  to: number;
}

/**
 * Splits the units proportionally to the values.
 *
 * Items are laid out sequentially in fractional unit space, so every unit can be
 * shared by up to two neighboring items. That keeps the painted area exactly
 * proportional to the values while still allowing the last unit of an item to be
 * partially filled.
 */
export function layoutPictogramUnits(
  values: number[],
  unitCount: number
): PictogramChartSegment[][] {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);

  if (total <= 0 || unitCount <= 0) {
    return Array.from({ length: Math.max(0, unitCount) }, () => []);
  }

  let cursor = 0;
  const spans = values.map((value) => {
    const share = (Math.max(0, value) / total) * unitCount;
    const span = { start: cursor, end: cursor + share };

    cursor += share;

    return span;
  });

  return Array.from({ length: unitCount }, (_item, unitIndex) =>
    spans.reduce<PictogramChartSegment[]>((segments, span, itemIndex) => {
      const from = Math.max(0, Math.max(span.start, unitIndex) - unitIndex);
      const to = Math.min(1, Math.min(span.end, unitIndex + 1) - unitIndex);

      if (to - from > 1e-6) {
        segments.push({ itemIndex, from, to });
      }

      return segments;
    }, [])
  );
}

function toFillFraction(segment: PictogramChartSegment) {
  return Number((segment.to - segment.from).toFixed(4));
}

const _PictogramChart = forwardRef<HTMLDivElement, PictogramChartProps>((props, ref) => {
  const {
    data,
    maxUnits,
    columns,
    showLegend,
    valueFormatter,
    ariaLabel,
    onItemClick,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'pictogram-chart',
    classNames,
    styles,
    unstyled
  });
  const rawId = useId();
  const [activeGlyph, setActiveGlyph] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);

  if (data.length === 0 || total <= 0) {
    return (
      <div ref={ref} className={cx(classes.root, className)}>
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const unitCount = Math.max(1, Math.floor(maxUnits));
  const columnCount = Math.max(1, Math.floor(columns));
  const rowCount = Math.ceil(unitCount / columnCount);
  const width = columnCount * (GLYPH_SIZE + GLYPH_GAP) - GLYPH_GAP;
  const height = rowCount * (GLYPH_SIZE + GLYPH_GAP) - GLYPH_GAP;
  const clipBase = `pictogram-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const colors = data.map((item, index) => item.color ?? CHART_COLORS[index % CHART_COLORS.length]);
  const units = layoutPictogramUnits(
    data.map((item) => item.value),
    unitCount
  );
  const interactive = typeof onItemClick === 'function';
  const legendSeries = data.map((item, index) => ({
    name: item.label,
    color: colors[index],
    data: [item.value]
  }));

  return (
    <div ref={ref} className={cx(classes.root, className)}>
      <svg
        className={cx(classes.svg)}
        style={{ maxWidth: width }}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveGlyph(null)}
      >
        <title>{ariaLabel}</title>
        <defs>
          {units.map((segments, unitIndex) =>
            segments.map((segment) => {
              if (segment.from <= 0 && segment.to >= 1) {
                return null;
              }

              return (
                <clipPath
                  key={`clip-${unitIndex}-${segment.itemIndex}`}
                  id={`${clipBase}-${unitIndex}-${segment.itemIndex}`}
                >
                  <rect
                    x={segment.from * GLYPH_SIZE}
                    y={0}
                    width={(segment.to - segment.from) * GLYPH_SIZE}
                    height={GLYPH_SIZE}
                  />
                </clipPath>
              );
            })
          )}
        </defs>
        {units.map((segments, unitIndex) => {
          const column = unitIndex % columnCount;
          const row = Math.floor(unitIndex / columnCount);
          const x = column * (GLYPH_SIZE + GLYPH_GAP);
          const y = row * (GLYPH_SIZE + GLYPH_GAP);

          return (
            <g
              key={`unit-${unitIndex}`}
              data-pictogram-unit={unitIndex}
              data-pictogram-row={row}
              data-pictogram-column={column}
              transform={`translate(${x} ${y})`}
            >
              <rect
                className={cx(classes.slot)}
                data-pictogram-empty={unitIndex}
                width={GLYPH_SIZE}
                height={GLYPH_SIZE}
                rx={GLYPH_RADIUS}
                aria-hidden="true"
              />
              {segments.map((segment) => {
                const datum = data[segment.itemIndex];
                const text = `${datum.label}: ${valueFormatter(datum.value)}`;
                const partial = segment.from > 0 || segment.to < 1;

                return (
                  <g
                    key={`glyph-${unitIndex}-${segment.itemIndex}`}
                    className={cx(classes.glyph)}
                    data-pictogram-item={segment.itemIndex}
                    data-pictogram-fill={toFillFraction(segment)}
                    fill={colors[segment.itemIndex]}
                    clipPath={
                      partial ? `url(#${clipBase}-${unitIndex}-${segment.itemIndex})` : undefined
                    }
                    role={interactive ? 'button' : 'img'}
                    tabIndex={0}
                    aria-label={text}
                    onMouseEnter={() => setActiveGlyph({ x: x + GLYPH_SIZE / 2, y, text })}
                    onFocus={() => setActiveGlyph({ x: x + GLYPH_SIZE / 2, y, text })}
                    onBlur={() => setActiveGlyph(null)}
                    onClick={() => onItemClick?.(datum, segment.itemIndex)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onItemClick?.(datum, segment.itemIndex);
                      }
                    }}
                  >
                    {datum.icon ?? (
                      <rect
                        data-pictogram-glyph="default"
                        width={GLYPH_SIZE}
                        height={GLYPH_SIZE}
                        rx={GLYPH_RADIUS}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {activeGlyph && (
          <g transform={`translate(${activeGlyph.x}, ${activeGlyph.y - 8})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeGlyph.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeGlyph.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeGlyph.text}
            </text>
          </g>
        )}
      </svg>
      {showLegend && <ChartLegend series={legendSeries} classes={classes} cx={cx} />}
    </div>
  );
});

_PictogramChart.displayName = 'PictogramChart';

export { _PictogramChart as PictogramChart };
