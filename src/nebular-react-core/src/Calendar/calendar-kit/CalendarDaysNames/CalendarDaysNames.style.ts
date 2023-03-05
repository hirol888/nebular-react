import { createStyles } from '@nebular-react/styles';
import { CalendarSize } from '../types';

export interface CalendarDaysNamesStylesParams {
  size: CalendarSize;
}

export default createStyles((theme, { size }: CalendarDaysNamesStylesParams) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',

    background: 'var(--calendar-weekday-background)',
    borderTop: 'var(--calendar-weekday-divider-width) solid var(--calendar-weekday-divider-color)',
    borderBottom:
      'var(--calendar-weekday-divider-width) solid var(--calendar-weekday-divider-color)',

    ...theme.fns.ltr({
      paddingLeft: 'var(--calendar-picker-padding-start)',
      paddingRight: 'var(--calendar-picker-padding-end)'
    }),
    ...theme.fns.rtl({
      paddingLeft: 'var(--calendar-picker-padding-end)',
      paddingright: 'var(--calendar-picker-padding-start)'
    })
  },

  day: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    width:
      size === 'large' ? 'var(--calendar-weekday-large-width)' : 'var(--calendar-weekday-width)',
    height:
      size === 'large' ? 'var(--calendar-weekday-large-height)' : 'var(--calendar-weekday-height)',
    color: 'var(--calendar-weekday-text-color)',
    fontSize: 'var(--calendar-weekday-text-font-size)',
    fontWeight: 'var(--calendar-weekday-text-font-weight)' as any,
    lineHeight: 'var(--calendar-weekday-text-line-height)'
  },

  holiday: {
    color: 'var(--calendar-weekday-holiday-text-color)'
  }
}));
