import React from 'react';
import { NbComponentOrCustomStatus } from '../component';

export type NbRadioProps = {
  checked?: boolean;
  disabled?: boolean;
  value?: any;
  id: string;
};

export type NbRadioGroupProps = {
  name?: string;
  disabled?: boolean;
  status?: NbComponentOrCustomStatus;
  onSelectChange?: (value: any) => void;
};

export type NbRadioRef = {
  setChecked: (checked: boolean) => void;
};

export type NbRadioGroupRef = {
  disable(): void;
  enable(): void;
};

export const RadioContext = React.createContext<{
  name?: string;
  groupDisabled?: boolean;
  status?: NbComponentOrCustomStatus;
  selectedRadio?: { id: string; value: any };
  onRadioChange?: (id: string, value: any) => void;
}>({});
