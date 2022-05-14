import * as _moment from 'moment';
import { default as _rollupMoment, LongDateFormatKey, Moment } from 'moment';

const moment = _rollupMoment || _moment;

export const TIME_ONLY_FORMAT_KEY: LongDateFormatKey = 'LT';
export const DEFAULT_LOCALE = 'en-US';
export const enum NbDayPeriod {
  AM = 'AM', // before midday, 0 - 11 in 24-hour format.
  PM = 'PM' // after midday, 12 - 23 in 24-hour format.
}

export const DAYS_IN_WEEK = 7;
export const HOURS_IN_DAY_PERIOD = 12;

export type MomentLocaleData = {
  firstDayOfWeek: number;
  defaultFormat: string;
  months: { [key: string]: string[] };
  days: { [key: string]: string[] };
};

export function createMomentService(locale: string = DEFAULT_LOCALE, localeData: MomentLocaleData) {
  // const momentLocaleDate = moment.localeData(_locale);
  // const [locale, setLocale] = useState<string>(_locale);
  // const [localeData] = useState<MomentLocaleData>({
  //   firstDayOfWeek: momentLocaleDate.firstDayOfWeek(),
  //   defaultFormat: momentLocaleDate.longDateFormat('L'),
  //   months: {
  //     short: momentLocaleDate.monthsShort(),
  //     long: momentLocaleDate.months()
  //   },
  //   days: {
  //     long: momentLocaleDate.weekdays(),
  //     short: momentLocaleDate.weekdaysShort(),
  //     narrow: momentLocaleDate.weekdaysMin()
  //   }
  // });

  /**
   * Checks if the date is between the start date and the end date.
   * */
  const isBetween = (date: Moment, start: Moment, end: Moment): boolean => {
    return compareDates(date, start) > 0 && compareDates(date, end) < 0;
  };

  /**
   * Checks is two dates have the same day.
   * */
  const isSameDaySafe = (
    date1: Moment | undefined | null,
    date2: Moment | undefined | null
  ): boolean | undefined | null => {
    return date1 && date2 && isSameDay(date1, date2);
  };

  /**
   * Checks is two dates have the same month.
   * */
  const isSameMonthSafe = (
    date1: Moment | undefined | null,
    date2: Moment | undefined | null
  ): boolean | undefined | null => {
    return date1 && date2 && isSameMonth(date1, date2);
  };

  /**
   * Checks is two dates have the same year.
   * */
  const isSameYearSafe = (
    date1: Moment | undefined | null,
    date2: Moment | undefined | null
  ): boolean | undefined | null => {
    return date1 && date2 && isSameYear(date1, date2);
  };

  const isSameHourAndMinute = (date1: Moment, date2: Moment): boolean => {
    return isSameHour(date1, date2) && isSameMinute(date1, date2);
  };

  const isSameHour = (date1: Moment, date2: Moment): boolean => {
    return getHours(date1) === getHours(date2);
  };

  const isSameMinute = (date1: Moment, date2: Moment): boolean => {
    return getMinutes(date1) === getMinutes(date2);
  };

  const getTwentyFourHoursFormat = (): string => {
    return 'HH:mm';
  };

  const getTwentyFourHoursFormatWithSeconds = (): string => {
    return 'HH:mm:ss';
  };

  const getTwelveHoursFormatWithSeconds = (): string => {
    return 'hh:mm:ss a';
  };

  const getDayPeriod = (date: Moment): NbDayPeriod => {
    const isFirstDayPeriod = getHours(date) < HOURS_IN_DAY_PERIOD;
    if (isFirstDayPeriod) {
      return NbDayPeriod.AM;
    } else {
      return NbDayPeriod.PM;
    }
  };

  const setHours = (date: Moment, hour: number): Moment => {
    return clone(date).set({ hour });
  };

  const setMinutes = (date: Moment, minute: number): Moment => {
    return clone(date).set({ minute });
  };

  const setSeconds = (date: Moment, second: number): Moment => {
    return clone(date).set({ second });
  };

  const setMilliseconds = (date: Moment, millisecond: number): Moment => {
    return clone(date).set({ millisecond });
  };

  const addDays = (date: Moment, days: number): Moment => {
    return clone(date).add({ days });
  };

  const addMonths = (date: Moment, months: number): Moment => {
    return clone(date).add({ months });
  };

  const addYears = (date: Moment, years: number): Moment => {
    return clone(date).add({ years });
  };

  const addMinutes = (date: Moment, minutes: number): Moment => {
    return clone(date).add({ minutes });
  };

  const addHours = (date: Moment, hours: number): Moment => {
    return clone(date).add({ hours });
  };

  const clone = (date: Moment): Moment => {
    return date.clone().locale(locale);
  };

  const valueOf = (date: Moment): number => {
    return date.valueOf();
  };

  const compareDates = (date1: Moment, date2: Moment): number => {
    return getYear(date1) - getYear(date2) || getMonth(date1) - getMonth(date2) || getDate(date1) - getDate(date2);
  };

  const createDate = (year: number, month: number, date: number): Moment => {
    return moment([year, month, date]);
  };

  const format = (date: Moment, format?: string): string => {
    if (date) {
      return date.format(format || localeData.defaultFormat);
    }
    return '';
  };

  const getLocaleTimeFormat = (): string => {
    return moment.localeData().longDateFormat(TIME_ONLY_FORMAT_KEY);
  };

  const getDate = (date: Moment): number => {
    return date.date();
  };

  const getDayOfWeek = (date: Moment): number => {
    return date.day();
  };

  const getDayOfWeekNames = (style: 'long' | 'short' | 'narrow' = 'narrow'): string[] => {
    return localeData.days[style];
  };

  const getFirstDayOfWeek = (): number => {
    return localeData.firstDayOfWeek;
  };

  const getMonth = (date: Moment): number => {
    return date.month();
  };

  const getHours = (date: Moment): number => {
    return date.hours();
  };

  const getMinutes = (date: Moment): number => {
    return date.minutes();
  };

  const getSeconds = (date: Moment): number => {
    return date.seconds();
  };

  const getMilliseconds = (date: Moment): number => {
    return date.milliseconds();
  };

  const getMonthEnd = (date: Moment): Moment => {
    return clone(date).endOf('month');
  };

  const getMonthName = (date: Moment, style: 'long' | 'short' = 'short'): string => {
    const month = getMonth(date);
    return getMonthNameByIndex(month, style);
  };

  const getMonthNameByIndex = (month: number, style: 'long' | 'short' = 'short'): string => {
    return localeData.months[style][month];
  };

  const getMonthStart = (date: Moment): Moment => {
    return clone(date).startOf('month');
  };

  const getNumberOfDaysInMonth = (date: Moment): number => {
    return clone(date).daysInMonth();
  };

  const getYear = (date: Moment): number => {
    return clone(date).year();
  };

  const getYearEnd = (date: Moment): Moment => {
    return clone(date).endOf('year');
  };

  const getYearStart = (date: Moment): Moment => {
    return clone(date).startOf('year');
  };

  const isSameDay = (date1: Moment, date2: Moment): boolean => {
    return isSameMonth(date1, date2) && getDate(date1) === getDate(date2);
  };

  const isSameMonth = (date1: Moment, date2: Moment): boolean => {
    return isSameYear(date1, date2) && getMonth(date1) === getMonth(date2);
  };

  const isSameYear = (date1: Moment, date2: Moment): boolean => {
    return getYear(date1) === getYear(date2);
  };

  const isValidDateString = (date: string, format?: string): boolean => {
    return parse(date, format).isValid();
  };

  const isValidTimeString = (date: string, format: string): boolean => {
    return moment(date, format, true).isValid();
  };

  const parse = (date: string, format?: string): Moment => {
    return moment(date, format || localeData.defaultFormat);
  };

  const today = (): Moment => {
    return moment();
  };

  const getWeekNumber = (date: Moment): number => {
    return date.week();
  };

  const getDateFormat = (): string => {
    return 'YYYY-MM-DD';
  };

  const getTwelveHoursFormat = (): string => {
    return 'hh:mm A';
  };

  return {
    isBetween,
    isSameDaySafe,
    isSameMonthSafe,
    isSameYearSafe,
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
