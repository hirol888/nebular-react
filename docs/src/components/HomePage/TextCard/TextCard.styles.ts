import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>((theme) => ({
  root: {
    display: 'flex',
    flexGrow: 1,
    width: '100%',
    margin: '2rem 0',
    flexDirection: 'column',
    fontSize: '0.75rem',
    textAlign: 'center',

    ...theme.fns.mediaBreakpointUp('md', {
      margin: 0,
      width: '50%',
      fontSize: '1rem',
      padding: '2rem',
      '&:nth-of-type(odd)': {
        borderRight: '1px solid #d9e4ff'
      },

      '&:nth-of-type(1), &:nth-of-type(2)': {
        borderBottom: '1px solid #d9e4ff'
      }
    }),
    ...theme.fns.mediaBreakpointUp('lg', {
      width: '50%',
      fontSize: '1rem',
      padding: '2rem 4rem'
    }),

    '.icon': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      height: '5rem',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',

      ...theme.fns.mediaBreakpointUp('md', { marginTop: '2.5rem', marginBottom: '2.5rem' }),
      ...theme.fns.mediaBreakpointUp('lg', { marginTop: '3.25rem', marginBottom: '3.25rem' })
    },

    h2: {
      color: theme.color_fg_heading,
      fontSize: '1.5rem',
      lineHeight: '2rem',
      fontWeight: 800,
      marginBottom: '0.5rem'
    },

    p: {
      color: '#6e82a9',
      fontSize: '1rem',
      lineHeight: '1.75rem'
    }
  }
}));
