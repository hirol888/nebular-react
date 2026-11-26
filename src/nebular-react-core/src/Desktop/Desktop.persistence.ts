import type {
  DesktopApp,
  DesktopLayoutSnapshot,
  DesktopPersistenceAdapter,
  DesktopWindowSnapshot,
  DesktopWindowState,
  DesktopWorkspace,
  DesktopWorkspaceSnapshot
} from './Desktop.types';
import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from './Desktop.utils';

export interface SerializeDesktopLayoutOptions {
  workspaces?: DesktopWorkspace[];
  activeWorkspace?: string;
}

function cloneJson<T>(value: T): T | undefined {
  if (value === undefined) {
    return undefined;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return undefined;
  }
}

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function serializeDesktopLayout(
  windows: DesktopWindowState[],
  options: SerializeDesktopLayoutOptions = {}
): DesktopLayoutSnapshot {
  const workspaces: DesktopWorkspaceSnapshot[] | undefined = options.workspaces?.map(
    (workspace) => ({ id: workspace.id, title: workspace.title })
  );

  return {
    version: 2,
    savedAt: new Date().toISOString(),
    activeWorkspace: options.activeWorkspace,
    workspaces,
    windows: windows.map((window) => {
      const { content: _content, icon: _icon, title, state, ...rest } = window;

      return {
        ...rest,
        title: typeof title === 'string' ? title : undefined,
        state: cloneJson(state)
      } satisfies DesktopWindowSnapshot;
    })
  };
}

export function deserializeDesktopLayout(
  snapshot: DesktopLayoutSnapshot | null | undefined,
  apps: DesktopApp[]
): {
  windows: DesktopWindowState[];
  workspaces?: DesktopWorkspaceSnapshot[];
  activeWorkspace?: string;
} | null {
  if (!snapshot || !Array.isArray(snapshot.windows)) {
    return null;
  }

  const appsById = new Map(apps.map((app) => [app.id, app]));

  return {
    activeWorkspace:
      typeof snapshot.activeWorkspace === 'string' ? snapshot.activeWorkspace : undefined,
    workspaces: Array.isArray(snapshot.workspaces)
      ? snapshot.workspaces
          .filter(
            (workspace) =>
              workspace && typeof workspace.id === 'string' && typeof workspace.title === 'string'
          )
          .map((workspace) => ({ id: workspace.id, title: workspace.title }))
      : undefined,
    windows: snapshot.windows
      .filter((window) => !!window && typeof window.id === 'string')
      .map((window) => {
        const app = window.appId ? appsById.get(window.appId) : undefined;

        return {
          ...window,
          x: finite(window.x, 48),
          y: finite(window.y, 48),
          width: Math.max(1, finite(window.width, DEFAULT_WINDOW_WIDTH)),
          height: Math.max(1, finite(window.height, DEFAULT_WINDOW_HEIGHT)),
          zIndex: finite(window.zIndex, 0),
          minimized: !!window.minimized,
          maximized: !!window.maximized,
          title: window.title ?? app?.title,
          state: window.state ?? app?.defaultState,
          content: app?.content
        } satisfies DesktopWindowState;
      })
  };
}

function getStorage(kind: 'local' | 'session'): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function parseSnapshot(raw: string | null): DesktopLayoutSnapshot | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DesktopLayoutSnapshot | { version?: number; windows?: [] };

    if (!parsed || !Array.isArray(parsed.windows)) {
      return null;
    }

    return { ...parsed, version: 2 } as DesktopLayoutSnapshot;
  } catch {
    return null;
  }
}

export function createStorageLayoutAdapter(
  storageKey: string,
  kind: 'local' | 'session' = 'local'
): DesktopPersistenceAdapter {
  return {
    load() {
      return parseSnapshot(getStorage(kind)?.getItem(storageKey) ?? null);
    },
    save(snapshot) {
      getStorage(kind)?.setItem(storageKey, JSON.stringify(snapshot));
    },
    flush(snapshot) {
      getStorage(kind)?.setItem(storageKey, JSON.stringify(snapshot));
    },
    clear() {
      getStorage(kind)?.removeItem(storageKey);
    }
  };
}

export function createMemoryLayoutAdapter(
  initial: DesktopLayoutSnapshot | null = null
): DesktopPersistenceAdapter & { snapshot(): DesktopLayoutSnapshot | null } {
  let snapshot = cloneJson(initial) ?? null;

  return {
    load() {
      return cloneJson(snapshot) ?? null;
    },
    save(next) {
      snapshot = cloneJson(next) ?? null;
    },
    flush(next) {
      snapshot = cloneJson(next) ?? null;
    },
    clear() {
      snapshot = null;
    },
    snapshot() {
      return cloneJson(snapshot) ?? null;
    }
  };
}

export interface BroadcastLayoutAdapter extends DesktopPersistenceAdapter {
  subscribe(listener: (snapshot: DesktopLayoutSnapshot) => void): () => void;
}

/**
 * Experimental adapter that shares layout snapshots between same-origin tabs/windows
 * using BroadcastChannel. Useful for the multi-surface mode.
 */
