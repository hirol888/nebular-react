import { createStyles } from '@nebular-react/styles';

export default createStyles(() => ({
  root: {
    flex: '1 0 auto',
    minWidth: '20rem',

    '.nebular-card-root': {
      margin: 0
    },

    '.nebular-card-header-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      overflow: 'hidden'
    }
  },

  title: {
    flex: '1 0 auto',
    marginRight: '3rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  buttons: {
    width: '9.5rem',
    display: 'flex',
    justifyContent: 'flex-end',

    '.nebular-button-wrapper': {
      flex: '0 0 3rem'
    }
  },

  fullScreen: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },

  maximized: {
    '.nebular-card-root': {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      height: 'auto'
    },

    '.nebular-card-header-root': {
      borderBottom: 'none'
    }
  },

  windowContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    overflowX: 'auto',

    '.nebular-window-root:not(.nebular-window-fullScreen)': {
      margin: '0 2rem'
    }
  }
}));
