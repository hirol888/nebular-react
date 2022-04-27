import { useState } from 'react';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import {
  DEFAULT_LOCALE,
  HOURS_IN_DAY_PERIOD,
  MomentLocaleData,
  NbDayPeriod,
  TIME_ONLY_FORMAT_KEY
} from './date-moment';

const moment = _rollupMoment || _moment;

export function useDateService(_locale: string = DEFAULT_LOCALE) {
  const momentLocaleDate = moment.localeData(_locale);
  const [, setLocale] = useState<string>(_locale);
  const [localeData] = useState<MomentLocaleData>({
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
  });

  /**
   * Checks if the date is between the start date and the end date.
   * */
  const isBetween = (date: Date, start: Date, end: Date): boolean => {
    return compareDates(date, start) > 0 && compareDates(date, end) < 0;
  };

  /**
   * Checks is two dates have the same day.
   * */
  const isSameDaySafe = (
    date1: Date | undefined | null,
    date2: Date | undefined | null
  ): boolean | undefined | null => {
    return date1 && date2 && isSameDay(date1, date2);
  };

  /**
   * Checks is two dates have the same month.
   * */
  const isSameMonthSafe = (
    date1: Date | undefined | null,
    date2: Date | undefined | null
  ): boolean | undefined | null => {
    return date1 && date2 && isSameMonth(date1, date2);
  };

  /**
   * Checks is two dates have the same year.
   * */
  const isSameYearSafe = (
    date1: Date | undefined | null,
    date2: Date | undefined | null
  ): boolean | undefined | null => {
    return date1 && date2 && isSameYear(date1, date2);
  };

  const isSameHourAndMinute = (date1: Date, date2: Date): boolean => {
    return isSameHour(date1, date2) && isSameMinute(date1, date2);
  };

  const isSameHour = (date1: Date, date2: Date): boolean => {
    return getHours(date1) === getHours(date2);
  };

  const isSameMinute = (date1: Date, date2: Date): boolean => {
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

  const getDayPeriod = (date: Date): NbDayPeriod => {
    const isFirstDayPeriod = getHours(date) < HOURS_IN_DAY_PERIOD;
    if (isFirstDayPeriod) {
      return NbDayPeriod.AM;
    } else {
      return NbDayPeriod.PM;
    }
  };

  const setHours = (date: Date, hour: number): Date => {
    const _date = moment(date);
    return _date.set({ hour }).toDate();
  };

  const setMinutes = (date: Date, minute: number): Date => {
    const _date = moment(date);
    return _date.set({ minute }).toDate();
  };

  const setSeconds = (date: Date, second: number): Date => {
    const _date = moment(date);
    return _date.set({ second }).toDate();
  };

  const setMilliseconds = (date: Date, millisecond: number): Date => {
    const _date = moment(date);
    return _date.set({ millisecond }).toDate();
  };

  const addDays = (date: Date, days: number): Date => {
    const _date = moment(date);
    return _date.add({ days }).toDate();
  };

  const addMonths = (date: Date, months: number): Date => {
    const _date = moment(date);
    return _date.add({ months }).toDate();
  };

  const addYears = (date: Date, years: number): Date => {
    const _date = moment(date);
    return _date.add({ years }).toDate();
  };

  const addMinutes = (date: Date, minutes: number): Date => {
    const _date = moment(date);
    return _date.add({ minutes }).toDate();
  };

  const addHours = (date: Date, hours: number): Date => {
    const _date = moment(date);
    return _date.add({ hours }).toDate();
  };

  const clone = (date: Date): Date => {
    return new Date(date.getTime());
  };

  const valueOf = (date: Date): number => {
    return date.valueOf();
  };

  const compareDates = (date1: Date, date2: Date): number => {
    return getYear(date1) - getYear(date2) || getMonth(date1) - getMonth(date2) || getDate(date1) - getDate(date2);
  };

  const createDate = (year: number, month: number, date: number): Date => {
    const result = new Date(year, month, date);

    // We need to correct for the fact that JS native Date treats years in range [0, 99] as
    // abbreviations for 19xx.
    if (year >= 0 && year < 100) {
      result.setFullYear(result.getFullYear() - 1900);
    }
    return result;
  };

  const format = (date: Date | undefined | null, format?: string): string => {
    if (!date) {
      return '';
    }

    const _date = moment(date);
    if (_date) {
      return _date.format(format || localeData.defaultFormat);
    }
    return '';
  };

  const getLocaleTimeFormat = (): string => {
    return moment.localeData().longDateFormat(TIME_ONLY_FORMAT_KEY);
  };

  const getDate = (date: Date): number => {
    return date.getDate();
  };

  const getDayOfWeek = (date: Date): number => {
    return date.getDay();
  };

  const getDayOfWeekNames = (style: 'long' | 'short' | 'narrow' = 'narrow'): string[] => {
    return localeData.days[style];
  };

  const getFirstDayOfWeek = (): number => {
    return localeData.firstDayOfWeek;
  };

  const getMonth = (date: Date): number => {
    return date.getMonth();
  };

  const getHours = (date: Date): number => {
    return date.getHours();
  };

  const getMinutes = (date: Date): number => {
    return date.getMinutes();
  };

  const getSeconds = (date: Date): number => {
    return date.getSeconds();
  };

  const getMilliseconds = (date: Date): number => {
    return date.getMilliseconds();
  };

  const getMonthEnd = (date: Date): Date => {
    const _date = moment(date);
    return _date.endOf('month').toDate();
  };

  const getMonthName = (date: Date, style: 'long' | 'short' = 'short'): string => {
    const month = getMonth(date);
    return getMonthNameByIndex(month, style);
  };

  const getMonthNameByIndex = (month: number, style: 'long' | 'short' = 'short'): string => {
    return localeData.months[style][month];
  };

  const getMonthStart = (date: Date): Date => {
    const _date = moment(date);
    return _date.startOf('month').toDate();
  };

  const getNumberOfDaysInMonth = (date: Date): number => {
    const _date = moment(date);
    return _date.daysInMonth();
  };

  const getYear = (date: Date): number => {
    return date.getFullYear();
  };

  const getYearEnd = (date: Date): Date => {
    const _date = moment(date);
    return _date.endOf('year').toDate();
  };

  const getYearStart = (date: Date): Date => {
    const _date = moment(date);
    return _date.startOf('year').toDate();
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return isSameMonth(date1, date2) && getDate(date1) === getDate(date2);
  };

  const isSameMonth = (date1: Date, date2: Date): boolean => {
    return isSameYear(date1, date2) && getMonth(date1) === getMonth(date2);
  };

  const isSameYear = (date1: Date, date2: Date): boolean => {
    return getYear(date1) === getYear(date2);
  };

  const isValidDateString = (date: string, format?: string): boolean => {
    return _parse(date, format).isValid();
  };

  const isValidTimeString = (date: string, format: string): boolean => {
    return moment(date, format, true).isValid();
  };

  const _parse = (date: string, format?: string): Moment => {
    return moment(date, format || localeData.defaultFormat);
  };

  const parse = (date: string, format?: string): Date => {
    return moment(date, format || localeData.defaultFormat).toDate();
  };

  const today = (): Date => {
    return new Date();
  };

  const getWeekNumber = (date: Date): number => {
    const _date = moment(date);
    return _date.week();
  };

  const getDateFormat = (): string => {
    return 'YYYY-MM-DD';
  };

  const getTwelveHoursFormat = (): string => {
    return 'hh:mm A';
  };

  return {
    setLocale,
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
