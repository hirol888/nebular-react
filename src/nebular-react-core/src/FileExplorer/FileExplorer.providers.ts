import type {
  FileEntry,
  FileListOptions,
  FileListResponse,
  FileListResult,
  FileSearchOptions,
  FileSystemProvider,
  FileUploadProgress
} from './FileExplorer.types';

export class FileSystemError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, options: { status?: number; code?: string } = {}) {
    super(message);
    this.name = 'FileSystemError';
    this.status = options.status;
    this.code = options.code;
  }
}

export function normalizePath(path: string): string {
  const normalized = `/${path ?? ''}`.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
  return normalized || '/';
}

export function parentPath(path: string): string {
  const normalized = normalizePath(path);

  if (normalized === '/') {
    return '/';
  }

  const index = normalized.lastIndexOf('/');
  return index <= 0 ? '/' : normalized.slice(0, index);
}

export function joinPath(base: string, name: string): string {
  const normalizedBase = normalizePath(base);
  const normalizedName = name.replace(/[/\\]+/g, '-').trim();
  return normalizePath(
    normalizedBase === '/' ? `/${normalizedName}` : `${normalizedBase}/${normalizedName}`
  );
}

export function pathSegments(path: string): { name: string; path: string }[] {
  const normalized = normalizePath(path);

  if (normalized === '/') {
    return [];
  }

  return normalized
    .split('/')
    .filter(Boolean)
    .map((segment, index, segments) => ({
      name: segment,
      path: `/${segments.slice(0, index + 1).join('/')}`
    }));
}

