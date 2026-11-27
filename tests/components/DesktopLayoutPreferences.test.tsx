import React from 'react';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  DesktopLayoutPreferences,
  useDesktopLayoutPreferences,
  type DesktopLayoutSnapshot,
  type VersionedLayoutTransport
} from '@nebular-react/core';

function createSnapshot(savedAt: string, windows = 2): DesktopLayoutSnapshot {
  return {
    version: 2,
    savedAt,
    windows: Array.from({ length: windows }, (_value, index) => ({
      id: `window-${index + 1}`,
      title: `Window ${index + 1}`,
      x: 48,
      y: 48,
      width: 400,
      height: 300,
      zIndex: index,
      minimized: false,
      maximized: false
    }))
  };
}

describe('useDesktopLayoutPreferences', () => {
  it('loads the remote snapshot and revision', async () => {
    const remote = createSnapshot('2026-01-01T10:00:00.000Z');
    const load = jest.fn(async () => ({ snapshot: remote, revision: 'rev-1' }));
    const transport: VersionedLayoutTransport = { load, save: jest.fn() };
    const onLoaded = jest.fn();

    const { result } = renderHook(() => useDesktopLayoutPreferences({ transport, onLoaded }));

    await waitFor(() => expect(result.current.status).toBe('ready'));

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.revision).toBe('rev-1');
    expect(result.current.remoteSnapshot).toEqual(remote);
    expect(result.current.noLayout).toBe(false);
    expect(onLoaded).toHaveBeenCalledWith(remote);
  });

  it('keeps a stable adapter that forwards the current scope', async () => {
    const load = jest.fn(async () => ({
      snapshot: createSnapshot('2026-01-01T10:00:00.000Z'),
      revision: 'rev-1'
    }));
    const save = jest.fn(async () => ({ revision: 'rev-2' }));
    const transport: VersionedLayoutTransport = { load, save };

    const { result, rerender } = renderHook(() =>
      useDesktopLayoutPreferences({ transport, scope: 'shared' })
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));

    const { adapter } = result.current;
    rerender();
    expect(result.current.adapter).toBe(adapter);

    const local = createSnapshot('2026-01-02T10:00:00.000Z', 1);
    await act(async () => {
      await adapter.save(local);
    });

    expect(save).toHaveBeenCalledWith(local, undefined, { scope: 'shared' });
  });

  it('saves the snapshot with the current revision and updates the status', async () => {
    const remote = createSnapshot('2026-01-01T10:00:00.000Z');
    const local = createSnapshot('2026-01-02T10:00:00.000Z', 3);
    const save = jest.fn(async () => ({ revision: 'rev-2' }));
    const transport: VersionedLayoutTransport = {
      load: jest.fn(async () => ({ snapshot: remote, revision: 'rev-1' })),
      save
    };

    const { result } = renderHook(() =>
      useDesktopLayoutPreferences({ transport, snapshot: local, scope: 'shared' })
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(save).toHaveBeenCalledWith(local, 'rev-1', { scope: 'shared' });
    expect(result.current.status).toBe('ready');
    expect(result.current.revision).toBe('rev-2');
    expect(result.current.lastSavedAt).toBe(local.savedAt);
    expect(result.current.remoteSnapshot).toEqual(local);
  });

  it('reports a save error when the remote revision did not change', async () => {
    const remote = createSnapshot('2026-01-01T10:00:00.000Z');
    const local = createSnapshot('2026-01-02T10:00:00.000Z', 3);
    const saveError = new Error('Network unavailable');
    const load = jest.fn(async () => ({ snapshot: remote, revision: 'rev-1' }));
    const save = jest.fn().mockRejectedValueOnce(saveError);
    const transport: VersionedLayoutTransport = { load, save };
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useDesktopLayoutPreferences({ transport, snapshot: local, onError })
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('error');
    expect(result.current.saveError).toBe(saveError);
    expect(result.current.conflict).toBeUndefined();
    expect(onError).toHaveBeenCalledWith(saveError);
  });

  it('detects a revision conflict and keeps the local layout over the remote revision', async () => {
    const initial = createSnapshot('2026-01-01T10:00:00.000Z', 1);
    const local = createSnapshot('2026-01-02T10:00:00.000Z', 2);
    const remote = createSnapshot('2026-01-03T10:00:00.000Z', 4);
    const load = jest
      .fn()
      .mockResolvedValueOnce({ snapshot: initial, revision: 'rev-1' })
      .mockResolvedValueOnce({ snapshot: remote, revision: 'rev-2' });
    const save = jest
      .fn()
      .mockRejectedValueOnce(new Error('revision_conflict'))
      .mockResolvedValueOnce({ revision: 'rev-3' });
    const transport: VersionedLayoutTransport = { load, save };

    const { result } = renderHook(() =>
      useDesktopLayoutPreferences({ transport, snapshot: local })
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('conflict');
    expect(result.current.conflict).toEqual({
      localSavedAt: local.savedAt,
      remoteSavedAt: remote.savedAt
    });
    expect(result.current.saveError).toBeUndefined();

    await act(async () => {
      await result.current.resolveConflict('local');
    });

    expect(save).toHaveBeenNthCalledWith(2, local, 'rev-2', { scope: 'device' });
    expect(result.current.status).toBe('ready');
    expect(result.current.conflict).toBeUndefined();
    expect(result.current.revision).toBe('rev-3');
  });

  it('applies the remote snapshot when resolving a conflict in favor of the server', async () => {
    const initial = createSnapshot('2026-01-01T10:00:00.000Z', 1);
    const local = createSnapshot('2026-01-02T10:00:00.000Z', 2);
    const remote = createSnapshot('2026-01-03T10:00:00.000Z', 3);
    const load = jest
      .fn()
      .mockResolvedValueOnce({ snapshot: initial, revision: 'rev-1' })
      .mockResolvedValueOnce({ snapshot: remote, revision: 'rev-2' });
    const save = jest.fn().mockRejectedValueOnce(new Error('revision_conflict'));
    const transport: VersionedLayoutTransport = { load, save };
    const onApplySnapshot = jest.fn();

    const { result } = renderHook(() =>
      useDesktopLayoutPreferences({ transport, snapshot: local, onApplySnapshot })
    );

    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.status).toBe('conflict');

    await act(async () => {
      await result.current.resolveConflict('remote');
    });

    expect(onApplySnapshot).toHaveBeenCalledWith(remote);
    expect(save).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('ready');
    expect(result.current.conflict).toBeUndefined();
  });
});

