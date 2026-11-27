import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  DesktopSurface,
  openDesktopSurfaces,
  reconcileDesktopWindowDisplays,
  requestDesktopSurfaceFullscreen,
  syncDesktopSurfaces,
  type DesktopApp,
  type DesktopDisplay,
  type DesktopSurfaceSession,
  type DesktopWindowState
} from '@nebular-react/core';

const apps: DesktopApp[] = [
  { id: 'notes', title: 'Notes', content: <p>Notes content</p> },
  { id: 'settings', title: 'Settings', content: <p>Settings content</p> }
];

const displays: DesktopDisplay[] = [
  {
    id: 'left',
    label: 'Left',
    primary: true,
    bounds: { x: 0, y: 0, width: 600, height: 400 }
  },
  {
    id: 'right',
    label: 'Right',
    bounds: { x: 600, y: 0, width: 600, height: 400 }
  },
  {
    id: 'top',
    label: 'Top',
    bounds: { x: 0, y: -400, width: 600, height: 400 }
  }
];

function createWindow(overrides: Partial<DesktopWindowState> = {}): DesktopWindowState {
  return {
    id: 'left-window',
    appId: 'notes',
    x: 40,
    y: 40,
    width: 300,
    height: 220,
    minimized: false,
    maximized: false,
    zIndex: 1,
    ...overrides
  };
}

function createSession(display: DesktopDisplay): DesktopSurfaceSession {
  return {
    display,
    window: null,
    ready: Promise.resolve(true),
    requestFullscreen: jest.fn().mockResolvedValue(true),
    close: jest.fn()
  };
}

interface MockEventTarget {
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  emit(type: string): void;
}

function createMockEventTarget(): MockEventTarget {
  const listeners = new Map<string, Set<EventListener>>();

  return {
    addEventListener: jest.fn((type: string, listener: EventListener) => {
      const bucket = listeners.get(type) ?? new Set<EventListener>();
      bucket.add(listener);
      listeners.set(type, bucket);
    }),
    removeEventListener: jest.fn((type: string, listener: EventListener) => {
      listeners.get(type)?.delete(listener);
    }),
    emit(type: string) {
      listeners.get(type)?.forEach((listener) => listener(new Event(type)));
    }
  };
}

function createPopup(
  readyState: DocumentReadyState | undefined = 'complete',
  requestFullscreen: jest.Mock = jest.fn().mockResolvedValue(undefined)
) {
  const windowEvents = createMockEventTarget();
  const documentEvents = createMockEventTarget();
  let closed = false;

  const popup = {
    document: {
      readyState,
      documentElement: { requestFullscreen },
      addEventListener: documentEvents.addEventListener,
      removeEventListener: documentEvents.removeEventListener
    },
    get closed() {
      return closed;
    },
    close: jest.fn(() => {
      closed = true;
    }),
    addEventListener: windowEvents.addEventListener,
    removeEventListener: windowEvents.removeEventListener
  };

  return {
    popup: popup as unknown as Window,
    requestFullscreen,
    windowEvents,
    documentEvents,
    isClosed: () => closed
  };
}

