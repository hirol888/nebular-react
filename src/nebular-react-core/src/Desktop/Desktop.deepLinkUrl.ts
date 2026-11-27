export interface DesktopDeepLinkUrlOptions {
  /** Query parameter name. Defaults to `deepLink`. */
  param?: string;
  location?: Pick<Location, 'search' | 'hash'>;
}

export interface DesktopDeepLinkWriteOptions extends DesktopDeepLinkUrlOptions {
  /** Use `history.replaceState` instead of `pushState`. Defaults to true. */
  replace?: boolean;
  state?: unknown;
}

const DEFAULT_DEEP_LINK_PARAM = 'deepLink';
const DEEP_LINK_CHANGE_EVENT = 'nebular-desktop-deeplinkchange';

function readParam(search: string, param: string): string | null {
  const value = new URLSearchParams(search).get(param);
  return value && value.length > 0 ? value : null;
}

/**
 * Reads a desktop deep link from the query string or from the hash query
 * (`#/route?deepLink=app%3A%2F%2Fnotes`). Router-agnostic.
 */
export function getDesktopDeepLinkFromUrl(options: DesktopDeepLinkUrlOptions = {}): string | null {
  if (typeof window === 'undefined' && !options.location) {
    return null;
  }

  const param = options.param ?? DEFAULT_DEEP_LINK_PARAM;
  const location = options.location ?? window.location;
  const fromSearch = readParam(location.search, param);

  if (fromSearch) {
    return fromSearch;
  }

  const hash = location.hash.replace(/^#/, '');
  const hashQueryIndex = hash.indexOf('?');

  if (hashQueryIndex === -1) {
    return null;
  }

  return readParam(hash.slice(hashQueryIndex), param);
}

/**
 * Writes/removes the deep link in the current URL without assuming a router.
 * Returns false in non-DOM environments.
 */
export function setDesktopDeepLinkInUrl(
  deepLink: string | null,
  options: DesktopDeepLinkWriteOptions = {}
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const param = options.param ?? DEFAULT_DEEP_LINK_PARAM;
  const url = new URL(window.location.href);

  if (deepLink) {
    url.searchParams.set(param, deepLink);
  } else {
    url.searchParams.delete(param);
  }

  const method = options.replace === false ? 'pushState' : 'replaceState';
  window.history[method](options.state ?? window.history.state, '', url);
  window.dispatchEvent(new CustomEvent(DEEP_LINK_CHANGE_EVENT, { detail: deepLink }));

  return true;
}

/** Subscribes to URL/hash navigation and manual `setDesktopDeepLinkInUrl` updates. */
export function subscribeDesktopDeepLink(
  listener: (deepLink: string | null) => void,
  options: DesktopDeepLinkUrlOptions = {}
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const notify = () => listener(getDesktopDeepLinkFromUrl(options));
  const handleCustom = (event: Event) => {
    const { detail } = event as CustomEvent<string | null>;
    listener(detail === undefined ? getDesktopDeepLinkFromUrl(options) : detail);
  };

  window.addEventListener('popstate', notify);
  window.addEventListener('hashchange', notify);
  window.addEventListener(DEEP_LINK_CHANGE_EVENT, handleCustom);

  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener('hashchange', notify);
    window.removeEventListener(DEEP_LINK_CHANGE_EVENT, handleCustom);
  };
}
