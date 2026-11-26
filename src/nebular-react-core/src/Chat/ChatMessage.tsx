import {
  DefaultProps,
  Selectors,
  formatNebularMessage,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useId } from '@nebular-react/hooks';
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessageFile } from './ChatMessageFile';
import { ChatMessageMap } from './ChatMessageMap';
import { ChatMessageQuote } from './ChatMessageQuote';
import { ChatMessageText } from './ChatMessageText';
import useStyles from './ChatMessage.styles';
import {
  ChatLabels,
  ChatMessageStatus,
  ChatMessageType,
  ChatReaction,
  ChatRenderReactionPicker
} from './types';
import { formatChatUsers } from './Chat.utils';
import { useChatLabels } from './Chat.labels';

export type ChatMessageStylesNames = Selectors<typeof useStyles>;

export interface ChatMessageProps extends DefaultProps<ChatMessageStylesNames>, ChatMessageType {
  threadCount?: number;
  threadLabel?: string;
  threadOpen?: boolean;
  threadControls?: string;
  threadMessage?: ChatMessageType;
  onThreadOpen?: (message: ChatMessageType, trigger?: HTMLElement) => void;
  showReadReceipts?: boolean;
  readLabel?: (users: string[]) => string;
  /** Search term used to highlight matches inside the message body. */
  highlight?: string;
  /** Enables the inline editor when an `onEdit` callback is provided. */
  editable?: boolean;
  /** Enables the delete action when an `onDelete` callback is provided. */
  deletable?: boolean;
  onEdit?: (message: ChatMessageType, text: string) => void;
  onDelete?: (message: ChatMessageType) => void;
  onReactionToggle?: (message: ChatMessageType, emoji: string) => void;
  quickReactions?: string[];
  renderReactionPicker?: ChatRenderReactionPicker;
  currentUser?: string;
  /** Windowed rendering flag: exposes `role="article"` with set size/position. */
  virtualized?: boolean;
  setSize?: number;
  positionInSet?: number;
  /** Overrides the localized `chat.*` labels used by this message. */
  labels?: Partial<ChatLabels>;
}

