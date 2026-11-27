import * as dateFnsModule from 'date-fns';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { Temporal } from '@js-temporal/polyfill';
import {
  createDateFnsDateFns,
  createDayjsDateFns,
  createTemporalDateFns
} from '@nebular-react/hooks';

dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);

describe('createDateFnsDateFns', () => {
  const adapter = createDateFnsDateFns(dateFnsModule, 'en-US');

  it('createDateFnsDateFns_FormattingAndParts_ShouldUseDateFns', () => {
    const date = adapter.createDate(2024, 0, 15);

    expect(date).toBeInstanceOf(Date);
    expect(adapter.format(date)).toBe('2024-01-15');
    expect(adapter.format(date, 'YYYY-MM-DD')).toBe('2024-01-15');
    expect(adapter.getYear(date)).toBe(2024);
    expect(adapter.getMonth(date)).toBe(0);
    expect(adapter.getDate(date)).toBe(15);
    expect(adapter.getDayOfWeek(date)).toBe(1);
    expect(adapter.getDateFormat()).toBe('YYYY-MM-DD');
    expect(adapter.getLocaleTimeFormat()).toBe('h:mm a');
    expect(adapter.getAdapterDateType()).toBe('date-fns');
    expect(adapter.getDateType(date)).toBe('date-fns');
  });

  it('createDateFnsDateFns_BoundsAndArithmetic_ShouldUseDateFns', () => {
    const date = adapter.createDate(2024, 0, 15, 'date-fns');
    const nextWeek = adapter.addDays(date, 7);

    expect(adapter.getMonthStart(date).getDate()).toBe(1);
    expect(adapter.getMonthEnd(date).getDate()).toBe(31);
    expect(adapter.getYearStart(date).getMonth()).toBe(0);
    expect(adapter.getYearEnd(date).getMonth()).toBe(11);
    expect(adapter.getNumberOfDaysInMonth(adapter.createDate(2024, 1, 1))).toBe(29);
    expect(adapter.format(nextWeek)).toBe('2024-01-22');
    expect(adapter.format(adapter.addMonths(date, 1))).toBe('2024-02-15');
    expect(adapter.format(adapter.addYears(date, 1))).toBe('2025-01-15');
    expect(adapter.format(adapter.addHours(date, 2))).toBe('2024-01-15');
    expect(adapter.getHours(adapter.addHours(date, 2))).toBe(2);
    expect(adapter.getMinutes(adapter.addMinutes(date, 30))).toBe(30);
    expect(adapter.getHours(adapter.setHours(date, 8))).toBe(8);
    expect(adapter.getMinutes(adapter.setMinutes(date, 45))).toBe(45);
    expect(adapter.getSeconds(adapter.setSeconds(date, 12))).toBe(12);
    expect(adapter.getMilliseconds(adapter.setMilliseconds(date, 250))).toBe(250);
  });

  it('createDateFnsDateFns_Comparisons_ShouldWorkWithPartialDates', () => {
    const date = adapter.createDate(2024, 5, 15);
    const sameDay = adapter.createDate(2024, 5, 15, 'date-fns');
    const sameMonth = adapter.createDate(2024, 5, 20);

    expect(adapter.compareDates(date, sameDay)).toBe(0);
    const monthStart = adapter.createDate(2024, 5, 1);
    const monthEnd = adapter.createDate(2024, 5, 30);
    expect(adapter.isBetween(sameMonth, monthStart, monthEnd)).toBe(true);
    expect(adapter.isBetween(sameMonth, sameMonth, monthEnd)).toBe(false);
    expect(adapter.isSameDay(date, sameDay)).toBe(true);
    expect(adapter.isSameMonth(date, sameMonth)).toBe(true);
    expect(adapter.isSameYear(date, adapter.createDate(2024, 0, 1))).toBe(true);
    expect(adapter.isSameDay(date, undefined)).toBeUndefined();
    expect(adapter.isSameMonth(date, null)).toBeNull();
    expect(adapter.isSameYear(undefined, date)).toBeUndefined();
    expect(adapter.isSameHourAndMinute(date, adapter.setSeconds(date, 30))).toBe(true);
    expect(adapter.isSameHour(date, adapter.setMinutes(date, 15))).toBe(true);
    expect(adapter.isSameMinute(date, adapter.setSeconds(date, 30))).toBe(true);
    expect(adapter.getDayPeriod(adapter.setHours(date, 9))).toBe('AM');
    expect(adapter.getDayPeriod(adapter.setHours(date, 15))).toBe('PM');
  });

  it('createDateFnsDateFns_NamesAndFormats_ShouldUseTheConfiguredLocale', () => {
    const date = adapter.createDate(2024, 0, 15);

    expect(adapter.getMonthName(date)).toBe('Jan');
    expect(adapter.getMonthName(date, 'long')).toBe('January');
    expect(adapter.getMonthNameByIndex(11, 'long')).toBe('December');
    expect(adapter.getDayOfWeekNames('long')[1]).toBe('Monday');
    expect(adapter.getDayOfWeekNames('short')[1]).toBe('Mon');
    expect(adapter.getDayOfWeekNames('narrow')[1]).toBe('M');
    expect(adapter.getFirstDayOfWeek()).toBe(0);
    expect(adapter.getWeekNumber(date)).toBe(3);
    expect(adapter.getTwentyFourHoursFormat()).toBe('HH:mm');
    expect(adapter.getTwentyFourHoursFormatWithSeconds()).toBe('HH:mm:ss');
    expect(adapter.getTwelveHoursFormat()).toBe('hh:mm A');
    expect(adapter.getTwelveHoursFormatWithSeconds()).toBe('hh:mm:ss A');
  });

  it('createDateFnsDateFns_ParseAndValidation_ShouldHandleInvalidValues', () => {
    const parsed = adapter.parse('2024-01-15', 'YYYY-MM-DD');

    expect(parsed).toBeInstanceOf(Date);
    expect(adapter.format(parsed)).toBe('2024-01-15');
    expect(adapter.isValidDateString('2024-01-15', 'YYYY-MM-DD')).toBe(true);
    expect(adapter.isValidDateString('not-a-date', 'YYYY-MM-DD')).toBe(false);
    expect(adapter.isValidTimeString('10:30', 'HH:mm')).toBe(true);
    expect(adapter.isValidTimeString('oops', 'HH:mm')).toBe(false);

    const invalidAdapter = createDateFnsDateFns(
      {
        ...dateFnsModule,
        parse: () => {
          throw new Error('invalid');
        },
        isValid: () => false
      },
      'en-US'
    );

    const invalid = invalidAdapter.parse('2024-01-15');
    expect(Number.isNaN(invalid.getTime())).toBe(true);
    expect(invalidAdapter.isValidDateString('2024-01-15')).toBe(false);
  });

  it('createDateFnsDateFns_CloneAndToday_ShouldReturnIndependentDates', () => {
    const date = adapter.createDate(2024, 0, 15);
    const clone = adapter.clone(date);

    clone.setFullYear(2025);

    expect(date.getFullYear()).toBe(2024);
    expect(clone.getFullYear()).toBe(2025);
    expect(adapter.today()).toBeInstanceOf(Date);
    expect(adapter.valueOf(date)).toBe(date.valueOf());
  });
});

