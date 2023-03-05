import React, { useRef } from 'react';
import { throttle } from 'lodash';
import { useIsomorphicEffect } from '@mantine/hooks';
import { coerceArray, coerceCssPixelValue } from '../utils';
import {
  disableScrollStyles,
  enableScrollStyles,
  ScrollStylesState
} from './get-scroll-styles/get-scroll-styles';
import { ScrollStrategy } from './get-scroll-styles/types';

export interface OverlayConfig {
  apply?: () => void;
  paneRef: React.MutableRefObject<HTMLElement>;
  paneWrapperRef: React.MutableRefObject<HTMLElement>;
  opened: boolean;
  panelClass?: string;
  scrollStrategy?: ScrollStrategy;
  scrollDispatchers?: (HTMLElement | string)[];
  hasBackdrop?: boolean;
  backdropClass?: string;
  backdropClickHandler?: (event: MouseEvent) => void;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useOverlay(config: OverlayConfig): {
  backdropElementRef: React.MutableRefObject<HTMLDivElement>;
  enableBlockStrategy: () => void;
  disableBlockStrategy: () => void;
} {
  const {
    apply,
    paneRef,
    paneWrapperRef,
    opened,
    panelClass,
    scrollStrategy = 'block',
    scrollDispatchers = [],
    hasBackdrop,
    backdropClass,
    backdropClickHandler,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight
  } = config;
  const scrollStylesState = useRef<ScrollStylesState>({
    isEnabled: false,
    previousHTMLStyles: { top: '', left: '' },
    previousScrollPositions: { top: 0, left: 0 }
  });
  const backdropElementRef = useRef<HTMLDivElement>(null);
  const _scrollDispatchers = getScrollDispatchers(scrollDispatchers);

  useIsomorphicEffect(() => {
    if (paneWrapperRef.current && paneRef.current && opened) {
      window.addEventListener('resize', throttledApplyStyles);
      window.addEventListener('orientationchange', throttledApplyStyles);

      typeof apply === 'function' && apply();
      paneRef.current.style.visibility = 'visible';

      updateStackingOrder(paneWrapperRef.current);
      updateElementSize(paneRef.current, width, height, minWidth, minHeight, maxWidth, maxHeight);
      if (scrollStrategy === 'block') {
        enableScrollStyles(scrollStylesState);
      }

      if (scrollStrategy === 'repositon') {
        _scrollDispatchers.forEach((dispatcher) =>
          dispatcher.addEventListener('scroll', throttledApplyStyles)
        );
      }

      // togglePointerEvents(pane.current, true);
      if (hasBackdrop) {
        backdropElementRef.current = attachBackdrop(
          paneWrapperRef,
          backdropClickHandler,
          backdropClass
        );
      }

      if (panelClass) {
        toggleClasses(paneRef.current, panelClass, true);
      }
    }

    // keyboardDispatcher
    // outsideClickDispatcher

    return () => {
      window.removeEventListener('resize', throttledApplyStyles);
      window.removeEventListener('orientationchange', throttledApplyStyles);

      if (hasBackdrop) {
        detachBackdrop(backdropElementRef, backdropClickHandler, backdropClass);
      }
      //togglePointerEvents(pane.current, false);
      // position detach
      if (scrollStrategy === 'block') {
        disableScrollStyles(scrollStylesState);
      }

      if (scrollStrategy === 'repositon') {
        _scrollDispatchers.forEach((dispatcher) =>
          dispatcher?.removeEventListener('scroll', throttledApplyStyles)
        );
      }

      //keyboardDispatcher
      //outsideClickDispatcher
    };
  }, [paneWrapperRef.current, paneRef.current, opened]);

  const throttledApplyStyles = throttle(apply, 30);

  const enableBlockStrategy = () => enableScrollStyles(scrollStylesState);
  const disableBlockStrategy = () => disableScrollStyles(scrollStylesState);

  return { backdropElementRef, enableBlockStrategy, disableBlockStrategy };
}

/**
 * Updates the stacking order of the element, moving it to the top if necessary.
 * This is required in cases where one overlay was detached, while another one,
 * that should be behind it, was destroyed. The next time both of them are opened,
 * the stacking will be wrong, because the detached element's pane will still be
 * in its original DOM position.
 */
function updateStackingOrder(host: HTMLElement) {
  if (host.nextSibling) {
    host.parentNode!.appendChild(host);
  }
}

/** Updates the size of the overlay element based on the overlay config. */
function updateElementSize(
  pane: HTMLElement,
  width?: number,
  height?: number,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
) {
  const { style } = pane;

  style.width = coerceCssPixelValue(width);
  style.height = coerceCssPixelValue(height);
  style.minWidth = coerceCssPixelValue(minWidth);
  style.minHeight = coerceCssPixelValue(minHeight);
  style.maxWidth = coerceCssPixelValue(maxWidth);
  style.maxHeight = coerceCssPixelValue(maxHeight);
}

/** Toggles a single CSS class or an array of classes on an element. */
function toggleClasses(element: HTMLElement, cssClasses: string | string[], isAdd: boolean) {
  const classes = coerceArray(cssClasses || []).filter((c) => !!c);

  if (classes.length) {
    isAdd ? element.classList.add(...classes) : element.classList.remove(...classes);
  }
}

/** Attaches a backdrop for this overlay. */
function attachBackdrop(
  paneWrapperRef: React.MutableRefObject<HTMLElement>,
  backdropClickHandler?: (event: MouseEvent) => void,
  backdropClass?: string
): HTMLDivElement {
  const showingClass = 'overlay-backdrop-showing';

  const backdropElement = document.createElement('div');
  backdropElement.classList.add('overlay-backdrop');

  if (backdropClass) {
    toggleClasses(backdropElement, backdropClass, true);
  }

  // Insert the backdrop before the pane in the DOM order,
  // in order to handle stacked overlays properly.
  paneWrapperRef.current?.parentElement?.insertBefore(backdropElement, paneWrapperRef.current!);

  // Forward backdrop clicks such that the consumer of the overlay can perform whatever
  // action desired when such a click occurs (usually closing the overlay).
  if (typeof backdropClickHandler === 'function') {
    backdropElement.addEventListener('click', backdropClickHandler);
  }

  // Add class to fade-in the backdrop after one frame.
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      if (backdropElement) {
        backdropElement.classList.add(showingClass);
      }
    });
  } else {
    backdropElement.classList.add(showingClass);
  }

  return backdropElement;
}

