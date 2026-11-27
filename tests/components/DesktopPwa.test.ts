import { act, renderHook } from '@testing-library/react';
import {
  registerDesktopServiceWorker,
  useInstallPrompt,
  type DesktopBeforeInstallPromptEvent
} from '@nebular-react/core';

type FakeListener = (event: Event) => void;

class FakeServiceWorker {
  state: ServiceWorkerState = 'installing';

  postMessage = jest.fn();

  private listeners = new Map<string, Set<FakeListener>>();

  addEventListener(type: string, listener: FakeListener) {
    const listeners = this.listeners.get(type) ?? new Set<FakeListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: FakeListener) {
    this.listeners.get(type)?.delete(listener);
  }

  setState(state: ServiceWorkerState) {
    this.state = state;
    this.listeners.get('statechange')?.forEach((listener) => listener(new Event('statechange')));
  }
}

class FakeServiceWorkerRegistration {
  installing: FakeServiceWorker | null = null;

  waiting: FakeServiceWorker | null = null;

  update = jest.fn().mockResolvedValue(undefined);

  private listeners = new Map<string, Set<FakeListener>>();

  addEventListener(type: string, listener: FakeListener) {
    const listeners = this.listeners.get(type) ?? new Set<FakeListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: FakeListener) {
    this.listeners.get(type)?.delete(listener);
  }

  emitUpdateFound() {
    this.listeners.get('updatefound')?.forEach((listener) => listener(new Event('updatefound')));
  }
}

class FakeServiceWorkerContainer {
  controller: unknown = {};

  register = jest.fn();

  oncontrollerchange: FakeListener | null = null;

  private listeners = new Map<string, Set<FakeListener>>();

  addEventListener(type: string, listener: FakeListener) {
    const listeners = this.listeners.get(type) ?? new Set<FakeListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: FakeListener) {
    this.listeners.get(type)?.delete(listener);
  }

  emitControllerChange() {
    this.listeners
      .get('controllerchange')
      ?.forEach((listener) => listener(new Event('controllerchange')));
  }
}

function installServiceWorker(container: FakeServiceWorkerContainer) {
  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: container
  });
}

function asRegistration(registration: FakeServiceWorkerRegistration): ServiceWorkerRegistration {
  return registration as unknown as ServiceWorkerRegistration;
}

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
    jest.restoreAllMocks();
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

  it('detects waiting updates, posts SKIP_WAITING and reloads only once', async () => {
    const registration = new FakeServiceWorkerRegistration();
    const container = new FakeServiceWorkerContainer();
    container.register.mockResolvedValue(registration);
    installServiceWorker(container);

    // jsdom cannot stub `location.reload` (non-configurable); it reports the
    // unimplemented navigation through console.error instead.
    const reload = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const onUpdate = jest.fn();
    const onWaiting = jest.fn();

    const result = await registerDesktopServiceWorker('/sw.js', {
      scope: '/app',
      onUpdate,
      onWaiting,
      skipWaiting: true,
      reloadOnUpdate: true
    });

    expect(result).toBe(asRegistration(registration));
    expect(container.register).toHaveBeenCalledWith('/sw.js', {
      scope: '/app',
      updateViaCache: undefined
    });
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onWaiting).not.toHaveBeenCalled();

    const installing = new FakeServiceWorker();
    registration.installing = installing;
    registration.emitUpdateFound();

    const waiting = new FakeServiceWorker();
    registration.waiting = waiting;
    installing.setState('installed');

    expect(onWaiting).toHaveBeenCalledTimes(1);
    expect(onWaiting).toHaveBeenCalledWith(asRegistration(registration));
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(asRegistration(registration));
    expect(waiting.postMessage).toHaveBeenCalledTimes(1);
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

    container.emitControllerChange();
    container.emitControllerChange();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('treats a first install as offline-ready instead of an update', async () => {
    const registration = new FakeServiceWorkerRegistration();
    const container = new FakeServiceWorkerContainer();
    container.controller = null;
    container.register.mockResolvedValue(registration);
    installServiceWorker(container);

    const onUpdate = jest.fn();
    const onWaiting = jest.fn();

    await registerDesktopServiceWorker('/sw.js', {
      onUpdate,
      onWaiting,
      skipWaiting: true
    });

    const installing = new FakeServiceWorker();
    registration.installing = installing;
    registration.emitUpdateFound();
    installing.setState('installed');

    expect(onUpdate).not.toHaveBeenCalled();
    expect(onWaiting).not.toHaveBeenCalled();
    expect(installing.postMessage).not.toHaveBeenCalled();
  });

  it('never propagates errors from update callbacks', async () => {
    const registration = new FakeServiceWorkerRegistration();
    const container = new FakeServiceWorkerContainer();
    container.register.mockResolvedValue(registration);
    installServiceWorker(container);

    const onUpdate = jest.fn(() => {
      throw new Error('update handler failed');
    });
    const onWaiting = jest.fn(() => {
      throw new Error('waiting handler failed');
    });

    await expect(
      registerDesktopServiceWorker('/sw.js', { onUpdate, onWaiting, skipWaiting: true })
    ).resolves.toBe(asRegistration(registration));

    const installing = new FakeServiceWorker();
    registration.installing = installing;
    registration.emitUpdateFound();

    expect(() => installing.setState('installed')).not.toThrow();
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onWaiting).toHaveBeenCalledTimes(1);
    expect(installing.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });
});
