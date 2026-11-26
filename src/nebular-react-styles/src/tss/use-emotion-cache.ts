import { useEmotionCacheContext } from '../theme/NebularProvider';
import { defaultNebularEmotionCache } from './default-emotion-cache';

export function useEmotionCache() {
  const cache = useEmotionCacheContext();
  return cache || defaultNebularEmotionCache;
}
