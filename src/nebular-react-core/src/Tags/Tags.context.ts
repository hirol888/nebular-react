import React, { useContext } from 'react';
import { ComponentSize } from '@nebular-react/styles';

export interface TagsContextType {
  size?: ComponentSize;
  isItemSelected?(itemValue: string): boolean;
  handleSelectedItemChange?(itemValue: string): void;
  handleTagSelected?: (tag: string) => void;
  handleTagRemove?: (tag: string) => void;
}

export const TagsContext = React.createContext<TagsContextType>({});

export function useTagsContext() {
  return useContext(TagsContext) || {};
}
