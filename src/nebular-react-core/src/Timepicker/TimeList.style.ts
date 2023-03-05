import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  timeList: {
    overflow: 'hidden',
    marginBottom: 0,

    '.nebular-card-header-root, .nebular-card-footer-root': {
      flex: '0 0 auto'
    },

    width: 'var(--timepicker-container-width)',
    height: 'var(--timepicker-container-height)'
  },

  valuesList: {
    width: '100%',
    overflow: 'hidden',

    '&:hover': {
      overflowY: 'auto'
    },

    scrollSnapType: 'y proximity',

    '&:not(:last-of-type)': {
      ...theme.fns.ltr({
        borderRight:
          'var(--timepicker-border-width) var(--timepicker-border-style) var(--timepicker-border-color)'
      }),
      ...theme.fns.rtl({
        borderLeft:
          'var(--timepicker-border-width) var(--timepicker-border-style) var(--timepicker-border-color)'
      })
    },

    ...theme.fns.scrollbars(
      'var(--timepicker-scrollbar-color)',
      'var(--timepicker-scrollbar-background-color)',
      'var(--timepicker-scrollbar-width)'
    )
  },

  listItem: {
    border: 0,
    padding: 0,
    cursor: 'pointer',

    '&:first-of-type': {
      borderTop: 'none'
    },

    '&:hover': {
      backgroundColor: 'var(--timepicker-cell-hover-background-color)',
      color: 'var(--timepicker-cell-hover-text-color)'
    },

    '&:focus': {
      backgroundColor: 'var(--timepicker-cell-focus-background-color)',
      color: 'var(--timepicker-cell-focus-text-color)'
    },

    '&.selected': {
      backgroundColor: 'var(--timepicker-cell-active-background-color)',
      color: 'var(--timepicker-cell-active-text-color)'
    },

    color: 'var(--timepicker-cell-text-color)',
    fontSize: 'var(--timepicker-cell-text-font-size)',
    fontFamily: 'var(--timepicker-cell-text-font-family)',
    height: 'var(--timepicker-cell-height)',
    lineHeight: 'var(--timepicker-cell-text-line-height)',
    fontWeight: 'var(--timepicker-cell-text-font-weight)' as any
  },

  pickerBody: {
    display: 'flex',
    width: '100%',
    flex: '1 0 0',
    overflow: 'hidden'
  },

  columnHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: 0,

    borderBottom:
      'var(--timepicker-border-width) var(--timepicker-border-style) var(--timepicker-border-color)'
  },

  headerCell: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    color: 'var(--timepicker-header-cell-text-color)',
    fontSize: 'var(--timepicker-header-cell-text-font-size)',
    fontFamily: 'var(--timepicker-header-cell-text-font-family)',
    height: 'var(--timepicker-header-cell-height)',
    lineHeight: 'var(--timepicker-header-cell-text-line-height)',
    fontWeight: 'var(--timepicker-header-cell-text-font-weight)' as any,

    '&:not(:last-of-type)': {
      ...theme.fns.ltr({
        borderRight:
          'var(--timepicker-border-width) var(--timepicker-border-style) var(--timepicker-border-color)'
      }),
      ...theme.fns.rtl({
        borderLeft:
          'var(--timepicker-border-width) var(--timepicker-border-style) var(--timepicker-border-color)'
      })
    }
  },

  actionsFooter: {
    width: '100%',

    ...theme.fns.ltr({ paddingLeft: '0.625rem' }),
    ...theme.fns.rtl({ paddingRight: '0.625rem' })
  },

  supportsScrollbarTheming: {
    '.nebular-time-list-valuesList:hover .nebular-time-list-listItem:not(.nebular-time-list-ampmItem)':
      {
        ...theme.fns.ltr({ marginRight: 'calc(var(--timepicker-scrollbar-width) * -1)' }),
        ...theme.fns.rtl({ marginLeft: 'calc(var(--timepicker-scrollbar-width) * -1)' })
      }
  },

  ampmItem: {},

  timepickerCell: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none'
  }
}));
