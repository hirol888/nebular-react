export interface ChatFileIconPreview {
  url: string;
  icon: string;
  /** Accessible attachment name. Defaults to the filename derived from the URL. */
  name?: string;
}

export interface ChatFileImagePreview {
  url: string;
  type: string;
  /** Accessible attachment name. Defaults to the filename derived from the URL. */
  name?: string;
}

export type ChatFile = ChatFileIconPreview | ChatFileImagePreview;

export type ChatMessageStatus = 'sent' | 'delivered' | 'read';

export interface ChatReaction {
  emoji: string;
  users: string[];
}

export interface ChatMessageType {
  id?: string;
  reply?: boolean;
  message?: string;
  sender?: string;
  date?: Date;
  dateFormat?: string;
  files?: ChatFile[];
  quote?: string;
  latitude?: number;
  longitude?: number;
  avatar?: string;
  type?: string;
  customMessage?: React.ReactNode;
  customMessageFullWidth?: boolean;
  threadId?: string;
  replyTo?: string;
  readBy?: string[];
  status?: ChatMessageStatus;
  edited?: boolean;
  reactions?: ChatReaction[];
}

export interface ChatReactionPickerContext {
  message: ChatMessageType;
  quickReactions: string[];
  currentUser?: string;
  onToggleReaction: (emoji: string) => void;
  close: () => void;
}

export type ChatRenderReactionPicker = (context: ChatReactionPickerContext) => React.ReactNode;

/**
 * Every user-facing string rendered by `Chat`, `ChatMessage`, `ChatForm` and
 * their built-in message types. Templates receive named parameters such as
 * `{users}`, `{emoji}`, `{count}`, `{total}` and `{index}`.
 *
 * Values are resolved from the nearest `NebularProvider` (`chat.*` catalog)
 * and can be overridden per component through the `labels` prop.
 */
export interface ChatLabels {
  /** Empty state when the chat has no messages. */
  noMessages: string;
  /** Empty state when a search matches no messages. */
  noSearchResults: string;
  /** Thread trigger and thread panel heading. */
  viewThread: string;
  /** Accessible name of the thread close button. */
  closeThread: string;
  /** Empty state inside an opened thread. */
  noReplies: string;
  /** Visible text of the thread reply submit button. */
  reply: string;
  /** Accessible name of the thread reply submit button. */
  sendReply: string;
  /** Placeholder and accessible name of the thread reply input. */
  replyToThread: string;
  /** Placeholder and accessible name of the search input. */
  searchMessages: string;
  /** Accessible name of the clear search button. */
  clearSearch: string;
  /** Search result counter (`{count}` matches out of `{total}`). */
  searchResults: string;
  /** Accessible name and tooltip of the edit action. */
  editMessage: string;
  /** Accessible name of the inline message editor. */
  editMessageText: string;
  /** Save button label in the inline editor. */
  saveMessage: string;
  /** Cancel button label in the inline editor. */
  cancelEditing: string;
  /** Indicator shown next to edited messages. */
  edited: string;
  /** Accessible name of the delete action and of the confirmation dialog. */
  deleteMessage: string;
  /** Confirmation question shown before deleting a message. */
  deleteConfirmation: string;
  /** Cancel button label in the delete confirmation dialog. */
  cancelDeletion: string;
  /** Confirm button label in the delete confirmation dialog. */
  confirmDeletion: string;
  /** Accessible name of the reaction picker trigger. */
  addReaction: string;
  /** Accessible name of the reaction picker menu. */
  reactions: string;
  /** Accessible name of a quick reaction option (`{emoji}`). */
  reactWith: string;
  /** Accessible name of an existing reaction chip (`{emoji}`, `{count}`). */
  toggleReaction: string;
  /** Sent receipt label. */
  sent: string;
  /** Delivered receipt label. */
  delivered: string;
  /** Read receipt label when no reader is known. */
  read: string;
  /** Read receipt label with the reader names (`{users}`). */
  readBy: string;
  /** Typing indicator for a single user (`{users}`). */
  typing: string;
  /** Typing indicator for multiple users (`{users}`). */
  typingPlural: string;
  /** Accessible name of the `ChatForm` send button. */
  sendMessage: string;
  /** `ChatForm` message input placeholder. */
  messagePlaceholder: string;
  /** `ChatForm` input placeholder while files are dragged over it. */
  dropFilePlaceholder: string;
  /** Accessible name for attachments without a readable filename (`{index}`). */
  attachment: string;
}

export interface BaseChatMessageTextProps {
  sender?: string;
  message?: string;
  date?: Date;
  dateFormat?: string;
}
