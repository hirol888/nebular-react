import { useDateFns } from '@nebular-react/hooks';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import React from 'react';
import useStyles from './ChatMessageText.styles';
import { BaseChatMessageTextProps } from './types';
import { splitHighlightedText } from './Chat.utils';

export type ChatMessageTextStylesNames = Selectors<typeof useStyles>;

export interface ChatMessageTextProps
  extends DefaultProps<ChatMessageTextStylesNames>, BaseChatMessageTextProps {
  /**
   * Search term used to wrap matching chunks in a `<mark>` element.
   * Matching is case-insensitive and rendered as plain text (never as HTML).
   */
  highlight?: string;
}

const defaultProps: Partial<ChatMessageTextProps> = {
  dateFormat: 'h:mm A'
};

const ChatMessageText = React.forwardRef<HTMLDivElement, ChatMessageTextProps>((props, ref) => {
  const {
    sender,
    message,
    date,
    dateFormat,
    highlight,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'chat-message-text',
    classNames,
    styles,
    unstyled
  });
  const { format } = useDateFns<Date>();
  const highlightedParts = message ? splitHighlightedText(message, highlight) : [];

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      {(sender || date) && (
        <p className={cx(classes.sender)}>
          {sender} <time>{format(date, dateFormat)}</time>
        </p>
      )}
      {message && (
        <p className={classes.text}>
          {highlightedParts.map((part, index) =>
            part.match ? (
              <mark key={`highlight-${index}`} className={cx(classes.highlight)}>
                {part.text}
              </mark>
            ) : (
              <React.Fragment key={`text-${index}`}>{part.text}</React.Fragment>
            )
          )}
        </p>
      )}
    </div>
  );
});

ChatMessageText.displayName = 'ChatMessageText';

export { ChatMessageText };
