import React, { forwardRef, useId, useRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface PinInputStylesParams {
  disabled: boolean;
}

const useStyles = createStyles((_theme, { disabled }: PinInputStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontFamily: 'inherit'
  },

  label: {
    color: 'var(--pin-input-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--pin-input-label-font-size, 0.8125rem)',
    fontWeight: 600
  },

  inputs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--pin-input-gap, 0.5rem)'
  },

  input: {
    width: 'var(--pin-input-size, 2.5rem)',
    height: 'var(--pin-input-size, 2.5rem)',
    padding: 0,
    textAlign: 'center',
    border: '1px solid var(--pin-input-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--pin-input-border-radius, 0.25rem)',
    backgroundColor: 'var(--pin-input-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--pin-input-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: 'var(--pin-input-font-size, 1rem)',
    lineHeight: 1,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 120ms ease',
    cursor: disabled ? 'not-allowed' : 'text',

    '&:focus': {
      borderColor: 'var(--pin-input-focus-border-color, var(--color-primary-500, #3366ff))'
    },

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.6
    }
  },

  error: {
    color: 'var(--pin-input-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--pin-input-error-font-size, 0.75rem)'
  }
}));

export type PinInputStylesNames = Selectors<typeof useStyles>;

export interface PinInputProps
  extends
    DefaultProps<PinInputStylesNames, PinInputStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  mask?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  oneTimeCode?: boolean;
  type?: 'numeric' | 'alphanumeric';
  ariaLabel?: string;
  label?: React.ReactNode;
  error?: React.ReactNode;
}

const defaultProps: Partial<PinInputProps> = {
  length: 6,
  mask: false,
  disabled: false,
  autoFocus: false,
  oneTimeCode: false,
  type: 'numeric'
};

const DISALLOWED_CHARS: Record<'numeric' | 'alphanumeric', RegExp> = {
  numeric: /[^0-9]/g,
  alphanumeric: /[^a-zA-Z0-9]/g
};

const _PinInput = forwardRef<HTMLDivElement, PinInputProps>((props, ref) => {
  const {
    length,
    value,
    defaultValue,
    onChange,
    mask,
    disabled,
    autoFocus,
    oneTimeCode,
    type,
    ariaLabel,
    label,
    error,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { disabled },
    { name: 'pin-input', classNames, styles, unstyled }
  );
  const [_value, setValue] = useUncontrolled<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange
  });
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const baseId = useId();
  const errorId = `${baseId}-error`;
  const chars = Array.from({ length }, (_, index) => _value[index] ?? '');

  const sanitize = (raw: string) => raw.replace(DISALLOWED_CHARS[type], '');

  const setChars = (next: string[], focusIndex?: number) => {
    setValue(next.join(''));

    if (focusIndex !== undefined) {
      const target = inputsRef.current[focusIndex];

      if (target) {
        target.focus();
      }
    }
  };

  const fillFrom = (startIndex: number, raw: string) => {
    const sanitized = sanitize(raw);

    if (!sanitized) {
      return;
    }

    const next = chars.slice();
    let cursor = startIndex;

    for (let position = 0; position < sanitized.length; position += 1) {
      if (cursor >= length) {
        break;
      }

      next[cursor] = sanitized[position];
      cursor += 1;
    }

    setChars(next, Math.min(cursor, length - 1));
  };

  const clearAt = (index: number, focusIndex?: number) => {
    const next = chars.slice();
    next[index] = '';
    setChars(next, focusIndex);
  };

  const handleChange = (index: number, raw: string) => {
    const sanitized = sanitize(raw);

    if (!sanitized) {
      clearAt(index);
      return;
    }

    fillFrom(index, sanitized);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !chars[index]) {
      event.preventDefault();

      if (index > 0) {
        clearAt(index - 1, index - 1);
      }

      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData ? event.clipboardData.getData('text') : '');
  };

  const groupLabel = ariaLabel ?? (typeof label === 'string' ? label : 'Pin input');

  return (
    <div
      {...others}
      ref={ref}
      role="group"
      aria-label={groupLabel}
      className={cx(classes.root, className)}
    >
      {label && (
        <label className={cx(classes.label)} htmlFor={`${baseId}-0`}>
          {label}
        </label>
      )}

      <div className={cx(classes.inputs)}>
        {Array.from({ length }, (_, index) => (
          <input
            key={`${baseId}-${index}`}
            id={`${baseId}-${index}`}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            className={cx(classes.input)}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            pattern={type === 'numeric' ? '[0-9]*' : undefined}
            autoComplete={oneTimeCode ? 'one-time-code' : 'off'}
            maxLength={1}
            value={chars[index]}
            disabled={disabled}
            aria-label={`Character ${index + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            autoFocus={autoFocus && index === 0}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
          />
        ))}
      </div>

      {error && (
        <div id={errorId} className={cx(classes.error)} role="alert">
          {error}
        </div>
      )}
    </div>
  );
});

_PinInput.displayName = 'PinInput';

export { _PinInput as PinInput };
