import type { ReactNode } from 'react';
import type { Moment } from 'moment';

export type SchedulerView = 'day' | 'week' | 'month';

export type SchedulerRecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface SchedulerRecurrence {
  frequency: SchedulerRecurrenceFrequency;
  /** Number of units between occurrences. Defaults to 1. */
  interval?: number;
  /** Total number of occurrences, including the first one. */
  count?: number;
  /**
   * Last occurrence start. Date-only strings (`YYYY-MM-DD`) are inclusive of
   * the whole day, while date-time strings are parsed as regular instants.
   */
  until?: Date | string;
}

/**
 * A bookable/ownable lane of the Scheduler. Lanes replace the plain time grid
 * in the day/week views when `resourceView` is enabled.
 */
export interface SchedulerResource {
  id: string;
  name: string;
  color?: string;
}

export interface SchedulerEvent<TDate extends Date | Moment = Date> {
  id: string | number;
  title: ReactNode;
  start: TDate;
  end?: TDate;
  allDay?: boolean;
  color?: string;
  /** Resource lane this event belongs to (used by `resourceView`). */
  resourceId?: string;
  data?: unknown;
  /**
   * IANA time zone used to display and edit this event, e.g. `America/New_York`.
   *
   * The event stays stored as an absolute instant; the wall clock of this zone
   * is used for placement, labels and recurrence expansion (so DST is
   * respected). Consumers receive absolute values back through the callbacks.
   */
  timeZone?: string;
  /**
   * Recurrence rule expanded by the Scheduler in every view. Edits to an
   * occurrence never rewrite the series; the callbacks report the original
   * event plus the occurrence range.
   */
  recurrence?: SchedulerRecurrence;
}

export interface SchedulerEventRange<TDate extends Date | Moment = Date> {
  start: TDate;
  end: TDate;
}

export interface SchedulerDateRange<TDate extends Date | Moment = Date> {
  start: TDate;
  end: TDate;
}

/**
 * A single occurrence produced by `expandRecurrence`.
 *
 * `originalEvent` always points at the event passed by the consumer (the
 * series), while `occ...`/`start`/`end` describe the occurrence itself.
 */
export interface SchedulerOccurrence<TDate extends Date | Moment = Date> {
  /** Stable key: `<event id>` for single events and `<event id>@<timestamp>` for series. */
  key: string;
  eventId: string | number;
  originalEvent: SchedulerEvent<TDate>;
  /** Start of the series (the first occurrence). */
  originalStart: TDate;
  /** Alias of `start`, useful when a callback needs the occurrence instant. */
  occurrenceStart: TDate;
  occurrenceEnd?: TDate;
  /** Start of this occurrence. */
  start: TDate;
  /** End of this occurrence (when the event has an end). */
  end?: TDate;
  /** Zero-based position of the occurrence inside the series. */
  index: number;
  isRecurring: boolean;
}
