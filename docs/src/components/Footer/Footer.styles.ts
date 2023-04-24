import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>((theme) => ({
  root: {
    display: 'flex',
    flex: 1,
    flexWrap: 'wrap',
    paddingTop: '1.25rem',
    justifyContent: 'space-around',

    '> div': {
      display: 'flex',
      marginRight: 0,
      justifyContent: 'center',
      width: '100%',

      ...theme.fns.mediaBreakpointUp('md', {
        justifyContent: 'flex-start',
        marginRight: '2rem',
        width: 'auto'
      }),

      '&:last-of-type': {
        marginRight: 0
      },

      ul: {
        listStyle: 'none',
        paddingLeft: 0
      },

      li: {
        display: 'flex',
        marginBottom: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',

        ...theme.fns.mediaBreakpointUp('md', {
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          textAlign: 'left'
        })
      },

      '&.logo': {
        display: 'none'
      },

      '.title': {
        color: theme.color_fg_heading,
        fontSize: '1.125rem',
        fontWeight: 'bold',
        lineHeight: '1.375rem'
      },

      '.copy': {
        color: theme.footer_text_color,
        display: 'list-item',
        fontSize: '0.75rem'
      },

      '.social': {
        display: 'flex',
        flexDirection: 'row',
        a: {
          color: theme.footer_icon_color,
          marginRight: '1rem',

          '.nebular-icon-root': {
            fontSize: '3rem'
          }
        }
      }
    },

    '> div.logo': {
      display: 'none',

      ...theme.fns.mediaBreakpointUp('lg', {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '-2.5rem',
        textAlign: 'center',
        justifyContent: 'center',

        img: {
          maxWidth: '9rem'
        }
      })
    }
  }
}));