/** Detaches the backdrop (if any) associated with the overlay. */
function detachBackdrop(
  backdropElementRef: React.MutableRefObject<HTMLDivElement>,
  backdropClickHandler?: (event: MouseEvent) => void,
  backdropClass?: string
): void {
  const backdropToDetach = backdropElementRef.current;

  if (!backdropToDetach) {
    return;
  }

  // eslint-disable-next-line prefer-const
  let timeoutId: ReturnType<typeof setTimeout>;
  const finishDetach = () => {
    // It may not be attached to anything in certain cases (e.g. unit tests).
    if (backdropToDetach) {
      backdropToDetach.removeEventListener('click', backdropClickHandler);
      backdropToDetach.removeEventListener('transitionend', finishDetach);
      backdropToDetach.remove();
      backdropElementRef.current = null;
    }

    if (backdropClass) {
      toggleClasses(backdropToDetach!, backdropClass, false);
    }

    clearTimeout(timeoutId);
  };

  backdropToDetach.classList.remove('overlay-backdrop-showing');

  backdropToDetach!.addEventListener('transitionend', finishDetach);

  // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
  // In this case we make it unclickable and we try to remove it after a delay.
  backdropToDetach.style.pointerEvents = 'none';

  // Run this outside the Angular zone because there's nothing that Angular cares about.
  // If it were to run inside the Angular zone, every test that used Overlay would have to be
  // either async or fakeAsync.
  timeoutId = setTimeout(finishDetach, 500);
}

function getScrollDispatchers(
  scrollDispatchers: (HTMLElement | string)[]
): ((Window & typeof globalThis) | HTMLElement)[] {
  let _scrollDispatchers: ((Window & typeof globalThis) | HTMLElement)[] = [window];

  scrollDispatchers.forEach((dispatcher) => {
    const _dispatcher =
      typeof dispatcher === 'string'
        ? (document.querySelector(dispatcher) as HTMLElement)
        : dispatcher;
    _scrollDispatchers = [..._scrollDispatchers, _dispatcher];
  });

  return _scrollDispatchers;
}
