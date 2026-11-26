import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFocusTrap, useUncontrolled } from '@nebular-react/hooks';
import { createStyles, DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Combobox } from '../Combobox';
import { DataGrid } from '../DataGrid';
import type { DataGridColumn } from '../DataGrid';
import { Input } from '../Input';
import { Modal } from '../Modal';
import { Pagination } from '../Pagination';

export interface RecordPickerRequest {
  query: string;
  /** Pages start at 1. */
  page: number;
  pageSize: number;
  /** Aborted when the request is replaced or the search closes. */
  signal: AbortSignal;
}

export interface RecordPickerPage<T> {
  records: readonly T[];
  /** Count across all pages for the current query. */
  total: number;
}

export interface RecordPickerLabels {
  search: string;
  browse: string;
  title: string;
  detailedSearch: string;
  results: string;
  selected: string;
  record: string;
  apply: string;
  cancel: string;
  loading: string;
  empty: string;
  error: string;
  retry: string;
  pagination: string;
  page(page: number): string;
  remove(label: string): string;
  select(label: string): string;
  selectionCount(count: number): string;
}

const defaultLabels: RecordPickerLabels = {
  search: 'Search records',
  browse: 'Browse records',
  title: 'Choose records',
  detailedSearch: 'Search all records',
  results: 'Matching records',
  selected: 'Selected records',
  record: 'Record',
  apply: 'Apply selection',
  cancel: 'Cancel',
  loading: 'Loading records…',
  empty: 'No records found.',
  error: 'Records could not be loaded.',
  retry: 'Retry',
  pagination: 'Record pages',
  page: (page) => `Page ${page}`,
  remove: (label) => `Remove ${label}`,
  select: (label) => `Select ${label}`,
  selectionCount: (count) => `${count} selected`
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.5rem', minWidth: 0 },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '0.5rem'
  },
  selected: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    padding: 0,
    margin: 0,
    listStyle: 'none'
  },
  dialog: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  grid: { overflowX: 'auto' },
  message: { margin: 0, color: 'var(--text-basic-color, #222b45)' },
  error: { color: 'var(--text-danger-color, #b81d51)' },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.5rem'
  }
}));

export type RecordPickerStylesNames = Selectors<typeof useStyles>;

export interface RecordPickerProps<T> extends DefaultProps<RecordPickerStylesNames> {
  searchRecords(request: RecordPickerRequest): Promise<RecordPickerPage<T>> | RecordPickerPage<T>;
  /** Return a unique and stable key across queries and pages. */
  getRecordId(record: T): string | number;
  getRecordLabel(record: T): string;
  isRecordDisabled?(record: T): boolean;
  columns?: readonly DataGridColumn<T>[];
  /** Uses an array for both selection modes; single mode keeps at most one record. */
  value?: readonly T[];
  defaultValue?: readonly T[];
  onChange?(records: readonly T[]): void;
  multiple?: boolean;
  pageSize?: number;
  searchDelay?: number;
  disabled?: boolean;
  labels?: Partial<RecordPickerLabels>;
}

type RecordRequest = Omit<RecordPickerRequest, 'signal'>;

interface RecordLookup<T> {
  request: RecordRequest;
  search: RecordPickerProps<T>['searchRecords'];
  records?: readonly T[];
  failed?: boolean;
}

interface RecordTotal<T> {
  request: RecordRequest;
  search: RecordPickerProps<T>['searchRecords'];
  total: number;
}

