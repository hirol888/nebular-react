import type { DesktopCollaborator } from './Desktop.collaboration';
import type {
  DesktopLayoutSnapshot,
  DesktopWindowSnapshot,
  DesktopWorkspaceSnapshot
} from './Desktop.types';

const DEFAULT_COLLABORATOR_TTL_MS = 30000;
const ROOM_SEGMENT_FALLBACK = 'default';

function parseTimestamp(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cloneWorkspaces(workspaces: DesktopWorkspaceSnapshot[] | undefined) {
  return workspaces?.map((workspace) => ({ ...workspace }));
}

function newestSavedAt(
  local: DesktopLayoutSnapshot,
  remote: DesktopLayoutSnapshot
): string | undefined {
  const localTimestamp = parseTimestamp(local.savedAt);
  const remoteTimestamp = parseTimestamp(remote.savedAt);

  if (remoteTimestamp === null) {
    return localTimestamp === null ? (remote.savedAt ?? local.savedAt) : local.savedAt;
  }

  if (localTimestamp === null) {
    return remote.savedAt;
  }

  return remoteTimestamp >= localTimestamp ? remote.savedAt : local.savedAt;
}

/**
 * Merges two collaborative snapshots using last-write-wins on the snapshot `savedAt`.
 *
 * Windows present in both snapshots are taken from the most recent snapshot (remote wins
 * ties/missing timestamps). Windows that only exist locally are preserved, and remote-only
 * windows are appended. Inputs are never mutated; all returned window objects are clones.
 */
export function mergeCollaborativeLayouts(
  local: DesktopLayoutSnapshot,
  remote: DesktopLayoutSnapshot
): DesktopLayoutSnapshot {
  const localTimestamp = parseTimestamp(local.savedAt);
  const remoteTimestamp = parseTimestamp(remote.savedAt);
  const remoteWins =
    remoteTimestamp === null
      ? localTimestamp === null
      : localTimestamp === null || remoteTimestamp >= localTimestamp;

  const remoteById = new Map<string, DesktopWindowSnapshot>(
    remote.windows.map((window) => [window.id, window])
  );
  const localIds = new Set(local.windows.map((window) => window.id));
  const windows: DesktopWindowSnapshot[] = local.windows.map((window) => {
    const remoteWindow = remoteById.get(window.id);

    if (!remoteWindow) {
      return { ...window };
    }

    return { ...(remoteWins ? remoteWindow : window) };
  });

  remote.windows.forEach((window) => {
    if (!localIds.has(window.id)) {
      windows.push({ ...window });
    }
  });

  const workspaces = remoteWins
    ? (remote.workspaces ?? local.workspaces)
    : (local.workspaces ?? remote.workspaces);

  return {
    version: 2,
    windows,
    workspaces: cloneWorkspaces(workspaces),
    savedAt: newestSavedAt(local, remote),
    activeWorkspace: remoteWins
      ? (remote.activeWorkspace ?? local.activeWorkspace)
      : (local.activeWorkspace ?? remote.activeWorkspace)
  };
}

function sanitizeRoomSegment(value: string): string {
  const sanitized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return sanitized || ROOM_SEGMENT_FALLBACK;
}

/**
 * Builds a stable, URL/channel friendly room name for a tenant + app pair.
 * Segments are accent-stripped, lowercased, and reduced to `[a-z0-9-]`.
 */
export function createCollaborationRoom(tenantId: string, appId: string): string {
  return `${sanitizeRoomSegment(tenantId)}:${sanitizeRoomSegment(appId)}`;
}

/**
 * Returns true when a collaborator has not emitted presence within `ttlMs`.
 * Missing or invalid `lastSeenAt` values are treated as stale so they do not linger
 * in the UI forever.
 */
export function isCollaboratorStale(
  collaborator: DesktopCollaborator | null | undefined,
  now: number | Date = Date.now(),
  ttlMs: number = DEFAULT_COLLABORATOR_TTL_MS
): boolean {
  if (!collaborator || !collaborator.lastSeenAt) {
    return true;
  }

  const lastSeenTimestamp = Date.parse(collaborator.lastSeenAt);

  if (!Number.isFinite(lastSeenTimestamp)) {
    return true;
  }

  const nowTimestamp = now instanceof Date ? now.getTime() : now;
  const ttl = Number.isFinite(ttlMs) ? ttlMs : DEFAULT_COLLABORATOR_TTL_MS;

  if (!Number.isFinite(nowTimestamp)) {
    return true;
  }

  return nowTimestamp - lastSeenTimestamp >= ttl;
}
