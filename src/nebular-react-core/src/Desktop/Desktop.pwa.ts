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
    const registration = await navigator.serviceWorker.register(url, {
      scope: options.scope,
      updateViaCache: options.updateViaCache
    });

    if (options.update) {
      registration.update().catch(() => undefined);
    }

    return registration;
  } catch {
    return null;
  }
}
