import {
  ComponentOrCustomStatus,
  ComponentSize,
  DefaultProps,
  Selectors,
  formatNebularMessage,
  useComponentDefaultProps
} from '@nebular-react/styles';
import React, { useEffect, useRef, useState } from 'react';
import { useId } from '@nebular-react/hooks';
import { ChatMessage } from './ChatMessage';
import useStyles, { ChatStylesParams } from './Chat.styles';
import { ChatContext } from './Chat.context';
import { ChatLabels, ChatMessageStatus, ChatMessageType, ChatRenderReactionPicker } from './types';
import { formatChatUsers } from './Chat.utils';
import { useChatLabels } from './Chat.labels';

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
  threads?: Record<string, ChatMessageType[]>;
  showThreads?: boolean;
  threadLabel?: string;
  defaultOpenThreadId?: string;
  onThreadOpen?: (message: ChatMessageType) => void;
  onThreadReply?: (message: ChatMessageType, text: string) => void;
  typingUsers?: string[];
  typingLabel?: (users: string[]) => string;
  showReadReceipts?: boolean;
  readBy?: string[];
  readStatus?: ChatMessageStatus;
  readLabel?: (users: string[]) => string;
  /** Renders an accessible search field that filters the message list. */
  searchable?: boolean;
  /** Controlled search query. Omit to let Chat keep the query internally. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Wraps matches inside a `<mark>` element (default `true`). */
  highlightMatches?: boolean;
  onEditMessage?: (message: ChatMessageType, text: string) => void;
  onDeleteMessage?: (message: ChatMessageType) => void;
  editable?: boolean;
  deletable?: boolean;
  /** Per-message edit permission. Defaults to `true` when editing is enabled. */
  canEdit?: (message: ChatMessageType) => boolean;
  onReactionToggle?: (message: ChatMessageType, emoji: string) => void;
  quickReactions?: string[];
  renderReactionPicker?: ChatRenderReactionPicker;
  /** Viewer identity used to compute the `aria-pressed` state of reaction chips. */
  currentUser?: string;
  /**
   * Enables windowed rendering of the message list.
   *
   * A fixed height is required for virtualization: the viewport height comes
   * from `height` and every row is assumed to occupy `itemHeight` pixels, so
   * messages must keep a predictable (fixed) height. Without a fixed height
   * measurements are not available and the window would be inaccurate.
   */
  virtualize?: boolean;
  /** Virtualized viewport height in pixels (default `400`). */
  height?: number;
  /** Fixed row height in pixels used by virtualization (default `72`). */
  itemHeight?: number;
  /** Extra rows rendered before/after the visible window (default `5`). */
  overscan?: number;
  /** Overrides the localized `chat.*` labels used by the chat and its messages. */
  labels?: Partial<ChatLabels>;
}

const defaultQuickReactions = ['👍', '❤️', '😂'];

