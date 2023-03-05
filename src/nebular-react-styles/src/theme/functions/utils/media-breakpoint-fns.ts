import {
  BreakpointName,
  DEFAULT_MEDIA_BREAKPOINTNAMES,
  DEFAULT_MEDIA_BREAKPOINTS
} from '../../types';

export function breakpointMin(
  name: BreakpointName | string,
  breakpoints: Record<BreakpointName | string, number> = DEFAULT_MEDIA_BREAKPOINTS
): number {
  const min = breakpoints[name];
  return min !== 0 ? min : null;
}

export function breakpointNextName(
  name: BreakpointName | string,
  breakpointNames: (BreakpointName | string)[] = DEFAULT_MEDIA_BREAKPOINTNAMES
) {
  const index = breakpointNames.indexOf(name);
  return index < breakpointNames.length ? breakpointNames[index + 1] : null;
}

export function breakpointMax(name: BreakpointName | string): number {
  const nextName = breakpointNextName(name);
  if (nextName) {
    const min = breakpointMin(nextName);
    return min - 0.02;
  }

  return null;
}
