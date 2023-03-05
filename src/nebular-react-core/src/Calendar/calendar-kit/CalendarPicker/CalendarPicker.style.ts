import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'block',
    paddingTop: 'var(--calendar-picker-padding-top)',
    paddingBottom: 'var(--calendar-picker-padding-bottom)',

    ...theme.fns.ltr({
      paddingRight: 'var(--calendar-picker-padding-end)',
      paddingLeft: 'var(--calendar-picker-padding-start)'
    }),
    ...theme.fns.rtl({
      paddingRight: 'var(--calendar-picker-padding-start)',
      paddingLeft: 'var(--calendar-picker-padding-end)'
    }),

    '.cell-content': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',

      borderRadius: 'var(--calendar-border-radius)'
    },

    '.day-cell, .month-cell, .year-cell': {
      display: 'flex',

      alignItems: 'center',
      justifyContent: 'center',

      fontFamily: 'var(--calendar-text-font-family)',
      fontSize: 'var(--calendar-text-font-size)',
      fontWeight: 'var(--calendar-text-font-weight)' as any,
      lineHeight: 'var(--calendar-text-line-height)',
      color: 'var(--calendar-text-color)',
      textTransform: 'uppercase',

      cursor: 'pointer',

      // '&, & .cell-content': {
      //   ...'var(--fn.transition(['background-color', 'border-color', 'color'])
      // },

      '&.empty, &.disabled': {
        cursor: 'default'
      },

      '&.bounding-month': {
        color: 'var(--calendar-cell-inactive-text-color)'
      },

      '&:not(.disabled):not(.empty)': {
        '&:hover .cell-content': {
          backgroundColor: 'var(--calendar-cell-hover-background-color)',
          borderColor: 'var(--calendar-cell-hover-border-color)',
          color: 'var(--calendar-cell-hover-text-color)',
          fontSize: 'var(--calendar-cell-hover-text-font-size)',
          fontWeight: 'var(--calendar-cell-hover-text-font-weight)' as any,
          lineHeight: 'var(--calendar-cell-hover-text-line-height)'
        },

        '&:active .cell-content': {
          backgroundColor: 'var(--calendar-cell-active-background-color)',
          borderColor: 'var(--calendar-cell-active-border-color)',
          color: 'var(--calendar-cell-active-text-color)',
          fontSize: 'var(--calendar-cell-active-text-font-size)',
          fontWeight: 'var(--calendar-cell-active-text-font-weight)' as any,
          lineHeight: 'var(--calendar-cell-active-text-line-height)'
        },

        '&.today .cell-content': {
          backgroundColor: 'var(--calendar-cell-today-background-color)',
          border: '1px solid var(--calendar-cell-today-border-color)',
          color: 'var(--calendar-cell-today-text-color)',
          fontSize: 'var(--calendar-cell-today-text-font-size)',
          fontWeight: 'var(--calendar-cell-today-text-font-weight)' as any,
          lineHeight: 'var(--calendar-cell-today-text-line-height)',

          '&:hover': {
            backgroundColor: 'var(--calendar-cell-today-hover-background-color)',
            borderColor: 'var(--calendar-cell-today-hover-border-color)'
          },

          '&:active': {
            backgroundColor: 'var(--calendar-cell-today-active-background-color)',
            borderColor: 'var(--calendar-cell-today-active-border-color)'
          }
        },

        '&.selected .cell-content': {
          backgroundColor: 'var(--calendar-cell-selected-background-color)',
          borderColor: 'var(--calendar-cell-selected-border-color)',
          color: 'var(--calendar-cell-selected-text-color)',
          fontSize: 'var(--calendar-cell-selected-text-font-size)',
          fontWeight: 'var(--calendar-cell-selected-text-font-weight)' as any,
          lineHeight: 'var(--calendar-cell-selected-text-line-height)',

          '&:hover': {
            backgroundColor: 'var(--calendar-cell-selected-hover-background-color)',
            borderColor: 'var(--calendar-cell-selected-hover-border-color)'
          },

          '&:active': {
            backgroundColor: 'var(--calendar-cell-selected-active-background-color)',
            borderColor: 'var(--calendar-cell-selected-active-border-color)'
          }
        },

        '&.today.selected': {
          backgroundColor: 'var(--calendar-cell-selected-background-color)',
          borderRadius: 'var(--calendar-border-radius)',

          '.cell-content': {
            backgroundColor: 'var(--calendar-cell-today-selected-background-color)',
            borderColor: 'var(--calendar-cell-today-selected-border-color)',
            color: 'var(--calendar-cell-today-selected-text-color)',

            '&:hover': {
              backgroundColor: 'var(--calendar-cell-today-selected-hover-background-color)',
              borderColor: 'var(--calendar-cell-today-selected-hover-border-color)'
            },

            '&:focus': {
              backgroundColor: 'var(--calendar-cell-today-selected-active-background-color)',
              borderColor: 'var(--calendar-cell-today-selected-active-border-color)'
            }
          }
        }
      },

      '&.disabled': {
        color: 'var(--calendar-cell-disabled-text-color)',

        '&.today .cell-content': {
          border: '1px solid var(--calendar-cell-today-disabled-border-color)'
        }
      }
    },

    '.range-cell.in-range.selected:not(.disabled):not(.empty)': {
      backgroundColor: 'var(--calendar-cell-selected-background-color)',
      borderRadius: 0,

      '&.start': {
        ...theme.fns.ltr({
          borderTopLeftRadius: 'var(--calendar-border-radius)',
          borderBottomLeftRadius: 'var(--calendar-border-radius)'
        }),
        ...theme.fns.rtl({
          borderTopRightRadius: 'var(--calendar-border-radius)',
          borderBottomRightRadius: 'var(--calendar-border-radius)'
        })
      },

      '&.end': {
        ...theme.fns.ltr({
          borderTopRightRadius: 'var(--calendar-border-radius)',
          borderBottomRightRadius: 'var(--calendar-border-radius)'
        }),
        ...theme.fns.rtl({
          borderTopLeftRadius: 'var(--calendar-border-radius)',
          borderBottomLeftRadius: 'var(--calendar-border-radius)'
        })
      }
    }
  }
}));