const defaultProps: Partial<ChatMessageProps> = {
  reply: false,
  customMessageFullWidth: false,
  threadCount: 0,
  threadOpen: false,
  showReadReceipts: false,
  quickReactions: ['👍', '❤️', '😂'],
  reactions: []
};

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>((props, ref) => {
  const {
    id,
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
    threadId,
    replyTo,
    readBy,
    status,
    edited,
    reactions,
    threadCount,
    threadLabel,
    threadOpen,
    threadControls,
    threadMessage,
    onThreadOpen,
    showReadReceipts,
    readLabel,
    highlight,
    editable,
    deletable,
    onEdit,
    onDelete,
    onReactionToggle,
    quickReactions,
    renderReactionPicker,
    currentUser,
    virtualized,
    setSize,
    positionInSet,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'chat-message', classNames, styles, unstyled });
  const copy = useChatLabels(labels);
  const resolvedThreadLabel = threadLabel ?? copy.viewThread;
  const uuid = useId();
  const deleteDescriptionId = `${uuid}-chat-message-delete-description`;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);
  const pickerContainerRef = useRef<HTMLDivElement>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const restoreEditFocusRef = useRef(false);

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
            highlight={highlight}
            labels={copy}
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
            highlight={highlight}
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
            highlight={highlight}
            labels={copy}
          />
        );
      default:
        return (
          <ChatMessageText
            sender={sender}
            date={date}
            dateFormat={dateFormat}
            message={message}
            highlight={highlight}
          />
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

  const messageData: ChatMessageType = {
    id,
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
    threadId,
    replyTo,
    readBy,
    status,
    edited,
    reactions
  };

  const resolvedReadBy = readBy ?? [];
  const resolvedStatus: ChatMessageStatus = status ?? (resolvedReadBy.length ? 'read' : 'sent');
  const resolvedReadLabel = resolvedReadBy.length
    ? formatNebularMessage(copy.readBy, { users: formatChatUsers(resolvedReadBy) })
    : copy.read;
  const receiptLabel =
    resolvedStatus === 'read'
      ? readLabel?.(resolvedReadBy) || resolvedReadLabel
      : resolvedStatus === 'delivered'
        ? copy.delivered
        : copy.sent;
  const receiptGlyph = resolvedStatus === 'sent' ? '✓' : '✓✓';
  const showReceipt = !!reply && !!showReadReceipts;
  const showThreadButton = !!onThreadOpen;
  const canEdit = !!editable && !!onEdit;
  const canDelete = !!deletable && !!onDelete;
  const canReact = !!onReactionToggle;
  const hasActions = canEdit || canDelete || canReact;
  const customReactionPicker: ChatRenderReactionPicker | undefined =
    typeof renderReactionPicker === 'function' ? renderReactionPicker : undefined;

  useEffect(() => {
    if (editing) {
      const editor = editorRef.current;

      if (editor) {
        editor.focus();
        editor.setSelectionRange(editor.value.length, editor.value.length);
      }

      return;
    }

    if (restoreEditFocusRef.current) {
      restoreEditFocusRef.current = false;
      editTriggerRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (!confirmingDelete) {
      return;
    }

    cancelDeleteRef.current?.focus();
  }, [confirmingDelete]);

  useEffect(() => {
    if (!pickerOpen || customReactionPicker) {
      return;
    }

    reactionMenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [pickerOpen, customReactionPicker]);

  useEffect(() => {
    if (!pickerOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!pickerContainerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [pickerOpen]);

  const startEditing = () => {
    setDraft(message ?? '');
    setEditing(true);
  };

  const cancelEditing = () => {
    restoreEditFocusRef.current = true;
    setEditing(false);
    setDraft('');
  };

  const saveEditing = () => {
    const text = draft.trim();

    if (!text) {
      return;
    }

    restoreEditFocusRef.current = true;
    setEditing(false);

    if (text !== message) {
      onEdit?.(messageData, text);
    }
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancelEditing();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      saveEditing();
    }
  };

  const startDeleting = () => setConfirmingDelete(true);

  const cancelDeleting = () => {
    setConfirmingDelete(false);
    deleteTriggerRef.current?.focus();
  };

  const confirmDeleting = () => {
    setConfirmingDelete(false);
    onDelete?.(messageData);
    deleteTriggerRef.current?.focus();
  };

  const handleDeleteKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancelDeleting();
    }
  };

  const closePicker = () => {
    setPickerOpen(false);
    pickerTriggerRef.current?.focus();
  };

  const togglePicker = () => setPickerOpen((current) => !current);

  const toggleReaction = (emoji: string) => {
    onReactionToggle?.(messageData, emoji);
    closePicker();
  };

  const handleReactionMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      reactionMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closePicker();
      return;
    }

    if (!items.length) {
      return;
    }

    const activeIndex = items.findIndex((item) => item === document.activeElement);
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (Math.max(activeIndex, 0) + 1) % items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (Math.max(activeIndex, 0) - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  };

  const renderEditor = () => (
    <div className={cx(classes.editor)}>
      <textarea
        ref={editorRef}
        className={cx(classes.editorInput)}
        aria-label={copy.editMessageText}
        value={draft}
        rows={2}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleEditorKeyDown}
      />
      <div className={cx(classes.editorActions)}>
        <button
          type="button"
          className={cx(classes.editorSave)}
          aria-label={copy.saveMessage}
          onClick={saveEditing}
        >
          {copy.saveMessage}
        </button>
        <button
          type="button"
          className={cx(classes.editorCancel)}
          aria-label={copy.cancelEditing}
          onClick={cancelEditing}
        >
          {copy.cancelEditing}
        </button>
      </div>
    </div>
  );

  const renderReactions = () => {
    if (!reactions?.length) {
      return;
    }

    return (
      <div className={cx(classes.reactions)}>
        {reactions.map((reaction: ChatReaction) => {
          const active = !!currentUser && reaction.users.includes(currentUser);
          const content = (
            <>
              <span aria-hidden={canReact || undefined}>{reaction.emoji}</span>
              <span className={cx(classes.reactionCount)} aria-hidden={canReact || undefined}>
                {reaction.users.length}
              </span>
            </>
          );

          return canReact ? (
            <button
              key={`reaction-${reaction.emoji}`}
              type="button"
              className={cx(classes.reactionChip, {
                [classes.reactionChipActive]: active
              })}
              aria-pressed={active}
              aria-label={formatNebularMessage(copy.toggleReaction, {
                emoji: reaction.emoji,
                count: reaction.users.length
              })}
              title={reaction.users.join(', ')}
              onClick={() => onReactionToggle?.(messageData, reaction.emoji)}
            >
              {content}
            </button>
          ) : (
            <span
              key={`reaction-${reaction.emoji}`}
              className={cx(classes.reactionChip)}
              title={reaction.users.join(', ')}
            >
              {content}
            </span>
          );
        })}
      </div>
    );
  };

  const renderReactionPickerControl = () => {
    if (!canReact) {
      return;
    }

    return (
      <div className={cx(classes.reactionPicker)} ref={pickerContainerRef}>
        <button
          ref={pickerTriggerRef}
          type="button"
          className={cx(classes.actionButton)}
          aria-label={copy.addReaction}
          aria-haspopup="menu"
          aria-expanded={pickerOpen}
          onClick={togglePicker}
        >
          <span aria-hidden="true">☺</span>
        </button>
        {pickerOpen && (
          <div
            ref={reactionMenuRef}
            className={cx(classes.reactionMenu)}
            role={customReactionPicker ? undefined : 'menu'}
            aria-label={customReactionPicker ? undefined : copy.reactions}
            onKeyDown={handleReactionMenuKeyDown}
          >
            {customReactionPicker
              ? customReactionPicker({
                  message: messageData,
                  quickReactions,
                  currentUser,
                  onToggleReaction: toggleReaction,
                  close: closePicker
                })
              : quickReactions.map((emoji) => (
                  <button
                    key={`quick-reaction-${emoji}`}
                    type="button"
                    role="menuitem"
                    className={cx(classes.reactionOption)}
                    aria-label={formatNebularMessage(copy.reactWith, { emoji })}
                    onClick={() => toggleReaction(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
          </div>
        )}
      </div>
    );
  };

  const renderActions = () => {
    if (!hasActions) {
      return;
    }

    return (
      <div className={cx(classes.actions)} hidden={editing}>
        {canEdit && (
          <button
            ref={editTriggerRef}
            type="button"
            className={cx(classes.actionButton)}
            aria-label={copy.editMessage}
            title={copy.editMessage}
            onClick={startEditing}
          >
            <span aria-hidden="true">✎</span>
          </button>
        )}
        {canDelete && (
          <button
            ref={deleteTriggerRef}
            type="button"
            className={cx(classes.actionButton)}
            aria-label={copy.deleteMessage}
            title={copy.deleteMessage}
            onClick={startDeleting}
          >
            <span aria-hidden="true">🗑</span>
          </button>
        )}
        {renderReactionPickerControl()}
      </div>
    );
  };

  const renderFooter = () => {
    if (!showReceipt && !showThreadButton && !edited && !hasActions) {
      return;
    }

    return (
      <div className={cx(classes.footer)}>
        {showReceipt && (
          <span
            className={cx(classes.receipt, {
              [classes.receiptRead]: resolvedStatus === 'read'
            })}
            role="img"
            aria-label={receiptLabel}
            title={receiptLabel}
          >
            <span aria-hidden="true">{receiptGlyph}</span>
          </span>
        )}
        {edited && <span className={cx(classes.edited)}>{copy.edited}</span>}
        {showThreadButton && (
          <button
            type="button"
            className={cx(classes.threadButton)}
            aria-expanded={threadOpen}
            aria-controls={threadControls}
            onClick={(event) => onThreadOpen?.(threadMessage ?? messageData, event.currentTarget)}
          >
            {resolvedThreadLabel} ({threadCount})
          </button>
        )}
        {renderActions()}
      </div>
    );
  };

  const renderDeleteDialog = () => {
    if (!confirmingDelete) {
      return;
    }

    return (
      <div
        className={cx(classes.deleteDialog)}
        role="alertdialog"
        aria-label={copy.deleteMessage}
        aria-describedby={deleteDescriptionId}
        onKeyDown={handleDeleteKeyDown}
      >
        <p className={cx(classes.deleteDialogText)} id={deleteDescriptionId}>
          {copy.deleteConfirmation}
        </p>
        <div className={cx(classes.deleteDialogActions)}>
          <button
            ref={cancelDeleteRef}
            type="button"
            className={cx(classes.deleteCancel)}
            aria-label={copy.cancelDeletion}
            onClick={cancelDeleting}
          >
            {copy.cancelDeletion}
          </button>
          <button
            type="button"
            className={cx(classes.deleteConfirm)}
            aria-label={copy.confirmDeletion}
            onClick={confirmDeleting}
          >
            {copy.confirmDeletion}
          </button>
        </div>
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
      role={virtualized ? 'article' : undefined}
      aria-setsize={virtualized ? setSize : undefined}
      aria-posinset={virtualized ? positionInSet : undefined}
      {...others}
    >
      {!reply && (
        <div className={cx(classes.avatar)} style={{ backgroundImage: avatarStyle ?? undefined }}>
          {!avatarStyle && <>{getInitials()}</>}
        </div>
      )}
      <div className={cx(classes.message)}>
        {editing ? renderEditor() : renderMessage()}
        {renderCustomMessage()}
        {renderReactions()}
        {renderFooter()}
        {renderDeleteDialog()}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export { ChatMessage };
