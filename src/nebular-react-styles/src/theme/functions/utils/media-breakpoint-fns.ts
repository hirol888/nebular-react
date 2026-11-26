import {
  BreakpointName,
  DEFAULT_MEDIA_BREAKPOINTNAMES,
  DEFAULT_MEDIA_BREAKPOINTS
} from '../../types';

export function breakpointMin(
  name: BreakpointName | string,
  breakpoints: Record<BreakpointName | string, number> = DEFAULT_MEDIA_BREAKPOINTS
): number | null {
  const min = breakpoints[name];
  return min !== undefined && min !== 0 ? min : null;
}

export function breakpointNextName(
  name: BreakpointName | string,
  breakpointNames: (BreakpointName | string)[] = DEFAULT_MEDIA_BREAKPOINTNAMES
): BreakpointName | string | null {
  const index = breakpointNames.indexOf(name);
  return index >= 0 && index < breakpointNames.length - 1 ? breakpointNames[index + 1] : null;
}

export function breakpointMax(name: BreakpointName | string): number | null {
  const nextName = breakpointNextName(name);

  if (nextName) {
    const min = breakpointMin(nextName);
    return min === null ? null : min - 0.02;
  }

  return null;
}
