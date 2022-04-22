/** An object where all of its properties cannot be written. */
export type ImmutableObject<T> = {
  readonly [P in keyof T]: T[P];
};

/** Equivalent of `DOMRect` without some of the properties we don't care about. */
export type Dimensions = Omit<DOMRect, 'x' | 'y' | 'toJSON'>;

/* eslint-disable no-prototype-builtins */
export const containerClass = 'cdk-overlay-container';

/** Use defaultView of injected document if available or fallback to global window reference */
export function getWindow() {
  return document.defaultView || window;
}

/** Shallow-extends a stylesheet object with another stylesheet object. */
export function extendStyles(
  destination: CSSStyleDeclaration,
  source: CSSStyleDeclaration
): CSSStyleDeclaration {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      destination[key] = source[key];
    }
  }

  return destination;
}

/**
 * Gets a version of an element's bounding `ClientRect` where all the values are rounded down to
 * the nearest pixel. This allows us to account for the cases where there may be sub-pixel
 * deviations in the `ClientRect` returned by the browser (e.g. when zoomed in with a percentage
 * size, see #21350).
 */
export function getRoundedBoundingClientRect(clientRect: Dimensions): Dimensions {
  return {
    top: Math.floor(clientRect.top),
    right: Math.floor(clientRect.right),
    bottom: Math.floor(clientRect.bottom),
    left: Math.floor(clientRect.left),
    width: Math.floor(clientRect.width),
    height: Math.floor(clientRect.height),
  };
}

/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;

/**
 * Extracts the pixel value as a number from a value, if it's a number
 * or a CSS pixel string (e.g. `1337px`). Otherwise returns null.
 */
export function getPixelValue(input: number | string | null | undefined): number | null {
  if (typeof input !== 'number' && input != null) {
    const [value, units] = input.split(cssUnitPattern);
    return !units || units === 'px' ? parseFloat(value) : null;
  }

  return input || null;
}

export enum NbLayoutDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}
