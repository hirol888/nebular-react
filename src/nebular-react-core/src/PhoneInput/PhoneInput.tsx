import React, { forwardRef, useState } from 'react';
import { useComponentDefaultProps } from '@nebular-react/styles';
import {
  AsYouType,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode
} from 'libphonenumber-js';
import { Input, InputProps } from '../Input';

export type PhoneCountry = CountryCode;

export type PhoneOutputFormat = 'national' | 'international' | 'e164';

export interface PhoneNumberMeta {
  country?: PhoneCountry;
  national: string;
  international: string;
  e164: string;
  valid: boolean;
  possible: boolean;
}

export interface PhoneFormatOptions {
  country?: PhoneCountry;
  /** Renders the country calling code before the number. */
  withCountryCode?: boolean;
  /** Keeps up to 15 digits with a leading `+` and no mask. */
  allowInternational?: boolean;
  /** Shape returned by `formatPhoneNumber`. Defaults to `national`. */
  outputFormat?: PhoneOutputFormat;
}

export interface PhoneInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type'
> {
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  onChangeMeta?(meta: PhoneNumberMeta): void;
  country?: PhoneCountry;
  defaultCountry?: PhoneCountry;
  outputFormat?: PhoneOutputFormat;
  withCountryCode?: boolean;
  allowInternational?: boolean;
}

export const INTERNATIONAL_MAX_DIGITS = 15;

const DEFAULT_COUNTRY: PhoneCountry = 'BR';
const LEGACY_MAX_DIGITS: Partial<Record<PhoneCountry, number>> = {
  BR: 11,
  US: 10
};

const onlyDigits = (value: string | null | undefined): string =>
  String(value ?? '').replace(/\D/g, '');

const normalizeCountry = (country?: string): PhoneCountry => {
  const candidate = String(country ?? DEFAULT_COUNTRY).toUpperCase();

  try {
    getCountryCallingCode(candidate as PhoneCountry);
    return candidate as PhoneCountry;
  } catch {
    return DEFAULT_COUNTRY;
  }
};

const getCallingCode = (country: PhoneCountry): string => {
  try {
    return getCountryCallingCode(country);
  } catch {
    return getCountryCallingCode(DEFAULT_COUNTRY);
  }
};

const formatBrazilianPhone = (digits: string): string => {
  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const prefix = `(${digits.slice(0, 2)}) `;
  const subscriber = digits.slice(2);

  if (digits.length <= 6) {
    return `${prefix}${subscriber}`;
  }

  if (digits.length <= 10) {
    return `${prefix}${subscriber.slice(0, 4)}-${subscriber.slice(4)}`;
  }

  return `${prefix}${subscriber.slice(0, 5)}-${subscriber.slice(5, 9)}`;
};

const formatUnitedStatesPhone = (digits: string): string => {
  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  const prefix = `(${digits.slice(0, 3)}) `;
  const subscriber = digits.slice(3);

  if (digits.length <= 6) {
    return `${prefix}${subscriber}`;
  }

  return `${prefix}${subscriber.slice(0, 3)}-${subscriber.slice(3, 7)}`;
};

const formatLegacyPartial = (digits: string, country: PhoneCountry): string =>
  country === 'US' ? formatUnitedStatesPhone(digits) : formatBrazilianPhone(digits);

const getNationalDigits = (value: string, country: PhoneCountry): string => {
  const text = String(value ?? '').trim();
  const digits = onlyDigits(text);

  if (!digits) {
    return '';
  }

  if (text.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(text);

    if (parsed) {
      return parsed.nationalNumber;
    }

    const callingCode = getCallingCode(country);

    return digits.startsWith(callingCode) ? digits.slice(callingCode.length) : digits;
  }

  const callingCode = getCallingCode(country);
  const maxDigits = LEGACY_MAX_DIGITS[country];

  if (maxDigits && digits.length > maxDigits && digits.startsWith(callingCode)) {
    return digits.slice(callingCode.length, callingCode.length + maxDigits);
  }

  if (maxDigits) {
    return digits.slice(0, maxDigits);
  }

  return digits.startsWith(callingCode) && digits.length > INTERNATIONAL_MAX_DIGITS
    ? digits.slice(callingCode.length)
    : digits.slice(0, INTERNATIONAL_MAX_DIGITS);
};

const formatPartialNumber = (
  digits: string,
  country: PhoneCountry,
  outputFormat: PhoneOutputFormat,
  withCountryCode: boolean
): string => {
  if (!digits) {
    return '';
  }

  const callingCode = getCallingCode(country);

  if (LEGACY_MAX_DIGITS[country]) {
    const local = formatLegacyPartial(digits, country);

    if (outputFormat === 'e164') {
      return `+${callingCode}${digits}`;
    }

    return outputFormat === 'international' || withCountryCode ? `+${callingCode} ${local}` : local;
  }

  const formatted = new AsYouType(country).input(digits);

  if (outputFormat === 'e164') {
    return `+${callingCode}${digits}`;
  }

  return outputFormat === 'international' || withCountryCode
    ? `+${callingCode} ${formatted}`
    : formatted;
};

