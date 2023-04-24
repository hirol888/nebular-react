import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>((theme) => ({
  root: {
    '.nebular-layout-column-root': {
      overflowX: 'hidden'
    },

    '.content-center': {
      maxWidth: theme.content_width,
      width: '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      paddingLeft: '15px',
      paddingRight: '15px'
    },

    '.hero-image': {
      overflow: 'hidden',
      backgroundColor: '#3366ff',
      backgroundImage: "url('../../assets/img/bg.svg')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      '.content-center': {
        flexDirection: 'column'
      }
    },

    '.concave': {
      marginBottom: '-10px',
      marginTop: '-5rem',
      marginLeft: '-20%',
      marginRight: '-20%',
      fill: theme.background_basic_color_2,

      ...theme.fns.mediaBreakpointUp('md', { marginTop: '-7rem' }),
      ...theme.fns.mediaBreakpointUp('lg', { marginTop: '-8.5rem' }),
      ...theme.fns.mediaBreakpointUp('xl', { marginTop: '-15rem' })
    },

    '.for-business-section': {
      background: theme.background_basic_color_2,
      padding: '0 1rem',

      '& + .features': {
        paddingTop: '3rem'
      },

      ...theme.fns.mediaBreakpointUp('md', { padding: '2rem 2rem 0' })
    },

    '.features': {
      backgroundColor: theme.background_basic_color_2,
      paddingTop: '5rem',
      paddingBottom: '4rem',
      '.content-center': {
        maxWidth: '960px',
        justifyContent: 'center'
      }
    },

    '.advantages': {
      overflow: 'hidden',
      marginBottom: '5rem',

      '> .content-center': {
        maxWidth: '960px'
      },

      ...theme.fns.mediaBreakpointUp('md', { paddingBottom: '5.5rem' })
    },

    '.eva': {
      background: 'radial-gradient(circle, #ffffff 0%, #ffffff 15.38%, #d7dfeb 100%)',
      marginBottom: '10rem',
      paddingTop: '5rem',
      position: 'relative',
      '.content-center': {
        paddingBottom: '5rem',
        flexWrap: 'nowrap',
        ...theme.fns.mediaBreakpointUp('md', { paddingBottom: '10rem' })
      },

      ...theme.fns.mediaBreakpointUp('md', { paddingTop: '10rem' }),
      ...theme.fns.mediaBreakpointUp('xl', { paddingTop: '15rem' })
    },

    '.eva-concave': {
      position: 'absolute',
      top: '-10px',
      left: 0,
      right: 0,
      width: '100%',
      transform: 'rotateX(180deg)',

      'svg path': {
        fill: theme.background_basic_color_2
      }
    },

    '.components-promo': {
      marginBottom: '3rem'
    },

    '.nebular-docs-footer-root': {
      maxWidth: '960px',
      margin: '0 auto'
    }
  }
}));
