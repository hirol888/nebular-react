import { useRef } from 'react';

export function useRefEventListener(fn: Function) {
  const fnRef = useRef<Function>(fn);
  fnRef.current = fn;
  return fnRef;
}
