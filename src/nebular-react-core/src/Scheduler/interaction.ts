import type { DateFns } from '@nebular-react/hooks';
import type { Moment } from 'moment';
import type { SchedulerDateRange } from './types';

export const MINUTES_PER_DAY = 24 * 60;
export const DEFAULT_EVENT_DURATION_MINUTES = 30;
export const DEFAULT_SNAP_MINUTES = 15;

export interface SchedulerDragGeometry {
  minuteDelta: number;
  dayDelta: number;
  dayCount: number;
  sourceDayIndex: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeSnapMinutes(value?: number): number {
  const snap = Math.floor(Number(value));

  return Number.isFinite(snap) && snap > 0 ? snap : DEFAULT_SNAP_MINUTES;
}

/** Default duration used when a selection is created from a simple click. */
export function normalizeDefaultDurationMinutes(value?: number): number {
  const minutes = Math.floor(Number(value));

  return Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_EVENT_DURATION_MINUTES;
}

/** Rounds an amount of minutes to the closest multiple of `snapMinutes`. */
export function snapToStep(value: number, snapMinutes?: number): number {
  const snap = normalizeSnapMinutes(snapMinutes);

  return Math.round(value / snap) * snap;
}

export function getMinutesOfDay<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  date: TDate
): number {
  return dateFns.getHours(date) * 60 + dateFns.getMinutes(date) + dateFns.getSeconds(date) / 60;
}

export function startOfDay<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  date: TDate
): TDate {
  return dateFns.createDate(
    dateFns.getYear(date),
    dateFns.getMonth(date),
    dateFns.getDate(date),
    dateFns.getDateType(date)
  );
}

/**
 * Builds a wall-clock time from a day and a minute offset using the date
 * components instead of adding real milliseconds. This keeps the wall clock
 * stable across DST transitions (e.g. 09:00 stays 09:00 on the spring-forward
 * day, even though the day is 23 hours long).
 */
export function createWallTime<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  day: TDate,
  minutes: number
): TDate {
  const dayStart = startOfDay(dateFns, day);
  const hour = Math.floor(minutes / 60);
  const minute = Math.round(minutes % 60);

  return dateFns.setMinutes(dateFns.setHours(dayStart, hour), minute);
}

/** Adds wall-clock minutes, rolling into following days when necessary. */
export function addWallMinutes<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  date: TDate,
  minutes: number
): TDate {
  const startMinutes = Math.round(getMinutesOfDay(dateFns, date));
  const total = startMinutes + minutes;
  const dayOffset = Math.floor(total / MINUTES_PER_DAY);
  const rest = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const day = dateFns.addDays(startOfDay(dateFns, date), dayOffset);

  return createWallTime(dateFns, day, rest);
}

/** Duration in wall-clock minutes, defaulting to 30 minutes for open events. */
export function getWallDurationMinutes<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  start: TDate,
  end?: TDate
): number {
  if (!end) {
    return DEFAULT_EVENT_DURATION_MINUTES;
  }

  const duration = (dateFns.valueOf(end) - dateFns.valueOf(start)) / 60000;

  if (!Number.isFinite(duration) || duration <= 0) {
    return DEFAULT_EVENT_DURATION_MINUTES;
  }

  return Math.max(1, Math.round(duration));
}

/** Normalizes an event range so edits always have a positive duration. */
export function normalizeInteractionRange<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  start: TDate,
  end: TDate | undefined,
  snapMinutes?: number
): SchedulerDateRange<TDate> {
  const snap = normalizeSnapMinutes(snapMinutes);
  const duration = Math.max(getWallDurationMinutes(dateFns, start, end), snap);

  return {
    start,
    end: addWallMinutes(dateFns, start, duration)
  };
}

/**
 * Moves an event by a snapped vertical delta and by whole days (week view).
 * The event never starts before the beginning of the target day nor ends after
 * it, which keeps a drag from silently changing the duration.
 */
export function moveEvent<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  range: SchedulerDateRange<TDate>,
  geometry: SchedulerDragGeometry
): SchedulerDateRange<TDate> {
  const duration = getWallDurationMinutes(dateFns, range.start, range.end);
  const dayCount = Math.max(1, geometry.dayCount);
  const targetIndex = clamp(geometry.sourceDayIndex + geometry.dayDelta, 0, dayCount - 1);
  const dayOffset = targetIndex - geometry.sourceDayIndex;
  const startMinutes = Math.round(getMinutesOfDay(dateFns, range.start)) + geometry.minuteDelta;
  const clampedStart = clamp(startMinutes, 0, Math.max(0, MINUTES_PER_DAY - duration));
  const dayStart = dateFns.addDays(startOfDay(dateFns, range.start), dayOffset);
  const nextStart = createWallTime(dateFns, dayStart, clampedStart);

  return {
    start: nextStart,
    end: addWallMinutes(dateFns, nextStart, duration)
  };
}

/**
 * Resizes the end edge of an event. The end is snapped to the grid, cannot be
 * before `start + snapMinutes` and cannot pass the end of the day.
 */
export function resizeEvent<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  range: SchedulerDateRange<TDate>,
  minuteDelta: number,
  snapMinutes?: number
): SchedulerDateRange<TDate> {
  const snap = normalizeSnapMinutes(snapMinutes);
  const startMinutes = Math.round(getMinutesOfDay(dateFns, range.start));
  const sameDay = !!dateFns.isSameDay(range.start, range.end);
  const endMinutes = sameDay ? Math.round(getMinutesOfDay(dateFns, range.end)) : MINUTES_PER_DAY;
  const nextEndMinutes = clamp(
    snapToStep(endMinutes + minuteDelta, snap),
    startMinutes + snap,
    MINUTES_PER_DAY
  );
  const nextEnd = createWallTime(dateFns, startOfDay(dateFns, range.start), nextEndMinutes);

  return {
    start: range.start,
    end: nextEnd
  };
}

/**
 * Difference in calendar days between two values, ignoring the time of day.
 * Always returns at least 1 so all-day ranges keep a positive span.
 */
export function getWallDaySpan<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  start: TDate,
  end?: TDate
): number {
  if (!end) {
    return 1;
  }

  const from = Date.UTC(dateFns.getYear(start), dateFns.getMonth(start), dateFns.getDate(start));
  const to = Date.UTC(dateFns.getYear(end), dateFns.getMonth(end), dateFns.getDate(end));
  const days = Math.round((to - from) / 86400000);

  return Math.max(1, days);
}

/**
 * Moves an all-day range horizontally by whole days, preserving its duration
 * in (calendar) days and clamping it to the visible days of the view.
 */
export function moveAllDayRange<TDate extends Date | Moment>(
  dateFns: DateFns<TDate>,
  range: SchedulerDateRange<TDate>,
  dayDelta: number,
  dayCount = 1,
  sourceDayIndex = 0
): SchedulerDateRange<TDate> {
  const durationDays = getWallDaySpan(dateFns, range.start, range.end);
  const total = Math.max(1, Math.floor(dayCount));
  const targetIndex = clamp(sourceDayIndex + Math.round(dayDelta), 0, total - 1);
  const dayOffset = targetIndex - sourceDayIndex;
  const nextStart = dateFns.addDays(startOfDay(dateFns, range.start), dayOffset);

  return {
    start: nextStart,
    end: dateFns.addDays(nextStart, durationDays)
  };
}
