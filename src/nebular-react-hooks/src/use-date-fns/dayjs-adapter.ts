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

type DayjsFactory = any;
type DayjsValue = any;

function isDayjs(dayjs: DayjsFactory, value: unknown): value is DayjsValue {
  return typeof dayjs.isDayjs === 'function'
    ? dayjs.isDayjs(value)
    : !!(value && (value as any).$isDayjsObject);
}

/**
 * Creates an adapter backed by dayjs. The dayjs instance must be configured by
 * the consumer, including the `customParseFormat` plugin when parsing from
 * strings with an explicit format is required.
 */
export function createDayjsDateAdapter(dayjs: DayjsFactory): DateAdapter<any> {
  return createDateAdapter<any>('dayjs', 'dayjs', (locale = DEFAULT_LOCALE) =>
    createDayjsDateFns(dayjs, locale)
  );
}

export function createDayjsDateFns(
  dayjs: DayjsFactory,
  locale: string = DEFAULT_LOCALE
): DateFns<any> {
  const toDayjs = (value: DayjsValue): DayjsValue =>
    isDayjs(dayjs, value) ? value : dayjs(value as any);

  const getLocale = (): any => dayjs.Ls?.[locale] ?? dayjs.Ls?.en ?? {};

  const getMonths = (): string[] => getLocale().months ?? [];

  const getMonthsShort = (): string[] =>
    getLocale().monthsShort ?? getMonths().map((month) => month.slice(0, 3));

  const getWeekdays = (): string[] => getLocale().weekdays ?? [];

  const getWeekdaysShort = (): string[] =>
    getLocale().weekdaysShort ?? getWeekdays().map((day) => day.slice(0, 3));

  const getWeekdaysMin = (): string[] =>
    getLocale().weekdaysMin ?? getWeekdays().map((day) => day.slice(0, 2));

  const defaultFormat = (): string => getLocale().formats?.L ?? 'MM/DD/YYYY';

  const localeTimeFormat = (): string => getLocale().formats?.LT ?? 'h:mm A';

  const getDate = (date: DayjsValue): number => toDayjs(date).date();

  const getMonth = (date: DayjsValue): number => toDayjs(date).month();

  const getYear = (date: DayjsValue): number => toDayjs(date).year();

  const getHours = (date: DayjsValue): number => toDayjs(date).hour();

  const getMinutes = (date: DayjsValue): number => toDayjs(date).minute();

  const getSeconds = (date: DayjsValue): number => toDayjs(date).second();

  const getMilliseconds = (date: DayjsValue): number => toDayjs(date).millisecond();

  const clone = (date: DayjsValue): DayjsValue => toDayjs(date).clone().locale(locale);

  const compareDates = (date1: DayjsValue, date2: DayjsValue): number =>
    getYear(date1) - getYear(date2) ||
    getMonth(date1) - getMonth(date2) ||
    getDate(date1) - getDate(date2);

  const createDate = (
    year: number,
    month: number,
    date: number,
    _dateType: DateType = 'dayjs'
  ): DayjsValue => dayjs(new Date(year, month, date));

  const parse = (date: string, formatString?: string, _parseTo: DateType = 'dayjs'): DayjsValue =>
    dayjs(date, formatString || defaultFormat());

  const today = (_dateType: DateType = 'dayjs'): DayjsValue => dayjs();

  const isSameDay = (
    date1: DayjsValue | undefined | null,
    date2: DayjsValue | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameMonth(date1, date2) && getDate(date1) === getDate(date2);

  const isSameMonth = (
    date1: DayjsValue | undefined | null,
    date2: DayjsValue | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameYear(date1, date2) && getMonth(date1) === getMonth(date2);

  const isSameYear = (
    date1: DayjsValue | undefined | null,
    date2: DayjsValue | undefined | null
  ): boolean | undefined | null => date1 && date2 && getYear(date1) === getYear(date2);

  const getMonthNameByIndex = (month: number, style: MonthNameStyle = 'short'): string => {
    const months = style === 'long' ? getMonths() : getMonthsShort();
    return months[month];
  };

  const api = {
    isBetween: (date: DayjsValue, start: DayjsValue, end: DayjsValue): boolean =>
      compareDates(date, start) > 0 && compareDates(date, end) < 0,
    isSameHourAndMinute: (date1: DayjsValue, date2: DayjsValue): boolean =>
      getHours(date1) === getHours(date2) && getMinutes(date1) === getMinutes(date2),
    isSameHour: (date1: DayjsValue, date2: DayjsValue): boolean =>
      getHours(date1) === getHours(date2),
    isSameMinute: (date1: DayjsValue, date2: DayjsValue): boolean =>
      getMinutes(date1) === getMinutes(date2),
    getTwentyFourHoursFormat: (): string => 'HH:mm',
    getTwentyFourHoursFormatWithSeconds: (): string => 'HH:mm:ss',
    getTwelveHoursFormatWithSeconds: (): string => 'hh:mm:ss A',
    getTwelveHoursFormat: (): string => 'hh:mm A',
    getDayPeriod: (date: DayjsValue): DayPeriod =>
      getHours(date) < HOURS_IN_DAY_PERIOD ? 'AM' : 'PM',
    getDateFormat: (): string => 'YYYY-MM-DD',
    setHours: (date: DayjsValue, hour: number): DayjsValue => toDayjs(date).set('hour', hour),
    setMinutes: (date: DayjsValue, minute: number): DayjsValue =>
      toDayjs(date).set('minute', minute),
    setSeconds: (date: DayjsValue, second: number): DayjsValue =>
      toDayjs(date).set('second', second),
    setMilliseconds: (date: DayjsValue, millisecond: number): DayjsValue =>
      toDayjs(date).set('millisecond', millisecond),
    addDays: (date: DayjsValue, days: number): DayjsValue => toDayjs(date).add(days, 'day'),
    addMonths: (date: DayjsValue, months: number): DayjsValue => toDayjs(date).add(months, 'month'),
    addYears: (date: DayjsValue, years: number): DayjsValue => toDayjs(date).add(years, 'year'),
    addHours: (date: DayjsValue, hours: number): DayjsValue => toDayjs(date).add(hours, 'hour'),
    addMinutes: (date: DayjsValue, minutes: number): DayjsValue =>
      toDayjs(date).add(minutes, 'minute'),
    clone,
    getAdapterDateType: (): DateType => 'dayjs',
    valueOf: (date: DayjsValue): number => toDayjs(date).valueOf(),
    compareDates,
    createDate,
    getDateType: (_date: DayjsValue): DateType => 'dayjs',
    format: (date: DayjsValue, formatString?: string): string =>
      date ? toDayjs(date).format(formatString || defaultFormat()) : '',
    getLocaleTimeFormat: (): string => localeTimeFormat(),
    getDate,
    getDayOfWeek: (date: DayjsValue): number => toDayjs(date).day(),
    getDayOfWeekNames: (style: DayOfWeekStyle = 'narrow'): string[] => {
      if (style === 'long') return getWeekdays();
      if (style === 'short') return getWeekdaysShort();
      return getWeekdaysMin();
    },
    getFirstDayOfWeek: (): number => getLocale().weekStart ?? 0,
    getMonth,
    getMonthName: (date: DayjsValue, style: MonthNameStyle = 'short'): string =>
      getMonthNameByIndex(getMonth(date), style),
    getHours,
    getMinutes,
    getSeconds,
    getMilliseconds,
    getMonthEnd: (date: DayjsValue): DayjsValue => toDayjs(date).endOf('month'),
    getMonthNameByIndex,
    getMonthStart: (date: DayjsValue): DayjsValue => toDayjs(date).startOf('month'),
    getNumberOfDaysInMonth: (date: DayjsValue): number => toDayjs(date).daysInMonth(),
    getYear,
    getYearEnd: (date: DayjsValue): DayjsValue => toDayjs(date).endOf('year'),
    getYearStart: (date: DayjsValue): DayjsValue => toDayjs(date).startOf('year'),
    isSameDay,
    isSameMonth,
    isSameYear,
    isValidDateString: (date: string, formatString?: string): boolean =>
      dayjs(date, formatString || defaultFormat(), true).isValid(),
    isValidTimeString: (date: string, formatString: string): boolean =>
      dayjs(date, formatString, true).isValid(),
    parse,
    today,
    getWeekNumber: (date: DayjsValue): number => toDayjs(date).week()
  };

  return api as DateFns<any>;
}
