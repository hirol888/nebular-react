import React from 'react';

export const ButtonGroupContext = React.createContext<{
  disabled: boolean;
  handlePressedChange?: (event: { id: string; pressed: boolean; value?: any }) => void;
}>({ disabled: false });
