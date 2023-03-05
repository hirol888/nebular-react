import React, { useContext } from 'react';

export const AccordionItemContext = React.createContext<{ disabled: boolean; value: string }>({
  disabled: false,
  value: ''
});

export function useAccordionItemContext() {
  return useContext(AccordionItemContext) || { disabled: false, value: '' };
}
