import { createStyles } from '@nebular-react/styles';
import { CalendarSize } from './calendar-kit';

export interface BaseCalendarStylesParams {
  size: CalendarSize;
}

export default createStyles((theme, { size }: BaseCalendarStylesParams) => ({
  root: {
    '.nebular-card-root': {
      backgroundColor: 'var(--calendar-background-color)',
      border:
        'var(--calendar-border-width) var(--calendar-border-style) var(--calendar-border-color)',
      boxShadow: 'none',
      margin: 0,
      width: size === 'large' ? 'var(--calendar-large-width)' : 'var(--calendar-width)',
      overflow: 'hidden'
    },

    '.nebular-card-body-root': {
      padding: 0
    },

    '&:not(.has-navigation)': {
      '.nebular-calendar-week-numbers-root, .sign-container, .nebular-calendar-days-names-root': {
        borderTop: 0
      }
    },

    '&.has-week-number': {
      '.nebular-card-root': {
        width:
          size === 'large'
            ? 'calc(var(--calendar-large-width) + var(--calendar-weeknumber-large-width) + var(--calendar-weeknumber-divider-width))'
            : 'calc(var(--calendar-width) + var(--calendar-weeknumber-width) + var(--calendar-weeknumber-divider-width))'
      },

      '.nebular-calendar-month-cell-root, .nebular-calendar-year-cell': {
        flex: '1 0 auto'
      }
    }
  },

  calendarNavigation: {
    border: 'none',
    display: 'flex',

    padding: 'var(--calendar-navigation-padding)',
    color: 'var(--calendar-navigation-text-color)',
    fontFamily: 'var(--calendar-navigation-text-font-family)',
    fontSize: 'var(--calendar-navigation-title-text-font-size)',
    fontWeight: 'var(--calendar-navigation-title-text-font-weight)' as any,
    lineHeight: 'var(--calendar-navigation-title-text-line-height)'
  }
}));
