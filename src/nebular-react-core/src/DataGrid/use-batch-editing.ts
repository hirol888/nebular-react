import { useEffect, useMemo, useRef, useState } from 'react';

export interface DataGridBatchEditChange<T> {
  rowId: string | number;
  /** Row snapshot at the time the change was staged. */
  row: T;
  columnKey: string;
  before: unknown;
  value: unknown;
}

export interface DataGridBatchEditLabels {
  apply: string;
  discard: string;
  pending(count: number): string;
  applying: string;
  commitError: string;
  unavailableColumn: string;
}

export interface DataGridBatchEditingOptions<T> {
  onCommit(changes: readonly DataGridBatchEditChange<T>[]): void | Promise<void>;
  /** Return a message to reject the complete set before onCommit runs. */
  validate?(changes: readonly DataGridBatchEditChange<T>[]): string | null | undefined;
  labels?: Partial<DataGridBatchEditLabels>;
}

type Drafts<T> = Map<DataGridBatchEditChange<T>['rowId'], Map<string, DataGridBatchEditChange<T>>>;

const defaultLabels: DataGridBatchEditLabels = {
  apply: 'Apply changes',
  discard: 'Discard changes',
  pending: (count) => `${count} pending ${count === 1 ? 'change' : 'changes'}`,
  applying: 'Applying changes…',
  commitError: 'Could not apply changes.',
  unavailableColumn: 'A changed column is no longer editable.'
};

export function useBatchEditing<T>(options?: DataGridBatchEditingOptions<T>) {
  const enabled = options !== undefined;
  const [drafts, setDrafts] = useState<Drafts<T>>(() => new Map());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const committing = useRef(false);
  const labels = { ...defaultLabels, ...options?.labels };

  useEffect(() => {
    if (!enabled) {
      setDrafts((current) => (current.size ? new Map() : current));
      setError(undefined);
    }
  }, [enabled]);

  const changes = useMemo(
    () => (enabled ? Array.from(drafts.values()).flatMap((row) => [...row.values()]) : []),
    [drafts, enabled]
  );

  const stage = (incoming: readonly DataGridBatchEditChange<T>[]) => {
    if (!enabled || committing.current || !incoming.length) return;

    setError(undefined);
    setDrafts((current) => {
      const next = new Map(current);
      const affectedRows = new Map<
        DataGridBatchEditChange<T>['rowId'],
        Map<string, DataGridBatchEditChange<T>>
      >();
      for (const change of incoming) {
        let cells = affectedRows.get(change.rowId);
        if (!cells) {
          cells = new Map(current.get(change.rowId));
          affectedRows.set(change.rowId, cells);
        }
        const previous = cells.get(change.columnKey);
        const before = previous ? previous.before : change.before;
        if (Object.is(before, change.value)) {
          cells.delete(change.columnKey);
        } else {
          cells.set(change.columnKey, { ...change, before });
        }
      }
      affectedRows.forEach((cells, rowId) => {
        if (cells.size) next.set(rowId, cells);
        else next.delete(rowId);
      });
      return next;
    });
  };

  const previewRow = (rowId: string | number, row: T): T => {
    const cells = enabled ? drafts.get(rowId) : undefined;
    if (!cells) return row;
    return {
      ...row,
      ...Object.fromEntries([...cells].map(([key, change]) => [key, change.value]))
    };
  };

  const discard = () => {
    if (!committing.current) {
      setDrafts(new Map());
      setError(undefined);
    }
  };

  const apply = async (validateCells: () => string | null) => {
    if (!options || !changes.length || committing.current) return;

    committing.current = true;
    setError(undefined);
    try {
      const validationError = validateCells() || options.validate?.(changes);
      if (validationError) {
        setError(validationError);
        return;
      }
      setSaving(true);
      await options.onCommit(changes);
      setDrafts(new Map());
    } catch {
      setError(labels.commitError);
    } finally {
      committing.current = false;
      setSaving(false);
    }
  };

  return {
    enabled,
    changes,
    error,
    labels,
    saving,
    stage,
    apply,
    discard,
    previewRow,
    hasChange: (rowId: string | number, columnKey: string) =>
      enabled && Boolean(drafts.get(rowId)?.has(columnKey))
  };
}