export function createBroadcastLayoutAdapter(
  name = 'nebular-desktop-layout',
  initial: DesktopLayoutSnapshot | null = null
): BroadcastLayoutAdapter {
  let snapshot = cloneJson(initial) ?? null;
  const listeners = new Set<(value: DesktopLayoutSnapshot) => void>();
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(name) : null;

  const publish = (next: DesktopLayoutSnapshot) => {
    snapshot = cloneJson(next) ?? null;

    if (snapshot) {
      channel?.postMessage(snapshot);
      listeners.forEach((listener) => listener(snapshot as DesktopLayoutSnapshot));
    }
  };

  channel?.addEventListener('message', (event) => {
    const next = event.data as DesktopLayoutSnapshot;

    if (next && Array.isArray(next.windows)) {
      snapshot = next;
      listeners.forEach((listener) => listener(next));
    }
  });

  return {
    load() {
      return cloneJson(snapshot) ?? null;
    },
    save: publish,
    flush: publish,
    clear() {
      snapshot = null;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export interface VersionedLayoutTransport {
  load?(signal?: AbortSignal): Promise<{
    snapshot: DesktopLayoutSnapshot;
    revision?: string | number;
  } | null>;
  save(
    snapshot: DesktopLayoutSnapshot,
    revision?: string | number,
    options?: { keepalive?: boolean }
  ): Promise<{ revision?: string | number } | void>;
}

/**
 * Adapter for APIs with optimistic concurrency. The transport owns the HTTP details;
 * the adapter tracks the latest revision returned by load/save and sends it on writes.
 */
export function createVersionedLayoutAdapter(
  transport: VersionedLayoutTransport
): DesktopPersistenceAdapter {
  let revision: string | number | undefined;

  return {
    async load(signal) {
      const result = await transport.load?.(signal);

      if (!result) {
        return null;
      }

      revision = result.revision;
      return result.snapshot;
    },
    async save(snapshot) {
      const result = await transport.save(snapshot, revision);

      if (result && typeof result.revision !== 'undefined') {
        revision = result.revision;
      }
    },
    async flush(snapshot) {
      const result = await transport.save(snapshot, revision, { keepalive: true });

      if (result && typeof result.revision !== 'undefined') {
        revision = result.revision;
      }
    }
  };
}

export interface RestLayoutAdapterOptions {
  endpoint: string;
  /** Override the read endpoint (e.g. query API) while writes go to the command API. */
  loadEndpoint?: string;
  /** Override the write endpoint. */
  saveEndpoint?: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  method?: 'PUT' | 'POST';
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
  deviceId?: string;
  scope?: 'device' | 'shared';
  /** Unwraps the API response into a desktop snapshot (defaults to the raw JSON). */
  transformLoad?(payload: unknown): DesktopLayoutSnapshot | null;
  /** Wraps a desktop snapshot into the API request body. */
  transformSave?(snapshot: DesktopLayoutSnapshot): unknown;
}

export function createRestLayoutAdapter({
  endpoint,
  loadEndpoint,
  saveEndpoint,
  headers,
  method = 'PUT',
  credentials = 'same-origin',
  fetch: fetchImpl,
  deviceId,
  scope,
  transformLoad,
  transformSave
}: RestLayoutAdapterOptions): DesktopPersistenceAdapter {
  const resolveHeaders = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(typeof headers === 'function' ? headers() : headers)
  });
  const request = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);
  const withQuery = (url: string): string => {
    const params: string[] = [];

    if (deviceId) {
      params.push(`deviceId=${encodeURIComponent(deviceId)}`);
    }
    if (scope) {
      params.push(`scope=${encodeURIComponent(scope)}`);
    }
    if (params.length === 0) {
      return url;
    }

    return `${url}${url.includes('?') ? '&' : '?'}${params.join('&')}`;
  };
  const readUrl = withQuery(loadEndpoint ?? endpoint);
  const writeUrl = withQuery(saveEndpoint ?? endpoint);

  if (!request) {
    throw new Error('createRestLayoutAdapter requires a fetch implementation');
  }

  return {
    async load(signal) {
      const response = await request(readUrl, {
        method: 'GET',
        headers: resolveHeaders(),
        credentials,
        signal
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Desktop layout load failed with ${response.status}`);
      }

      const payload = (await response.json()) as unknown;
      return transformLoad ? transformLoad(payload) : (payload as DesktopLayoutSnapshot);
    },
    async save(snapshot) {
      const response = await request(writeUrl, {
        method,
        headers: resolveHeaders(),
        credentials,
        body: JSON.stringify(transformSave ? transformSave(snapshot) : snapshot)
      });

      if (!response.ok) {
        throw new Error(`Desktop layout save failed with ${response.status}`);
      }
    },
    async flush(snapshot) {
      const response = await request(writeUrl, {
        method,
        headers: resolveHeaders(),
        credentials,
        body: JSON.stringify(transformSave ? transformSave(snapshot) : snapshot),
        keepalive: true
      });

      if (!response.ok) {
        throw new Error(`Desktop layout flush failed with ${response.status}`);
      }
    }
  };
}

export function createLocalStorageLayoutAdapter(storageKey: string): DesktopPersistenceAdapter {
  return createStorageLayoutAdapter(storageKey, 'local');
}

export function createSessionStorageLayoutAdapter(storageKey: string): DesktopPersistenceAdapter {
  return createStorageLayoutAdapter(storageKey, 'session');
}

export function getDesktopDeviceId(storageKey = 'nebular-desktop-device-id'): string {
  const storage = getStorage('local');

  if (!storage) {
    return 'shared';
  }

  const existing = storage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  storage.setItem(storageKey, id);
  return id;
}
