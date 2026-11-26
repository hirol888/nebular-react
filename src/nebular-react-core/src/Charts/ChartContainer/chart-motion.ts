import { useEffect, useState } from 'react';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Tracks the `prefers-reduced-motion` media query without touching `window`
 * during module evaluation, keeping the charts SSR safe.
 */
export function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    if (!mediaQuery) {
      return undefined;
    }

    const update = () => setReducedMotion(mediaQuery.matches);

    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);

      return () => mediaQuery.removeEventListener('change', update);
    }

    if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(update);

      return () => mediaQuery.removeListener(update);
    }

    return undefined;
  }, []);

  return reducedMotion;
}
