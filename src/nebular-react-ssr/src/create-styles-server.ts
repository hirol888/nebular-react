import { EmotionCache } from '@emotion/cache';
import createEmotionServer from '@emotion/server/create-instance';
import { defaultNebularEmotionCache } from '@nebular-react/styles';

export function createStylesServer(cache?: EmotionCache) {
  return createEmotionServer(cache || defaultNebularEmotionCache);
}
