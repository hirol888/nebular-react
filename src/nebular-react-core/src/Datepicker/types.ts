import { Moment } from 'moment';
import { DateType, Position, PositionAdjustment } from '@nebular-react/hooks';
import { CalendarSize, CalendarViewModeType } from '../Calendar';
import { CalendarDayCellProps } from '../Calendar/calendar-kit/CalendarDayPicker/CalendarDayCell.type';
import { CalendarMonthCellProps } from '../Calendar/calendar-kit/CalendarMonthPicker/CalendarMonthCell.type';
import { CalendarYearCellProps } from '../Calendar/calendar-kit/CalendarYearPicker/CalendarYearCell.type';

export interface BasePickerProps<TDate extends Date | Moment = Date> {
  locale?: string;
  format?: string;
  boundingMonth?: boolean;
  startView?: CalendarViewModeType;
  min?: TDate;
  max?: TDate;
  filter?: (date: TDate) => boolean;
  calendarSize?: CalendarSize;
  visibleDate?: TDate;
  hideOnSelect?: boolean;
  showNavigation?: boolean;
  showWeekNumber?: boolean;
  weekNumberSymbol?: string;
  dropdownOffset?: number;
  position?: Position;
  adjustment?: PositionAdjustment;
  onDropdownOpen?(): void;
  onDropdownClose?(): void;
  dropdownClass?: string;
  dayCellComponent?: React.FC<CalendarDayCellProps<TDate>>;
  monthCellComponent?: React.FC<CalendarMonthCellProps<TDate>>;
  yearCellComponent?: React.FC<CalendarYearCellProps<TDate>>;
  dateType?: DateType;
}
