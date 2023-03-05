import { DateType } from '@nebular-react/hooks';
import { Moment } from 'moment';
import { CalendarDayCellProps } from './calendar-kit/CalendarDayPicker/CalendarDayCell.type';
import { CalendarMonthCellProps } from './calendar-kit/CalendarMonthPicker/CalendarMonthCell.type';
import { CalendarYearCellProps } from './calendar-kit/CalendarYearPicker/CalendarYearCell.type';
import { CalendarSize } from './calendar-kit/types';

export interface BaseCalendarProps<TDate extends Date | Moment = Date> {
  locale?: string;
  boundingMonth?: boolean;
  min?: TDate;
  max?: TDate;
  filter?: (date: TDate) => boolean;
  size?: CalendarSize;
  visibleDate?: TDate;
  showNavigation?: boolean;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  dayCellComponent?: React.FC<CalendarDayCellProps<TDate>>;
  monthCellComponent?: React.FC<CalendarMonthCellProps<TDate>>;
  yearCellComponent?: React.FC<CalendarYearCellProps<TDate>>;
  dateType?: DateType;
}

export type CalendarType = 'date' | 'range';
