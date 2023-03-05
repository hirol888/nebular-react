import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--chat-padding)',
    borderTop: 'var(--chat-divider-width) var(--chat-divider-style) var(--chat-divider-color)',

    '.nebular-input-root': {
      flex: 1
    }
  },

  messageRow: {
    flexDirection: 'row',
    display: 'flex'
  },

  withButton: {
    '.nebular-input-root': {
      borderBottomRightRadius: 0,
      borderTopRightRadius: 0,
      ...theme.fns.ltr({ borderBottomRightRadius: 0, borderTopRightRadius: 0 }),
      ...theme.fns.rtl({ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 })
    }
  },

  sendButton: {
    '.nebular-icon-root': {
      fontSize: '1.5rem'
    },

    ...theme.fns.ltr({ borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }),
    ...theme.fns.rtl({ borderBottomRightRadius: 0, borderTopRightRadius: 0 })
  },

  droppedFiles: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '0.5rem',
    flexWrap: 'wrap'
  },

  remove: {
    position: 'absolute',
    right: '-0.5rem',
    top: '-0.875rem',
    lineHeight: 1,
    cursor: 'pointer'
  },

  iconWrapper: {
    backgroundSize: 'cover',
    width: '3rem',
    height: '3rem',
    borderRadius: '0.5rem',
    border: '1px solid currentColor',
    textAlign: 'center',
    fontSize: '2rem',
    position: 'relative',

    '.nebular-icon-root': {
      width: '65%',
      height: '100%'
    }
  },

  dropFile: {
    position: 'relative',
    ...theme.fns.ltr({ marginRight: '0.5rem' }),
    ...theme.fns.rtl({ marginLeft: '0.5rem' }),
    marginBottom: '0.5rem'
  }
}));
