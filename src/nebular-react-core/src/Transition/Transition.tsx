import { TransitionType } from '@nebular-react/styles';
import React, { CSSProperties } from 'react';
import { getTransitionStyles } from './get-transition-styles/get-transition-styles';
import { useTransition } from './use-transition';

export interface TransitionProps {
  transition: TransitionType;
  duration?: number;
  exitDuration?: number;
  timingFunction?: string;
  mounted: boolean;
  children(styles: CSSProperties): React.ReactElement<any, any>;
  onExited?: () => void;
  onExit?: () => void;
  onEnter?: () => void;
  onEntered?: () => void;
}

export function Transition({
  transition,
  duration = 250,
  exitDuration = duration,
  mounted,
  children,
  timingFunction,
  onExit,
  onEnter,
  onExited,
  onEntered
}: TransitionProps) {
  const { transitionDuration, transitionStatus, transitionTimingFunction } = useTransition({
    mounted,
    exitDuration,
    duration,
    timingFunction,
    onExit,
    onEnter,
    onExited,
    onEntered
  });

  if (transitionDuration === 0) {
    return mounted ? <>{children({})}</> : null;
  }

  return transitionStatus === 'exited' ? null : (
    <>
      {children(
        getTransitionStyles({
          transition,
          duration: transitionDuration,
          state: transitionStatus,
          timingFunction: transitionTimingFunction
        })
      )}
    </>
  );
}