/** Formats a phone number according to the selected country and output format. */
export function formatPhoneNumber(
  value: string | null | undefined,
  options: PhoneFormatOptions = {}
): string {
  const country = normalizeCountry(options.country);
  const { withCountryCode = false, allowInternational = false } = options;
  const outputFormat = options.outputFormat ?? 'national';
  const text = String(value ?? '');
  const digits = onlyDigits(text);

  if (!digits) {
    return '';
  }

  if (allowInternational) {
    return `+${digits.slice(0, INTERNATIONAL_MAX_DIGITS)}`;
  }

  const nationalDigits = getNationalDigits(text, country);
  const isLegacyCountry = !!LEGACY_MAX_DIGITS[country];
  const parsed = text.startsWith('+')
    ? parsePhoneNumberFromString(text)
    : parsePhoneNumberFromString(nationalDigits, country);
  const parsedCountry = normalizeCountry(parsed?.country ?? country);

  if (outputFormat === 'e164') {
    return parsed?.number ?? `+${getCallingCode(parsedCountry)}${nationalDigits}`;
  }

  if (isLegacyCountry) {
    if (outputFormat === 'international' && parsed?.isPossible()) {
      return parsed.formatInternational();
    }

    const local = formatLegacyPartial(nationalDigits, country);
    const callingCode = getCallingCode(country);

    if (outputFormat === 'international') {
      return `+${callingCode} ${local}`;
    }

    return withCountryCode ? `+${callingCode} ${local}` : local;
  }

  if (parsed?.isPossible() || parsed?.isValid()) {
    return outputFormat === 'international' || withCountryCode
      ? parsed.formatInternational()
      : parsed.formatNational();
  }

  return formatPartialNumber(nationalDigits, parsedCountry, outputFormat, withCountryCode);
}

/** Extracts only the digits of a phone number, including its country code. */
export function parsePhoneNumber(value: string | null | undefined): string {
  return onlyDigits(value);
}

function getPhoneNumberMeta(value: string, country: PhoneCountry): PhoneNumberMeta {
  const text = String(value ?? '').trim();
  const digits = onlyDigits(text);

  if (!digits) {
    return {
      country,
      national: '',
      international: '',
      e164: '',
      valid: false,
      possible: false
    };
  }

  const parsed = text.startsWith('+')
    ? parsePhoneNumberFromString(text)
    : parsePhoneNumberFromString(digits, country);
  const parsedCountry = normalizeCountry(parsed?.country ?? country);
  const fallback = formatPhoneNumber(text, { country, outputFormat: 'national' });
  const fallbackInternational = formatPhoneNumber(text, {
    country,
    outputFormat: 'international'
  });
  const fallbackE164 = formatPhoneNumber(text, { country, outputFormat: 'e164' });

  return {
    country: parsedCountry,
    national: parsed?.formatNational() ?? fallback,
    international: parsed?.formatInternational() ?? fallbackInternational,
    e164: parsed?.number ?? fallbackE164,
    valid: parsed?.isValid() ?? false,
    possible: parsed?.isPossible() ?? false
  };
}

const defaultProps: Partial<PhoneInputProps> = {
  defaultCountry: DEFAULT_COUNTRY,
  outputFormat: 'national',
  withCountryCode: true,
  allowInternational: false
};

const _PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    onChangeMeta,
    country,
    defaultCountry,
    outputFormat,
    withCountryCode,
    allowInternational,
    onBlur,
    inputMode,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const resolvedCountry = normalizeCountry(country ?? defaultCountry);

  const [internalValue, setInternalValue] = useState<string>(() =>
    formatPhoneNumber(defaultValue ?? '', {
      country: resolvedCountry,
      outputFormat,
      allowInternational
    })
  );
  const currentValue = value !== undefined ? value : internalValue;
  const displayValue = formatPhoneNumber(currentValue ?? '', {
    country: resolvedCountry,
    withCountryCode,
    allowInternational
  });

  const commit = (rawValue: string) => {
    const nextValue = formatPhoneNumber(rawValue, {
      country: resolvedCountry,
      outputFormat,
      allowInternational
    });

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    typeof onChange === 'function' && onChange(nextValue);
    typeof onChangeMeta === 'function' &&
      onChangeMeta(getPhoneNumberMeta(rawValue, resolvedCountry));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    commit(event.target.value);
  };

  return (
    <Input
      {...others}
      ref={ref}
      type="text"
      inputMode={inputMode ?? 'tel'}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
    />
  );
});

_PhoneInput.displayName = 'PhoneInput';

export { _PhoneInput as PhoneInput };
