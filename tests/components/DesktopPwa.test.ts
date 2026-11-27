import { act, renderHook } from '@testing-library/react';
import {
  registerDesktopServiceWorker,
  useInstallPrompt,
  type DesktopBeforeInstallPromptEvent
} from '@nebular-react/core';

function createInstallPrompt(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt', {
    cancelable: true
  }) as DesktopBeforeInstallPromptEvent & {
    prompt: jest.Mock;
    userChoice: Promise<{ outcome: string }>;
  };
  const prompt = jest.fn().mockResolvedValue(undefined);

  Object.defineProperty(event, 'prompt', { value: prompt });
  Object.defineProperty(event, 'userChoice', {
    value: Promise.resolve({ outcome, platform: 'web' })
  });

  return { event, prompt };
}

describe('Desktop PWA utilities', () => {
  afterEach(() => {
    Reflect.deleteProperty(window.navigator, 'serviceWorker');
  });

  it('captures beforeinstallprompt and reports the install outcome', async () => {
    const { result } = renderHook(() => useInstallPrompt());
    const { event, prompt } = createInstallPrompt('accepted');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.canInstall).toBe(true);
    expect(result.current.installed).toBe(false);

    let outcome: string | undefined;

    await act(async () => {
      outcome = await result.current.install();
    });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(outcome).toBe('accepted');
    expect(result.current.installed).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('returns unavailable without a prompt and clears it on dismiss', async () => {
    const { result } = renderHook(() => useInstallPrompt());

    await expect(result.current.install()).resolves.toBe('unavailable');

    const { event } = createInstallPrompt('dismissed');

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    act(() => {
      result.current.dismiss();
    });
    expect(result.current.canInstall).toBe(false);
  });

  it('registers a service worker and tolerates unsupported environments', async () => {
    await expect(registerDesktopServiceWorker('/sw.js')).resolves.toBeNull();

    const registration = { update: jest.fn().mockResolvedValue(undefined) };
    const register = jest.fn().mockResolvedValue(registration);

    Object.defineProperty(window.navigator, 'serviceWorker', {
      configurable: true,
      value: { register }
    });

    await expect(
      registerDesktopServiceWorker('/sw.js', { scope: '/', update: true })
    ).resolves.toBe(registration);
    expect(register).toHaveBeenCalledWith('/sw.js', {
      scope: '/',
      updateViaCache: undefined
    });
    expect(registration.update).toHaveBeenCalledTimes(1);
  });
});
