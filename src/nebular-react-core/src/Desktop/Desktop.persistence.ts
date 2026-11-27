import type {
  DesktopApp,
  DesktopLayoutScope,
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
      // Tabs carry React nodes (titles/icons/content) that cannot be revived from
      // JSON, so layouts persist the window shell and let the app recreate tabs.
      const {
        content: _content,
        icon: _icon,
        title,
        state,
        toolbar: _toolbar,
        footer: _footer,
        tabs: _tabs,
        activeTabId: _activeTabId,
        ...rest
      } = window;

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
    options?: { keepalive?: boolean; scope?: DesktopLayoutScope }
  ): Promise<{ revision?: string | number } | void>;
}

/**
 * Adapter for APIs with optimistic concurrency. The transport owns the HTTP details;
 * the adapter tracks the latest revision returned by load/save and sends it on writes.
 */
export function createVersionedLayoutAdapter(
  transport: VersionedLayoutTransport,
  options: { scope?: DesktopLayoutScope | (() => DesktopLayoutScope) } = {}
): DesktopPersistenceAdapter {
  let revision: string | number | undefined;
  const resolveScope = () =>
    typeof options.scope === 'function' ? options.scope() : options.scope;

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
      const scopeValue = resolveScope();
      const result = scopeValue
        ? await transport.save(snapshot, revision, { scope: scopeValue })
        : await transport.save(snapshot, revision);

      if (result && typeof result.revision !== 'undefined') {
        revision = result.revision;
      }
    },
    async flush(snapshot) {
      const scopeValue = resolveScope();
      const result = await transport.save(snapshot, revision, {
        keepalive: true,
        ...(scopeValue ? { scope: scopeValue } : {})
      });

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
  scope?: DesktopLayoutScope | (() => DesktopLayoutScope);
  /** Unwraps the API response into a desktop snapshot (defaults to the raw JSON). */
  transformLoad?(payload: unknown): DesktopLayoutSnapshot | null;
  /** Wraps a desktop snapshot into the API request body. */
  transformSave?(snapshot: DesktopLayoutSnapshot): unknown;
}

