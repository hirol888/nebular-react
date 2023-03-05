import { Moment } from 'moment';
import { Styles } from '@nebular-react/styles';

export type CalendarSize = 'medium' | 'large';
export type CalendarViewModeType = 'year' | 'month' | 'date';
export interface DateRange<TDate extends Date | Moment> {
  start?: TDate;
  end?: TDate;
}

export interface CalendarDay {
  name: string;
  isHoliday: boolean;
}

export interface BaseCalendarCellProps<TDate extends Date | Moment = Date> {
  date: TDate;
  onSelect?: (date: TDate) => void;
  classNames?: Partial<Record<'root', string>>;
  styles?: Styles<'root', never>;
  unstyled?: boolean;
}
