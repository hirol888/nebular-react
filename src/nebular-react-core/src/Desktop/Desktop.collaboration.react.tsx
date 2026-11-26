import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DesktopCollaborationAdapter, DesktopCollaborator } from './Desktop.collaboration';
import { isCollaboratorStale } from './Desktop.collaboration.layouts';
import type { DesktopLayoutSnapshot } from './Desktop.types';

const DEFAULT_COLLABORATOR_TTL_MS = 30000;
const DEFAULT_LAYOUT_DEBOUNCE_MS = 250;

export interface UseDesktopCollaboratorsOptions {
  /** Current user; its own presence is not added to the collaborator list. */
  self?: DesktopCollaborator;
  /** Defaults to true. */
  enabled?: boolean;
  /** Time without presence before a collaborator is removed. Defaults to 30000ms. */
  ttlMs?: number;
  /** How often stale collaborators are pruned. Defaults to `ttlMs`. */
  staleCheckMs?: number;
}

export interface UseDesktopCollaboratorsResult {
  collaborators: Map<string, DesktopCollaborator>;
  list: DesktopCollaborator[];
  /** Publishes the given presence (or the current `self`) with a fresh `lastSeenAt`. */
  updatePresence(presence?: DesktopCollaborator): void;
}

export function useDesktopCollaborators(
  adapter: DesktopCollaborationAdapter,
  options?: UseDesktopCollaboratorsOptions
): UseDesktopCollaboratorsResult {
  const [collaborators, setCollaborators] = useState<Map<string, DesktopCollaborator>>(
    () => new Map()
  );
  const selfRef = useRef<DesktopCollaborator | undefined>(options?.self);
  selfRef.current = options?.self;

  const enabled = options?.enabled !== false;
  const ttlOption = options?.ttlMs;
  const staleCheckOption = options?.staleCheckMs;
  const ttlMs =
    typeof ttlOption === 'number' && Number.isFinite(ttlOption) && ttlOption >= 0
      ? ttlOption
      : DEFAULT_COLLABORATOR_TTL_MS;
  const staleCheckMs =
    typeof staleCheckOption === 'number' &&
    Number.isFinite(staleCheckOption) &&
    staleCheckOption > 0
      ? staleCheckOption
      : Math.max(1, ttlMs);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const unsubscribe = adapter.subscribePresence((presence) => {
      if (!presence || typeof presence.id !== 'string' || !presence.id) {
        return;
      }

      if (selfRef.current?.id === presence.id) {
        return;
      }

      const received = { ...presence, lastSeenAt: new Date().toISOString() };

      setCollaborators((previous) => {
        const next = new Map(previous);
        next.set(received.id, received);
        return next;
      });
    });

    const interval =
      ttlMs > 0
        ? setInterval(() => {
            const now = Date.now();

            setCollaborators((previous) => {
              let changed = false;
              const next = new Map(previous);

              previous.forEach((collaborator, id) => {
                if (isCollaboratorStale(collaborator, now, ttlMs)) {
                  next.delete(id);
                  changed = true;
                }
              });

              return changed ? next : previous;
            });
          }, staleCheckMs)
        : null;

    return () => {
      unsubscribe();

      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [adapter, enabled, staleCheckMs, ttlMs]);

  const updatePresence = useCallback(
    (presence?: DesktopCollaborator) => {
      const next = presence ?? selfRef.current;

      if (!next || typeof next.id !== 'string' || !next.id) {
        return;
      }

      const stamped = { ...next, lastSeenAt: new Date().toISOString() };
      selfRef.current = stamped;
      adapter.broadcastPresence(stamped);
    },
    [adapter]
  );

  const list = useMemo(() => Array.from(collaborators.values()), [collaborators]);

  return { collaborators, list, updatePresence };
}

export interface UseCollaborativeLayoutOptions {
  /** Local snapshot; a debounced broadcast is scheduled whenever `savedAt` changes. */
  snapshot?: DesktopLayoutSnapshot;
  onRemoteLayout?(snapshot: DesktopLayoutSnapshot): void;
  /** Defaults to 250ms. */
  debounceMs?: number;
  /** Current user; kept for parity with `useDesktopCollaborators`. */
  self?: DesktopCollaborator;
  /** Defaults to true. When false the hook neither subscribes nor broadcasts. */
  enabled?: boolean;
}

export interface UseCollaborativeLayoutResult {
  /** True while a debounced local broadcast is pending. */
  broadcasting: boolean;
  /** Epoch milliseconds of the last received remote layout, or null. */
  lastReceivedAt: number | null;
}

export function useCollaborativeLayout(
  adapter: DesktopCollaborationAdapter,
  options?: UseCollaborativeLayoutOptions
): UseCollaborativeLayoutResult {
  const [broadcasting, setBroadcasting] = useState(false);
  const [lastReceivedAt, setLastReceivedAt] = useState<number | null>(null);

  const enabled = options?.enabled !== false;
  const debounceOption = options?.debounceMs;
  const debounceMs =
    typeof debounceOption === 'number' && Number.isFinite(debounceOption) && debounceOption >= 0
      ? debounceOption
      : DEFAULT_LAYOUT_DEBOUNCE_MS;
  const savedAt = options?.snapshot?.savedAt;

  const snapshotRef = useRef(options?.snapshot);
  snapshotRef.current = options?.snapshot;
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;
  const onRemoteLayoutRef = useRef(options?.onRemoteLayout);
  onRemoteLayoutRef.current = options?.onRemoteLayout;

  const lastSavedAtRef = useRef<string | undefined>(undefined);
  const hasBaselineRef = useRef(false);
  const remoteSavedAtRef = useRef<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const unsubscribe = adapter.subscribeLayout?.((snapshot) => {
      remoteSavedAtRef.current = snapshot.savedAt;
      setLastReceivedAt(Date.now());
      onRemoteLayoutRef.current?.(snapshot);
    });

    return () => {
      unsubscribe?.();
    };
  }, [adapter, enabled]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setBroadcasting(false);
      return undefined;
    }

    if (!savedAt) {
      return undefined;
    }

    // The first observed savedAt is the baseline (loaded layout), not a local change.
    if (!hasBaselineRef.current) {
      hasBaselineRef.current = true;
      lastSavedAtRef.current = savedAt;
      return undefined;
    }

    if (lastSavedAtRef.current === savedAt) {
      return undefined;
    }

    lastSavedAtRef.current = savedAt;

    // Avoid echoing a remote snapshot that the consumer just applied locally.
    if (remoteSavedAtRef.current === savedAt) {
      remoteSavedAtRef.current = undefined;
      return undefined;
    }

    if (typeof adapterRef.current.broadcastLayout !== 'function') {
      return undefined;
    }

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    setBroadcasting(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      const pending = snapshotRef.current;

      if (pending) {
        adapterRef.current.broadcastLayout?.(pending);
      }

      setBroadcasting(false);
    }, debounceMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        setBroadcasting(false);
      }
    };
  }, [debounceMs, enabled, savedAt]);

  return { broadcasting, lastReceivedAt };
}
