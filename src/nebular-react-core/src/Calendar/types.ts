import { DateType } from '@nebular-react/hooks';
import { Moment } from 'moment';
import { CalendarDayCellProps } from './calendar-kit/CalendarDayPicker/CalendarDayCell.type';
import { CalendarMonthCellProps } from './calendar-kit/CalendarMonthPicker/CalendarMonthCell.type';
import { CalendarYearCellProps } from './calendar-kit/CalendarYearPicker/CalendarYearCell.type';
import { CalendarSize } from './calendar-kit/types';

export type DisabledDates<TDate extends Date | Moment = Date> =
  TDate[] | ((date: TDate) => boolean);

export interface BaseCalendarProps<TDate extends Date | Moment = Date> {
  locale?: string;
  /**
   * IANA time zone (e.g. `America/New_York`) used to render the calendar.
   *
   * Values provided through `date`, `min`, `max` and `visibleDate` are absolute
   * instants and are converted to the wall clock of this time zone before being
   * displayed; values emitted through `onDateChange`/`onRangeChange` are
   * converted back to absolute instants. `filter` and `disabledDates` receive
   * wall clock values, so they operate on the dates the user actually sees.
   */
  timeZone?: string;
  boundingMonth?: boolean;
  min?: TDate;
  max?: TDate;
  filter?: (date: TDate) => boolean;
  disabledDates?: DisabledDates<TDate>;
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
