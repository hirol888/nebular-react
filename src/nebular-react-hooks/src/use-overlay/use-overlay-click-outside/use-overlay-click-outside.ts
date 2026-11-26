import React, { useEffect, useRef } from 'react';
import { getEventTarget } from '../../utils';

export function useOverlayClickOutside(
  nodes: React.RefObject<HTMLElement | null>[],
  handler: () => void
) {
  const pointerDownEventTarget = useRef<EventTarget | null>(null);
  const nodesRef = useRef(nodes);
  const handlerRef = useRef(handler);

  nodesRef.current = nodes;
  handlerRef.current = handler;

  useEffect(() => {
    const pointerDownListener = (event: PointerEvent) => {
      pointerDownEventTarget.current = getEventTarget(event);
    };

    /** Click event listener that will be attached to the body propagate phase. */
    const clickListener = (event: MouseEvent) => {
      const currentNodes = nodesRef.current;

      if (currentNodes.every((node) => !!node.current)) {
        const target = getEventTarget(event);
        // In case of a click event, we want to check the origin of the click
        // (e.g. in case where a user starts a click inside the overlay and
        // releases the click outside of it).
        // This is done by using the event target of the preceding pointerdown event.
        // Every click event caused by a pointer device has a preceding pointerdown
        // event, unless the click was programmatically triggered (e.g. in a unit test).
        const origin =
          event.type === 'click' && pointerDownEventTarget.current
            ? pointerDownEventTarget.current
            : target;
        // Reset the stored pointerdown event target, to avoid having it interfere
        // in subsequent events.
        pointerDownEventTarget.current = null;

        const shouldTrigger = currentNodes.every((node) => {
          const element = node.current;

          return (
            !element || (!element.contains(target as Node) && !element.contains(origin as Node))
          );
        });
        shouldTrigger && handlerRef.current();
      }
    };

    document.body.addEventListener('pointerdown', pointerDownListener, true);
    document.body.addEventListener('click', clickListener, true);
    document.body.addEventListener('auxclick', clickListener, true);
    document.body.addEventListener('contextmenu', clickListener, true);

    return () => {
      document.body.removeEventListener('pointerdown', pointerDownListener, true);
      document.body.removeEventListener('click', clickListener, true);
      document.body.removeEventListener('auxclick', clickListener, true);
      document.body.removeEventListener('contextmenu', clickListener, true);
    };
  }, []);
}
