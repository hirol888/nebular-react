import { createStyles } from '@nebular-react/styles';
import { CalendarSize } from './calendar-kit';

export interface CalendarWithTimeStylesParams {
  size: CalendarSize;
}

export default createStyles((theme, { size }: CalendarWithTimeStylesParams) => ({
  root: {
    marginBottom: 0,

    '.nebular-time-list-timeList': {
      flex: '1 0 0',
      borderRadius: 0,
      width: 'auto',
      borderRight: 0,
      borderBottom: 0
    },

    '.nebular-calendar-with-time-pickerFooter': {
      ...theme.fns.ltr({ paddingLeft: '0.625rem' }),
      ...theme.fns.rtl({ paddingRight: '0.625rem' })
    },

    overflow: 'hidden',

    '.nebular-time-list-timeList, .nebular-base-calendar-root .nebular-card-root': {
      border: 'none'
    },

    '.nebular-time-list-columnHeader': {
      borderTop:
        'var(--datepicker-border-width) var(--datepicker-border-style) var(--datepicker-border-color)',
      borderRadius: 0
    }
  },

  pickerBody: {
    alignItems: 'stretch',
    display: 'flex',
    padding: 0,

    '.nebular-base-calendar-root': {
      '.nebular-card-root': {
        borderRadius: 0
      }
    }
  },

  pickerFooter: {},

  timepickerSection: {
    display: 'flex',
    flexDirection: 'column',

    '.nebular-time-list-listItem': {
      height: size === 'large' ? 'var(--calendar-day-cell-large-height)' : null
    },

    '.nebular-time-list-headerCell': {
      height: size === 'large' ? 'var(--calendar-weekday-large-height)' : null
    },

    ...theme.fns.ltr({
      borderLeft:
        'var(--datepicker-border-width) var(--datepicker-border-style) var(--datepicker-border-color)'
    }),
    ...theme.fns.rtl({
      borderRight:
        'var(--datepicker-border-width) var(--datepicker-border-style) var(--datepicker-border-color)'
    })
  },

  singleColumn: {
    width: 'var(--timepicker-single-column-width)'
  },

  multipleColumns: {
    width: 'var(--timepicker-multiple-column-width)'
  },

  pickerTitle: {
    height: 'var(--timepicker-title-height)',
    padding: 'var(--timepicker-title-padding)'
  }
}));
