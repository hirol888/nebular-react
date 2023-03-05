import { useId } from '@nebular-react/hooks';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import React, { useContext, useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { ChatContext } from './Chat.context';
import useStyles from './ChatForm.styles';

export interface FileExt extends File {
  src?: string;
  urlStyle?: string;
}

export type ChatFormStylesNames = Selectors<typeof useStyles>;

export interface ChatFormProps extends DefaultProps<ChatFormStylesNames> {
  messagePlaceholder?: string;
  buttonTitle?: string;
  buttonIcon?: React.ReactNode;
  showButton?: boolean;
  dropFiles?: boolean;
  dropFilesPlaceholder?: string;
  onSend?: (body: { message: string; files: FileExt[] }) => void;
}

const defaultProps: Partial<ChatFormProps> = {
  messagePlaceholder: 'Type a message',
  buttonTitle: '',
  buttonIcon: <Icon icon="paper-plane-outline" pack="nebular-essentials" />,
  showButton: true,
  dropFiles: false,
  dropFilesPlaceholder: 'Drop file to send'
};

const ChatForm = React.forwardRef<HTMLDivElement, ChatFormProps>((props, ref) => {
  const {
    messagePlaceholder,
    buttonTitle,
    buttonIcon,
    showButton,
    dropFiles,
    dropFilesPlaceholder,
    onSend,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'chat-form', classNames, styles, unstyled });
  const imgDropTypes = ['image/png', 'image/jpeg', 'image/gif'];
  const [droppedFiles, setDroppedFiles] = useState<FileExt[]>([]);
  const [fileOver, setFileOver] = useState<boolean>(false);
  const [inputFocus, setInputFocus] = useState<boolean>(false);
  const [inputHover, setInputHover] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const { status } = useContext(ChatContext);

  const dropHandler = (event: React.DragEvent<HTMLDivElement>) => {
    if (dropFiles) {
      event.preventDefault();
      event.stopPropagation();

      setFileOver(false);
      if (event.dataTransfer && event.dataTransfer.files) {
        for (const file of Array.from(event.dataTransfer.files)) {
          const res: FileExt = file;

          if (imgDropTypes.includes(file.type)) {
            const fr = new FileReader();
            fr.onload = (e: any) => {
              res.src = e.target.result;
              res.urlStyle = `url(${res.src})`;
            };

            fr.readAsDataURL(file);
          }
          setDroppedFiles((current) => [...current, res]);
        }
      }
    }
  };

  const dragOverHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropFiles) {
      setFileOver(true);
    }
  };

  const dragLeaveHandler = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropFiles) {
      setFileOver(false);
    }
  };

  const removeFile = (file: FileExt) => {
    const index = droppedFiles.indexOf(file);
    if (index >= 0) {
      setDroppedFiles((current) => {
        const newDroppedFiles = [...current];
        newDroppedFiles.splice(index, 1);
        return newDroppedFiles;
      });
    }
  };

  const getHighlightStatus = () => {
    if (status === 'basic' || status === 'control') {
      return 'primary';
    }

    return status;
  };

  const getInputStatus = () => {
    if (fileOver) {
      return getHighlightStatus();
    }

    if (inputFocus || inputHover) {
      return status;
    }

    return 'basic';
  };

  const getButtonStatus = () => getHighlightStatus();

  const sendMessage = () => {
    if (droppedFiles.length || message.trim().length) {
      typeof onSend === 'function' && onSend({ message, files: droppedFiles });
      setMessage('');
      setDroppedFiles([]);
    }
  };

  const keyupHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const uuid = useId();

  return (
    <div
      className={cx(classes.root, className)}
      ref={ref}
      onDrop={dropHandler}
      onDragOver={dragOverHandler}
      onDragLeave={dragLeaveHandler}
      {...others}
    >
      {droppedFiles.length > 0 && (
        <div className={cx(classes.droppedFiles)}>
          {droppedFiles.map((file, index) => (
            <div key={`${uuid}-dropfile-${index}`}>
              {file.urlStyle && (
                <div className={cx(classes.dropFile)}>
                  <div
                    className={cx(classes.iconWrapper)}
                    style={{ backgroundImage: file.urlStyle }}
                  />
                  <span className={cx(classes.remove)} onClick={() => removeFile(file)}>
                    &times;
                  </span>
                </div>
              )}
              {!file.urlStyle && (
                <div className={cx(classes.dropFile)}>
                  <div className={cx(classes.iconWrapper)}>
                    <Icon icon="file-text-outline" pack="nebular-essentials" />
                  </div>
                  <span className={cx(classes.remove)} onClick={() => removeFile(file)}>
                    &times;
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className={cx(classes.messageRow)}>
        <Input
          fullWidth
          className={cx({
            [classes.withButton]: showButton
          })}
          status={getInputStatus()}
          type="text"
          onFocus={() => setInputFocus(true)}
          onBlur={() => setInputFocus(false)}
          onMouseEnter={() => setInputHover(true)}
          onMouseLeave={() => setInputHover(false)}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={fileOver ? dropFilesPlaceholder : messagePlaceholder}
          onKeyUp={keyupHandler}
          value={message}
        />
        {showButton && (
          <Button
            className={cx(classes.sendButton)}
            status={getButtonStatus()}
            onClick={() => sendMessage()}
            prefixIcon={!buttonTitle && <>{buttonIcon}</>}
          >
            {buttonTitle}
          </Button>
        )}
      </div>
    </div>
  );
});

ChatForm.displayName = '@nebular-react/core/ChatForm';

export { ChatForm };
