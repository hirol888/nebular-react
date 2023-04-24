import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../../../theme/DocsPageTheme';
// import { BREAKPOINT } from '../settings';

export default createStyles<DocsPageTheme>((theme) => ({
  root: {
    '.page-header': {
      margin: 0
    },

    '.description': {
      marginBottom: '1.25rem'
    }
  }
}));
