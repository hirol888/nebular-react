import moment, { Moment } from 'moment';
import { DateType } from '../use-date-fns/use-date-fns';
import { useCalendar } from './use-calendar';

describe('@nebular-react/hooks/use-calendar', () => {
  describe('native date', () => {
    let getViewYears: (viewYear: Date) => Date[][];
    let getHoursRange: (dateType?: DateType, step?: number) => Date[];
    let getResetTime: (dateType?: DateType) => Date;
    let paddToTwoSymbols: (n: number) => string;
    let buildDateFormat: (twelveHoursFormat: boolean, withSeconds?: boolean) => string;
    let createDaysGrid: (activeMonth: Date, boundingMonth?: boolean) => (Date | null)[][];

    beforeEach(() => {
      ({
        getViewYears,
        getHoursRange,
        getResetTime,
        paddToTwoSymbols,
        buildDateFormat,
        createDaysGrid
      } = useCalendar<Date>());
    });

    it('getViewYears', () => {
      const result = getViewYears(new Date(2023, 1, 10));
      expect(result).toEqual([
        [
          new Date(2016, 1, 10),
          new Date(2017, 1, 10),
          new Date(2018, 1, 10),
          new Date(2019, 1, 10)
        ],
        [
          new Date(2020, 1, 10),
          new Date(2021, 1, 10),
          new Date(2022, 1, 10),
          new Date(2023, 1, 10)
        ],
        [new Date(2024, 1, 10), new Date(2025, 1, 10), new Date(2026, 1, 10), new Date(2027, 1, 10)]
      ]);
    });

    it('getHoursRange', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const date = now.getDate();
      const result = getHoursRange('native', 120);
      expect(result).toEqual([
        new Date(year, month, date, 0),
        new Date(year, month, date, 2),
        new Date(year, month, date, 4),
        new Date(year, month, date, 6),
        new Date(year, month, date, 8),
        new Date(year, month, date, 10),
        new Date(year, month, date, 12),
        new Date(year, month, date, 14),
        new Date(year, month, date, 16),
        new Date(year, month, date, 18),
        new Date(year, month, date, 20),
        new Date(year, month, date, 22)
      ]);
    });

    it('getResetTime', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const date = now.getDate();
      const result = getResetTime('native');
      expect(result).toEqual(new Date(year, month, date, 0));
    });

    describe('paddToTwoSymbols', () => {
      it('one digit', () => {
        const result = paddToTwoSymbols(1);
        expect(result).toBe('01');
      });

      it('two digit', () => {
        const result = paddToTwoSymbols(11);
        expect(result).toBe('11');
      });
    });

    describe('buildDateFormat', () => {
      describe('with seconds', () => {
        it('twelve hours format', () => {
          const result = buildDateFormat(true, true);
          expect(result).toBe('YYYY-MM-DD hh:mm:ss A');
        });

        it('twenty four hours format', () => {
          const result = buildDateFormat(false, true);
          expect(result).toBe('YYYY-MM-DD HH:mm:ss');
        });
      });

      describe('without seconds', () => {
        it('twelve hours format', () => {
          const result = buildDateFormat(true);
          expect(result).toBe('YYYY-MM-DD hh:mm A');
        });

        it('twenty four hours format', () => {
          const result = buildDateFormat(false);
          expect(result).toBe('YYYY-MM-DD HH:mm');
        });
      });
    });

    describe('createDaysGrid', () => {
      it('with bounding months', () => {
        const date = new Date(2023, 1, 18);
        const result = createDaysGrid(date);
        expect(result).toEqual([
          [
            new Date(2023, 0, 29),
            new Date(2023, 0, 30),
            new Date(2023, 0, 31),
            new Date(2023, 1, 1),
            new Date(2023, 1, 2),
            new Date(2023, 1, 3),
            new Date(2023, 1, 4)
          ],
          [
            new Date(2023, 1, 5),
            new Date(2023, 1, 6),
            new Date(2023, 1, 7),
            new Date(2023, 1, 8),
            new Date(2023, 1, 9),
            new Date(2023, 1, 10),
            new Date(2023, 1, 11)
          ],
          [
            new Date(2023, 1, 12),
            new Date(2023, 1, 13),
            new Date(2023, 1, 14),
            new Date(2023, 1, 15),
            new Date(2023, 1, 16),
            new Date(2023, 1, 17),
            new Date(2023, 1, 18)
          ],
          [
            new Date(2023, 1, 19),
            new Date(2023, 1, 20),
            new Date(2023, 1, 21),
            new Date(2023, 1, 22),
            new Date(2023, 1, 23),
            new Date(2023, 1, 24),
            new Date(2023, 1, 25)
          ],
          [
            new Date(2023, 1, 26),
            new Date(2023, 1, 27),
            new Date(2023, 1, 28),
            new Date(2023, 2, 1),
            new Date(2023, 2, 2),
            new Date(2023, 2, 3),
            new Date(2023, 2, 4)
          ]
        ]);
      });

      it('without bounding months', () => {
        const date = new Date(2023, 1, 18);
        const result = createDaysGrid(date, false);
        expect(result).toEqual([
          [
            null,
            null,
            null,
            new Date(2023, 1, 1),
            new Date(2023, 1, 2),
            new Date(2023, 1, 3),
            new Date(2023, 1, 4)
          ],
          [
            new Date(2023, 1, 5),
            new Date(2023, 1, 6),
            new Date(2023, 1, 7),
            new Date(2023, 1, 8),
            new Date(2023, 1, 9),
            new Date(2023, 1, 10),
            new Date(2023, 1, 11)
          ],
          [
            new Date(2023, 1, 12),
            new Date(2023, 1, 13),
            new Date(2023, 1, 14),
            new Date(2023, 1, 15),
            new Date(2023, 1, 16),
            new Date(2023, 1, 17),
            new Date(2023, 1, 18)
          ],
          [
            new Date(2023, 1, 19),
            new Date(2023, 1, 20),
            new Date(2023, 1, 21),
            new Date(2023, 1, 22),
            new Date(2023, 1, 23),
            new Date(2023, 1, 24),
            new Date(2023, 1, 25)
          ],
          [
            new Date(2023, 1, 26),
            new Date(2023, 1, 27),
            new Date(2023, 1, 28),
            null,
            null,
            null,
            null
          ]
        ]);
      });
    });
  });

  describe('moment', () => {
    let getViewYears: (viewYear: Moment) => Moment[][];
    let getHoursRange: (dateType?: DateType, step?: number) => Moment[];
    let getResetTime: (dateType?: DateType) => Moment;
    let createDaysGrid: (activeMonth: Moment, boundingMonth?: boolean) => (Moment | null)[][];

    beforeEach(() => {
      ({ getViewYears, getHoursRange, getResetTime, createDaysGrid } = useCalendar<Moment>());
    });

    it('getViewYears', () => {
      const result = getViewYears(moment([2023, 1, 10])).map((ms) =>
        ms.map((m) => m.toISOString())
      );
      const expectedResult = [
        [
          moment([2016, 1, 10]),
          moment([2017, 1, 10]),
          moment([2018, 1, 10]),
          moment([2019, 1, 10])
        ],
        [
          moment([2020, 1, 10]),
          moment([2021, 1, 10]),
          moment([2022, 1, 10]),
          moment([2023, 1, 10])
        ],
        [moment([2024, 1, 10]), moment([2025, 1, 10]), moment([2026, 1, 10]), moment([2027, 1, 10])]
      ].map((ms) => ms.map((m) => m.toISOString()));

      expect(result).toEqual(expectedResult);
    });

    it('getHoursRange', () => {
      const now = moment();
      const year = now.year();
      const month = now.month();
      const date = now.date();
      const result = getHoursRange('moment', 120).map((m) => m.toISOString());
      const expectedResult = [
        moment([year, month, date, 0]),
        moment([year, month, date, 2]),
        moment([year, month, date, 4]),
        moment([year, month, date, 6]),
        moment([year, month, date, 8]),
        moment([year, month, date, 10]),
        moment([year, month, date, 12]),
        moment([year, month, date, 14]),
        moment([year, month, date, 16]),
        moment([year, month, date, 18]),
        moment([year, month, date, 20]),
        moment([year, month, date, 22])
      ].map((m) => m.toISOString());

      expect(result).toEqual(expectedResult);
    });

    it('getResetTime', () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const date = now.getDate();
      const result = getResetTime('moment').toISOString();
      expect(result).toEqual(moment([year, month, date, 0]).toISOString());
    });

    describe('createDaysGrid', () => {
      it('with bounding months', () => {
        const date = moment([2023, 1, 18]);
        const result = createDaysGrid(date).map((ms) =>
          ms.map((m) => (m === null ? null : m.toISOString()))
        );
        const expectedResult = [
          [
            moment([2023, 0, 29]),
            moment([2023, 0, 30]),
            moment([2023, 0, 31]),
            moment([2023, 1, 1]),
            moment([2023, 1, 2]),
            moment([2023, 1, 3]),
            moment([2023, 1, 4])
          ],
          [
            moment([2023, 1, 5]),
            moment([2023, 1, 6]),
            moment([2023, 1, 7]),
            moment([2023, 1, 8]),
            moment([2023, 1, 9]),
            moment([2023, 1, 10]),
            moment([2023, 1, 11])
          ],
          [
            moment([2023, 1, 12]),
            moment([2023, 1, 13]),
            moment([2023, 1, 14]),
            moment([2023, 1, 15]),
            moment([2023, 1, 16]),
            moment([2023, 1, 17]),
            moment([2023, 1, 18])
          ],
          [
            moment([2023, 1, 19]),
            moment([2023, 1, 20]),
            moment([2023, 1, 21]),
            moment([2023, 1, 22]),
            moment([2023, 1, 23]),
            moment([2023, 1, 24]),
            moment([2023, 1, 25])
          ],
          [
            moment([2023, 1, 26]),
            moment([2023, 1, 27]),
            moment([2023, 1, 28]),
            moment([2023, 2, 1]),
            moment([2023, 2, 2]),
            moment([2023, 2, 3]),
            moment([2023, 2, 4])
          ]
        ].map((ms) => ms.map((m) => (m === null ? null : m.toISOString())));

        expect(result).toEqual(expectedResult);
      });

      it('without bounding months', () => {
        const date = moment([2023, 1, 18]);
        const result = createDaysGrid(date, false).map((ms) =>
          ms.map((m) => (m === null ? null : m.toISOString()))
        );
        const expectedResult = [
          [
            null,
            null,
            null,
            moment([2023, 1, 1]),
            moment([2023, 1, 2]),
            moment([2023, 1, 3]),
            moment([2023, 1, 4])
          ],
          [
            moment([2023, 1, 5]),
            moment([2023, 1, 6]),
            moment([2023, 1, 7]),
            moment([2023, 1, 8]),
            moment([2023, 1, 9]),
            moment([2023, 1, 10]),
            moment([2023, 1, 11])
          ],
          [
            moment([2023, 1, 12]),
            moment([2023, 1, 13]),
            moment([2023, 1, 14]),
            moment([2023, 1, 15]),
            moment([2023, 1, 16]),
            moment([2023, 1, 17]),
            moment([2023, 1, 18])
          ],
          [
            moment([2023, 1, 19]),
            moment([2023, 1, 20]),
            moment([2023, 1, 21]),
            moment([2023, 1, 22]),
            moment([2023, 1, 23]),
            moment([2023, 1, 24]),
            moment([2023, 1, 25])
          ],
          [
            moment([2023, 1, 26]),
            moment([2023, 1, 27]),
            moment([2023, 1, 28]),
            null,
            null,
            null,
            null
          ]
        ].map((ms) => ms.map((m) => (m === null ? null : m.toISOString())));

        expect(result).toEqual(expectedResult);
      });
    });
  });
});
