import { DefaultProps, useComponentDefaultProps } from '@nebular-react/styles';
import React, { useContext } from 'react';
import { ChatContext } from './Chat.context';
import { ChatMessageFile } from './ChatMessageFile';
import { BaseChatMessageTextProps } from './types';

export interface ChatMessageMapProps extends DefaultProps, BaseChatMessageTextProps {
  latitude?: number;
  longitude?: number;
}

const defaultProps: Partial<ChatMessageMapProps> = {
  dateFormat: 'h:mm A'
};

const ChatMessageMap = React.forwardRef<HTMLDivElement, ChatMessageMapProps>((props, ref) => {
  const {
    sender,
    message,
    date,
    dateFormat,
    latitude,
    longitude,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { mapKey } = useContext(ChatContext);

  const file = {
    url: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=12&size=400x400&key=${mapKey}`,
    type: 'image/png',
    icon: 'location'
  };

  return (
    <ChatMessageFile
      files={[file]}
      message={message}
      sender={sender}
      date={date}
      dateFormat={dateFormat}
      className={className}
      classNames={classNames}
      styles={styles}
      unstyled={unstyled}
      ref={ref}
      {...others}
    />
  );
});

ChatMessageMap.displayName = '@nebular-react/core/ChatMessageMap';

export { ChatMessageMap };
