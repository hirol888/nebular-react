import { DAYS_IN_WEEK, DEFAULT_LOCALE } from './date-moment';
import { batch, range } from '../helpers';
import { useDateService } from './date';

export const YEARS_IN_VIEW = 12;
export const YEARS_IN_ROW = 4;
export const MONTHS_IN_VIEW = 12;
export const MONTHS_IN_COLUMN = 4;
const MINUTES_AND_SECONDS = 60;

export function useCalendarModel(_locale: string = DEFAULT_LOCALE) {
  const dateService = useDateService(_locale);

  const getYearsInView = (): number => {
    return YEARS_IN_VIEW;
  };

  const getYearsInRow = (): number => {
    return YEARS_IN_ROW;
  };

  const getViewYears = (viewYear: Date): Date[][] => {
    const year = dateService.getYear(viewYear);
    let viewStartYear: number;
    if (year >= 0) {
      viewStartYear = year - (year % YEARS_IN_VIEW);
    } else {
      viewStartYear = year - ((year % YEARS_IN_VIEW) + YEARS_IN_VIEW);
    }
    const years = range(YEARS_IN_VIEW).map((i: any) => copyWithYear(viewStartYear + i, viewYear));

    return batch(years, YEARS_IN_ROW);
  };

  const getHoursRange = (step: number = MINUTES_AND_SECONDS): Date[] => {
    let date: Date = getResetTime();

    const endDate = dateService.addDays(date, 1);

    const result: Date[] = [];

    while (dateService.compareDates(date, endDate) < 0) {
      result.push(date);
      date = dateService.addMinutes(date, step);
    }

    return result;
  };

  const getResetTime = (): Date => {
    let _today = dateService.today();
    _today = dateService.setHours(_today, 0);
    _today = dateService.setMinutes(_today, 0);
    _today = dateService.setSeconds(_today, 0);
    _today = dateService.setMilliseconds(_today, 0);

    return _today;
  };

  const paddToTwoSymbols = (n: number): string => {
    if (n < 10) {
      return '0' + n;
    }

    return n.toString();
  };

  const buildDateFormat = (twelveHoursFormat: boolean, withSeconds = false): string => {
    if (twelveHoursFormat) {
      return `${dateService.getDateFormat()} ${dateService.getTwelveHoursFormat()}`;
    }

    if (withSeconds) {
      return `${dateService.getDateFormat()} ${dateService.getTwentyFourHoursFormatWithSeconds()}`;
    }

    return `${dateService.getDateFormat()} ${dateService.getTwentyFourHoursFormat()}`;
  };

  const createDaysGrid = (activeMonth: Date, boundingMonth = true): (Date | null)[][] => {
    const weeks = createDates(activeMonth);
    return withBoundingMonths(weeks, activeMonth, boundingMonth);
  };

  // #region private
  const copyWithYear = (year: number, date: Date): Date => {
    return dateService.createDate(year, dateService.getMonth(date), dateService.getDate(date));
  };

  const createDates = (activeMonth: Date): Date[][] => {
    const days = createDateRangeForMonth(activeMonth);
    const startOfWeekDayDiff = getStartOfWeekDayDiff(activeMonth);
    return batch(days, DAYS_IN_WEEK, startOfWeekDayDiff);
  };

  const withBoundingMonths = (
    weeks: (Date | null)[][],
    activeMonth: Date,
    boundingMonth: boolean
  ): (Date | null)[][] => {
    let withBoundingMonths = weeks;

    if (isShouldAddPrevBoundingMonth(withBoundingMonths)) {
      withBoundingMonths = addPrevBoundingMonth(withBoundingMonths, activeMonth, boundingMonth);
    }

    if (isShouldAddNextBoundingMonth(withBoundingMonths)) {
      withBoundingMonths = addNextBoundingMonth(withBoundingMonths, activeMonth, boundingMonth);
    }

    return withBoundingMonths;
  };

  const addPrevBoundingMonth = (
    weeks: (Date | null)[][],
    activeMonth: Date,
    boundingMonth: boolean
  ): (Date | null)[][] => {
    const firstWeek = weeks.shift();
    const requiredItems: number = DAYS_IN_WEEK - firstWeek!.length;
    firstWeek!.unshift(...createPrevBoundingDays(activeMonth, boundingMonth, requiredItems));
    return [firstWeek!, ...weeks];
  };

  const addNextBoundingMonth = (
    weeks: (Date | null)[][],
    activeMonth: Date,
    boundingMonth: boolean
  ): (Date | null)[][] => {
    const lastWeek = weeks.pop();
    const requiredItems: number = DAYS_IN_WEEK - lastWeek!.length;
    lastWeek!.push(...createNextBoundingDays(activeMonth, boundingMonth, requiredItems));
    return [...weeks, lastWeek!];
  };

  const createPrevBoundingDays = (
    activeMonth: Date,
    boundingMonth: boolean,
    requiredItems: number
  ): (Date | null)[] => {
    const month = dateService.addMonths(activeMonth, -1);
    const daysInMonth = dateService.getNumberOfDaysInMonth(month);
    return createDateRangeForMonth(month)
      .slice(daysInMonth - requiredItems)
      .map((date) => (boundingMonth ? date : null));
  };

  const createNextBoundingDays = (
    activeMonth: Date,
    boundingMonth: boolean,
    requiredItems: number
  ): (Date | null)[] => {
    const month = dateService.addMonths(activeMonth, 1);
    return createDateRangeForMonth(month)
      .slice(0, requiredItems)
      .map((date) => (boundingMonth ? date : null));
  };

  const getStartOfWeekDayDiff = (date: Date): number => {
    const startOfMonth = dateService.getMonthStart(date);
    return getWeekStartDiff(startOfMonth);
  };

  const getWeekStartDiff = (date: Date): number => {
    return (DAYS_IN_WEEK - dateService.getFirstDayOfWeek() + dateService.getDayOfWeek(date)) % DAYS_IN_WEEK;
  };

  const isShouldAddPrevBoundingMonth = (weeks: (Date | null)[][]): boolean => {
    return weeks[0].length < DAYS_IN_WEEK;
  };

  const isShouldAddNextBoundingMonth = (weeks: (Date | null)[][]): boolean => {
    return weeks[weeks.length - 1].length < DAYS_IN_WEEK;
  };

  const createDateRangeForMonth = (date: Date): Date[] => {
    const daysInMonth: number = dateService.getNumberOfDaysInMonth(date);
    return range(daysInMonth, (i) => {
      const year = dateService.getYear(date);
      const month = dateService.getMonth(date);
      return dateService.createDate(year, month, i + 1);
    });
  };
  // #endregion

  return {
    getYearsInView,
    getYearsInRow,
    getViewYears,
    getHoursRange,
    getResetTime,
    paddToTwoSymbols,
    buildDateFormat,
    createDaysGrid
  };
}
