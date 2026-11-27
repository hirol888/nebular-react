import React, { forwardRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Checkbox } from '../Checkbox';

export type CheckboxGroupOrientation = 'horizontal' | 'vertical';

export interface CheckboxGroupItem {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export interface CheckboxGroupStylesParams {
  orientation: CheckboxGroupOrientation;
}

const useStyles = createStyles((_theme, { orientation }: CheckboxGroupStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--checkbox-group-gap, 0.375rem)',
    width: '100%',
    fontFamily: 'var(--checkbox-group-text-font-family, inherit)'
  },

  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    color: 'var(--checkbox-group-label-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--checkbox-group-label-font-size, 0.8125rem)',
    fontWeight: 'var(--checkbox-group-label-font-weight, 600)' as any,
    lineHeight: 'var(--checkbox-group-label-line-height, 1.4)'
  },

  required: {
    color: 'var(--checkbox-group-required-color, var(--color-danger-500, #ff3d71))'
  },

  description: {
    color: 'var(--checkbox-group-description-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--checkbox-group-description-font-size, 0.75rem)',
    lineHeight: 'var(--checkbox-group-description-line-height, 1.4)'
  },

  items: {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
    gap: 'var(--checkbox-group-items-gap, 0.5rem)'
  },

  error: {
    color: 'var(--checkbox-group-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--checkbox-group-error-font-size, 0.75rem)',
    lineHeight: 'var(--checkbox-group-error-line-height, 1.4)'
  }
}));

export type CheckboxGroupStylesNames = Selectors<typeof useStyles>;

export interface CheckboxGroupProps
  extends
    DefaultProps<CheckboxGroupStylesNames, CheckboxGroupStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  data: (string | CheckboxGroupItem)[];
  value?: string[];
  defaultValue?: string[];
  onChange?(value: string[]): void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  orientation?: CheckboxGroupOrientation;
  disabled?: boolean;
  ariaLabel?: string;
}

const defaultProps: Partial<CheckboxGroupProps> = {
  orientation: 'vertical',
  disabled: false,
  required: false,
  withAsterisk: false,
  defaultValue: []
};

const _CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>((props, ref) => {
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
  const { classes, cx } = useStyles(
    { orientation },
    { name: 'checkbox-group', classNames, styles, unstyled }
  );

  const [selectedValues, setSelectedValues] = useUncontrolled<string[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange
  });

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
      className={cx(classes.root, className)}
      data-orientation={orientation}
      data-required={required || undefined}
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
          <Checkbox
            key={item.value}
            checked={selectedValues.includes(item.value)}
            disabled={disabled || item.disabled}
            onCheck={(checked) => toggle(item.value, checked)}
          >
            {item.label}
          </Checkbox>
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

_CheckboxGroup.displayName = 'CheckboxGroup';

export { _CheckboxGroup as CheckboxGroup };
