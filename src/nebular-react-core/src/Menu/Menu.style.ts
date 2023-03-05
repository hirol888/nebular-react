import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'block',
    backgroundColor: 'var(--menu-background-color)'
  },

  menuItems: {
    listStyleType: 'none',
    overflow: 'hidden',
    margin: 0,
    padding: 0
  },

  menuTitle: {
    flex: '1 0 auto',
    ...theme.fns.rtl({ textAlign: 'right' })
  },

  menuItem: {
    '&:has(> div a.active)': {
      '& > a': {
        backgroundColor: 'var(--menu-item-active-background-color)',
        color: 'var(--menu-item-active-text-color)',

        '.nebular-menu-menuIcon': {
          color: 'var(--menu-item-icon-active-color)'
        }
      }
    },

    a: {
      display: 'flex',
      textDecoration: 'none',
      alignItems: 'center',

      fontFamily: 'var(--menu-text-font-family)',
      fontSize: 'var(--menu-text-font-size)',
      fontWeight: 'var(--menu-text-font-weight)' as any,
      lineHeight: 'var(--menu-text-line-height)',
      padding: 'var(--menu-item-padding)',

      color: 'var(--menu-text-color)',
      borderRadius: 'var(--menu-item-border-radius)',

      '&.active': {
        backgroundColor: 'var(--menu-item-active-background-color)',
        color: 'var(--menu-item-active-text-color)',

        '.nebular-menu-menuIcon': {
          color: 'var(--menu-item-icon-active-color)'
        }
      },

      '&:hover': {
        backgroundColor: 'var(--menu-item-hover-background-color)',
        color: 'var(--menu-item-hover-text-color)',
        cursor: 'var(--menu-item-hover-cursor)',

        '.nebular-menu-menuIcon': {
          color: 'var(--menu-item-icon-hover-color)'
        }
      }
    },

    '.nebular-badge-root': {
      position: 'static'
    },

    borderBottom:
      'var(--menu-item-divider-width) var(--menu-item-divider-style) var(--menu-item-divider-color)',

    '&:first-of-type': {
      borderTop: 'none'
    },

    '&:last-of-type': {
      borderBottom: 'none'
    },

    '.nebular-menu-menuItem:first-of-type': {
      borderTop:
        'var(--menu-item-divider-width) var(--menu-item-divider-style) var(--menu-item-divider-color)'
    },

    '& > div > .nebular-menu-menuItems': {
      listStyleType: 'none',
      overflow: 'hidden',
      backgroundColor: 'var(--menu-submenu-background-color)',
      margin: 'var(--menu-submenu-margin)',
      padding: 'var(--menu-submenu-padding)'
    },

    '& > .nebular-menu-menuItems > .nebular-menu-menuItem': {
      background: 'var(--menu-submenu-background-color)',
      color: 'var(--menu-submenu-text-color)',

      a: {
        borderColor: 'var(--menu-submenu-item-border-color)',
        borderStyle: 'var(--menu-submenu-item-border-style)',
        borderWidth: 'var(--menu-submenu-item-border-width)',
        padding: 'var(--menu-submenu-item-padding)',

        '&.active': {
          backgroundColor: 'var(--menu-submenu-item-active-background-color)',
          borderColor: 'var(--menu-submenu-item-active-border-color)',
          color: 'var(--menu-submenu-item-active-text-color)',

          '.nebular-menu-menuIcon': {
            color: 'var(--menu-submenu-item-icon-active-color)'
          }
        },

        '&:hover': {
          backgroundColor: 'var(--menu-submenu-item-hover-background-color)',
          borderColor: 'var(--menu-submenu-item-hover-border-color)',
          color: 'var(--menu-submenu-item-hover-text-color)',

          '.nebular-menu-menuIcon': {
            color: 'var(--menu-submenu-item-icon-hover-color)'
          }
        },

        '&.active:hover': {
          backgroundColor: 'var(--menu-submenu-item-active-hover-background-color)',
          borderColor: 'var(--menu-submenu-item-active-hover-border-color)',
          color: 'var(--menu-submenu-item-active-hover-text-color)',

          '.nebular-menu-menuIcon': {
            color: 'var(--menu-submenu-item-icon-active-hover-color)'
          }
        }
      }
    }
  },

  menuIcon: {
    color: 'var(--menu-item-icon-color)',
    fontSize: 'var(--menu-item-icon-width)',
    margin: 'var(--menu-item-icon-margin)',
    width: '1em',
    textAlign: 'center'
  },

  expansionIndicator: {
    color: 'var(--menu-item-icon-color)',
    transitionProperty: 'transform',
    transitionDuration: '300ms',
    transitionTimingFunction: 'ease-out'
  },

  expanded: {
    ...theme.fns.ltr({ transform: 'rotate(-90deg)' }),
    ...theme.fns.rtl({ transform: 'rotate(90deg)' })
  },

  menuGroup: {
    display: 'flex',

    fontFamily: 'var(--menu-text-font-family)',
    fontSize: 'var(--menu-text-font-size)',
    fontWeight: 'var(--menu-text-font-weight)' as any,
    lineHeight: 'var(--menu-text-line-height)',
    padding: 'var(--menu-item-padding)',

    '&, .nebular-icon-root': {
      color: 'var(--menu-group-text-color)'
    }
  }
}));
