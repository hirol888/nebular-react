import React, { forwardRef, useEffect, useRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef, useUncontrolled } from '@nebular-react/hooks';
import useStyles, { CheckboxStylesParams } from './Checkbox.style';
import { Icon } from '../Icon';

export type CheckboxStylesNames = Selectors<typeof useStyles>;

export interface CheckboxProps
  extends DefaultProps<CheckboxStylesNames, CheckboxStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'input'>, 'type' | 'size'> {
  checked?: boolean;
  disabled?: boolean;
  status?: ComponentOrCustomStatus;
  indeterminate?: boolean;
  children?: React.ReactNode;
  onCheck?: (value: boolean) => void;
}

const defaultProps: Partial<CheckboxProps> = {
  disabled: false,
  status: 'basic',
  indeterminate: false
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    className,
    checked,
    disabled,
    status,
    indeterminate,
    onCheck,
    children,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);

  const [_checked, setChecked] = useUncontrolled({
    value: checked,
    defaultValue: false,
    finalValue: false,
    onChange: onCheck
  });

  const { classes, cx } = useStyles(
    { status, checked: _checked, indeterminate },
    { name: 'checkbox', unstyled, classNames, styles }
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={cx(classes.root, className, status)}>
      <label className={cx(classes.label)}>
        <input
          type="checkbox"
          className={cx(classes.nativeInput)}
          ref={useMergedRef(ref, inputRef)}
          disabled={disabled}
          checked={_checked}
          onChange={(event) => handleChange(event)}
          onClick={(event) => event.stopPropagation()}
          {...others}
        />
        <span className={cx(classes.custom)}>
          {indeterminate && (
            <Icon
              icon="minus-bold-outline"
              pack="nebular-essentials"
              className={cx(classes.icon)}
            />
          )}
          {_checked && !indeterminate && (
            <Icon
              icon="checkmark-bold-outline"
              pack="nebular-essentials"
              className={cx(classes.icon)}
            />
          )}
        </span>
        <span className={cx(classes.text)}>{children}</span>
      </label>
    </div>
  );
});

Checkbox.displayName = '@nebular-react/core/Checkbox';

export { Checkbox };
