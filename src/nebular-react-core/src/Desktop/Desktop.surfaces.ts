import type { DesktopDisplay, DesktopLayoutSnapshot } from './Desktop.types';

export interface DesktopSurfaceSession {
  display: DesktopDisplay;
  window: Window | null;
  close(): void;
}

/**
 * Experimental multi-surface helper: opens one auxiliary browser window per display.
 * Browsers cannot position windows on a specific monitor, so the user still needs to
 * place each popup. Use `createDesktopSurfaceBus` to synchronize layout snapshots.
 */
export function openDesktopSurfaces(
  displays: DesktopDisplay[],
  url: string,
  features = 'popup,width=1280,height=800'
): DesktopSurfaceSession[] {
  if (typeof window === 'undefined') {
    return [];
  }

  return displays.map((display) => {
    const target = new URL(url, window.location.href);
    target.searchParams.set('surface', display.id);
    const popup = window.open(target.toString(), `nebular-surface-${display.id}`, features);

    return {
      display,
      window: popup,
      close: () => popup?.close()
    };
  });
}

export function getDesktopSurfaceDisplayId(location?: Pick<Location, 'search'>): string | null {
  const search = location?.search ?? (typeof window !== 'undefined' ? window.location.search : '');

  return new URLSearchParams(search).get('surface');
}

export interface DesktopSurfaceBus {
  send(snapshot: DesktopLayoutSnapshot): void;
  subscribe(listener: (snapshot: DesktopLayoutSnapshot) => void): () => void;
  close(): void;
}

/**
 * Experimental BroadcastChannel bus for multi-surface synchronization.
 * The coordinator sends layout snapshots; auxiliary windows subscribe and apply them.
 */
export function createDesktopSurfaceBus(name = 'nebular-desktop-surfaces'): DesktopSurfaceBus {
  if (typeof BroadcastChannel === 'undefined') {
    return {
      send() {},
      subscribe() {
        return () => undefined;
      },
      close() {}
    };
  }

  const channel = new BroadcastChannel(name);
  const listeners = new Set<(snapshot: DesktopLayoutSnapshot) => void>();
  channel.addEventListener('message', (event) => {
    const snapshot = event.data as DesktopLayoutSnapshot;
    if (snapshot && Array.isArray(snapshot.windows)) {
      listeners.forEach((listener) => listener(snapshot));
    }
  });

  return {
    send(snapshot) {
      channel.postMessage(snapshot);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close() {
      listeners.clear();
      channel.close();
    }
  };
}
