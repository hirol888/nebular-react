import { useDateFns } from '@nebular-react/hooks';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import React from 'react';
import { ChatMessageText } from './ChatMessageText';
import useStyles from './ChatMessageQuote.styles';
import { BaseChatMessageTextProps } from './types';
import { splitHighlightedText } from './Chat.utils';

export type ChatMessageQuoteStylesNames = Selectors<typeof useStyles>;

export interface ChatMessageQuoteProps
  extends DefaultProps<ChatMessageQuoteStylesNames>, BaseChatMessageTextProps {
  quote?: string;
  /** Search term highlighted inside the quoted text and the message body. */
  highlight?: string;
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
    highlight,
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
  const quoteParts = quote ? splitHighlightedText(quote, highlight) : [];

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      {(sender || date) && (
        <p className={cx(classes.sender)}>
          {sender} <time>{format(date, dateFormat)}</time>
        </p>
      )}
      <p className={cx(classes.quote)}>
        {quoteParts.map((part, index) =>
          part.match ? (
            <mark key={`quote-highlight-${index}`}>{part.text}</mark>
          ) : (
            <React.Fragment key={`quote-text-${index}`}>{part.text}</React.Fragment>
          )
        )}
      </p>
      <ChatMessageText message={message} highlight={highlight} />
    </div>
  );
});

ChatMessageQuote.displayName = 'ChatMessageQuote';

export { ChatMessageQuote };
