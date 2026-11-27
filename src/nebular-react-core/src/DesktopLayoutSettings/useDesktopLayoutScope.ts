import { useCallback, useState } from 'react';
import type { DesktopLayoutScope } from '../Desktop/Desktop.types';

const DEFAULT_KEY = 'nebular-desktop-layout-scope';

function readScope(storageKey: string): DesktopLayoutScope {
  if (typeof window === 'undefined') {
    return 'device';
  }

  try {
    return window.localStorage.getItem(storageKey) === 'shared' ? 'shared' : 'device';
  } catch {
    return 'device';
  }
}

/**
 * Persists the user's choice between a device layout and a shared profile layout.
 * The value is intentionally local: it only selects which scope the adapter writes to.
 */
export function useDesktopLayoutScope(
  storageKey = DEFAULT_KEY
): [DesktopLayoutScope, (scope: DesktopLayoutScope) => void] {
  const [scope, setInternalScope] = useState<DesktopLayoutScope>(() => readScope(storageKey));
  const setScope = useCallback(
    (next: DesktopLayoutScope) => {
      setInternalScope(next);

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          // Best-effort preference storage.
        }
      }
    },
    [storageKey]
  );

  return [scope, setScope];
}
