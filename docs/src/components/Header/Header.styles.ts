import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../theme/DocsHomeTheme';

export default function useStyles<TTheme extends DocsHomeTheme>() {
  return createStyles<TTheme>((theme) => ({
    root: {
      display: 'flex',
      flex: '1 0 auto',
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: '-15px',
      marginRight: '-15px',

      '.sidebar-toggle-wrapper': {
        padding: '0 0.5rem'
      },

      '.sidebar-toggle': {
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '2.5rem',
        lineHeight: '1rem',
        flex: '1 0 auto',
        padding: 0,
        ...theme.fns.mediaBreakpointUp('xl', { display: 'none' }),

        '&:focus': {
          boxShadow: 'none'
        },

        '.nebular-icon-root': {
          verticalAlign: 'middle',
          fontSize: '1.75rem',
          color: theme.color_fg_heading_light
        }
      },

      '.section': {
        display: 'flex',
        padding: '0.875rem 0.5rem',
        ...theme.fns.mediaBreakpointUp('is', { padding: '0.875rem 1.125rem' }),

        '&.left': {
          width: theme.sidebar_width
        },

        '&.middle': {
          flex: 1,
          alignItems: 'center',
          margin: '0 -0.5rem'
        }
      },

      '.nebular-menu-root': {
        flex: 1,

        '.nebular-menu-menuItems': {
          display: 'flex',
          justifyContent: 'flex-end',
          ...theme.fns.mediaBreakpointUp('lg', { justifyContent: 'flex-start' }),

          '.nebular-menu-menuItem': {
            border: 'none',

            a: {
              color: theme.color_fg_heading_light,
              display: 'block',

              '&:hover, &.active, &:focus': {
                color: theme.header_menu_fg_active,
                outline: 'none !important'
              }
            }
          },

          'li:not(:first-of-type)': {
            display: 'none',
            ...theme.fns.mediaBreakpointUp('md', { display: 'list-item' })
          },

          'li:nth-of-type(2)': {
            ...theme.fns.mediaBreakpointUp('md', { display: 'list-item' })
          }
        }
      },

      '.logo': {
        display: 'flex',
        flex: '1 0 auto',
        flexDirection: 'row',
        ...theme.fns.mediaBreakpointUp('sm', {
          alignItems: 'baseline',
          flex: '1 0 auto'
        }),
        ...theme.fns.mediaBreakpointUp('md', {
          flex: '1 0 auto',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }),

        a: {
          fontSize: '1.275rem',
          color: theme.header_fg,
          textDecoration: 'none !important',
          fontWeight: 'bold',
          ...theme.fns.mediaBreakpointUp('sm', { marginRight: '0.5rem' })
        },

        '.version': {
          display: 'none',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: theme.color_fg_heading_light,
          ...theme.fns.mediaBreakpointUp('sm', { display: 'inline' }),
          ...theme.fns.mediaBreakpointUp('md', { marginLeft: 0 })
        }
      },

      '.stars': {
        width: '95px',
        height: '20px',
        marginLeft: 'auto'
      },

      '.version-select': {
        display: 'none',
        ...theme.fns.mediaBreakpointUp('sm', { display: 'block' })
      },

      '&.docs-page': {
        marginLeft: 0,
        marginRight: 0,

        '.section': {
          '&.left': {
            alignItems: 'center',
            paddingLeft: 0,
            width: 'auto',
            ...theme.fns.mediaBreakpointUp('xl', {
              paddingLeft: '1.125rem',
              width: theme.sidebar_width
            })
          },
          '&.middle': {
            justifyContent: 'space-between',
            ...theme.fns.mediaBreakpointUp('lg', { justifyContent: 'space-between' })
          },
          '&.right': {
            display: 'none',
            marginLeft: 0,
            width: 'auto',
            ...theme.fns.mediaBreakpointUp('md', { display: 'block' }),
            ...theme.fns.mediaBreakpointUp('macpro', {
              marginLeft: '1.875rem',
              width: theme.settings_col_width
            })
          }
        },

        '.nebular-menu-root': {
          flexGrow: 0,
          flexShrink: 1,
          flexBasis: 'auto',
          ...theme.fns.mediaBreakpointUp('lg', { minWidth: '28rem' }),
          ...theme.fns.mediaBreakpointUp('xl', { flex: 1 }),

          '.nebular-menu-menuItems': {
            li: {
              marginTop: '0.25rem',
              display: 'none',
              ...theme.fns.mediaBreakpointUp('lg', { display: 'list-item' })
            },

            'li:first-of-type': {
              ...theme.fns.mediaBreakpointUp('is', { display: 'list-item' })
            }
          }
        },

        '.nebular-docs-search-root': {
          display: 'none',
          ...theme.fns.mediaBreakpointUp('sm', {
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto'
          })
        },

        '.version-select': {
          marginLeft: '1rem'
        },

        '.stars': {
          ...theme.fns.mediaBreakpointUp('md', {
            width: '95px',
            height: '20px',
            marginLeft: 'auto'
          })
        }
      }
    }
  }))();
}
