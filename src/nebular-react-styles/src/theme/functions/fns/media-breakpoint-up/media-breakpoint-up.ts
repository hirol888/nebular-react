import { BreakpointName } from '../../../types';
import { CSSInterpolation, CSSObject } from '../../../../tss/types/css-object';
import { breakpointMin } from '../../utils/media-breakpoint-fns';

export function mediaBreakpointUp(
  breakpointName: BreakpointName,
  propValuePairs: CSSInterpolation
): CSSObject {
  let result: CSSObject = {};
  const min = breakpointMin(breakpointName);
  if (min) {
    result = {
      [`@media (min-width: ${min}px)`]: propValuePairs
    };
  }

  return result;
}
