import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../../theme/DocsPageTheme';

export default createStyles<DocsPageTheme>((theme) => ({
  root: {
    display: 'flex',

    code: {
      background: '#f1f2f3',
      color: '#0095ff',
      padding: '0.125rem 0.5rem',
      borderRadius: '0.25rem'
    },

    '.not-found': {
      color: theme.color_fg_heading_light,
      fontSize: '1.25rem'
    },

    '.middle-column': {
      flex: 3,
      minWidth: 0,

      '.page-header': {
        margin: 0
      },

      '.nebular-card-root': {
        '.nebular-card-body-root': {
          padding: '2rem 1rem',

          '> *:last-child': {
            marginBottom: '0 !important',

            '*:last-child': {
              marginBottom: '0 !important'
            }
          },

          ...theme.fns.mediaBreakpointUp('md', { padding: '2rem 3rem 2rem 2rem' })
        }
      },

      'h3, h4, h5, h6': {
        marginBottom: '1.25rem',
        marginTop: '3rem'
      },

      'h1, h2, h3': {
        marginBottom: '1.25rem',
        marginTop: 0,
        fontFamily: theme.text_heading_4_font_family,
        fontSize: theme.text_heading_4_font_size,
        fontWeight: theme.text_heading_4_font_weight,
        lineHeight: theme.text_heading_4_line_height
      },

      h3: {
        color: theme.color_fg_heading_light
      },

      p: {
        fontSize: '0.9375rem',
        lineHeight: '1.5'
      },

      img: {
        maxWidth: '100%'
      },

      pre: {
        marginBottom: '2rem'
      },

      '.widget-block': {
        display: 'block',
        marginBottom: '2rem'
      },

      // ngd-styles-table-block table {
      //   margin-bottom: 0;
      // }

      table: {
        fontSize: '0.9375rem',
        width: '100%',
        marginBottom: '3rem',
        thead: {
          color: '#8994a3',
          borderBottom: '1px solid #f1f2f3',
          td: {
            padding: '1rem 0.5rem'
          }
        },

        tr: {
          borderBottom: '1px solid #f1f2f3',

          '&:last-child': {
            border: 'none'
          },
          p: {
            marginBottom: 0
          }
        },

        td: {
          padding: '1rem 0.5rem',

          '&:first-of-type': {
            fontWeight: 500
          }
        },

        '&.striped': {
          'tbody tr:nth-of-type(odd)': {
            background: '#f5f6f7'
          }
        }
      },

      ul: {
        marginBottom: '1.5rem',
        ul: {
          paddingLeft: '2.5rem',
          listStyleType: 'none',
          '& > li': {
            textIndent: '-5px',
            position: 'relative',
            marginBottom: 0,

            '&::before': {
              content: "'-'",
              position: 'absolute',
              left: '-1.25rem'
            }
          }
        },
        li: {
          fontSize: '0.9375rem',
          lineHeight: 1.5,
          marginBottom: '1.5rem'
        }
      },

      '.note': {
        padding: '1.25rem 3rem 1.5rem 1.25rem',
        borderRadius: '0.25rem',
        marginBottom: '3rem',

        '.note-title': {
          fontWeight: 500,
          textTransform: 'uppercase',
          marginBottom: '1.5rem'
        },

        '.note-body': {
          fontSize: '0.875rem',
          lineHeight: 1.5
        },

        '.background-bundle-link': {
          color: theme.color_success_500
        },

        '&.note-info': {
          color: theme.color_info_500,
          backgroundColor: '#f0f6ff'
        },

        '&.note-warning': {
          color: theme.color_warning_500,
          backgroundColor: '#fffae4'
        }
      },

      '.color-swatch': {
        display: 'inline-block',
        border: '1px solid black',
        width: '0.875rem',
        height: '0.875rem',
        marginLeft: '7px',
        marginBottom: '-2px',
        borderRadius: '2px'
      }
    },

    '.horizontal-nav': {
      marginTop: '1rem',

      '.nebular-card-body-root': {
        backgroundColor: theme.layout_background_color,
        padding: 0,
        overflow: 'visible',

        ...theme.fns.mediaBreakpointUp('macpro', { display: 'none' })
      },

      ...theme.fns.mediaBreakpointUp('lg', { marginTop: 0 })
    },

    '.settings-column': {
      display: 'none',

      ...theme.fns.mediaBreakpointUp('macpro', {
        display: 'block',
        marginLeft: theme.settings_col_margin,
        width: theme.settings_col_width

        // ngd-page-tabs {
        //   margin-bottom: 1.5rem;
        // }
      })
    },

    '.fixed-panel': {
      ...theme.fns.mediaBreakpointUp('macpro', {
        position: 'fixed',
        top: '6rem',
        width: 'inherit',
        overflowY: 'auto',
        height: 'calc(100vh - 6rem)',
        padding: '1.5rem 1.5rem 0',

        ...theme.fns.scrollbars(
          theme.sidebar_scrollbar_color,
          theme.sidebar_scrollbar_background_color,
          theme.sidebar_scrollbar_width
        )
      })
    }
  }
}));
