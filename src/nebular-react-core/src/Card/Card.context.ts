import React, { useContext } from 'react';
import { ComponentOrCustomStatus, ComponentStatus } from '@nebular-react/styles';

interface CardContextType {
  status?: ComponentOrCustomStatus;
  accent?: ComponentStatus;
}

export const CardContext = React.createContext<CardContextType>(null);

export function useCardContext(): CardContextType {
  return useContext(CardContext) || {};
}
