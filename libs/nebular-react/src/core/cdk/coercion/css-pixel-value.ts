/* eslint-disable @typescript-eslint/no-explicit-any */

/** Coerces a value to a CSS pixel value. */
export function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return typeof value === 'string' ? value : `${value}px`;
}