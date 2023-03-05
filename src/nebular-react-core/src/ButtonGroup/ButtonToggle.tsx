import React, { useState } from 'react';
import {
  clsx,
  ComponentOrCustomStatus,
  DefaultProps,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useIsomorphicEffect } from '@nebular-react/hooks';
import { BaseButtonProps, Button } from '../Button/Button';
import { useButtonGroupContext } from './ButtonGroup.context';

export interface ButtonToggleProps
  extends DefaultProps,
    Omit<BaseButtonProps, 'appearance' | 'status' | 'size' | 'shape'> {
  value?: string;
  pressed?: boolean;
}

const defaultProps: Partial<ButtonToggleProps> = {
  pressed: false
};

const ButtonToggle = React.forwardRef<HTMLButtonElement, ButtonToggleProps>((props, ref) => {
  const { value, pressed, disabled, children, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);

  const {
    groupDisabled,
    pressedStatus,
    notPressedStatus,
    appearance,
    size,
    shape,
    handleActiveItemChange
  } = useButtonGroupContext();
  const [statusValue, setStatusValue] = useState<ComponentOrCustomStatus>(
    pressed ? pressedStatus : notPressedStatus
  );

  useIsomorphicEffect(() => {
    setStatusValue(pressed ? pressedStatus : notPressedStatus);
  }, [pressed]);

  return (
    <Button
      aria-pressed={pressed}
      status={statusValue}
      size={size}
      shape={shape}
      appearance={appearance}
      disabled={disabled || groupDisabled}
      className={clsx(className, { pressed })}
      onClick={() => handleActiveItemChange(value)}
      ref={ref}
      {...others}
    >
      {children}
    </Button>
  );
});

export { ButtonToggle };
