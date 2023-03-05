import React, { useContext } from 'react';
import { Moment } from 'moment';
import { DateType, DEFAULT_LOCALE } from '@nebular-react/hooks';
import { CalendarSize, DateRange } from './types';
import { CalendarDayCellProps } from './CalendarDayPicker/CalendarDayCell.type';
import { CalendarMonthCellProps } from './CalendarMonthPicker/CalendarMonthCell.type';
import { CalendarYearCellProps } from './CalendarYearPicker/CalendarYearCell.type';

export interface CalendarPickerContextType<TDate extends Date | Moment = Date> {
  locale: string;
  min?: TDate;
  max?: TDate;
  filter?: (date: TDate) => boolean;
  size?: CalendarSize;
  selectedValue: TDate | DateRange<TDate> | null;
  visibleDate?: TDate;
  onDateChange?: (date: TDate | DateRange<TDate>) => void;
  onMonthChange?: (date: TDate) => void;
  onYearChange?: (date: TDate) => void;
  dayCellComponent?: React.FC<CalendarDayCellProps<TDate>>;
  monthCellComponent?: React.FC<CalendarMonthCellProps<TDate>>;
  yearCellComponent?: React.FC<CalendarYearCellProps<TDate>>;
  dateType: DateType;
}

export const CalendarPickerContext = React.createContext<CalendarPickerContextType<any>>(null);

export function useCalendarPickerContext<TDate extends Date | Moment>() {
  const context = useContext<CalendarPickerContextType<TDate>>(
    CalendarPickerContext as unknown as React.Context<CalendarPickerContextType<TDate>>
  );

  return (
    context || {
      locale: DEFAULT_LOCALE,
      selectedValue: null,
      size: 'medium',
      dateType: 'native'
    }
  );
}
