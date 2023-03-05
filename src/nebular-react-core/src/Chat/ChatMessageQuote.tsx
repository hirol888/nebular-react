import { useDateFns } from '@nebular-react/hooks';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import React from 'react';
import { ChatMessageText } from './ChatMessageText';
import useStyles from './ChatMessageQuote.styles';
import { BaseChatMessageTextProps } from './types';

export type ChatMessageQuoteStylesNames = Selectors<typeof useStyles>;

export interface ChatMessageQuoteProps
  extends DefaultProps<ChatMessageQuoteStylesNames>,
    BaseChatMessageTextProps {
  quote?: string;
}

const defaultProps: Partial<ChatMessageQuoteProps> = {
  dateFormat: 'h:mm A'
};

const ChatMessageQuote = React.forwardRef<HTMLDivElement, ChatMessageQuoteProps>((props, ref) => {
  const {
    sender,
    message,
    date,
    dateFormat,
    quote,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { format } = useDateFns<Date>();
  const { classes, cx } = useStyles(null, {
    name: 'chat-message-quote',
    classNames,
    styles,
    unstyled
  });

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      {(sender || date) && (
        <p className={cx(classes.sender)}>
          {sender} <time>{format(date, dateFormat)}</time>
        </p>
      )}
      <p className={cx(classes.quote)}>{quote}</p>
      <ChatMessageText message={message} />
    </div>
  );
});

ChatMessageQuote.displayName = '@nebular-react/core/ChatMessageQuote';

export { ChatMessageQuote };
