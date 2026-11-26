import { isValidTimeZone } from '@nebular-react/hooks';

export const AVAILABILITY_WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;

export type AvailabilityWeekday = (typeof AVAILABILITY_WEEKDAYS)[number];

export interface AvailabilityInterval {
  /** Local wall-clock time in HH:mm format. */
  start: string;
  /** Local HH:mm. An end time of 00:00 means midnight at the end of that day. */
  end: string;
}

export interface AvailabilityOverride {
  /** Civil calendar day in YYYY-MM-DD format, in the schedule time zone. */
  date: string;
  /** Replaces the weekly intervals for this day. An empty array closes the day. */
  intervals: readonly AvailabilityInterval[];
}

export interface AvailabilitySchedule {
  timeZone: string;
  week: Partial<Record<AvailabilityWeekday, readonly AvailabilityInterval[]>>;
  overrides: readonly AvailabilityOverride[];
}

export type AvailabilityIssueCode =
  'timeZone' | 'time' | 'order' | 'overlap' | 'date' | 'duplicateDate';

export interface AvailabilityIssue {
  code: AvailabilityIssueCode;
  day?: AvailabilityWeekday;
  overrideIndex?: number;
  intervalIndex?: number;
  otherIntervalIndex?: number;
}

const minutesInDay = 24 * 60;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(value: string) {
  return timePattern.test(value) ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : NaN;
}

function toTime(minutes: number) {
  const hours = Math.floor(minutes / 60) % 24;
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function toRange(interval: AvailabilityInterval) {
  return {
    start: toMinutes(interval.start),
    end: interval.end === '00:00' ? minutesInDay : toMinutes(interval.end)
  };
}

export function isAvailabilityDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000')) return false;
  const value = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date;
}

function validateIntervals(
  intervals: readonly AvailabilityInterval[],
  scope: Pick<AvailabilityIssue, 'day' | 'overrideIndex'>,
  issues: AvailabilityIssue[]
) {
  const valid = intervals.flatMap((interval, intervalIndex) => {
    const { start, end } = toRange(interval);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      issues.push({ ...scope, code: 'time', intervalIndex });
      return [];
    }
    if (start >= end) {
      issues.push({ ...scope, code: 'order', intervalIndex });
      return [];
    }
    return [{ start, end, intervalIndex }];
  });
  valid.sort((left, right) => left.start - right.start);
  let latest = valid[0];

  valid.slice(1).forEach((current) => {
    if (current.start < latest.end) {
      issues.push({
        ...scope,
        code: 'overlap',
        intervalIndex: current.intervalIndex,
        otherIntervalIndex: latest.intervalIndex
      });
    }
    if (current.end > latest.end) latest = current;
  });
}

/** Validates civil times without interpreting them as instants or booking appointments. */
export function validateAvailability(schedule: AvailabilitySchedule): AvailabilityIssue[] {
  const issues: AvailabilityIssue[] = [];
  if (!schedule.timeZone || !isValidTimeZone(schedule.timeZone)) issues.push({ code: 'timeZone' });
  AVAILABILITY_WEEKDAYS.forEach((day) =>
    validateIntervals(schedule.week[day] ?? [], { day }, issues)
  );
  const dates = new Set<string>();
  schedule.overrides.forEach(({ date, intervals }, overrideIndex) => {
    if (!isAvailabilityDate(date)) {
      issues.push({ code: 'date', overrideIndex });
    } else if (dates.has(date)) {
      issues.push({ code: 'duplicateDate', overrideIndex });
    }
    dates.add(date);
    validateIntervals(intervals, { overrideIndex }, issues);
  });
  return issues;
}

export function findOpenAvailabilityInterval(intervals: readonly AvailabilityInterval[]) {
  const sorted = intervals
    .map(toRange)
    .filter(({ start, end }) => start < end)
    .sort((left, right) => left.start - right.start);
  const findGap = (after: number) => {
    let cursor = after;
    for (const { start, end } of sorted) {
      if (cursor < start) return { start: cursor, end: Math.min(start, cursor + 60) };
      cursor = Math.max(cursor, end);
    }
    return cursor < minutesInDay
      ? { start: cursor, end: Math.min(minutesInDay, cursor + 60) }
      : undefined;
  };
  const gap = findGap(9 * 60) ?? findGap(0);
  return gap && { start: toTime(gap.start), end: toTime(gap.end) };
}