describe('DesktopSurface', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders only windows from the requested display and merges updates', async () => {
    const user = userEvent.setup();
    const onWindowsChange = jest.fn();
    const windows = [
      createWindow({ displayId: 'left' }),
      createWindow({
        id: 'right-window',
        appId: 'settings',
        title: 'Settings',
        displayId: 'right',
        zIndex: 2
      })
    ];

    render(
      <DesktopSurface
        surfaceId="left"
        displays={displays}
        windows={windows}
        onWindowsChange={onWindowsChange}
        apps={apps}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));

    const lastCall = onWindowsChange.mock.calls.at(-1)?.[0] as DesktopWindowState[];

    expect(lastCall).toHaveLength(2);
    expect(lastCall).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'left-window', minimized: true }),
        expect.objectContaining({ id: 'right-window', minimized: false })
      ])
    );
  });

  it('adds new windows to the surface without dropping or duplicating other displays', async () => {
    const user = userEvent.setup();
    const onWindowsChange = jest.fn();
    const rightWindow = createWindow({
      id: 'right-window',
      appId: 'settings',
      title: 'Settings',
      displayId: 'right',
      zIndex: 2
    });

    render(
      <DesktopSurface
        surfaceId="left"
        displays={displays}
        windows={[rightWindow]}
        onWindowsChange={onWindowsChange}
        apps={apps}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Start' }));
    const menu = screen.getByRole('menu', { name: 'Apps' });
    await user.click(within(menu).getByRole('menuitem', { name: 'Open Notes' }));

    const lastCall = onWindowsChange.mock.calls.at(-1)?.[0] as DesktopWindowState[];

    expect(lastCall).toHaveLength(2);
    expect(new Set(lastCall.map((window) => window.id)).size).toBe(2);
    expect(lastCall).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'right-window', displayId: 'right' }),
        expect.objectContaining({ appId: 'notes', displayId: 'left' })
      ])
    );
  });

  it('ignores windows assigned to displays that no longer exist', () => {
    render(
      <DesktopSurface
        surfaceId="left"
        displays={displays}
        windows={[
          createWindow({
            id: 'orphan-window',
            appId: 'settings',
            title: 'Settings',
            displayId: 'gone'
          }),
          createWindow({ displayId: 'left' })
        ]}
        onWindowsChange={jest.fn()}
        apps={apps}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();
  });

  it('renders an empty state, accessible label and surface container', () => {
    render(
      <DesktopSurface
        surfaceId="right"
        surfaceLabel="Right display"
        displays={displays}
        windows={[createWindow({ displayId: 'left' })]}
        onWindowsChange={jest.fn()}
        apps={apps}
        emptyState={<p>No windows on this display</p>}
      />
    );

    expect(document.querySelector('[data-desktop-surface="right"]')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Right display' })).toBeInTheDocument();
    expect(screen.getByText('No windows on this display')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Notes' })).not.toBeInTheDocument();
  });

  it('focuses automatically and reports readiness and fullscreen changes', () => {
    const onReady = jest.fn();
    const onFullscreenChange = jest.fn();

    render(
      <DesktopSurface
        surfaceId="left"
        surfaceLabel="Left display"
        displays={displays}
        windows={[]}
        onWindowsChange={jest.fn()}
        apps={apps}
        autoFocus
        onReady={onReady}
        onFullscreenChange={onFullscreenChange}
      />
    );

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('region', { name: 'Left display' })).toHaveFocus();

    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(onFullscreenChange).toHaveBeenCalledWith(false);

    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: document.body
    });

    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(onFullscreenChange).toHaveBeenLastCalledWith(true);
    delete (document as Document & { fullscreenElement?: Element }).fullscreenElement;
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DesktopSurface
        surfaceId="left"
        surfaceLabel="Left display"
        displays={displays}
        windows={[]}
        onWindowsChange={jest.fn()}
        apps={apps}
        emptyState={<p>No windows on this display</p>}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('desktop surface sessions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requests fullscreen per surface and falls back when the browser rejects', async () => {
    const granted = createPopup();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(granted.popup);

    const sessions = openDesktopSurfaces(displays.slice(0, 2), '/desktop', {
      features: 'popup,width=800'
    });

    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('surface=left'),
      'nebular-surface-left',
      'popup,width=800'
    );
    expect(await sessions[0].requestFullscreen()).toBe(true);
    expect(granted.requestFullscreen).toHaveBeenCalledTimes(1);

    const denied = createPopup(
      'complete',
      jest.fn().mockRejectedValue(new Error('fullscreen blocked'))
    );
    openSpy.mockReturnValue(denied.popup);

    const [deniedSession] = openDesktopSurfaces([displays[0]], '/desktop');

    expect(await deniedSession.requestFullscreen()).toBe(false);

    const declined = createPopup('complete', jest.fn().mockResolvedValue(false));
    openSpy.mockReturnValue(declined.popup);

    const [declinedSession] = openDesktopSurfaces([displays[2]], '/desktop');

    expect(await declinedSession.requestFullscreen()).toBe(false);
    expect(await requestDesktopSurfaceFullscreen(null)).toBe(false);
  });

  it('requests fullscreen automatically once the popup is ready', async () => {
    const popup = createPopup();
    jest.spyOn(window, 'open').mockReturnValue(popup.popup);

    const [session] = openDesktopSurfaces([displays[0]], '/desktop', { requestFullscreen: true });

    expect(popup.requestFullscreen).toHaveBeenCalledTimes(1);
    await expect(session.ready).resolves.toBe(true);
  });

  it('resolves ready on load, on timeout and on close', async () => {
    const loaded = createPopup('loading');
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(loaded.popup);

    const [loadingSession] = openDesktopSurfaces([displays[0]], '/desktop', {
      readyTimeoutMs: 5000
    });

    loaded.documentEvents.emit('load');
    await expect(loadingSession.ready).resolves.toBe(true);

    const timedOut = createPopup('loading');
    openSpy.mockReturnValue(timedOut.popup);

    const [timeoutSession] = openDesktopSurfaces([displays[0]], '/desktop', {
      readyTimeoutMs: 0
    });

    await expect(timeoutSession.ready).resolves.toBe(false);

    const closed = createPopup('loading');
    openSpy.mockReturnValue(closed.popup);

    const [closingSession] = openDesktopSurfaces([displays[0]], '/desktop', {
      readyTimeoutMs: 5000
    });

    closingSession.close();
    await expect(closingSession.ready).resolves.toBe(false);
    expect(closed.isClosed()).toBe(true);
    expect(closed.requestFullscreen).not.toHaveBeenCalled();
  });

  it('keeps the legacy string argument and reports blocked popups', async () => {
    const onBlocked = jest.fn();
    const onSession = jest.fn();
    const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

    const [legacySession] = openDesktopSurfaces([displays[0]], '/desktop', 'popup,width=10');

    expect(openSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('surface=left'),
      'nebular-surface-left',
      'popup,width=10'
    );
    await expect(legacySession.ready).resolves.toBe(false);
    expect(legacySession.window).toBeNull();

    openDesktopSurfaces([displays[1]], '/desktop', {
      features: 'popup',
      namePrefix: 'custom',
      onBlocked,
      onSession
    });

    expect(openSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('surface=right'),
      'custom-right',
      'popup'
    );
    expect(onBlocked).toHaveBeenCalledWith(displays[1]);
    expect(onSession).toHaveBeenCalledTimes(1);
  });
});

