import React, { useContext } from 'react';

export interface MenuContextType {
  isItemExpanded(itemValue: string): boolean;
  handleExpandItemChange(itemValue: string): void;
  isItemSelected(itemValue: string): boolean;
  handleSelectItemChange(itemValue: string): void;
}

const defaultContext: MenuContextType = {
  isItemExpanded: () => false,
  handleExpandItemChange: () => undefined,
  isItemSelected: () => false,
  handleSelectItemChange: () => undefined
};

export const MenuContext = React.createContext<MenuContextType>(defaultContext);

export function useMenuContext() {
  return useContext(MenuContext) || defaultContext;
}
