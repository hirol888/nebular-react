import {
  ComponentOrCustomStatus,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import React, { useEffect, useRef } from 'react';
import { useId } from '@nebular-react/hooks';
import { ChatMessage } from './ChatMessage';
import useStyles, { ChatStylesParams } from './Chat.styles';
import { ChatContext } from './Chat.context';
import { ChatMessageType } from './types';

export type ChatStylesNames = Selectors<typeof useStyles>;

export interface ChatProps extends DefaultProps<ChatStylesNames, ChatStylesParams> {
  title?: React.ReactNode;
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  noMessagePlaceholder?: string;
  scrollBottom?: boolean;
  mapKey?: string;
  messages?: ChatMessageType[];
  chatFrom?: React.ReactNode;
}

const defaultProps: Partial<ChatProps> = {
  status: 'basic',
  noMessagePlaceholder: 'No messages yet',
  scrollBottom: true,
  mapKey: '',
  messages: []
};

const Chat = React.forwardRef<HTMLDivElement, ChatProps>((props, ref) => {
  const {
    title,
    size,
    status,
    noMessagePlaceholder,
    scrollBottom,
    mapKey,
    messages,
    chatFrom,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { status, size },
    { name: 'chat', classNames, styles, unstyled }
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollBottom) {
      scrollListBottom();
    }
  }, [messages]);

  const scrollListBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const uuid = useId();

  return (
    <ChatContext.Provider value={{ mapKey, status }}>
      <div className={cx(classes.root, className, size, status)} ref={ref} {...others}>
        <div className={cx(classes.header)}>{title}</div>
        <div className={cx(classes.scrollable)}>
          <div className={cx(classes.messages)}>
            {messages.map((message, index) => (
              <ChatMessage
                key={`${uuid}-chat-message-${index}`}
                reply={message.reply}
                message={message.message}
                sender={message.sender}
                date={message.date}
                dateFormat={message.dateFormat}
                files={message.files}
                quote={message.quote}
                latitude={message.latitude}
                longitude={message.longitude}
                avatar={message.avatar}
                type={message.type}
                customMessage={message.customMessage}
                customMessageFullWidth={message.customMessageFullWidth}
              />
            ))}
            {!messages.length && <p className={cx(classes.noMessages)}>{noMessagePlaceholder}</p>}
            <div id="messagesEnd" ref={messagesEndRef} />
          </div>
        </div>
        <>{chatFrom}</>
      </div>
    </ChatContext.Provider>
  );
});

Chat.displayName = '@nebular-react/core/Chat';

export { Chat };