/**
 * @deprecated Prefer `createRestLayoutTransport` + `createVersionedLayoutAdapter`
 * when the API exposes a revision/ETag. This adapter remains for simple APIs that
 * store the snapshot without optimistic concurrency.
 */
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
      const resolvedScope = typeof scope === 'function' ? scope() : scope;
      params.push(`scope=${encodeURIComponent(resolvedScope)}`);
    }
    if (params.length === 0) {
      return url;
    }

    return `${url}${url.includes('?') ? '&' : '?'}${params.join('&')}`;
  };

  if (!request) {
    throw new Error('createRestLayoutAdapter requires a fetch implementation');
  }

  return {
    async load(signal) {
      const response = await request(withQuery(loadEndpoint ?? endpoint), {
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
      const response = await request(withQuery(saveEndpoint ?? endpoint), {
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
      const response = await request(withQuery(saveEndpoint ?? endpoint), {
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

export class DesktopLayoutRequestError extends Error {
  readonly status: number;
  readonly payload?: unknown;
  readonly revision?: string | number;
  readonly conflict: boolean;

  constructor(
    message: string,
    options: {
      status: number;
      payload?: unknown;
      revision?: string | number;
      conflict?: boolean;
    }
  ) {
    super(message);
    this.name = 'DesktopLayoutRequestError';
    this.status = options.status;
    this.payload = options.payload;
    this.revision = options.revision;
    this.conflict = options.conflict ?? (options.status === 409 || options.status === 412);
  }
}

export type RestLayoutQuery = Record<string, string | number | boolean | null | undefined>;

export interface RestLayoutTransportOptions {
  endpoint: string;
  /** Override the read endpoint (e.g. query API) while writes go to the command API. */
  loadEndpoint?: string;
  /** Override the write endpoint. */
  saveEndpoint?: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  method?: 'PUT' | 'POST' | 'PATCH';
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
  /** Extra query params (tenant, app, device, locale...) or a lazy getter. */
  query?: RestLayoutQuery | (() => RestLayoutQuery);
  /** Parses the load payload. Defaults to `{ snapshot: payload, revision: headers }`. */
  parseLoad?(
    payload: unknown,
    response: Response
  ): { snapshot: DesktopLayoutSnapshot | null; revision?: string | number } | null;
  /** Builds the save body. Defaults to `{ snapshot, revision }`. */
  buildBody?(
    snapshot: DesktopLayoutSnapshot,
    revision: string | number | undefined,
    options?: { scope?: DesktopLayoutScope; keepalive?: boolean }
  ): unknown;
  /** Parses the save payload. Defaults to revision headers. */
  parseSave?(payload: unknown, response: Response): { revision?: string | number } | void;
  /** Headers read for the current revision. Defaults to `X-Revision` and `ETag`. */
  revisionHeaders?: string[];
  /** Custom conflict detection. Defaults to HTTP 409/412. */
  isConflict?(response: Response, payload: unknown): boolean;
  /** Treat 404 as "no layout". Defaults to true. */
  notFoundIsEmpty?: boolean;
}

function appendQuery(url: string, query: RestLayoutQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const search = params.toString();

  if (!search) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}${search}`;
}

function readRevision(
  response: Response,
  payload: unknown,
  headers: string[]
): string | number | undefined {
  for (const header of headers) {
    const value = response.headers.get(header);

    if (value) {
      return value.replace(/^W\//, '').replace(/^"|"$/g, '');
    }
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as { revision?: unknown; version?: unknown };

    if (typeof candidate.revision === 'string' || typeof candidate.revision === 'number') {
      return candidate.revision;
    }
  }

  return undefined;
}

/**
 * Generic REST transport for optimistic-concurrency layout APIs.
 *
 * The host controls endpoints, query params, request body and payload parsing, so the
 * same helper works with different backends (Directory, standalone services, BFFs).
 */
export function createRestLayoutTransport({
  endpoint,
  loadEndpoint,
  saveEndpoint,
  headers,
  method = 'PUT',
  credentials = 'same-origin',
  fetch: fetchImpl,
  query,
  parseLoad,
  buildBody,
  parseSave,
  revisionHeaders = ['X-Revision', 'ETag'],
  isConflict,
  notFoundIsEmpty = true
}: RestLayoutTransportOptions): VersionedLayoutTransport {
  const request = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);

  if (!request) {
    throw new Error('createRestLayoutTransport requires a fetch implementation');
  }

  const resolveHeaders = (): Record<string, string> => ({
    Accept: 'application/json',
    ...(typeof headers === 'function' ? headers() : headers)
  });
  const resolveQuery = (): RestLayoutQuery =>
    typeof query === 'function' ? query() : (query ?? {});
  const withQuery = (url: string) => appendQuery(url, resolveQuery());
  const parsePayload = async (response: Response): Promise<unknown> => {
    if (response.status === 204) {
      return undefined;
    }

    const text = await response.text();

    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  };
  const isConflictResponse = (response: Response, payload: unknown) =>
    isConflict ? isConflict(response, payload) : response.status === 409 || response.status === 412;

  return {
    async load(signal) {
      const response = await request(withQuery(loadEndpoint ?? endpoint), {
        method: 'GET',
        headers: resolveHeaders(),
        credentials,
        signal
      });

      if (response.status === 404 && notFoundIsEmpty) {
        return null;
      }

      const payload = await parsePayload(response);

      if (!response.ok) {
        throw new DesktopLayoutRequestError(`Desktop layout load failed with ${response.status}`, {
          status: response.status,
          payload,
          revision: readRevision(response, payload, revisionHeaders),
          conflict: isConflictResponse(response, payload)
        });
      }

      if (parseLoad) {
        const parsed = parseLoad(payload, response);

        if (!parsed?.snapshot) {
          return null;
        }

        return {
          snapshot: parsed.snapshot,
          revision: parsed.revision ?? readRevision(response, payload, revisionHeaders)
        };
      }

      if (payload && typeof payload === 'object' && 'snapshot' in payload) {
        const candidate = payload as {
          snapshot: DesktopLayoutSnapshot | null;
          revision?: string | number;
        };

        if (!candidate.snapshot) {
          return null;
        }

        return {
          snapshot: candidate.snapshot,
          revision: candidate.revision ?? readRevision(response, payload, revisionHeaders)
        };
      }

      if (!payload || typeof payload !== 'object') {
        return null;
      }

      return {
        snapshot: payload as DesktopLayoutSnapshot,
        revision: readRevision(response, payload, revisionHeaders)
      };
    },

    async save(snapshot, revision, options) {
      const response = await request(withQuery(saveEndpoint ?? endpoint), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...resolveHeaders()
        },
        credentials,
        body: JSON.stringify(
          buildBody ? buildBody(snapshot, revision, options) : { snapshot, revision }
        ),
        keepalive: options?.keepalive
      });
      const payload = await parsePayload(response);

      if (!response.ok) {
        throw new DesktopLayoutRequestError(`Desktop layout save failed with ${response.status}`, {
          status: response.status,
          payload,
          revision: readRevision(response, payload, revisionHeaders),
          conflict: isConflictResponse(response, payload)
        });
      }

      if (parseSave) {
        return parseSave(payload, response) ?? undefined;
      }

      return { revision: readRevision(response, payload, revisionHeaders) };
    }
  };
}

export function createLocalStorageLayoutAdapter(storageKey: string): DesktopPersistenceAdapter {
  return createStorageLayoutAdapter(storageKey, 'local');
}

export function createSessionStorageLayoutAdapter(storageKey: string): DesktopPersistenceAdapter {
  return createStorageLayoutAdapter(storageKey, 'session');
}

export interface DesktopDeviceIdOptions {
  storageKey?: string;
  /** Storage override (for tests, SSR or alternative persistence). */
  storage?: Storage | null;
  /** Resolves storage lazily; ignored when `storage` is provided. */
  getStorage?(): Storage | null;
  /** Custom id generator. Defaults to `crypto.randomUUID()` with a fallback. */
  generate?(): string;
  /** Returned when no storage is available. Defaults to `shared`. */
  fallback?: string;
}

/**
 * Returns a stable device id. By default it persists in `localStorage`, but hosts can
 * inject any `Storage`, a custom generator or a fallback (SSR/native shells).
 */
export function getDesktopDeviceId(
  options: string | DesktopDeviceIdOptions = 'nebular-desktop-device-id'
): string {
  const config: DesktopDeviceIdOptions =
    typeof options === 'string' ? { storageKey: options } : options;
  const storageKey = config.storageKey ?? 'nebular-desktop-device-id';
  const fallback = config.fallback ?? 'shared';
  const storage =
    config.storage !== undefined ? config.storage : (config.getStorage?.() ?? getStorage('local'));

  if (!storage) {
    return fallback;
  }

  try {
    const existing = storage.getItem(storageKey);

    if (existing) {
      return existing;
    }
  } catch {
    return fallback;
  }

  const id =
    config.generate?.() ??
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

  try {
    storage.setItem(storageKey, id);
  } catch {
    // Storage may be disabled (private mode/quota); the id still works for this session.
  }

  return id;
}
