import { Moment } from 'moment';
import { fromTimeZone, getTimeZoneOffset, isValidTimeZone, toTimeZone } from '@nebular-react/hooks';

function shift<TDate extends Date | Moment>(
  date: TDate,
  timeZone: string,
  direction: 'to' | 'from'
): TDate {
  if (date instanceof Date) {
    return (
      direction === 'to' ? toTimeZone(date, timeZone) : fromTimeZone(date, timeZone)
    ) as TDate;
  }

  if (direction === 'to') {
    const offsetMinutes = getTimeZoneOffset(date.toDate(), timeZone) / 60000;
    return date.clone().utcOffset(offsetMinutes) as TDate;
  }

  const wall = new Date(
    date.year(),
    date.month(),
    date.date(),
    date.hour(),
    date.minute(),
    date.second(),
    date.millisecond()
  );
  const instant = fromTimeZone(wall, timeZone);

  return date.clone().add(instant.getTime() - date.valueOf(), 'milliseconds') as TDate;
}

/**
 * Converts an absolute value into a wall-clock value in the given time zone.
 * Moment values keep their type; Date values stay native Dates.
 */
export function shiftToTimeZone<TDate extends Date | Moment>(
  date: TDate | null | undefined,
  timeZone?: string
): TDate | null | undefined {
  if (!date || !timeZone || !isValidTimeZone(timeZone)) {
    return date;
  }

  return shift(date, timeZone, 'to');
}

/**
 * Converts a wall-clock value in the given time zone back into an absolute
 * value. Moment values keep their type; Date values stay native Dates.
 */
export function shiftFromTimeZone<TDate extends Date | Moment>(
  date: TDate | null | undefined,
  timeZone?: string
): TDate | null | undefined {
  if (!date || !timeZone || !isValidTimeZone(timeZone)) {
    return date;
  }

  return shift(date, timeZone, 'from');
}
