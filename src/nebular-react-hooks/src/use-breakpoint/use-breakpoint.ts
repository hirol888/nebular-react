import { useEffect, useRef, useState } from 'react';
import { BreakpointName, DEFAULT_MEDIA_BREAKPOINTS } from '@nebular-react/styles';

export interface MediaBreakpoint {
  name: BreakpointName | string;
  width: number;
}

export interface BreakpointState {
  prevBreakpoint: MediaBreakpoint;
  currBreakpoint: MediaBreakpoint;
}

export function useBreakpoint(): { breakpointState: BreakpointState } {
  const prevWidth = useRef<number>(-1);
  const [breakpointState, setBreakpointState] = useState<BreakpointState>({
    prevBreakpoint: { name: 'unknown', width: -1 },
    currBreakpoint: { name: 'unknown', width: -1 }
  });

  useEffect(() => {
    const width = window.innerWidth;
    const prevBreakpoint = getByWidth(prevWidth.current);
    const currBreakpoint = getByWidth(width);
    prevWidth.current = width;

    if (prevBreakpoint.name !== currBreakpoint.name) {
      setBreakpointState((state) => ({
        prevBreakpoint: { ...state.currBreakpoint },
        currBreakpoint
      }));
    }

    window.addEventListener('resize', resizeListener);

    return () => {
      window.removeEventListener('resize', resizeListener);
    };
  }, []);

  const resizeListener = (event: UIEvent) => {
    const width = (event.target as Window).innerWidth;
    const prevBreakpoint = getByWidth(prevWidth.current);
    const currBreakpoint = getByWidth(width);
    prevWidth.current = width;

    if (prevBreakpoint.name !== currBreakpoint.name) {
      setBreakpointState((state) => ({
        prevBreakpoint: { ...state.currBreakpoint },
        currBreakpoint
      }));
    }
  };

  return { breakpointState };
}

function getByWidth(
  width: number,
  breakpoints: Record<BreakpointName | string, number> = DEFAULT_MEDIA_BREAKPOINTS
): MediaBreakpoint {
  const unknown: MediaBreakpoint = { name: 'unknown', width };
  const breakpointsArray = Object.keys(breakpoints).map((key) => ({
    name: key,
    width: breakpoints[key]
  }));

  return width === -1
    ? unknown
    : breakpointsArray.find((point, index) => {
        const next = breakpointsArray[index + 1];
        return width >= point.width && (!next || width < next.width);
      }) || unknown;
}
