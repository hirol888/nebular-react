import React, { createContext } from 'react';
import { ComponentOrCustomStatus } from '@nebular-react/styles';

interface RadioGroupContextType {
  selectedValue?: string;
  groupDisabled?: boolean;
  status?: ComponentOrCustomStatus;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextType>({});
