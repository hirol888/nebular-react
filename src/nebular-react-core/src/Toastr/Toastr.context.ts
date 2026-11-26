import { createContext } from 'react';
import { ToastrContextProps } from './types';

export const ToastrContext = createContext<ToastrContextProps>({
  limit: 6,
  transition: 'fade',
  transitionDuration: 150,
  transitionTimingFunction: 'ease'
});
