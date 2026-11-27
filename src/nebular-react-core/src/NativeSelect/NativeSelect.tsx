import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import { useId } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type NativeSelectSize = 'sm' | 'md' | 'lg';
export type NativeSelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface NativeSelectStylesParams {
  size: NativeSelectSize;
  hasError: boolean;
}

const useStyles = createStyles((_theme, { size, hasError }: NativeSelectStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--native-select-gap, 0.25rem)',
    width: '100%',
    fontFamily: 'var(--native-select-font-family, inherit)'
  },

  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    color: 'var(--native-select-label-color, var(--text-basic-color, #222b45))',
    fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '0.875rem' : '0.8125rem',
    fontWeight: 600,
    lineHeight: 1.4
  },

  required: {
    color: 'var(--native-select-required-color, var(--color-danger-500, #ff3d71))'
  },

  description: {
    color: 'var(--native-select-description-color, var(--text-basic-color, #222b45))',
    fontSize: '0.75rem',
    lineHeight: 1.4
  },

  select: {
    width: '100%',
    minHeight: size === 'sm' ? '2rem' : size === 'lg' ? '2.75rem' : '2.375rem',
    padding:
      size === 'sm' ? '0.25rem 0.5rem' : size === 'lg' ? '0.5rem 0.75rem' : '0.375rem 0.625rem',
    border: `1px solid ${
      hasError
        ? 'var(--native-select-error-border-color, var(--color-danger-500, #ff3d71))'
        : 'var(--native-select-border-color, var(--border-basic-color-3, #e4e9f2))'
    }`,
    borderRadius: 'var(--native-select-border-radius, 0.25rem)',
    backgroundColor: 'var(--native-select-background-color, var(--background-basic-color-1, #fff))',
    color: 'var(--native-select-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: size === 'sm' ? '0.8125rem' : size === 'lg' ? '0.9375rem' : '0.875rem',
    lineHeight: 1.4,
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--native-select-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    },

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 'var(--native-select-disabled-opacity, 0.6)'
    }
  },

  error: {
    color:
      'var(--native-select-error-color, color-mix(in srgb, var(--color-danger-500, #ff3d71) 55%, var(--text-basic-color, #222b45)))',
    fontSize: '0.75rem',
    lineHeight: 1.4
  }
}));

export type NativeSelectStylesNames = Selectors<typeof useStyles>;

export interface NativeSelectProps
  extends
    DefaultProps<NativeSelectStylesNames, NativeSelectStylesParams>,
    Omit<
      React.ComponentPropsWithoutRef<'select'>,
      'onChange' | 'value' | 'defaultValue' | 'size' | 'children'
    > {
  data: (string | NativeSelectItem)[];
  value?: string;
  defaultValue?: string;
  onChange?(value: string, event: React.ChangeEvent<HTMLSelectElement>): void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  placeholder?: string;
  size?: NativeSelectSize;
  ariaLabel?: string;
}

const defaultProps: Partial<NativeSelectProps> = {
  size: 'md',
  required: false,
  withAsterisk: false,
  defaultValue: ''
};

const _NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>((props, ref) => {
  const {
    data,
    value,
    defaultValue,
    onChange,
    label,
    description,
    error,
    required,
    withAsterisk,
    placeholder,
    size,
    ariaLabel,
    disabled,
    id,
    className,
    classNames,
    styles,
    unstyled,
    'aria-describedby': ariaDescribedBy,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const uuid = useId(id);
  const descriptionId = useId();
  const errorId = useId();
  const [_value, setValue] = useUncontrolled<string>({
    value,
    defaultValue,
    finalValue: ''
  });
  const { classes, cx } = useStyles(
    { size, hasError: Boolean(error) },
    { name: 'native-select', classNames, styles, unstyled }
  );
  const items = data.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item
  );
  const describedBy = [
    ariaDescribedBy,
    description ? descriptionId : undefined,
    error ? errorId : undefined
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  const withRequiredMark = required || withAsterisk;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.currentTarget.value);
    onChange?.(event.currentTarget.value, event);
  };

  return (
    <div className={cx(classes.root, className)}>
      {label && (
        <label className={cx(classes.label)} htmlFor={uuid}>
          {label}
          {withRequiredMark && (
            <span className={cx(classes.required)} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {description && (
        <div id={descriptionId} className={cx(classes.description)}>
          {description}
        </div>
      )}

      <select
        {...others}
        ref={ref}
        id={uuid}
        value={_value}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cx(classes.select)}
        onChange={handleChange}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {items.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))}
      </select>

      {error && (
        <div id={errorId} role="alert" className={cx(classes.error)}>
          {error}
        </div>
      )}
    </div>
  );
});

_NativeSelect.displayName = 'NativeSelect';

export { _NativeSelect as NativeSelect };
