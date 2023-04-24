import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>((theme) => ({
  root: {
    border: `1px solid ${theme.border_basic_color_3}`,
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    display: 'flex',
    padding: '3rem 1rem 3.625rem',
    flexGrow: 1,
    width: '100%',
    margin: '1.25rem 0',
    flexDirection: 'column',
    cursor: 'pointer',
    maxWidth: '30rem',
    position: 'relative',

    ...theme.fns.mediaBreakpointUp('md', { margin: '1.25rem', width: 'calc(50% - 2.5rem)' }),
    ...theme.fns.mediaBreakpointUp('lg', {
      width: 'calc(33% - 2.5rem)',
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem'
    }),

    '&::before': {
      borderRadius: '7px',
      content: "''",
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boxShadow: '0 8px 24px 0 rgba(0, 31, 97, 0.07)',
      opacity: 0,
      transition: 'opacity 0.25s ease'
    },

    h2: {
      color: `rgba(${theme.color_fg_heading} 0.5)`,
      fontSize: '1.5rem',
      fontWeight: 'bold',
      lineHeight: '1.8125rem',
      textAlign: 'center',
      transition: 'color 0.25 ease'
    },

    p: {
      color: theme.color_fg_text,
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      textAlign: 'center'
    },

    '&:hover, &:active': {
      '&::before': {
        opacity: 1
      },

      h2: {
        color: `rgba(${theme.color_fg_heading} 1)`
      }
    }
  }
}));
