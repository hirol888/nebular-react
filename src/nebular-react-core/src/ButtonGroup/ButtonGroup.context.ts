import React, { useContext } from 'react';
import {
  ButtonToggleAppearance,
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize
} from '@nebular-react/styles';

interface ButtonGroupContextType {
  multiple?: boolean;
  groupDisabled?: boolean;
  pressedStatus?: ComponentOrCustomStatus;
  notPressedStatus?: ComponentOrCustomStatus;
  appearance?: ButtonToggleAppearance;
  size?: ComponentSize;
  shape?: ComponentShape;
  isItemActive?(itemValue: string): boolean;
  handleActiveItemChange?(itemValue: string): void;
}

export const ButtonGroupContext = React.createContext<ButtonGroupContextType>({
  multiple: false,
  groupDisabled: false,
  pressedStatus: 'primary',
  notPressedStatus: 'basic',
  appearance: 'filled',
  size: 'medium',
  shape: 'rectangle'
});

export function useButtonGroupContext(): ButtonGroupContextType {
  return (
    useContext(ButtonGroupContext) || {
      multiple: false,
      groupDisabled: false,
      pressedStatus: 'primary',
      notPressedStatus: 'basic',
      appearance: 'filled',
      size: 'medium',
      shape: 'rectangle'
    }
  );
}
