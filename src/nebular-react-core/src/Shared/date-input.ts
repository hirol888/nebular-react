import { formatMaskedValue } from '../MaskedInput';

export type DateInputSegment =
  'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

interface DateInputToken {
  type: 'literal' | 'segment';
  value: string;
  segment?: DateInputSegment;
  length?: number;
  startDigit?: number;
  endDigit?: number;
}

interface SegmentToken extends DateInputToken {
  type: 'segment';
  segment: DateInputSegment;
  length: number;
  startDigit: number;
  endDigit: number;
}

const TOKENS: { token: string; segment: DateInputSegment; length: number }[] = [
  { token: 'YYYY', segment: 'year', length: 4 },
  { token: 'yyyy', segment: 'year', length: 4 },
  { token: 'YY', segment: 'year', length: 2 },
  { token: 'yy', segment: 'year', length: 2 },
  { token: 'MM', segment: 'month', length: 2 },
  { token: 'DD', segment: 'day', length: 2 },
  { token: 'dd', segment: 'day', length: 2 },
  { token: 'HH', segment: 'hour', length: 2 },
  { token: 'hh', segment: 'hour', length: 2 },
  { token: 'mm', segment: 'minute', length: 2 },
  { token: 'ss', segment: 'second', length: 2 },
  { token: 'SSS', segment: 'millisecond', length: 3 }
];

TOKENS.sort((a, b) => b.token.length - a.token.length);

function tokenize(format: string): DateInputToken[] | null {
  const tokens: DateInputToken[] = [];
  let index = 0;

  while (index < format.length) {
    let match: (typeof TOKENS)[number] | undefined;

    for (const candidate of TOKENS) {
      if (format.startsWith(candidate.token, index)) {
        match = candidate;
        break;
      }
    }

    if (match) {
      tokens.push({
        type: 'segment',
        value: match.token,
        segment: match.segment,
        length: match.length
      });
      index += match.token.length;
    } else {
      const char = format[index];

      if (/[a-zA-Z]/.test(char) && char !== 'T' && char !== 'Z') {
        return null;
      }

      tokens.push({ type: 'literal', value: char });
      index += 1;
    }
  }

  return tokens;
}

/**
 * Builds a digit mask (`9`) for a numeric date/time format.
 * Returns null for formats with textual tokens (month names, AM/PM, etc.).
 */
export function buildDateInputMask(format?: string): string | null {
  if (!format) {
    return null;
  }

  const tokens = tokenize(format);

  if (!tokens) {
    return null;
  }

  return tokens
    .map((token) => (token.type === 'segment' ? '9'.repeat(token.length ?? 0) : token.value))
    .join('');
}

/**
 * Applies the mask derived from `format` to a partially typed value.
 */
export function applyDateInputMask(value: string, format?: string): string {
  const mask = buildDateInputMask(format);

  return mask ? formatMaskedValue(value, mask) : value;
}

/**
 * Returns the caret position after the given number of digits in a masked value.
 */
export function getMaskedCaret(masked: string, digitsBefore: number): number {
  if (digitsBefore <= 0) {
    return 0;
  }

  let digits = 0;

  for (let index = 0; index < masked.length; index += 1) {
    if (/\d/.test(masked[index])) {
      digits += 1;

      if (digits === digitsBefore) {
        return index + 1;
      }
    }
  }

  return masked.length;
}

function getSegmentRange(segment: DateInputSegment): { min: number; max: number } {
  switch (segment) {
    case 'month':
      return { min: 1, max: 12 };
    case 'day':
      return { min: 1, max: 31 };
    case 'hour':
      return { min: 0, max: 23 };
    case 'minute':
    case 'second':
      return { min: 0, max: 59 };
    case 'millisecond':
      return { min: 0, max: 999 };
    default:
      return { min: 1, max: 9999 };
  }
}

/**
 * Increments/decrements the numeric segment under the caret.
 * Returns the masked value and the caret position after the segment.
 */
export function adjustDateInputValue(
  value: string,
  format: string | undefined,
  caret: number,
  delta: number
): { value: string; caret: number } | null {
  const mask = buildDateInputMask(format);

  if (!mask || !format) {
    return null;
  }

  const tokens = tokenize(format);

  if (!tokens) {
    return null;
  }

  let digitCursor = 0;
  const segments: SegmentToken[] = [];

  tokens.forEach((token) => {
    if (token.type === 'segment') {
      const segment: SegmentToken = {
        ...token,
        type: 'segment',
        segment: token.segment as DateInputSegment,
        length: token.length as number,
        startDigit: digitCursor,
        endDigit: digitCursor + (token.length as number)
      };

      segments.push(segment);
      digitCursor += token.length as number;
    }
  });

  if (segments.length === 0) {
    return null;
  }

  const digits = value.replace(/\D/g, '');
  const caretDigits = value.slice(0, Math.max(0, caret)).replace(/\D/g, '').length;
  let active =
    segments.find(
      (segment) => caretDigits >= segment.startDigit && caretDigits < segment.endDigit
    ) ?? null;

  if (!active) {
    active =
      caretDigits === 0
        ? segments[0]
        : ([...segments].reverse().find((segment) => segment.endDigit <= caretDigits) ??
          segments[segments.length - 1]);
  }

  const rawSegment = digits.slice(active.startDigit, active.endDigit);
  const { min, max } = getSegmentRange(active.segment);
  const fallback =
    active.segment === 'year' && active.length === 4 ? new Date().getFullYear() : min;
  const current = rawSegment ? Number.parseInt(rawSegment, 10) : fallback;
  const range = max - min + 1;
  const next = ((((current - min + delta) % range) + range) % range) + min;
  const padded = String(next).padStart(active.length, '0').slice(-active.length);
  const nextDigits = `${digits.slice(0, active.startDigit)}${padded}${digits.slice(
    active.endDigit
  )}`;
  const masked = formatMaskedValue(nextDigits, mask);

  return {
    value: masked,
    caret: getMaskedCaret(masked, active.endDigit)
  };
}
