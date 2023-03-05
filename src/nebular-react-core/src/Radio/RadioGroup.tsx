import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useUncontrolled } from '@nebular-react/hooks';
import { createPolymorphicComponent } from '@mantine/utils';
import { RadioGroupContext } from './RadioGroup.context';
import useStyles from './Radio.style';

export interface RadioGroupProps
  extends DefaultProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value?: string;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  disabled?: boolean;
  status?: ComponentOrCustomStatus;
}

const defaultProps: Partial<RadioGroupProps> = {
  disabled: false,
  status: 'basic'
};

const _RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>((props: RadioGroupProps, ref) => {
  const {
    value,
    children,
    onChange,
    disabled,
    status,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ status }, { name: 'radio', classNames, styles, unstyled });

  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue: '',
    finalValue: '',
    onChange
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  };

  return (
    <RadioGroupContext.Provider
      value={{ selectedValue: _value, groupDisabled: disabled, status, onChange: handleChange }}
    >
      <div className={cx(classes.group, className)} ref={ref} {...others}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

_RadioGroup.displayName = '@nebular-react/core/RadioGroup';

export const RadioGroup = createPolymorphicComponent<'div', RadioGroupProps>(_RadioGroup);
