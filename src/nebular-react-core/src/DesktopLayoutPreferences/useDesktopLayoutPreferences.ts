import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  DesktopLayoutScope,
  DesktopLayoutSnapshot,
  DesktopPersistenceAdapter
} from '../Desktop/Desktop.types';
import {
  createVersionedLayoutAdapter,
  type VersionedLayoutTransport
} from '../Desktop/Desktop.persistence';

export type DesktopLayoutPreferencesStatus =
  'idle' | 'loading' | 'ready' | 'saving' | 'error' | 'conflict';

export type DesktopLayoutPreferencesConflictChoice = 'local' | 'remote';

export interface DesktopLayoutPreferencesConflict {
  /** ISO timestamp of the layout saved by this device. */
  localSavedAt?: string;
  /** ISO timestamp of the layout stored on the server. */
  remoteSavedAt?: string;
}

export interface UseDesktopLayoutPreferencesOptions {
  transport: VersionedLayoutTransport;
  /** Layout snapshot currently owned by the host (saved by `saveNow`). */
  snapshot?: DesktopLayoutSnapshot;
  /** Storage scope used for writes. Defaults to `device`. */
  scope?: DesktopLayoutScope;
  /** Device identifier shown by `DesktopLayoutPreferences`. */
  deviceId?: string;
  /** When `false`, the initial load is skipped. Defaults to `true`. */
  enabled?: boolean;
  onLoaded?(snapshot: DesktopLayoutSnapshot): void;
  /** Called when the user chooses to keep the remote layout after a conflict. */
  onApplySnapshot?(snapshot: DesktopLayoutSnapshot): void;
  onError?(error: unknown): void;
}

export interface UseDesktopLayoutPreferencesResult {
  status: DesktopLayoutPreferencesStatus;
  revision?: string | number;
  remoteSnapshot: DesktopLayoutSnapshot | null;
  conflict?: DesktopLayoutPreferencesConflict;
  loadError?: unknown;
  saveError?: unknown;
  /** Timestamp of the last successful save performed by `saveNow`/`resolveConflict('local')`. */
  lastSavedAt?: string;
  /** `true` when the server has no layout for the current scope. */
  noLayout: boolean;
  /** Stable adapter for `<Desktop layoutAdapter>`. */
  adapter: DesktopPersistenceAdapter;
  saveNow(): Promise<void>;
  refresh(): Promise<void>;
  resolveConflict(choice: DesktopLayoutPreferencesConflictChoice): Promise<void>;
}

interface RemoteLayout {
  snapshot: DesktopLayoutSnapshot | null;
  revision?: string | number;
}

interface SaveResult {
  revision?: string | number;
}

function readSavedAt(snapshot: DesktopLayoutSnapshot | null | undefined): string | undefined {
  return typeof snapshot?.savedAt === 'string' ? snapshot.savedAt : undefined;
}

/**
 * Connects a versioned layout transport to the Desktop settings UI.
 *
 * The hook owns the remote revision, surfaces optimistic-concurrency conflicts and keeps a
 * stable persistence adapter around for `<Desktop layoutAdapter={adapter}>`.
 */
