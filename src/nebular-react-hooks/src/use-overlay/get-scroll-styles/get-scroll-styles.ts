import React from 'react';
import {
  coerceCssPixelValue,
  getViewportScrollPosition,
  getViewportSize,
  ViewportScrollPosition
} from '../../utils';

export interface ScrollStylesState {
  isEnabled: boolean;
  previousHTMLStyles: {
    top: string;
    left: string;
  };
  previousScrollPositions: ViewportScrollPosition;
}

export function enableScrollStyles(scrollStylesState: React.MutableRefObject<ScrollStylesState>) {
  if (canBeEnabled(scrollStylesState.current.isEnabled, window)) {
    const root = document.documentElement!;

    scrollStylesState.current.previousScrollPositions = getViewportScrollPosition(window);

    // Cache the previous inline styles in case the user had set them.
    scrollStylesState.current.previousHTMLStyles.left = root.style.left || '';
    scrollStylesState.current.previousHTMLStyles.top = root.style.top || '';

    // Note: we're using the `html` node, instead of the `body`, because the `body` may
    // have the user agent margin, whereas the `html` is guaranteed not to have one.
    root.style.left = coerceCssPixelValue(-scrollStylesState.current.previousScrollPositions.left);
    root.style.top = coerceCssPixelValue(-scrollStylesState.current.previousScrollPositions.top);
    root.classList.add('global-scrollblock');
    scrollStylesState.current.isEnabled = true;
  }
}

export function disableScrollStyles(scrollStylesState: React.MutableRefObject<ScrollStylesState>) {
  if (scrollStylesState.current.isEnabled) {
    const scrollBehaviorSupported = supportsScrollBehavior();

    const html = document.documentElement!;
    const body = document.body!;
    const htmlStyle = html.style;
    const bodyStyle = body.style;
    const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
    const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';

    scrollStylesState.current.isEnabled = false;

    htmlStyle.left = scrollStylesState.current.previousHTMLStyles.left;
    htmlStyle.top = scrollStylesState.current.previousHTMLStyles.top;
    html.classList.remove('global-scrollblock');

    // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
    // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
    // Note that we don't mutate the property if the browser doesn't support `scroll-behavior`,
    // because it can throw off feature detections in `supportsScrollBehavior` which
    // checks for `'scrollBehavior' in documentElement.style`.
    if (scrollBehaviorSupported) {
      htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';
    }

    window.scroll(
      scrollStylesState.current.previousScrollPositions.left,
      scrollStylesState.current.previousScrollPositions.top
    );

    if (scrollBehaviorSupported) {
      htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
      bodyStyle.scrollBehavior = previousBodyScrollBehavior;
    }
  }
}

function canBeEnabled(isEnabled: boolean, window: Window & typeof globalThis): boolean {
  // Since the scroll strategies can't be singletons, we have to use a global CSS class
  // (`cdk-global-scrollblock`) to make sure that we don't try to disable global
  // scrolling multiple times.
  const html = document.documentElement!;

  if (html.classList.contains('global-scrollblock') || isEnabled) {
    return false;
  }

  const { body } = document;
  const viewport = getViewportSize(window);
  return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
}

/** Check whether the browser supports scroll behaviors. */
export function supportsScrollBehavior(): boolean {
  /** Cached result of the check that indicates whether the browser supports scroll behaviors. */
  let scrollBehaviorSupported: boolean | undefined;

  if (scrollBehaviorSupported == null) {
    // If we're not in the browser, it can't be supported. Also check for `Element`, because
    // some projects stub out the global `document` during SSR which can throw us off.
    if (typeof document !== 'object' || !document || typeof Element !== 'function' || !Element) {
      scrollBehaviorSupported = false;
      return scrollBehaviorSupported;
    }

    // If the element can have a `scrollBehavior` style, we can be sure that it's supported.
    if ('scrollBehavior' in document.documentElement!.style) {
      scrollBehaviorSupported = true;
    } else {
      // At this point we have 3 possibilities: `scrollTo` isn't supported at all, it's
      // supported but it doesn't handle scroll behavior, or it has been polyfilled.
      // eslint-disable-next-line @typescript-eslint/ban-types
      const scrollToFunction: Function | undefined = Element.prototype.scrollTo;

      if (scrollToFunction) {
        // We can detect if the function has been polyfilled by calling `toString` on it. Native
        // functions are obfuscated using `[native code]`, whereas if it was overwritten we'd get
        // the actual function source. Via https://davidwalsh.name/detect-native-function. Consider
        // polyfilled functions as supporting scroll behavior.
        scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString());
      } else {
        scrollBehaviorSupported = false;
      }
    }
  }

  return scrollBehaviorSupported;
}
