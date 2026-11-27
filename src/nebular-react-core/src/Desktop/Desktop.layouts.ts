import type { DesktopLayoutSnapshot, DesktopWindowSnapshot } from './Desktop.types';
import { deserializeDesktopLayout } from './Desktop.persistence';

export interface DesktopLayoutTemplate {
  id: string;
  name: string;
  description?: string;
  snapshot: DesktopLayoutSnapshot;
}

export interface SanitizeDesktopLayoutOptions {
  maxWindows?: number;
  maxStateBytes?: number;
  maxTitleLength?: number;
}

const DEFAULT_MAX_WINDOWS = 50;
const DEFAULT_MAX_STATE_BYTES = 64 * 1024;
const DEFAULT_MAX_TITLE_LENGTH = 200;

function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeState(state: unknown, maxBytes: number): unknown {
  if (state === undefined) {
    return undefined;
  }

  try {
    const json = JSON.stringify(state);

    if (json.length > maxBytes) {
      return undefined;
    }

    return JSON.parse(json) as unknown;
  } catch {
    return undefined;
  }
}

/**
 * Validates and normalizes a layout snapshot coming from an untrusted source
 * (database, import file, websocket). Keeps only serializable window fields.
 */
export function sanitizeDesktopLayout(
  snapshot: DesktopLayoutSnapshot | null | undefined,
  options: SanitizeDesktopLayoutOptions = {}
): DesktopLayoutSnapshot | null {
  if (!snapshot || !Array.isArray(snapshot.windows)) {
    return null;
  }

  const maxWindows = options.maxWindows ?? DEFAULT_MAX_WINDOWS;
  const maxStateBytes = options.maxStateBytes ?? DEFAULT_MAX_STATE_BYTES;
  const maxTitleLength = options.maxTitleLength ?? DEFAULT_MAX_TITLE_LENGTH;

  const windows: DesktopWindowSnapshot[] = snapshot.windows
    .filter(
      (window) =>
        window && typeof window.id === 'string' && window.id.length > 0 && window.id.length <= 200
    )
    .slice(0, maxWindows)
    .map((window) => ({
      id: window.id,
      appId: typeof window.appId === 'string' ? window.appId : undefined,
      workspaceId: typeof window.workspaceId === 'string' ? window.workspaceId : undefined,
      displayId: typeof window.displayId === 'string' ? window.displayId : undefined,
      title: typeof window.title === 'string' ? window.title.slice(0, maxTitleLength) : undefined,
      parentId: typeof window.parentId === 'string' ? window.parentId : undefined,
      modal: !!window.modal,
      minimized: !!window.minimized,
      maximized: !!window.maximized,
      x: finite(window.x, 0),
      y: finite(window.y, 0),
      width: Math.max(1, finite(window.width, 320)),
      height: Math.max(1, finite(window.height, 240)),
      zIndex: finite(window.zIndex, 0),
      draggable: window.draggable,
      resizable: window.resizable,
      minimizable: window.minimizable,
      maximizable: window.maximizable,
      closable: window.closable,
      alwaysOnTop: window.alwaysOnTop,
      skipTaskbar: window.skipTaskbar,
      centerOnOpen: window.centerOnOpen,
      state: safeState(window.state, maxStateBytes)
    }));

  return {
    version: 2,
    savedAt: typeof snapshot.savedAt === 'string' ? snapshot.savedAt : undefined,
    activeWorkspace:
      typeof snapshot.activeWorkspace === 'string' ? snapshot.activeWorkspace : undefined,
    workspaces: Array.isArray(snapshot.workspaces)
      ? snapshot.workspaces
          .filter(
            (workspace) =>
              workspace && typeof workspace.id === 'string' && typeof workspace.title === 'string'
          )
          .map((workspace) => ({
            id: workspace.id,
            title: workspace.title.slice(0, maxTitleLength)
          }))
      : undefined,
    windows
  };
}

export function exportDesktopLayout(snapshot: DesktopLayoutSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function importDesktopLayout(
  json: string,
  options: SanitizeDesktopLayoutOptions & { maxBytes?: number } = {}
): DesktopLayoutSnapshot | null {
  const maxBytes = options.maxBytes ?? 1024 * 1024;

  if (typeof json !== 'string' || json.length === 0 || json.length > maxBytes) {
    return null;
  }

  try {
    return sanitizeDesktopLayout(JSON.parse(json) as DesktopLayoutSnapshot, options);
  } catch {
    return null;
  }
}

export function createDesktopLayoutTemplate(
  id: string,
  name: string,
  snapshot: DesktopLayoutSnapshot,
  description?: string
): DesktopLayoutTemplate {
  return {
    id,
    name,
    description,
    snapshot: sanitizeDesktopLayout(snapshot) ?? snapshot
  };
}

/** Rehydrates a template into window states, resolving content from the app registry. */
export function createTemplateWindows(
  template: DesktopLayoutTemplate,
  apps: Parameters<typeof deserializeDesktopLayout>[1]
) {
  return deserializeDesktopLayout(template.snapshot, apps)?.windows ?? [];
}

export function layoutToTemplateSnapshot(template: DesktopLayoutTemplate): DesktopLayoutSnapshot {
  return sanitizeDesktopLayout(template.snapshot) ?? template.snapshot;
}
