import React, { forwardRef, useState } from 'react';
import { useComponentDefaultProps } from '@nebular-react/styles';
import { Input, InputProps } from '../Input';

const DEFAULT_CURRENCY = 'BRL';
const DEFAULT_LOCALE = 'pt-BR';
const DEFAULT_DECIMALS = 2;

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
  /** Literal rendered before the formatted amount, e.g. `Total: `. */
  prefix?: string;
}

export interface CurrencyParseOptions {
  locale?: string;
  decimalSeparator?: string;
  groupSeparator?: string;
}

export interface CurrencyInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type'
> {
  value?: number | null;
  defaultValue?: number | null;
  onChange?(value: number | null): void;
  currency?: string;
  locale?: string;
  decimals?: number;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  prefix?: string;
}

const getSeparators = (locale: string): { group: string; decimal: string } => {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const group = parts.find((part) => part.type === 'group')?.value;
    const decimal = parts.find((part) => part.type === 'decimal')?.value;

    return { group: group ?? '.', decimal: decimal ?? ',' };
  } catch {
    return { group: '.', decimal: ',' };
  }
};

/** Formats `value` as a currency amount using `Intl.NumberFormat`. */
export function formatCurrencyValue(
  value: number | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '';
  }

  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    decimals = DEFAULT_DECIMALS,
    prefix = ''
  } = options;

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);

  return `${prefix}${formatted}`;
}

/**
 * Parses a localized currency text into a number. Only digits, sign and
 * separators are taken into account, every other character is ignored.
 */
export function parseCurrencyValue(
  value: string | null | undefined,
  options: CurrencyParseOptions = {}
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  const { locale = DEFAULT_LOCALE } = options;
  const separators = getSeparators(locale);
  const groupSeparator = options.groupSeparator ?? separators.group;
  const decimalSeparator = options.decimalSeparator ?? separators.decimal;

  const negative = text.includes('-') || /^\(.*\)$/.test(text);
  let normalized = text.replace(/[^0-9.,]/g, '');

  if (groupSeparator && groupSeparator !== decimalSeparator) {
    normalized = normalized.split(groupSeparator).join('');
  }

  if (decimalSeparator !== '.') {
    normalized = normalized.split(decimalSeparator).join('.');
  }

  const chunks = normalized.split('.');
  if (chunks.length > 2) {
    normalized = `${chunks.slice(0, -1).join('')}.${chunks[chunks.length - 1]}`;
  }

  if (!/\d/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return negative ? -parsed : parsed;
}

const defaultProps: Partial<CurrencyInputProps> = {
  currency: DEFAULT_CURRENCY,
  locale: DEFAULT_LOCALE,
  decimals: DEFAULT_DECIMALS,
  allowNegative: false
};

const _CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    currency,
    locale,
    decimals,
    min,
    max,
    allowNegative,
    prefix,
    onBlur,
    ...others
  } = useComponentDefaultProps(defaultProps, props);

  const clamp = (nextValue: number | null): number | null => {
    if (nextValue === null || !Number.isFinite(nextValue)) {
      return null;
    }

    let normalized = nextValue;

    if (!allowNegative) {
      normalized = Math.max(0, normalized);
    }

    if (typeof min === 'number') {
      normalized = Math.max(min, normalized);
    }

    if (typeof max === 'number') {
      normalized = Math.min(max, normalized);
    }

    if (typeof decimals === 'number') {
      normalized = Number(normalized.toFixed(decimals));
    }

    return normalized;
  };

  const [internalValue, setInternalValue] = useState<number | null>(() =>
    clamp(defaultValue ?? null)
  );
  const currentValue = value !== undefined ? value : internalValue;

  const commit = (nextValue: number | null) => {
    const normalized = clamp(nextValue);

    if (value === undefined) {
      setInternalValue(normalized);
    }

    typeof onChange === 'function' && onChange(normalized);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    commit(parseCurrencyValue(event.target.value, { locale }));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    commit(currentValue ?? null);
    typeof onBlur === 'function' && onBlur(event);
  };

  return (
    <Input
      {...others}
      ref={ref}
      type="text"
      inputMode="decimal"
      value={formatCurrencyValue(currentValue, { currency, locale, decimals, prefix })}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

_CurrencyInput.displayName = 'CurrencyInput';

export { _CurrencyInput as CurrencyInput };
