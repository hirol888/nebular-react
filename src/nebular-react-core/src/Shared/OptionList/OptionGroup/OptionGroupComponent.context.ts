import React, { useContext } from 'react';

interface OptionGroupComponentContextType {
  disabled: boolean;
}

export const OptionGroupComponentContext = React.createContext<OptionGroupComponentContextType>({
  disabled: false
});

export function useOptionGroupComponentContext(): OptionGroupComponentContextType {
  return useContext(OptionGroupComponentContext) || { disabled: false };
}
