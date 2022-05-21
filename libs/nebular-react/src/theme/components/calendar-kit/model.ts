import { Moment } from 'moment';
import React from 'react';
import { DEFAULT_LOCALE } from './hooks/date-moment';

export type NbCalendarSize = 'medium' | 'large';

export type NbCalendarViewModeValues = 'year' | 'month' | 'date';

export type NbCalendarDay = {
  name: string;
  isHoliday: boolean;
};

export interface NbCalRange<D extends Date | Moment> {
  start: D | null;
  end?: D | null;
}

export type NbCalendarCellProps<D extends Date | Moment> = {
  date?: D;
  onSelect?: (date: D) => void;
};

export enum NbDateTypes {
  Date,
  Moment
}

export enum NbPickerType {
  Date,
  Range
}

export type CalendarPickerContextProps<D extends Date | Moment> = {
  locale: string;
  min?: D;
  max?: D;
  filter?: (date: D) => boolean;
  size?: NbCalendarSize;
  selectedValue: D | NbCalRange<D> | null;
  visibleDate?: D;
  dateChange?: (date: D) => void;
  monthChange?: (date: D) => void;
  yearChange?: (date: D) => void;
  dayCellType?: React.FC<NbCalendarCellProps<D>>;
  monthCellType?: React.FC<NbCalendarCellProps<D>>;
  yearCellType?: React.FC<NbCalendarCellProps<D>>;
  dateType: NbDateTypes;
  pickerType: NbPickerType;
};

export const CalendarPickerContext = React.createContext<Partial<CalendarPickerContextProps<any>>>({});

export function createCalendarPickerContext<D extends Date | Moment>(
  locale: string = DEFAULT_LOCALE,
  dateType = NbDateTypes.Date,
  pickerType = NbPickerType.Date
) {
  return React.createContext<CalendarPickerContextProps<D>>({ locale, selectedValue: null, dateType, pickerType });
}

export function useCalendarPickerContext<D extends Date | Moment>() {
  const context = React.useContext<CalendarPickerContextProps<D>>(
    CalendarPickerContext as unknown as React.Context<CalendarPickerContextProps<D>>
  );
  if (!context) {
    throw new Error('useCalendarPickerContext must be used under CalendarPickerContextProvider');
  }

  return context;
}
