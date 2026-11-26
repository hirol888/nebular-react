import {
  ComponentOrCustomStatus,
  ComponentSize,
  createStyles,
  keyframes
} from '@nebular-react/styles';
import type { Property } from 'csstype';

export interface ChatStylesParams {
  status: ComponentOrCustomStatus;
  size: ComponentSize;
}

export default createStyles((theme, { status, size }: ChatStylesParams) => {
  const typingBounce = keyframes({
    '0%, 60%, 100%': {
      transform: 'translateY(0)',
      opacity: 0.35
    },

    '30%': {
      transform: 'translateY(-0.25rem)',
      opacity: 1
    }
  });

  return {
    root: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      minWidth: 0,
      maxWidth: '100%',

      backgroundColor: 'var(--chat-background-color)',
      border: 'var(--chat-border)',
      borderRadius: 'var(--chat-border-radius)',
      boxShadow: 'var(--chat-shadow)',

      color: 'var(--chat-text-color)',
      fontFamily: 'var(--chat-text-font-family)',
      fontSize: 'var(--chat-text-font-size)',
      fontWeight: 'var(--chat-text-font-weight)' as unknown as Property.FontWeight,
      lineHeight: 'var(--chat-text-line-height)',

      '.nebular-icon-root': {
        fontSize: 'inherit'
      },

      height: `var(--chat-${size}-height)`
    },

    header: {
      borderBottom: 'var(--chat-divider-width) var(--chat-divider-style) var(--chat-divider-color)',
      borderTopLeftRadius: 'var(--chat-border-radius)',
      borderTopRightRadius: 'var(--chat-border-radius)',
      padding: 'var(--chat-padding)',

      fontFamily: 'var(--chat-header-text-font-family)',
      fontSize: 'var(--chat-header-text-font-size)',
      fontWeight: 'var(--chat-header-text-font-weight)' as unknown as Property.FontWeight,
      lineHeight: 'var(--chat-header-text-line-height)',

      backgroundColor: `var(--chat-${status}-background-color)`,
      color: `var(--chat-${status}-text-color)`
    },

    scrollable: {
      overflow: 'auto',
      flex: 1,
      ...theme.fns.scrollbars(
        'var(--chat-scrollbar-color)',
        'var(--chat-scrollbar-background-color)',
        'var(--chat-scrollbar-width)'
      )
    },

    messages: {
      padding: 'var(--chat-padding)',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexShrink: 0,
      flexDirection: 'column'
    },

    noMessages: {
      textAlign: 'center'
    },

    noResults: {
      margin: 0,
      textAlign: 'center',
      color: 'var(--chat-message-sender-text-color)'
    },

    search: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem var(--chat-padding)',
      borderBottom: 'var(--chat-divider-width) var(--chat-divider-style) var(--chat-divider-color)'
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      padding: '0.375rem 0.75rem',
      border: '1px solid var(--chat-search-border-color, var(--chat-divider-color, #e4e9f2))',
      borderRadius: '0.375rem',
      backgroundColor: 'var(--chat-search-background-color, transparent)',
      color: 'inherit',
      font: 'inherit',

      '&:focus': {
        outline: '2px solid var(--chat-thread-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '1px'
      }
    },

    searchClear: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '1.5rem',
      minHeight: '1.5rem',
      padding: '0.125rem 0.375rem',
      border: 0,
      borderRadius: '0.25rem',
      backgroundColor: 'transparent',
      color: 'inherit',
      font: 'inherit',
      fontSize: '1rem',
      lineHeight: 1,
      cursor: 'pointer',

      '&:hover': {
        backgroundColor: 'var(--chat-search-clear-hover-background-color, rgba(0, 0, 0, 0.06))'
      },

      '&:focus-visible': {
        outline: '2px solid var(--chat-thread-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    searchCounter: {
      flexShrink: 0,
      fontSize: '0.75rem',
      color: 'var(--chat-search-counter-color, var(--chat-message-sender-text-color))',
      whiteSpace: 'nowrap'
    },

    spacer: {
      flexShrink: 0
    },

    typing: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      minHeight: '1.75rem',
      padding: '0 0.25rem',
      fontSize: '0.8125rem',
      lineHeight: 1.2,
      color: 'var(--chat-typing-text-color, var(--chat-message-sender-text-color))'
    },

    typingDots: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.1875rem',
      flexShrink: 0
    },

    typingDot: {
      display: 'block',
      width: '0.375rem',
      height: '0.375rem',
      borderRadius: '50%',
      backgroundColor: 'var(--chat-typing-dot-color, currentColor)',
      animation: `${typingBounce} 1.2s infinite ease-in-out`,

      '&:nth-of-type(2)': {
        animationDelay: '0.15s'
      },

      '&:nth-of-type(3)': {
        animationDelay: '0.3s'
      }
    },

    typingLabel: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    threadPanel: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      width: 'min(20rem, 100%)',
      overflow: 'hidden',
      backgroundColor: 'var(--chat-thread-background-color, var(--chat-background-color, #ffffff))',
      boxShadow: 'var(--chat-thread-shadow, -0.25rem 0 1rem rgba(0, 0, 0, 0.12))',
      borderTopRightRadius: 'var(--chat-border-radius)',
      borderBottomRightRadius: 'var(--chat-border-radius)',
      ...theme.fns.ltr({
        right: 0,
        borderLeft: 'var(--chat-divider-width) var(--chat-divider-style) var(--chat-divider-color)'
      }),
      ...theme.fns.rtl({
        left: 0,
        borderRight:
          'var(--chat-divider-width) var(--chat-divider-style) var(--chat-divider-color)',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 'var(--chat-border-radius)',
        borderBottomLeftRadius: 'var(--chat-border-radius)'
      })
    },

    threadHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      padding: 'var(--chat-padding)',
      borderBottom: 'var(--chat-divider-width) var(--chat-divider-style) var(--chat-divider-color)'
    },

    threadTitle: {
      margin: 0,
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.3
    },

    threadClose: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.125rem 0.375rem',
      border: 0,
      borderRadius: '0.25rem',
      backgroundColor: 'transparent',
      color: 'inherit',
      font: 'inherit',
      fontSize: '1.25rem',
      lineHeight: 1,
      cursor: 'pointer',

      '&:hover': {
        backgroundColor: 'var(--chat-thread-close-hover-background-color, rgba(0, 0, 0, 0.05))'
      },

      '&:focus-visible': {
        outline:
          '2px solid var(--chat-thread-focus-color, var(--chat-message-reply-background-color))',
        outlineOffset: '2px'
      }
    },

    threadMessages: {
      flex: 1,
      overflowY: 'auto',
      padding: 'var(--chat-padding)'
    },

    threadEmpty: {
      margin: 0,
      textAlign: 'center',
      color: 'var(--chat-message-sender-text-color)'
    },

    threadForm: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: 'var(--chat-padding)',
      borderTop: 'var(--chat-divider-width) var(--chat-divider-style) var(--chat-divider-color)'
    },

    threadInput: {
      flex: 1,
      minWidth: 0,
      padding: '0.5rem 0.75rem',
      border: '1px solid var(--chat-thread-input-border-color, var(--chat-divider-color, #e4e9f2))',
      borderRadius: '0.375rem',
      backgroundColor: 'var(--chat-thread-input-background-color, transparent)',
      color: 'inherit',
      font: 'inherit',

      '&:focus': {
        outline:
          '2px solid var(--chat-thread-focus-color, var(--chat-message-reply-background-color))',
        outlineOffset: '1px'
      }
    },

    threadSend: {
      padding: '0.5rem 0.875rem',
      border: 0,
      borderRadius: '0.375rem',
      backgroundColor:
        'var(--chat-thread-send-background-color, ' +
        'var(--chat-message-reply-background-color, var(--color-primary-500, #3366ff)))',
      color: 'var(--chat-thread-send-text-color, #ffffff)',
      font: 'inherit',
      fontSize: '0.8125rem',
      cursor: 'pointer',

      '&:focus-visible': {
        outline:
          '2px solid var(--chat-thread-focus-color, var(--chat-message-reply-background-color))',
        outlineOffset: '2px'
      }
    }
  };
});
