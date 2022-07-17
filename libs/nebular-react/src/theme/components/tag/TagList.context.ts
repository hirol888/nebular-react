import React from 'react';

export const TagListContext = React.createContext<{
  multiple: boolean;
  handleTagSelect?: (selected: boolean, tagId: string) => void;
  handleTagRemove?: (tagId: string) => void;
}>({
  multiple: false,
  handleTagSelect: undefined,
  handleTagRemove: undefined
});
