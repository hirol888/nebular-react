import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>((theme) => ({
  root: {
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignItems: 'flex-start',
    flex: '0 1 auto',
    padding: 0,

    ...theme.fns.mediaBreakpointUp('is', { paddingLeft: 0, paddingRight: 0, marginTop: '4rem' }),
    ...theme.fns.mediaBreakpointUp('md', { marginTop: '2rem' }),
    ...theme.fns.mediaBreakpointUp('lg', { paddingBottom: 0 }),

    '.block': {
      width: '100%',
      flex: '1 0 auto',
      paddingTop: '4rem',
      paddingBottom: '4rem',
      fontSize: '0.75rem',

      '.row': {
        marginLeft: '-15px',
        marginRight: '-15px'
      },

      ...theme.fns.mediaBreakpointUp('sm', { maxWidth: '40rem' }),
      ...theme.fns.mediaBreakpointUp('md', { fontSize: '0.875rem' }),
      ...theme.fns.mediaBreakpointUp('lg', { fontSize: '1rem', marginRight: '2rem' })
    },

    '.hero-features': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignContent: 'stretch',
      width: '100%',
      marginTop: '2rem',
      ...theme.fns.mediaBreakpointUp('sm', { marginTop: '3rem' }),
      ...theme.fns.mediaBreakpointUp('md', { marginTop: '5rem' })
    },

    '.hero-feature': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start',
      alignContent: 'flex-start',
      alignItems: 'center',

      width: '100%',
      maxWidth: '16rem',
      marginBottom: '1.5rem'
    },

    '.hero-promo': {
      color: theme.color_fg_heading_light,
      marginBottom: '2rem'
    },

    '.feature-key': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignContent: 'flex-start',
      alignItems: 'center',

      flex: '0 0 auto',
      height: '3rem',
      width: '3rem',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      borderRadius: '0.5rem',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      fontSize: '1.125rem',
      fontWeight: 800,
      lineHeight: 1.3,
      textShadow: '0 12px 34px 0 rgba(0, 60, 183, 0.25)',
      marginRight: '1rem'
    },

    '.feature-title': {
      color: '#ffffff',
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      marginBottom: 0,
      marginTop: 0
    },

    '.right-block': {
      display: 'none',

      ...theme.fns.mediaBreakpointUp('sm', {
        flex: '1 0 auto',
        display: 'flex',
        paddingTop: '1.75rem'
      }),
      ...theme.fns.mediaBreakpointUp('md', { paddingTop: '3.75rem', marginLeft: '-1rem' }),
      ...theme.fns.mediaBreakpointUp('lg', { paddingTop: '7rem' }),
      ...theme.fns.mediaBreakpointUp('xl', { paddingTop: '5rem' })
    },

    '.hero-components': {
      backgroundImage: "url('../../../../hero-components.svg')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      width: '46rem',
      paddingTop: '78%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',

      ...theme.fns.mediaBreakpointUp('md', { width: '46rem' }),
      ...theme.fns.mediaBreakpointUp('lg', { width: '46rem' }),
      ...theme.fns.mediaBreakpointUp('xl', { width: '46rem' }),
      ...theme.fns.mediaBreakpointUp('macpro', { width: '52rem' }),
      ...theme.fns.mediaBreakpointUp('xxl', { width: '56.5rem' })
    },

    h1: {
      fontSize: '2.4rem',
      lineHeight: '1.125em',
      fontWeight: 'bold',
      marginTop: 0,
      marginBottom: '2rem',
      textShadow: '0 12px 34px rgba(0, 60, 183, 0.25)',
      color: theme.color_fg_heading_light,

      ...theme.fns.mediaBreakpointUp('sm', { fontSize: '3rem' }),
      ...theme.fns.mediaBreakpointUp('md', { fontSize: '3.5rem' })
    },

    'h2, h3': {
      color: theme.color_fg_heading_light
    },

    p: {
      fontSize: '1rem',
      lineHeight: '1.75em',
      paddingRight: '3em',
      marginBottom: '3rem'
    },

    '.badges': {
      display: 'flex',
      marginBottom: '1.5rem',
      flexDirection: 'row',
      alignItems: 'center',

      '.stars': {
        width: '95px',
        height: '20px',
        marginRight: '1rem'
      }
    },

    '.btn-wrapper': {
      display: 'inline-block',
      marginBottom: '1em',

      ...theme.fns.mediaBreakpointUp('sm', { maxWidth: '11.2rem' }),

      '&:not(:last-of-type)': {
        marginRight: '1rem'
      },

      '.btn': {
        fontSize: '1em',
        fontWeight: 'bold',
        borderRadius: '3px',
        border: 'none',
        background: 'linear-gradient(90deg, #18f297 0%, #00e6e6 100%)',
        padding: '0.8em 1.5em',
        boxShadow: '0 12px 34px rgba(0, 60, 183, 0.25)',
        textDecoration: 'none !important',
        textTransform: 'none',
        cursor: 'pointer',
        color: 'white',

        ...theme.fns.mediaBreakpointUp('md', { padding: '0.875rem 2em' }),

        '&.get-started, &.download': {
          background: 'white',
          color: '#3381ff'
        },

        '&:hover': {
          boxShadow: '0 18px 34px 0 rgba(0, 60, 183, 0.35)'
        },

        '&:active': {
          boxShadow: 'inset 0 1px 3px 0 rgba(0, 60, 183, 0.5)'
        }
      }
    }
  }
}));