describe('syncDesktopSurfaces', () => {
  it('opens new displays, closes removed ones and keeps matching sessions', () => {
    const left = createSession(displays[0]);
    const right = createSession(displays[1]);
    const top = createSession(displays[2]);
    const open = jest.fn(() => top);

    const result = syncDesktopSurfaces([left, right], [displays[0], displays[2]], open);

    expect(open).toHaveBeenCalledWith(displays[2]);
    expect(open).toHaveBeenCalledTimes(1);
    expect(result.sessions).toEqual([left, top]);
    expect(result.sessions[0]).toBe(left);
    expect(result.opened).toEqual([top]);
    expect(result.closed).toEqual([right]);
    expect(right.close).toHaveBeenCalledTimes(1);
  });

  it('deduplicates display ids and closes every session when the list is empty', () => {
    const open = jest.fn((display: DesktopDisplay) => createSession(display));

    const added = syncDesktopSurfaces([], [displays[0], displays[0], displays[2]], open);

    expect(added.opened.map((session) => session.display.id)).toEqual(['left', 'top']);
    expect(added.sessions).toEqual(added.opened);
    expect(open).toHaveBeenCalledTimes(2);

    const left = createSession(displays[0]);
    const right = createSession(displays[1]);
    const removed = syncDesktopSurfaces([left, right], [], open);

    expect(removed.sessions).toEqual([]);
    expect(removed.opened).toEqual([]);
    expect(removed.closed).toEqual([left, right]);
    expect(left.close).toHaveBeenCalledTimes(1);
    expect(right.close).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledTimes(2);
  });
});

describe('reconcileDesktopWindowDisplays', () => {
  it('moves orphan windows to the primary display without mutating the input', () => {
    const windows = [
      createWindow({ id: 'left-window', displayId: 'left' }),
      createWindow({
        id: 'orphan-window',
        displayId: 'removed',
        workspaceId: 'main',
        minimized: true,
        state: { path: '/document' }
      }),
      createWindow({ id: 'untagged-window', displayId: undefined })
    ];

    const result = reconcileDesktopWindowDisplays(windows, displays.slice(0, 2));

    expect(result).not.toBe(windows);
    expect(result[0]).toBe(windows[0]);
    expect(result[1]).not.toBe(windows[1]);
    expect(result[1]).toEqual({ ...windows[1], displayId: 'left' });
    expect(windows[1].displayId).toBe('removed');
    expect(result[2]).toBe(windows[2]);

    const fallback = reconcileDesktopWindowDisplays([windows[1]], displays.slice(0, 2), 'right');

    expect(fallback[0].displayId).toBe('right');
  });

  it('keeps orphans when there is no display to fall back to', () => {
    const windows = [createWindow({ id: 'orphan-window', displayId: 'removed' })];
    const result = reconcileDesktopWindowDisplays(windows, []);

    expect(result).toEqual(windows);
    expect(result).not.toBe(windows);
    expect(result[0]).toBe(windows[0]);
  });

  it('tolerates duplicate display ids', () => {
    const windows = [createWindow({ id: 'orphan-window', displayId: 'removed' })];
    const result = reconcileDesktopWindowDisplays(windows, [
      displays[0],
      { ...displays[0], label: 'Left duplicate' }
    ]);

    expect(result[0].displayId).toBe('left');
  });
});
