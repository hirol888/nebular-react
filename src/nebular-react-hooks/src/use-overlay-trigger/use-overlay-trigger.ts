import debounce from 'lodash/debounce.js';
import React, { useEffect, useMemo, useRef } from 'react';

export type TriggerType = 'click' | 'hover' | 'hint' | 'focus' | 'noop';

const isOnTrigger = (element: Element, trigger: React.RefObject<HTMLElement | null>): boolean =>
  !!element && !!trigger.current?.contains(element);

const isOnPane = (element: Element, pane: React.RefObject<HTMLElement | null>): boolean =>
  !!element && !!pane.current?.contains(element);

function useDebouncedHandler(handler: () => void, delay: number) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const debouncedHandler = useMemo(
    () => debounce(() => handlerRef.current(), delay, { leading: false, trailing: true }),
    [delay]
  );

  useEffect(() => () => debouncedHandler.cancel(), [debouncedHandler]);

  return debouncedHandler;
}

export function useOverlayTrigger(
  trigger: React.RefObject<HTMLElement | null>,
  pane: React.RefObject<HTMLElement | null>,
  boundingBoxRef: React.RefObject<HTMLElement | null>,
  triggerType: TriggerType,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number = 100,
  delayLeave: number = 30
) {
  useOverlayClickTrigger(
    trigger,
    boundingBoxRef,
    showHandler,
    hideHandler,
    delayEnter,
    delayLeave,
    triggerType === 'click'
  );
  useOverlayFocusTrigger(
    trigger,
    pane,
    boundingBoxRef,
    showHandler,
    hideHandler,
    delayEnter,
    delayLeave,
    triggerType === 'focus'
  );
  useOverlayHoverTrigger(
    trigger,
    pane,
    showHandler,
    hideHandler,
    delayEnter,
    delayLeave,
    triggerType === 'hover'
  );
  useOverlayHintTrigger(
    trigger,
    showHandler,
    hideHandler,
    delayEnter,
    delayLeave,
    triggerType === 'hint'
  );
}

function useOverlayClickTrigger(
  trigger: React.RefObject<HTMLElement | null>,
  boundingBoxRef: React.RefObject<HTMLElement | null>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number,
  enabled: boolean
) {
  const debouncedShowHandler = useDebouncedHandler(showHandler, delayEnter);
  const debouncedHideHandler = useDebouncedHandler(hideHandler, delayLeave);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const element = trigger.current;

    const clickListener = (event: MouseEvent) => {
      const visible = boundingBoxRef.current && boundingBoxRef.current?.style?.display !== 'none';
      const shouldShow = !visible && isOnTrigger(event.target as Element, trigger);

      if (shouldShow) {
        debouncedHideHandler.cancel();
        debouncedShowHandler();
      } else {
        debouncedShowHandler.cancel();
        debouncedHideHandler();
      }
    };

    element?.addEventListener('click', clickListener);

    return () => {
      element?.removeEventListener('click', clickListener);
      debouncedShowHandler.cancel();
      debouncedHideHandler.cancel();
    };
  }, [enabled, trigger, boundingBoxRef, debouncedShowHandler, debouncedHideHandler]);
}

function useOverlayFocusTrigger(
  trigger: React.RefObject<HTMLElement | null>,
  pane: React.RefObject<HTMLElement | null>,
  boundingBoxRef: React.RefObject<HTMLElement | null>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number,
  enabled: boolean
) {
  const debouncedShowHandler = useDebouncedHandler(showHandler, delayEnter);
  const debouncedHideHandler = useDebouncedHandler(hideHandler, delayLeave);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const element = trigger.current;

    const triggerClickInListener = () => {
      const visible = boundingBoxRef.current && boundingBoxRef.current?.style?.display !== 'none';
      if (!visible) {
        debouncedHideHandler.cancel();
        debouncedShowHandler();
      }
    };

    const focusInListener = () => {
      const visible = boundingBoxRef.current && boundingBoxRef.current?.style?.display !== 'none';
      if (!visible) {
        debouncedHideHandler.cancel();
        debouncedShowHandler();
      }
    };

    const focusoutListener = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget as Element | null;

      if (nextTarget && (isOnTrigger(nextTarget, trigger) || isOnPane(nextTarget, pane))) {
        return;
      }

      debouncedShowHandler.cancel();
      debouncedHideHandler();
    };

    element?.addEventListener('click', triggerClickInListener);
    element?.addEventListener('focusin', focusInListener);
    element?.addEventListener('focusout', focusoutListener);

    return () => {
      element?.removeEventListener('click', triggerClickInListener);
      element?.removeEventListener('focusin', focusInListener);
      element?.removeEventListener('focusout', focusoutListener);
      debouncedShowHandler.cancel();
      debouncedHideHandler.cancel();
    };
  }, [enabled, trigger, pane, boundingBoxRef, debouncedShowHandler, debouncedHideHandler]);
}

