import React from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  useComponentDefaultProps,
  Selectors
} from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { useUncontrolled } from '@mantine/hooks';
import { Icon } from '../Icon';
import useStyles, { ToggleStylesParams } from './Toggle.styles';

export type ToggleStylesNames = Selectors<typeof useStyles>;

export interface ToggleProps
  extends DefaultProps<ToggleStylesNames, ToggleStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  checked?: boolean;
  disabled?: boolean;
  status?: ComponentOrCustomStatus;
  labelPosition?: 'left' | 'right' | 'start' | 'end';
  onCheckedChange?: (checked: boolean) => void;
  children?: React.ReactNode;
}

const defaultProps: Partial<ToggleProps> = {
  disabled: false,
  status: 'basic',
  labelPosition: 'end'
};

const _Toggle = React.forwardRef<HTMLDivElement, ToggleProps>((props, ref) => {
  const {
    checked,
    disabled,
    status,
    labelPosition,
    className,
    classNames,
    styles,
    unstyled,
    onCheckedChange,
    children,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ status }, { name: 'toggle', classNames, styles, unstyled });

  const [_checked, setChecked] = useUncontrolled({
    value: checked,
    defaultValue: false,
    finalValue: false,
    onChange: onCheckedChange
  });

  return (
    <div
      className={cx(classes.root, status, {
        [classes.toggleLabelLeft]: labelPosition === 'left',
        [classes.toggleLabelRight]: labelPosition === 'right',
        [classes.toggleLabelStart]: labelPosition === 'start',
        [classes.toggleLabelEnd]: labelPosition === 'end'
      })}
      ref={ref}
      {...others}
    >
      <label className={cx(classes.toggleLabel)}>
        <input
          type="checkbox"
          className={cx(classes.nativeInput, 'visually-hidden')}
          role="switch"
          aria-checked={_checked}
          disabled={disabled}
          checked={_checked}
          onClick={(event) => event.stopPropagation}
          onChange={() => setChecked(!_checked)}
        />
        <div
          className={cx(classes.toggle, {
            [classes.checked]: _checked
          })}
        >
          <span className={cx(classes.toggleSwitcher)}>
            {_checked && <Icon icon="checkmark-bold-outline" pack="nebular-essentials" />}
          </span>
        </div>
        <span className={cx(classes.text)}>{children}</span>
      </label>
    </div>
  );
});

_Toggle.displayName = '@nebular-react/core/Toggle';

export const Toggle = createPolymorphicComponent<'div', ToggleProps>(_Toggle);
