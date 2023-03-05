/* eslint-disable react/jsx-no-target-blank */
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import React from 'react';
import { useId } from '@nebular-react/hooks';
import { Icon } from '../Icon';
import { ChatMessageText } from './ChatMessageText';
import useStyles from './ChatMessageFile.styles';
import { BaseChatMessageTextProps } from './types';

export type ChatMessageFileStylesNames = Selectors<typeof useStyles>;

export interface ChatMessageFileIconPreview {
  url: string;
  icon: string;
}
export interface ChatMessageFileImagePreview {
  url: string;
  type: string;
}
export type ChatMessageFileType = ChatMessageFileIconPreview | ChatMessageFileImagePreview;

export interface ChatMessageFileProps
  extends DefaultProps<ChatMessageFileStylesNames>,
    BaseChatMessageTextProps {
  files?: ChatMessageFileType[];
}

const defaultProps: Partial<ChatMessageFileProps> = {
  dateFormat: 'h:mm A',
  files: []
};

const ChatMessageFile = React.forwardRef<HTMLDivElement, ChatMessageFileProps>((props, ref) => {
  const {
    sender,
    message,
    date,
    dateFormat,
    files,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'chat-message-file',
    classNames,
    styles,
    unstyled
  });

  const isImage = (file: ChatMessageFileType) => {
    const { type } = file as ChatMessageFileImagePreview;
    if (type) {
      return ['image/png', 'image/jpeg', 'image/gif'].includes(type);
    }
    return false;
  };

  const readyFiles = files.map((file: ChatMessageFileType) => {
    const _isImage = isImage(file);
    return {
      ...file,
      urlStyle: _isImage && `url(${file.url})`,
      isImage: _isImage
    };
  });

  const uuid = useId();

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      <ChatMessageText sender={sender} date={date} dateFormat={dateFormat} message={message} />
      {readyFiles.length > 1 && (
        <div className={cx(classes.messageeContentGroup)}>
          {readyFiles.map((file, index) => (
            <a key={`${uuid}-file-${index}`} href={file.url} target="_blank">
              {!file.urlStyle && (file as ChatMessageFileIconPreview).icon && (
                <Icon icon={(file as ChatMessageFileIconPreview).icon} />
              )}
              {file.urlStyle && (
                <div className={cx(classes.image)} style={{ backgroundImage: file.urlStyle }} />
              )}
            </a>
          ))}
        </div>
      )}
      {readyFiles.length === 1 && (
        <a href={readyFiles[0].url} target="_blank">
          {!readyFiles[0].urlStyle && (readyFiles[0] as ChatMessageFileIconPreview).icon && (
            <Icon icon={(readyFiles[0] as ChatMessageFileIconPreview).icon} />
          )}
          {readyFiles[0].urlStyle && (
            <div
              className={cx(classes.image)}
              style={{ backgroundImage: readyFiles[0].urlStyle }}
            />
          )}
        </a>
      )}
    </div>
  );
});

ChatMessageFile.displayName = '@nebular-react/core/ChatMessageFile';

export { ChatMessageFile };
