import React from 'react';
import { renderHook } from '@testing-library/react';
import * as dateFnsModule from 'date-fns';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import { Temporal } from '@js-temporal/polyfill';
import {
  createDateAdapter,
  createDateFnsDateAdapter,
  createDayjsDateAdapter,
  createTemporalDateAdapter,
  DateAdapterProvider,
  momentDateAdapter,
  nativeDateAdapter,
  useCalendar,
  useDateFns
} from '..';

dayjs.extend(customParseFormat);

describe('date adapters', () => {
  it('creates native Date values', () => {
    const dateFns = nativeDateAdapter.createDateFns('en-US');
    const created = dateFns.createDate(2024, 0, 15);
    const today = dateFns.today();

    expect(created).toBeInstanceOf(Date);
    expect(today).toBeInstanceOf(Date);
    expect(dateFns.format(created, 'YYYY-MM-DD')).toBe('2024-01-15');
    expect(dateFns.getAdapterDateType()).toBe('native');
  });

  it('creates moment values', () => {
    const dateFns = momentDateAdapter.createDateFns('en-US');
    const created = dateFns.createDate(2024, 0, 15);

    expect(moment.isMoment(created)).toBe(true);
    expect(dateFns.format(created, 'YYYY-MM-DD')).toBe('2024-01-15');
    expect(dateFns.getAdapterDateType()).toBe('moment');
  });

  it('creates dayjs values through the pluggable adapter', () => {
    const dateFns = createDayjsDateAdapter(dayjs).createDateFns('en-US');
    const created = dateFns.createDate(2024, 0, 15);
    const nextWeek = dateFns.addDays(created, 7);

    expect(dayjs.isDayjs(created)).toBe(true);
    expect(dateFns.format(created, 'YYYY-MM-DD')).toBe('2024-01-15');
    expect(dateFns.format(nextWeek, 'YYYY-MM-DD')).toBe('2024-01-22');
    expect(dateFns.getDateType(created)).toBe('dayjs');
    expect(dateFns.getAdapterDateType()).toBe('dayjs');
  });

  it('creates date-fns values through the concrete adapter', () => {
    const dateFns = createDateFnsDateAdapter(dateFnsModule).createDateFns('en-US');
    const created = dateFns.createDate(2024, 0, 15);
    const nextWeek = dateFns.addDays(created, 7);

    expect(created).toBeInstanceOf(Date);
    expect(dateFns.format(created, 'YYYY-MM-DD')).toBe('2024-01-15');
    expect(dateFns.format(nextWeek, 'YYYY-MM-DD')).toBe('2024-01-22');
    expect(dateFns.parse('2024-01-15', 'YYYY-MM-DD')).toEqual(created);
    expect(dateFns.getAdapterDateType()).toBe('date-fns');
  });

  it('creates Temporal values through the concrete adapter', () => {
    const dateFns = createTemporalDateAdapter(Temporal).createDateFns('en-US');
    const created = dateFns.createDate(2024, 0, 15);
    const nextWeek = dateFns.addDays(created, 7);

    expect(created).toBeInstanceOf(Temporal.PlainDateTime);
    expect(dateFns.format(created, 'YYYY-MM-DD')).toBe('2024-01-15');
    expect(dateFns.format(nextWeek, 'YYYY-MM-DD')).toBe('2024-01-22');
    expect(dateFns.parse('2024-01-15', 'YYYY-MM-DD')).toEqual(created);
    expect(dateFns.getDateType(created)).toBe('temporal');
    expect(dateFns.getAdapterDateType()).toBe('temporal');
  });

  it('provides date-fns and Temporal adapters through React context', () => {
    const dateFnsAdapter = createDateFnsDateAdapter(dateFnsModule);
    const temporalAdapter = createTemporalDateAdapter(Temporal);

    const dateFnsWrapper = ({ children }: { children: React.ReactNode }) => (
      <DateAdapterProvider adapter={dateFnsAdapter}>{children}</DateAdapterProvider>
    );
    const temporalWrapper = ({ children }: { children: React.ReactNode }) => (
      <DateAdapterProvider adapter={temporalAdapter}>{children}</DateAdapterProvider>
    );

    const { result: dateFnsResult } = renderHook(() => useDateFns('en-US'), {
      wrapper: dateFnsWrapper
    });
    const { result: temporalResult } = renderHook(() => useCalendar('en-US'), {
      wrapper: temporalWrapper
    });

    expect(dateFnsResult.current.today()).toBeInstanceOf(Date);
    expect(temporalResult.current.getResetTime()).toBeInstanceOf(Temporal.PlainDateTime);
  });

  it('provides adapters through React context', () => {
    const adapter = createDayjsDateAdapter(dayjs);
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DateAdapterProvider adapter={adapter}>{children}</DateAdapterProvider>
    );

    const { result: dateFnsResult } = renderHook(() => useDateFns('en-US'), { wrapper });
    const { result: calendarResult } = renderHook(() => useCalendar('en-US'), { wrapper });

    expect(dayjs.isDayjs(dateFnsResult.current.today())).toBe(true);
    expect(dayjs.isDayjs(calendarResult.current.getResetTime())).toBe(true);
  });

  it('supports custom adapter factories', () => {
    const adapter = createDateAdapter('custom-native', 'native', (locale) =>
      nativeDateAdapter.createDateFns(locale)
    );

    expect(adapter.name).toBe('custom-native');
    expect(adapter.createDateFns().today()).toBeInstanceOf(Date);
  });
});
