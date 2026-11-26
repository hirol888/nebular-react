import { useNebularLocale } from '@nebular-react/styles';
import type { ChatLabels } from './types';

/**
 * Fallback labels used when no `NebularProvider` catalog entry exists.
 * Values preserve the component's historical English output; `searchResults`
 * keeps the legacy `{count} de {total}` counter until a catalog key exists.
 * Templates use the same `{name}` placeholders as the shared message catalog.
 */
export const defaultChatLabels: ChatLabels = {
  noMessages: 'No messages yet',
  noSearchResults: 'No messages found',
  viewThread: 'View thread',
  closeThread: 'Close thread',
  noReplies: 'No replies yet',
  reply: 'Reply',
  sendReply: 'Send reply',
  replyToThread: 'Reply to thread',
  searchMessages: 'Search messages',
  clearSearch: 'Clear search',
  // Kept for backward compatibility with the previous counter format.
  searchResults: '{count} de {total}',
  editMessage: 'Edit message',
  editMessageText: 'Edit message text',
  saveMessage: 'Save message',
  cancelEditing: 'Cancel editing',
  edited: 'edited',
  deleteMessage: 'Delete message',
  deleteConfirmation: 'Delete this message?',
  cancelDeletion: 'Cancel deletion',
  confirmDeletion: 'Confirm deletion',
  addReaction: 'Add reaction',
  reactions: 'Reactions',
  reactWith: 'React with {emoji}',
  toggleReaction: 'Toggle {emoji} reaction ({count})',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  readBy: 'Read by {users}',
  typing: '{users} is typing…',
  typingPlural: '{users} are typing…',
  sendMessage: 'Send message',
  messagePlaceholder: 'Type a message',
  dropFilePlaceholder: 'Drop file to send',
  attachment: 'Attachment {index}'
};

/**
 * Resolves the Chat labels for the current locale. Explicit `overrides` always
 * win over the provider catalog, which in turn wins over the English defaults.
 */
export function useChatLabels(overrides?: Partial<ChatLabels>): ChatLabels {
  const { t } = useNebularLocale();

  return {
    noMessages: t('chat.noMessages', defaultChatLabels.noMessages),
    noSearchResults: t('chat.noSearchResults', defaultChatLabels.noSearchResults),
    viewThread: t('chat.viewThread', defaultChatLabels.viewThread),
    closeThread: t('chat.closeThread', defaultChatLabels.closeThread),
    noReplies: t('chat.noReplies', defaultChatLabels.noReplies),
    reply: t('chat.reply', defaultChatLabels.reply),
    sendReply: t('chat.sendReply', defaultChatLabels.sendReply),
    replyToThread: t('chat.replyToThread', defaultChatLabels.replyToThread),
    searchMessages: t('chat.searchMessages', defaultChatLabels.searchMessages),
    clearSearch: t('chat.clearSearch', defaultChatLabels.clearSearch),
    searchResults: t('chat.searchResults', defaultChatLabels.searchResults),
    editMessage: t('chat.editMessage', defaultChatLabels.editMessage),
    editMessageText: t('chat.editMessageText', defaultChatLabels.editMessageText),
    saveMessage: t('chat.saveMessage', defaultChatLabels.saveMessage),
    cancelEditing: t('chat.cancelEditing', defaultChatLabels.cancelEditing),
    edited: t('chat.edited', defaultChatLabels.edited),
    deleteMessage: t('chat.deleteMessage', defaultChatLabels.deleteMessage),
    deleteConfirmation: t('chat.deleteConfirmation', defaultChatLabels.deleteConfirmation),
    cancelDeletion: t('chat.cancelDeletion', defaultChatLabels.cancelDeletion),
    confirmDeletion: t('chat.confirmDeletion', defaultChatLabels.confirmDeletion),
    addReaction: t('chat.addReaction', defaultChatLabels.addReaction),
    reactions: t('chat.reactions', defaultChatLabels.reactions),
    reactWith: t('chat.reactWith', defaultChatLabels.reactWith),
    toggleReaction: t('chat.toggleReaction', defaultChatLabels.toggleReaction),
    sent: t('chat.sent', defaultChatLabels.sent),
    delivered: t('chat.delivered', defaultChatLabels.delivered),
    read: t('chat.read', defaultChatLabels.read),
    readBy: t('chat.readBy', defaultChatLabels.readBy),
    typing: t('chat.typing', defaultChatLabels.typing),
    typingPlural: t('chat.typingPlural', defaultChatLabels.typingPlural),
    sendMessage: t('chat.sendMessage', defaultChatLabels.sendMessage),
    messagePlaceholder: t('chat.messagePlaceholder', defaultChatLabels.messagePlaceholder),
    dropFilePlaceholder: t('chat.dropFilePlaceholder', defaultChatLabels.dropFilePlaceholder),
    attachment: t('chat.attachment', defaultChatLabels.attachment),
    ...overrides
  };
}
