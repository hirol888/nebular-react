import { createStyles } from '@nebular-react/styles';
import { CalendarSize } from '../types';

export interface CalendarDayCellStylesParams {
  size: CalendarSize;
}

export default createStyles((theme, { size }: CalendarDayCellStylesParams) => ({
  root: {
    width:
      size === 'large' ? 'var(--calendar-day-cell-large-width)' : 'var(--calendar-day-cell-width)',
    height:
      size === 'large' ? 'var(--calendar-day-cell-large-height)' : 'var(--calendar-day-cell-height)'
  }
}));
