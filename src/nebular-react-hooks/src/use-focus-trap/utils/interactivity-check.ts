import { usePlatform } from '../../use-platform/use-platform';

/**
 * Gets whether an element is disabled.
 *
 * @param element Element to be checked.
 * @returns Whether the element is disabled.
 */
export function isDisabled(element: HTMLElement): boolean {
  // This does not capture some cases, such as a non-form control with a disabled attribute or
  // a form control inside of a disabled form, but should capture the most common cases.
  return element.hasAttribute('disabled');
}

/**
 * Gets whether an element is visible for the purposes of interactivity.
 *
 * This will capture states like `display: none` and `visibility: hidden`, but not things like
 * being clipped by an `overflow: hidden` parent or being outside the viewport.
 *
 * @returns Whether the element is visible.
 */
export function isVisible(element: HTMLElement): boolean {
  return hasGeometry(element) && getComputedStyle(element).visibility === 'visible';
}

/**
 * Gets whether an element can be reached via Tab key.
 * Assumes that the element has already been checked with isFocusable.
 *
 * @param element Element to be checked.
 * @returns Whether the element is tabbable.
 */
export function isTabbable(element: HTMLElement): boolean {
  const { isBrowser, WEBKIT, IOS, FIREFOX } = usePlatform();

  // Nothing is tabbable on the server 😎
  if (!isBrowser) {
    return false;
  }

  const frameElement = getFrameElement(getWindow(element));

  if (frameElement) {
    // Frame elements inherit their tabindex onto all child elements.
    if (getTabIndexValue(frameElement) === -1) {
      return false;
    }

    // Browsers disable tabbing to an element inside of an invisible frame.
    if (!isVisible(frameElement)) {
      return false;
    }
  }

  const nodeName = element.nodeName.toLowerCase();
  const tabIndexValue = getTabIndexValue(element);

  if (element.hasAttribute('contenteditable')) {
    return tabIndexValue !== -1;
  }

  if (nodeName === 'iframe' || nodeName === 'object') {
    // The frame or object's content may be tabbable depending on the content, but it's
    // not possibly to reliably detect the content of the frames. We always consider such
    // elements as non-tabbable.
    return false;
  }

  // In iOS, the browser only considers some specific elements as tabbable.
  if (WEBKIT && IOS && !isPotentiallyTabbableIOS(element)) {
    return false;
  }

  if (nodeName === 'audio') {
    // Audio elements without controls enabled are never tabbable, regardless
    // of the tabindex attribute explicitly being set.
    if (!element.hasAttribute('controls')) {
      return false;
    }
    // Audio elements with controls are by default tabbable unless the
    // tabindex attribute is set to `-1` explicitly.
    return tabIndexValue !== -1;
  }

  if (nodeName === 'video') {
    // For all video elements, if the tabindex attribute is set to `-1`, the video
    // is not tabbable. Note: We cannot rely on the default `HTMLElement.tabIndex`
    // property as that one is set to `-1` in Chrome, Edge and Safari v13.1. The
    // tabindex attribute is the source of truth here.
    if (tabIndexValue === -1) {
      return false;
    }
    // If the tabindex is explicitly set, and not `-1` (as per check before), the
    // video element is always tabbable (regardless of whether it has controls or not).
    if (tabIndexValue !== null) {
      return true;
    }
    // Otherwise (when no explicit tabindex is set), a video is only tabbable if it
    // has controls enabled. Firefox is special as videos are always tabbable regardless
    // of whether there are controls or not.
    return FIREFOX || element.hasAttribute('controls');
  }

  return element.tabIndex >= 0;
}

/**
 * Gets whether an element can be focused by the user.
 *
 * @param element Element to be checked.
 * @param config The config object with options to customize this method's behavior
 * @returns Whether the element is focusable.
 */
export function isFocusable(element: HTMLElement, ignoreVisibility: boolean = false): boolean {
  // Perform checks in order of left to most expensive.
  // Again, naive approach that does not capture many edge cases and browser quirks.
  return (
    isPotentiallyFocusable(element) &&
    !isDisabled(element) &&
    (ignoreVisibility || isVisible(element))
  );
}

/** Checks whether the specified element has any geometry / rectangles. */
function hasGeometry(element: HTMLElement): boolean {
  // Use logic from jQuery to check for an invisible element.
  // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    (typeof element.getClientRects === 'function' && element.getClientRects().length)
  );
}

/**
 * Returns the frame element from a window object. Since browsers like MS Edge throw errors if
 * the frameElement property is being accessed from a different host address, this property
 * should be accessed carefully.
 */
function getFrameElement(window: Window) {
  try {
    return window.frameElement as HTMLElement;
  } catch {
    return null;
  }
}

/** Gets the parent window of a DOM node with regards of being inside of an iframe. */
function getWindow(node: HTMLElement): Window {
  // ownerDocument is null if `node` itself *is* a document.
  return (node.ownerDocument && node.ownerDocument.defaultView) || window;
}

/**
 * Returns the parsed tabindex from the element attributes instead of returning the
 * evaluated tabindex from the browsers defaults.
 */
function getTabIndexValue(element: HTMLElement): number | null {
  if (!hasValidTabIndex(element)) {
    return null;
  }

  // See browser issue in Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
  const tabIndex = parseInt(element.getAttribute('tabindex') || '', 10);

  return Number.isNaN(tabIndex) ? -1 : tabIndex;
}

/** Gets whether an element has a valid tabindex. */
function hasValidTabIndex(element: HTMLElement): boolean {
  if (!element.hasAttribute('tabindex') || element.tabIndex === undefined) {
    return false;
  }

  const tabIndex = element.getAttribute('tabindex');
  return !!(tabIndex && !Number.isNaN(parseInt(tabIndex, 10)));
}

/** Checks whether the specified element is potentially tabbable on iOS */
function isPotentiallyTabbableIOS(element: HTMLElement): boolean {
  const nodeName = element.nodeName.toLowerCase();
  const inputType = nodeName === 'input' && (element as HTMLInputElement).type;

  return (
    inputType === 'text' ||
    inputType === 'password' ||
    nodeName === 'select' ||
    nodeName === 'textarea'
  );
}

/**
 * Gets whether an element is potentially focusable without taking current visible/disabled state
 * into account.
 */
function isPotentiallyFocusable(element: HTMLElement): boolean {
  // Inputs are potentially focusable *unless* they're type="hidden".
  if (isHiddenInput(element)) {
    return false;
  }

  return (
    isNativeFormElement(element) ||
    isAnchorWithHref(element) ||
    element.hasAttribute('contenteditable') ||
    hasValidTabIndex(element)
  );
}

/** Gets whether an element's  */
function isNativeFormElement(element: Node) {
  const nodeName = element.nodeName.toLowerCase();
  return (
    nodeName === 'input' ||
    nodeName === 'select' ||
    nodeName === 'button' ||
    nodeName === 'textarea'
  );
}

/** Gets whether an element is an `<input type="hidden">`. */
function isHiddenInput(element: HTMLElement): boolean {
  return isInputElement(element) && element.type === 'hidden';
}

/** Gets whether an element is an anchor that has an href attribute. */
function isAnchorWithHref(element: HTMLElement): boolean {
  return isAnchorElement(element) && element.hasAttribute('href');
}

/** Gets whether an element is an input element. */
function isInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.nodeName.toLowerCase() === 'input';
}

/** Gets whether an element is an anchor element. */
function isAnchorElement(element: HTMLElement): element is HTMLAnchorElement {
  return element.nodeName.toLowerCase() === 'a';
}
