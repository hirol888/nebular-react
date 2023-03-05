import React, { useContext } from 'react';

export interface AccordionContextType {
  multiple?: boolean;
  isItemActive?(itemValue: string): boolean;
  handleActiveItemChange?(itemValue: string): void;
}
export const AccordionContext = React.createContext<AccordionContextType>({
  multiple: false
});

export function useAccordionContext() {
  return useContext(AccordionContext) || { multiple: false };
}
