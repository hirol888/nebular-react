import moment, { LongDateFormatKey, Moment } from 'moment';

export const TIME_ONLY_FORMAT_KEY: LongDateFormatKey = 'LT';
export const DEFAULT_LOCALE = 'en-US';
export type DayPeriod = 'AM' | 'PM';
export type DayOfWeekStyle = 'long' | 'short' | 'narrow';
export type MonthNameStyle = 'long' | 'short';
export type DateType = 'moment' | 'native';

export const DAYS_IN_WEEK = 7;
export const HOURS_IN_DAY_PERIOD = 12;

const { isMoment } = moment;

type MomentLocaleData = {
  firstDayOfWeek: number;
  defaultFormat: string;
  months: { [key: string]: string[] };
  days: { [key: string]: string[] };
};

export function useDateFns<TDate extends Date | Moment>(locale: string = DEFAULT_LOCALE) {
  const localeData = (): MomentLocaleData => {
    const momentLocaleDate = moment.localeData(locale);
    return {
      firstDayOfWeek: momentLocaleDate.firstDayOfWeek(),
      defaultFormat: momentLocaleDate.longDateFormat('L'),
      months: {
        short: momentLocaleDate.monthsShort(),
        long: momentLocaleDate.months()
      },
      days: {
        long: momentLocaleDate.weekdays(),
        short: momentLocaleDate.weekdaysShort(),
        narrow: momentLocaleDate.weekdaysMin()
      }
    };
  };
  /**
   * Checks if the date is between the start date and the end date.
   * */
  const isBetween = (date: TDate, start: TDate, end: TDate): boolean =>
    compareDates(date, start) > 0 && compareDates(date, end) < 0;

  const isSameHourAndMinute = (date1: TDate, date2: TDate): boolean =>
    isSameHour(date1, date2) && isSameMinute(date1, date2);

  const isSameHour = (date1: TDate, date2: TDate): boolean => getHours(date1) === getHours(date2);

  const isSameMinute = (date1: TDate, date2: TDate): boolean =>
    getMinutes(date1) === getMinutes(date2);

  const getTwentyFourHoursFormat = (): string => 'HH:mm';

  const getTwentyFourHoursFormatWithSeconds = (): string => 'HH:mm:ss';

  const getTwelveHoursFormatWithSeconds = (): string => 'hh:mm:ss A';

  const getDayPeriod = (date: TDate): DayPeriod => {
    const isFirstDayPeriod = getHours(date) < HOURS_IN_DAY_PERIOD;
    if (isFirstDayPeriod) {
      return 'AM';
    }
    return 'PM';
  };

  const setHours = (date: TDate, hour: number): TDate => {
    if (isMoment(date)) {
      return clone(date).set({ hour }) as TDate;
    }
    return moment(date).set({ hour }).toDate() as TDate;
  };

  const setMinutes = (date: TDate, minute: number): TDate => {
    if (isMoment(date)) {
      return clone(date).set({ minute }) as TDate;
    }
    return moment(date).set({ minute }).toDate() as TDate;
  };

  const setSeconds = (date: TDate, second: number): TDate => {
    if (isMoment(date)) {
      return clone(date).set({ second }) as TDate;
    }
    return moment(date).set({ second }).toDate() as TDate;
  };

  const setMilliseconds = (date: TDate, millisecond: number): TDate => {
    if (isMoment(date)) {
      return clone(date).set({ millisecond }) as TDate;
    }
    return moment(date).set({ millisecond }).toDate() as TDate;
  };

  const addDays = (date: TDate, days: number): TDate => {
    if (isMoment(date)) {
      return clone(date).add({ days }) as TDate;
    }
    return moment(date).add({ days }).toDate() as TDate;
  };

  const addMonths = (date: TDate, months: number): TDate => {
    if (isMoment(date)) {
      return clone(date).add({ months }) as TDate;
    }
    return moment(date).add({ months }).toDate() as TDate;
  };

  const addYears = (date: TDate, years: number): TDate => {
    if (isMoment(date)) {
      return clone(date).add({ years }) as TDate;
    }
    return moment(date).add({ years }).toDate() as TDate;
  };

  const addMinutes = (date: TDate, minutes: number): TDate => {
    if (isMoment(date)) {
      return clone(date).add({ minutes }) as TDate;
    }
    return moment(date).add({ minutes }).toDate() as TDate;
  };

  const addHours = (date: TDate, hours: number): TDate => {
    if (isMoment(date)) {
      return clone(date).add({ hours }) as TDate;
    }
    return moment(date).add({ hours }).toDate() as TDate;
  };

  const clone = (date: Moment): Moment => date.clone().locale(locale);

  const valueOf = (date: Moment): number => date.valueOf();

  const compareDates = (date1: TDate, date2: TDate): number =>
    getYear(date1) - getYear(date2) ||
    getMonth(date1) - getMonth(date2) ||
    getDate(date1) - getDate(date2);

  const createDate = (year: number, month: number, date: number, dateType: DateType): TDate => {
    const createdDate = moment([year, month, date]);
    return (dateType === 'moment' ? createdDate : createdDate.toDate()) as TDate;
  };

  const format = (date: TDate, formatString?: string): string => {
    if (date) {
      const _date = isMoment(date) ? date : moment(date);
      return _date.format(formatString || localeData().defaultFormat);
    }
    return '';
  };

  const getLocaleTimeFormat = (): string =>
    moment.localeData().longDateFormat(TIME_ONLY_FORMAT_KEY);

  const getDate = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.date();
  };

  const getDayOfWeek = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.day();
  };

  const getDayOfWeekNames = (style: DayOfWeekStyle = 'narrow'): string[] =>
    localeData().days[style];

  const getFirstDayOfWeek = (): number => localeData().firstDayOfWeek;

  const getMonth = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.month();
  };

  const getHours = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.hours();
  };

  const getMinutes = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.minutes();
  };

  const getSeconds = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.seconds();
  };

  const getMilliseconds = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.milliseconds();
  };

  const getMonthEnd = (date: TDate): TDate => {
    if (isMoment(date)) {
      return clone(date).endOf('month') as TDate;
    }
    return moment(date).endOf('month').toDate() as TDate;
  };

  const getMonthName = (date: TDate, style: MonthNameStyle = 'short'): string => {
    const month = getMonth(date);
    return getMonthNameByIndex(month, style);
  };

  const getMonthNameByIndex = (month: number, style: MonthNameStyle = 'short'): string =>
    localeData().months[style][month];

  const getMonthStart = (date: TDate): TDate => {
    if (isMoment(date)) {
      return clone(date).startOf('month') as TDate;
    }
    return moment(date).startOf('month').toDate() as TDate;
  };

  const getNumberOfDaysInMonth = (date: TDate): number => {
    if (isMoment(date)) {
      return clone(date).daysInMonth();
    }
    return moment(date).daysInMonth();
  };

  const getYear = (date: TDate): number => {
    if (isMoment(date)) {
      return clone(date).year();
    }
    return moment(date).year();
  };

  const getYearEnd = (date: TDate): TDate => {
    if (isMoment(date)) {
      return clone(date).endOf('year') as TDate;
    }
    return moment(date).endOf('year').toDate() as TDate;
  };

  const getYearStart = (date: TDate): TDate => {
    if (isMoment(date)) {
      return clone(date).startOf('year') as TDate;
    }
    return moment(date).startOf('year') as TDate;
  };

  const isSameDay = (
    date1: TDate | undefined | null,
    date2: TDate | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameMonth(date1, date2) && getDate(date1) === getDate(date2);

  const isSameMonth = (
    date1: TDate | undefined | null,
    date2: TDate | undefined | null
  ): boolean | undefined | null =>
    date1 && date2 && isSameYear(date1, date2) && getMonth(date1) === getMonth(date2);

  const isSameYear = (
    date1: TDate | undefined | null,
    date2: TDate | undefined | null
  ): boolean | undefined | null => date1 && date2 && getYear(date1) === getYear(date2);

  const isValidDateString = (date: string, formatString?: string): boolean =>
    (parse(date, formatString, 'moment') as Moment).isValid();

  const isValidTimeString = (date: string, formatString: string): boolean =>
    moment(date, formatString, true).isValid();

  const parse = (date: string, formatString?: string, parseTo: DateType = 'native'): TDate => {
    const parsedDate = moment(date, formatString || localeData().defaultFormat);
    return (parseTo === 'moment' ? parsedDate : parsedDate.toDate()) as TDate;
  };

  const today = (dateType: DateType = 'native'): TDate =>
    (dateType === 'moment' ? moment() : new Date()) as TDate;

  const getWeekNumber = (date: TDate): number => {
    const _date = isMoment(date) ? date : moment(date);
    return _date.week();
  };

  const getDateFormat = (): string => 'YYYY-MM-DD';

  const getTwelveHoursFormat = (): string => 'hh:mm A';

  return {
    isBetween,
    isSameHourAndMinute,
    isSameHour,
    isSameMinute,
    getTwentyFourHoursFormat,
    getTwentyFourHoursFormatWithSeconds,
    getTwelveHoursFormatWithSeconds,
    getDayPeriod,
    getDateFormat,
    getTwelveHoursFormat,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
    addDays,
    addMonths,
    addYears,
    addHours,
    addMinutes,
    clone,
    valueOf,
    compareDates,
    createDate,
    format,
    getLocaleTimeFormat,
    getDate,
    getDayOfWeek,
    getDayOfWeekNames,
    getFirstDayOfWeek,
    getMonth,
    getMonthName,
    getHours,
    getMinutes,
    getSeconds,
    getMilliseconds,
    getMonthEnd,
    getMonthNameByIndex,
    getMonthStart,
    getNumberOfDaysInMonth,
    getYear,
    getYearEnd,
    getYearStart,
    isSameDay,
    isSameMonth,
    isSameYear,
    isValidDateString,
    isValidTimeString,
    parse,
    today,
    getWeekNumber
  };
}
