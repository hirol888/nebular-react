import { DefaultProps, Selectors } from '@nebular-react/styles';
import { Moment } from 'moment';
import { BaseCalendarCellProps } from '../types';
import useStyles, { CalendarYearCellStylesParams } from './CalendarYearCell.style';

export type CalendarYearCellStylesNames = Selectors<typeof useStyles>;

export interface CalendarYearCellProps<TDate extends Date | Moment = Date>
  extends DefaultProps<CalendarYearCellStylesNames, CalendarYearCellStylesParams>,
    Omit<BaseCalendarCellProps<TDate>, 'classNames' | 'styles' | 'unstyled'> {}
