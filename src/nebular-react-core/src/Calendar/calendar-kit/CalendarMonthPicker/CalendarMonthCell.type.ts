import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Moment } from 'moment';
import { BaseCalendarCellProps } from '../types';
import useStyles, { CalendarMonthCellStylesParams } from './CalendarMonthCell.style';

export type CalendarMonthCellStylesNames = Selectors<typeof useStyles>;

export interface CalendarMonthCellProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarMonthCellStylesNames, CalendarMonthCellStylesParams>,
    Omit<BaseCalendarCellProps<TDate>, 'classNames' | 'styles' | 'unstyled'> {}
