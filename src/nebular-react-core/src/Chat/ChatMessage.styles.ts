import { createStyles, keyframes } from '@nebular-react/styles';

export default createStyles((theme) => {
  const flyIn = keyframes({
    '0%': {
      transform: 'translateX(-100%)'
    },

    '60%': {
      transform: 'translateX(-60%)'
    },

    '100%': {
      transform: 'translateX(0)'
    }
  });

  return {
    root: {
      animation: `${flyIn} 0.08s`,
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'row',

      '&.not-reply': {
        '.nebular-chat-message-message': {
          ...theme.fns.ltr({ marginLeft: '0.5rem', marginRight: '3rem' }),
          ...theme.fns.rtl({ marginRight: '0.5rem', marginLeft: '3rem' })
        },

        '.nebular-chat-message-text-root': {
          alignItems: 'flex-start',

          '.nebular-chat-message-text-text': {
            ...theme.fns.ltr({ borderTopLeftRadius: 0 }),
            ...theme.fns.rtl({ borderTopRightRadius: 0 }),
            background: 'var(--chat-message-background)',
            color: 'var(--chat-message-text-color)'
          }
        },

        '.nebular-chat-message-file-root': {
          alignItems: 'flex-start'
        }
      },

      '&.reply': {
        flexDirection: 'row-reverse',

        '.nebular-chat-message-message': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          marginLeft: 0,

          ...theme.fns.ltr({ marginRight: '0.5rem', marginLeft: '3rem' }),
          ...theme.fns.rtl({ marginLeft: '0.3rem', marginRight: '3rem' })
        },

        '.nebular-chat-message-text-root': {
          alignItems: 'flex-end',

          '.nebular-chat-message-text-sender': {
            ...theme.fns.ltr({ textAlign: 'right' }),
            ...theme.fns.rtl({ textAlign: 'left' })
          },

          '.nebular-chat-message-text-text': {
            ...theme.fns.ltr({ borderTopRightRadius: 0 }),
            ...theme.fns.rtl({ borderTopLeftRadius: 0 }),
            background: 'var(--chat-message-reply-background-color)',
            color: 'var(--chat-message-reply-text-color)'
          }
        },

        '.nebular-chat-message-file-root': {
          alignItems: 'flex-end'
        }
      }
    },

    message: {
      flex: 1
    },

    avatar: {
      display: 'block',
      borderRadius: '50%',
      flexShrink: 0,
      background: 'var(--chat-message-avatar-background-color)',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      width: '2.5rem',
      height: '2.5rem',
      textAlign: 'center',
      lineHeight: '2.5rem',
      fontSize: '0.875rem',
      color: 'white'
    },

    customMessage: {
      display: 'inline-block',
      padding: 'var(--chat-padding)',
      marginTop: '0.5rem',
      borderRadius: '0.5rem'
    },

    customMessageFullWidth: {
      width: '100%'
    },

    customMessageNoSpace: {
      marginTop: 0
    },

    customMessageNotReply: {
      background: 'var(--chat-message-background)',
      color: 'var(--chat-message-text-color)',
      ...theme.fns.ltr({ borderTopLeftRadius: 0 }),
      ...theme.fns.rtl({ borderTopRightRadius: 0 }),

      'a, a:hover, a:focus': {
        color: 'var(--chat-message-text-color)'
      }
    },

    customMessageReply: {
      background: 'var(--chat-message-reply-background-color)',
      color: 'var(--chat-message-reply-text-color)',
      ...theme.fns.ltr({ borderTopRightRadius: 0 }),
      ...theme.fns.rtl({ borderTopLeftRadius: 0 })
    }
  };
});
