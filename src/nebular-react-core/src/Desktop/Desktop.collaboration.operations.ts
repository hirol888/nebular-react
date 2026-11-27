import type {
  DesktopLayoutSnapshot,
  DesktopWindowSnapshot,
  DesktopWorkspaceSnapshot
} from './Desktop.types';

export type DesktopLayoutOperation =
  | { type: 'upsert-window'; window: DesktopWindowSnapshot }
  | { type: 'remove-window'; windowId: string }
  | { type: 'set-active-workspace'; workspaceId?: string }
  | { type: 'set-workspaces'; workspaces: DesktopWorkspaceSnapshot[] };

export interface DesktopLayoutOperationEnvelope {
  id: string;
  actorId: string;
  /** Lamport counter; ties are broken by `actorId`. */
  counter: number;
  timestamp: string;
  operation: DesktopLayoutOperation;
}

function cloneWindow(window: DesktopWindowSnapshot): DesktopWindowSnapshot {
  return {
    ...window,
    state: window.state === undefined ? undefined : JSON.parse(JSON.stringify(window.state))
  };
}

/**
 * Applies a single collaborative operation immutably. This is the building block for an
 * operation-based sync protocol; the snapshot merge helpers remain available for
 * last-write-wins transports.
 */
export function applyDesktopLayoutOperation(
  snapshot: DesktopLayoutSnapshot,
  operation: DesktopLayoutOperation
): DesktopLayoutSnapshot {
  switch (operation.type) {
    case 'upsert-window': {
      const existingIndex = snapshot.windows.findIndex(
        (window) => window.id === operation.window.id
      );
      const windows =
        existingIndex === -1
          ? [...snapshot.windows, cloneWindow(operation.window)]
          : snapshot.windows.map((window, index) =>
              index === existingIndex ? cloneWindow(operation.window) : window
            );

      return { ...snapshot, windows };
    }

    case 'remove-window':
      return {
        ...snapshot,
        windows: snapshot.windows.filter((window) => window.id !== operation.windowId)
      };

    case 'set-active-workspace':
      return {
        ...snapshot,
        activeWorkspace: operation.workspaceId
      };

    case 'set-workspaces':
      return {
        ...snapshot,
        workspaces: operation.workspaces.map((workspace) => ({ ...workspace }))
      };

    default:
      return snapshot;
  }
}

/** Sorts operation logs deterministically (Lamport counter, then actor, then id). */
export function sortDesktopLayoutOperations(
  operations: DesktopLayoutOperationEnvelope[]
): DesktopLayoutOperationEnvelope[] {
  return [...operations].sort(
    (first, second) =>
      first.counter - second.counter ||
      first.actorId.localeCompare(second.actorId) ||
      first.id.localeCompare(second.id)
  );
}

/** Deduplicates and merges two operation logs without mutating either input. */
export function mergeDesktopLayoutOperationLogs(
  local: DesktopLayoutOperationEnvelope[],
  remote: DesktopLayoutOperationEnvelope[]
): DesktopLayoutOperationEnvelope[] {
  const byId = new Map<string, DesktopLayoutOperationEnvelope>();

  [...local, ...remote].forEach((entry) => {
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  });

  return sortDesktopLayoutOperations(Array.from(byId.values()));
}

/** Returns the next Lamport counter for an actor, based on the local log. */
export function nextDesktopLayoutOperationCounter(
  operations: DesktopLayoutOperationEnvelope[]
): number {
  return operations.reduce((max, entry) => Math.max(max, entry.counter), 0) + 1;
}

/** Replays an operation log on top of a base snapshot. */
export function replayDesktopLayoutOperations(
  base: DesktopLayoutSnapshot,
  operations: DesktopLayoutOperationEnvelope[]
): DesktopLayoutSnapshot {
  return sortDesktopLayoutOperations(operations).reduce(
    (snapshot, entry) => applyDesktopLayoutOperation(snapshot, entry.operation),
    base
  );
}
