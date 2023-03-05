import { useUncontrolled } from '@mantine/hooks';
import {
  ButtonToggleAppearance,
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import React from 'react';
import { ItemValue, useGroupItems } from '../Shared';
import { ButtonGroupContext } from './ButtonGroup.context';
import useStyles from './ButtonGroup.style';
import { ButtonToggle } from './ButtonToggle';

export type ButtonGroupStylesNames = Selectors<typeof useStyles>;

export interface ButtonGroupProps<Multiple extends boolean = false>
  extends DefaultProps<ButtonGroupStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  size?: ComponentSize;
  pressedStatus?: ComponentOrCustomStatus;
  notPressedStatus?: ComponentOrCustomStatus;
  shape?: ComponentShape;
  appearance?: ButtonToggleAppearance;
  disabled?: boolean;
  multiple?: boolean;
  pressed?: ItemValue<Multiple>;
  children?: React.ReactNode;
  onChange?(pressedItems: ItemValue<Multiple>): void;
}

const defaultProps: Partial<ButtonGroupProps> = {
  size: 'medium',
  pressedStatus: 'basic',
  notPressedStatus: 'basic',
  shape: 'rectangle',
  appearance: 'filled',
  disabled: false,
  multiple: false
};

function ButtonGroup<Multiple extends boolean = false>(props: ButtonGroupProps<Multiple>) {
  const {
    size,
    pressedStatus,
    notPressedStatus,
    shape,
    appearance,
    disabled,
    multiple,
    pressed,
    onChange,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps<ButtonGroupProps<Multiple>>(
    defaultProps as ButtonGroupProps<Multiple>,
    props
  );
  const { classes, cx } = useStyles(
    { appearance, pressedStatus, notPressedStatus },
    { name: 'button-group', classNames, styles, unstyled }
  );

  const [_pressed, setPressed] = useUncontrolled<ItemValue<Multiple>>({
    value: pressed,
    defaultValue: multiple ? ([] as any) : null,
    finalValue: multiple ? ([] as any) : null,
    onChange
  });

  const { isItemActive, handleActiveItemChange } = useGroupItems(multiple, setPressed, _pressed);

  return (
    <ButtonGroupContext.Provider
      value={{
        multiple,
        groupDisabled: disabled,
        pressedStatus,
        notPressedStatus,
        appearance,
        size,
        shape,
        isItemActive,
        handleActiveItemChange
      }}
    >
      <div className={cx(classes.root, className)} role="group" {...others}>
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
}

ButtonGroup.displayName = '@nebular-react/core/ButtonGroup';
ButtonGroup.Toogle = ButtonToggle;

export { ButtonGroup };
