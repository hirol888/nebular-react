import React, { forwardRef, useMemo, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useDefaultLocale } from '../Shared/hooks';

export interface CalendarHeatmapDatum {
  date: Date | string;
  value: number;
}

export interface CalendarHeatmapDay {
  date: Date;
  value: number;
}

export interface CalendarHeatmapProps extends DefaultProps<CalendarHeatmapStylesNames> {
  data: CalendarHeatmapDatum[];
  startDate?: Date | string;
  endDate?: Date | string;
  weeks?: number;
  cellSize?: number;
  gap?: number;
  colors?: string[];
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  showLegend?: boolean;
  valueFormatter?(value: number): string;
  onDayClick?(day: CalendarHeatmapDay): void;
  ariaLabel?: string;
  /** BCP 47 locale used by the month and weekday labels. */
  locale?: string;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontFamily: 'var(--chart-text-font-family, inherit)'
  },

  svg: {
    display: 'block',
    flex: '0 0 auto',
    overflow: 'visible'
  },

  axisText: {
    fill: 'var(--chart-axis-text-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.55rem'
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
    fill: 'var(--calendar-heatmap-empty-cell-color, var(--background-basic-color-2, #f7f9fc))'
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
}));

export type CalendarHeatmapStylesNames = Selectors<typeof useStyles>;

const DEFAULT_COLORS = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
const ROWS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function formatIntl(date: Date, options: Intl.DateTimeFormatOptions, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}

/** Short weekday names ordered from Sunday, matching the grid rows. */
function getWeekdayLabels(locale: string): string[] {
  // 2021-08-01 is a Sunday, so the indexes map directly to the grid rows.
  const reference = new Date(2021, 7, 1);

  return Array.from({ length: ROWS }, (_item, index) =>
    formatIntl(addDays(reference, index), { weekday: 'short' }, locale)
  );
}

function getMonthLabels(locale: string): string[] {
  return Array.from({ length: 12 }, (_item, month) =>
    formatIntl(new Date(2021, month, 1), { month: 'short' }, locale)
  );
}

const defaultProps: Partial<CalendarHeatmapProps> = {
  weeks: 52,
  cellSize: 12,
  gap: 3,
  showMonthLabels: true,
  showWeekdayLabels: true,
  showLegend: true,
  ariaLabel: 'Calendar heatmap',
  valueFormatter: (value: number) => String(value)
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

function parseDate(value: Date | string): Date | null {
  if (typeof value === 'string') {
    const match = ISO_DATE_PATTERN.exec(value.trim());

    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
  }

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toUtcDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay());
}

function differenceInDays(start: Date, end: Date) {
  return Math.round((toUtcDay(end) - toUtcDay(start)) / DAY_MS);
}

function formatIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
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