export function useDesktopLayoutPreferences(
  options: UseDesktopLayoutPreferencesOptions
): UseDesktopLayoutPreferencesResult {
  const { transport, enabled = true } = options;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const snapshotRef = useRef(options.snapshot);
  snapshotRef.current = options.snapshot;

  const scopeRef = useRef<DesktopLayoutScope>(options.scope ?? 'device');
  scopeRef.current = options.scope ?? 'device';

  const [status, setStatus] = useState<DesktopLayoutPreferencesStatus>(
    enabled ? 'loading' : 'idle'
  );
  const [revision, setRevision] = useState<string | number | undefined>(undefined);
  const [remoteSnapshot, setRemoteSnapshot] = useState<DesktopLayoutSnapshot | null>(null);
  const [conflict, setConflict] = useState<DesktopLayoutPreferencesConflict | undefined>(undefined);
  const [loadError, setLoadError] = useState<unknown>(undefined);
  const [saveError, setSaveError] = useState<unknown>(undefined);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(undefined);

  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const revisionRef = useRef<string | number | undefined>(undefined);
  const remoteSnapshotRef = useRef<DesktopLayoutSnapshot | null>(null);
  const remoteSavedAtRef = useRef<string | undefined>(undefined);
  const savingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const load = useCallback(
    async (silent: boolean): Promise<RemoteLayout | null> => {
      if (typeof transport.load !== 'function') {
        revisionRef.current = undefined;
        remoteSnapshotRef.current = null;
        remoteSavedAtRef.current = undefined;

        if (mountedRef.current) {
          setRevision(undefined);
          setRemoteSnapshot(null);
          if (!silent) {
            setLoadError(undefined);
            setStatus('ready');
          }
        }

        return { snapshot: null };
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (!silent) {
        setLoadError(undefined);
        setSaveError(undefined);
        setConflict(undefined);
        setStatus('loading');
      }

      try {
        const result = await transport.load(controller.signal);

        if (controller.signal.aborted) {
          return null;
        }

        const loaded: RemoteLayout = {
          snapshot: result?.snapshot ?? null,
          revision: result?.revision
        };

        revisionRef.current = loaded.revision;
        remoteSnapshotRef.current = loaded.snapshot;
        remoteSavedAtRef.current = readSavedAt(loaded.snapshot);

        if (mountedRef.current) {
          setRevision(loaded.revision);
          setRemoteSnapshot(loaded.snapshot);

          if (!silent) {
            setLoadError(undefined);
            setStatus('ready');
            if (loaded.snapshot) {
              optionsRef.current.onLoaded?.(loaded.snapshot);
            }
          }
        }

        return loaded;
      } catch (error) {
        if (controller.signal.aborted) {
          return null;
        }

        if (silent) {
          throw error;
        }

        if (mountedRef.current) {
          setLoadError(error);
          setSaveError(undefined);
          setStatus('error');
          optionsRef.current.onError?.(error);
        }

        return null;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [transport]
  );

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort();
      abortRef.current = null;
      setStatus('idle');
      return undefined;
    }

    load(false);

    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, [enabled, load]);

  const saveNow = useCallback(async () => {
    const snapshot = snapshotRef.current;

    if (!snapshot || savingRef.current) {
      return;
    }

    savingRef.current = true;
    const revisionAtSave = revisionRef.current;
    const remoteSavedAtAtSave = remoteSavedAtRef.current;
    const scope = scopeRef.current;

    setLoadError(undefined);
    setSaveError(undefined);
    setConflict(undefined);
    setStatus('saving');

    try {
      const result = (await transport.save(snapshot, revisionAtSave, {
        scope
      })) as SaveResult | void;

      if (!mountedRef.current) {
        return;
      }

      if (result && typeof result.revision !== 'undefined') {
        revisionRef.current = result.revision;
        setRevision(result.revision);
      }

      remoteSnapshotRef.current = snapshot;
      remoteSavedAtRef.current = readSavedAt(snapshot);
      setRemoteSnapshot(snapshot);
      setLastSavedAt(readSavedAt(snapshot) ?? new Date().toISOString());
      setSaveError(undefined);
      setStatus('ready');
    } catch (error) {
      let remote: RemoteLayout | null = null;

      try {
        remote = await load(true);
      } catch {
        remote = null;
      }

      if (!mountedRef.current) {
        return;
      }

      const revisionChanged =
        !!remote &&
        typeof remote.revision !== 'undefined' &&
        !Object.is(remote.revision, revisionAtSave);
      const remoteSavedAt = readSavedAt(remote?.snapshot);
      const snapshotChanged = remoteSavedAt !== remoteSavedAtAtSave;

      if (remote && (revisionChanged || snapshotChanged)) {
        setConflict({
          localSavedAt: readSavedAt(snapshot),
          remoteSavedAt
        });
        setSaveError(undefined);
        setStatus('conflict');
      } else {
        setSaveError(error);
        setStatus('error');
        optionsRef.current.onError?.(error);
      }
    } finally {
      savingRef.current = false;
    }
  }, [load, transport]);

  const resolveConflict = useCallback(
    async (choice: DesktopLayoutPreferencesConflictChoice) => {
      if (choice === 'remote') {
        const remote = remoteSnapshotRef.current;

        setConflict(undefined);
        setSaveError(undefined);
        setStatus('ready');
        if (remote) {
          optionsRef.current.onApplySnapshot?.(remote);
        }
        return;
      }

      const snapshot = snapshotRef.current;

      if (!snapshot || savingRef.current) {
        return;
      }

      savingRef.current = true;
      setSaveError(undefined);
      setStatus('saving');

      try {
        // Force the local layout over the remote revision loaded after the failed save.
        const result = (await transport.save(snapshot, revisionRef.current, {
          scope: scopeRef.current
        })) as SaveResult | void;

        if (!mountedRef.current) {
          return;
        }

        if (result && typeof result.revision !== 'undefined') {
          revisionRef.current = result.revision;
          setRevision(result.revision);
        }

        remoteSnapshotRef.current = snapshot;
        remoteSavedAtRef.current = readSavedAt(snapshot);
        setRemoteSnapshot(snapshot);
        setLastSavedAt(readSavedAt(snapshot) ?? new Date().toISOString());
        setConflict(undefined);
        setSaveError(undefined);
        setStatus('ready');
      } catch (error) {
        if (!mountedRef.current) {
          return;
        }

        setSaveError(error);
        setStatus('error');
        optionsRef.current.onError?.(error);
      } finally {
        savingRef.current = false;
      }
    },
    [transport]
  );

  const refresh = useCallback(async () => {
    await load(false);
  }, [load]);

  const adapter = useMemo(
    () => createVersionedLayoutAdapter(transport, { scope: () => scopeRef.current }),
    [transport]
  );

  const noLayout = status === 'ready' && remoteSnapshot === null && lastSavedAt === undefined;

  return {
    status,
    revision,
    remoteSnapshot,
    conflict,
    loadError,
    saveError,
    lastSavedAt,
    noLayout,
    adapter,
    saveNow,
    refresh,
    resolveConflict
  };
}
