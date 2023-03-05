import { DayPeriod, useDateFns } from './use-date-fns';

describe('@nebular-react/hooks/use-date-fns', () => {
  describe('native date', () => {
    let isBetween: (date: Date, start: Date, end: Date) => boolean;
    let isSameHourAndMinute: (date1: Date, date2: Date) => boolean;
    let isSameHour: (date1: Date, date2: Date) => boolean;
    let isSameMinute: (date1: Date, date2: Date) => boolean;
    let getDayPeriod: (date: Date) => DayPeriod;
    let setHours: (date: Date, hour: number) => Date;
    // let setMinutes: (date: Date, minute: number) => Date;
    // let setSeconds: (date: Date, second: number) => Date;
    // let setMilliseconds: (date: Date, millisecond: number) => Date;
    // let addDays: (date: Date, days: number) => Date;
    // let addMonths: (date: Date, months: number) => Date;
    // let addYears: (date: Date, years: number) => Date;
    // let addHours: (date: Date, hours: number) => Date;
    // let addMinutes: (date: Date, minutes: number) => Date;
    // let compareDates: (date1: Date, date2: Date) => number;
    // let createDate: (year: number, month: number, date: number, dateType: DateType) => Date;
    // let format: (date: Date, format?: string) => string;
    // let getLocaleTimeFormat: () => string;
    // let getDate: (date: Date) => number;
    // let getDayOfWeek: (date: Date) => number;
    // let getDayOfWeekNames: (style?: DayOfWeekStyle) => string[];
    // let getFirstDayOfWeek: () => number;
    // let getMonth: (date: Date) => number;
    // let getMonthName: (date: Date, style?: MonthNameStyle) => string;
    // let getHours: (date: Date) => number;
    // let getMinutes: (date: Date) => number;
    // let getSeconds: (date: Date) => number;
    // let getMilliseconds: (date: Date) => number;
    // let getMonthEnd: (date: Date) => Date;
    // let getMonthNameByIndex: (month: number, style?: MonthNameStyle) => string;
    // let getMonthStart: (date: Date) => Date;
    // let getNumberOfDaysInMonth: (date: Date) => number;
    // let getYear: (date: Date) => number;
    // let getYearEnd: (date: Date) => Date;
    // let getYearStart: (date: Date) => Date;
    let isSameDay: (date1: Date, date2: Date) => boolean;
    let isSameMonth: (date1: Date, date2: Date) => boolean;
    let isSameYear: (date1: Date, date2: Date) => boolean;
    // let isValidDateString: (date: string, format?: string) => boolean;
    // let isValidTimeString: (date: string, format: string) => boolean;
    // let parse: (date: string, format?: string, parseTo?: DateType) => Date;
    // let today: (dateType?: DateType) => Date;
    // let getWeekNumber: (date: Date) => number;

    beforeEach(() => {
      ({
        isBetween,
        isSameHourAndMinute,
        isSameHour,
        isSameMinute,
        getDayPeriod,
        setHours,
        // setMinutes,
        // setSeconds,
        // setMilliseconds,
        // addDays,
        // addMonths,
        // addYears,
        // addHours,
        // addMinutes,
        // compareDates,
        // createDate,
        // format,
        // getLocaleTimeFormat,
        // getDate,
        // getDayOfWeek,
        // getDayOfWeekNames,
        // getFirstDayOfWeek,
        // getMonth,
        // getMonthName,
        // getHours,
        // getMinutes,
        // getSeconds,
        // getMilliseconds,
        // getMonthEnd,
        // getMonthNameByIndex,
        // getMonthStart,
        // getNumberOfDaysInMonth,
        // getYear,
        // getYearEnd,
        // getYearStart,
        isSameDay,
        isSameMonth,
        isSameYear
        // isValidDateString,
        // isValidTimeString,
        // parse,
        // today,
        // getWeekNumber,
      } = useDateFns<Date>());
    });

    describe('isBetween', () => {
      it('should between two dates', () => {
        const result = isBetween(
          new Date(2023, 1, 10),
          new Date(2023, 1, 8),
          new Date(2023, 1, 12)
        );
        expect(result).toBe(true);
      });

      it('should not between two dates', () => {
        const result = isBetween(
          new Date(2023, 1, 10),
          new Date(2023, 1, 11),
          new Date(2023, 1, 12)
        );
        expect(result).toBe(false);
      });

      it('should not between two dates when start is the date', () => {
        const result = isBetween(
          new Date(2023, 1, 10),
          new Date(2023, 1, 10),
          new Date(2023, 1, 12)
        );
        expect(result).toBe(false);
      });

      it('should not between two dates when end is the date', () => {
        const result = isBetween(
          new Date(2023, 1, 12),
          new Date(2023, 1, 10),
          new Date(2023, 1, 12)
        );
        expect(result).toBe(false);
      });
    });

    describe('isSameDay', () => {
      it('should be the same day', () => {
        const result = isSameDay(new Date(2023, 1, 10, 10, 0, 0), new Date(2023, 1, 10, 15, 0, 0));
        expect(result).toBe(true);
      });

      it('should not be the same day', () => {
        const result = isSameDay(new Date(2023, 1, 10, 10, 0, 0), new Date(2023, 1, 12, 10, 0, 0));
        expect(result).toBe(false);
      });

      it('should return undefined when any date is undefined', () => {
        const result1 = isSameDay(new Date(2023, 1, 10, 10, 0, 0), undefined);
        expect(result1).toBe(undefined);

        const result2 = isSameDay(undefined, new Date(2023, 1, 10, 10, 0, 0));
        expect(result2).toBe(undefined);

        const result3 = isSameDay(undefined, undefined);
        expect(result3).toBe(undefined);
      });

      it('should return null when any date is null', () => {
        const result1 = isSameDay(null, new Date(2023, 1, 10, 10, 0, 0));
        expect(result1).toBe(null);

        const result2 = isSameDay(new Date(2023, 1, 10, 10, 0, 0), null);
        expect(result2).toBe(null);

        const result3 = isSameDay(null, null);
        expect(result3).toBe(null);
      });
    });

    describe('isSameMonth', () => {
      it('should be the same month', () => {
        const result = isSameMonth(new Date(2023, 1, 15), new Date(2023, 1, 22));
        expect(result).toBe(true);
      });

      it('should not be the same month', () => {
        const result = isSameMonth(new Date(2023, 1, 10), new Date(2023, 2, 10));
        expect(result).toBe(false);
      });

      it('should return undefined when any date is undefined', () => {
        const result1 = isSameMonth(new Date(2023, 1, 10, 10, 0, 0), undefined);
        expect(result1).toBe(undefined);

        const result2 = isSameMonth(undefined, new Date(2023, 1, 10, 10, 0, 0));
        expect(result2).toBe(undefined);

        const result3 = isSameMonth(undefined, undefined);
        expect(result3).toBe(undefined);
      });

      it('should return null when any date is null', () => {
        const result1 = isSameMonth(null, new Date(2023, 1, 10, 10, 0, 0));
        expect(result1).toBe(null);

        const result2 = isSameMonth(new Date(2023, 1, 10, 10, 0, 0), null);
        expect(result2).toBe(null);

        const result3 = isSameMonth(null, null);
        expect(result3).toBe(null);
      });
    });

    describe('isSameYear', () => {
      it('should be the same year', () => {
        const result = isSameYear(new Date(2023, 1, 15), new Date(2023, 2, 22));
        expect(result).toBe(true);
      });

      it('should not be the same year', () => {
        const result = isSameYear(new Date(2023, 1, 10), new Date(2024, 2, 10));
        expect(result).toBe(false);
      });

      it('should return undefined when any date is undefined', () => {
        const result1 = isSameYear(new Date(2023, 1, 10, 10, 0, 0), undefined);
        expect(result1).toBe(undefined);

        const result2 = isSameYear(undefined, new Date(2023, 1, 10, 10, 0, 0));
        expect(result2).toBe(undefined);

        const result3 = isSameYear(undefined, undefined);
        expect(result3).toBe(undefined);
      });

      it('should return null when any date is null', () => {
        const result1 = isSameYear(null, new Date(2023, 1, 10, 10, 0, 0));
        expect(result1).toBe(null);

        const result2 = isSameYear(new Date(2023, 1, 10, 10, 0, 0), null);
        expect(result2).toBe(null);

        const result3 = isSameYear(null, null);
        expect(result3).toBe(null);
      });
    });

    describe('isSameHourAndMinute', () => {
      it('should be the same hour and minute', () => {
        const result = isSameHourAndMinute(
          new Date(2023, 1, 10, 10, 25, 0),
          new Date(2024, 2, 22, 10, 25, 33)
        );
        expect(result).toBe(true);
      });

      it('should not be the same hour and minute', () => {
        const result1 = isSameHourAndMinute(
          new Date(2023, 1, 10, 10, 25, 0),
          new Date(2024, 2, 22, 10, 26, 33)
        );
        expect(result1).toBe(false);

        const result2 = isSameHourAndMinute(
          new Date(2023, 1, 10, 11, 25, 0),
          new Date(2024, 2, 22, 10, 25, 33)
        );
        expect(result2).toBe(false);

        const result3 = isSameHourAndMinute(
          new Date(2023, 1, 10, 11, 25, 0),
          new Date(2024, 2, 22, 10, 26, 33)
        );
        expect(result3).toBe(false);
      });
    });

    describe('isSameHour', () => {
      it('should be the same hour', () => {
        const result = isSameHour(
          new Date(2023, 1, 11, 10, 22, 33),
          new Date(2024, 2, 22, 10, 23, 34)
        );
        expect(result).toBe(true);
      });

      it('should not be the same hour', () => {
        const result = isSameHour(
          new Date(2023, 1, 11, 10, 22, 33),
          new Date(2024, 2, 22, 11, 23, 34)
        );
        expect(result).toBe(false);
      });
    });

    describe('isSameMinute', () => {
      it('should be the same minute', () => {
        const result = isSameMinute(
          new Date(2023, 1, 11, 10, 22, 33),
          new Date(2024, 2, 22, 11, 22, 34)
        );
        expect(result).toBe(true);
      });

      it('should not be the same minute', () => {
        const result = isSameMinute(
          new Date(2023, 1, 11, 10, 22, 33),
          new Date(2024, 2, 22, 11, 23, 34)
        );
        expect(result).toBe(false);
      });
    });

    describe('getDayPeriod', () => {
      it('should return AM', () => {
        const result = getDayPeriod(new Date(2023, 1, 11, 10, 0, 0));
        expect(result).toBe('AM');
      });

      it('should return PM', () => {
        const result = getDayPeriod(new Date(2023, 1, 11, 22, 0, 0));
        expect(result).toBe('PM');
      });
    });

    describe('setHours', () => {
      it('should set hour', () => {
        const result = setHours(new Date(2023, 1, 11, 10, 0, 0), 22);
        expect(result).toEqual(new Date(2023, 1, 11, 22, 0, 0));
      });

      // it('should set hour when hour > 24', () => {
      //   const result = setHours(new Date(2023, 1, 11, 10, 0, 0), 25);
      //   expect(result).toEqual(new Date(2023, 1, 11, 22, 0, 0));
      // });
    });
  });
});