const _CalendarHeatmap = forwardRef<HTMLDivElement, CalendarHeatmapProps>((props, ref) => {
  const defaultLocale = useDefaultLocale(props.locale);
  const {
    data,
    startDate,
    endDate,
    weeks,
    cellSize,
    gap,
    colors,
    showMonthLabels,
    showWeekdayLabels,
    showLegend,
    valueFormatter,
    onDayClick,
    ariaLabel,
    locale,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps({ ...defaultProps, locale: defaultLocale }, props);
  const { classes, cx } = useStyles(null, {
    name: 'calendar-heatmap',
    classNames,
    styles,
    unstyled
  });
  const weekdayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const monthLabels = useMemo(() => getMonthLabels(locale), [locale]);
  const [activeDay, setActiveDay] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const parsedData = data
    .map((datum) => ({ datum, date: parseDate(datum.date) }))
    .filter((entry): entry is { datum: CalendarHeatmapDatum; date: Date } => entry.date !== null);
  const resolvedEnd = endDate
    ? parseDate(endDate)
    : parsedData.reduce<Date | null>(
        (latest, entry) => (latest === null || entry.date > latest ? entry.date : latest),
        null
      );

  if (parsedData.length === 0 || resolvedEnd === null) {
    return (
      <div ref={ref} className={cx(classes.root, className)}>
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const resolvedStart = startDate ? parseDate(startDate) : null;

  if (startDate && resolvedStart === null) {
    return (
      <div ref={ref} className={cx(classes.root, className)}>
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const weekCount = Math.max(1, Math.floor(weeks));
  const gridStart = startOfWeek(resolvedStart ?? addDays(resolvedEnd, -(weekCount * ROWS - 1)));
  const columnCount = resolvedStart
    ? Math.max(1, Math.ceil((differenceInDays(gridStart, resolvedEnd) + 1) / ROWS))
    : weekCount;
  const gridEnd = addDays(gridStart, columnCount * ROWS - 1);
  const dayMap = new Map<string, { datum: CalendarHeatmapDatum; date: Date }>();

  parsedData.forEach(({ datum, date }) => {
    if (toUtcDay(date) >= toUtcDay(gridStart) && toUtcDay(date) <= toUtcDay(gridEnd)) {
      dayMap.set(formatIsoDate(date), { datum, date });
    }
  });

  if (dayMap.size === 0) {
    return (
      <div ref={ref} className={cx(classes.root, className)}>
        <div className={cx(classes.empty)}>No data</div>
      </div>
    );
  }

  const values = Array.from(dayMap.values()).map((entry) => entry.datum.value);
  const scaleMin = Math.min(...values);
  const scaleMax = Math.max(...values);
  const scaleRange = scaleMax - scaleMin;
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;
  const getColor = (value: number) =>
    getColorScale(
      palette,
      scaleRange > 0 ? (value - scaleMin) / scaleRange : value >= scaleMax ? 1 : 0.5
    );
  const formatDay = (entry: { datum: CalendarHeatmapDatum; date: Date }) =>
    `${formatIsoDate(entry.date)}: ${valueFormatter(entry.datum.value)}`;
  const leftPad = showWeekdayLabels ? 30 : 4;
  const topPad = showMonthLabels ? 18 : 4;
  const rightPad = 4;
  const bottomPad = 4;
  const width = leftPad + columnCount * cellSize + (columnCount - 1) * gap + rightPad;
  const height = topPad + ROWS * cellSize + (ROWS - 1) * gap + bottomPad;
  const interactive = typeof onDayClick === 'function';

  return (
    <div ref={ref} className={cx(classes.root, className)}>
      <svg
        className={cx(classes.svg)}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={ariaLabel}
        onMouseLeave={() => setActiveDay(null)}
      >
        <title>{ariaLabel}</title>
        {showMonthLabels &&
          Array.from({ length: columnCount }, (_item, columnIndex) => {
            const columnDate = addDays(gridStart, columnIndex * ROWS);
            const previousDate = addDays(gridStart, (columnIndex - 1) * ROWS);

            if (columnIndex > 0 && columnDate.getMonth() === previousDate.getMonth()) {
              return null;
            }

            return (
              <text
                key={`month-${columnIndex}`}
                className={cx(classes.axisText)}
                x={leftPad + columnIndex * (cellSize + gap)}
                y={topPad - 6}
              >
                {monthLabels[columnDate.getMonth()]}
              </text>
            );
          })}
        {showWeekdayLabels &&
          weekdayLabels.map((label, rowIndex) => (
            <text
              key={`weekday-${label}`}
              className={cx(classes.axisText)}
              x={leftPad - 6}
              y={topPad + rowIndex * (cellSize + gap) + cellSize / 2 + 3}
              textAnchor="end"
            >
              {label}
            </text>
          ))}
        {Array.from({ length: columnCount * ROWS }, (_item, cellIndex) => {
          const columnIndex = Math.floor(cellIndex / ROWS);
          const rowIndex = cellIndex % ROWS;
          const date = addDays(gridStart, cellIndex);
          const isoDate = formatIsoDate(date);
          const cellX = leftPad + columnIndex * (cellSize + gap);
          const cellY = topPad + rowIndex * (cellSize + gap);
          const entry = dayMap.get(isoDate);

          if (!entry) {
            return (
              <rect
                key={isoDate}
                className={cx(classes.emptyCell)}
                data-calendar-day={isoDate}
                data-calendar-empty="true"
                x={cellX}
                y={cellY}
                width={cellSize}
                height={cellSize}
                rx={2}
                aria-hidden="true"
              />
            );
          }

          const { datum, date: datumDate } = entry;
          const scale = getColor(datum.value);
          const text = formatDay(entry);

          return (
            <rect
              key={isoDate}
              className={cx(classes.cell)}
              data-calendar-day={isoDate}
              data-calendar-value={datum.value}
              x={cellX}
              y={cellY}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={scale.fill}
              role={interactive ? 'button' : 'img'}
              tabIndex={0}
              aria-label={text}
              onMouseEnter={() => setActiveDay({ x: cellX + cellSize / 2, y: cellY, text })}
              onFocus={() => setActiveDay({ x: cellX + cellSize / 2, y: cellY, text })}
              onBlur={() => setActiveDay(null)}
              onClick={() => onDayClick?.({ date: datumDate, value: datum.value })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onDayClick?.({ date: datumDate, value: datum.value });
                }
              }}
            />
          );
        })}
        {activeDay && (
          <g transform={`translate(${activeDay.x}, ${activeDay.y - 8})`}>
            <rect
              className={cx(classes.tooltipBox)}
              x={-Math.max(60, activeDay.text.length * 3.5 + 24) / 2}
              y={-30}
              width={Math.max(60, activeDay.text.length * 3.5 + 24)}
              height={24}
              rx={4}
            />
            <text className={cx(classes.tooltipText)} textAnchor="middle" y={-14}>
              {activeDay.text}
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
    </div>
  );
});

_CalendarHeatmap.displayName = 'CalendarHeatmap';

export { _CalendarHeatmap as CalendarHeatmap };
