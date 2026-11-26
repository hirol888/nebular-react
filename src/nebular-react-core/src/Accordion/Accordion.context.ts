import React, { useContext } from 'react';

export interface AccordionContextType {
  multiple: boolean;
  isItemActive(itemValue: string): boolean;
  handleActiveItemChange(itemValue: string): void;
}

const defaultContext: AccordionContextType = {
  multiple: false,
  isItemActive: () => false,
  handleActiveItemChange: () => undefined
};

export const AccordionContext = React.createContext<AccordionContextType>(defaultContext);

export function useAccordionContext() {
  return useContext(AccordionContext) || defaultContext;
}
