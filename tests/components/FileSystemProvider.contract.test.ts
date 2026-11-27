import {
  createMemoryFileSystemProvider,
  createRestFileSystemProvider,
  joinPath,
  normalizePath,
  parentPath,
  type FileEntry,
  type FileListResponse,
  type FileSystemProvider
} from '@nebular-react/core';

function entriesOf(list: FileListResponse | undefined): FileEntry[] {
  if (!list) {
    return [];
  }

  return Array.isArray(list) ? list : list.entries;
}

function mockResponse(body: unknown, status = 200): Response {
  const text = body === undefined ? '' : JSON.stringify(body);

  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: () => null },
    text: async () => text,
    json: async () => JSON.parse(text) as unknown,
    blob: async () => new Blob([text])
  } as unknown as Response;
}

function seedEntries(): FileEntry[] {
  return [
    { id: 'docs', name: 'docs', path: '/docs', type: 'folder' },
    { id: 'readme', name: 'readme.txt', path: '/readme.txt', type: 'file', size: 4 }
  ];
}

function createRestProvider(): FileSystemProvider {
  let entries = new Map(seedEntries().map((entry) => [entry.path, entry]));
  const trash = new Map<string, FileEntry>();
  let id = 0;
  const nextId = (prefix: string) => `${prefix}-${++id}`;
  const children = (path: string) =>
    Array.from(entries.values()).filter((entry) => parentPath(entry.path) === normalizePath(path));
  const removePaths = (paths: string[]) => {
    const normalized = new Set(paths.map(normalizePath));
    entries = new Map(Array.from(entries.entries()).filter(([path]) => !normalized.has(path)));
  };
  const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const path = url.pathname;
    const method = (init?.method ?? 'GET').toUpperCase();
    const body = init?.body && typeof init.body === 'string' ? JSON.parse(init.body) : undefined;

    if (method === 'GET' && path.endsWith('/entries')) {
      return mockResponse(children(url.searchParams.get('path') ?? '/'));
    }

    if (method === 'GET' && path.endsWith('/search')) {
      const query = (url.searchParams.get('q') ?? '').toLowerCase();
      return mockResponse(
        Array.from(entries.values()).filter((entry) => entry.name.includes(query))
      );
    }

    if (method === 'POST' && path.endsWith('/folders')) {
      const entry: FileEntry = {
        id: nextId('folder'),
        name: body.name,
        path: joinPath(body.parent, body.name),
        type: 'folder'
      };
      entries.set(entry.path, entry);
      return mockResponse(entry);
    }

    if (method === 'PATCH' && path.endsWith('/entries')) {
      const current = entries.get(normalizePath(body.path));

      if (!current) {
        return mockResponse({ error: 'not found' }, 404);
      }

      const next = {
        ...current,
        name: body.name,
        path: joinPath(parentPath(current.path), body.name)
      };
      entries.delete(current.path);
      entries.set(next.path, next);
      return mockResponse(next);
    }

    if (method === 'DELETE' && path.endsWith('/entries')) {
      removePaths(body.paths ?? []);
      return mockResponse(undefined, 204);
    }

    if (method === 'POST' && path.endsWith('/move')) {
      body.paths.forEach((from: string) => {
        const current = entries.get(normalizePath(from));

        if (current) {
          entries.delete(current.path);
          const nextPath = joinPath(body.destination, current.name);
          entries.set(nextPath, { ...current, path: nextPath });
        }
      });
      return mockResponse(undefined, 204);
    }

    if (method === 'POST' && path.endsWith('/copy')) {
      body.paths.forEach((from: string) => {
        const current = entries.get(normalizePath(from));

        if (current) {
          const nextPath = joinPath(body.destination, current.name);
          entries.set(nextPath, { ...current, id: nextId('copy'), path: nextPath });
        }
      });
      return mockResponse(undefined, 204);
    }

    if (method === 'POST' && path.endsWith('/upload')) {
      const form = init?.body as FormData;
      const files = form.getAll('files') as File[];
      const parent = String(form.get('parent') ?? '/');
      const uploaded = files.map((file) => ({
        id: nextId('upload'),
        name: file.name,
        path: joinPath(parent, file.name),
        type: 'file' as const,
        size: file.size
      }));
      uploaded.forEach((entry) => entries.set(entry.path, entry));
      return mockResponse(uploaded);
    }

    if (method === 'POST' && path.endsWith('/trash')) {
      body.paths.forEach((from: string) => {
        const current = entries.get(normalizePath(from));

        if (current) {
          trash.set(current.path, current);
          entries.delete(current.path);
        }
      });
      return mockResponse(undefined, 204);
    }

    if (method === 'POST' && path.endsWith('/restore')) {
      body.paths.forEach((from: string) => {
        const current = trash.get(normalizePath(from));

        if (current) {
          trash.delete(current.path);
          entries.set(current.path, current);
        }
      });
      return mockResponse(undefined, 204);
    }

    if (method === 'GET' && path.endsWith('/trash')) {
      return mockResponse(Array.from(trash.values()));
    }

    if (method === 'DELETE' && path.endsWith('/trash')) {
      trash.clear();
      return mockResponse(undefined, 204);
    }

    if (method === 'GET' && path.endsWith('/download')) {
      return mockResponse(undefined);
    }

    return mockResponse({ error: 'not found' }, 404);
  });

  return createRestFileSystemProvider({
    endpoint: 'https://api.test/files',
    fetch: fetchMock as unknown as typeof fetch,
    routes: {
      trash: '/trash',
      restore: '/restore',
      trashList: '/trash',
      emptyTrash: '/trash'
    }
  });
}

