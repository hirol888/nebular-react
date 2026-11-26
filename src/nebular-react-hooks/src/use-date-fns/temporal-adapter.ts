import {
  createDateAdapter,
  DateAdapter,
  DateFns,
  DateType,
  DayPeriod,
  DayOfWeekStyle,
  DEFAULT_LOCALE,
  HOURS_IN_DAY_PERIOD,
  MonthNameStyle
} from './use-date-fns';

type TemporalNamespace = any;
type PlainDateTime = any;

const TOKEN_PATTERN = /YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a/g;

const TOKEN_REGEX: Record<string, string> = {
  YYYY: '(\\d{4})',
  YY: '(\\d{2})',
  MM: '(\\d{2})',
  M: '(\\d{1,2})',
  DD: '(\\d{2})',
  D: '(\\d{1,2})',
  HH: '(\\d{2})',
  H: '(\\d{1,2})',
  hh: '(\\d{2})',
  h: '(\\d{1,2})',
  mm: '(\\d{2})',
  m: '(\\d{1,2})',
  ss: '(\\d{2})',
  s: '(\\d{1,2})',
  A: '(AM|PM|am|pm)',
  a: '(am|pm|AM|PM)'
};

function firstDayOfWeek(locale: string): number {
  try {
    const weekInfo = (Intl as any).Locale ? new (Intl as any).Locale(locale).getWeekInfo?.() : null;
    if (weekInfo?.firstDay) {
      return weekInfo.firstDay % 7;
    }
  } catch {
    // Ignore environments without Intl.Locale week info.
  }

  return locale.toLowerCase().startsWith('en-us') ? 0 : 1;
}

function pad(value: number, size = 2): string {
  return String(value).padStart(size, '0');
}

/**
 * Creates an adapter backed by the Temporal API. The Temporal namespace is
 * injected so a polyfill is not a required runtime dependency of the package.
 *
 * Usage:
 *   import { Temporal } from '@js-temporal/polyfill';
 *   const adapter = createTemporalDateAdapter(Temporal);
 */
export function createTemporalDateAdapter(Temporal: TemporalNamespace): DateAdapter<PlainDateTime> {
  return createDateAdapter<PlainDateTime>('temporal', 'temporal', (locale = DEFAULT_LOCALE) =>
    createTemporalDateFns(Temporal, locale)
  );
}

