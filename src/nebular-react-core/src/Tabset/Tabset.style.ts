import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'block',

    backgroundColor: 'var(--tabset-background-color)',
    borderRadius: 'var(--tabset-border-radius)',
    boxShadow: 'var(--tabset-shadow)',

    '.nebular-badge-dotMode.position-left': {
      left: 'var(--tabset-tab-badge-dot-mode-horizontal-offset)'
    },

    '.nebular-badge-dotMode.position-right': {
      right: 'var(--tabset-tab-badge-dot-mode-horizontal-offset)'
    },

    '.nebular-badge-dotMode.position-start': {
      ...theme.fns.ltr({ left: 'var(--tabset-tab-badge-dot-mode-horizontal-offset)' }),
      ...theme.fns.rtl({ right: 'var(--tabset-tab-badge-dot-mode-horizontal-offset)' })
    },

    '.nebular-badge-dotMode.position-end': {
      ...theme.fns.ltr({ right: 'var(--tabset-tab-badge-dot-mode-horizontal-offset)' }),
      ...theme.fns.rtl({ left: 'var(--tabset-tab-badge-dot-mode-horizontal-offset)' })
    }
  },

  fullWidth: {
    '.nebular-tabset-tabsetUl': {
      justifyContent: 'space-around'
    }
  },

  tabsetUl: {
    display: 'flex',
    flexDirection: 'row',
    listStyleType: 'none',
    margin: 0,
    padding: 0,

    borderBottom:
      'var(--tabset-divider-width) var(--tabset-divider-style) var(--tabset-divider-color)'
  },

  tabLink: {
    backgroundColor: 'var(--tabset-tab-background-color)',
    cursor: 'pointer',
    padding: 'var(--tabset-tab-padding)',
    color: 'var(--tabset-tab-text-color)',
    fontFamily: 'var(--tabset-tab-text-font-family)',
    fontSize: 'var(--tabset-tab-text-font-size)',
    fontWeight: 'var(--tabset-tab-text-font-weight)' as any,
    lineHeight: 'var(--tabset-tab-text-line-height)',
    textTransform: 'var(--tabset-tab-text-transform)' as any,

    '&::before': {
      backgroundColor: 'var(--tabset-tab-underline-color)',
      height: 'var(--tabset-tab-underline-width)'
    }
  },

  tab: {
    flex: 1,
    msFlex: '1 1 auto',
    overflow: 'auto',
    display: 'none',

    backgroundColor: 'var(--tabset-content-background-color)',
    color: 'var(--tabset-content-text-color)',
    fontFamily: 'var(--tabset-content-text-font-family)',
    fontSize: 'var(--tabset-content-text-font-size)',
    fontWeight: 'var(--tabset-content-text-font-weight)' as any,
    lineHeight: 'var(--tabset-content-text-line-height)',
    padding: 'var(--tabset-content-padding)',

    ...theme.fns.scrollbars(
      'var(--tabset-scrollbar-color)',
      'var(--tabset-scrollbar-background-color)',
      'var(--tabset-scrollbar-width)'
    )
  },

  tabActive: {
    display: 'block'
  },

  tabLi: {
    marginBottom: '-1px',
    textAlign: 'center',
    position: 'relative',

    '&:focus': {
      '.nebular-tabset-tabLink': {
        backgroundColor: 'var(--tabset-tab-focus-background-color)',
        color: 'var(--tabset-tab-focus-text-color)',
        '&::before': {
          backgroundColor: 'var(--tabset-tab-focus-underline-color)'
        }
      }
    },

    '&:hover': {
      '.nebular-tabset-tabLink': {
        backgroundColor: 'var(--tabset-tab-hover-background-color)',
        color: 'var(--tabset-tab-hover-text-color)',
        '&::before': {
          backgroundColor: 'var(--tabset-tab-hover-underline-color)'
        }
      }
    },

    '&.active': {
      '.nebular-tabset-tabLink': {
        backgroundColor: 'var(--tabset-tab-active-background-color)',
        color: 'var(--tabset-tab-active-text-color)',
        '&::before': {
          backgroundColor: 'var(--tabset-tab-active-underline-color)'
        }
      }
    },

    '&.active a::before': {
      display: 'block'
    },

    a: {
      display: 'flex',
      position: 'relative',
      textDecoration: 'none',

      '&::before': {
        position: 'absolute',
        content: '""',
        width: '100%',
        borderRadius: '3px',
        bottom: '-2px',
        left: 0
      },

      '.nebular-icon-root': {
        verticalAlign: 'middle'
      },

      '.nebular-icon-root + span': {
        ...theme.fns.ltr({ marginLeft: '0.5rem' }),
        ...theme.fns.rtl({ marginRight: '0.5rem' })
      }
    }
  },

  tabDisabled: {
    cursor: 'default',
    pointerEvents: 'none',

    '.nebular-tabset-tabLink': {
      backgroundColor: 'var(--tabset-tab-disabled-background-color)',
      color: 'var(--tabset-tab-disabled-text-color)',
      cursor: 'default',
      pointerEvents: 'none',
      '&::before': {
        backgroundColor: 'var(--tabset-tab-disabled-underline-color)'
      }
    }
  },

  tabResponsive: {
    '@media screen and (max-width: var(--tabset-tab-text-hide-breakpoint)': {
      '.nebular-tabset-tabText': {
        display: 'none'
      }
    }
  },

  tabText: {}
}));
