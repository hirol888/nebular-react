import { createStyles } from '@nebular-react/styles';
import { CalendarSize } from '../types';

export interface CalendarYearCellStylesParams {
  size: CalendarSize;
}

export default createStyles((theme, { size }: CalendarYearCellStylesParams) => ({
  root: {
    width:
      size === 'large'
        ? 'var(--calendar-year-cell-large-width)'
        : 'var(--calendar-year-cell-width)',
    height:
      size === 'large'
        ? 'var(--calendar-year-cell-large-height)'
        : 'var(--calendar-year-cell-height)'
  }
}));
