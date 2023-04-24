import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../../../../theme/DocsPageTheme';

export default createStyles<DocsPageTheme>((theme) => ({
  link: {
    // ...theme.fn.focusStyles(),
    // color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6],
    textDecoration: 'none',

    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));
