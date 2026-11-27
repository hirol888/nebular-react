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

type DateFnsModule = any;

function translateMomentFormat(formatString: string): string {
  return formatString
    .replace(/YYYY/g, 'yyyy')
    .replace(/YY/g, 'yy')
    .replace(/DD/g, 'dd')
    .replace(/\bA\b/g, 'a');
}

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

function intlName(locale: string, date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Creates an adapter backed by date-fns. The module is injected so date-fns is
 * not a required runtime dependency of the package.
 *
 * Usage:
 *   import * as dateFns from 'date-fns';
 *   const adapter = createDateFnsDateAdapter(dateFns);
 */
export function createDateFnsDateAdapter(dateFns: DateFnsModule): DateAdapter<Date> {
  return createDateAdapter<Date>('date-fns', 'date-fns', (locale = DEFAULT_LOCALE) =>
    createDateFnsDateFns(dateFns, locale)
  );
}

export function createDateFnsDateFns(
  dateFns: DateFnsModule,
  locale: string = DEFAULT_LOCALE
): DateFns<Date> {
  const weekStartsOn = firstDayOfWeek(locale);
  const formatDate = (date: Date, formatString?: string): string =>
    dateFns.format(date, translateMomentFormat(formatString || 'yyyy-MM-dd'), undefined);

  const getYear = (date: Date): number => date.getFullYear();
  const getMonth = (date: Date): number => date.getMonth();
  const getDate = (date: Date): number => date.getDate();
  const getHours = (date: Date): number => date.getHours();
  const getMinutes = (date: Date): number => date.getMinutes();
  const getSeconds = (date: Date): number => date.getSeconds();
  const getMilliseconds = (date: Date): number => date.getMilliseconds();
  const clone = (date: Date): Date => new Date(date.getTime());
  const compareDates = (date1: Date, date2: Date): number =>
    getYear(date1) - getYear(date2) ||
    getMonth(date1) - getMonth(date2) ||
    getDate(date1) - getDate(date2);

  const createDate = (
    year: number,
    month: number,
    date: number,
    _dateType: DateType = 'date-fns'
  ): Date => new Date(year, month, date);

  const parse = (value: string, formatString?: string, _parseTo: DateType = 'date-fns'): Date => {
    try {
      return dateFns.parse(value, translateMomentFormat(formatString || 'yyyy-MM-dd'), new Date());
    } catch {
      return new Date(NaN);
    }
  };

  const today = (_dateType: DateType = 'date-fns'): Date => new Date();

  const isSameDay = (
    date1: Date | undefined | null,
    date2: Date | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameMonth(date1, date2) && getDate(date1) === getDate(date2);

  const isSameMonth = (
    date1: Date | undefined | null,
    date2: Date | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameYear(date1, date2) && getMonth(date1) === getMonth(date2);

  const isSameYear = (
    date1: Date | undefined | null,
    date2: Date | undefined | null
  ): boolean | undefined | null => date1 && date2 && getYear(date1) === getYear(date2);

  const getMonthNameByIndex = (month: number, style: MonthNameStyle = 'short'): string =>
    intlName(locale, new Date(2024, month, 1), { month: style });

  const getDayOfWeekNames = (style: DayOfWeekStyle = 'narrow'): string[] => {
    const intlStyle = style === 'narrow' ? 'narrow' : style;
    return Array.from({ length: 7 }, (_, index) =>
      intlName(locale, new Date(2024, 0, 7 + index), { weekday: intlStyle })
    );
  };

  const api = {
    isBetween: (date: Date, start: Date, end: Date): boolean =>
      compareDates(date, start) > 0 && compareDates(date, end) < 0,
    isSameHourAndMinute: (date1: Date, date2: Date): boolean =>
      getHours(date1) === getHours(date2) && getMinutes(date1) === getMinutes(date2),
    isSameHour: (date1: Date, date2: Date): boolean => getHours(date1) === getHours(date2),
    isSameMinute: (date1: Date, date2: Date): boolean => getMinutes(date1) === getMinutes(date2),
    getTwentyFourHoursFormat: (): string => 'HH:mm',
    getTwentyFourHoursFormatWithSeconds: (): string => 'HH:mm:ss',
    getTwelveHoursFormatWithSeconds: (): string => 'hh:mm:ss A',
    getTwelveHoursFormat: (): string => 'hh:mm A',
    getDayPeriod: (date: Date): DayPeriod => (getHours(date) < HOURS_IN_DAY_PERIOD ? 'AM' : 'PM'),
    getDateFormat: (): string => 'YYYY-MM-DD',
    setHours: (date: Date, hour: number): Date => dateFns.setHours(date, hour),
    setMinutes: (date: Date, minute: number): Date => dateFns.setMinutes(date, minute),
    setSeconds: (date: Date, second: number): Date => dateFns.setSeconds(date, second),
    setMilliseconds: (date: Date, millisecond: number): Date =>
      dateFns.setMilliseconds(date, millisecond),
    addDays: (date: Date, days: number): Date => dateFns.addDays(date, days),
    addMonths: (date: Date, months: number): Date => dateFns.addMonths(date, months),
    addYears: (date: Date, years: number): Date => dateFns.addYears(date, years),
    addHours: (date: Date, hours: number): Date => dateFns.addHours(date, hours),
    addMinutes: (date: Date, minutes: number): Date => dateFns.addMinutes(date, minutes),
    clone,
    getAdapterDateType: (): DateType => 'date-fns',
    valueOf: (date: Date): number => date.valueOf(),
    compareDates,
    createDate,
    getDateType: (_date: Date): DateType => 'date-fns',
    format: formatDate,
    getLocaleTimeFormat: (): string => 'h:mm a',
    getDate,
    getDayOfWeek: (date: Date): number => date.getDay(),
    getDayOfWeekNames,
    getFirstDayOfWeek: (): number => weekStartsOn,
    getMonth,
    getMonthName: (date: Date, style: MonthNameStyle = 'short'): string =>
      getMonthNameByIndex(getMonth(date), style),
    getHours,
    getMinutes,
    getSeconds,
    getMilliseconds,
    getMonthEnd: (date: Date): Date => dateFns.endOfMonth(date),
    getMonthNameByIndex,
    getMonthStart: (date: Date): Date => dateFns.startOfMonth(date),
    getNumberOfDaysInMonth: (date: Date): number => dateFns.getDaysInMonth(date),
    getYear,
    getYearEnd: (date: Date): Date => dateFns.endOfYear(date),
    getYearStart: (date: Date): Date => dateFns.startOfYear(date),
    isSameDay,
    isSameMonth,
    isSameYear,
    isValidDateString: (value: string, formatString?: string): boolean =>
      dateFns.isValid(parse(value, formatString)),
    isValidTimeString: (value: string, formatString: string): boolean => {
      try {
        return dateFns.isValid(
          dateFns.parse(value, translateMomentFormat(formatString), new Date())
        );
      } catch {
        return false;
      }
    },
    parse,
    today,
    getWeekNumber: (date: Date): number => dateFns.getWeek(date, { weekStartsOn })
  };

  return api as DateFns<Date>;
}
