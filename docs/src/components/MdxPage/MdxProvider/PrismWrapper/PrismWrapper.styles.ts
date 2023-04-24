import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../../../../theme/DocsPageTheme';

export default createStyles<DocsPageTheme>((theme) => ({
  root: {
    position: 'relative',

    '.prism-tooltip-button-wrapper': {
      position: 'absolute',
      right: '0.8rem',
      top: '0.8rem',
      zIndex: 2,

      '.prism-tooltip-button': {
        padding: 0,
        backgroundColor: 'transparent',
        border: 'none',
        color: theme.text_hint_color,
        '&:focus': {
          boxShadow: 'none'
        }
      }
    },

    '.mantine-Prism-lineNumber': {
      color: theme.text_hint_color
    }
  }
}));
