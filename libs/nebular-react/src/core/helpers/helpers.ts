import React from 'react';

export function mergedRefs<T>(
  ...refs: (React.MutableRefObject<T> | React.RefObject<T> | React.ForwardedRef<T> | React.Ref<T>)[]
): React.Ref<T> | null {
  const filteredRefs = refs.filter(Boolean);
  if (!filteredRefs.length) return null;
  if (filteredRefs.length === 0) return filteredRefs[0];
  return (inst: T) => {
    for (const ref of filteredRefs) {
      if (typeof ref === 'function') {
        ref(inst);
      } else if (ref) {
        (ref as React.MutableRefObject<T>).current = inst;
      }
    }
  };
}