const defaultProps: Partial<ChatProps> = {
  status: 'basic',
  scrollBottom: true,
  mapKey: '',
  messages: [],
  showThreads: true,
  showReadReceipts: true,
  searchable: false,
  highlightMatches: true,
  editable: false,
  deletable: false,
  quickReactions: defaultQuickReactions,
  virtualize: false,
  height: 400,
  itemHeight: 72,
  overscan: 5
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
    threads,
    showThreads,
    threadLabel,
    defaultOpenThreadId,
    onThreadOpen,
    onThreadReply,
    typingUsers,
    typingLabel,
    showReadReceipts,
    readBy,
    readStatus,
    readLabel,
    searchable,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    highlightMatches,
    onEditMessage,
    onDeleteMessage,
    editable,
    deletable,
    canEdit,
    onReactionToggle,
    quickReactions,
    renderReactionPicker,
    currentUser,
    virtualize,
    height,
    itemHeight,
    overscan,
    labels,
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
  const copy = useChatLabels(labels);
  const resolvedNoMessagePlaceholder = noMessagePlaceholder ?? copy.noMessages;
  const resolvedThreadLabel = threadLabel ?? copy.viewThread;
  const resolvedSearchPlaceholder = searchPlaceholder ?? copy.searchMessages;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const threadTriggerRef = useRef<HTMLElement | null>(null);
  const threadReplyInputRef = useRef<HTMLInputElement>(null);
  const [openThread, setOpenThread] = useState<ChatMessageType | null>(() =>
    showThreads && defaultOpenThreadId
      ? (messages.find(
          (message) =>
            message.id === defaultOpenThreadId || message.threadId === defaultOpenThreadId
        ) ?? null)
      : null
  );
  const [threadReply, setThreadReply] = useState('');
  const [internalSearch, setInternalSearch] = useState('');
  const [virtualScrollTop, setVirtualScrollTop] = useState(0);
  const uuid = useId();
  const threadPanelId = `${uuid}-chat-thread-panel`;
  const typingKey = typingUsers?.join('\u0000');
  const isSearchControlled = searchValue !== undefined;
  const searchQuery = searchValue ?? internalSearch;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const rowHeight = Math.max(1, itemHeight);
  const viewportHeight = Math.max(1, height);

  const matchesQuery = (message: ChatMessageType): boolean => {
    if (!normalizedQuery) {
      return true;
    }

    return [message.message, message.sender, message.quote]
      .filter((value): value is string => !!value)
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  };

  const visibleMessages = searchable && normalizedQuery ? messages.filter(matchesQuery) : messages;
  const totalMessages = visibleMessages.length;
  const showSearchResults = searchable && !!normalizedQuery;
  const highlightQuery = searchable && highlightMatches ? searchQuery : undefined;
  const startIndex = virtualize
    ? Math.min(totalMessages, Math.max(0, Math.floor(virtualScrollTop / rowHeight) - overscan))
    : 0;
  const endIndex = virtualize
    ? Math.min(totalMessages, Math.ceil((virtualScrollTop + viewportHeight) / rowHeight) + overscan)
    : totalMessages;
  const windowedMessages = virtualize
    ? visibleMessages.slice(startIndex, endIndex)
    : visibleMessages;

  useEffect(() => {
    if (!scrollBottom) {
      return;
    }

    if (virtualize) {
      const maxScroll = Math.max(0, totalMessages * rowHeight - viewportHeight);

      setVirtualScrollTop(maxScroll);

      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = maxScroll;
      }

      return;
    }

    messagesEndRef.current?.scrollIntoView();
  }, [
    messages,
    scrollBottom,
    typingKey,
    searchable,
    normalizedQuery,
    virtualize,
    rowHeight,
    viewportHeight,
    totalMessages
  ]);

  useEffect(() => {
    if (openThread) {
      threadReplyInputRef.current?.focus();
    }
  }, [openThread]);

  const getThreadReplies = (message: ChatMessageType): ChatMessageType[] => {
    if (message.threadId && threads?.[message.threadId]) {
      return threads[message.threadId];
    }

    if (message.id) {
      return messages.filter(
        (candidate) =>
          candidate !== message &&
          (candidate.replyTo === message.id || candidate.replyTo === message.threadId)
      );
    }

    return [];
  };

  const canOpenThread = (message: ChatMessageType): boolean => {
    if (!showThreads) {
      return false;
    }

    if (message.threadId) {
      return true;
    }

    return !!message.id && messages.some((candidate) => candidate.replyTo === message.id);
  };

  const isThreadOpen = (message: ChatMessageType): boolean => {
    if (!openThread) {
      return false;
    }

    if (openThread === message) {
      return true;
    }

    if (openThread.id && message.id) {
      return openThread.id === message.id;
    }

    return !!openThread.threadId && openThread.threadId === message.threadId;
  };

  const handleOpenThread = (message: ChatMessageType, trigger?: HTMLElement) => {
    threadTriggerRef.current = trigger ?? (document.activeElement as HTMLElement | null) ?? null;
    setThreadReply('');
    setOpenThread(message);
    onThreadOpen?.(message);
  };

  const handleCloseThread = () => {
    const trigger = threadTriggerRef.current;

    setOpenThread(null);
    setThreadReply('');
    threadTriggerRef.current = null;

    if (trigger?.isConnected) {
      trigger.focus();
    }
  };

  const handleThreadKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      handleCloseThread();
    }
  };

  const handleThreadReply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!openThread) {
      return;
    }

    const text = threadReply.trim();

    if (!text) {
      return;
    }

    onThreadReply?.(openThread, text);
    setThreadReply('');
  };

  const handleSearchChange = (value: string) => {
    if (!isSearchControlled) {
      setInternalSearch(value);
    }

    onSearchChange?.(value);
  };

  const handleClearSearch = () => {
    if (!isSearchControlled) {
      setInternalSearch('');
    }

    onSearchChange?.('');
    searchInputRef.current?.focus();
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (virtualize) {
      setVirtualScrollTop(event.currentTarget.scrollTop);
    }
  };

  const isMessageEditable = (message: ChatMessageType): boolean =>
    !!editable && !!onEditMessage && !!message.message && (canEdit ? canEdit(message) : true);

  const threadMessages = openThread ? getThreadReplies(openThread) : [];
  const typingText = typingUsers?.length
    ? typingLabel
      ? typingLabel(typingUsers)
      : formatNebularMessage(typingUsers.length === 1 ? copy.typing : copy.typingPlural, {
          users: formatChatUsers(typingUsers)
        })
    : '';

  return (
    <ChatContext.Provider value={{ mapKey, status, labels: copy }}>
      <div className={cx(classes.root, className, size, status)} ref={ref} {...others}>
        <div className={cx(classes.header)}>{title}</div>
        {searchable && (
          <div className={cx(classes.search)} role="search">
            <input
              ref={searchInputRef}
              className={cx(classes.searchInput)}
              type="text"
              value={searchQuery}
              placeholder={resolvedSearchPlaceholder}
              aria-label={resolvedSearchPlaceholder}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={cx(classes.searchClear)}
                aria-label={copy.clearSearch}
                onClick={handleClearSearch}
              >
                &times;
              </button>
            )}
            {showSearchResults && (
              <span className={cx(classes.searchCounter)} aria-live="polite" aria-atomic="true">
                {formatNebularMessage(copy.searchResults, {
                  count: totalMessages,
                  total: messages.length
                })}
              </span>
            )}
          </div>
        )}
        <div
          className={cx(classes.scrollable)}
          ref={scrollableRef}
          style={virtualize ? { height: `${viewportHeight}px` } : undefined}
          onScroll={handleScroll}
        >
          <div className={cx(classes.messages)}>
            {virtualize && (
              <div
                className={cx(classes.spacer)}
                style={{ height: startIndex * rowHeight }}
                aria-hidden="true"
              />
            )}
            {windowedMessages.map((message, offset) => {
              const index = startIndex + offset;
              const threadReplies = getThreadReplies(message);
              const threadIsOpen = isThreadOpen(message);
              const threadAvailable = canOpenThread(message);

              return (
                <ChatMessage
                  key={`${uuid}-chat-message-${message.id ?? index}`}
                  id={message.id}
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
                  threadId={message.threadId}
                  replyTo={message.replyTo}
                  readBy={message.readBy ?? readBy}
                  status={message.status ?? readStatus}
                  showReadReceipts={showReadReceipts}
                  readLabel={readLabel}
                  edited={message.edited}
                  reactions={message.reactions}
                  highlight={highlightQuery}
                  editable={isMessageEditable(message)}
                  deletable={!!deletable && !!onDeleteMessage}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                  onReactionToggle={onReactionToggle}
                  quickReactions={quickReactions}
                  renderReactionPicker={renderReactionPicker}
                  currentUser={currentUser}
                  virtualized={virtualize}
                  setSize={totalMessages}
                  positionInSet={index + 1}
                  threadCount={threadReplies.length}
                  threadLabel={resolvedThreadLabel}
                  threadOpen={threadIsOpen}
                  threadControls={threadIsOpen ? threadPanelId : undefined}
                  threadMessage={message}
                  onThreadOpen={threadAvailable ? handleOpenThread : undefined}
                  labels={copy}
                />
              );
            })}
            {virtualize && (
              <div
                className={cx(classes.spacer)}
                style={{ height: (totalMessages - endIndex) * rowHeight }}
                aria-hidden="true"
              />
            )}
            {!messages.length && (
              <p className={cx(classes.noMessages)}>{resolvedNoMessagePlaceholder}</p>
            )}
            {!!messages.length && !totalMessages && showSearchResults && (
              <p className={cx(classes.noResults)}>{copy.noSearchResults}</p>
            )}
            {typingUsers !== undefined && (
              <div className={cx(classes.typing)} aria-live="polite" aria-atomic="true">
                {typingUsers.length > 0 && (
                  <>
                    <span className={cx(classes.typingDots)} aria-hidden="true">
                      <span className={cx(classes.typingDot)} />
                      <span className={cx(classes.typingDot)} />
                      <span className={cx(classes.typingDot)} />
                    </span>
                    <span className={cx(classes.typingLabel)}>{typingText}</span>
                  </>
                )}
              </div>
            )}
            <div id="messagesEnd" ref={messagesEndRef} />
          </div>
        </div>
        <>{chatFrom}</>
        {showThreads && openThread && (
          <aside
            id={threadPanelId}
            className={cx(classes.threadPanel)}
            role="region"
            aria-label={resolvedThreadLabel}
            onKeyDown={handleThreadKeyDown}
          >
            <div className={cx(classes.threadHeader)}>
              <h3 className={cx(classes.threadTitle)}>{resolvedThreadLabel}</h3>
              <button
                type="button"
                className={cx(classes.threadClose)}
                aria-label={copy.closeThread}
                onClick={handleCloseThread}
              >
                &times;
              </button>
            </div>
            <div className={cx(classes.threadMessages)}>
              {threadMessages.map((threadMessage, index) => (
                <ChatMessage
                  key={`${uuid}-thread-message-${threadMessage.id ?? index}`}
                  id={threadMessage.id}
                  reply={threadMessage.reply}
                  message={threadMessage.message}
                  sender={threadMessage.sender}
                  date={threadMessage.date}
                  dateFormat={threadMessage.dateFormat}
                  files={threadMessage.files}
                  quote={threadMessage.quote}
                  latitude={threadMessage.latitude}
                  longitude={threadMessage.longitude}
                  avatar={threadMessage.avatar}
                  type={threadMessage.type}
                  customMessage={threadMessage.customMessage}
                  customMessageFullWidth={threadMessage.customMessageFullWidth}
                  threadId={threadMessage.threadId}
                  replyTo={threadMessage.replyTo}
                  readBy={threadMessage.readBy ?? readBy}
                  status={threadMessage.status ?? readStatus}
                  showReadReceipts={showReadReceipts}
                  readLabel={readLabel}
                  edited={threadMessage.edited}
                  reactions={threadMessage.reactions}
                  labels={copy}
                />
              ))}
              {!threadMessages.length && (
                <p className={cx(classes.threadEmpty)}>{copy.noReplies}</p>
              )}
            </div>
            <form className={cx(classes.threadForm)} onSubmit={handleThreadReply}>
              <input
                ref={threadReplyInputRef}
                className={cx(classes.threadInput)}
                type="text"
                value={threadReply}
                placeholder={copy.replyToThread}
                aria-label={copy.replyToThread}
                onChange={(event) => setThreadReply(event.target.value)}
              />
              <button type="submit" className={cx(classes.threadSend)} aria-label={copy.sendReply}>
                {copy.sendReply}
              </button>
            </form>
          </aside>
        )}
      </div>
    </ChatContext.Provider>
  );
});

Chat.displayName = 'Chat';

export { Chat };
