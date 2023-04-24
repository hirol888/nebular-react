import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../../../theme/DocsPageTheme';

export default createStyles<DocsPageTheme>((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...theme.fns.mediaBreakpointUp('sm', { flexDirection: 'row', flexWrap: 'wrap' }),

    '.nebular-card-root': {
      fontWeight: 300,
      flex: 1,
      ...theme.fns.mediaBreakpointUp('sm', { marginLeft: '1rem' }),

      '&.invisible': {
        visibility: 'hidden'
      },

      '&:first-of-type': {
        ...theme.fns.mediaBreakpointUp('sm', { marginLeft: 0 })
      },

      a: {
        padding: '2rem',
        textDecoration: 'none',
        color: theme.color_fg_text,
        height: '100%',
        ...theme.fns.mediaBreakpointUp('sm', { padding: '2rem 3rem 2rem 2rem' })
      },

      '.page-title': {
        display: 'flex',
        justifyContent: 'space-between',
        color: theme.color_fg_heading,
        fontWeight: 500,
        fontSize: '1.2rem',
        ...theme.fns.mediaBreakpointUp('sm', { fontSize: '1.5rem', marginBottom: '0.6rem' }),

        '.nebular-icon-root': {
          color: theme.color_fg_highlight,
          marginTop: '0.3rem'
        },

        span: {
          wordWrap: 'normal'
        }
      },

      '.description': {
        display: 'none',
        ...theme.fns.mediaBreakpointUp('sm', { display: 'block' })
      },

      '.left-block': {
        textAlign: 'right'
      }
    }
  }
}));
