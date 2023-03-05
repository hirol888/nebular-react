import { useState } from 'react';
import { GlobalLogicalPosition } from '../use-overlay/use-global-position-strategy/types';

export function useLogicalPositionQueue<T>({
  initialValues = {
    'top-start': [],
    'top-end': [],
    'bottom-end': [],
    'bottom-start': []
  },
  limit
}: {
  initialValues?: Record<GlobalLogicalPosition, T[]>;
  limit: number;
}) {
  const getValues = (values: Record<GlobalLogicalPosition, T[]>, forQueue: boolean = false) => {
    const newStatesValues: Record<GlobalLogicalPosition, T[]> = {
      'top-start': [],
      'top-end': [],
      'bottom-end': [],
      'bottom-start': []
    };

    Object.entries(GlobalLogicalPosition).forEach(([, logicalPosition]) => {
      newStatesValues[logicalPosition] = forQueue
        ? [...values[logicalPosition].slice(limit)]
        : [...values[logicalPosition].slice(0, limit)];
    });

    return newStatesValues;
  };

  const [{ states, queues }, setState] = useState({
    states: getValues(initialValues),
    queues: getValues(initialValues, true)
  });

  const add = (items: T[], logicalPosition: GlobalLogicalPosition) => {
    setState((current) => {
      const results = { ...current };
      const values = [
        ...results.states[logicalPosition],
        ...results.queues[logicalPosition],
        ...items
      ];

      results.states[logicalPosition] = values.slice(0, limit);
      results.queues[logicalPosition] = values.slice(limit);

      return results;
    });
  };

  const update = (fn: (state: T[]) => T[], logicalPosition: GlobalLogicalPosition) => {
    setState((current) => {
      const results = { ...current };
      const values = fn([...current.states[logicalPosition], ...current.queues[logicalPosition]]);

      results.states[logicalPosition] = values.slice(0, limit);
      results.queues[logicalPosition] = values.slice(limit);

      return results;
    });
  };

  const cleanQueue = (logicalPosition: GlobalLogicalPosition) =>
    setState((current) => {
      const results = { ...current };
      results.queues[logicalPosition] = [];

      return results;
    });

  return { states, queues, add, update, cleanQueue };
}
