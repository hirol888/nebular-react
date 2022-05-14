import { useState } from 'react';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { createMomentService, DEFAULT_LOCALE, MomentLocaleData, NbDayPeriod } from './date-moment';
import { NbDateTypes } from '../model';
import { createNativeDateService } from './native-date';

const moment = _rollupMoment || _moment;

export function useDateService(
  _locale: string = DEFAULT_LOCALE,
  dateType: NbDateTypes = NbDateTypes.Date
): {
  setLocale: React.Dispatch<React.SetStateAction<string>>;
  isBetween(date: Date | Moment, start: Date | Moment, end: Date | Moment): boolean;
  isSameDaySafe(
    date1: Date | Moment | undefined | null,
    date2: Date | Moment | undefined | null
  ): boolean | undefined | null;
  isSameMonthSafe(
    date1: Date | Moment | undefined | null,
    date2: Date | Moment | undefined | null
  ): boolean | undefined | null;
  isSameYearSafe(
    date1: Date | Moment | undefined | null,
    date2: Date | Moment | undefined | null
  ): boolean | undefined | null;
  isSameHourAndMinute(date1: Date | Moment, date2: Date | Moment): boolean;
  isSameHour(date1: Date | Moment, date2: Date | Moment): boolean;
  isSameMinute(date1: Date | Moment, date2: Date | Moment): boolean;
  getTwentyFourHoursFormat(): string;
  getTwentyFourHoursFormatWithSeconds(): string;
  getTwelveHoursFormatWithSeconds(): string;
  getDayPeriod(date: Date | Moment): NbDayPeriod;
  getDateFormat(): string;
  getTwelveHoursFormat(): string;
  setHours(date: Date | Moment, hour: number): Date | Moment;
  setMinutes(date: Date | Moment, minute: number): Date | Moment;
  setSeconds(date: Date | Moment, second: number): Date | Moment;
  setMilliseconds(date: Date | Moment, millisecond: number): Date | Moment;
  addDays(date: Date | Moment, days: number): Date | Moment;
  addMonths(date: Date | Moment, months: number): Date | Moment;
  addYears(date: Date | Moment, years: number): Date | Moment;
  addHours(date: Date | Moment, hours: number): Date | Moment;
  addMinutes(date: Date | Moment, minutes: number): Date | Moment;
  clone(date: Date | Moment): Date | Moment;
  valueOf(date: Date | Moment): number;
  compareDates(date1: Date | Moment, date2: Date | Moment): number;
  createDate(year: number, month: number, date: number): Date | Moment;
  format(date: Date | Moment | undefined | null, format?: string | undefined): string;
  getLocaleTimeFormat(): string;
  getDate(date: Date | Moment): number;
  getDayOfWeek(date: Date | Moment): number;
  getDayOfWeekNames(style?: 'long' | 'short' | 'narrow'): string[];
  getFirstDayOfWeek(): number;
  getMonth(date: Date | Moment): number;
  getMonthName(date: Date | Moment, style?: 'long' | 'short'): string;
  getHours(date: Date | Moment): number;
  getMinutes(date: Date | Moment): number;
  getSeconds(date: Date | Moment): number;
  getMilliseconds(date: Date | Moment): number;
  getMonthEnd(date: Date | Moment): Date | Moment;
  getMonthNameByIndex(month: number, style?: 'long' | 'short'): string;
  getMonthStart(date: Date | Moment): Date | Moment;
  getNumberOfDaysInMonth(date: Date | Moment): number;
  getYear(date: Date | Moment): number;
  getYearEnd(date: Date | Moment): Date | Moment;
  getYearStart(date: Date | Moment): Date | Moment;
  isSameDay(date1: Date | Moment, date2: Date | Moment): boolean;
  isSameMonth(date1: Date | Moment, date2: Date | Moment): boolean;
  isSameYear(date1: Date | Moment, date2: Date | Moment): boolean;
  isValidDateString(date: string, format?: string | undefined): boolean;
  isValidTimeString(date: string, format: string): boolean;
  parse(date: string, format?: string | undefined): Date | Moment;
  today(): Date | Moment;
  getWeekNumber(date: Date | Moment): number;
} {
  const momentLocaleDate = moment.localeData(_locale);
  const [locale, setLocale] = useState<string>(_locale);
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

  if (dateType === NbDateTypes.Moment) {
    return { ...createMomentService(locale, localeData), setLocale };
  }

  return { ...createNativeDateService(locale, localeData), setLocale };
}
