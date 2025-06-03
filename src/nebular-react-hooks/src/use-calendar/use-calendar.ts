import moment, { Moment } from 'moment';
import { batch, range } from '../utils';
import { DateType, DAYS_IN_WEEK, DEFAULT_LOCALE, useDateFns } from '../use-date-fns/use-date-fns';

const { isMoment } = moment;
export const YEARS_IN_VIEW = 12;
export const YEARS_IN_ROW = 4;
export const MONTHS_IN_VIEW = 12;
export const MONTHS_IN_COLUMN = 4;
const MINUTES_AND_SECONDS = 60;

export function useCalendar<TDate extends Date | Moment>(locale: string = DEFAULT_LOCALE) {
  const dateFns = useDateFns<TDate>(locale);

  const getYearsInView = (): number => YEARS_IN_VIEW;

  const getYearsInRow = (): number => YEARS_IN_ROW;

  const getViewYears = (viewYear: TDate): TDate[][] => {
    const year = dateFns.getYear(viewYear);
    let viewStartYear: number;
    if (year >= 0) {
      viewStartYear = year - (year % YEARS_IN_VIEW);
    } else {
      viewStartYear = year - ((year % YEARS_IN_VIEW) + YEARS_IN_VIEW);
    }
    const years = range(YEARS_IN_VIEW).map((i: any) => copyWithYear(viewStartYear + i, viewYear));

    return batch(years, YEARS_IN_ROW);
  };

  const getHoursRange = (
    dateType: DateType = 'native',
    step: number = MINUTES_AND_SECONDS
  ): TDate[] => {
    let date: TDate = getResetTime(dateType);

    const endDate = dateFns.addDays(date, 1);

    const result: TDate[] = [];

    while (dateFns.compareDates(date, endDate) < 0) {
      result.push(date);
      date = dateFns.addMinutes(date, step);
    }

    return result;
  };

  const getResetTime = (dateType: DateType = 'native'): TDate => {
    let _today = dateFns.today(dateType);
    _today = dateFns.setHours(_today, 0);
    _today = dateFns.setMinutes(_today, 0);
    _today = dateFns.setSeconds(_today, 0);
    _today = dateFns.setMilliseconds(_today, 0);

    return _today;
  };

  const paddToTwoSymbols = (n: number): string => {
    if (n < 10) {
      return `0${n}`;
    }

    return n.toString();
  };

  const buildDateFormat = (twelveHoursFormat: boolean, withSeconds = false): string => {
    if (withSeconds) {
      if (twelveHoursFormat) {
        return `${dateFns.getDateFormat()} ${dateFns.getTwelveHoursFormatWithSeconds()}`;
      }

      return `${dateFns.getDateFormat()} ${dateFns.getTwentyFourHoursFormatWithSeconds()}`;
    }
    if (twelveHoursFormat) {
      return `${dateFns.getDateFormat()} ${dateFns.getTwelveHoursFormat()}`;
    }

    return `${dateFns.getDateFormat()} ${dateFns.getTwentyFourHoursFormat()}`;
  };

  const createDaysGrid = (activeMonth: TDate, boundingMonth = true): (TDate | null)[][] => {
    const weeks = createDates(activeMonth);
    return withBoundingMonths(weeks, activeMonth, boundingMonth);
  };

  // #region private
  const copyWithYear = (year: number, date: TDate): TDate =>
    dateFns.createDate(
      year,
      dateFns.getMonth(date),
      dateFns.getDate(date),
      isMoment(date) ? 'moment' : 'native'
    );

  const createDates = (activeMonth: TDate): TDate[][] => {
    const days = createDateRangeForMonth(activeMonth);
    const startOfWeekDayDiff = getStartOfWeekDayDiff(activeMonth);
    return batch(days, DAYS_IN_WEEK, startOfWeekDayDiff);
  };

  const withBoundingMonths = (
    weeks: (TDate | null)[][],
    activeMonth: TDate,
    boundingMonth: boolean
  ): (TDate | null)[][] => {
    let _withBoundingMonths = weeks;

    if (isShouldAddPrevBoundingMonth(_withBoundingMonths)) {
      _withBoundingMonths = addPrevBoundingMonth(_withBoundingMonths, activeMonth, boundingMonth);
    }

    if (isShouldAddNextBoundingMonth(_withBoundingMonths)) {
      _withBoundingMonths = addNextBoundingMonth(_withBoundingMonths, activeMonth, boundingMonth);
    }

    return _withBoundingMonths;
  };

  const addPrevBoundingMonth = (
    weeks: (TDate | null)[][],
    activeMonth: TDate,
    boundingMonth: boolean
  ): (TDate | null)[][] => {
    const firstWeek = weeks.shift();
    const requiredItems: number = DAYS_IN_WEEK - firstWeek!.length;
    firstWeek!.unshift(...createPrevBoundingDays(activeMonth, boundingMonth, requiredItems));
    return [firstWeek!, ...weeks];
  };

  const addNextBoundingMonth = (
    weeks: (TDate | null)[][],
    activeMonth: TDate,
    boundingMonth: boolean
  ): (TDate | null)[][] => {
    const lastWeek = weeks.pop();
    const requiredItems: number = DAYS_IN_WEEK - lastWeek!.length;
    lastWeek!.push(...createNextBoundingDays(activeMonth, boundingMonth, requiredItems));
    return [...weeks, lastWeek!];
  };

  const createPrevBoundingDays = (
    activeMonth: TDate,
    boundingMonth: boolean,
    requiredItems: number
  ): (TDate | null)[] => {
    const month = dateFns.addMonths(activeMonth, -1);
    const daysInMonth = dateFns.getNumberOfDaysInMonth(month);
    return createDateRangeForMonth(month)
      .slice(daysInMonth - requiredItems)
      .map((date) => (boundingMonth ? date : null));
  };

  const createNextBoundingDays = (
    activeMonth: TDate,
    boundingMonth: boolean,
    requiredItems: number
  ): (TDate | null)[] => {
    const month = dateFns.addMonths(activeMonth, 1);
    return createDateRangeForMonth(month)
      .slice(0, requiredItems)
      .map((date) => (boundingMonth ? date : null));
  };

  const getStartOfWeekDayDiff = (date: TDate): number => {
    const startOfMonth = dateFns.getMonthStart(date);
    return getWeekStartDiff(startOfMonth);
  };

  const getWeekStartDiff = (date: TDate): number =>
    (DAYS_IN_WEEK - dateFns.getFirstDayOfWeek() + dateFns.getDayOfWeek(date)) % DAYS_IN_WEEK;

  const isShouldAddPrevBoundingMonth = (weeks: (TDate | null)[][]): boolean =>
    weeks[0].length < DAYS_IN_WEEK;

  const isShouldAddNextBoundingMonth = (weeks: (TDate | null)[][]): boolean =>
    weeks[weeks.length - 1].length < DAYS_IN_WEEK;

  const createDateRangeForMonth = (date: TDate): TDate[] => {
    const daysInMonth: number = dateFns.getNumberOfDaysInMonth(date);
    return range(daysInMonth, (i) => {
      const year = dateFns.getYear(date);
      const month = dateFns.getMonth(date);
      return dateFns.createDate(year, month, i + 1, isMoment(date) ? 'moment' : 'native');
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
