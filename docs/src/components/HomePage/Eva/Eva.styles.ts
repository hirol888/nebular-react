import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>(() => ({
  root: {
    display: 'flex',

    '.description': {
      flex: '0 0 28rem',
      margin: '0 auto',
      maxWidth: '100%',

      '@media screen and (min-width: 50em)': {
        marginLeft: 'auto'
      }
    },

    heading: {
      color: '#2a344e',
      fontSize: '4.75rem',
      fontStyle: 'normal',
      fontWeight: 800,
      lineHeight: '4.75rem',
      marginBottom: '1.5rem'
    },

    'pre-heading': {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#9fa9bd',
      fontSize: '1.5rem',
      fontStyle: 'normal',
      fontWeight: 'normal',
      lineHeight: '2.5rem',
      textTransform: 'uppercase'
    },

    '.text': {
      color: '#9fa9bd',
      fontSize: '1rem',
      lineHeight: '1.75rem'
    },

    '.learn-more': {
      marginTop: '2.5rem'
    },

    '.images': {
      display: 'none',

      '@media screen and (min-width: 50em)': {
        display: 'block',
        flex: '0 0 60%',
        paddingBottom: '43%',
        position: 'relative'
      }
    },

    '.theme-colors': {
      '@media screen and (min-width: 50em)': {
        position: 'absolute',
        top: '-18%',
        right: '-35%',
        height: 'auto',
        width: '103%'
      }
    },

    '.components': {
      position: 'absolute',
      top: '42%',
      right: '-9%',
      height: 'auto',
      width: '100%'
    }
  }
}));
