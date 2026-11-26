import React, { forwardRef, useState } from 'react';
import { Input, InputProps } from '../Input';

/**
 * Mask tokens:
 * - `9` digit
 * - `A` letter
 * - `S` letter or digit
 * - `*` any character
 *
 * Every other character is treated as a literal.
 */
const TOKEN_DIGIT = '9';
const TOKEN_LETTER = 'A';
const TOKEN_ALPHANUMERIC = 'S';
const TOKEN_ANY = '*';

export interface MaskedInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type'
> {
  mask: string;
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
}

const isToken = (character: string): boolean =>
  character === TOKEN_DIGIT ||
  character === TOKEN_LETTER ||
  character === TOKEN_ALPHANUMERIC ||
  character === TOKEN_ANY;

const isDigit = (character: string): boolean => character >= '0' && character <= '9';

const isLetter = (character: string): boolean => /\p{L}/u.test(character);

const matchesToken = (character: string, token: string): boolean => {
  switch (token) {
    case TOKEN_DIGIT:
      return isDigit(character);
    case TOKEN_LETTER:
      return isLetter(character);
    case TOKEN_ALPHANUMERIC:
      return isDigit(character) || isLetter(character);
    case TOKEN_ANY:
      return true;
    default:
      return false;
  }
};

const walkMask = (value: string, mask: string): { formatted: string; parsed: string } => {
  const characters = Array.from(value ?? '');
  const parsed: string[] = [];
  let formatted = '';
  let lastFilledPosition = 0;
  let index = 0;

  for (const token of mask) {
    if (index >= characters.length) {
      break;
    }

    if (isToken(token)) {
      while (index < characters.length && !matchesToken(characters[index], token)) {
        index += 1;
      }

      if (index >= characters.length) {
        break;
      }

      formatted += characters[index];
      parsed.push(characters[index]);
      lastFilledPosition = formatted.length;
      index += 1;
    } else {
      formatted += token;

      if (characters[index] === token) {
        index += 1;
      }
    }
  }

  // Trailing literals are only kept when the token that follows them was filled.
  return { formatted: formatted.slice(0, lastFilledPosition), parsed: parsed.join('') };
};

/** Applies `mask` to `value`, keeping only the characters accepted by each token. */
export function formatMaskedValue(value: string | null | undefined, mask: string): string {
  if (!mask) {
    return value ?? '';
  }

  return walkMask(value ?? '', mask).formatted;
}

/** Extracts the characters of `value` that fill the mask tokens, discarding its literals. */
export function parseMaskedValue(value: string | null | undefined, mask: string): string {
  if (!mask) {
    return value ?? '';
  }

  return walkMask(value ?? '', mask).parsed;
}

const _MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>((props, ref) => {
  const { mask, value, defaultValue, onChange, ...others } = props;
  const [internalValue, setInternalValue] = useState<string>(() =>
    formatMaskedValue(defaultValue ?? '', mask)
  );
  const currentValue = value !== undefined ? value : internalValue;

  const commit = (nextValue: string) => {
    const formatted = formatMaskedValue(nextValue, mask);

    if (value === undefined) {
      setInternalValue(formatted);
    }

    typeof onChange === 'function' && onChange(formatted);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    commit(event.target.value);
  };

  return (
    <Input
      {...others}
      ref={ref}
      type="text"
      value={formatMaskedValue(currentValue, mask)}
      onChange={handleChange}
    />
  );
});

_MaskedInput.displayName = 'MaskedInput';

export { _MaskedInput as MaskedInput };
