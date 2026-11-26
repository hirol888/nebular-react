import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type ChipSize = 'sm' | 'md' | 'lg';
export type ChipVariant = 'filled' | 'outline' | 'light';
export type ChipGroupOrientation = 'horizontal' | 'vertical';

export interface ChipStylesParams {
  size: ChipSize;
  variant: ChipVariant;
  status: ComponentOrCustomStatus;
}

const STATUS_COLORS: Record<string, string> = {
  basic: '#8f9bb3',
  primary: '#3366ff',
  success: '#00d68f',
  info: '#0095ff',
  warning: '#ffaa00',
  danger: '#ff3d71',
  control: '#8f9bb3'
};

const getStatusColor = (status: ComponentOrCustomStatus): string =>
  STATUS_COLORS[status] ?? String(status);

const useStyles = createStyles((_theme, { size, variant, status }: ChipStylesParams) => {
  const color = getStatusColor(status);
  const filledText = STATUS_COLORS[status] && status !== 'primary' ? '#12131a' : '#fff';
  const background =
    variant === 'filled'
      ? color
      : variant === 'light'
        ? `color-mix(in srgb, ${color} 16%, transparent)`
        : 'transparent';

  return {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--chip-gap, 0.375rem)',
      minHeight: size === 'sm' ? '1.75rem' : size === 'lg' ? '2.5rem' : '2.125rem',
      padding:
        size === 'sm' ? '0.125rem 0.625rem' : size === 'lg' ? '0.375rem 1rem' : '0.25rem 0.75rem',
      border: variant === 'outline' ? `1px solid ${color}` : '1px solid transparent',
      borderRadius: 'var(--chip-border-radius, 999px)',
      backgroundColor: background,
      color:
        variant === 'filled'
          ? `var(--chip-filled-color, ${filledText})`
          : `color-mix(in srgb, ${color} 25%, var(--text-basic-color, #222b45))`,
      fontFamily: 'var(--chip-font-family, inherit)',
      fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '0.9375rem' : '0.8125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background-color 120ms ease, border-color 120ms ease, opacity 120ms ease',

      '&:hover:not(:disabled)': {
        filter: 'brightness(0.97)'
      },

      '&:focus-visible': {
        outline: '2px solid var(--chip-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      },

      '&:disabled': {
        opacity: 'var(--chip-disabled-opacity, 0.5)',
        cursor: 'not-allowed'
      },

      '&[aria-checked="true"]': {
        boxShadow:
          variant === 'filled'
            ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.35)'
            : `inset 0 0 0 1px ${color}`
      }
    },

    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.1em',
      lineHeight: 1
    }
  };
});

export type ChipStylesNames = Selectors<typeof useStyles>;

export interface ChipProps
  extends
    DefaultProps<ChipStylesNames, ChipStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'button'>, 'onChange' | 'value'> {
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?(checked: boolean): void;
  disabled?: boolean;
  size?: ChipSize;
  variant?: ChipVariant;
  status?: ComponentOrCustomStatus;
  icon?: React.ReactNode;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const chipDefaultProps: Partial<ChipProps> = {
  size: 'md',
  variant: 'filled',
  status: 'primary',
  disabled: false
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>((props, ref) => {
  const {
    value,
    checked,
    defaultChecked,
    onChange,
    disabled,
    size,
    variant,
    status,
    icon,
    ariaLabel,
    children,
    className,
    classNames,
    styles,
    unstyled,
    onClick,
    ...others
  } = useComponentDefaultProps(chipDefaultProps, props);
  const [_checked, setChecked] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange
  });
  const { classes, cx } = useStyles(
    { size, variant, status },
    { name: 'chip', classNames, styles, unstyled }
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && !disabled) {
      setChecked(!_checked);
    }
  };

  return (
    <button
      {...others}
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={_checked}
      aria-label={ariaLabel}
      disabled={disabled}
      data-value={value}
      data-variant={variant}
      className={cx(classes.root, className)}
      onClick={handleClick}
    >
      {icon && (
        <span className={cx(classes.icon)} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
});

Chip.displayName = 'Chip';

export interface ChipGroupItem {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
}

export interface ChipGroupProps
  extends
    DefaultProps<ChipGroupStylesNames, ChipGroupStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  data: (string | ChipGroupItem)[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?(value: string | string[]): void;
  multiple?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  orientation?: ChipGroupOrientation;
  disabled?: boolean;
  ariaLabel?: string;
  size?: ChipSize;
  variant?: ChipVariant;
  status?: ComponentOrCustomStatus;
}

export interface ChipGroupStylesParams {
  orientation: ChipGroupOrientation;
}

const useGroupStyles = createStyles((_theme, { orientation }: ChipGroupStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--chip-group-gap, 0.375rem)',
    width: '100%',
    fontFamily: 'var(--chip-group-font-family, inherit)'
  },

  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    color: 'var(--chip-group-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--chip-group-label-font-size, 0.8125rem)',
    fontWeight: 600,
    lineHeight: 1.4
  },

  required: {
    color: 'var(--chip-group-required-color, var(--color-danger-500, #ff3d71))'
  },

  description: {
    color: 'var(--chip-group-description-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--chip-group-description-font-size, 0.75rem)',
    lineHeight: 1.4
  },

  items: {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
    gap: 'var(--chip-group-items-gap, 0.5rem)'
  },

  error: {
    color:
      'var(--chip-group-error-color, color-mix(in srgb, var(--color-danger-500, #ff3d71) 55%, var(--text-basic-color, #222b45)))',
    fontSize: 'var(--chip-group-error-font-size, 0.75rem)',
    lineHeight: 1.4
  }
}));

