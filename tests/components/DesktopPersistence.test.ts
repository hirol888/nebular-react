import {
  DesktopLayoutRequestError,
  createRestLayoutTransport,
  getDesktopDeviceId,
  type DesktopLayoutSnapshot
} from '@nebular-react/core';

function snapshot(): DesktopLayoutSnapshot {
  return {
    version: 2,
    savedAt: '2026-01-01T00:00:00.000Z',
    windows: []
  };
}

function response(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {}
): Response {
  const status = init.status ?? 200;
  const headers = new Map(
    Object.entries(init.headers ?? {}).map(([key, value]) => [key.toLowerCase(), value])
  );
  const text = body === undefined ? '' : JSON.stringify(body);

  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name: string) => headers.get(name.toLowerCase()) ?? null
    },
    text: async () => text,
    json: async () => JSON.parse(text) as unknown,
    blob: async () => new Blob([text])
  } as unknown as Response;
}

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: jest.fn((key: string) => values.delete(key)),
    clear: jest.fn(() => values.clear()),
    key: jest.fn((index: number) => Array.from(values.keys())[index] ?? null),
    get length() {
      return values.size;
    }
  } as unknown as Storage;
}

describe('getDesktopDeviceId', () => {
  it('uses an injected storage and generator', () => {
    const storage = memoryStorage();

    expect(
      getDesktopDeviceId({
        storage,
        storageKey: 'device',
        generate: () => 'generated-id'
      })
    ).toBe('generated-id');
    expect(storage.setItem).toHaveBeenCalledWith('device', 'generated-id');

    expect(getDesktopDeviceId({ storage, storageKey: 'device' })).toBe('generated-id');
  });

  it('falls back when storage is unavailable or throws', () => {
    expect(getDesktopDeviceId({ storage: null, fallback: 'native' })).toBe('native');

    const failing = memoryStorage();
    failing.getItem = jest.fn(() => {
      throw new Error('denied');
    });

    expect(
      getDesktopDeviceId({
        storage: failing,
        generate: () => 'new-id',
        fallback: 'fallback'
      })
    ).toBe('fallback');
  });
});

describe('createRestLayoutTransport', () => {
  it('loads a snapshot with query params and ETag revision', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      response(snapshot(), {
        status: 200,
        headers: { ETag: '"7"', 'Content-Type': 'application/json' }
      })
    );
    const transport = createRestLayoutTransport({
      endpoint: 'https://api.test/layout',
      fetch: fetchMock,
      query: () => ({ tenantId: 'acme', appId: 'notes' }),
      headers: { Authorization: 'Bearer token' }
    });

    const result = await transport.load?.();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/layout?tenantId=acme&appId=notes',
      expect.objectContaining({
        method: 'GET',
        credentials: 'same-origin',
        headers: expect.objectContaining({ Authorization: 'Bearer token' })
      })
    );
    expect(result?.revision).toBe('7');
    expect(result?.snapshot.windows).toEqual([]);
  });

  it('saves the versioned body and reads the new revision', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      response(
        { ok: true },
        {
          status: 200,
          headers: { 'X-Revision': '9' }
        }
      )
    );
    const transport = createRestLayoutTransport({
      endpoint: 'https://api.test/layout',
      fetch: fetchMock,
      method: 'POST'
    });
    const layout = snapshot();

    const result = await transport.save(layout, 8, { scope: 'shared' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/layout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ snapshot: layout, revision: 8 })
      })
    );
    expect((result as { revision?: string | number } | undefined)?.revision).toBe('9');
  });

  it('throws a typed conflict with the current revision', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      response(
        { error: 'conflict' },
        {
          status: 409,
          headers: { ETag: '"11"' }
        }
      )
    );
    const transport = createRestLayoutTransport({
      endpoint: 'https://api.test/layout',
      fetch: fetchMock
    });

    await expect(transport.save(snapshot(), 10)).rejects.toMatchObject({
      name: 'DesktopLayoutRequestError',
      status: 409,
      conflict: true,
      revision: '11'
    });
    await expect(transport.save(snapshot(), 10)).rejects.toBeInstanceOf(DesktopLayoutRequestError);
  });

  it('supports custom request/response mapping', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(response({ data: { layout: snapshot(), rev: 3 } }, { status: 200 }));
    const transport = createRestLayoutTransport({
      endpoint: 'https://api.test/layout',
      fetch: fetchMock,
      buildBody: (layout, revision, options) => ({
        data: layout,
        expected: revision,
        scope: options?.scope
      }),
      parseLoad: (payload) => {
        const { data } = payload as {
          data: { layout: DesktopLayoutSnapshot; rev: number };
        };
        return { snapshot: data.layout, revision: data.rev };
      },
      parseSave: () => ({ revision: 12 })
    });

    expect((await transport.load?.())?.revision).toBe(3);
    expect(
      (
        (await transport.save(snapshot(), 11, { scope: 'device' })) as
          { revision?: string | number } | undefined
      )?.revision
    ).toBe(12);
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({
      data: snapshot(),
      expected: 11,
      scope: 'device'
    });
  });
});
