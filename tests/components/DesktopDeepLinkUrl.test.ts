import {
  getDesktopDeepLinkFromUrl,
  setDesktopDeepLinkInUrl,
  subscribeDesktopDeepLink
} from '@nebular-react/core';

describe(' Desktop deep link URL helpers', () => {
  const original = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  afterEach(() => {
    window.history.replaceState(null, '', original);
  });

  it('reads the deep link from search and hash queries', () => {
    window.history.replaceState(null, '', '/app?deepLink=app%3A%2F%2Fnotes%2F1');
    expect(getDesktopDeepLinkFromUrl()).toBe('app://notes/1');

    window.history.replaceState(null, '', '/app#/home?deepLink=app%3A%2F%2Fmail%2Finbox');
    expect(getDesktopDeepLinkFromUrl()).toBe('app://mail/inbox');
    expect(getDesktopDeepLinkFromUrl({ param: 'missing' })).toBeNull();
  });

  it('writes, replaces and removes the deep link without a router', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeDesktopDeepLink(listener);

    expect(setDesktopDeepLinkInUrl('app://notes/2', { replace: false })).toBe(true);
    expect(window.location.search).toContain('deepLink=app%3A%2F%2Fnotes%2F2');
    expect(listener).toHaveBeenLastCalledWith('app://notes/2');

    expect(setDesktopDeepLinkInUrl(null)).toBe(true);
    expect(getDesktopDeepLinkFromUrl()).toBeNull();
    expect(listener).toHaveBeenLastCalledWith(null);

    unsubscribe();
  });

  it('supports a custom parameter name', () => {
    setDesktopDeepLinkInUrl('app://notes/3', { param: 'target' });
    expect(getDesktopDeepLinkFromUrl({ param: 'target' })).toBe('app://notes/3');
    expect(getDesktopDeepLinkFromUrl()).toBeNull();
  });
});
