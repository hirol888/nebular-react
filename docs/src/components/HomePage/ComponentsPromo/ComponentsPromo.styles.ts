import { createStyles } from '@nebular-react/core';
import { DocsHomeTheme } from '../../../theme/DocsHomeTheme';

export default createStyles<DocsHomeTheme>((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    maxWidth: '45rem',

    color: theme.color_fg_heading,
    marginBottom: '1rem',
    margin: 'auto',

    p: {
      color: '#6e82a9',
      fontSize: '1rem',
      lineHeight: '1.75rem',
      textAlign: 'center',
      marginTop: 0
    },

    h2: {
      marginTop: 0,
      marginBottom: '0.5rem'
    }
  }
}));
