import { CSSInterpolation, CSSObject } from '../../../../tss/types/css-object';

export function thumb(propValuePairs: CSSInterpolation): CSSObject {
  const thumbSelectors = ['&::-webkit-slider-thumb', '&::-moz-range-thumb', '&::-ms-thumb'];

  let result: CSSObject = {};
  for (const selector of thumbSelectors) {
    result = {
      ...result,
      [selector]: {
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        ...(propValuePairs as any)
      }
    };
  }

  return result;
}
