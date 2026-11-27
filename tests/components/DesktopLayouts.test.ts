import {
  createDesktopLayoutTemplate,
  exportDesktopLayout,
  importDesktopLayout,
  sanitizeDesktopLayout,
  serializeDesktopLayout,
  type DesktopLayoutSnapshot,
  type DesktopWindowState
} from '@nebular-react/core';

const windowState: DesktopWindowState = {
  id: 'notes',
  appId: 'notes',
  x: 10,
  y: 20,
  width: 400,
  height: 300,
  minimized: false,
  maximized: false,
  zIndex: 1,
  state: { path: '/Documents' }
};

describe('Desktop layout utilities', () => {
  it('sanitizes untrusted snapshots and removes extra fields', () => {
    const raw = {
      ...serializeDesktopLayout([windowState]),
      windows: [
        {
          ...serializeDesktopLayout([windowState]).windows[0],
          content: 'not serializable',
          width: -10,
          state: { ok: true }
        }
      ]
    } as unknown as DesktopLayoutSnapshot;

    const clean = sanitizeDesktopLayout(raw);

    expect(clean?.version).toBe(2);
    expect(clean?.windows[0].width).toBe(1);
    expect(clean?.windows[0].state).toEqual({ ok: true });
    expect(clean?.windows[0]).not.toHaveProperty('content');
  });

  it('limits the number of windows and imports only valid JSON', () => {
    const snapshot = serializeDesktopLayout([windowState, { ...windowState, id: 'second' }]);

    expect(sanitizeDesktopLayout(snapshot, { maxWindows: 1 })?.windows).toHaveLength(1);
    expect(importDesktopLayout('{invalid')).toBeNull();

    const imported = importDesktopLayout(exportDesktopLayout(snapshot));
    expect(imported?.windows).toHaveLength(2);
  });

  it('creates reusable templates', () => {
    const snapshot = serializeDesktopLayout([windowState]);
    const template = createDesktopLayoutTemplate('focus', 'Focus', snapshot);

    expect(template.name).toBe('Focus');
    expect(template.snapshot.windows[0].id).toBe('notes');
  });
});
