export const formatChatUsers = (users: string[]): string => {
  if (users.length <= 1) {
    return users[0] ?? '';
  }

  if (users.length === 2) {
    return `${users[0]} and ${users[1]}`;
  }

  return `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]}`;
};

export const defaultTypingLabel = (users: string[]): string => {
  if (!users.length) {
    return '';
  }

  const names = formatChatUsers(users);
  return users.length === 1 ? `${names} is typing…` : `${names} are typing…`;
};

export const defaultReadLabel = (users: string[]): string =>
  users.length ? `Read by ${formatChatUsers(users)}` : 'Read';

export interface ChatHighlightPart {
  text: string;
  match: boolean;
}

/**
 * Splits a plain text into matched/unmatched chunks for safe highlighting.
 * No HTML is produced: callers render the chunks as text nodes, so markup
 * contained in the message or in the query is always displayed literally.
 */
export const splitHighlightedText = (text: string, query?: string): ChatHighlightPart[] => {
  const needle = query?.trim();

  if (!needle) {
    return [{ text, match: false }];
  }

  const haystack = text.toLowerCase();
  const normalizedNeedle = needle.toLowerCase();
  const parts: ChatHighlightPart[] = [];
  let cursor = 0;
  let matchIndex = haystack.indexOf(normalizedNeedle);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push({ text: text.slice(cursor, matchIndex), match: false });
    }

    parts.push({
      text: text.slice(matchIndex, matchIndex + needle.length),
      match: true
    });
    cursor = matchIndex + needle.length;
    matchIndex = haystack.indexOf(normalizedNeedle, cursor);
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), match: false });
  }

  return parts;
};