describe('createDayjsDateFns', () => {
  const adapter = createDayjsDateFns(dayjs, 'en');

  it('createDayjsDateFns_FormattingAndParts_ShouldUseDayjs', () => {
    const date = adapter.createDate(2024, 0, 15);
    const parsed = adapter.parse('01/15/2024');

    expect(dayjs.isDayjs(date)).toBe(true);
    expect(dayjs.isDayjs(parsed)).toBe(true);
    expect(adapter.format(date)).toBe('01/15/2024');
    expect(adapter.format(date, 'YYYY-MM-DD')).toBe('2024-01-15');
    expect(adapter.format(null)).toBe('');
    expect(adapter.getYear(date)).toBe(2024);
    expect(adapter.getMonth(date)).toBe(0);
    expect(adapter.getDate(date)).toBe(15);
    expect(adapter.getDayOfWeek(date)).toBe(1);
    expect(adapter.getDateType(date)).toBe('dayjs');
    expect(adapter.getAdapterDateType()).toBe('dayjs');
  });

  it('createDayjsDateFns_ArithmeticAndBounds_ShouldUseDayjs', () => {
    const date = adapter.createDate(2024, 0, 15);

    expect(adapter.getMonthStart(date).date()).toBe(1);
    expect(adapter.getMonthEnd(date).date()).toBe(31);
    expect(adapter.getYearStart(date).month()).toBe(0);
    expect(adapter.getYearEnd(date).month()).toBe(11);
    expect(adapter.getNumberOfDaysInMonth(adapter.createDate(2024, 1, 1))).toBe(29);
    expect(adapter.format(adapter.addDays(date, 7), 'YYYY-MM-DD')).toBe('2024-01-22');
    expect(adapter.format(adapter.addMonths(date, 1), 'YYYY-MM-DD')).toBe('2024-02-15');
    expect(adapter.format(adapter.addYears(date, 1), 'YYYY-MM-DD')).toBe('2025-01-15');
    expect(adapter.getHours(adapter.addHours(date, 2))).toBe(2);
    expect(adapter.getMinutes(adapter.addMinutes(date, 30))).toBe(30);
    expect(adapter.getHours(adapter.setHours(date, 8))).toBe(8);
    expect(adapter.getMinutes(adapter.setMinutes(date, 45))).toBe(45);
    expect(adapter.getSeconds(adapter.setSeconds(date, 12))).toBe(12);
    expect(adapter.getMilliseconds(adapter.setMilliseconds(date, 250))).toBe(250);
    expect(adapter.clone(date).valueOf()).toBe(date.valueOf());
    expect(adapter.today()).toBeTruthy();
  });

  it('createDayjsDateFns_Comparisons_ShouldWorkWithPartialDates', () => {
    const date = adapter.createDate(2024, 5, 15);

    expect(adapter.compareDates(date, adapter.createDate(2024, 5, 15))).toBe(0);
    expect(
      adapter.isBetween(
        adapter.createDate(2024, 5, 20),
        adapter.createDate(2024, 5, 1),
        adapter.createDate(2024, 5, 30)
      )
    ).toBe(true);
    expect(adapter.isSameDay(date, adapter.createDate(2024, 5, 15))).toBe(true);
    expect(adapter.isSameMonth(date, adapter.createDate(2024, 5, 20))).toBe(true);
    expect(adapter.isSameYear(date, adapter.createDate(2024, 0, 1))).toBe(true);
    expect(adapter.isSameDay(date, undefined)).toBeUndefined();
    expect(adapter.isSameMonth(null, date)).toBeNull();
    expect(adapter.isSameYear(date, undefined)).toBeUndefined();
    expect(adapter.isSameHourAndMinute(date, adapter.setSeconds(date, 30))).toBe(true);
    expect(adapter.isSameHour(date, adapter.setMinutes(date, 15))).toBe(true);
    expect(adapter.isSameMinute(date, adapter.setSeconds(date, 30))).toBe(true);
    expect(adapter.getDayPeriod(adapter.setHours(date, 9))).toBe('AM');
    expect(adapter.getDayPeriod(adapter.setHours(date, 15))).toBe('PM');
  });

  it('createDayjsDateFns_NamesAndFormats_ShouldUseTheConfiguredLocale', () => {
    const date = adapter.createDate(2024, 0, 15);

    expect(adapter.getMonthName(date)).toBe('Jan');
    expect(adapter.getMonthName(date, 'long')).toBe('January');
    expect(adapter.getMonthNameByIndex(11, 'long')).toBe('December');
    expect(adapter.getDayOfWeekNames('long')[1]).toBe('Monday');
    expect(adapter.getDayOfWeekNames('short')[1]).toBe('Mon');
    expect(adapter.getDayOfWeekNames('narrow')[1]).toBe('Mo');
    expect(adapter.getFirstDayOfWeek()).toBe(0);
    expect(adapter.getWeekNumber(date)).toBe(3);
    expect(adapter.getLocaleTimeFormat()).toBe('h:mm A');
    expect(adapter.getTwentyFourHoursFormat()).toBe('HH:mm');
    expect(adapter.getTwentyFourHoursFormatWithSeconds()).toBe('HH:mm:ss');
    expect(adapter.getTwelveHoursFormat()).toBe('hh:mm A');
    expect(adapter.getTwelveHoursFormatWithSeconds()).toBe('hh:mm:ss A');
  });

  it('createDayjsDateFns_ParseAndValidation_ShouldUseStrictParsing', () => {
    expect(adapter.isValidDateString('01/15/2024')).toBe(true);
    expect(adapter.isValidDateString('2024-01-15', 'YYYY-MM-DD')).toBe(true);
    expect(adapter.isValidDateString('oops')).toBe(false);
    expect(adapter.isValidTimeString('10:30', 'HH:mm')).toBe(true);
    expect(adapter.isValidTimeString('oops', 'HH:mm')).toBe(false);
    expect(adapter.format(adapter.parse('2024-01-15', 'YYYY-MM-DD'), 'YYYY-MM-DD')).toBe(
      '2024-01-15'
    );
    expect(adapter.valueOf(adapter.createDate(2024, 0, 15))).toBe(new Date(2024, 0, 15).valueOf());
  });

  it('createDayjsDateFns_FallbackLocale_ShouldUseEnglishDefaults', () => {
    const fallback = createDayjsDateFns(dayjs, 'missing-locale');
    const date = fallback.createDate(2024, 0, 15);

    expect(fallback.getMonthName(date, 'long')).toBe('January');
    expect(fallback.getDayOfWeekNames('long')[1]).toBe('Monday');
    expect(fallback.getLocaleTimeFormat()).toBe('h:mm A');
    expect(fallback.getFirstDayOfWeek()).toBe(0);
  });
});

