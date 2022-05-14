import React from 'react';
import { NbComponentOrCustomStatus, NbComponentSize } from '../component';

export type NbFormAddonType = 'prefix' | 'suffix';

export const FormFieldContext = React.createContext<{
  formFieldSize?: NbComponentSize;
  formFieldStatus?: NbComponentOrCustomStatus;
  formFieldDisabled?: boolean;
  formFieldFocused?: boolean;
}>({});
