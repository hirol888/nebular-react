import { createStyles } from '@nebular-react/styles';
import { CalendarSize } from '../types';

export interface CalendarMonthCellStylesParams {
  size: CalendarSize;
}

export default createStyles((theme, { size }: CalendarMonthCellStylesParams) => ({
  root: {
    width:
      size === 'large'
        ? 'var(--calendar-month-cell-large-width)'
        : 'var(--calendar-month-cell-width)',
    height:
      size === 'large'
        ? 'var(--calendar-month-cell-large-height)'
        : 'var(--calendar-month-cell-height)'
  }
}));