describe('createTemporalDateFns', () => {
  const adapter = createTemporalDateFns(Temporal, 'en-US');

  it('createTemporalDateFns_FormattingAndParts_ShouldUseTemporal', () => {
    const date = adapter.createDate(2024, 0, 15);

    expect(date).toBeInstanceOf(Temporal.PlainDateTime);
    expect(adapter.format(date)).toBe('2024-01-15');
    expect(adapter.format(date, 'YY/M/D')).toBe('24/1/15');
    expect(adapter.format(date, 'YYYY-MM-DD HH:mm:ss A')).toBe('2024-01-15 00:00:00 AM');
    expect(adapter.format(date, 'hh:mm:ss a')).toBe('12:00:00 am');
    expect(adapter.format(date, 'HH:mm')).toBe('00:00');
    expect(adapter.format(null as any)).toBe('');
    expect(adapter.getYear(date)).toBe(2024);
    expect(adapter.getMonth(date)).toBe(0);
    expect(adapter.getDate(date)).toBe(15);
    expect(adapter.getDayOfWeek(date)).toBe(1);
    expect(adapter.getDateType(date)).toBe('temporal');
    expect(adapter.getAdapterDateType()).toBe('temporal');
    expect(adapter.getDateFormat()).toBe('YYYY-MM-DD');
  });

  it('createTemporalDateFns_ArithmeticAndBounds_ShouldUseTemporal', () => {
    const date = adapter.createDate(2024, 0, 15);
    const dateTime = adapter.setHours(date, 10);

    expect(adapter.getMonthStart(dateTime).day).toBe(1);
    expect(adapter.getMonthStart(dateTime).hour).toBe(0);
    expect(adapter.getMonthEnd(dateTime).day).toBe(31);
    expect(adapter.getMonthEnd(dateTime).hour).toBe(23);
    expect(adapter.getYearStart(dateTime).month).toBe(1);
    expect(adapter.getYearEnd(dateTime).month).toBe(12);
    expect(adapter.getNumberOfDaysInMonth(adapter.createDate(2024, 1, 1))).toBe(29);
    expect(adapter.format(adapter.addDays(date, 7))).toBe('2024-01-22');
    expect(adapter.format(adapter.addMonths(date, 1))).toBe('2024-02-15');
    expect(adapter.format(adapter.addYears(date, 1))).toBe('2025-01-15');
    expect(adapter.getHours(adapter.addHours(date, 2))).toBe(2);
    expect(adapter.getMinutes(adapter.addMinutes(date, 30))).toBe(30);
    expect(adapter.getHours(dateTime)).toBe(10);
    expect(adapter.getMinutes(adapter.setMinutes(dateTime, 45))).toBe(45);
    expect(adapter.getSeconds(adapter.setSeconds(dateTime, 12))).toBe(12);
    expect(adapter.getMilliseconds(adapter.setMilliseconds(dateTime, 250))).toBe(250);
    expect(adapter.clone(date)).toBe(date);
    expect(adapter.today()).toBeInstanceOf(Temporal.PlainDateTime);
    expect(adapter.valueOf(dateTime)).toBe(Date.UTC(2024, 0, 15, 10));
  });

  it('createTemporalDateFns_Comparisons_ShouldWorkWithPartialDates', () => {
    const date = adapter.createDate(2024, 5, 15);

    expect(adapter.compareDates(date, adapter.createDate(2024, 5, 15))).toBe(0);
    expect(
      adapter.isBetween(
        adapter.createDate(2024, 5, 20),
        adapter.createDate(2024, 5, 1),
        adapter.createDate(2024, 5, 30)
      )
    ).toBe(true);
    expect(adapter.isSameDay(date, adapter.createDate(2024, 5, 15))).toBe(true);
    expect(adapter.isSameMonth(date, adapter.createDate(2024, 5, 20))).toBe(true);
    expect(adapter.isSameYear(date, adapter.createDate(2024, 0, 1))).toBe(true);
    expect(adapter.isSameDay(date, undefined)).toBeUndefined();
    expect(adapter.isSameMonth(null, date)).toBeNull();
    expect(adapter.isSameYear(date, undefined)).toBeUndefined();
    expect(adapter.isSameHourAndMinute(date, adapter.setSeconds(date, 30))).toBe(true);
    expect(adapter.isSameHour(date, adapter.setMinutes(date, 15))).toBe(true);
    expect(adapter.isSameMinute(date, adapter.setSeconds(date, 30))).toBe(true);
    expect(adapter.getDayPeriod(adapter.setHours(date, 9))).toBe('AM');
    expect(adapter.getDayPeriod(adapter.setHours(date, 15))).toBe('PM');
  });

  it('createTemporalDateFns_NamesAndFormats_ShouldUseTheConfiguredLocale', () => {
    const date = adapter.createDate(2024, 0, 15);

    expect(adapter.getMonthName(date)).toBe('Jan');
    expect(adapter.getMonthName(date, 'long')).toBe('January');
    expect(adapter.getMonthNameByIndex(11, 'long')).toBe('December');
    expect(adapter.getDayOfWeekNames('long')[1]).toBe('Monday');
    expect(adapter.getDayOfWeekNames('short')[1]).toBe('Mon');
    expect(adapter.getFirstDayOfWeek()).toBe(0);
    expect(adapter.getWeekNumber(date)).toBe(3);
    expect(adapter.getTwentyFourHoursFormat()).toBe('HH:mm');
    expect(adapter.getTwentyFourHoursFormatWithSeconds()).toBe('HH:mm:ss');
    expect(adapter.getTwelveHoursFormat()).toBe('hh:mm A');
    expect(adapter.getTwelveHoursFormatWithSeconds()).toBe('hh:mm:ss A');
  });

  it('createTemporalDateFns_Parse_ShouldSupportTokensAndDayPeriods', () => {
    expect(adapter.format(adapter.parse('2024-01-15')!)).toBe('2024-01-15');
    expect(adapter.format(adapter.parse('15/01/2024', 'DD/MM/YYYY')!)).toBe('2024-01-15');
    expect(adapter.format(adapter.parse('1/2/24', 'M/D/YY')!)).toBe('2024-01-02');
    expect(adapter.getHours(adapter.parse('01:30 PM', 'hh:mm A')!)).toBe(13);
    expect(adapter.getHours(adapter.parse('12:30 AM', 'hh:mm A')!)).toBe(0);
    expect(adapter.getHours(adapter.parse('12:30 PM', 'hh:mm A')!)).toBe(12);
    expect(adapter.getHours(adapter.parse('1:30 pm', 'h:m a')!)).toBe(13);
    expect(adapter.format(adapter.parse('2024-01-15T10:30:00')!)).toBe('2024-01-15');
    expect(adapter.parse('oops')).toBeNull();
    expect(adapter.parse('999999-01-01', 'YYYY-MM-DD')).toBeNull();
    expect(adapter.isValidDateString('2024-01-15')).toBe(true);
    expect(adapter.isValidDateString('oops')).toBe(false);
    expect(adapter.isValidTimeString('10:30', 'HH:mm')).toBe(true);
    expect(adapter.isValidTimeString('oops', 'HH:mm')).toBe(false);
  });

  it('createTemporalDateFns_FirstDayOfWeek_ShouldFallBackForNonUsLocales', () => {
    const adapterWithInvalidLocale = createTemporalDateFns(Temporal, 'en-GB');

    expect(adapterWithInvalidLocale.getFirstDayOfWeek()).toBe(1);
  });
});