function createId(prefix = 'entry'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function entryParent(entry: FileEntry): string {
  return parentPath(entry.path);
}

export interface MemoryFileSystemProvider extends FileSystemProvider {
  entries(): FileEntry[];
}

interface MemoryTrashRecord {
  root: FileEntry;
  entries: FileEntry[];
}

/**
 * In-memory provider used by stories, tests and prototypes.
 * Paths are canonical (`/`, `/Documents`, `/Documents/file.txt`).
 */
export function createMemoryFileSystemProvider(seed: FileEntry[] = []): MemoryFileSystemProvider {
  const entries = new Map<string, FileEntry>();
  const trashed = new Map<string, MemoryTrashRecord>();

  seed.forEach((entry) => {
    const path = normalizePath(entry.path);
    entries.set(path, { ...entry, path });
  });

  const children = (path: string) =>
    Array.from(entries.values()).filter((entry) => entryParent(entry) === normalizePath(path));

  const removeTree = (path: string) => {
    const normalized = normalizePath(path);

    entries.forEach((entry) => {
      if (entry.path === normalized || entry.path.startsWith(`${normalized}/`)) {
        entries.delete(entry.path);
      }
    });
  };

  const moveTree = (from: string, to: string) => {
    const source = normalizePath(from);
    const destination = normalizePath(to);

    Array.from(entries.values())
      .filter((entry) => entry.path === source || entry.path.startsWith(`${source}/`))
      .sort((first, second) => first.path.length - second.path.length)
      .forEach((entry) => {
        const nextPath = normalizePath(entry.path.replace(source, destination));
        entries.delete(entry.path);
        entries.set(nextPath, {
          ...entry,
          path: nextPath,
          name: nextPath === destination ? entry.name : entry.name
        });
      });
  };

  return {
    entries() {
      return Array.from(entries.values());
    },
    async list(path, _options?: FileListOptions) {
      return children(path).sort((first, second) => {
        if (first.type !== second.type) {
          return first.type === 'folder' ? -1 : 1;
        }
        return first.name.localeCompare(second.name);
      });
    },
    async search(query, options?: FileSearchOptions) {
      const normalized = query.trim().toLowerCase();
      const limit = options?.limit ?? 200;

      return Array.from(entries.values())
        .filter((entry) => entry.name.toLowerCase().includes(normalized))
        .slice(0, limit);
    },
    async createFolder(parent, name) {
      const path = joinPath(parent, name);

      if (entries.has(path)) {
        throw new FileSystemError(`Entry already exists: ${path}`, { code: 'EEXIST' });
      }

      const entry: FileEntry = {
        id: createId('folder'),
        name: name.trim(),
        path,
        type: 'folder',
        modifiedAt: new Date().toISOString()
      };
      entries.set(path, entry);
      return entry;
    },
    async rename(path, name) {
      const target = entries.get(normalizePath(path));

      if (!target) {
        throw new FileSystemError(`Entry not found: ${path}`, { code: 'ENOENT' });
      }

      const nextPath = joinPath(parentPath(target.path), name);

      if (entries.has(nextPath)) {
        throw new FileSystemError(`Entry already exists: ${nextPath}`, { code: 'EEXIST' });
      }

      if (target.type === 'folder') {
        moveTree(target.path, nextPath);
      }

      entries.delete(target.path);
      const renamed = { ...target, name: name.trim(), path: nextPath };
      entries.set(nextPath, renamed);
      return renamed;
    },
    async remove(paths) {
      paths.forEach(removeTree);
    },
    async trash(paths) {
      paths.forEach((path) => {
        const normalized = normalizePath(path);
        const snapshot = Array.from(entries.values())
          .filter((entry) => entry.path === normalized || entry.path.startsWith(`${normalized}/`))
          .map((entry) => ({ ...entry }));
        const root = snapshot.find((entry) => entry.path === normalized);

        if (!root) {
          return;
        }

        trashed.set(normalized, { root, entries: snapshot });
        removeTree(normalized);
      });
    },
    async restore(paths) {
      paths.forEach((path) => {
        const key = normalizePath(path);
        const record = trashed.get(key);

        if (!record) {
          return;
        }

        trashed.delete(key);
        record.entries.forEach((entry) => entries.set(entry.path, { ...entry }));
      });
    },
    async listTrash() {
      return Array.from(trashed.values()).map((record) => ({ ...record.root }));
    },
    async emptyTrash() {
      trashed.clear();
    },
    async move(paths, destinationPath) {
      paths.forEach((path) => {
        const source = normalizePath(path);
        const destination = normalizePath(destinationPath);
        const entry = entries.get(source);

        if (!entry) {
          return;
        }

        if (entry.type === 'folder' && destination.startsWith(`${source}/`)) {
          throw new FileSystemError('Cannot move a folder inside itself', {
            code: 'EINVAL'
          });
        }

        const target = joinPath(destination, entry.name);
        moveTree(source, target);
        const moved = entries.get(target);
        if (moved) {
          entries.set(target, { ...moved, path: target, name: entry.name });
        }
      });
    },
    async copy(paths, destinationPath) {
      paths.forEach((path) => {
        const source = normalizePath(path);
        const destination = normalizePath(destinationPath);
        const entry = entries.get(source);

        if (!entry) {
          return;
        }

        const target = joinPath(destination, entry.name);
        const clones = Array.from(entries.values()).filter(
          (candidate) => candidate.path === source || candidate.path.startsWith(`${source}/`)
        );

        clones
          .sort((first, second) => first.path.length - second.path.length)
          .forEach((candidate) => {
            const nextPath = normalizePath(candidate.path.replace(source, target));
            entries.set(nextPath, {
              ...candidate,
              id: createId(candidate.type),
              path: nextPath
            });
          });
      });
    },
    async upload(
      parent,
      files,
      options?: {
        signal?: AbortSignal;
        onProgress?(progress: FileUploadProgress): void;
      }
    ) {
      const uploaded: FileEntry[] = [];

      for (const file of files) {
        if (options?.signal?.aborted) {
          break;
        }

        const entry: FileEntry = {
          id: createId('file'),
          name: file.name,
          path: joinPath(parent, file.name),
          type: 'file',
          size: file.size,
          mimeType: file.type,
          modifiedAt: new Date(file.lastModified || Date.now()).toISOString(),
          url:
            typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
              ? URL.createObjectURL(file)
              : undefined
        };
        entries.set(entry.path, entry);
        uploaded.push(entry);
        options?.onProgress?.({ file, percent: 100 });
      }

      return uploaded;
    },
    async download(path) {
      const entry = entries.get(normalizePath(path));

      if (!entry?.url) {
        throw new FileSystemError('Download is not available for this entry', {
          code: 'ENOTSUP'
        });
      }

      return (await fetch(entry.url)).blob();
    }
  };
}

export interface RestFileSystemRoutes {
  list: string;
  search: string;
  folders: string;
  entries: string;
  move: string;
  copy: string;
  upload: string;
  download: string;
  trash: string;
  restore: string;
  trashList: string;
  emptyTrash: string;
}

export type RestFileSystemQuery = Record<string, string | number | boolean | null | undefined>;

export interface RestFileSystemProviderOptions {
  endpoint: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
  mapEntry?(entry: unknown): FileEntry;
  /** Overrides individual endpoint paths (relative to `endpoint`). */
  routes?: Partial<RestFileSystemRoutes>;
  /** Extra query params for GET requests (tenant, app, locale...). */
  query?: RestFileSystemQuery | (() => RestFileSystemQuery);
  /** Custom list/search parser. */
  parseList?(payload: unknown): FileListResponse;
  /** Custom single-entry parser. */
  parseEntry?(payload: unknown): FileEntry;
  /** Custom upload parser. */
  parseUpload?(payload: unknown): FileEntry[];
  /** Maps a failed response to a domain error. */
  mapError?(response: Response, payload: unknown): FileSystemError | undefined;
}

interface ListResponse {
  entries?: FileEntry[];
  total?: number;
  hasMore?: boolean;
  has_more?: boolean;
}

/**
 * Keeps backward compatibility: payloads without pagination metadata still
 * resolve to a plain array, while paginated payloads expose total/hasMore.
 */
function resolveEntries(payload: FileEntry[] | ListResponse): FileListResponse {
  if (Array.isArray(payload)) {
    return payload;
  }

  const entries = payload.entries ?? [];
  const hasMore = payload.hasMore ?? payload.has_more;

  if (payload.total === undefined && hasMore === undefined) {
    return entries;
  }

  const result: FileListResult = { entries };

  if (payload.total !== undefined) {
    result.total = payload.total;
  }

  if (hasMore !== undefined) {
    result.hasMore = hasMore;
  }

  return result;
}

function getPaginationParams(options?: FileListOptions): [string, string][] {
  const params: [string, string][] = [];

  if (options?.page !== undefined) {
    params.push(['page', String(options.page)]);
  }

  if (options?.pageSize !== undefined) {
    params.push(['pageSize', String(options.pageSize)]);
  }

  return params;
}

function mapListResponse(
  payload: FileEntry[] | ListResponse,
  map: (entry: FileEntry) => FileEntry
): FileListResponse {
  const response = resolveEntries(payload);
  return Array.isArray(response)
    ? response.map(map)
    : { ...response, entries: response.entries.map(map) };
}

/**
 * REST contract (default routes, all customizable through `routes`):
 * GET    {endpoint}/entries?path=/Documents[&page=0&pageSize=50]
 *        -> FileEntry[] | { entries, total?, hasMore? }
 * GET    {endpoint}/search?q=foo&limit=50[&page&pageSize]
 *        -> FileEntry[] | { entries, total?, hasMore? }
 * POST   {endpoint}/folders   { parent, name }    -> FileEntry
 * PATCH  {endpoint}/entries   { path, name }      -> FileEntry
 * DELETE {endpoint}/entries   { paths }           -> 204
 * POST   {endpoint}/move      { paths, destination }
 * POST   {endpoint}/copy      { paths, destination }
 * POST   {endpoint}/upload    multipart form      -> FileEntry[]
 * GET    {endpoint}/download?path=/file           -> Blob
 *
 * Trash endpoints are only enabled when the corresponding route is provided.
 */
export function createRestFileSystemProvider(
  options: RestFileSystemProviderOptions
): FileSystemProvider {
  const {
    endpoint,
    headers,
    credentials = 'same-origin',
    fetch: fetchImpl,
    mapEntry,
    routes: routeOverrides,
    query,
    parseList,
    parseEntry,
    parseUpload,
    mapError
  } = options;
  const request = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);

  if (!request) {
    throw new Error('createRestFileSystemProvider requires a fetch implementation');
  }

  const base = endpoint.replace(/\/$/, '');
  const routes: RestFileSystemRoutes = {
    list: '/entries',
    search: '/search',
    folders: '/folders',
    entries: '/entries',
    move: '/move',
    copy: '/copy',
    upload: '/upload',
    download: '/download',
    trash: '/trash',
    restore: '/restore',
    trashList: '/trash',
    emptyTrash: '/trash',
    ...routeOverrides
  };
  const route = (path: string) => `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const resolveHeaders = (): Record<string, string> =>
    typeof headers === 'function' ? headers() : (headers ?? {});
  const resolveQuery = (): RestFileSystemQuery =>
    typeof query === 'function' ? query() : (query ?? {});
  const map = (entry: FileEntry) => (mapEntry ? mapEntry(entry) : entry);
  const withQuery = (url: string): string => {
    const params = new URLSearchParams();

    Object.entries(resolveQuery()).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    const search = params.toString();

    if (!search) {
      return url;
    }

    return `${url}${url.includes('?') ? '&' : '?'}${search}`;
  };
  const parsePayload = async (response: Response): Promise<unknown> => {
    if (response.status === 204) {
      return undefined;
    }

    if (typeof response.text !== 'function' && typeof response.json === 'function') {
      return response.json();
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
  const fail = async (response: Response, action: string): Promise<never> => {
    const payload = await parsePayload(response);
    const mapped = mapError?.(response, payload);

    if (mapped) {
      throw mapped;
    }

    throw new FileSystemError(`${action} failed with ${response.status}`, {
      status: response.status
    });
  };
  const jsonResponse = async <T>(response: Response, action: string): Promise<T> => {
    if (!response.ok) {
      await fail(response, action);
    }

    return (await parsePayload(response)) as T;
  };
  const parseEntries = (payload: unknown): FileListResponse =>
    parseList ? parseList(payload) : resolveEntries(payload as FileEntry[] | ListResponse);
  const parseSingleEntry = (payload: unknown): FileEntry =>
    parseEntry ? parseEntry(payload) : (payload as FileEntry);
  const parseBody = (response: Response, action: string) => jsonResponse<unknown>(response, action);

  const provider: FileSystemProvider = {
    async list(path, listOptions) {
      const params = new URLSearchParams({ path: normalizePath(path) });
      getPaginationParams(listOptions).forEach(([key, value]) => params.set(key, value));
      const response = await request(withQuery(`${route(routes.list)}?${params.toString()}`), {
        headers: resolveHeaders(),
        credentials,
        signal: listOptions?.signal
      });
      const payload = await parseBody(response, 'List');
      return mapListResponse(parseEntries(payload) as FileEntry[] | ListResponse, map);
    },
    async search(searchQuery, searchOptions) {
      const params = new URLSearchParams({ q: searchQuery });

      if (searchOptions?.limit) {
        params.set('limit', String(searchOptions.limit));
      }

      getPaginationParams(searchOptions).forEach(([key, value]) => params.set(key, value));

      const response = await request(withQuery(`${route(routes.search)}?${params.toString()}`), {
        headers: resolveHeaders(),
        credentials,
        signal: searchOptions?.signal
      });
      const payload = await parseBody(response, 'Search');
      return mapListResponse(parseEntries(payload) as FileEntry[] | ListResponse, map);
    },
    async createFolder(parent, name) {
      const response = await request(route(routes.folders), {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ parent, name })
      });
      return map(parseSingleEntry(await parseBody(response, 'Create folder')));
    },
    async rename(path, name) {
      const response = await request(route(routes.entries), {
        method: 'PATCH',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ path, name })
      });
      return map(parseSingleEntry(await parseBody(response, 'Rename')));
    },
    async remove(paths) {
      const response = await request(route(routes.entries), {
        method: 'DELETE',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths })
      });

      if (!response.ok) {
        await fail(response, 'Remove');
      }
    },
    async move(paths, destination) {
      const response = await request(route(routes.move), {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths, destination })
      });

      if (!response.ok) {
        await fail(response, 'Move');
      }
    },
    async copy(paths, destination) {
      const response = await request(route(routes.copy), {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths, destination })
      });

      if (!response.ok) {
        await fail(response, 'Copy');
      }
    },
    async upload(parent, files, uploadOptions) {
      const form = new FormData();
      form.set('parent', parent);
      files.forEach((file) => form.append('files', file));
      const response = await request(route(routes.upload), {
        method: 'POST',
        headers: resolveHeaders(),
        credentials,
        body: form,
        signal: uploadOptions?.signal
      });
      const payload = await parseBody(response, 'Upload');
      const entries = parseUpload ? parseUpload(payload) : (payload as FileEntry[]);
      uploadOptions?.onProgress?.({ file: files[0], percent: 100 });
      return entries.map(map);
    },
    async download(path) {
      const response = await request(
        withQuery(`${route(routes.download)}?path=${encodeURIComponent(normalizePath(path))}`),
        { headers: resolveHeaders(), credentials }
      );

      if (!response.ok) {
        await fail(response, 'Download');
      }

      return response.blob();
    }
  };

  if (routeOverrides?.trash) {
    provider.trash = async (paths) => {
      const response = await request(route(routes.trash), {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths })
      });

      if (!response.ok) {
        await fail(response, 'Trash');
      }
    };
  }

  if (routeOverrides?.restore) {
    provider.restore = async (paths) => {
      const response = await request(route(routes.restore), {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths })
      });

      if (!response.ok) {
        await fail(response, 'Restore');
      }
    };
  }

  if (routeOverrides?.trashList) {
    provider.listTrash = async () => {
      const response = await request(withQuery(route(routes.trashList)), {
        headers: resolveHeaders(),
        credentials
      });
      const payload = await parseBody(response, 'List trash');
      const result = parseEntries(payload);
      return (Array.isArray(result) ? result : result.entries).map(map);
    };
  }

  if (routeOverrides?.emptyTrash) {
    provider.emptyTrash = async () => {
      const response = await request(route(routes.emptyTrash), {
        method: 'DELETE',
        headers: resolveHeaders(),
        credentials
      });

      if (!response.ok) {
        await fail(response, 'Empty trash');
      }
    };
  }

  return provider;
}
