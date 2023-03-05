import React from 'react';
import { Moment } from 'moment';
import { DefaultProps } from '@nebular-react/styles';
import { useDateFns } from '@nebular-react/hooks';
import { BaseCalendarCellProps } from './types';
import { CalendarPickerContext, useCalendarPickerContext } from './CalendarPicker.context';
import { CalendarDayPicker } from './CalendarDayPicker';

export interface CalendarKitMonthCellProps<TDate extends Date | Moment = Date>
  extends DefaultProps,
    BaseCalendarCellProps<TDate> {}

function CalendarKitMonthCell<TDate extends Date | Moment = Date>(
  props: CalendarKitMonthCellProps<TDate>
) {
  const { date } = props;
  const { locale, selectedValue, onDateChange, dateType } = useCalendarPickerContext<TDate>();
  const dateFns = useDateFns<TDate>(locale);

  const getTitle = (): string => dateFns.getMonthName(date, 'long');

  return (
    <div>
      <h4>{getTitle()}</h4>
      <CalendarPickerContext.Provider
        value={{ locale, selectedValue, visibleDate: date, onDateChange, dateType }}
      >
        <CalendarDayPicker<TDate> boundingMonths={false} />
      </CalendarPickerContext.Provider>
    </div>
  );
}

export { CalendarKitMonthCell };