export function RecordPicker<T>({
  searchRecords,
  getRecordId,
  getRecordLabel,
  isRecordDisabled,
  columns,
  value,
  defaultValue,
  onChange,
  multiple = false,
  pageSize = 10,
  searchDelay = 200,
  disabled = false,
  labels,
  className,
  classNames,
  style,
  styles,
  unstyled
}: RecordPickerProps<T>) {
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, { name: 'record-picker', classNames, styles, unstyled });
  const [selected, setSelected] = useUncontrolled<readonly T[]>({
    value,
    defaultValue,
    finalValue: [],
    onChange
  });
  const selection = multiple ? selected : selected.slice(0, 1);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickFocused, setQuickFocused] = useState(false);
  const [opened, setOpened] = useState(false);
  const [dialogQuery, setDialogQuery] = useState('');
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<readonly T[]>([]);
  const [retry, setRetry] = useState(0);
  const [lookup, setLookup] = useState<RecordLookup<T>>();
  const [knownTotal, setKnownTotal] = useState<RecordTotal<T>>();
  const searchInput = useRef<HTMLInputElement>(null);
  const { elementRef } = useFocusTrap(!opened);
  const pageSizeLimit = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 10;
  const delay = Number.isFinite(searchDelay) ? Math.max(0, searchDelay) : 200;
  const query = (opened ? dialogQuery : quickQuery).trim();
  const enabled = !disabled && (opened || quickFocused);
  const requestPage = opened ? page : 1;
  const request = useMemo(
    () => (enabled ? { query, page: requestPage, pageSize: pageSizeLimit, retry } : null),
    [enabled, query, requestPage, pageSizeLimit, retry]
  );

  useEffect(() => {
    if (!request) return undefined;

    const controller = new AbortController();
    const load = async () => {
      try {
        const result = await searchRecords({
          query: request.query,
          page: request.page,
          pageSize: request.pageSize,
          signal: controller.signal
        });
        if (controller.signal.aborted) return;

        const total = Number.isFinite(result.total)
          ? Math.max(0, Math.floor(result.total))
          : result.records.length;
        const lastPage = Math.max(1, Math.ceil(total / request.pageSize));
        if (request.page > lastPage) setPage(lastPage);
        setKnownTotal({ request, search: searchRecords, total });
        setLookup({ request, search: searchRecords, records: result.records });
      } catch {
        if (!controller.signal.aborted) setLookup({ request, search: searchRecords, failed: true });
      }
    };
    const timeout = setTimeout(load, delay);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [delay, request, searchRecords]);

  const current =
    request && lookup?.request === request && lookup.search === searchRecords ? lookup : null;
  const loading = Boolean(request && !current);
  const records = current?.records ?? [];
  const quickFailed =
    !opened &&
    !disabled &&
    !loading &&
    lookup?.search === searchRecords &&
    lookup.request.query === query &&
    lookup.request.page === 1 &&
    lookup.request.pageSize === pageSizeLimit &&
    lookup.failed;
  const total =
    knownTotal?.search === searchRecords &&
    knownTotal.request.query === query &&
    knownTotal.request.pageSize === pageSizeLimit
      ? knownTotal.total
      : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSizeLimit));
  const recordKey = (record: T) => {
    const id = getRecordId(record);
    return `${typeof id}:${id}`;
  };

  const toggledSelection = (items: readonly T[], record: T) => {
    const key = getRecordId(record);
    const next = items.filter((item) => getRecordId(item) !== key);
    if (next.length !== items.length) return next;
    return multiple ? [...items, record] : [record];
  };

  const open = () => {
    setDraft(selection);
    setPage(1);
    setDialogQuery(quickQuery);
    setOpened(true);
  };

  const error = (
    <div className={classes.actions}>
      <p role="alert" className={cx(classes.message, classes.error)}>
        {text.error}
      </p>
      <Button
        type="button"
        size="small"
        appearance="outline"
        onClick={() => {
          if (!opened) searchInput.current?.focus();
          setRetry((attempt) => attempt + 1);
        }}
      >
        {text.retry}
      </Button>
    </div>
  );

  const recordColumns: DataGridColumn<T>[] = [
    ...(columns?.length
      ? columns
      : [{ key: 'record', title: text.record, render: getRecordLabel }]),
    {
      key: 'nebular-record-picker-selection',
      title: text.selected,
      render: (record) => {
        const label = getRecordLabel(record);
        const checked = draft.some((item) => getRecordId(item) === getRecordId(record));
        const blocked = disabled || isRecordDisabled?.(record);
        const toggle = () => setDraft((items) => toggledSelection(items, record));

        return multiple ? (
          <Checkbox
            aria-label={text.select(label)}
            checked={checked}
            disabled={blocked}
            onCheck={toggle}
          />
        ) : (
          <Button
            type="button"
            size="small"
            appearance={checked ? 'filled' : 'outline'}
            aria-label={text.select(label)}
            aria-pressed={checked}
            disabled={blocked}
            onClick={toggle}
          >
            {text.select(label)}
          </Button>
        );
      }
    }
  ];

  return (
    <div className={cx(classes.root, className)} style={style}>
      <div className={classes.controls}>
        <Combobox
          ref={searchInput}
          aria-label={text.search}
          placeholder={text.search}
          disabled={disabled}
          fullWidth
          options={
            opened
              ? []
              : records.map((record) => ({
                  value: recordKey(record),
                  label: getRecordLabel(record),
                  disabled: isRecordDisabled?.(record)
                }))
          }
          inputValue={quickQuery}
          value={!multiple && selection[0] !== undefined ? recordKey(selection[0]) : null}
          filterOption={false}
          listLabel={text.results}
          loading={loading && !opened}
          loadingLabel={text.loading}
          emptyLabel={quickFailed ? '' : text.empty}
          onFocus={() => setQuickFocused(true)}
          onBlur={() => setQuickFocused(false)}
          onInputChange={setQuickQuery}
          onChange={(id) => {
            const record = records.find((item) => recordKey(item) === id);
            if (record !== undefined && !isRecordDisabled?.(record) && !disabled) {
              setSelected(multiple ? toggledSelection(selection, record) : [record]);
            }
          }}
        />
        <Button type="button" appearance="outline" disabled={disabled} onClick={open}>
          {text.browse}
        </Button>
      </div>
      {quickFailed && error}
      {selection.length > 0 && (
        <ul aria-label={text.selected} className={classes.selected}>
          {selection.map((record) => {
            const id = getRecordId(record);
            const label = getRecordLabel(record);

            return (
              <li key={recordKey(record)}>
                <Button
                  type="button"
                  size="tiny"
                  appearance="outline"
                  aria-label={text.remove(label)}
                  disabled={disabled}
                  onClick={() => setSelected(selection.filter((item) => getRecordId(item) !== id))}
                >
                  {label} ×
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        ref={elementRef}
        title={text.title}
        size="min(90vw, 56rem)"
        withCloseButton={false}
      >
        <div className={classes.dialog}>
          <Input
            type="search"
            aria-label={text.detailedSearch}
            placeholder={text.detailedSearch}
            fullWidth
            disabled={disabled}
            value={dialogQuery}
            onChange={(event) => {
              setDialogQuery(event.currentTarget.value);
              setPage(1);
            }}
          />
          {current?.failed ? (
            error
          ) : (
            <div className={classes.grid} aria-busy={loading || undefined}>
              {loading ? (
                <p role="status" className={classes.message}>
                  {text.loading}
                </p>
              ) : (
                <DataGrid
                  data={[...records]}
                  columns={recordColumns}
                  getRowId={getRecordId}
                  withPagination={false}
                  ariaLabel={text.results}
                  emptyState={text.empty}
                />
              )}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              ariaLabel={text.pagination}
              getItemA11yLabel={text.page}
              withControls={false}
              disabled={disabled || loading}
            />
          )}
          <div className={classes.actions}>
            <span role="status">{text.selectionCount(draft.length)}</span>
            <Button type="button" appearance="outline" onClick={() => setOpened(false)}>
              {text.cancel}
            </Button>
            <Button
              type="button"
              status="primary"
              disabled={disabled}
              onClick={() => {
                setSelected(multiple ? draft : draft.slice(0, 1));
                setOpened(false);
              }}
            >
              {text.apply}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
