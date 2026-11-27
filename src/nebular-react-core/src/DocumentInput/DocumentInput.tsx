import React, { forwardRef, useState } from 'react';
import { useComponentDefaultProps } from '@nebular-react/styles';
import { Input, InputProps } from '../Input';

export type DocumentType = 'cpf' | 'cnpj' | 'auto';

const onlyDigits = (value: string | null | undefined): string =>
  String(value ?? '').replace(/\D/g, '');

const formatCpf = (digits: string): string => {
  const value = digits.slice(0, 11);

  if (value.length <= 3) {
    return value;
  }

  if (value.length <= 6) {
    return `${value.slice(0, 3)}.${value.slice(3)}`;
  }

  if (value.length <= 9) {
    return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
  }

  return `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
};

const formatCnpj = (digits: string): string => {
  const value = digits.slice(0, 14);

  if (value.length <= 2) {
    return value;
  }

  if (value.length <= 5) {
    return `${value.slice(0, 2)}.${value.slice(2)}`;
  }

  if (value.length <= 8) {
    return `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`;
  }

  if (value.length <= 12) {
    return `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(8)}`;
  }

  return `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5, 8)}/${value.slice(
    8,
    12
  )}-${value.slice(12)}`;
};

const resolveDocumentType = (digits: string, type: DocumentType): 'cpf' | 'cnpj' => {
  if (type !== 'auto') {
    return type;
  }

  return digits.length <= 11 ? 'cpf' : 'cnpj';
};

/** Formats a CPF/CNPJ document, keeping the mask progressive while typing. */
export function formatDocument(
  value: string | null | undefined,
  type: DocumentType = 'auto'
): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return '';
  }

  return resolveDocumentType(digits, type) === 'cpf' ? formatCpf(digits) : formatCnpj(digits);
}

/** Extracts only the digits of a CPF/CNPJ document. */
export function parseDocument(value: string | null | undefined): string {
  return onlyDigits(value);
}

const CPF_CHECK_FACTORS = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const CPF_CHECK_FACTORS_SECOND = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_CHECK_FACTORS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_CHECK_FACTORS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

const calculateCheckDigit = (digits: string, factors: number[]): number => {
  const total = factors.reduce((sum, factor, index) => sum + Number(digits[index]) * factor, 0);
  const remainder = total % 11;

  return remainder < 2 ? 0 : 11 - remainder;
};

/** Validates the CPF check digits. */
export function isValidCpf(value: string | null | undefined): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  return (
    calculateCheckDigit(digits, CPF_CHECK_FACTORS) === Number(digits[9]) &&
    calculateCheckDigit(digits, CPF_CHECK_FACTORS_SECOND) === Number(digits[10])
  );
}

/** Validates the CNPJ check digits. */
export function isValidCnpj(value: string | null | undefined): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  return (
    calculateCheckDigit(digits, CNPJ_CHECK_FACTORS) === Number(digits[12]) &&
    calculateCheckDigit(digits, CNPJ_CHECK_FACTORS_SECOND) === Number(digits[13])
  );
}

export interface DocumentInputProps extends Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'type'
> {
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  documentType?: DocumentType;
}

const defaultProps: Partial<DocumentInputProps> = {
  documentType: 'auto'
};

const _DocumentInput = forwardRef<HTMLInputElement, DocumentInputProps>((props, ref) => {
  const { value, defaultValue, onChange, documentType, onBlur, inputMode, ...others } =
    useComponentDefaultProps(defaultProps, props);

  const [internalValue, setInternalValue] = useState<string>(() =>
    formatDocument(defaultValue ?? '', documentType)
  );
  const currentValue = value !== undefined ? value : internalValue;
  const displayValue = formatDocument(currentValue ?? '', documentType);

  const commit = (rawValue: string) => {
    const nextValue = formatDocument(rawValue, documentType);

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    typeof onChange === 'function' && onChange(nextValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    commit(event.target.value);
  };

  return (
    <Input
      {...others}
      ref={ref}
      type="text"
      inputMode={inputMode ?? 'numeric'}
      value={displayValue}
      onChange={handleChange}
      onBlur={onBlur}
    />
  );
});

_DocumentInput.displayName = 'DocumentInput';

export { _DocumentInput as DocumentInput };
