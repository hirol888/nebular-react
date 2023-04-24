import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../theme/DocsPageTheme';

export default createStyles<DocsPageTheme>((theme) => ({
  root: {
    '.menu-sidebar': {
      backgroundColor: theme.layout_background_color,

      '&.fixed': {
        boxShadow: '8px 0 20px 0 rgba(218, 224, 235, 0.6)'
      }
    },

    '.content-center': {
      maxWidth: theme.content_width,
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      flexWrap: 'wrap'
    },

    '.contact-us': {
      padding: '5rem 1rem',
      ...theme.fns.mediaBreakpointUp('xl', { padding: '5rem 0' }),

      h2: {
        fontFamily: theme.text_heading_4_font_family,
        fontSize: theme.text_heading_4_font_size,
        fontWeight: 'normal',
        lineHeight: theme.text_heading_4_line_height
      }
    },

    '.collapse-all': {
      position: 'absolute',
      right: '0.5rem',
      top: '1.05rem',

      '.nebular-button-root': {
        fontSize: '0.75rem',
        color: theme.text_hint_color,
        appearance: 'none',
        background: 'none',
        border: 'none',
        textTransform: 'none',
        padding: 0,
        fontWeight: 400,
        lineHeight: 1.15,

        '&:focus': {
          boxShadow: 'none'
        }
      }
    },

    '.nebular-sidebar-container': {
      paddingTop: '3rem',

      '.nebular-sidebar-scrollable': {
        paddingTop: 0
      }
    },

    '.nebular-layout-layoutContainer': {
      maxWidth: theme.content_width,
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto'
    },

    '.nebular-sidebar-root .nebular-menu-root': {
      '.menu-group': {
        paddingLeft: 0
      },

      '.nebular-icon-root': {
        display: 'none'
      },

      '.nebular-menu-menuItem': {
        border: 'none !important',

        '.nebular-menu-menuTitle': {
          flex: '1 1 auto'
        }
      },

      '.nebular-menu-menuItems .nebular-menu-menuItem a': {
        '&:hover, &.active, &:focus': {
          outline: 'none !important'
        }
      }
    },

    '.nebular-layout-footer-root .contact': {
      display: 'none'
    },

    '.nebular-layout-footer-root': {
      ...theme.fns.mediaBreakpointUp('macpro', {
        marginRight: `calc(${theme.settings_col_width} + ${theme.settings_col_margin})`
      })
    }
  }
}));
