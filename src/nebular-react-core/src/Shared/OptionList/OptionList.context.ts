import React, { useContext } from 'react';
import { ComponentSize } from '@nebular-react/styles';
import { KeyManagerType } from '@nebular-react/hooks';

interface OptionListContextType {
  multiple: boolean;
  size: ComponentSize;
  keyManagerType: KeyManagerType;
  onOptionSelected?: (option: { label?: string; value?: string; selected?: boolean }) => void;
}

export const OptionListContext = React.createContext<OptionListContextType>(null);

export function useOptionListContext(): OptionListContextType {
  return (
    useContext(OptionListContext) || { multiple: false, size: 'medium', keyManagerType: 'focus' }
  );
}
