export type DateFieldSegment = 'day' | 'month' | 'year';
export type DateFieldParts = Record<DateFieldSegment, string>;
export type DateFieldIssue = 'required' | 'incomplete' | 'invalid' | 'bounds';

export const segmentLengths = { day: 2, month: 2, year: 4 };

const emptyParts = { year: '', month: '', day: '' };
const isoPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseParts(value: string | null): DateFieldParts {
  const match = value?.match(isoPattern);
  return match ? { year: match[1], month: match[2], day: match[3] } : emptyParts;
}

export function maxSegmentValue(segment: DateFieldSegment, parts: DateFieldParts): number {
  if (segment === 'year') return 9999;
  if (segment === 'month') return 12;

  const month = Number(parts.month);
  if (month === 2) {
    const year = Number(parts.year) || 2000;
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function validateParts(
  parts: DateFieldParts,
  required: boolean,
  min?: string,
  max?: string
): { value: string | null; issue?: DateFieldIssue } {
  const { year, month, day } = parts;
  if (!year && !month && !day) {
    return { value: null, issue: required ? 'required' : undefined };
  }
  if (year.length < 4 || !month || !day) {
    return { value: null, issue: 'incomplete' };
  }
  const value = [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  if (
    !Number(year) ||
    Number(month) < 1 ||
    Number(month) > 12 ||
    Number(day) < 1 ||
    Number(day) > maxSegmentValue('day', parts)
  ) {
    return { value: null, issue: 'invalid' };
  }
  if ((min && value < min) || (max && value > max)) {
    return { value: null, issue: 'bounds' };
  }
  return { value };
}

export function isDateFieldSegment(part: string): part is DateFieldSegment {
  return part === 'day' || part === 'month' || part === 'year';
}

export function dateFieldFormat(locale: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'gregory',
    timeZone: 'UTC'
  };
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat(locale, options);
  } catch {
    formatter = new Intl.DateTimeFormat('en-US', options);
  }
  const { locale: resolvedLocale, numberingSystem } = formatter.resolvedOptions();
  const digitFormatter = new Intl.NumberFormat(resolvedLocale, { numberingSystem });
  const digits = Array.from({ length: 10 }, (_, digit) => digitFormatter.format(digit));
  const localToAscii = new Map(digits.map((digit, index) => [digit, String(index)]));

  return {
    parts: formatter.formatToParts(new Date(Date.UTC(2000, 0, 2))),
    translate: (text: string) => Array.from(text, (digit) => digits[Number(digit)]).join(''),
    normalize: (text: string) =>
      Array.from(text, (digit) => localToAscii.get(digit) ?? digit).join('')
  };
}

export function incrementPart(
  parts: DateFieldParts,
  segment: DateFieldSegment,
  delta: number
): DateFieldParts {
  const max = maxSegmentValue(segment, parts);
  const current = Number(parts[segment]);
  const number = current + delta;
  const value =
    !current && segment === 'year'
      ? new Date().getFullYear()
      : number > max
        ? 1
        : number < 1
          ? max
          : number;
  const next = { ...parts, [segment]: String(value).padStart(segmentLengths[segment], '0') };
  const maxDay = maxSegmentValue('day', next);
  if (segment !== 'day' && Number(next.day) > maxDay) {
    next.day = String(maxDay);
  }
  return next;
}
