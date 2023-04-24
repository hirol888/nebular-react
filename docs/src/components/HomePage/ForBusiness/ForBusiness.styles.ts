import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '55.625rem',
    overflow: 'hidden',

    background: theme.background_basic_color_1,
    border: `1px solid ${theme.border_basic_color_3}`,
    borderRadius: theme.border_radius,
    margin: '0 auto',

    ...theme.fns.mediaBreakpointUp('md', { flexDirection: 'row' }),

    '.left, .right': {
      padding: '2rem'
    },

    '.left': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',

      background: `linear-gradient(87.61deg, ${theme.color_primary_500} 0.85%, ${theme.color_primary_400} 99.82%)`,

      ...theme.fns.mediaBreakpointUp('md', { maxWidth: '21rem', padding: '3rem' })
    },

    '.right': {
      ...theme.fns.mediaBreakpointUp('md', { padding: '3.625rem 2.25rem' })
    },

    '.heading': {
      textAlign: 'center'
    },

    '.submit': {
      margin: 'auto auto 0',

      '&.appearence-filled.status-control': {
        color: theme.text_primary_color,
        textTransform: 'none'
      }
    },

    '.offerings-title': {
      color: `rgba(${theme.color_fg_heading}, 0.5)`
    },

    '.offerings': {
      margin: '1.5rem 0 0',
      padding: 0,
      listStyle: 'none',

      ...theme.fns.mediaBreakpointUp('lg', { columns: 2 })
    },

    '.offering': {
      marginBottom: '0.5rem',

      '&::before': {
        content: "'•'",
        marginRight: '0.15rem'
      }
    },

    '.offerings-title-second-line': {
      ...theme.fns.mediaBreakpointUp('md', { display: 'block' })
    }
  }
}));
