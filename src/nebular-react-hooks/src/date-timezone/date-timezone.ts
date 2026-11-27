const formatterCache = new Map<string, Intl.DateTimeFormat>();

interface TimeZoneParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  formatterCache.set(timeZone, formatter);
  return formatter;
}

function getParts(date: Date, timeZone: string): TimeZoneParts {
  const parts = getFormatter(timeZone).formatToParts(date);
  const values: Record<string, number> = {};

  parts.forEach((part) => {
    if (part.type !== 'literal') {
      values[part.type] = Number(part.value);
    }
  });

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour % 24,
    minute: values.minute,
    second: values.second
  };
}

/**
 * Returns whether the given IANA time zone is supported by the runtime.
 */
export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) {
    return false;
  }

  try {
    getFormatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the offset (in milliseconds) between the given time zone and UTC at
 * the provided instant. Positive values are east of UTC.
 */
export function getTimeZoneOffset(date: Date, timeZone: string): number {
  if (!isValidTimeZone(timeZone)) {
    return 0;
  }

  const parts = getParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    date.getMilliseconds()
  );

  return asUtc - date.getTime();
}

/**
 * Converts an absolute instant into a Date whose local getters represent the
 * wall clock of the given time zone. Useful for formatting/calendar UIs.
 */
export function toTimeZone(date: Date, timeZone: string): Date {
  if (!isValidTimeZone(timeZone)) {
    return new Date(date.getTime());
  }

  const parts = getParts(date, timeZone);

  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    date.getMilliseconds()
  );
}

/**
 * Converts a Date whose local getters represent a wall clock in the given time
 * zone back into an absolute instant.
 */
export function fromTimeZone(date: Date, timeZone: string): Date {
  if (!isValidTimeZone(timeZone)) {
    return new Date(date.getTime());
  }

  const wallClockAsUtc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );

  const sameWallClock = (candidate: Date): boolean => {
    const wall = getParts(candidate, timeZone);

    return (
      wall.year === date.getFullYear() &&
      wall.month - 1 === date.getMonth() &&
      wall.day === date.getDate() &&
      wall.hour === date.getHours() &&
      wall.minute === date.getMinutes() &&
      wall.second === date.getSeconds()
    );
  };

  const firstOffset = getTimeZoneOffset(new Date(wallClockAsUtc), timeZone);
  const first = new Date(wallClockAsUtc - firstOffset);

  if (sameWallClock(first)) {
    return first;
  }

  const secondOffset = getTimeZoneOffset(first, timeZone);

  if (secondOffset !== firstOffset) {
    const second = new Date(wallClockAsUtc - secondOffset);

    if (sameWallClock(second)) {
      return second;
    }
  }

  // Non-existent wall time (DST spring forward): keep the pre-transition offset,
  // which normalizes the value forward (e.g. 02:30 -> 03:30).
  return first;
}
