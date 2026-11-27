import { useCallback, useEffect, useState } from 'react';

export interface DesktopInstallPromptChoice {
  outcome: 'accepted' | 'dismissed';
  platform?: string;
}

export interface DesktopBeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<DesktopInstallPromptChoice>;
}

export interface UseInstallPromptResult {
  /** A `beforeinstallprompt` event is available. */
  canInstall: boolean;
  /** The app is already running installed/standalone. */
  installed: boolean;
  /** Opens the browser install prompt. */
  install(): Promise<'accepted' | 'dismissed' | 'unavailable'>;
  /** Ignores the current prompt until the browser fires a new one. */
  dismiss(): void;
}

export interface DesktopServiceWorkerOptions {
  scope?: string;
  updateViaCache?: ServiceWorkerUpdateViaCache;
  /** Calls `registration.update()` after a successful registration. */
  update?: boolean;
  /**
   * Called when a newly installed worker is waiting to activate because an older
   * worker still controls the page (an update is available).
   */
  onUpdate?(registration: ServiceWorkerRegistration): void;
  /**
   * Called together with `onUpdate` when the installed worker is waiting for
   * activation. Use it to show an "update available" prompt to the user.
   */
  onWaiting?(registration: ServiceWorkerRegistration): void;
  /** Sends `{ type: 'SKIP_WAITING' }` to the waiting worker. */
  skipWaiting?: boolean;
  /** Reloads the page once when a new worker takes control (`controllerchange`). */
  reloadOnUpdate?: boolean;
}

function safely(action: () => void): void {
  try {
    action();
  } catch {
    // Service worker callbacks must never break registration.
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.matchMedia?.('(display-mode: standalone)').matches) {
    return true;
  }

  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * Tracks the browser install prompt (PWA) and exposes a stable `install()` action.
 * The hook is SSR-safe and does nothing when the browser does not support installation.
 */
export function useInstallPrompt(): UseInstallPromptResult {
  const [promptEvent, setPromptEvent] = useState<DesktopBeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as DesktopBeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!promptEvent) {
      return 'unavailable';
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);

      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }

      return choice.outcome;
    } catch {
      setPromptEvent(null);
      return 'dismissed';
    }
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    setPromptEvent(null);
  }, []);

  return {
    canInstall: promptEvent !== null && !installed,
    installed,
    install,
    dismiss
  };
}

/**
 * Registers the service worker used for offline/PWA support. Returns `null` in
 * unsupported environments or when registration fails; failures never throw.
 */
export async function registerDesktopServiceWorker(
  url: string,
  options: DesktopServiceWorkerOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const container = navigator.serviceWorker;
    const registration = await container.register(url, {
      scope: options.scope,
      updateViaCache: options.updateViaCache
    });

    if (options.update) {
      safely(() => registration.update().catch(() => undefined));
    }

    if (options.reloadOnUpdate) {
      let reloaded = false;
      const handleControllerChange = () => {
        if (reloaded) {
          return;
        }

        reloaded = true;
        safely(() => window.location.reload());
      };

      safely(() => {
        if (typeof container.addEventListener === 'function') {
          container.addEventListener('controllerchange', handleControllerChange);
        } else {
          container.oncontrollerchange = handleControllerChange;
        }
      });
    }

    const watchedWorkers = new WeakSet<ServiceWorker>();
    const notifiedWorkers = new WeakSet<ServiceWorker>();

    const postSkipWaiting = (worker: ServiceWorker) => {
      safely(() => worker.postMessage({ type: 'SKIP_WAITING' }));
    };

    const notifyInstalled = (worker: ServiceWorker) => {
      if (worker.state !== 'installed' || notifiedWorkers.has(worker)) {
        return;
      }

      // Without a controller this is the first install, not an update.
      if (!container.controller) {
        return;
      }

      notifiedWorkers.add(worker);

      safely(() => options.onWaiting?.(registration));
      safely(() => options.onUpdate?.(registration));

      if (options.skipWaiting) {
        const waiting = registration.waiting ?? worker;

        if (waiting) {
          postSkipWaiting(waiting);
        }
      }
    };

    const watchWorker = (worker: ServiceWorker | null | undefined) => {
      if (!worker || watchedWorkers.has(worker)) {
        return;
      }

      watchedWorkers.add(worker);
      const handleStateChange = () => notifyInstalled(worker);

      safely(() => {
        if (typeof worker.addEventListener === 'function') {
          worker.addEventListener('statechange', handleStateChange);
        } else {
          worker.onstatechange = handleStateChange;
        }
      });

      // The worker may already be installed by the time it is observed.
      safely(() => notifyInstalled(worker));
    };

    const handleUpdateFound = () => {
      watchWorker(registration.installing ?? registration.waiting);
    };

    safely(() => {
      if (typeof registration.addEventListener === 'function') {
        registration.addEventListener('updatefound', handleUpdateFound);
      } else {
        registration.onupdatefound = handleUpdateFound;
      }
    });

    watchWorker(registration.installing);

    return registration;
  } catch {
    return null;
  }
}
