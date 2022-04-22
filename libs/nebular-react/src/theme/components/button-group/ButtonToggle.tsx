import classNames from 'classnames';
import React, { useContext, useImperativeHandle, useLayoutEffect, useState } from 'react';
import { NbButton } from '../button';
import { NbButtonProps } from '../button/Button';
import { NbComponentOrCustomStatus } from '../component';
import { ButtonGroupContext } from './ButtonGroup';

export type NbButtonToggleProps = NbButtonProps & {
  id: string;
  value?: any;
  pressed?: boolean;
  notPressedStatus?: NbComponentOrCustomStatus;
  pressedChange?: (event: { id: string; pressed: boolean; value?: any }) => void;
};

export type NbButtonToggleRef = {
  updatePressed: (value: boolean) => void;
};

const NbButtonToggle = React.forwardRef<NbButtonToggleRef, NbButtonToggleProps & React.HTMLAttributes<HTMLDivElement>>(
  (
    {
      id,
      value,
      size,
      status,
      notPressedStatus,
      shape,
      appearance,
      pressed,
      pressedChange,
      className,
      children,
      ...otherProps
    },
    ref
  ) => {
    const [pressedValue, setPressedValue] = useState<boolean>(pressed ?? false);
    const [statusValue, setStatusValue] = useState<NbComponentOrCustomStatus>(
      pressed ? status || 'basic' : notPressedStatus || 'basic'
    );
    const { disabled, handlePressedChange } = useContext(ButtonGroupContext);

    const onClick = () => {
      if (!disabled) {
        setPressedValue(!pressedValue);
        handlePressedChange && handlePressedChange({ id, pressed: !pressedValue, value });
        pressedChange && pressedChange({ id, pressed: !pressedValue, value });
      }
    };

    useImperativeHandle(ref, () => ({
      updatePressed: (value: boolean) => {
        setPressedValue(value);
      }
    }));

    useLayoutEffect(() => {
      pressedValue ? setStatusValue(status || 'basic') : setStatusValue(notPressedStatus || 'basic');
    }, [pressedValue]);

    return (
      <div
        className={classNames('nb-button-toggle', className)}
        aria-pressed={pressedValue}
        onClick={onClick}
        {...otherProps}
      >
        <NbButton size={size} status={statusValue} shape={shape} appearance={appearance} disabled={disabled}>
          {children}
        </NbButton>
      </div>
    );
  }
);

export { NbButtonToggle };
