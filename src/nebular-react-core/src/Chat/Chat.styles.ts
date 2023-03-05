import { ComponentOrCustomStatus, ComponentSize, createStyles } from '@nebular-react/styles';

export interface ChatStylesParams {
  status: ComponentOrCustomStatus;
  size: ComponentSize;
}

export default createStyles((theme, { status, size }: ChatStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',

    backgroundColor: 'var(--chat-background-color)',
    border: 'var(--chat-border)',
    borderRadius: 'var(--chat-border-radius)',
    boxShadow: 'var(--chat-shadow)',

    color: 'var(--chat-text-color)',
    fontFamily: 'var(--chat-text-font-family)',
    fontSize: 'var(--chat-text-font-size)',
    fontWeight: 'var(--chat-text-font-weight)' as any,
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
    fontWeight: 'var(--chat-header-text-font-weight)' as any,
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
  }
}));
