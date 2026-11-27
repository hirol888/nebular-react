import { act, renderHook } from '@testing-library/react';
import {
  useCollaborativeLayout,
  useDesktopCollaborators,
  type DesktopCollaborationAdapter,
  type DesktopCollaborator,
  type DesktopLayoutSnapshot
} from '@nebular-react/core';

function createTestAdapter() {
  const presenceListeners = new Set<(presence: DesktopCollaborator) => void>();
  const layoutListeners = new Set<(snapshot: DesktopLayoutSnapshot) => void>();

  const adapter = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    broadcastPresence: jest.fn(),
    broadcastLayout: jest.fn(),
    subscribePresence: jest.fn((listener: (presence: DesktopCollaborator) => void) => {
      presenceListeners.add(listener);

      return () => {
        presenceListeners.delete(listener);
      };
    }),
    subscribeLayout: jest.fn((listener: (snapshot: DesktopLayoutSnapshot) => void) => {
      layoutListeners.add(listener);

      return () => {
        layoutListeners.delete(listener);
      };
    }),
    emitPresence(presence: DesktopCollaborator) {
      presenceListeners.forEach((listener) => listener(presence));
    },
    emitLayout(snapshot: DesktopLayoutSnapshot) {
      layoutListeners.forEach((listener) => listener(snapshot));
    }
  };

  return adapter as typeof adapter & DesktopCollaborationAdapter;
}

function createSnapshot(savedAt: string, x = 0): DesktopLayoutSnapshot {
  return {
    version: 2,
    savedAt,
    windows: [
      {
        id: 'notes',
        x,
        y: 0,
        width: 320,
        height: 240,
        minimized: false,
        maximized: false,
        zIndex: 1
      }
    ]
  };
}

describe('useDesktopCollaborators', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('subscribes to presence, stamps lastSeenAt and ignores self', () => {
    const adapter = createTestAdapter();
    const self: DesktopCollaborator = { id: 'alice', name: 'Alice' };

    const { result, unmount } = renderHook(() => useDesktopCollaborators(adapter, { self }));

    expect(adapter.subscribePresence).toHaveBeenCalledTimes(1);
    expect(result.current.collaborators).toBeInstanceOf(Map);
    expect(result.current.list).toEqual([]);

    act(() => {
      adapter.emitPresence({ id: 'bob', name: 'Bob' });
    });

    expect(result.current.list).toHaveLength(1);
    expect(result.current.collaborators.get('bob')).toMatchObject({ id: 'bob', name: 'Bob' });
    expect(typeof result.current.collaborators.get('bob')?.lastSeenAt).toBe('string');

    act(() => {
      adapter.emitPresence({ id: 'alice', name: 'Alice (echo)' });
    });

    expect(result.current.list).toHaveLength(1);
    expect(result.current.collaborators.get('alice')).toBeUndefined();

    unmount();
    expect(adapter.subscribePresence).toHaveBeenCalledTimes(1);
  });

  it('removes collaborators that exceed the ttl', () => {
    jest.useFakeTimers();

    const adapter = createTestAdapter();
    const { result, unmount } = renderHook(() =>
      useDesktopCollaborators(adapter, { self: { id: 'alice' }, ttlMs: 30000 })
    );

    act(() => {
      adapter.emitPresence({ id: 'bob', name: 'Bob' });
    });
    expect(result.current.list).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(29999);
    });
    expect(result.current.list).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.list).toHaveLength(0);

    unmount();
  });

  it('broadcasts the current presence with a fresh timestamp', () => {
    const adapter = createTestAdapter();
    const self: DesktopCollaborator = { id: 'alice', name: 'Alice' };

    const { result, unmount } = renderHook(() => useDesktopCollaborators(adapter, { self }));

    act(() => {
      result.current.updatePresence({ ...self, activeWindowId: 'notes' });
    });

    expect(adapter.broadcastPresence).toHaveBeenCalledTimes(1);
    expect(adapter.broadcastPresence.mock.calls[0][0]).toMatchObject({
      id: 'alice',
      name: 'Alice',
      activeWindowId: 'notes'
    });
    expect(typeof adapter.broadcastPresence.mock.calls[0][0].lastSeenAt).toBe('string');

    act(() => {
      result.current.updatePresence();
    });

    expect(adapter.broadcastPresence).toHaveBeenCalledTimes(2);
    expect(adapter.broadcastPresence.mock.calls[1][0]).toMatchObject({ id: 'alice' });

    unmount();
  });

  it('does not subscribe when disabled', () => {
    const adapter = createTestAdapter();
    const { result, unmount } = renderHook(() =>
      useDesktopCollaborators(adapter, {
        self: { id: 'alice' },
        enabled: false
      })
    );

    expect(adapter.subscribePresence).not.toHaveBeenCalled();

    act(() => {
      adapter.emitPresence({ id: 'bob' });
    });

    expect(result.current.list).toHaveLength(0);
    unmount();
  });
});

