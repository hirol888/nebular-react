import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Moment } from 'moment';
import { BaseCalendarCellProps } from '../types';
import useStyles, { CalendarDayCellStylesParams } from './CalendarDayCell.style';

export type CalendarDayCellStylesNames = Selectors<typeof useStyles>;

export interface CalendarDayCellProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarDayCellStylesNames, CalendarDayCellStylesParams>,
    Omit<BaseCalendarCellProps<TDate>, 'classNames' | 'styles' | 'unstyled'> {}
