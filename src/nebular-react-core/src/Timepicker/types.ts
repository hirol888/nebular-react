import { BaseCalendarActionsProps } from '../Calendar/calendar-kit/CalendarActions/types';

export interface BaseTimeListProps {
  timeFormat?: string;
  twelveHoursFormat?: boolean;
  withSeconds?: boolean;
  singleColumn?: boolean;
  step?: number;
  showFooter?: boolean;
  hoursText?: string;
  minutesText?: string;
  secondsText?: string;
  ampmText?: string;
  calendarActionsProps?: Partial<BaseCalendarActionsProps>;
}
