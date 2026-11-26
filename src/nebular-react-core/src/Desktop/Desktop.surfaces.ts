import type { DesktopDisplay, DesktopLayoutSnapshot, DesktopWindowState } from './Desktop.types';

const DEFAULT_SURFACE_FEATURES = 'popup,width=1280,height=800';
const DEFAULT_SURFACE_NAME_PREFIX = 'nebular-surface';
const DEFAULT_READY_TIMEOUT_MS = 10_000;

type FullscreenRequest = (this: unknown) => Promise<unknown> | unknown;

interface FullscreenElementLike {
  requestFullscreen?: FullscreenRequest;
  webkitRequestFullscreen?: FullscreenRequest;
  webkitRequestFullScreen?: FullscreenRequest;
  msRequestFullscreen?: FullscreenRequest;
  mozRequestFullScreen?: FullscreenRequest;
}

export interface DesktopSurfaceSession {
  display: DesktopDisplay;
  window: Window | null;
  /**
   * Resolves `true` once the popup finishes loading, or `false` when it is blocked,
   * closed or exceeds the configured timeout. It never stays pending forever.
   */
  ready: Promise<boolean>;
  /** Requests fullscreen for the popup document. Resolves `false` when blocked. */
  requestFullscreen(): Promise<boolean>;
  close(): void;
}

export interface DesktopSurfaceOpenOptions {
  /** Passed to `window.open`; defaults to `popup,width=1280,height=800`. */
  features?: string;
  /** Requests fullscreen automatically as soon as the popup is ready. */
  requestFullscreen?: boolean;
  /** Prefix for the popup window names; defaults to `nebular-surface`. */
  namePrefix?: string;
  /** Maximum time to wait for the popup `load` event before resolving `ready` as `false`. */
  readyTimeoutMs?: number;
  /** Called when the browser blocks the popup, so the host can offer a retry. */
  onBlocked?(display: DesktopDisplay): void;
  /** Called for every session created, including blocked popups. */
  onSession?(session: DesktopSurfaceSession): void;
}

/**
 * Requests fullscreen on the document that owns the given window.
 * Returns `false` in non-DOM environments or when the browser rejects the request.
 */
export async function requestDesktopSurfaceFullscreen(target: Window | null): Promise<boolean> {
  if (!target) {
    return false;
  }

  try {
    const doc = target.document;

    if (!doc) {
      return false;
    }

    const element = (doc.documentElement ?? doc.body) as unknown as FullscreenElementLike | null;

    if (!element) {
      return false;
    }

    const request =
      element.requestFullscreen ??
      element.webkitRequestFullscreen ??
      element.webkitRequestFullScreen ??
      element.msRequestFullscreen ??
      element.mozRequestFullScreen;

    if (typeof request !== 'function') {
      return false;
    }

    const result = await request.call(element as unknown as Element);

    // Some implementations resolve with `false` instead of rejecting when the
    // request is denied; keep both behaviors reportable as `false`.
    return result !== false;
  } catch {
    return false;
  }
}