function useOverlayHoverTrigger(
  trigger: React.RefObject<HTMLElement | null>,
  pane: React.RefObject<HTMLElement | null>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number,
  enabled: boolean
) {
  const debouncedShowHandler = useDebouncedHandler(showHandler, delayEnter);
  const debouncedHideHandler = useDebouncedHandler(hideHandler, delayLeave);
  const isOverPane = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const element = trigger.current;

    const paneChildMouseEnterListener = () => {
      isOverPane.current = true;
      debouncedHideHandler.cancel();
    };

    const paneChildMouseLeaveListener = () => {
      isOverPane.current = false;
      debouncedHideHandler();
    };

    const detachPaneListeners = () => {
      const paneElement = pane.current;
      paneElement?.removeEventListener('mouseenter', paneChildMouseEnterListener);
      paneElement?.removeEventListener('mouseleave', paneChildMouseLeaveListener);
    };

    const attachPaneListeners = () => {
      const paneElement = pane.current;

      if (!paneElement) {
        return;
      }

      detachPaneListeners();
      paneElement.addEventListener('mouseenter', paneChildMouseEnterListener);
      paneElement.addEventListener('mouseleave', paneChildMouseLeaveListener);
    };

    const mouseEnterListener = () => {
      debouncedHideHandler.cancel();
      debouncedShowHandler();
    };

    const mouseLeaveListener = () => {
      debouncedShowHandler.cancel();
      attachPaneListeners();
      if (!isOverPane.current) {
        debouncedHideHandler();
      }
    };

    element?.addEventListener('mouseenter', mouseEnterListener);
    element?.addEventListener('mouseleave', mouseLeaveListener);

    return () => {
      element?.removeEventListener('mouseenter', mouseEnterListener);
      element?.removeEventListener('mouseleave', mouseLeaveListener);
      detachPaneListeners();
      debouncedShowHandler.cancel();
      debouncedHideHandler.cancel();
    };
  }, [enabled, trigger, pane, debouncedShowHandler, debouncedHideHandler]);
}

/**
 * The difference between hover and hint is:
 * Hint hides immediately when a mouse leave event occurs.
 * Hover hides when a mouse leave event occurs and stops outside the host and container.
 */
function useOverlayHintTrigger(
  trigger: React.RefObject<HTMLElement | null>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number,
  enabled: boolean
) {
  const debouncedShowHandler = useDebouncedHandler(showHandler, delayEnter);
  const debouncedHideHandler = useDebouncedHandler(hideHandler, delayLeave);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const element = trigger.current;

    const mouseEnterListener = () => {
      debouncedHideHandler.cancel();
      debouncedShowHandler();
    };

    const mouseLeaveListener = () => {
      debouncedShowHandler.cancel();
      debouncedHideHandler();
    };

    element?.addEventListener('mouseenter', mouseEnterListener);
    element?.addEventListener('mouseleave', mouseLeaveListener);

    return () => {
      element?.removeEventListener('mouseenter', mouseEnterListener);
      element?.removeEventListener('mouseleave', mouseLeaveListener);
      debouncedShowHandler.cancel();
      debouncedHideHandler.cancel();
    };
  }, [enabled, trigger, debouncedShowHandler, debouncedHideHandler]);
}