describe('DesktopLayoutPreferences', () => {
  it('shows the loading summary and the remote layout contents', async () => {
    const remote = createSnapshot('2026-01-01T10:00:00.000Z', 2);
    const transport: VersionedLayoutTransport = {
      load: jest.fn(async () => ({ snapshot: remote, revision: 'rev-1' })),
      save: jest.fn()
    };

    render(<DesktopLayoutPreferences transport={transport} />);

    expect(screen.getByText('Loading desktop layout…')).toBeInTheDocument();

    expect(await screen.findByText('2 windows')).toBeInTheDocument();
    expect(screen.getByText(/Last saved at/)).toBeInTheDocument();
    expect(screen.queryByText('Loading desktop layout…')).not.toBeInTheDocument();
  });

  it('shows a load error and retries the request', async () => {
    const user = userEvent.setup();
    const remote = createSnapshot('2026-01-01T10:00:00.000Z', 1);
    const load = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce({ snapshot: remote, revision: 'rev-1' });
    const transport: VersionedLayoutTransport = { load, save: jest.fn() };
    const onError = jest.fn();

    render(<DesktopLayoutPreferences transport={transport} onError={onError} />);

    expect(await screen.findByText('Could not load the desktop layout.')).toBeInTheDocument();
    expect(screen.getByText('Network unavailable')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(screen.getByText('1 windows')).toBeInTheDocument());
    expect(load).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Could not load the desktop layout.')).not.toBeInTheDocument();
  });

  it('shows a save error when the remote revision did not change', async () => {
    const user = userEvent.setup();
    const remote = createSnapshot('2026-01-01T10:00:00.000Z');
    const local = createSnapshot('2026-01-02T10:00:00.000Z', 3);
    const load = jest.fn(async () => ({ snapshot: remote, revision: 'rev-1' }));
    const save = jest.fn().mockRejectedValueOnce(new Error('Network unavailable'));
    const transport: VersionedLayoutTransport = { load, save };

    render(<DesktopLayoutPreferences transport={transport} snapshot={local} />);

    await screen.findByText('2 windows');

    await user.click(screen.getByRole('button', { name: 'Save layout now' }));

    expect(await screen.findByText('Could not save the desktop layout.')).toBeInTheDocument();
    expect(screen.getByText('Network unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the empty state when the server has no layout', async () => {
    const transport: VersionedLayoutTransport = {
      load: jest.fn(async () => null),
      save: jest.fn()
    };

    render(<DesktopLayoutPreferences transport={transport} />);

    expect(await screen.findByText('No layout saved yet.')).toBeInTheDocument();
    expect(screen.getByText('0 windows')).toBeInTheDocument();
  });

  it('renders the conflict alert and applies the remote snapshot', async () => {
    const user = userEvent.setup();
    const initial = createSnapshot('2026-01-01T10:00:00.000Z', 1);
    const local = createSnapshot('2026-01-02T10:00:00.000Z', 2);
    const remote = createSnapshot('2026-01-03T10:00:00.000Z', 3);
    const load = jest
      .fn()
      .mockResolvedValueOnce({ snapshot: initial, revision: 'rev-1' })
      .mockResolvedValueOnce({ snapshot: remote, revision: 'rev-2' });
    const save = jest.fn().mockRejectedValueOnce(new Error('revision_conflict'));
    const transport: VersionedLayoutTransport = { load, save };
    const onApplySnapshot = jest.fn();

    render(
      <DesktopLayoutPreferences
        transport={transport}
        snapshot={local}
        onApplySnapshot={onApplySnapshot}
      />
    );

    await screen.findByText('1 windows');

    await user.click(screen.getByRole('button', { name: 'Save layout now' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This layout changed on another device'
    );

    await user.click(screen.getByRole('button', { name: 'Use server layout' }));

    expect(onApplySnapshot).toHaveBeenCalledWith(remote);
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(await screen.findByText('3 windows')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const transport: VersionedLayoutTransport = {
      load: jest.fn(async () => ({
        snapshot: createSnapshot('2026-01-01T10:00:00.000Z'),
        revision: 'rev-1'
      })),
      save: jest.fn()
    };

    const { container } = render(
      <DesktopLayoutPreferences transport={transport} deviceId="browser-1" />
    );

    await screen.findByText('2 windows');

    expect(await axe(container)).toHaveNoViolations();
  });
});
