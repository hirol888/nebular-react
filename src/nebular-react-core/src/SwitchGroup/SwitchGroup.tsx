import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Toggle } from '../Toggle';

export type SwitchGroupOrientation = 'horizontal' | 'vertical';

export interface SwitchGroupItem {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SwitchGroupStylesParams {
  orientation: SwitchGroupOrientation;
}

const useStyles = createStyles((_theme, { orientation }: SwitchGroupStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--switch-group-gap, 0.375rem)',
    width: '100%',
    fontFamily: 'var(--switch-group-font-family, inherit)'
  },

  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    color: 'var(--switch-group-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--switch-group-label-font-size, 0.8125rem)',
    fontWeight: 600,
    lineHeight: 1.4
  },

  required: {
    color: 'var(--switch-group-required-color, var(--color-danger-500, #ff3d71))'
  },

  description: {
    color: 'var(--switch-group-description-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--switch-group-description-font-size, 0.75rem)',
    lineHeight: 1.4
  },

  items: {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
    gap: 'var(--switch-group-items-gap, 0.5rem)'
  },

  error: {
    color:
      'var(--switch-group-error-color, color-mix(in srgb, var(--color-danger-500, #ff3d71) 55%, var(--text-basic-color, #222b45)))',
    fontSize: 'var(--switch-group-error-font-size, 0.75rem)',
    lineHeight: 1.4
  }
}));

export type SwitchGroupStylesNames = Selectors<typeof useStyles>;

export interface SwitchGroupProps
  extends
    DefaultProps<SwitchGroupStylesNames, SwitchGroupStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  data: (string | SwitchGroupItem)[];
  value?: string[];
  defaultValue?: string[];
  onChange?(value: string[]): void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  orientation?: SwitchGroupOrientation;
  disabled?: boolean;
  ariaLabel?: string;
}

const defaultProps: Partial<SwitchGroupProps> = {
  orientation: 'vertical',
  disabled: false,
  required: false,
  withAsterisk: false,
  defaultValue: []
};

const _SwitchGroup = forwardRef<HTMLDivElement, SwitchGroupProps>((props, ref) => {
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
    orientation,
    disabled,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const [selectedValues, setSelectedValues] = useUncontrolled<string[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange
  });
  const { classes, cx } = useStyles(
    { orientation },
    { name: 'switch-group', classNames, styles, unstyled }
  );
  const items = data.map((item) =>
    typeof item === 'string' ? { label: item, value: item } : item
  );
  const withRequiredMark = required || withAsterisk;
  const groupLabel = ariaLabel ?? (typeof label === 'string' ? label : undefined);

  const toggle = (itemValue: string, checked: boolean) => {
    if (!checked) {
      setSelectedValues(selectedValues.filter((selected) => selected !== itemValue));
      return;
    }

    setSelectedValues(
      selectedValues.includes(itemValue) ? selectedValues : [...selectedValues, itemValue]
    );
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
          <Toggle
            key={item.value}
            checked={selectedValues.includes(item.value)}
            disabled={disabled || item.disabled}
            onCheckedChange={(checked) => toggle(item.value, checked)}
          >
            {item.label}
          </Toggle>
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

_SwitchGroup.displayName = 'SwitchGroup';

export { _SwitchGroup as SwitchGroup };
