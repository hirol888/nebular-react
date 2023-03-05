import { CSSInterpolation, CSSObject } from '../../../../tss/types/css-object';

export function track(propValuePairs: CSSInterpolation): CSSObject {
  const trackSelectors = [
    '&::-webkit-slider-runnable-track',
    '&::-moz-range-track',
    '&::-ms-track'
  ];

  let result: CSSObject = {};
  for (const selector of trackSelectors) {
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
