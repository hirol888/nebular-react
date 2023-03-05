import React, { useContext } from 'react';

interface OptionGroupComponentContextType {
  disabled: boolean;
}

export const OptionGroupComponentContext =
  React.createContext<OptionGroupComponentContextType>(null);

export function useOptionGroupComponentContext(): OptionGroupComponentContextType {
  return useContext(OptionGroupComponentContext) || { disabled: false };
}