describe('useCollaborativeLayout', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('broadcasts a debounced local change once', () => {
    jest.useFakeTimers();

    const adapter = createTestAdapter();
    const first = createSnapshot('2026-01-01T10:00:00.000Z');
    const second = createSnapshot('2026-01-01T10:00:01.000Z', 10);

    const { result, rerender, unmount } = renderHook(
      ({ current }) => useCollaborativeLayout(adapter, { snapshot: current, debounceMs: 250 }),
      { initialProps: { current: first } }
    );

    // The first snapshot is the baseline and is not broadcast.
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(adapter.broadcastLayout).not.toHaveBeenCalled();

    rerender({ current: second });
    expect(result.current.broadcasting).toBe(true);

    act(() => {
      jest.advanceTimersByTime(249);
    });
    expect(adapter.broadcastLayout).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(adapter.broadcastLayout).toHaveBeenCalledTimes(1);
    expect(adapter.broadcastLayout).toHaveBeenCalledWith(second);
    expect(result.current.broadcasting).toBe(false);

    unmount();
  });

  it('coalesces rapid savedAt changes into the latest snapshot', () => {
    jest.useFakeTimers();

    const adapter = createTestAdapter();
    const first = createSnapshot('2026-01-01T10:00:00.000Z');
    const second = createSnapshot('2026-01-01T10:00:01.000Z', 10);
    const third = createSnapshot('2026-01-01T10:00:02.000Z', 20);

    const { rerender, unmount } = renderHook(
      ({ current }) => useCollaborativeLayout(adapter, { snapshot: current, debounceMs: 250 }),
      { initialProps: { current: first } }
    );

    rerender({ current: second });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ current: third });
    act(() => {
      jest.advanceTimersByTime(249);
    });
    expect(adapter.broadcastLayout).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(adapter.broadcastLayout).toHaveBeenCalledTimes(1);
    expect(adapter.broadcastLayout).toHaveBeenCalledWith(third);

    unmount();
  });

  it('receives remote layouts and avoids echoing them back', () => {
    jest.useFakeTimers();

    const adapter = createTestAdapter();
    const local = createSnapshot('2026-01-01T10:00:00.000Z');
    const remote = createSnapshot('2026-01-01T10:00:05.000Z', 50);
    const onRemoteLayout = jest.fn();

    const { result, rerender, unmount } = renderHook(
      ({ current }) =>
        useCollaborativeLayout(adapter, { snapshot: current, onRemoteLayout, debounceMs: 250 }),
      { initialProps: { current: local } }
    );

    expect(adapter.subscribeLayout).toHaveBeenCalledTimes(1);

    act(() => {
      adapter.emitLayout(remote);
    });

    expect(onRemoteLayout).toHaveBeenCalledWith(remote);
    expect(typeof result.current.lastReceivedAt).toBe('number');

    // Applying the remote snapshot locally must not broadcast it again.
    rerender({ current: remote });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(adapter.broadcastLayout).not.toHaveBeenCalled();

    // A truly local change after that is still published.
    const next = createSnapshot('2026-01-01T10:00:06.000Z', 60);
    rerender({ current: next });
    act(() => {
      jest.advanceTimersByTime(250);
    });
    expect(adapter.broadcastLayout).toHaveBeenCalledWith(next);

    unmount();
  });

  it('does not subscribe or broadcast when disabled', () => {
    jest.useFakeTimers();

    const adapter = createTestAdapter();
    const first = createSnapshot('2026-01-01T10:00:00.000Z');
    const second = createSnapshot('2026-01-01T10:00:01.000Z', 10);

    const { result, rerender, unmount } = renderHook(
      ({ current }) =>
        useCollaborativeLayout(adapter, { snapshot: current, enabled: false, debounceMs: 10 }),
      { initialProps: { current: first } }
    );

    expect(adapter.subscribeLayout).not.toHaveBeenCalled();

    rerender({ current: second });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(adapter.broadcastLayout).not.toHaveBeenCalled();
    expect(result.current.broadcasting).toBe(false);
    expect(result.current.lastReceivedAt).toBeNull();

    unmount();
  });
});
