import React, { useEffect, useRef, useState } from 'react';
import { isFocusable, isTabbable } from './utils/interactivity-check';

export function useFocusTrap(deferAnchors: boolean = false): {
  elementRef: React.MutableRefObject<HTMLDivElement>;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  focusInitialElement: (options?: FocusOptions) => boolean;
  blurPreviousFocusedElement: () => void;
  restoreFocus: () => void;
} {
  const elementRef = useRef<HTMLDivElement>(null);
  const startAnchor = useRef<HTMLElement>(null);
  const endAnchor = useRef<HTMLElement>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const previouslyFocusedElement = useRef<HTMLElement>(document.activeElement as HTMLElement);

  useEffect(() => {
    if (!deferAnchors && elementRef.current) {
      attachAnchors();
    }

    return () => {
      destroy();
    };
  }, [elementRef.current]);

  useEffect(() => {
    if (startAnchor.current && endAnchor.current) {
      toggleAnchorTabIndex(isEnabled, startAnchor.current);
      toggleAnchorTabIndex(isEnabled, endAnchor.current);
    }
  }, [isEnabled]);

  const attachAnchors = () => {
    if (!startAnchor.current) {
      startAnchor.current = createAnchor(isEnabled);
      startAnchor.current!.addEventListener('focus', startAnchorListener);
    }

    if (!endAnchor.current) {
      endAnchor.current = createAnchor(isEnabled);
      endAnchor.current!.addEventListener('focus', endAnchorListener);
    }

    if (elementRef.current.parentNode) {
      elementRef.current.parentNode.insertBefore(startAnchor.current!, elementRef.current);
      elementRef.current.parentNode.insertBefore(
        endAnchor.current!,
        elementRef.current.nextSibling
      );
    }
  };

  const focusFirstTabbalbeElement = (options?: FocusOptions): boolean => {
    const redirectToElement = getRegionBoundary(elementRef, 'start');

    if (redirectToElement) {
      redirectToElement.focus(options);
    }

    return !!redirectToElement;
  };

  const focusLastTabbableElement = (options?: FocusOptions): boolean => {
    const redirectToElement = getRegionBoundary(elementRef, 'end');

    if (redirectToElement) {
      redirectToElement.focus(options);
    }

    return !!redirectToElement;
  };

  const startAnchorListener = () => focusLastTabbableElement();
  const endAnchorListener = () => focusFirstTabbalbeElement();

  const destroy = () => {
    if (startAnchor.current) {
      startAnchor.current.removeEventListener('focus', startAnchorListener);
      startAnchor.current.remove();
      startAnchor.current = null;
    }

    if (endAnchor.current) {
      endAnchor.current.removeEventListener('focus', endAnchorListener);
      endAnchor.current.remove();
      endAnchor.current = null;
    }
  };

  const focusInitialElement = (options?: FocusOptions): boolean => {
    const redirectToElement = elementRef.current?.querySelector(
      '[data-focus-initial], [data-focusInitial]'
    ) as HTMLElement;

    if (redirectToElement) {
      if (!isFocusable(redirectToElement)) {
        const focusableChild = getFirstTabbableElement(redirectToElement) as HTMLElement;
        focusableChild?.focus(options);
        return !!focusableChild;
      }

      redirectToElement.focus(options);
      return true;
    }

    return focusFirstTabbalbeElement(options);
  };

  const restoreFocus = () => {
    previouslyFocusedElement.current?.focus();
    destroy();
  };

  const blurPreviousFocusedElement = () => {
    previouslyFocusedElement.current?.blur();
  };

  return {
    elementRef,
    setIsEnabled,
    focusInitialElement,
    blurPreviousFocusedElement,
    restoreFocus
  };
}

/** Creates an anchor element. */
function createAnchor(enabled: boolean): HTMLElement {
  const anchor = document.createElement('div');
  toggleAnchorTabIndex(enabled, anchor);
  anchor.classList.add('visually-hidden');
  anchor.classList.add('focus-trap-anchor');
  anchor.setAttribute('aria-hidden', 'true');
  return anchor;
}

/**
 * Toggles the `tabindex` of an anchor, based on the enabled state of the focus trap.
 * @param isEnabled Whether the focus trap is enabled.
 * @param anchor Anchor on which to toggle the tabindex.
 */
function toggleAnchorTabIndex(isEnabled: boolean, anchor: HTMLElement) {
  // Remove the tabindex completely, rather than setting it to -1, because if the
  // element has a tabindex, the user might still hit it when navigating with the arrow keys.
  isEnabled ? anchor.setAttribute('tabindex', '0') : anchor.removeAttribute('tabindex');
}

/**
 * Get the specified boundary element of the trapped region.
 * @param bound The boundary to get (start or end of trapped region).
 * @returns The boundary element.
 */
function getRegionBoundary(
  elementRef: React.MutableRefObject<HTMLElement>,
  bound: 'start' | 'end'
): HTMLElement | null {
  // Contains the deprecated version of selector, for temporary backwards comparability.
  const markers = elementRef.current?.querySelectorAll(
    `[focus-region-${bound}], [focusRegion${bound}], [focus-${bound}]`
  ) as NodeListOf<HTMLElement>;

  if (bound === 'start') {
    return markers.length ? markers[0] : getFirstTabbableElement(elementRef.current);
  }
  return markers.length ? markers[markers.length - 1] : getLastTabbableElement(elementRef.current);
}

/** Get the first tabbable element from a DOM subtree (inclusive). */
function getFirstTabbableElement(root: HTMLElement): HTMLElement | null {
  if (isFocusable(root) && isTabbable(root)) {
    return root;
  }

  const { children } = root;

  for (let i = 0; i < children.length; i++) {
    const tabbableChild =
      children[i].nodeType === document.ELEMENT_NODE
        ? getFirstTabbableElement(children[i] as HTMLElement)
        : null;

    if (tabbableChild) {
      return tabbableChild;
    }
  }

  return null;
}

/** Get the last tabbable element from a DOM subtree (inclusive). */
function getLastTabbableElement(root: HTMLElement): HTMLElement | null {
  if (isFocusable(root) && isTabbable(root)) {
    return root;
  }

  // Iterate in reverse DOM order.
  const { children } = root;

  for (let i = children.length - 1; i >= 0; i--) {
    const tabbableChild =
      children[i].nodeType === document.ELEMENT_NODE
        ? getLastTabbableElement(children[i] as HTMLElement)
        : null;

    if (tabbableChild) {
      return tabbableChild;
    }
  }

  return null;
}
