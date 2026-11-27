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

      '&:hover .nebular-chat-message-actions, &:focus-within .nebular-chat-message-actions': {
        opacity: 1
      },

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
      flex: 1,
      minWidth: 0
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
      color: 'var(--chat-message-avatar-text-color, var(--color-basic-800, #222b45))'
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
    },

    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
      marginTop: '0.375rem'
    },

    receipt: {
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '0.75rem',
      lineHeight: 1,
      color: 'var(--chat-message-receipt-color, var(--chat-message-sender-text-color))'
    },

    receiptRead: {
      color: 'var(--chat-message-receipt-read-color, var(--color-primary-500, #3366ff))'
    },

    threadButton: {
      padding: 0,
      border: 0,
      backgroundColor: 'transparent',
      color: 'var(--chat-thread-button-color, var(--color-primary-500, #3366ff))',
      font: 'inherit',
      fontSize: '0.75rem',
      lineHeight: 1.2,
      cursor: 'pointer',

      '&:hover': {
        textDecoration: 'underline'
      },

      '&:focus-visible': {
        outline: '2px solid var(--chat-thread-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px',
        borderRadius: '0.125rem'
      }
    },

    edited: {
      fontSize: '0.75rem',
      lineHeight: 1,
      fontStyle: 'italic',
      color: 'var(--chat-message-edited-color, var(--chat-message-sender-text-color))'
    },

    actions: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      opacity: 0,
      transition: 'opacity 120ms ease-in-out',

      '&[hidden]': {
        display: 'none'
      }
    },

    actionButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '1.5rem',
      minHeight: '1.5rem',
      padding: '0.125rem 0.25rem',
      border: 0,
      borderRadius: '0.25rem',
      backgroundColor: 'transparent',
      color: 'var(--chat-message-action-color, var(--chat-message-sender-text-color))',
      font: 'inherit',
      fontSize: '0.8125rem',
      lineHeight: 1,
      cursor: 'pointer',

      '&:hover': {
        backgroundColor: 'var(--chat-message-action-hover-background-color, rgba(0, 0, 0, 0.06))'
      },

      '&:focus-visible': {
        outline: '2px solid var(--chat-thread-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    reactionPicker: {
      position: 'relative',
      display: 'inline-flex'
    },

    reactionMenu: {
      position: 'absolute',
      bottom: 'calc(100% + 0.25rem)',
      zIndex: 3,
      display: 'flex',
      gap: '0.25rem',
      padding: '0.25rem',
      borderRadius: '0.5rem',
      border:
        'var(--chat-divider-width, 1px) var(--chat-divider-style, solid) ' +
        'var(--chat-divider-color, #e4e9f2)',
      backgroundColor:
        'var(--chat-reaction-menu-background-color, var(--chat-background-color, #ffffff))',
      boxShadow: 'var(--chat-reaction-menu-shadow, 0 8px 24px rgba(0, 0, 0, 0.16))',
      ...theme.fns.ltr({ left: 0 }),
      ...theme.fns.rtl({ right: 0 })
    },

    reactionOption: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '2rem',
      minHeight: '2rem',
      padding: '0.25rem',
      border: 0,
      borderRadius: '0.375rem',
      backgroundColor: 'transparent',
      fontSize: '1.125rem',
      lineHeight: 1,
      cursor: 'pointer',

      '&:hover, &:focus-visible': {
        backgroundColor: 'var(--chat-reaction-option-hover-background-color, rgba(0, 0, 0, 0.08))'
      },

      '&:focus-visible': {
        outline: '2px solid var(--chat-thread-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '1px'
      }
    },

    reactions: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.25rem',
      marginTop: '0.375rem'
    },

    reactionChip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.0625rem 0.5rem',
      border:
        'var(--chat-divider-width, 1px) var(--chat-divider-style, solid) ' +
        'var(--chat-divider-color, #e4e9f2)',
      borderRadius: '999px',
      backgroundColor: 'var(--chat-reaction-background-color, transparent)',
      color: 'inherit',
      font: 'inherit',
      fontSize: '0.75rem',
      lineHeight: 1.5,
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--chat-thread-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    reactionChipActive: {
      borderColor: 'var(--chat-reaction-active-border-color, var(--color-primary-500, #3366ff))',
      backgroundColor: 'var(--chat-reaction-active-background-color, rgba(51, 102, 255, 0.12))'
    },

    reactionCount: {
      fontSize: '0.75rem'
    },

    editor: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '100%'
    },

    editorInput: {
      width: '100%',
      minHeight: '4rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid var(--chat-editor-border-color, var(--chat-divider-color, #e4e9f2))',
      backgroundColor:
        'var(--chat-editor-background-color, var(--chat-message-background, #ffffff))',
      color: 'var(--chat-editor-text-color, inherit)',
      font: 'inherit',
      resize: 'vertical',

      '&:focus': {
        outline: '2px solid var(--chat-thread-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '1px'
      }
    },

    editorActions: {
      display: 'flex',
      gap: '0.5rem'
    },

    editorSave: {
      padding: '0.375rem 0.875rem',
      border: 0,
      borderRadius: '0.375rem',
      backgroundColor:
        'var(--chat-editor-save-background-color, var(--color-primary-500, #3366ff))',
      color: 'var(--chat-editor-save-text-color, #ffffff)',
      font: 'inherit',
      fontSize: '0.8125rem',
      cursor: 'pointer'
    },

    editorCancel: {
      padding: '0.375rem 0.875rem',
      border:
        'var(--chat-divider-width, 1px) var(--chat-divider-style, solid) ' +
        'var(--chat-divider-color, #e4e9f2)',
      borderRadius: '0.375rem',
      backgroundColor: 'transparent',
      color: 'inherit',
      font: 'inherit',
      fontSize: '0.8125rem',
      cursor: 'pointer'
    },

    deleteDialog: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginTop: '0.5rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid var(--chat-danger-color, var(--color-danger-500, #ff3d71))',
      backgroundColor:
        'var(--chat-delete-dialog-background-color, var(--chat-message-background, #ffffff))'
    },

    deleteDialogText: {
      margin: 0,
      fontSize: '0.8125rem',
      lineHeight: 1.4
    },

    deleteDialogActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem'
    },

    deleteConfirm: {
      padding: '0.25rem 0.75rem',
      border: 0,
      borderRadius: '0.375rem',
      backgroundColor: 'var(--chat-danger-color, var(--color-danger-500, #ff3d71))',
      color: '#ffffff',
      font: 'inherit',
      fontSize: '0.8125rem',
      cursor: 'pointer'
    },

    deleteCancel: {
      padding: '0.25rem 0.75rem',
      border:
        'var(--chat-divider-width, 1px) var(--chat-divider-style, solid) ' +
        'var(--chat-divider-color, #e4e9f2)',
      borderRadius: '0.375rem',
      backgroundColor: 'transparent',
      color: 'inherit',
      font: 'inherit',
      fontSize: '0.8125rem',
      cursor: 'pointer'
    }
  };
});
