import { createContext } from 'react';
import { ToastrContextProps } from './types';

export const ToastrContext = createContext<ToastrContextProps>(null);
