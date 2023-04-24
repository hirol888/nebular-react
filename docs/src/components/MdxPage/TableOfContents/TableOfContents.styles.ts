import { createStyles } from '@nebular-react/core';
import { DocsPageTheme } from '../../../theme/DocsPageTheme';

export default createStyles<DocsPageTheme>((theme) => ({
  root: {
    paddingLeft: '1rem',
    display: 'block',

    h4: {
      fontSize: '1.25rem',
      fontWeight: 'normal',
      marginBottom: '2.5rem',
      color: theme.color_fg_heading_light
    },

    ul: {
      listStyle: 'none',
      paddingLeft: '3.25rem',
      fontSize: '0.9375rem',

      li: {
        marginBottom: '0.9375rem'
      },
      a: {
        color: 'rgba(102, 110, 128, 0.87)'
      },

      'li.selected a': {
        fontWeight: 500,
        color: '#202020',
        position: 'relative',

        '&::after': {
          content: "''",
          position: 'absolute',
          left: '-3.25rem',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '0.1875rem',
          width: '2rem',
          background: theme.color_fg_highlight,
          borderRadius: '1.5px'
        }
      }
    }
  }
}));
