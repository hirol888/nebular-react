import React, { useMemo, useState } from 'react';
import { DesktopLayoutPreferences } from './DesktopLayoutPreferences';
import type { DesktopLayoutSnapshot, DesktopWindowSnapshot } from '../Desktop/Desktop.types';
import type { VersionedLayoutTransport } from '../Desktop/Desktop.persistence';

export default {
  title: 'DesktopLayoutPreferences',
  component: DesktopLayoutPreferences
};

function windowSnapshot(index: number): DesktopWindowSnapshot {
  return {
    id: `window-${index}`,
    appId: 'notes',
    title: `Notes ${index}`,
    x: 48 + index * 24,
    y: 48 + index * 24,
    width: 420,
    height: 320,
    minimized: false,
    maximized: false,
    zIndex: index
  };
}

function createLayout(count: number, savedAt: string): DesktopLayoutSnapshot {
  return {
    version: 2,
    savedAt,
    windows: Array.from({ length: count }, (_value, index) => windowSnapshot(index + 1))
  };
}

function clone(snapshot: DesktopLayoutSnapshot | null): DesktopLayoutSnapshot | null {
  return snapshot ? (JSON.parse(JSON.stringify(snapshot)) as DesktopLayoutSnapshot) : null;
}

function createInMemoryTransport(initial: DesktopLayoutSnapshot | null): VersionedLayoutTransport {
  let snapshot = clone(initial);
  let revision = 'rev-1';
  let counter = 1;

  return {
    async load() {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 150);
      });

      return snapshot ? { snapshot: clone(snapshot) as DesktopLayoutSnapshot, revision } : null;
    },
    async save(next, currentRevision) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 250);
      });

      if (typeof currentRevision !== 'undefined' && currentRevision !== revision) {
        throw new Error('revision_conflict');
      }

      snapshot = clone(next);
      counter += 1;
      revision = `rev-${counter}`;
      return { revision };
    }
  };
}

function createConflictingTransport(): VersionedLayoutTransport {
  let snapshot = createLayout(2, '2026-01-01T10:00:00.000Z');
  let revision = 'rev-1';
  let saves = 0;

  return {
    async load() {
      return { snapshot: clone(snapshot) as DesktopLayoutSnapshot, revision };
    },
    async save() {
      saves += 1;

      if (saves === 1) {
        snapshot = createLayout(4, '2026-01-03T10:00:00.000Z');
        revision = 'rev-2';
        throw new Error('revision_conflict');
      }

      return { revision };
    }
  };
}

export function DeviceAndShared() {
  const [snapshot, setSnapshot] = useState<DesktopLayoutSnapshot>(() =>
    createLayout(3, '2026-01-02T09:30:00.000Z')
  );
  const transport = useMemo(
    () => createInMemoryTransport(createLayout(2, '2026-01-01T10:00:00.000Z')),
    []
  );

  return (
    <div style={{ maxWidth: '40rem', padding: '1rem' }}>
      <DesktopLayoutPreferences
        transport={transport}
        snapshot={snapshot}
        deviceId="browser-demo"
        onLoaded={setSnapshot}
        onApplySnapshot={setSnapshot}
      />
    </div>
  );
}

export function Conflict() {
  const transport = useMemo(() => createConflictingTransport(), []);
  const snapshot = useMemo(() => createLayout(5, '2026-01-02T12:00:00.000Z'), []);
  const [applied, setApplied] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '40rem', padding: '1rem' }}>
      <DesktopLayoutPreferences
        transport={transport}
        snapshot={snapshot}
        deviceId="browser-demo"
        onApplySnapshot={(remote) => setApplied(remote.windows.length)}
      />
      {applied !== null && <p>{applied} windows applied.</p>}
    </div>
  );
}

export function LoadError() {
  const transport = useMemo<VersionedLayoutTransport>(() => {
    let calls = 0;

    return {
      async load() {
        calls += 1;
        if (calls === 1) {
          throw new Error('Network unavailable');
        }

        return {
          snapshot: createLayout(2, '2026-01-01T10:00:00.000Z'),
          revision: 'rev-1'
        };
      },
      async save() {
        return { revision: 'rev-2' };
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: '40rem', padding: '1rem' }}>
      <DesktopLayoutPreferences transport={transport} deviceId="browser-demo" />
    </div>
  );
}

export function Empty() {
  const transport = useMemo(() => createInMemoryTransport(null), []);

  return (
    <div style={{ maxWidth: '40rem', padding: '1rem' }}>
      <DesktopLayoutPreferences transport={transport} deviceId="browser-demo" />
    </div>
  );
}