function buildSurfaceUrl(url: string, displayId: string): string {
  try {
    const target = new URL(url, window.location.href);
    target.searchParams.set('surface', displayId);
    return target.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}surface=${encodeURIComponent(displayId)}`;
  }
}

function isPopupLoaded(popup: Window | null): boolean {
  if (!popup) {
    return false;
  }

  try {
    if (popup.closed) {
      return false;
    }

    const { readyState } = popup.document;

    // Browsers always expose a readyState; treating a missing one as loaded keeps
    // lightweight Window mocks and partially implemented DOM shims usable.
    return readyState === undefined || readyState === 'complete';
  } catch {
    return false;
  }
}

function createDesktopSurfaceSession(
  display: DesktopDisplay,
  popup: Window | null,
  options: { requestFullscreenOnReady: boolean; readyTimeoutMs: number }
): DesktopSurfaceSession {
  let settleReady: ((loaded: boolean) => void) | undefined;

  const ready = new Promise<boolean>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let doc: Document | null = null;
    const listeners: Array<{
      target: Window | Document;
      type: string;
      listener: EventListener;
    }> = [];

    const cleanup = () => {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }

      listeners.forEach(({ target, type, listener }) => {
        try {
          target.removeEventListener(type, listener);
        } catch {
          // The popup may already be gone (cross-origin or closed document).
        }
      });
      listeners.length = 0;
    };

    const finish = (loaded: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(loaded);
    };

    const addListener = (
      target: Window | Document | null,
      type: string,
      listener: EventListener
    ) => {
      if (!target) {
        return;
      }

      try {
        target.addEventListener(type, listener);
        listeners.push({ target, type, listener });
      } catch {
        // Cross-origin windows may refuse listeners; the timeout still settles `ready`.
      }
    };

    const handleLoad: EventListener = () => finish(true);
    const handleUnload: EventListener = () => finish(false);

    settleReady = finish;

    if (!popup) {
      finish(false);
      return;
    }

    try {
      if (popup.closed) {
        finish(false);
        return;
      }
    } catch {
      // Cross-origin windows may deny the `closed` read; fall through to listeners.
    }

    if (isPopupLoaded(popup)) {
      finish(true);
      return;
    }

    try {
      doc = popup.document;
    } catch {
      doc = null;
    }

    addListener(popup, 'load', handleLoad);
    addListener(popup, 'pagehide', handleUnload);
    addListener(popup, 'beforeunload', handleUnload);
    addListener(doc, 'load', handleLoad);
    timer = setTimeout(() => finish(false), options.readyTimeoutMs);
  });

  const session: DesktopSurfaceSession = {
    display,
    window: popup,
    ready,
    requestFullscreen: () => requestDesktopSurfaceFullscreen(popup),
    close: () => {
      settleReady?.(false);

      try {
        popup?.close();
      } catch {
        // Closing a cross-origin or already closed popup is a no-op.
      }
    }
  };

  if (options.requestFullscreenOnReady && popup) {
    if (isPopupLoaded(popup)) {
      requestDesktopSurfaceFullscreen(popup).catch(() => undefined);
    } else {
      ready
        .then((loaded) => (loaded ? requestDesktopSurfaceFullscreen(popup) : false))
        .catch(() => undefined);
    }
  }

  return session;
}

/**
 * Opens one auxiliary browser window per display. Browsers cannot position windows on a
 * specific monitor, so the user still needs to place each popup. Use
 * `createDesktopSurfaceBus` to synchronize layout snapshots.
 */
export function openDesktopSurfaces(
  displays: DesktopDisplay[],
  url: string,
  options: string | DesktopSurfaceOpenOptions = {}
): DesktopSurfaceSession[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const resolved: DesktopSurfaceOpenOptions =
    typeof options === 'string' ? { features: options } : options;
  const features = resolved.features ?? DEFAULT_SURFACE_FEATURES;
  const namePrefix = resolved.namePrefix ?? DEFAULT_SURFACE_NAME_PREFIX;
  const readyTimeoutMs = resolved.readyTimeoutMs ?? DEFAULT_READY_TIMEOUT_MS;
  const seenDisplays = new Set<string>();
  const sessions: DesktopSurfaceSession[] = [];

  displays.forEach((display) => {
    if (seenDisplays.has(display.id)) {
      return;
    }

    seenDisplays.add(display.id);

    let popup: Window | null = null;

    try {
      popup = window.open(
        buildSurfaceUrl(url, display.id),
        `${namePrefix}-${display.id}`,
        features
      );
    } catch {
      popup = null;
    }

    const session = createDesktopSurfaceSession(display, popup, {
      requestFullscreenOnReady: !!resolved.requestFullscreen,
      readyTimeoutMs: Math.max(0, readyTimeoutMs)
    });

    sessions.push(session);
    resolved.onSession?.(session);

    if (!popup) {
      resolved.onBlocked?.(display);
    }
  });

  return sessions;
}

export function getDesktopSurfaceDisplayId(location?: Pick<Location, 'search'>): string | null {
  const search = location?.search ?? (typeof window !== 'undefined' ? window.location.search : '');

  return new URLSearchParams(search).get('surface');
}

export interface DesktopSurfaceSyncResult {
  /** Active sessions after the reconciliation. */
  sessions: DesktopSurfaceSession[];
  /** Sessions created for newly connected displays. */
  opened: DesktopSurfaceSession[];
  /** Sessions closed because their displays are gone. */
  closed: DesktopSurfaceSession[];
}

/**
 * Reconciles open sessions with the current display list. Sessions for removed displays
 * are closed, sessions for known displays are preserved (same object identity) and new
 * displays are opened exactly once, even when the display list contains duplicate ids.
 */
export function syncDesktopSurfaces(
  sessions: DesktopSurfaceSession[],
  displays: DesktopDisplay[],
  open: (display: DesktopDisplay) => DesktopSurfaceSession
): DesktopSurfaceSyncResult {
  const displaysById = new Map<string, DesktopDisplay>();

  displays.forEach((display) => {
    if (!displaysById.has(display.id)) {
      displaysById.set(display.id, display);
    }
  });

  const nextSessions: DesktopSurfaceSession[] = [];
  const closed: DesktopSurfaceSession[] = [];
  const connected = new Set<string>();

  sessions.forEach((session) => {
    if (!displaysById.has(session.display.id)) {
      closed.push(session);

      try {
        session.close();
      } catch {
        // A session may already be closed by the popup itself.
      }

      return;
    }

    nextSessions.push(session);
    connected.add(session.display.id);
  });

  const opened: DesktopSurfaceSession[] = [];

  displaysById.forEach((display) => {
    if (connected.has(display.id)) {
      return;
    }

    const session = open(display);
    opened.push(session);
    nextSessions.push(session);
  });

  return { sessions: nextSessions, opened, closed };
}

/**
 * Moves windows whose `displayId` no longer exists to an available display
 * (`fallbackId`, then the primary display, then the first display). The input array
 * and its window objects are never mutated.
 */
export function reconcileDesktopWindowDisplays(
  windows: DesktopWindowState[],
  displays: DesktopDisplay[],
  fallbackId?: string
): DesktopWindowState[] {
  if (displays.length === 0) {
    return windows.slice();
  }

  const displayIds = new Set(displays.map((display) => display.id));
  const fallback =
    (fallbackId !== undefined
      ? displays.find((display) => display.id === fallbackId)
      : undefined) ??
    displays.find((display) => display.primary) ??
    displays[0];

  if (!fallback) {
    return windows.slice();
  }

  return windows.map((window) => {
    if (window.displayId === undefined || displayIds.has(window.displayId)) {
      return window;
    }

    return { ...window, displayId: fallback.id };
  });
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
