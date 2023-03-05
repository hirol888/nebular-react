import { BreakpointName } from '../../../types';
import { CSSInterpolation, CSSObject } from '../../../../tss/types/css-object';
import { breakpointMax } from '../../utils/media-breakpoint-fns';

export function mediaBreakpointDown(
  breakpointName: BreakpointName,
  propValuePairs: CSSInterpolation
): CSSObject {
  let result: CSSObject = {};
  const max = breakpointMax(breakpointName);
  if (max) {
    result = {
      [`@media (max-width: ${max}px)`]: propValuePairs
    };
  }

  return result;
}
