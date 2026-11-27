/**
 * Pure string helpers used by the RichTextEditor find & replace dialog.
 *
 * They operate on plain text so they can be unit tested without a DOM and are
 * reused when each text node of the editor is searched/replaced in place.
 */

export interface TextSearchOptions {
  /** Match the query case exactly. Defaults to false. */
  caseSensitive?: boolean;
  /** Character offset (in `text`) where the search starts. Defaults to 0. */
  fromIndex?: number;
}

export interface ReplaceTextOptions extends TextSearchOptions {
  /** Replace every occurrence. Defaults to false. */
  all?: boolean;
  /** Zero-based occurrence to replace when `all` is false. Defaults to 0. */
  occurrence?: number;
}

function normalize(value: string, caseSensitive: boolean): string {
  return caseSensitive ? value : value.toLowerCase();
}

/**
 * Returns the index of the first occurrence of `query` inside `text`, starting
 * at `fromIndex`, or `-1` when there is no match. An empty query never matches.
 */
export function findText(text: string, query: string, options: TextSearchOptions = {}): number {
  if (!query) {
    return -1;
  }

  const { caseSensitive = false, fromIndex = 0 } = options;

  return normalize(text, caseSensitive).indexOf(
    normalize(query, caseSensitive),
    Math.max(fromIndex, 0)
  );
}

/**
 * Replaces occurrences of `query` inside `text`. When `all` is true every
 * occurrence is replaced; otherwise only the requested `occurrence` (zero
 * based) is replaced. The original casing of the text is preserved because
 * only the matched span itself is swapped.
 */
export function replaceText(
  text: string,
  query: string,
  replacement: string,
  options: ReplaceTextOptions = {}
): string {
  if (!query) {
    return text;
  }

  const { caseSensitive = false, all = false, occurrence = 0 } = options;
  const source = normalize(text, caseSensitive);
  const needle = normalize(query, caseSensitive);
  const indices: number[] = [];
  let index = source.indexOf(needle);

  while (index !== -1) {
    indices.push(index);
    index = source.indexOf(needle, index + Math.max(needle.length, 1));
  }

  if (indices.length === 0) {
    return text;
  }

  const targets = all ? indices : [indices[Math.min(Math.max(occurrence, 0), indices.length - 1)]];

  let result = text;

  // Replace from the end so the offsets of the remaining matches stay valid.
  for (let position = targets.length - 1; position >= 0; position -= 1) {
    const start = targets[position];
    result = `${result.slice(0, start)}${replacement}${result.slice(start + query.length)}`;
  }

  return result;
}
