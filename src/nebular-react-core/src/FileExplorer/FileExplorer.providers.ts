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

export interface RestFileSystemProviderOptions {
  endpoint: string;
  headers?: Record<string, string> | (() => Record<string, string>);
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
  mapEntry?(entry: unknown): FileEntry;
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
 * REST contract:
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
 */
export function createRestFileSystemProvider({
  endpoint,
  headers,
  credentials = 'same-origin',
  fetch: fetchImpl,
  mapEntry
}: RestFileSystemProviderOptions): FileSystemProvider {
  const request = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);

  if (!request) {
    throw new Error('createRestFileSystemProvider requires a fetch implementation');
  }

  const base = endpoint.replace(/\/$/, '');
  const resolveHeaders = (): Record<string, string> =>
    typeof headers === 'function' ? headers() : (headers ?? {});
  const map = (entry: FileEntry) => (mapEntry ? mapEntry(entry) : entry);

  const json = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      throw new FileSystemError(`Request failed with ${response.status}`, {
        status: response.status
      });
    }

    return (await response.json()) as T;
  };

  return {
    async list(path, options) {
      const query = [
        `path=${encodeURIComponent(normalizePath(path))}`,
        ...getPaginationParams(options).map(([key, value]) => `${key}=${value}`)
      ].join('&');
      const response = await request(`${base}/entries?${query}`, {
        headers: resolveHeaders(),
        credentials,
        signal: options?.signal
      });
      return mapListResponse(await json<ListResponse | FileEntry[]>(response), map);
    },
    async search(query, options) {
      const params = new URLSearchParams({ q: query });
      if (options?.limit) {
        params.set('limit', String(options.limit));
      }
      getPaginationParams(options).forEach(([key, value]) => params.set(key, value));
      const response = await request(`${base}/search?${params.toString()}`, {
        headers: resolveHeaders(),
        credentials,
        signal: options?.signal
      });
      return mapListResponse(await json<ListResponse | FileEntry[]>(response), map);
    },
    async createFolder(parent, name) {
      const response = await request(`${base}/folders`, {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ parent, name })
      });
      return map(await json<FileEntry>(response));
    },
    async rename(path, name) {
      const response = await request(`${base}/entries`, {
        method: 'PATCH',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ path, name })
      });
      return map(await json<FileEntry>(response));
    },
    async remove(paths) {
      const response = await request(`${base}/entries`, {
        method: 'DELETE',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths })
      });

      if (!response.ok) {
        throw new FileSystemError(`Remove failed with ${response.status}`, {
          status: response.status
        });
      }
    },
    async move(paths, destination) {
      const response = await request(`${base}/move`, {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths, destination })
      });

      if (!response.ok) {
        throw new FileSystemError(`Move failed with ${response.status}`, {
          status: response.status
        });
      }
    },
    async copy(paths, destination) {
      const response = await request(`${base}/copy`, {
        method: 'POST',
        headers: { ...resolveHeaders(), 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ paths, destination })
      });

      if (!response.ok) {
        throw new FileSystemError(`Copy failed with ${response.status}`, {
          status: response.status
        });
      }
    },
    async upload(parent, files, options) {
      const form = new FormData();
      form.set('parent', parent);
      files.forEach((file) => form.append('files', file));
      const response = await request(`${base}/upload`, {
        method: 'POST',
        headers: resolveHeaders(),
        credentials,
        body: form,
        signal: options?.signal
      });
      const entries = await json<FileEntry[]>(response);
      options?.onProgress?.({ file: files[0], percent: 100 });
      return entries.map(map);
    },
    async download(path) {
      const response = await request(
        `${base}/download?path=${encodeURIComponent(normalizePath(path))}`,
        { headers: resolveHeaders(), credentials }
      );

      if (!response.ok) {
        throw new FileSystemError(`Download failed with ${response.status}`, {
          status: response.status
        });
      }

      return response.blob();
    }
  };
}
