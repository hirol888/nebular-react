import React from 'react';
import { NbCalendarCellProps } from './components';

export type NbCalendarSize = 'medium' | 'large';

export type NbCalendarViewModeValues = 'year' | 'month' | 'date';

export type NbCalendarDay = {
  name: string;
  isHoliday: boolean;
};

export interface NbCalRange {
  start: Date | null;
  end?: Date | null;
}

export type CalendarPickerContextProps = {
  locale?: string;
  min?: Date;
  max?: Date;
  filter?: (date: Date) => boolean;
  size?: NbCalendarSize;
  selectedValue?: Date | NbCalRange;
  visibleDate?: Date;
  dateChange?: (date: Date) => void;
  monthChange?: (date: Date) => void;
  yearChange?: (date: Date) => void;
  dayCellType?: React.FC<NbCalendarCellProps>;
  monthCellType?: React.FC<NbCalendarCellProps>;
  yearCellType?: React.FC<NbCalendarCellProps>;
};

export const CalendarPickerContext = React.createContext<CalendarPickerContextProps>({});
