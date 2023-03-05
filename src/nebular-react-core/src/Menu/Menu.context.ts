import React, { useContext } from 'react';

export interface MenuContextType {
  isItemExpanded?(itemValue: string): boolean;
  handleExpandItemChange?(itemValue: string): void;
  isItemSelected?(itemValue: string): boolean;
  handleSelectItemChange?(itemValue: string): void;
}
export const MenuContext = React.createContext<MenuContextType>({});

export function useMenuContext() {
  return useContext(MenuContext) || {};
}
