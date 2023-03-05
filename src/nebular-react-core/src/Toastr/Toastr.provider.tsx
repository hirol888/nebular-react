import React from 'react';
import { GlobalLogicalPosition, useReducedMotion } from '@nebular-react/hooks';
import { DefaultProps, TransitionType } from '@nebular-react/styles';
import { ToastrContext } from './Toastr.context';
import { ToastrOverlay } from './ToastrOverlay';

export interface ToastrProviderProps extends DefaultProps {
  transition?: TransitionType;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  limit?: number;
  children?: React.ReactNode;
}

export function ToastrProvider({
  transition,
  transitionDuration,
  transitionTimingFunction,
  limit = 6,
  children,
  ...others
}: ToastrProviderProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 1 : transitionDuration;

  return (
    <ToastrContext.Provider
      value={{
        limit,
        transition,
        transitionDuration: duration,
        transitionTimingFunction
      }}
    >
      <div {...others}>
        {Object.entries(GlobalLogicalPosition).map((p) => (
          <ToastrOverlay key={p[1]} logicalPosition={p[1]} />
        ))}
        {children}
      </div>
    </ToastrContext.Provider>
  );
}
