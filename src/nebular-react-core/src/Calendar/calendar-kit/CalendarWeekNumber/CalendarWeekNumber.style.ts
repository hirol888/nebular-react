import { createStyles } from '@nebular-react/styles';
import { CalendarSize } from '../types';

export interface CalendarWeekNumberStylesParams {
  size: CalendarSize;
}

export default createStyles((theme, { size }: CalendarWeekNumberStylesParams) => {
  const border =
    'var(--calendar-weeknumber-divider-width) solid var(--calendar-weeknumber-divider-color)';

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',

      background: 'var(--calendar-weeknumber-background)',
      fontSize: 'var(--calendar-weeknumber-text-font-size)',
      fontWeight: 'var(--calendar-weeknumber-text-font-weight)' as any,
      lineHeight: 'var(--calendar-weeknumber-text-line-height)',
      color: 'var(--calendar-weeknumber-text-color)',
      paddingBottom: 'var(--calendar-picker-padding-bottom)',

      ...theme.fns.ltr({ borderRight: border }),
      ...theme.fns.rtl({ borderLeft: border })
    },

    signContainer: {
      display: 'flex',
      flexDirection: 'column',
      borderTop:
        'var(--calendar-weeknumber-divider-width) solid var(--calendar-weeknumber-divider-color)',
      borderBottom:
        'var(--calendar-weeknumber-divider-width) solid var(--calendar-weeknumber-divider-color)',
      marginBottom: 'var(--calendar-picker-padding-top)'
    },

    sign: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height:
        size === 'large'
          ? 'var(--calendar-weeknumber-large-height)'
          : 'var(--calendar-weeknumber-height)',
      width:
        size === 'large'
          ? 'var(--calendar-weeknumber-large-width)'
          : 'var(--calendar-weeknumber-width)'
    },

    weekNumber: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height:
        size === 'large'
          ? 'var(--calendar-weeknumber-large-height)'
          : 'var(--calendar-weeknumber-height)',
      width:
        size === 'large'
          ? 'var(--calendar-weeknumber-large-width)'
          : 'var(--calendar-weeknumber-width)'
    }
  };
});
