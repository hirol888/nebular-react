import { DEFAULT_LOCALE } from '@nebular-react/hooks';
import { useNebularLocale } from '@nebular-react/styles';

/**
 * Resolves the locale for date/time components. An explicit prop wins over the
 * provider locale, which wins over the date adapter default.
 */
export function useDefaultLocale(locale?: string, fallback: string = DEFAULT_LOCALE): string {
  const { locale: providerLocale, hasLocale } = useNebularLocale();

  return locale || (hasLocale ? providerLocale : fallback);
}
