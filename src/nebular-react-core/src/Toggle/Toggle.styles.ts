import { ComponentOrCustomStatus, createStyles } from '@nebular-react/styles';

export interface ToggleStylesParams {
  status: ComponentOrCustomStatus;
}

export default createStyles((theme, { status }: ToggleStylesParams) => ({
  root: {
    display: 'inline-flex',
    outline: 'none'
  },

  toggle: {
    height: 'var(--toggle-height)',
    width: 'var(--toggle-width)',
    borderWidth: 'var(--toggle-border-width)',
    borderStyle: 'solid',
    borderRadius: 'var(--toggle-border-radius)',
    cursor: 'var(--toggle-cursor)',

    backgroundColor: `var(--toggle-${status}-background-color)`,
    borderColor: `var(--toggle-${status}-border-color)`,

    ...theme.fns.transition(['background-color', 'border', 'box-shadow']),

    position: 'relative',
    display: 'inline-flex',
    boxSizing: 'content-box'
  },

  nativeInput: {
    '&:enabled:focus + .nebular-toggle-toggle': {
      backgroundColor: `var(--toggle-${status}-focus-background-color)`,
      borderColor: `var(--toggle-${status}-focus-border-color)`,

      '.nebular-toggle-checked': {
        backgroundColor: `var(--toggle-${status}-focus-checked-background-color)`,
        borderColor: `var(--toggle-${status}-focus-checked-border-color)`
      },

      ...theme.fns.outline('var(--toggle-outline-width)', 'var(--toggle-outline-color)')
    },

    '&:active + .nebular-toggle-toggle': {
      backgroundColor: `var(--toggle-${status}-active-background-color)`,
      borderColor: `var(--toggle-${status}-active-border-color)`,

      '.nebular-toggle-checked': {
        backgroundColor: `var(--toggle-${status}-active-checked-background-color)`,
        borderColor: `var(--toggle-${status}-active-checked-border-color)`
      }
    },

    '&:disabled + .nebular-toggle-toggle': {
      cursor: 'var(--toggle-disabled-cursor)',

      backgroundColor: `var(--toggle-${status}-disabled-background-color)`,
      borderColor: `var(--toggle-${status}-disabled-border-color)`,

      '.nebular-toggle-toggleSwitcher': {
        backgroundColor: `var(--toggle-${status}-disabled-switcher-background-color)`,

        '.nebular-icon-root': {
          color: `var(--toggle-${status}-disabled-checked-switcher-checkmark-color)`
        }
      }
    },

    '&:disabled ~ .nebular-toggle-text': {
      color: `var(--toggle-${status}-disabled-text-color)`
    },

    '&:enabled + .nebular-toggle-toggle:hover': {
      backgroundColor: `var(--toggle-${status}-hover-background-color)`,
      borderColor: `var(--toggle-${status}-hover-border-color)`,

      '.nebular-toggle-checked': {
        backgroundColor: `var(--toggle-${status}-hover-checked-background-color)`,
        borderColor: `var(--toggle-${status}-hover-checked-border-color)`
      }
    }
  },

  toggleSwitcher: {
    width: 'var(--toggle-switcher-size)',
    height: 'var(--toggle-switcher-size)',

    '.nebular-icon-root': {
      height: 'var(--toggle-switcher-icon-size)',
      width: 'var(--toggle-switcher-icon-size)',

      color: `var(--toggle-${status}-checked-switcher-checkmark-color)`,

      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },

    backgroundColor: `var(--toggle-${status}-checked-switcher-background-color)`,

    ...theme.fns.ltr({ transition: 'left 0.15s', left: 0 }),
    ...theme.fns.rtl({ transition: 'right 0.15s', right: 0 }),

    position: 'absolute',
    borderRadius: '50%',
    margin: '1px'
  },

  text: {
    fontFamily: 'var(--toggle-text-font-family)',
    fontSize: 'var(--toggle-text-font-size)',
    fontWeight: 'var(--toggle-text-font-weight)' as any,
    lineHeight: 'var(--toggle-text-line-height)',

    color: `var(--toggle-${status}-text-color)`
  },

  checked: {
    backgroundColor: `var(--toggle-${status}-checked-background-color)`,
    borderColor: `var(--toggle-${status}-checked-border-color)`,

    '.nebular-toggle-toggleSwitcher': {
      ...theme.fns.ltr({
        left: 'calc(100% - var(--toggle-switcher-size) - var(--toggle-border-width) * 2)'
      }),
      ...theme.fns.rtl({
        right: 'calc(100% - var(--toggle-switcher-size) - var(--toggle-border-width) * 2)'
      })
    }
  },

  toggleLabelLeft: {
    '.nebular-toggle-text:not(:empty)': {
      paddingRight: '0.6875rem',
      ...theme.fns.ltr({ order: -1 }),
      ...theme.fns.rtl({ order: 1 })
    }
  },

  toggleLabelRight: {
    '.nebular-toggle-text:not(:empty)': {
      paddingLeft: '0.6875rem',
      ...theme.fns.ltr({ order: 1 }),
      ...theme.fns.rtl({ order: -1 })
    }
  },

  toggleLabelStart: {
    '.nebular-toggle-toggleLabel': {
      flexDirection: 'row-reverse'
    },

    '.nebular-toggle-text:not(:empty)': {
      ...theme.fns.ltr({ paddingRight: '0.6875rem' }),
      ...theme.fns.rtl({ paddingLeft: '0.6875rem' })
    }
  },

  toggleLabelEnd: {
    '.nebular-toggle-text:not(:empty)': {
      ...theme.fns.ltr({ paddingLeft: '0.6875rem' }),
      ...theme.fns.rtl({ paddingRight: '0.6875rem' })
    }
  },

  toggleLabel: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center'
  }
}));
