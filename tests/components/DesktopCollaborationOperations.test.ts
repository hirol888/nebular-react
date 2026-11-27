import {
  applyDesktopLayoutOperation,
  mergeDesktopLayoutOperationLogs,
  nextDesktopLayoutOperationCounter,
  replayDesktopLayoutOperations,
  type DesktopLayoutOperationEnvelope,
  type DesktopLayoutSnapshot
} from '@nebular-react/core';

function snapshot(): DesktopLayoutSnapshot {
  return {
    version: 2,
    savedAt: '2026-01-01T00:00:00.000Z',
    activeWorkspace: 'main',
    workspaces: [{ id: 'main', title: 'Main' }],
    windows: [
      {
        id: 'notes',
        x: 0,
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

function envelope(
  id: string,
  counter: number,
  actorId: string,
  operation: DesktopLayoutOperationEnvelope['operation']
): DesktopLayoutOperationEnvelope {
  return {
    id,
    actorId,
    counter,
    timestamp: '2026-01-01T00:00:00.000Z',
    operation
  };
}

describe('Desktop collaborative operations', () => {
  it('applies window/workspace operations immutably', () => {
    const base = snapshot();
    const added = applyDesktopLayoutOperation(base, {
      type: 'upsert-window',
      window: {
        id: 'mail',
        x: 10,
        y: 10,
        width: 300,
        height: 200,
        minimized: false,
        maximized: false,
        zIndex: 2
      }
    });

    expect(base.windows).toHaveLength(1);
    expect(added.windows).toHaveLength(2);

    const removed = applyDesktopLayoutOperation(added, {
      type: 'remove-window',
      windowId: 'notes'
    });
    expect(removed.windows.map((window) => window.id)).toEqual(['mail']);

    const changed = applyDesktopLayoutOperation(removed, {
      type: 'set-active-workspace',
      workspaceId: 'secondary'
    });
    expect(changed.activeWorkspace).toBe('secondary');

    const workspaces = applyDesktopLayoutOperation(changed, {
      type: 'set-workspaces',
      workspaces: [{ id: 'secondary', title: 'Secondary' }]
    });
    expect(workspaces.workspaces).toEqual([{ id: 'secondary', title: 'Secondary' }]);
    expect(changed.workspaces).toHaveLength(1);
  });

  it('merges logs deterministically and deduplicates ids', () => {
    const local = [
      envelope('b', 2, 'alice', { type: 'set-active-workspace', workspaceId: 'two' }),
      envelope('a', 1, 'alice', { type: 'set-active-workspace', workspaceId: 'one' })
    ];
    const remote = [
      envelope('a', 1, 'alice', { type: 'set-active-workspace', workspaceId: 'ignored' }),
      envelope('c', 1, 'bob', { type: 'set-active-workspace', workspaceId: 'bob' })
    ];

    const merged = mergeDesktopLayoutOperationLogs(local, remote);

    expect(merged.map((entry) => entry.id)).toEqual(['a', 'c', 'b']);
    expect(merged[0].operation).toEqual({ type: 'set-active-workspace', workspaceId: 'one' });
  });

  it('replays operations in counter/actor order and computes the next counter', () => {
    const operations = [
      envelope('later', 2, 'bob', { type: 'set-active-workspace', workspaceId: 'later' }),
      envelope('earlier', 1, 'alice', { type: 'set-active-workspace', workspaceId: 'earlier' })
    ];

    expect(replayDesktopLayoutOperations(snapshot(), operations).activeWorkspace).toBe('later');
    expect(nextDesktopLayoutOperationCounter(operations)).toBe(3);
    expect(nextDesktopLayoutOperationCounter([])).toBe(1);
  });
});
