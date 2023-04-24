import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../../../theme/DocsPageTheme';

export default createStyles<DocsPageTheme>(() => ({
  content: {
    minHeight: 'calc(100vh - 350px)',
    position: 'relative',
    zIndex: 1,
    // backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    // boxShadow: theme.colorScheme === 'dark' ? 'none' : theme.shadows.sm,
    paddingBottom: 80
  }
}));
