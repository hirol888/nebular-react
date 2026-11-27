import React, { forwardRef, useState } from 'react';
import { Input, InputProps } from '../Input';

export interface NumberInputProps extends Omit<
  InputProps,
  'onChange' | 'value' | 'defaultValue' | 'type'
> {
  value?: number | null;
  defaultValue?: number | null;
  onChange?(value: number | null): void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
}

const _NumberInput = forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {
  const { value, defaultValue, onChange, min, max, step, precision, onBlur, ...others } = props;
  const [internalValue, setInternalValue] = useState<number | null>(defaultValue ?? null);
  const currentValue = value !== undefined ? value : internalValue;

  const normalize = (nextValue: number | null): number | null => {
    if (nextValue === null || Number.isNaN(nextValue)) {
      return null;
    }

    let normalized = nextValue;

    if (typeof min === 'number') {
      normalized = Math.max(min, normalized);
    }

    if (typeof max === 'number') {
      normalized = Math.min(max, normalized);
    }

    if (typeof precision === 'number') {
      normalized = Number(normalized.toFixed(precision));
    }

    return normalized;
  };

  const commit = (nextValue: number | null) => {
    const normalized = normalize(nextValue);

    if (value === undefined) {
      setInternalValue(normalized);
    }

    typeof onChange === 'function' && onChange(normalized);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    commit(rawValue === '' ? null : Number(rawValue));
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    commit(currentValue);
    typeof onBlur === 'function' && onBlur(event);
  };

  return (
    <Input
      {...others}
      ref={ref}
      type="number"
      min={min}
      max={max}
      step={step ?? 1}
      value={currentValue === null || currentValue === undefined ? '' : String(currentValue)}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
});

_NumberInput.displayName = 'NumberInput';

export { _NumberInput as NumberInput };
