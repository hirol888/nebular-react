import createCache from '@emotion/cache';
import { useEmotionCacheContext } from '../theme/NebularProvider';

export const defaultNebularEmotionCache = createCache({ key: 'nebular', prepend: true });

export function useEmotionCache() {
  const cache = useEmotionCacheContext();
  return cache || defaultNebularEmotionCache;
}
