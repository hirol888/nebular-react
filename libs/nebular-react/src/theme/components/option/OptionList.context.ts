import React from 'react';

export const OptionListContext = React.createContext<{
  multiple: boolean;
  handleOptionChange?: (selected: boolean, optionId: string, value: any) => void;
}>({
  multiple: false,
  handleOptionChange: undefined
});
