import React from 'react';
import { clsx, DefaultProps, useComponentDefaultProps } from '@nebular-react/styles';
import { BaseButtonProps, Button } from '../Button/Button';
import { useButtonGroupContext } from './ButtonGroup.context';

export interface ButtonToggleProps
  extends DefaultProps, Omit<BaseButtonProps, 'appearance' | 'status' | 'size' | 'shape'> {
  value?: string;
  pressed?: boolean;
}

const defaultProps: Partial<ButtonToggleProps> = {};

const ButtonToggle = React.forwardRef<HTMLButtonElement, ButtonToggleProps>((props, ref) => {
  const { value, pressed, disabled, children, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);

  const {
    groupDisabled,
    pressedStatus = 'primary',
    notPressedStatus = 'basic',
    appearance = 'filled',
    size = 'medium',
    shape = 'rectangle',
    isItemActive = () => false,
    handleActiveItemChange = () => undefined
  } = useButtonGroupContext();
  const isPressed = pressed ?? (value !== undefined && isItemActive(value));
  const statusValue = isPressed ? pressedStatus : notPressedStatus;

  return (
    <Button
      aria-pressed={isPressed}
      status={statusValue}
      size={size}
      shape={shape}
      appearance={appearance}
      disabled={disabled || groupDisabled}
      className={clsx(className, { pressed: isPressed })}
      onClick={() => handleActiveItemChange(value)}
      ref={ref}
      {...others}
    >
      {children}
    </Button>
  );
});

export { ButtonToggle };
