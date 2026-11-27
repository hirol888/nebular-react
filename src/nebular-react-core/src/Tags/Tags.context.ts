import React, { useContext } from 'react';
import { ComponentSize } from '@nebular-react/styles';

export interface TagsContextType {
  size: ComponentSize;
  disabled: boolean;
  isItemSelected(itemValue: string): boolean;
  handleSelectedItemChange(itemValue: string): void;
  handleTagSelected(tag: string): void;
  handleTagRemove(tag: string): void;
}

const defaultContext: TagsContextType = {
  size: 'medium',
  disabled: false,
  isItemSelected: () => false,
  handleSelectedItemChange: () => undefined,
  handleTagSelected: () => undefined,
  handleTagRemove: () => undefined
};

export const TagsContext = React.createContext<TagsContextType>(defaultContext);

export function useTagsContext() {
  return useContext(TagsContext) || defaultContext;
}
