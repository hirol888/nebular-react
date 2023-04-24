import { createStyles } from '@nebular-react/core';

export default createStyles((theme) => ({
  root: {
    position: 'relative',

    '.nebular-input-root': {
      paddingLeft: '3rem'
    },

    '.nebular-icon-root': {
      color: theme.input_basic_placeholder_text_color,
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: '1rem',
      zIndex: 1,
      fontSize: '1.25rem'
    }
  }
}));
