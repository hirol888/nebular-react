import React, { forwardRef, useId } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import { useUncontrolled } from '@nebular-react/hooks';
import { RadioGroupContext } from './RadioGroup.context';
import { RadioGroupItem } from './RadioGroupItem';
import type { RadioStylesNames } from './Radio';
import useStyles, { RadioGroupOrientation } from './Radio.style';

export interface RadioGroupItemData {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends
    DefaultProps<RadioStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  disabled?: boolean;
  status?: ComponentOrCustomStatus;
  data?: (string | RadioGroupItemData)[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  orientation?: RadioGroupOrientation;
  name?: string;
  ariaLabel?: string;
}

const defaultProps: Partial<RadioGroupProps> = {
  disabled: false,
  status: 'basic',
  orientation: 'vertical',
  required: false,
  withAsterisk: false,
  defaultValue: ''
};

const _RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>((props: RadioGroupProps, ref) => {
  const {
    value,
    defaultValue,
    children,
    onChange,
    disabled,
    status,
    data,
    label,
    description,
    error,
    required,
    withAsterisk,
    orientation,
    name,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': nativeAriaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { status, orientation },
    { name: 'radio', classNames, styles, unstyled }
  );

  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: '',
    onChange
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  const items = data?.map((item) =>
    typeof item === 'string' ? { value: item, label: item } : item
  );
  const groupId = useId();
  const labelId = `${groupId}-label`;
  const descriptionId = `${groupId}-description`;
  const errorId = `${groupId}-error`;
  const groupName = name ?? (items && `${groupId}-radio`);
  const withRequiredMark = required || withAsterisk;
  const groupLabel = ariaLabel ?? nativeAriaLabel;
  const descriptionIds = [
    ariaDescribedBy,
    description ? descriptionId : undefined,
    error ? errorId : undefined
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <RadioGroupContext.Provider
      value={{
        selectedValue: _value,
        groupDisabled: disabled,
        status,
        name: groupName,
        onChange: handleChange
      }}
    >
      <div
        {...others}
        className={cx(classes.group, className)}
        ref={ref}
        role="radiogroup"
        aria-label={groupLabel}
        aria-labelledby={ariaLabelledBy ?? (!groupLabel && label ? labelId : undefined)}
        aria-describedby={descriptionIds || undefined}
        aria-invalid={ariaInvalid ?? (error ? true : undefined)}
        aria-required={ariaRequired ?? (required || undefined)}
        data-orientation={orientation}
      >
        {label && (
          <div id={labelId} className={cx(classes.groupLabel)}>
            {label}
            {withRequiredMark && (
              <span className={cx(classes.required)} aria-hidden="true">
                *
              </span>
            )}
          </div>
        )}

        {description && (
          <div id={descriptionId} className={cx(classes.description)}>
            {description}
          </div>
        )}

        <div className={cx(classes.items)}>
          {items
            ? items.map((item) => (
                <RadioGroupItem
                  key={item.value}
                  value={item.value}
                  label={item.label ?? item.value}
                  disabled={item.disabled}
                  required={required}
                />
              ))
            : children}
        </div>

        {error && (
          <div id={errorId} role="alert" className={cx(classes.error)}>
            {error}
          </div>
        )}
      </div>
    </RadioGroupContext.Provider>
  );
});

_RadioGroup.displayName = 'RadioGroup';

export const RadioGroup = createPolymorphicComponent<'div', RadioGroupProps>(_RadioGroup);
