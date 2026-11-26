import { BreakpointName } from '../../../types';
import { CSSInterpolation, CSSObject } from '../../../../tss/types/css-object';
import { breakpointMax, breakpointMin } from '../../utils/media-breakpoint-fns';
import { mediaBreakpointUp } from '../media-breakpoint-up/media-breakpoint-up';
import { mediaBreakpointDown } from '../media-breakpoint-down/media-breakpoint-down';

export function mediaBreakpointBetween(
  lowerBreakpoint?: BreakpointName,
  upperBreakpoint?: BreakpointName,
  propValuePairs?: CSSInterpolation
): CSSObject {
  let result: CSSObject = {};

  const min = lowerBreakpoint ? breakpointMin(lowerBreakpoint) : null;
  const max = upperBreakpoint ? breakpointMax(upperBreakpoint) : null;

  if (min !== null && max !== null) {
    result = {
      [`@media (min-width: ${min}px) and (max-width: ${max}px)`]: propValuePairs
    };
  } else if (max === null && lowerBreakpoint) {
    return mediaBreakpointUp(lowerBreakpoint, propValuePairs);
  } else if (min === null && upperBreakpoint) {
    return mediaBreakpointDown(upperBreakpoint, propValuePairs);
  }

  return result;
}
