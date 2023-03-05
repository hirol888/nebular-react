import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 'auto',
    order: 0,

    backgroundColor: 'var(--sidebar-background-color)',
    boxShadow: 'var(--sidebar-shadow)',
    color: 'var(--sidebar-text-color)',
    fontFamily: 'var(--sidebar-text-font-family)',
    fontSize: 'var(--sidebar-text-font-size)',
    fontWeight: 'var(--sidebar-text-font-weight)' as any,
    lineHeight: 'var(--sidebar-text-line-height)',
    width: 'var(--sidebar-width)',

    '&.nebular-sidebar-fixed.nebular-sidebar-left.nebular-sidebar-collapsed + .nebular-layout-content, &.nebular-sidebar-fixed.nebular-sidebar-start.nebular-sidebar-collapsed + .nebular-layout-content':
      {
        marginLeft: 0
      },

    '&.nebular-sidebar-fixed.nebular-sidebar-right.nebular-sidebar-collapsed + .nebular-layout-content, &.nebular-sidebar-fixed.nebular-sidebar-end.nebular-sidebar-collapsed + .nebular-layout-content':
      {
        marginRight: 0
      },

    '.nebular-menu-root': {
      margin: '0 calc(var(--sidebar-padding) * -1) calc(var(--sidebar-padding) * -1)'
    }
  },

  scrollable: {
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1,

    padding: 'var(--sidebar-padding)',
    position: 'relative',

    WebkitTransform: 'translate3d(0, 0, 0)',
    ...theme.fns.mediaBreakpointDown('sm', {
      overflowY: 'scroll',
      WebkitOverflowScrolling: 'touch'
    }),
    ...theme.fns.scrollbars(
      'var(--sidebar-scrollbar-color)',
      'var(--sidebar-scrollbar-background-color)',
      'var(--sidebar-scrollbar-width)'
    )
  },

  container: {
    transform: 'translate3d(0, 0, 0)',
    display: 'flex',
    flexDirection: 'column',

    height: 'var(--sidebar-height)',
    width: 'var(--sidebar-width)'
  },

  containerFixed: {
    position: 'fixed'
  },

  right: {
    ...theme.fns.ltr({ order: 2 }),
    ...theme.fns.rtl({ order: 0 }),
    marginRight: 0,
    marginLeft: 'auto'
  },

  end: {
    order: 2,
    ...theme.fns.ltr({ marginRight: 0, marginLeft: 'auto' }),
    ...theme.fns.rtl({ marginLeft: 0, marginRight: 'auto' })
  },

  left: {
    ...theme.fns.ltr({ order: 0 }),
    ...theme.fns.rtl({ order: 2 })
  },

  start: {},

  fixed: {
    position: 'fixed',
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    zIndex: 999,
    top: 0,
    bottom: 0,
    left: 0,

    '&.nebular-sidebar-right': {
      right: 0
    },

    '&.nebular-sidebar-start': {
      ...theme.fns.ltr({ left: 0 }),
      ...theme.fns.rtl({ right: 0 })
    },

    '&.nebular-sidebar-end': {
      ...theme.fns.ltr({ right: 0 }),
      ...theme.fns.rtl({ left: 0 })
    }
  },

  collapsed: {
    width: 0,
    padding: 0,

    '.nebular-sidebar-container': {
      width: 0,
      padding: 0
    },

    '.nebular-sidebar-scrollable': {
      width: 0,
      padding: 0,
      overflow: 'hidden'
    },

    '.nebular-sidebar-header-root, .nebular-sidebar-footer-root': {
      width: 0,
      padding: 0,
      overflow: 'hidden'
    }
  },

  compacted: {
    width: 'var(--sidebar-width-compact)',

    '.nebular-sidebar-container': {
      width: 'var(--sidebar-width-compact)'
    },

    '.nebular-menu-root': {
      width: 'var(--sidebar-width-compact)',

      '.nebular-menu-menuItem a.active': {
        position: 'relative',

        '&::before': {
          position: 'absolute',
          content: '""',
          ...theme.fns.ltr({ left: 0 }),
          ...theme.fns.rtl({ right: 0 }),
          top: 0,
          height: '100%',
          width: '4px',
          background: 'var(--sidebar-menu-item-highlight-color)'
        }
      },

      '.nebular-menu-menuItems > .nebular-menu-menuItem > .nebular-menu-menuGroup': {
        display: 'none'
      },

      '.nebular-menu-menuItems > .nebular-menu-menuItem > a': {
        'span, .nebular-badge-root, .nebular-menu-expansionIndicator': {
          display: 'none'
        }
      },

      '.nebular-menu-menuItems > .nebular-menu-menuItem': {
        transition: 'border-color 1s ease',

        '&.nebular-menu-group': {
          display: 'block',
          color: 'transparent',
          width: 0,
          padding: 0,
          overflow: 'hidden'
        },

        i: {
          marginRight: 0
        },

        a: {
          justifyContent: 'center'
        },

        '& > .nebular-menu-expanded': {
          display: 'none'
        }
      }
    },

    '&.nebular-sidebar-left.nebular-sidebar-fixed ~ .nebular-layout-content': {
      marginLeft: 'var(--sidebar-width-compact)'
    },

    '&.nebular-sidebar-right.nebular-sidebar-fixed ~ .nebbular-layout-content': {
      marginLeft: 0,
      marginRight: 'var(--sidebar-width-compact)'
    },

    '&.nebular-sidebar-left.nebular-sidebar-fixed ~ .nebular-layout-content.nebular-sidebar-center':
      {
        paddingLeft: 'var(--sidebar-width-compact)'
      },

    '&.nebular-sidebar-right.nebular-sidebar-fixed ~ .nebular-layout-content.nebular-sidebar-center':
      {
        paddingLeft: 0,
        paddingRight: 'var(--sidebar-width-compact)'
      },

    '&.nebular-sidebar-start.nebular-sidebar-fixed ~ .nebular-layout-content': {
      ...theme.fns.ltr({ marginLeft: 'var(--sidebar-width-compact)' }),
      ...theme.fns.rtl({ marginRight: 'var(--sidebar-width-compact)' })
    },

    '&.nebular-sidebar-end.nebular-sidebar-fixed ~ .nebular-layout-content': {
      ...theme.fns.ltr({ marginRight: 'var(--sidebar-width-compact)' }),
      ...theme.fns.rtl({ marginLeft: 'var(--sidebar-width-compact)' })
    },

    '&.nebular-sidebar-start.nebular-sidebar-fixed ~ .nebular-layout-content.nebular-layout-contentCenter':
      {
        ...theme.fns.ltr({ paddingLeft: 'var(--sidebar-width-compact)' }),
        ...theme.fns.rtl({ paddingRight: 'var(--sidebar-width-compact)' })
      },

    '&.nebular-sidebar-end.nebular-sidebar-fixed ~ .nebular-layout-content.nebular-layout-contentCenter':
      {
        ...theme.fns.ltr({ paddingRight: 'var(--sidebar-width-compact)' }),
        ...theme.fns.rtl({ paddingLeft: 'var(--sidebar-width-compact)' })
      }
  },

  expanded: {
    width: 'var(--sidebar-width)',
    '> .nebular-sidebar-scrollable': {
      width: 'var(--sidebar-width)'
    }
  }
}));
