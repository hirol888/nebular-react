import moment from 'moment';
import type { Moment } from 'moment';
import type {
  SchedulerDateRange,
  SchedulerEvent,
  SchedulerOccurrence,
  SchedulerRecurrence
} from './types';

export interface ExpandRecurrenceOptions {
  /**
   * Safety cap for series without `count`/`until`. The visible range already
   * bounds the expansion, so this only protects against pathological inputs.
   */
  maxOccurrences?: number;
}

type RecurrenceUnit = 'day' | 'week' | 'month';

const DEFAULT_MAX_OCCURRENCES = 1000;
const MS_PER_DAY = 86400000;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const UNIT_BY_FREQUENCY: Record<SchedulerRecurrence['frequency'], RecurrenceUnit> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month'
};

const isMomentValue = (value: Date | Moment): value is Moment => moment.isMoment(value);

const asMoment = (value: Date | Moment): Moment =>
  isMomentValue(value) ? value.clone() : moment(value as Date);

const fromMoment = <TDate extends Date | Moment>(template: TDate, value: Moment): TDate =>
  (isMomentValue(template) ? value : value.toDate()) as TDate;

/** Date-only values are inclusive of the whole final day. */
function resolveUntil(until?: Date | string): number | undefined {
  if (until === undefined || until === null) {
    return undefined;
  }

  if (typeof until === 'string') {
    if (DATE_ONLY_PATTERN.test(until)) {
      const dateOnly = moment(until, 'YYYY-MM-DD', true);

      return dateOnly.isValid() ? dateOnly.endOf('day').valueOf() : undefined;
    }

    const parsed = new Date(until);

    return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
  }

  const value = until instanceof Date ? until.getTime() : new Date(until).getTime();

  return Number.isNaN(value) ? undefined : value;
}

/** Difference in calendar days, ignoring DST offsets. */
function wallDayDiff(from: Moment, to: Moment): number {
  const fromUtc = Date.UTC(from.year(), from.month(), from.date());
  const toUtc = Date.UTC(to.year(), to.month(), to.date());

  return Math.round((toUtc - fromUtc) / MS_PER_DAY);
}

function wallMonthDiff(from: Moment, to: Moment): number {
  return (to.year() - from.year()) * 12 + (to.month() - from.month());
}

/**
 * Skips the occurrences that are guaranteed to be before the visible range,
 * keeping the expansion cost proportional to the range instead of the series
 * age. The result is intentionally conservative; the loop still validates it.
 */
function estimateFirstIndex(
  start: Moment,
  rangeStart: Moment,
  recurrence: SchedulerRecurrence,
  interval: number
): number {
  if (rangeStart.valueOf() <= start.valueOf()) {
    return 0;
  }

  let approximate = 0;

  if (recurrence.frequency === 'daily') {
    approximate = Math.floor(wallDayDiff(start, rangeStart) / interval);
  } else if (recurrence.frequency === 'weekly') {
    approximate = Math.floor(wallDayDiff(start, rangeStart) / (7 * interval));
  } else {
    approximate = Math.floor(wallMonthDiff(start, rangeStart) / interval);
  }

  return Math.max(0, approximate - 1);
}

function createOccurrence<TDate extends Date | Moment>(
  event: SchedulerEvent<TDate>,
  occurrenceStart: TDate,
  durationMs: number | undefined,
  index: number,
  isRecurring: boolean
): SchedulerOccurrence<TDate> {
  const occurrenceEnd =
    durationMs === undefined
      ? undefined
      : fromMoment(occurrenceStart, asMoment(occurrenceStart).add(durationMs, 'milliseconds'));

  return {
    key: isRecurring ? `${event.id}@${occurrenceStart.valueOf()}` : String(event.id),
    eventId: event.id,
    originalEvent: event,
    originalStart: event.start,
    occurrenceStart,
    occurrenceEnd,
    start: occurrenceStart,
    end: occurrenceEnd,
    index,
    isRecurring
  };
}

/**
 * Expands the (optional) recurrence of `event` into the occurrences that start
 * inside `range` (inclusive start, exclusive end).
 *
 * The helper is pure and time-zone agnostic: values are handled as wall-clock
 * dates, so callers should convert them to the event time zone first (the
 * Scheduler component does this) to keep DST semantics correct.
 */
export function expandRecurrence<TDate extends Date | Moment = Date>(
  event: SchedulerEvent<TDate>,
  range: SchedulerDateRange<TDate>,
  options: ExpandRecurrenceOptions = {}
): SchedulerOccurrence<TDate>[] {
  const startValue = event.start.valueOf();
  const rangeStart = range.start.valueOf();
  const rangeEnd = range.end.valueOf();
  const durationMs =
    event.end === undefined ? undefined : Math.max(0, event.end.valueOf() - startValue);
  const { recurrence } = event;

  if (!recurrence) {
    if (startValue < rangeStart || startValue >= rangeEnd) {
      return [];
    }

    return [createOccurrence(event, event.start, durationMs, 0, false)];
  }

  if (rangeEnd <= rangeStart) {
    return [];
  }

  const interval =
    recurrence.interval === undefined || !Number.isFinite(recurrence.interval)
      ? 1
      : Math.max(1, Math.floor(recurrence.interval));
  const count =
    recurrence.count === undefined || !Number.isFinite(recurrence.count)
      ? undefined
      : Math.max(0, Math.floor(recurrence.count));
  const untilValue = resolveUntil(recurrence.until);

  if (count === 0) {
    return [];
  }

  if (untilValue !== undefined && untilValue < startValue) {
    return [];
  }

  const unit = UNIT_BY_FREQUENCY[recurrence.frequency];
  const limit =
    options.maxOccurrences === undefined || !Number.isFinite(options.maxOccurrences)
      ? DEFAULT_MAX_OCCURRENCES
      : Math.max(1, Math.floor(options.maxOccurrences));
  const seriesStart = asMoment(event.start);
  const firstIndex = estimateFirstIndex(seriesStart, asMoment(range.start), recurrence, interval);
  const occurrences: SchedulerOccurrence<TDate>[] = [];

  for (let index = firstIndex; index < firstIndex + limit; index++) {
    if (count !== undefined && index >= count) {
      break;
    }

    const occurrence = seriesStart.clone().add(index * interval, unit);
    const occurrenceValue = occurrence.valueOf();

    if (untilValue !== undefined && occurrenceValue > untilValue) {
      break;
    }

    if (occurrenceValue >= rangeEnd) {
      break;
    }

    if (occurrenceValue >= rangeStart) {
      occurrences.push(
        createOccurrence(event, fromMoment(event.start, occurrence), durationMs, index, true)
      );
    }
  }

  return occurrences;
}
