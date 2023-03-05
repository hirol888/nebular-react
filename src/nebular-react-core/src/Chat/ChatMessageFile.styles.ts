import { createStyles } from '@nebular-react/styles';

export default createStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',

    a: {
      color: 'var(--chat-message-file-text-color)',
      background: 'var(--chat-message-file-background-color)',
      fontSize: '4rem',
      textAlign: 'center',
      border: '1px solid var(--chat-message-file-text-color)',
      width: '10rem',
      height: '10rem',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      borderRadius: 0,
      '&:hover, &:focus': {
        textDecoration: 'none',
        color: 'var(--chat-message-file-text-color)'
      }
    },

    '.nebular-chat-message-text-root': {
      display: 'block',
      marginBottom: '0.5rem'
    }
  },

  messageeContentGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',

    a: {
      ...theme.fns.ltr({ marginRight: '1rem' }),
      ...theme.fns.rtl({ marginLeft: '1rem' }),
      marginBottom: '1rem',
      width: '5rem',
      height: '5rem'
    }
  },

  image: {
    backgroundSize: 'cover',
    width: '100%',
    height: '100%'
  }
}));
