import {
  DefaultProps,
  Selectors,
  formatNebularMessage,
  useComponentDefaultProps
} from '@nebular-react/styles';
import React from 'react';
import { useId } from '@nebular-react/hooks';
import { Icon } from '../Icon';
import { ChatMessageText } from './ChatMessageText';
import useStyles from './ChatMessageFile.styles';
import {
  BaseChatMessageTextProps,
  ChatFile,
  ChatFileIconPreview,
  ChatFileImagePreview,
  ChatLabels
} from './types';
import { useChatLabels } from './Chat.labels';

export type ChatMessageFileStylesNames = Selectors<typeof useStyles>;

export type ChatMessageFileIconPreview = ChatFileIconPreview;
export type ChatMessageFileImagePreview = ChatFileImagePreview;
export type ChatMessageFileType = ChatFile;

export interface ChatMessageFileProps
  extends DefaultProps<ChatMessageFileStylesNames>, BaseChatMessageTextProps {
  files?: ChatMessageFileType[];
  /** Search term used to highlight matches inside the message text. */
  highlight?: string;
  /** Overrides the localized `chat.*` labels used by the attachments. */
  labels?: Partial<ChatLabels>;
}

const defaultProps: Partial<ChatMessageFileProps> = {
  dateFormat: 'h:mm A',
  files: []
};

function getAttachmentName(
  file: ChatMessageFileType,
  index: number,
  fallbackTemplate: string
): string {
  const explicitName = file.name?.trim();
  if (explicitName) {
    return explicitName;
  }

  try {
    const { protocol, pathname } = new URL(file.url, 'https://localhost');
    if (protocol === 'http:' || protocol === 'https:') {
      const filename = pathname.split('/').filter(Boolean).at(-1);
      if (filename) {
        return decodeURIComponent(filename);
      }
    }
  } catch {
    // Use the attachment position when the path cannot supply a readable name.
  }

  return formatNebularMessage(fallbackTemplate, { index: index + 1 });
}

const ChatMessageFile = React.forwardRef<HTMLDivElement, ChatMessageFileProps>((props, ref) => {
  const {
    sender,
    message,
    date,
    dateFormat,
    files,
    highlight,
    labels,
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
  const text = useChatLabels(labels);

  const isImage = (file: ChatMessageFileType) => {
    const { type } = file as ChatMessageFileImagePreview;
    if (type) {
      return ['image/png', 'image/jpeg', 'image/gif'].includes(type);
    }
    return false;
  };

  const uuid = useId();
  const attachments = files.map((file, index) => {
    const preview = isImage(file);
    const icon = 'icon' in file ? file.icon : undefined;

    return (
      <a
        key={`${uuid}-file-${index}`}
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={getAttachmentName(file, index, text.attachment)}
      >
        {preview ? (
          <div className={cx(classes.image)} style={{ backgroundImage: `url(${file.url})` }} />
        ) : (
          icon && <Icon icon={icon} />
        )}
      </a>
    );
  });

  return (
    <div className={cx(classes.root, className)} ref={ref} {...others}>
      <ChatMessageText
        sender={sender}
        date={date}
        dateFormat={dateFormat}
        message={message}
        highlight={highlight}
      />
      {attachments.length > 1 ? (
        <div className={cx(classes.messageeContentGroup)}>{attachments}</div>
      ) : (
        attachments
      )}
    </div>
  );
});

ChatMessageFile.displayName = 'ChatMessageFile';

export { ChatMessageFile };