export type ChipGroupStylesNames = Selectors<typeof useGroupStyles>;

const groupDefaultProps: Partial<ChipGroupProps> = {
  multiple: false,
  orientation: 'horizontal',
  disabled: false,
  required: false,
  withAsterisk: false,
  size: 'md',
  variant: 'filled',
  status: 'primary'
};

export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>((props, ref) => {
  const {
    data,
    value,
    defaultValue,
    onChange,
    multiple,
    label,
    description,
    error,
    required,
    withAsterisk,
    orientation,
    disabled,
    ariaLabel,
    size,
    variant,
    status,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(groupDefaultProps, props);
  const initialValue = defaultValue ?? (multiple ? [] : '');
  const [_value, setValue] = useUncontrolled<string | string[]>({
    value,
    defaultValue: initialValue,
    finalValue: multiple ? [] : '',
    onChange
  });
  const selectedValues = Array.isArray(_value) ? _value : _value ? [_value] : [];
  const { classes, cx } = useGroupStyles(
    { orientation },
    { name: 'chip-group', classNames, styles, unstyled }
  );
  const items = data.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item
  );
  const withRequiredMark = required || withAsterisk;
  const groupLabel = ariaLabel ?? (typeof label === 'string' ? label : undefined);

  const handleChipChange = (itemValue: string, checked: boolean) => {
    if (multiple) {
      const next = checked
        ? selectedValues.includes(itemValue)
          ? selectedValues
          : [...selectedValues, itemValue]
        : selectedValues.filter((selected) => selected !== itemValue);
      setValue(next);
      return;
    }

    setValue(checked ? itemValue : '');
  };

  return (
    <div
      {...others}
      ref={ref}
      role="group"
      aria-label={groupLabel}
      data-invalid={error ? 'true' : undefined}
      data-orientation={orientation}
      data-required={required || undefined}
      className={cx(classes.root, className)}
    >
      {label && (
        <div className={cx(classes.label)}>
          {label}
          {withRequiredMark && (
            <span className={cx(classes.required)} aria-hidden="true">
              *
            </span>
          )}
        </div>
      )}

      {description && <div className={cx(classes.description)}>{description}</div>}

      <div className={cx(classes.items)}>
        {items.map((item) => (
          <Chip
            key={item.value}
            value={item.value}
            checked={selectedValues.includes(item.value)}
            disabled={disabled || item.disabled}
            size={size}
            variant={variant}
            status={status}
            onChange={(checked) => handleChipChange(item.value, checked)}
          >
            {item.label ?? item.value}
          </Chip>
        ))}
      </div>

      {error && (
        <div role="alert" className={cx(classes.error)}>
          {error}
        </div>
      )}
    </div>
  );
});

ChipGroup.displayName = 'ChipGroup';
