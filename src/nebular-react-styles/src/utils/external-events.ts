import { useEffect, useLayoutEffect } from 'react';

function dispatchEvent(type: string, detail: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

const useIsomorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function createUseExternalEvents<Handlers extends Record<string, (detail: any) => void>>(
  prefix: string
) {
  function useExternalEvents(events: Handlers) {
    const handlers = Object.keys(events).reduce<Record<string, (event: Event) => void>>(
      (acc, eventKey) => {
        acc[`${prefix}:${eventKey}`] = (event) => events[eventKey]((event as CustomEvent).detail);
        return acc;
      },
      {}
    );

    useIsomorphicEffect(() => {
      if (typeof window === 'undefined') {
        return undefined;
      }

      Object.keys(handlers).forEach((eventKey) => {
        window.removeEventListener(eventKey, handlers[eventKey]);
        window.addEventListener(eventKey, handlers[eventKey]);
      });

      return () =>
        Object.keys(handlers).forEach((eventKey) => {
          window.removeEventListener(eventKey, handlers[eventKey]);
        });
    }, [handlers]);
  }

  function createEvent<EventKey extends keyof Handlers>(event: EventKey) {
    return (
      ...payload: Parameters<Handlers[EventKey]>[0] extends undefined
        ? [undefined?]
        : [Parameters<Handlers[EventKey]>[0]]
    ) => {
      dispatchEvent(`${prefix}:${String(event)}`, payload[0]);
    };
  }

  return [useExternalEvents, createEvent] as const;
}
