import { useDateFns } from '@nebular-react/hooks';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import React from 'react';
import useStyles from './ChatMessageText.styles';
import { BaseChatMessageTextProps } from './types';

export type ChatMessageTextStylesNames = Selectors<typeof useStyles>;

export interface ChatMessageTextProps
  extends DefaultProps<ChatMessageTextStylesNames>,
    BaseChatMessageTextProps {}

const defaultProps: Partial<ChatMessageTextProps> = {
  dateFormat: 'h:mm A'
};

const ChatMessageText = React.forwardRef<HTMLDivElement, ChatMessageTextProps>((props, ref) => {
  const { sender, message, date, dateFormat, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'chat-message-text',
    classNames,
    styles,
    unstyled
  });
  const { format } = useDateFns<Date>();

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      {(sender || date) && (
        <p className={cx(classes.sender)}>
          {sender} <time>{format(date, dateFormat)}</time>
        </p>
      )}
      {message && <p className={classes.text}>{message}</p>}
    </div>
  );
});

ChatMessageText.displayName = '@nebular-react/core/ChatMessageText';

export { ChatMessageText };