const providers = [
  { name: 'memory', create: () => createMemoryFileSystemProvider(seedEntries()) },
  { name: 'rest', create: createRestProvider }
];

describe.each(providers)('FileSystemProvider contract ($name)', ({ create }) => {
  let provider: FileSystemProvider;

  beforeEach(() => {
    provider = create();
  });

  it('lists, creates, renames and removes entries with normalized paths', async () => {
    expect(entriesOf(await provider.list('/')).map((entry) => entry.path)).toEqual(
      expect.arrayContaining(['/docs', '/readme.txt'])
    );

    const folder = await provider.createFolder('/', 'Archive');
    expect(folder.path).toBe('/Archive');
    expect(entriesOf(await provider.list('/')).map((entry) => entry.path)).toContain('/Archive');

    const renamed = await provider.rename('/readme.txt', 'guide.txt');
    expect(renamed.path).toBe('/guide.txt');
    expect(entriesOf(await provider.list('/')).map((entry) => entry.path)).toContain('/guide.txt');

    await provider.remove(['/guide.txt']);
    expect(entriesOf(await provider.list('/')).map((entry) => entry.path)).not.toContain(
      '/guide.txt'
    );
  });

  it('copies, moves, uploads, trashes and restores', async () => {
    await provider.createFolder('/', 'Target');
    await provider.copy?.(['/readme.txt'], '/Target');
    expect(entriesOf(await provider.list('/Target')).map((entry) => entry.path)).toContain(
      '/Target/readme.txt'
    );

    await provider.move?.(['/Target/readme.txt'], '/');
    expect(entriesOf(await provider.list('/')).map((entry) => entry.path)).toContain('/readme.txt');

    const uploaded = await provider.upload?.('/', [new File(['x'], 'upload.txt')]);
    expect(uploaded?.[0]?.path).toBe('/upload.txt');

    await provider.trash?.(['/upload.txt']);
    expect(await provider.listTrash?.()).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: '/upload.txt' })])
    );

    await provider.restore?.(['/upload.txt']);
    expect(entriesOf(await provider.list('/')).map((entry) => entry.path)).toContain('/upload.txt');

    await provider.trash?.(['/upload.txt']);
    await provider.emptyTrash?.();
    expect(await provider.listTrash?.()).toEqual([]);
  });
});

describe('path helpers', () => {
  it('normalizes and joins paths', () => {
    expect(normalizePath('\\docs\\a.txt')).toBe('/docs/a.txt');
    expect(joinPath('/docs', 'a/b.txt')).toBe('/docs/a-b.txt');
  });
});
