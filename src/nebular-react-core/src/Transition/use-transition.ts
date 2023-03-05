import { useReducedMotion } from '@nebular-react/hooks';
import { useEffect, useRef, useState } from 'react';

export type TransitionStatus =
  | 'entered'
  | 'exited'
  | 'entering'
  | 'exiting'
  | 'pre-exiting'
  | 'pre-entering';

interface UseTransition {
  duration: number;
  exitDuration: number;
  timingFunction: string;
  mounted: boolean;
  onEnter?(): void;
  onExit?(): void;
  onEntered?(): void;
  onExited?(): void;
}

export function useTransition({
  duration,
  exitDuration,
  timingFunction,
  mounted,
  onEnter,
  onExit,
  onEntered,
  onExited
}: UseTransition) {
  const reduceMotion = useReducedMotion();
  const [transitionStatus, setTransitionStatus] = useState<TransitionStatus>(
    mounted ? 'entered' : 'exited'
  );
  let transitionDuration = reduceMotion ? 0 : duration;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleStateChange = (shouldMount: boolean) => {
    const preHandler = shouldMount ? onEnter : onExit;
    const handler = shouldMount ? onEntered : onExited;

    setTransitionStatus(shouldMount ? 'pre-entering' : 'pre-exiting');
    clearTimeout(timeoutRef.current);
    transitionDuration = reduceMotion ? 0 : shouldMount ? duration : exitDuration;

    if (transitionDuration === 0) {
      typeof preHandler === 'function' && preHandler();
      typeof handler === 'function' && handler();
      setTransitionStatus(shouldMount ? 'entered' : 'exited');
    } else {
      const preStateTimeout = setTimeout(() => {
        typeof preHandler === 'function' && preHandler();
        setTransitionStatus(shouldMount ? 'entering' : 'exiting');
      }, 10);

      timeoutRef.current = setTimeout(() => {
        clearTimeout(preStateTimeout);
        typeof handler === 'function' && handler();
        setTransitionStatus(shouldMount ? 'entered' : 'exited');
      }, transitionDuration);
    }
  };

  useEffect(() => {
    handleStateChange(mounted);
  }, [mounted]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return {
    transitionDuration,
    transitionStatus,
    transitionTimingFunction: timingFunction || 'ease'
  };
}
