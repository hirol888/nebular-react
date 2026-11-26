import {
  createCollaborationRoom,
  isCollaboratorStale,
  mergeCollaborativeLayouts,
  type DesktopLayoutSnapshot,
  type DesktopWindowSnapshot
} from '@nebular-react/core';

function windowSnapshot(
  id: string,
  overrides: Partial<DesktopWindowSnapshot> = {}
): DesktopWindowSnapshot {
  return {
    id,
    x: 0,
    y: 0,
    width: 320,
    height: 240,
    minimized: false,
    maximized: false,
    zIndex: 1,
    ...overrides
  };
}

function snapshot(
  savedAt: string | undefined,
  windows: DesktopWindowSnapshot[],
  extra: Omit<DesktopLayoutSnapshot, 'version' | 'savedAt' | 'windows'> = {}
): DesktopLayoutSnapshot {
  return { version: 2, savedAt, windows, ...extra };
}

describe('mergeCollaborativeLayouts', () => {
  it('lets the newest snapshot win duplicates while preserving local-only windows', () => {
    const local = snapshot(
      '2026-01-01T10:00:00.000Z',
      [
        windowSnapshot('shared', { x: 10, title: 'Local title' }),
        windowSnapshot('local-only', { x: 20 })
      ],
      {
        activeWorkspace: 'local-workspace',
        workspaces: [{ id: 'local-workspace', title: 'Local' }]
      }
    );
    const remote = snapshot(
      '2026-01-01T10:00:05.000Z',
      [windowSnapshot('shared', { x: 99, title: 'Remote title' }), windowSnapshot('remote-only')],
      {
        activeWorkspace: 'remote-workspace',
        workspaces: [{ id: 'remote-workspace', title: 'Remote' }]
      }
    );

    const merged = mergeCollaborativeLayouts(local, remote);

    expect(merged.windows.map((window) => window.id)).toEqual([
      'shared',
      'local-only',
      'remote-only'
    ]);
    expect(merged.windows[0]).toMatchObject({ x: 99, title: 'Remote title' });
    expect(merged.windows[1]).toMatchObject({ id: 'local-only', x: 20 });
    expect(merged.savedAt).toBe('2026-01-01T10:00:05.000Z');
    expect(merged.activeWorkspace).toBe('remote-workspace');
    expect(merged.workspaces).toEqual([{ id: 'remote-workspace', title: 'Remote' }]);
  });

  it('keeps local duplicates when the local snapshot is newer and appends remote-only windows', () => {
    const local = snapshot(
      '2026-01-01T10:00:10.000Z',
      [windowSnapshot('shared', { x: 10 }), windowSnapshot('local-only')],
      { activeWorkspace: 'local' }
    );
    const remote = snapshot('2026-01-01T10:00:00.000Z', [
      windowSnapshot('shared', { x: 99 }),
      windowSnapshot('remote-only')
    ]);

    const merged = mergeCollaborativeLayouts(local, remote);

    expect(merged.windows.map((window) => window.id)).toEqual([
      'shared',
      'local-only',
      'remote-only'
    ]);
    expect(merged.windows[0].x).toBe(10);
    expect(merged.savedAt).toBe('2026-01-01T10:00:10.000Z');
    expect(merged.activeWorkspace).toBe('local');
  });

  it('uses the remote version when timestamps are equal or missing', () => {
    const local = snapshot('2026-01-01T10:00:00.000Z', [windowSnapshot('shared', { x: 10 })]);
    const remote = snapshot('2026-01-01T10:00:00.000Z', [windowSnapshot('shared', { x: 99 })]);

    expect(mergeCollaborativeLayouts(local, remote).windows[0].x).toBe(99);

    const missingLocal = snapshot(undefined, [windowSnapshot('shared', { x: 10 })]);
    const missingRemote = snapshot(undefined, [windowSnapshot('shared', { x: 77 })]);

    expect(mergeCollaborativeLayouts(missingLocal, missingRemote).windows[0].x).toBe(77);
  });

  it('never mutates inputs and clones returned windows', () => {
    const local = snapshot('2026-01-01T10:00:00.000Z', [
      windowSnapshot('shared', { x: 10 }),
      windowSnapshot('local-only')
    ]);
    const remote = snapshot('2026-01-01T10:00:05.000Z', [windowSnapshot('shared', { x: 99 })]);
    const localBefore = JSON.parse(JSON.stringify(local)) as DesktopLayoutSnapshot;
    const remoteBefore = JSON.parse(JSON.stringify(remote)) as DesktopLayoutSnapshot;

    const merged = mergeCollaborativeLayouts(local, remote);

    expect(local).toEqual(localBefore);
    expect(remote).toEqual(remoteBefore);
    expect(merged.windows[0]).not.toBe(remote.windows[0]);
    expect(merged.windows[1]).not.toBe(local.windows[1]);
  });
});

describe('createCollaborationRoom', () => {
  it('builds stable sanitized room names', () => {
    expect(createCollaborationRoom(' Acme Corp ', 'CRM/Desktop')).toBe('acme-corp:crm-desktop');
    expect(createCollaborationRoom('Áção', '  ')).toBe('acao:default');
    expect(createCollaborationRoom('Acme Corp', 'CRM/Desktop')).toBe(
      createCollaborationRoom(' Acme Corp ', 'CRM/Desktop')
    );
    expect(createCollaborationRoom('', '')).toBe('default:default');
  });
});

describe('isCollaboratorStale', () => {
  const now = Date.parse('2026-01-01T10:00:10.000Z');

  it('compares lastSeenAt with the ttl', () => {
    const collaborator = { id: 'bob', lastSeenAt: '2026-01-01T10:00:00.000Z' };

    expect(isCollaboratorStale(collaborator, now, 10000)).toBe(true);
    expect(isCollaboratorStale(collaborator, now, 10001)).toBe(false);
    expect(isCollaboratorStale(collaborator, new Date(now), 10001)).toBe(false);
  });

  it('treats missing, invalid and future timestamps as expected', () => {
    expect(isCollaboratorStale({ id: 'bob' }, now, 10000)).toBe(true);
    expect(isCollaboratorStale({ id: 'bob', lastSeenAt: 'invalid' }, now, 10000)).toBe(true);
    expect(isCollaboratorStale(null, now, 10000)).toBe(true);
    expect(
      isCollaboratorStale({ id: 'bob', lastSeenAt: '2026-01-01T10:00:20.000Z' }, now, 10000)
    ).toBe(false);
  });
});
