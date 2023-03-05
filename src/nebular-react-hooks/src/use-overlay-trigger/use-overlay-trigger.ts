import { debounce } from 'lodash';
import React, { useEffect, useRef } from 'react';

export type TriggerType = 'click' | 'hover' | 'hint' | 'focus' | 'noop';

const isOnTrigger = (element: Element, trigger: React.MutableRefObject<HTMLElement>): boolean =>
  trigger.current?.contains(element);

const isOnPane = (element: Element, pane: React.MutableRefObject<HTMLElement>): boolean =>
  pane.current?.contains(element);

const isNotOnTriggerOrPane = (
  element: Element,
  trigger: React.MutableRefObject<HTMLElement>,
  pane: React.MutableRefObject<HTMLElement>
): boolean => !isOnTrigger(element, trigger) && !isOnPane(element, pane);

export function useOverlayTrigger(
  trigger: React.MutableRefObject<HTMLElement>,
  pane: React.MutableRefObject<HTMLElement>,
  boundingBoxRef: React.MutableRefObject<HTMLElement>,
  triggerType: TriggerType,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number = 100,
  delayLeave: number = 30
) {
  switch (triggerType) {
    case 'click':
      useOverlayClickTrigger(
        trigger,
        pane,
        boundingBoxRef,
        showHandler,
        hideHandler,
        delayEnter,
        delayLeave
      );
      break;
    case 'focus':
      useOverlayFocusTrigger(
        trigger,
        pane,
        boundingBoxRef,
        showHandler,
        hideHandler,
        delayEnter,
        delayLeave
      );
      break;
    case 'hover':
      useOverlayHoverTrigger(trigger, pane, showHandler, hideHandler, delayEnter, delayLeave);
      break;
    case 'hint':
      useOverlayHintTrigger(trigger, showHandler, hideHandler, delayEnter, delayLeave);
      break;
  }
}

function useOverlayClickTrigger(
  trigger: React.MutableRefObject<HTMLElement>,
  pane: React.MutableRefObject<HTMLElement>,
  boundingBoxRef: React.MutableRefObject<HTMLElement>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number
) {
  const debouncedShowHandler = debounce(showHandler, delayEnter, {
    leading: false,
    trailing: true
  });
  const debouncedHideHandler = debounce(hideHandler, delayLeave, {
    leading: false,
    trailing: true
  });

  useEffect(() => {
    trigger.current?.addEventListener('click', clickListener);

    return () => {
      trigger.current?.removeEventListener('click', clickListener);
    };
  }, []);

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
}

function useOverlayFocusTrigger(
  trigger: React.MutableRefObject<HTMLElement>,
  pane: React.MutableRefObject<HTMLElement>,
  boundingBoxRef: React.MutableRefObject<HTMLElement>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number
) {
  const debouncedShowHandler = debounce(showHandler, delayEnter, {
    leading: false,
    trailing: true
  });
  const debouncedHideHandler = debounce(hideHandler, delayLeave, {
    leading: false,
    trailing: true
  });

  const focusInTarget = useRef<Element>(null);

  useEffect(() => {
    // no need clickOut event listener here
    // useOverlayClickOutside is already handle this
    trigger.current?.addEventListener('click', triggerClickInListener);
    trigger.current?.addEventListener('focusin', focusInListener);
    trigger.current?.addEventListener('focusout', focusoutListener);

    return () => {
      trigger.current?.removeEventListener('click', triggerClickInListener);
      trigger.current?.removeEventListener('focusin', focusInListener);
      trigger.current?.removeEventListener('focusout', focusoutListener);
    };
  }, []);

  const triggerClickInListener = () => {
    const visible = boundingBoxRef.current && boundingBoxRef.current?.style?.display !== 'none';
    if (!visible) {
      debouncedHideHandler.cancel();
      debouncedShowHandler();
    }
  };

  const focusInListener = (event: FocusEvent) => {
    const visible = boundingBoxRef.current && boundingBoxRef.current?.style?.display !== 'none';
    if (!visible) {
      debouncedHideHandler.cancel();
      debouncedShowHandler();
      focusInTarget.current = event.target as Element;
    }
  };

  const focusoutListener = () => {
    if (isNotOnTriggerOrPane(focusInTarget.current, trigger, pane)) {
      debouncedShowHandler.cancel();
      debouncedShowHandler();
    }
  };
}

function useOverlayHoverTrigger(
  trigger: React.MutableRefObject<HTMLElement>,
  pane: React.MutableRefObject<HTMLElement>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number
) {
  const debouncedShowHandler = debounce(showHandler, delayEnter, {
    leading: false,
    trailing: true
  });
  const debouncedHideHandler = debounce(
    () => {
      hideHandler();
      pane.current?.removeEventListener('mouseenter', paneChildMouseEnterListener);
      pane.current?.removeEventListener('mouseleave', debouncedHideHandler);
    },
    delayLeave,
    { leading: false, trailing: true }
  );

  useEffect(() => {
    trigger.current?.addEventListener('mouseenter', mouseEnterListener);
    trigger.current?.addEventListener('mouseleave', mouseLeaveListener);

    return () => {
      trigger.current?.removeEventListener('mouseenter', mouseEnterListener);
      trigger.current?.removeEventListener('mouseleave', mouseLeaveListener);
    };
  }, []);

  const mouseEnterListener = () => {
    debouncedHideHandler.cancel();
    debouncedShowHandler();
  };

  const mouseLeaveListener = () => {
    debouncedShowHandler.cancel();
    debouncedHideHandler();
    pane.current?.addEventListener('mouseenter', paneChildMouseEnterListener);
    pane.current?.addEventListener('mouseleave', debouncedHideHandler);
  };

  const paneChildMouseEnterListener = () => {
    debouncedHideHandler.cancel();
  };
}

/**
 * The difference between hover and hint is
 * Hint hides immediately when a mouse leave event occurs
 * Hover hides whe a mouse leave event occurs and stops out of the host and container
 * @param trigger
 * @param showHandler
 * @param hideHandler
 */
function useOverlayHintTrigger(
  trigger: React.MutableRefObject<HTMLElement>,
  showHandler: () => void,
  hideHandler: () => void,
  delayEnter: number,
  delayLeave: number
) {
  const debouncedShowHandler = debounce(showHandler, delayEnter, {
    leading: false,
    trailing: true
  });
  const debouncedHideHandler = debounce(hideHandler, delayLeave, {
    leading: false,
    trailing: true
  });

  useEffect(() => {
    trigger.current?.addEventListener('mouseenter', mouseEnterListener);
    trigger.current?.addEventListener('mouseleave', mouseLeaveListener);

    return () => {
      trigger.current?.removeEventListener('mouseenter', mouseEnterListener);
      trigger.current?.removeEventListener('mouseleave', mouseLeaveListener);
    };
  }, []);

  const mouseEnterListener = () => {
    debouncedHideHandler.cancel();
    debouncedShowHandler();
  };

  const mouseLeaveListener = () => {
    debouncedShowHandler.cancel();
    debouncedHideHandler();
  };
}