export function createTemporalDateFns(
  Temporal: TemporalNamespace,
  locale: string = DEFAULT_LOCALE
): DateFns<PlainDateTime> {
  const getYear = (date: PlainDateTime): number => date.year;
  const getMonth = (date: PlainDateTime): number => date.month - 1;
  const getDate = (date: PlainDateTime): number => date.day;
  const getHours = (date: PlainDateTime): number => date.hour;
  const getMinutes = (date: PlainDateTime): number => date.minute;
  const getSeconds = (date: PlainDateTime): number => date.second;
  const getMilliseconds = (date: PlainDateTime): number => date.millisecond;

  const createDate = (
    year: number,
    month: number,
    date: number,
    _dateType: DateType = 'temporal'
  ): PlainDateTime =>
    Temporal.PlainDateTime.from({
      year,
      month: month + 1,
      day: date
    });

  const today = (_dateType: DateType = 'temporal'): PlainDateTime =>
    Temporal.Now.plainDateTimeISO();

  const clone = (date: PlainDateTime): PlainDateTime => date;

  const compareDates = (date1: PlainDateTime, date2: PlainDateTime): number =>
    getYear(date1) - getYear(date2) ||
    getMonth(date1) - getMonth(date2) ||
    getDate(date1) - getDate(date2);

  const format = (date: PlainDateTime, formatString = 'YYYY-MM-DD'): string => {
    if (!date) {
      return '';
    }

    const replacements: Record<string, string> = {
      YYYY: pad(date.year, 4),
      YY: pad(date.year % 100),
      MM: pad(date.month),
      M: String(date.month),
      DD: pad(date.day),
      D: String(date.day),
      HH: pad(date.hour),
      H: String(date.hour),
      hh: pad(date.hour % 12 || 12),
      h: String(date.hour % 12 || 12),
      mm: pad(date.minute),
      m: String(date.minute),
      ss: pad(date.second),
      s: String(date.second),
      A: date.hour < HOURS_IN_DAY_PERIOD ? 'AM' : 'PM',
      a: date.hour < HOURS_IN_DAY_PERIOD ? 'am' : 'pm'
    };

    return formatString.replace(TOKEN_PATTERN, (token) => replacements[token] ?? token);
  };

  const parse = (
    value: string,
    formatString = 'YYYY-MM-DD',
    _parseTo: DateType = 'temporal'
  ): PlainDateTime | null => {
    const tokens: string[] = [];
    const regexSource = formatString.replace(TOKEN_PATTERN, (token) => {
      tokens.push(token);
      return TOKEN_REGEX[token] ?? token;
    });

    const match = value.match(new RegExp(`^${regexSource}$`));

    if (!match) {
      try {
        return Temporal.PlainDateTime.from(value);
      } catch {
        return null;
      }
    }

    const now = today();
    const fields: Record<string, number> = {
      year: now.year,
      month: now.month,
      day: now.day,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    };
    let dayPeriod: string | null = null;

    tokens.forEach((token, index) => {
      const raw = match[index + 1];

      if (!raw) {
        return;
      }

      switch (token) {
        case 'YYYY':
          fields.year = Number(raw);
          break;
        case 'YY':
          fields.year = 2000 + Number(raw);
          break;
        case 'MM':
        case 'M':
          fields.month = Number(raw);
          break;
        case 'DD':
        case 'D':
          fields.day = Number(raw);
          break;
        case 'HH':
        case 'H':
        case 'hh':
        case 'h':
          fields.hour = Number(raw);
          break;
        case 'mm':
        case 'm':
          fields.minute = Number(raw);
          break;
        case 'ss':
        case 's':
          fields.second = Number(raw);
          break;
        case 'A':
        case 'a':
          dayPeriod = raw.toUpperCase();
          break;
        default:
          break;
      }
    });

    if (dayPeriod) {
      if (fields.hour === 12) {
        fields.hour = dayPeriod === 'AM' ? 0 : 12;
      } else if (dayPeriod === 'PM') {
        fields.hour += 12;
      }
    }

    try {
      return Temporal.PlainDateTime.from(fields);
    } catch {
      return null;
    }
  };

  const isSameDay = (
    date1: PlainDateTime | undefined | null,
    date2: PlainDateTime | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameMonth(date1, date2) && getDate(date1) === getDate(date2);

  const isSameMonth = (
    date1: PlainDateTime | undefined | null,
    date2: PlainDateTime | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameYear(date1, date2) && getMonth(date1) === getMonth(date2);

  const isSameYear = (
    date1: PlainDateTime | undefined | null,
    date2: PlainDateTime | undefined | null
  ): boolean | undefined | null => date1 && date2 && getYear(date1) === getYear(date2);

  const getMonthNameByIndex = (month: number, style: MonthNameStyle = 'short'): string =>
    new Intl.DateTimeFormat(locale, { month: style }).format(new Date(2024, month, 1));

  const getDayOfWeekNames = (style: DayOfWeekStyle = 'narrow'): string[] =>
    Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat(locale, { weekday: style }).format(new Date(2024, 0, 7 + index))
    );

  const getWeekNumber = (date: PlainDateTime): number => {
    const target = new Date(Date.UTC(date.year, date.month - 1, date.day));
    const dayNumber = (target.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNumber + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);

    return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
  };

  const api = {
    isBetween: (date: PlainDateTime, start: PlainDateTime, end: PlainDateTime): boolean =>
      compareDates(date, start) > 0 && compareDates(date, end) < 0,
    isSameHourAndMinute: (date1: PlainDateTime, date2: PlainDateTime): boolean =>
      getHours(date1) === getHours(date2) && getMinutes(date1) === getMinutes(date2),
    isSameHour: (date1: PlainDateTime, date2: PlainDateTime): boolean =>
      getHours(date1) === getHours(date2),
    isSameMinute: (date1: PlainDateTime, date2: PlainDateTime): boolean =>
      getMinutes(date1) === getMinutes(date2),
    getTwentyFourHoursFormat: (): string => 'HH:mm',
    getTwentyFourHoursFormatWithSeconds: (): string => 'HH:mm:ss',
    getTwelveHoursFormatWithSeconds: (): string => 'hh:mm:ss A',
    getTwelveHoursFormat: (): string => 'hh:mm A',
    getDayPeriod: (date: PlainDateTime): DayPeriod =>
      getHours(date) < HOURS_IN_DAY_PERIOD ? 'AM' : 'PM',
    getDateFormat: (): string => 'YYYY-MM-DD',
    setHours: (date: PlainDateTime, hour: number): PlainDateTime => date.with({ hour }),
    setMinutes: (date: PlainDateTime, minute: number): PlainDateTime => date.with({ minute }),
    setSeconds: (date: PlainDateTime, second: number): PlainDateTime => date.with({ second }),
    setMilliseconds: (date: PlainDateTime, millisecond: number): PlainDateTime =>
      date.with({ millisecond }),
    addDays: (date: PlainDateTime, days: number): PlainDateTime => date.add({ days }),
    addMonths: (date: PlainDateTime, months: number): PlainDateTime => date.add({ months }),
    addYears: (date: PlainDateTime, years: number): PlainDateTime => date.add({ years }),
    addHours: (date: PlainDateTime, hours: number): PlainDateTime => date.add({ hours }),
    addMinutes: (date: PlainDateTime, minutes: number): PlainDateTime => date.add({ minutes }),
    clone,
    getAdapterDateType: (): DateType => 'temporal',
    valueOf: (date: PlainDateTime): number =>
      Date.UTC(
        date.year,
        date.month - 1,
        date.day,
        date.hour,
        date.minute,
        date.second,
        date.millisecond
      ),
    compareDates,
    createDate,
    getDateType: (_date: PlainDateTime): DateType => 'temporal',
    format,
    getLocaleTimeFormat: (): string => 'h:mm a',
    getDate,
    getDayOfWeek: (date: PlainDateTime): number => date.dayOfWeek % 7,
    getDayOfWeekNames,
    getFirstDayOfWeek: (): number => firstDayOfWeek(locale),
    getMonth,
    getMonthName: (date: PlainDateTime, style: MonthNameStyle = 'short'): string =>
      getMonthNameByIndex(getMonth(date), style),
    getHours,
    getMinutes,
    getSeconds,
    getMilliseconds,
    getMonthEnd: (date: PlainDateTime): PlainDateTime =>
      date.with({ day: date.daysInMonth, hour: 23, minute: 59, second: 59, millisecond: 999 }),
    getMonthNameByIndex,
    getMonthStart: (date: PlainDateTime): PlainDateTime =>
      date.with({ day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }),
    getNumberOfDaysInMonth: (date: PlainDateTime): number => date.daysInMonth,
    getYear,
    getYearEnd: (date: PlainDateTime): PlainDateTime =>
      date.with({
        month: 12,
        day: 31,
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999
      }),
    getYearStart: (date: PlainDateTime): PlainDateTime =>
      date.with({ month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }),
    isSameDay,
    isSameMonth,
    isSameYear,
    isValidDateString: (value: string, formatString?: string): boolean =>
      !!parse(value, formatString),
    isValidTimeString: (value: string, formatString: string): boolean =>
      !!parse(value, formatString),
    parse,
    today,
    getWeekNumber
  };

  return api as DateFns<PlainDateTime>;
}
