import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import React from 'react';
import { ChatMessageFile } from './ChatMessageFile';
import { ChatMessageMap } from './ChatMessageMap';
import { ChatMessageQuote } from './ChatMessageQuote';
import { ChatMessageText } from './ChatMessageText';
import useStyles from './ChatMessage.styles';
import { ChatMessageType } from './types';

export type ChatMessageStylesNames = Selectors<typeof useStyles>;

export interface ChatMessageProps extends DefaultProps<ChatMessageStylesNames>, ChatMessageType {}

const defaultProps: Partial<ChatMessageProps> = {
  reply: false,
  customMessageFullWidth: false
};

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>((props, ref) => {
  const {
    reply,
    message,
    sender,
    date,
    dateFormat,
    files,
    quote,
    latitude,
    longitude,
    avatar,
    type,
    customMessage,
    customMessageFullWidth,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'chat-message', classNames, styles, unstyled });

  const builtInMessageTypes = ['text', 'file', 'map', 'quote'];
  const avatarStyle = avatar ? `url(${avatar})` : null;
  const getInitials = () => {
    if (sender) {
      const names = sender.split(' ');
      return names
        .map((n) => n.charAt(0))
        .splice(0, 2)
        .join('')
        .toUpperCase();
    }
    return '';
  };

  const isBuiltInMessageType = () =>
    type === null || type === undefined || builtInMessageTypes.includes(type);

  const renderMessage = () => {
    if (!isBuiltInMessageType()) {
      return;
    }

    switch (type) {
      case 'file':
        return (
          <ChatMessageFile
            sender={sender}
            date={date}
            dateFormat={dateFormat}
            message={message}
            files={files}
          />
        );
      case 'quote':
        return (
          <ChatMessageQuote
            sender={sender}
            date={date}
            dateFormat={dateFormat}
            message={message}
            quote={quote}
          />
        );
      case 'map':
        return (
          <ChatMessageMap
            sender={sender}
            date={date}
            dateFormat={dateFormat}
            message={message}
            latitude={latitude}
            longitude={longitude}
          />
        );
      default:
        return (
          <ChatMessageText sender={sender} date={date} dateFormat={dateFormat} message={message} />
        );
    }
  };

  const renderCustomMessage = () => {
    if (!customMessage) {
      return;
    }

    return (
      <div
        className={cx(classes.customMessage, {
          [classes.customMessageNoSpace]: !message,
          [classes.customMessageReply]: reply,
          [classes.customMessageNotReply]: !reply,
          [classes.customMessageFullWidth]: customMessageFullWidth
        })}
      >
        {customMessage}
      </div>
    );
  };

  return (
    <div
      className={cx(classes.root, className, {
        reply,
        'not-reply': !reply
      })}
      ref={ref}
      {...others}
    >
      {!reply && (
        <div className={cx(classes.avatar)} style={{ backgroundImage: avatarStyle }}>
          {!avatarStyle && <>{getInitials()}</>}
        </div>
      )}
      <div className={cx(classes.message)}>
        {renderMessage()}
        {renderCustomMessage()}
      </div>
    </div>
  );
});

ChatMessage.displayName = '@nebular-react/core/ChatMessage';

export { ChatMessage };
