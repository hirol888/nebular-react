import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Checkbox } from '../Checkbox';
import { EmptyState } from '../EmptyState';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Button } from '../Button';
import { LoadingOverlay } from '../LoadingOverlay';
import { Pagination } from '../Pagination';
import { Portal } from '../Portal';
import { Table } from '../Table';
import useStyles from './DataGrid.style';
import {
  type DataGridBatchEditLabels,
  type DataGridBatchEditingOptions,
  useBatchEditing
} from './use-batch-editing';

export type DataGridStylesNames = Selectors<typeof useStyles>;

export type DataGridSortDirection = 'asc' | 'desc';

export type DataGridFilterValues = Record<string, string>;

export interface DataGridPinnedColumns {
  left?: string[];
  right?: string[];
}

export interface DataGridView {
  id: string;
  name: string;
  sort?: DataGridSort | null;
  filters?: Record<string, string>;
  hiddenColumnKeys?: string[];
  columnOrder?: string[];
  columnWidths?: Record<string, number>;
  pinnedColumns?: DataGridPinnedColumns;
  pageSize?: number;
}

interface DataGridGroupNode<T> {
  key: string;
  value: string;
  depth: number;
  rows: { row: T; index: number }[];
  allRows: { row: T; index: number }[];
  children: DataGridGroupNode<T>[];
}

/**
 * A group of rows that was already grouped and aggregated by the server.
 *
 * The grid never recomputes `aggregates`; each entry is rendered as-is under
 * the matching column key. `rows` holds the group's own rows and `children`
 * holds nested groups (already flattened by the server).
 */
export interface DataGridServerGroup<T> {
  key: string;
  label: React.ReactNode;
  depth?: number;
  count?: number;
  aggregates?: Partial<Record<string, unknown>>;
  rows: T[];
  children?: DataGridServerGroup<T>[];
}

/** A row of the flattened tree, produced from `data` plus `getRowChildren`. */
interface DataGridTreeRow<T> {
  row: T;
  key: string | number;
  depth: number;
  hasChildren: boolean;
}

type DataGridServerGroupEntry<T> =
  { type: 'group'; group: DataGridServerGroup<T>; depth: number } | { type: 'row'; index: number };

export interface DataGridEditingCell {
  rowId: string | number;
  columnKey: string;
}

export interface DataGridRangeSelection {
  startRowId: string | number;
  endRowId: string | number;
  startColumnKey: string;
  endColumnKey: string;
}

/** A single cell change produced by pasting a clipboard TSV block into a range. */
export interface DataGridRangePasteChange {
  rowId: string | number;
  columnKey: string;
  value: string;
}

/** A single cell change produced by dragging or using the keyboard on the fill handle. */
export interface DataGridRangeFillChange {
  rowId: string | number;
  columnKey: string;
  value: unknown;
}

export interface DataGridSort {
  key: string;
  direction: DataGridSortDirection;
}

/**
 * A reversible action tracked while `withUndoRedo` is enabled.
 *
 * `cell` and `row` entries store the previous and the committed value so undo
 * can re-emit `onCellEdit`/`onRowEdit` with `before` (and redo with `after`).
 * `reorder` entries store the original indexes and are replayed through
 * `onRowReorder`.
 */
export interface DataGridUndoRedoEntry<T = unknown> {
  type: 'cell' | 'row' | 'reorder';
  rowId?: string | number;
  row?: T;
  columnKey?: string;
  before?: unknown;
  after?: unknown;
  fromIndex?: number;
  toIndex?: number;
}

export type DataGridAggregate = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'none';

export type DataGridFilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'notBetween'
  | 'isEmpty'
  | 'isNotEmpty';

export type DataGridFilterType = 'text' | 'number' | 'date';

export interface DataGridColumn<T> {
  key: string;
  title: React.ReactNode;
  filterType?: DataGridFilterType;
  filterOperator?: DataGridFilterOperator;
  aggregate?: DataGridAggregate | ((rows: T[]) => React.ReactNode);
  summaryValue?(row: T): number | null | undefined;
  summaryFormatter?(value: number): React.ReactNode;
  sortable?: boolean;
  sortValue?(row: T): string | number | boolean | Date | null | undefined;
  filterable?: boolean;
  filterValue?(row: T): string | number | boolean | null | undefined;
  filterPlaceholder?: string;
  filterAriaLabel?: string;
  render?(row: T, rowIndex: number): React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: React.CSSProperties['width'];
  minWidth?: number;
  maxWidth?: number;
  hideable?: boolean;
  exportable?: boolean;
  exportTitle?: string;
  exportValue?(row: T): string | number | boolean | Date | null | undefined;
  editable?: boolean;
  pinned?: 'left' | 'right';
  /**
   * Validates the value typed in the built-in cell editor (or passed to a custom
   * editor's `onSave`) before `onCellEdit` is emitted. Return an error message to
   * block the commit and keep the cell in edit mode, or `null`/`undefined` when
   * the value is valid.
   */
  validateCell?(value: unknown, row: T): string | null | undefined;
  /**
   * Number of columns this header/body/footer cell should span. Only applied when
   * the grid is not virtualized, column virtualization is off, columns are not
   * pinned, headers are flat (no grouped headers) and no extra rows (grouping,
   * expansion, row editing) are interleaved with the data rows. Resize, reorder
   * and range selection keep using the first (visible) column of the span.
   */
  colSpan?: number;
  /**
   * Number of rows this cell should span. Headers can span into the filter row
   * (`withColumnFilters`) and body cells span statically across data rows (the
   * covered rows omit the cell). Footer cells only honor `colSpan`, since there
   * are no following footer rows. Applied under the same conditions as `colSpan`.
   */
  rowSpan?: number;
  children?: DataGridColumn<T>[];
}

export type DataGridDensity = 'compact' | 'comfortable' | 'spacious';

type DataGridRowKey = string | number;

type DataGridTranslate = (
  key: string,
  fallback: string,
  params?: Record<string, string | number>
) => string;

/**
 * User-facing strings rendered by the grid. Every entry defaults to the
 * provider locale catalog (`dataGrid.*`), falling back to English when no
 * translation is available. Parameterized entries receive the row id, column
 * title or count so the sentence can be rebuilt in the active locale.
 */
export interface DataGridLabels {
  /** Accessible name of the grid region. */
  region: string;
  noData: string;
  loading: string;
  undo: string;
  redo: string;
  editHistory: string;
  savedViews: string;
  noView: string;
  saveView: string;
  viewName: string;
  deleteView: string;
  exportCsv: string;
  exportExcel: string;
  exportedFile(fileName: string): string;
  columns: string;
  noColumns: string;
  selectAllRows: string;
  selectRow(rowId: DataGridRowKey): string;
  expandRow(rowId: DataGridRowKey): string;
  collapseRow(rowId: DataGridRowKey): string;
  expandGroup(groupKey: string): string;
  collapseGroup(groupKey: string): string;
  /** Visually hidden header of the row reorder column. */
  reorderColumnHeader: string;
  rowDetails: string;
  actions: string;
  selection: string;
  reorderRow(rowId: DataGridRowKey): string;
  reorderColumn(columnTitle: string): string;
  resizeColumn(columnTitle: string): string;
  columnOptions(columnTitle: string): string;
  sortAscending: string;
  sortDescending: string;
  pinLeft: string;
  pinRight: string;
  unpin: string;
  hideColumn: string;
  filterBy(columnTitle: string): string;
  filterFrom(columnTitle: string): string;
  filterTo(columnTitle: string): string;
  filterPlaceholder: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  filters: string;
  fillHandle: string;
  editRow(rowId: DataGridRowKey): string;
  editCell(columnTitle: string, rowId: DataGridRowKey): string;
  editColumn(columnTitle: string): string;
  save: string;
  cancel: string;
  groupTotal: string;
  /** Accessible name of the batch editing controls. */
  batchChanges: string;
  applyChanges: string;
  discardChanges: string;
  pendingChanges(count: number): string;
  applying: string;
  commitError: string;
  unavailableColumn: string;
  rowsCopied(count: number): string;
  cellsPasted(count: number): string;
  cellsFilled(count: number): string;
}

function createDataGridLabels(t: DataGridTranslate): DataGridLabels {
  return {
    region: t('dataGrid.region', 'Data grid'),
    noData: t('dataGrid.noData', 'No data'),
    loading: t('dataGrid.loading', 'Loading data…'),
    undo: t('dataGrid.undo', 'Undo'),
    redo: t('dataGrid.redo', 'Redo'),
    editHistory: t('dataGrid.editHistory', 'Edit history'),
    savedViews: t('dataGrid.savedViews', 'Saved views'),
    noView: t('dataGrid.noView', 'No view'),
    saveView: t('dataGrid.saveView', 'Save view'),
    viewName: t('dataGrid.viewName', 'View name'),
    deleteView: t('dataGrid.deleteView', 'Delete view'),
    exportCsv: t('dataGrid.exportCsv', 'Export CSV'),
    exportExcel: t('dataGrid.exportExcel', 'Export Excel'),
    exportedFile: (fileName) => t('dataGrid.exportedFile', 'Exported {fileName}', { fileName }),
    columns: t('dataGrid.columns', 'Columns'),
    noColumns: t('dataGrid.noColumns', 'No columns'),
    selectAllRows: t('dataGrid.selectAllOnPage', 'Select all rows on this page'),
    selectRow: (rowId) => `${t('dataGrid.selectRow', 'Select row')} ${rowId}`,
    expandRow: (rowId) => `${t('dataGrid.expandRow', 'Expand row')} ${rowId}`,
    collapseRow: (rowId) => `${t('dataGrid.collapseRow', 'Collapse row')} ${rowId}`,
    expandGroup: (groupKey) => `${t('dataGrid.expandGroup', 'Expand group')} ${groupKey}`,
    collapseGroup: (groupKey) => `${t('dataGrid.collapseGroup', 'Collapse group')} ${groupKey}`,
    reorderColumnHeader: t('dataGrid.reorder', 'Reorder'),
    rowDetails: t('dataGrid.rowDetails', 'Row details'),
    actions: t('dataGrid.actions', 'Actions'),
    selection: t('dataGrid.selection', 'Selection'),
    reorderRow: (rowId) =>
      t('dataGrid.reorderRow', 'Reorder row {row}. Use Alt+ArrowUp or Alt+ArrowDown.', {
        row: rowId
      }),
    reorderColumn: (columnTitle) =>
      t('dataGrid.reorderColumn', 'Reorder {column}. Use Alt+ArrowLeft or Alt+ArrowRight.', {
        column: columnTitle
      }),
    resizeColumn: (columnTitle) =>
      t('dataGrid.resizeColumn', 'Resize {column}', { column: columnTitle }),
    columnOptions: (columnTitle) =>
      t('dataGrid.columnOptions', 'Column options for {column}', { column: columnTitle }),
    sortAscending: t('dataGrid.sortAscending', 'Sort ascending'),
    sortDescending: t('dataGrid.sortDescending', 'Sort descending'),
    pinLeft: t('dataGrid.pinLeft', 'Pin left'),
    pinRight: t('dataGrid.pinRight', 'Pin right'),
    unpin: t('dataGrid.unpin', 'Unpin'),
    hideColumn: t('dataGrid.hideColumn', 'Hide column'),
    filterBy: (columnTitle) =>
      t('dataGrid.filterBy', 'Filter by {column}', { column: columnTitle }),
    filterFrom: (columnTitle) =>
      t('dataGrid.filterFrom', 'Filter {column} from', { column: columnTitle }),
    filterTo: (columnTitle) =>
      t('dataGrid.filterTo', 'Filter {column} to', { column: columnTitle }),
    filterPlaceholder: t('dataGrid.filterPlaceholder', 'Filter'),
    fromPlaceholder: t('dataGrid.from', 'From'),
    toPlaceholder: t('dataGrid.to', 'To'),
    filters: t('dataGrid.filters', 'Filters'),
    fillHandle: t('dataGrid.fillHandle', 'Fill handle'),
    editRow: (rowId) => t('dataGrid.editRow', 'Edit row {row}', { row: rowId }),
    editCell: (columnTitle, rowId) =>
      t('dataGrid.editCell', 'Edit {column} for row {row}', { column: columnTitle, row: rowId }),
    editColumn: (columnTitle) => t('dataGrid.editColumn', 'Edit {column}', { column: columnTitle }),
    save: t('common.save', 'Save'),
    cancel: t('common.cancel', 'Cancel'),
    groupTotal: t('dataGrid.groupTotal', 'Group total'),
    batchChanges: t('dataGrid.batchChanges', 'Batch changes'),
    applyChanges: t('dataGrid.applyChanges', 'Apply changes'),
    discardChanges: t('dataGrid.discardChanges', 'Discard changes'),
    pendingChanges: (count) =>
      count === 1
        ? t('dataGrid.pendingChange', '{count} pending change', { count })
        : t('dataGrid.pendingChanges', '{count} pending changes', { count }),
    applying: t('dataGrid.applying', 'Applying changes…'),
    commitError: t('dataGrid.commitError', 'Could not apply changes.'),
    unavailableColumn: t('dataGrid.unavailableColumn', 'A changed column is no longer editable.'),
    rowsCopied: (count) =>
      count === 1
        ? t('dataGrid.rowCopied', '{count} row copied', { count })
        : t('dataGrid.rowsCopied', '{count} rows copied', { count }),
    cellsPasted: (count) =>
      count === 1
        ? t('dataGrid.cellPasted', '{count} cell pasted', { count })
        : t('dataGrid.cellsPasted', '{count} cells pasted', { count }),
    cellsFilled: (count) =>
      count === 1
        ? t('dataGrid.cellFilled', '{count} cell filled', { count })
        : t('dataGrid.cellsFilled', '{count} cells filled', { count })
  };
}

export interface DataGridProps<T>
  extends
    DefaultProps<DataGridStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  data: T[];
  columns: DataGridColumn<T>[];
  getRowId?(row: T, index: number): string | number;
  caption?: React.ReactNode;
  ariaLabel?: string;
  /**
   * Overrides the user-facing strings rendered by the grid. Defaults come from
   * the `NebularProvider` locale catalog (`dataGrid.*`), falling back to English.
   */
  labels?: Partial<DataGridLabels>;
  /** Visual row density. Defaults to `comfortable`. */
  density?: DataGridDensity;
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  onPageChange?(page: number): void;
  sortKey?: string;
  sortDirection?: DataGridSortDirection;
  defaultSortKey?: string;
  defaultSortDirection?: DataGridSortDirection;
  onSortChange?(sort: DataGridSort | null): void;
  withColumnFilters?: boolean;
  filterValues?: DataGridFilterValues;
  defaultFilterValues?: DataGridFilterValues;
  onFilterChange?(filterValues: DataGridFilterValues): void;
  withViews?: boolean;
  views?: DataGridView[];
  defaultViews?: DataGridView[];
  onViewsChange?(views: DataGridView[]): void;
  activeViewId?: string | null;
  defaultActiveViewId?: string | null;
  onActiveViewChange?(id: string | null): void;
  viewStorageKey?: string;
  withColumnResize?: boolean;
  columnWidths?: Record<string, number>;
  defaultColumnWidths?: Record<string, number>;
  onColumnWidthChange?(columnWidths: Record<string, number>): void;
  minColumnWidth?: number;
  withColumnReorder?: boolean;
  columnOrder?: string[];
  defaultColumnOrder?: string[];
  onColumnOrderChange?(columnOrder: string[]): void;
  withColumnVisibility?: boolean;
  hiddenColumnKeys?: string[];
  defaultHiddenColumnKeys?: string[];
  onHiddenColumnsChange?(hiddenColumnKeys: string[]): void;
  withColumnMenu?: boolean;
  virtualizeColumns?: boolean;
  columnVirtualizationThreshold?: number;
  columnVirtualizationOverscan?: number;
  pinnedColumns?: DataGridPinnedColumns;
  defaultPinnedColumns?: DataGridPinnedColumns;
  onPinnedColumnsChange?(pinnedColumns: DataGridPinnedColumns): void;
  withRowExpansion?: boolean;
  expandedRowIds?: (string | number)[];
  defaultExpandedRowIds?: (string | number)[];
  onExpandedRowsChange?(expandedRowIds: (string | number)[]): void;
  renderRowExpansion?(row: T, rowIndex: number): React.ReactNode;
  withExport?: boolean;
  exportFileName?: string;
  exportScope?: 'filtered' | 'page';
  exportSeparator?: string;
  withExportHeaders?: boolean;
  onExport?(csv: string, fileName: string): void;
  /**
   * Adds an "Export Excel" toolbar button. The grid writes an HTML table with
   * the Excel namespaces downloaded as `.xls`
   * (`application/vnd.ms-excel`), without any external dependency, honoring
   * visible/exportable columns, headers and the summary row.
   */
  withExcelExport?: boolean;
  /** Base file name for the Excel export; the `.xls` extension is appended. */
  excelFileName?: string;
  /** Receives the generated Excel HTML instead of triggering a download. */
  onExcelExport?(html: string, fileName: string): void;
  groupBy?: string | string[] | ((row: T) => string);
  groupLabel?(groupKey: string, rows: T[]): React.ReactNode;
  renderGroupHeader?(groupKey: string, rows: T[]): React.ReactNode;
  collapsibleGroups?: boolean;
  expandedGroupKeys?: string[];
  defaultExpandedGroupKeys?: string[];
  onExpandedGroupsChange?(groupKeys: string[]): void;
  withSummary?: boolean;
  withGroupSummary?: boolean;
  summaryScope?: 'filtered' | 'page';
  summaryLabel?: React.ReactNode;
  withRowReorder?: boolean;
  onRowReorder?(fromIndex: number, toIndex: number): void;
  withRangeSelection?: boolean;
  rangeSelection?: DataGridRangeSelection | null;
  defaultRangeSelection?: DataGridRangeSelection | null;
  onRangeSelectionChange?(range: DataGridRangeSelection | null): void;
  /**
   * Enables pasting TSV text from the clipboard into the range selection anchor.
   * The grid never mutates `data`; consume `onRangePaste` to apply the changes.
   */
  onRangePaste?(changes: DataGridRangePasteChange[], text: string): void;
  /**
   * Displays a fill handle at the bottom-right corner of the selected range.
   * Dragging it (or using the arrow keys and pressing Enter) copies the source
   * edge values into the extended cells and reports them through `onRangeFill`.
   */
  withFillHandle?: boolean;
  onRangeFill?(
    changes: DataGridRangeFillChange[],
    sourceRange: DataGridRangeSelection,
    targetRange: DataGridRangeSelection
  ): void;
  withRowEditing?: boolean;
  withCellEditing?: boolean;
  /**
   * Stages inline cell, clipboard and fill edits for a single explicit commit.
   * Use a stable getRowId across paging. The application owns persistence.
   * Unavailable with server-side grouping.
   */
  batchEditing?: DataGridBatchEditingOptions<T>;
  editingCell?: DataGridEditingCell | null;
  defaultEditingCell?: DataGridEditingCell | null;
  onEditingCellChange?(cell: DataGridEditingCell | null): void;
  onCellEdit?(row: T, columnKey: string, value: unknown): void;
  /** Called when `validateCell` blocks a cell edit, with the returned message. */
  onCellValidationError?(row: T, columnKey: string, message: string): void;
  renderCellEditor?(
    row: T,
    column: DataGridColumn<T>,
    value: unknown,
    onSave: (value: unknown) => void,
    onCancel: () => void
  ): React.ReactNode;
  editingRowId?: string | number | null;
  defaultEditingRowId?: string | number | null;
  onEditingRowChange?(rowId: string | number | null): void;
  onRowEdit?(row: T, changes: Partial<T>): void;
  /**
   * Tracks cell/row edits and row reorders so they can be reverted with
   * Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z or Ctrl+Y and the optional toolbar buttons.
   * The grid never mutates `data`: undo/redo re-emits `onCellEdit`,
   * `onRowEdit` or `onRowReorder` so the owner applies the inverse change.
   * The history is cleared when the row set changes (rows added, removed or
   * replaced) and limited by `maxHistory`.
   */
  withUndoRedo?: boolean;
  /** Maximum number of reversible actions kept in memory. Defaults to 50. */
  maxHistory?: number;
  /** Called after an undo re-emits the inverse edit. */
  onUndo?(entry: DataGridUndoRedoEntry<T>): void;
  /** Called after a redo re-emits the original edit. */
  onRedo?(entry: DataGridUndoRedoEntry<T>): void;
  renderRowEditor?(
    row: T,
    onSave: (changes: Partial<T>) => void,
    onCancel: () => void
  ): React.ReactNode;
  withSelection?: boolean;
  selectedRowIds?: (string | number)[];
  defaultSelectedRowIds?: (string | number)[];
  onSelectionChange?(selectedRowIds: (string | number)[]): void;
  serverSide?: boolean;
  /** Skips local sorting and reports the requested sort through `onSortChange`. */
  serverSideSorting?: boolean;
  /** Skips local filtering and reports the filter values through `onFilterChange`. */
  serverSideFiltering?: boolean;
  totalRows?: number;
  loading?: boolean;
  loadingMessage?: React.ReactNode;
  withPagination?: boolean;
  virtualized?: boolean;
  /** Fixed row height used when `getRowHeight` is not provided. */
  virtualizedRowHeight?: number;
  /**
   * Returns the height in pixels of a virtualized row, allowing variable row
   * heights. `index` is the zero-based position inside the rendered page.
   * Offsets are cumulative, so the window, spacers and the scroll position of
   * the active row stay correct. Falls back to `virtualizedRowHeight`.
   *
   * Variable heights are incompatible with `rowSpan`/`colSpan` sequencing and
   * row expansion: both disable virtualization, so the grid renders a plain
   * table when they are active.
   */
  getRowHeight?(row: T, index: number): number;
  virtualizedMaxHeight?: number;
  overscan?: number;
  striped?: boolean;
  highlightOnHover?: boolean;
  withBorder?: boolean;
  emptyState?: React.ReactNode;
  /**
   * Renders `data` as a tree. Root rows come from `data` and children come from
   * `getRowChildren`; expansion state is tracked per row key.
   *
   * Tree mode renders the whole hierarchy at once: pagination and row
   * virtualization are ignored while it is active, and it is disabled when
   * `groupBy` or `serverSideGrouping` is set. Local filters prune branches
   * (a parent stays visible when a descendant matches) and sorting applies
   * among siblings. Provide stable row ids (`getRowId` or an `id` field) so
   * expansion survives data updates.
   */
  treeData?: boolean;
  getRowChildren?(row: T): T[] | undefined;
  /** Column that receives the indentation and the expand/collapse button. Defaults to the first visible column. */
  treeColumnKey?: string;
  defaultExpandedRowKeys?: (string | number)[];
  expandedRowKeys?: (string | number)[];
  onExpandedRowKeysChange?(expandedRowKeys: (string | number)[]): void;
  /** Indentation in pixels applied per tree depth. */
  treeIndent?: number;
  /**
   * Renders pre-grouped/pre-aggregated data coming from the server. When
   * enabled, `data` is ignored in favor of `groupedData` and the grid does not
   * recompute any aggregate. It does not combine with `treeData`, `groupBy`,
   * virtualization, column pinning or editing; those features are disabled
   * while server-side grouping is active.
   */
  serverSideGrouping?: boolean;
  groupedData?: DataGridServerGroup<T>[];
  /** Alias of `onExpandedGroupsChange` for server-side groups. */
  onExpandedGroupKeysChange?(groupKeys: string[]): void;
  /**
   * Measures the header plus a sample of cells and derives column widths.
   * Explicit widths in `columnWidths` are kept. Widths are clamped by
   * `minColumnWidth`/`maxColumnWidth` and reported through
   * `onColumnWidthChange`; they are recomputed when columns or data change.
   * Measurement uses the canvas `measureText` API when available and falls
   * back to a character-count estimate.
   */
  withColumnAutofit?: boolean;
  autofitSampleSize?: number;
  maxColumnWidth?: number;
}

const defaultProps: Partial<DataGridProps<Record<string, unknown>>> = {
  defaultPage: 1,
  pageSize: 10,
  defaultSortDirection: 'asc',
  defaultFilterValues: {},
  withViews: false,
  defaultViews: [],
  defaultActiveViewId: null,
  withColumnResize: false,
  defaultColumnWidths: {},
  minColumnWidth: 80,
  withColumnReorder: false,
  defaultColumnOrder: [],
  withColumnVisibility: false,
  defaultHiddenColumnKeys: [],
  withColumnMenu: false,
  virtualizeColumns: false,
  columnVirtualizationThreshold: 15,
  columnVirtualizationOverscan: 2,
  defaultPinnedColumns: {},
  withRowExpansion: false,
  defaultExpandedRowIds: [],
  withExport: false,
  exportFileName: 'export.csv',
  exportScope: 'filtered',
  exportSeparator: ',',
  withExportHeaders: true,
  withExcelExport: false,
  excelFileName: 'data-grid',
  collapsibleGroups: false,
  withSummary: false,
  withGroupSummary: false,
  summaryScope: 'filtered',
  withRowReorder: false,
  withRangeSelection: false,
  defaultRangeSelection: null,
  withFillHandle: false,
  withRowEditing: false,
  withCellEditing: false,
  withUndoRedo: false,
  maxHistory: 50,
  defaultEditingCell: null,
  defaultEditingRowId: null,
  withSelection: false,
  defaultSelectedRowIds: [],
  withPagination: true,
  serverSide: false,
  serverSideSorting: false,
  serverSideFiltering: false,
  loading: false,
  virtualized: false,
  virtualizedRowHeight: 44,
  virtualizedMaxHeight: 420,
  overscan: 3,
  striped: false,
  highlightOnHover: true,
  withBorder: true,
  treeData: false,
  defaultExpandedRowKeys: [],
  treeIndent: 16,
  serverSideGrouping: false,
  groupedData: [],
  withColumnAutofit: false,
  autofitSampleSize: 50,
  maxColumnWidth: 480,
  density: 'comfortable'
};

export interface DataGridFilterRange {
  min: string;
  max: string;
}

export function parseRangeFilterValue(value: string | null | undefined): DataGridFilterRange {
  const [min = '', max = ''] = String(value ?? '').split(',');

  return { min: min.trim(), max: max.trim() };
}

function toRangeComparable(
  value: string | number | boolean | Date | null | undefined,
  asDate: boolean
): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (asDate) {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value.getTime();
    }

    const time = Date.parse(String(value));

    return Number.isNaN(time) ? null : time;
  }

  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value));

  return Number.isFinite(numeric) ? numeric : null;
}

function isDateLike(value: string | number | boolean | Date | null | undefined): boolean {
  if (value instanceof Date) {
    return true;
  }

  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed === '' || Number.isFinite(Number(trimmed))) {
    return false;
  }

  return !Number.isNaN(Date.parse(trimmed));
}

export function matchesRangeFilter(
  rawValue: string | number | boolean | Date | null | undefined,
  filterValue: string,
  operator: DataGridFilterOperator = 'between'
): boolean {
  const { min, max } = parseRangeFilterValue(filterValue);

  if (min === '' && max === '') {
    return true;
  }

  const asDate = isDateLike(rawValue);

  if (asDate) {
    return matchRangeBounds(rawValue, min, max, operator, true);
  }

  if (!Number.isFinite(toRangeComparable(rawValue, false))) {
    return true;
  }

  return matchRangeBounds(rawValue, min, max, operator, false);
}

function matchRangeBounds(
  rawValue: string | number | boolean | Date | null | undefined,
  min: string,
  max: string,
  operator: DataGridFilterOperator,
  asDate: boolean
): boolean {
  const rawComparable = toRangeComparable(rawValue, asDate);
  const minComparable = min === '' ? null : toRangeComparable(min, asDate);
  const maxComparable = max === '' ? null : toRangeComparable(max, asDate);

  if (rawComparable === null) {
    return true;
  }

  if ((min !== '' && minComparable === null) || (max !== '' && maxComparable === null)) {
    return true;
  }

  const inRange =
    (minComparable === null || rawComparable >= minComparable) &&
    (maxComparable === null || rawComparable <= maxComparable);

  return operator === 'notBetween' ? !inRange : inRange;
}

function matchesFilterOperator(
  rawValue: string | number | boolean | null | undefined,
  filterValue: string,
  operator: DataGridFilterOperator
): boolean {
  const normalized = String(rawValue ?? '').toLowerCase();
  const query = filterValue.trim().toLowerCase();
  const numericValue =
    typeof rawValue === 'number' ? rawValue : Number.parseFloat(normalized.replace(',', '.'));
  const numericQuery = Number.parseFloat(query.replace(',', '.'));

  switch (operator) {
    case 'between':
    case 'notBetween':
      return matchesRangeFilter(rawValue, filterValue, operator);
    case 'equals':
      return normalized === query;
    case 'notEquals':
      return normalized !== query;
    case 'startsWith':
      return normalized.startsWith(query);
    case 'endsWith':
      return normalized.endsWith(query);
    case 'notContains':
      return !normalized.includes(query);
    case 'isEmpty':
      return normalized.length === 0;
    case 'isNotEmpty':
      return normalized.length > 0;
    case 'gt':
      return (
        Number.isFinite(numericValue) &&
        Number.isFinite(numericQuery) &&
        numericValue > numericQuery
      );
    case 'gte':
      return (
        Number.isFinite(numericValue) &&
        Number.isFinite(numericQuery) &&
        numericValue >= numericQuery
      );
    case 'lt':
      return (
        Number.isFinite(numericValue) &&
        Number.isFinite(numericQuery) &&
        numericValue < numericQuery
      );
    case 'lte':
      return (
        Number.isFinite(numericValue) &&
        Number.isFinite(numericQuery) &&
        numericValue <= numericQuery
      );
    default:
      return normalized.includes(query);
  }
}

function getRowValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function rowMatchesFilterEntries<T>(
  row: T,
  filters: [string, string][],
  columns: DataGridColumn<T>[]
): boolean {
  return filters.every(([key, value]) => {
    const column = columns.find((item) => item.key === key);

    if (!column) {
      return true;
    }

    const rawValue = column.filterValue
      ? column.filterValue(row)
      : (getRowValue(row, key) as string | number | boolean | null | undefined);

    return matchesFilterOperator(rawValue, value, column.filterOperator ?? 'contains');
  });
}

function countServerGroupRows<T>(group: DataGridServerGroup<T>): number {
  if (typeof group.count === 'number') {
    return group.count;
  }

  const children = group.children ?? [];

  return (
    group.rows.length + children.reduce((total, child) => total + countServerGroupRows(child), 0)
  );
}

/** Extra horizontal room reserved for cell padding, borders and the tree toggle. */
const AUTOFIT_CELL_PADDING = 28;
/** Fallback glyph width used when canvas measurement is unavailable (jsdom/SSR). */
const AUTOFIT_CHAR_WIDTH = 8;
const AUTOFIT_FONT = '400 0.8125rem sans-serif';

function compareValues(
  valueA: string | number | boolean | Date | null | undefined,
  valueB: string | number | boolean | Date | null | undefined
): number {
  if (valueA == null && valueB == null) return 0;
  if (valueA == null) return 1;
  if (valueB == null) return -1;

  if (valueA instanceof Date && valueB instanceof Date) {
    return valueA.getTime() - valueB.getTime();
  }

  if (typeof valueA === 'number' && typeof valueB === 'number') {
    return valueA - valueB;
  }

  if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
    return Number(valueA) - Number(valueB);
  }

  return String(valueA).localeCompare(String(valueB), undefined, {
    numeric: true,
    sensitivity: 'base'
  });
}

export interface DataGridCsvOptions {
  separator?: string;
  withHeaders?: boolean;
}

export function createDataGridCsv<T>(
  data: T[],
  columns: DataGridColumn<T>[],
  { separator = ',', withHeaders = true }: DataGridCsvOptions = {}
): string {
  const stringify = (value: string | number | boolean | Date | null | undefined): string => {
    if (value === null || value === undefined) {
      return '';
    }

    return value instanceof Date ? value.toISOString() : String(value);
  };

  const escapeValue = (value: string | number | boolean | Date | null | undefined): string => {
    const text = stringify(value);

    return text.includes(separator) || text.includes('"') || /[\n\r]/.test(text)
      ? `"${text.replace(/"/g, '""')}"`
      : text;
  };

  const getValue = (row: T, column: DataGridColumn<T>) => {
    if (column.exportValue) {
      return column.exportValue(row);
    }

    if (column.sortValue) {
      return column.sortValue(row);
    }

    return getRowValue(row, column.key) as string | number | boolean | Date | null | undefined;
  };

  const lines: string[] = [];

  if (withHeaders) {
    lines.push(
      columns
        .map((column) =>
          escapeValue(
            column.exportTitle ?? (typeof column.title === 'string' ? column.title : column.key)
          )
        )
        .join(separator)
    );
  }

  data.forEach((row) => {
    lines.push(columns.map((column) => escapeValue(getValue(row, column))).join(separator));
  });

  return lines.join('\r\n');
}

export interface DataGridExcelOptions<T> {
  /** Base file name; `.xls` is appended when missing. Defaults to `data-grid`. */
  fileName?: string;
  /** Renders the column titles as a header row. Defaults to `true`. */
  withHeaders?: boolean;
  /** Rows used to compute the `aggregate` footer cells. Omit to skip the summary row. */
  summaryRows?: T[];
  /** Label written in the first summary cell when that column has no aggregate. */
  summaryLabel?: React.ReactNode;
  /** Name of the worksheet embedded in the workbook metadata. */
  sheetName?: string;
}

const EXCEL_MIME_TYPE = 'application/vnd.ms-excel';
/** Leading characters Excel interprets as a formula (CSV/HTML injection guard). */
const EXCEL_FORMULA_PREFIX = /^[=+\-@\t\r]/;
const EXCEL_SHEET_INVALID_CHARS = /[\\/?*:[\]]/g;

function escapeExcelHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatExcelCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : escapeExcelHtml(value.toISOString());
  }

  const text = String(value);

  return escapeExcelHtml(EXCEL_FORMULA_PREFIX.test(text) ? `'${text}` : text);
}

function getDataGridExcelFileName(fileName?: string): string {
  const base = String(fileName ?? '').trim() || 'data-grid';

  return /\.xls$/i.test(base) ? base : `${base.replace(/\.(xlsx?|csv|html?)$/i, '')}.xls`;
}

function computeDataGridAggregate<T>(column: DataGridColumn<T>, rows: T[]): number | string | null {
  if (!column.aggregate || column.aggregate === 'none') {
    return null;
  }

  if (typeof column.aggregate === 'function') {
    const value = column.aggregate(rows);

    return typeof value === 'number' || typeof value === 'string' ? value : null;
  }

  if (column.aggregate === 'count') {
    return rows.length;
  }

  const values = rows
    .map((row) => (column.summaryValue ? column.summaryValue(row) : getRowValue(row, column.key)))
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((accumulator, value) => accumulator + value, 0);

  if (column.aggregate === 'avg') {
    return total / values.length;
  }

  if (column.aggregate === 'min') {
    return Math.min(...values);
  }

  if (column.aggregate === 'max') {
    return Math.max(...values);
  }

  return total;
}

/**
 * Builds the HTML table understood by Excel (Office HTML, `.xls`). The output
 * uses the Excel namespaces, escapes HTML and neutralizes formula injection
 * (`=`, `+`, `-`, `@`) without any external dependency.
 */
export function createDataGridExcel<T>(
  columns: DataGridColumn<T>[],
  rows: T[],
  options: DataGridExcelOptions<T> = {}
): string {
  const { withHeaders = true, summaryRows, summaryLabel = 'Total', sheetName = 'Sheet1' } = options;
  const safeSheetName = escapeExcelHtml(
    (String(sheetName).replace(EXCEL_SHEET_INVALID_CHARS, ' ').trim() || 'Sheet1').slice(0, 31)
  );
  const renderRow = (cells: string[], className?: string) =>
    `<tr${className ? ` class="${className}"` : ''}>${cells
      .map((cell) => `<td>${cell}</td>`)
      .join('')}</tr>`;

  const headerCells = columns.map(
    (column) =>
      `<th>${formatExcelCell(
        column.exportTitle ?? (typeof column.title === 'string' ? column.title : column.key)
      )}</th>`
  );
  const bodyRows = rows.map((row) =>
    renderRow(
      columns.map((column) => {
        const value = column.exportValue
          ? column.exportValue(row)
          : column.sortValue
            ? column.sortValue(row)
            : getRowValue(row, column.key);

        return formatExcelCell(value);
      })
    )
  );
  const summaryRow = summaryRows
    ? renderRow(
        columns.map((column, index) => {
          const aggregate = computeDataGridAggregate(column, summaryRows);
          const fallback =
            index === 0 && (typeof summaryLabel === 'string' || typeof summaryLabel === 'number')
              ? summaryLabel
              : null;

          return formatExcelCell(aggregate ?? fallback);
        }),
        'summary'
      )
    : null;

  return [
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" ',
    'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">',
    '<head>',
    '<meta http-equiv="content-type" content="text/html; charset=utf-8" />',
    '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>',
    `<x:Name>${safeSheetName}</x:Name>`,
    '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>',
    '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->',
    '</head>',
    '<body>',
    '<table>',
    withHeaders && headerCells.length > 0 ? `<thead><tr>${headerCells.join('')}</tr></thead>` : '',
    '<tbody>',
    ...bodyRows,
    '</tbody>',
    summaryRow ? `<tfoot>${summaryRow}</tfoot>` : '',
    '</table>',
    '</body>',
    '</html>'
  ].join('');
}

function triggerExcelDownload(html: string, fileName: string): void {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return;
  }

  const blob = new Blob([html], { type: EXCEL_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}

/**
 * Generates the Excel HTML and triggers the browser download. Returns the
 * generated HTML so callers can inspect or forward it.
 */
export function exportDataGridExcel<T>(
  columns: DataGridColumn<T>[],
  rows: T[],
  options: DataGridExcelOptions<T> = {}
): string {
  const html = createDataGridExcel(columns, rows, options);

  triggerExcelDownload(html, getDataGridExcelFileName(options.fileName));

  return html;
}

function flattenColumns<T>(columns: DataGridColumn<T>[]): DataGridColumn<T>[] {
  return columns.flatMap((column) =>
    column.children && column.children.length > 0 ? flattenColumns(column.children) : [column]
  );
}

function createDataGridViewId(name: string, views: DataGridView[]): string {
  const base =
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'view';
  const existingIds = new Set(views.map((view) => view.id));
  let candidate = base;
  let suffix = 2;

  while (existingIds.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function countLeafColumns<T>(column: DataGridColumn<T>): number {
  return column.children && column.children.length > 0
    ? column.children.reduce((total, child) => total + countLeafColumns(child), 0)
    : 1;
}

export interface DataGridColumnRange {
  start: number;
  end: number;
}

export function getVirtualColumnRange(
  offsets: number[],
  widths: number[],
  scrollLeft: number,
  viewportWidth: number,
  overscan = 2
): DataGridColumnRange {
  const count = offsets.length;

  if (count === 0 || viewportWidth <= 0) {
    return { start: 0, end: count };
  }

  const left = Math.max(0, scrollLeft);
  const right = left + viewportWidth;
  let start = 0;

  while (start < count && offsets[start] + widths[start] < left) {
    start += 1;
  }

  start = Math.max(0, start - overscan);

  let end = start;

  while (end < count && offsets[end] < right) {
    end += 1;
  }

  end = Math.min(count, end + overscan);

  return { start, end: Math.max(start, end) };
}

export interface DataGridRowRange {
  start: number;
  end: number;
  topSpacer: number;
  bottomSpacer: number;
  totalHeight: number;
}

/**
 * Resolves the virtualized row window from cumulative row offsets (length
 * `rows + 1`, starting at `0`). Supports variable row heights, an overscan in
 * rows and returns the heights of the top/bottom spacers and the total height.
 */
export function getVirtualRowRange(
  offsets: number[],
  scrollTop: number,
  viewportHeight: number,
  overscan = 3
): DataGridRowRange {
  const count = Math.max(0, offsets.length - 1);
  const totalHeight = offsets[count] ?? 0;

  if (count === 0) {
    return { start: 0, end: 0, topSpacer: 0, bottomSpacer: 0, totalHeight: 0 };
  }

  const top = Math.max(0, scrollTop);
  const extra = Math.max(0, overscan);
  let low = 0;
  let high = count;

  // Binary search for the row that contains `top`.
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if ((offsets[middle] ?? totalHeight) <= top) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  const start = Math.max(0, low - extra);
  const bottom = top + Math.max(0, viewportHeight);
  let end = low;

  while (end < count && (offsets[end] ?? totalHeight) < bottom) {
    end += 1;
  }

  end = Math.min(count, end + extra);

  return {
    start,
    end: Math.max(start, end),
    topSpacer: offsets[start] ?? 0,
    bottomSpacer: Math.max(0, totalHeight - (offsets[end] ?? totalHeight)),
    totalHeight
  };
}

function DataGrid<T>(props: DataGridProps<T>) {
  const {
    data,
    columns,
    getRowId,
    caption,
    ariaLabel,
    labels,
    density,
    page,
    defaultPage,
    pageSize,
    onPageChange,
    sortKey,
    sortDirection,
    defaultSortKey,
    defaultSortDirection,
    onSortChange,
    withColumnFilters,
    filterValues,
    defaultFilterValues,
    onFilterChange,
    withViews,
    views,
    defaultViews,
    onViewsChange,
    activeViewId,
    defaultActiveViewId,
    onActiveViewChange,
    viewStorageKey,
    withColumnResize,
    columnWidths,
    defaultColumnWidths,
    onColumnWidthChange,
    minColumnWidth,
    withColumnReorder,
    columnOrder,
    defaultColumnOrder,
    onColumnOrderChange,
    withColumnVisibility,
    hiddenColumnKeys,
    defaultHiddenColumnKeys,
    onHiddenColumnsChange,
    withColumnMenu,
    virtualizeColumns,
    columnVirtualizationThreshold,
    columnVirtualizationOverscan,
    pinnedColumns,
    defaultPinnedColumns,
    onPinnedColumnsChange,
    withRowExpansion,
    expandedRowIds,
    defaultExpandedRowIds,
    onExpandedRowsChange,
    renderRowExpansion,
    withExport,
    exportFileName,
    exportScope,
    exportSeparator,
    withExportHeaders,
    onExport,
    withExcelExport,
    excelFileName,
    onExcelExport,
    groupBy,
    groupLabel,
    renderGroupHeader,
    collapsibleGroups,
    expandedGroupKeys,
    defaultExpandedGroupKeys,
    onExpandedGroupsChange,
    withRowEditing,
    withCellEditing,
    batchEditing,
    editingCell,
    defaultEditingCell,
    onEditingCellChange,
    onCellEdit,
    onCellValidationError,
    renderCellEditor,
    editingRowId,
    defaultEditingRowId,
    onEditingRowChange,
    onRowEdit,
    withUndoRedo,
    maxHistory,
    onUndo,
    onRedo,
    renderRowEditor,
    withSummary,
    withGroupSummary,
    summaryScope,
    summaryLabel,
    withRowReorder,
    onRowReorder,
    withRangeSelection,
    rangeSelection,
    defaultRangeSelection,
    onRangeSelectionChange,
    onRangePaste,
    withFillHandle,
    onRangeFill,
    serverSide,
    serverSideSorting,
    serverSideFiltering,
    totalRows,
    loading,
    loadingMessage,
    withSelection,
    selectedRowIds,
    defaultSelectedRowIds,
    onSelectionChange,
    withPagination,
    virtualized,
    virtualizedRowHeight,
    getRowHeight,
    virtualizedMaxHeight,
    overscan,
    striped,
    highlightOnHover,
    withBorder,
    emptyState,
    treeData,
    getRowChildren,
    treeColumnKey,
    defaultExpandedRowKeys,
    expandedRowKeys,
    onExpandedRowKeysChange,
    treeIndent,
    serverSideGrouping,
    groupedData,
    onExpandedGroupKeysChange,
    withColumnAutofit,
    autofitSampleSize,
    maxColumnWidth,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps as DataGridProps<T>, props);
  const { classes, cx } = useStyles(null, { name: 'data-grid', classNames, styles, unstyled });
  const { t } = useNebularLocale();
  const resolvedLabels = useMemo<DataGridLabels>(
    () => ({ ...createDataGridLabels(t), ...labels }),
    [t, labels]
  );
  const resolvedAriaLabel = ariaLabel ?? resolvedLabels.region;
  const resolvedEmptyState = emptyState ?? resolvedLabels.noData;
  const resolvedLoadingMessage = loadingMessage ?? resolvedLabels.loading;

  const [internalSort, setInternalSort] = useState<DataGridSort | null>(
    defaultSortKey ? { key: defaultSortKey, direction: defaultSortDirection || 'asc' } : null
  );
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | number)[]>(
    defaultSelectedRowIds || []
  );
  const [internalFilterValues, setInternalFilterValues] = useState<DataGridFilterValues>(
    defaultFilterValues || {}
  );
  const [internalPageSize, setInternalPageSize] = useState<number>(pageSize);
  const readStoredViews = (): DataGridView[] => {
    if (!withViews || !viewStorageKey || typeof window === 'undefined') {
      return defaultViews ?? [];
    }

    try {
      const raw = window.localStorage.getItem(viewStorageKey);

      if (!raw) {
        return defaultViews ?? [];
      }

      const parsed = JSON.parse(raw) as unknown;

      return Array.isArray(parsed) ? (parsed as DataGridView[]) : (defaultViews ?? []);
    } catch {
      return defaultViews ?? [];
    }
  };
  const [internalViews, setInternalViews] = useState<DataGridView[]>(readStoredViews);
  const [internalActiveViewId, setInternalActiveViewId] = useState<string | null>(
    defaultActiveViewId ?? null
  );
  const [isViewFormOpen, setIsViewFormOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const lastAppliedViewIdRef = useRef<string | null>(null);
  const [internalColumnWidths, setInternalColumnWidths] = useState<Record<string, number>>(
    defaultColumnWidths || {}
  );
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(
    defaultColumnOrder || []
  );
  const [internalHiddenColumnKeys, setInternalHiddenColumnKeys] = useState<string[]>(
    defaultHiddenColumnKeys || []
  );
  const [internalPinnedColumns, setInternalPinnedColumns] = useState<DataGridPinnedColumns>(
    defaultPinnedColumns || {}
  );
  const [openColumnMenuKey, setOpenColumnMenuKey] = useState<string | null>(null);
  const columnMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<(string | number)[]>(
    defaultExpandedRowIds || []
  );
  const [internalExpandedGroupKeys, setInternalExpandedGroupKeys] = useState<string[] | null>(
    defaultExpandedGroupKeys ?? null
  );
  const [internalExpandedTreeKeys, setInternalExpandedTreeKeys] = useState<(string | number)[]>(
    defaultExpandedRowKeys || []
  );
  const [internalEditingRowId, setInternalEditingRowId] = useState<string | number | null>(
    defaultEditingRowId ?? null
  );
  const [rowEditDraft, setRowEditDraft] = useState<Record<string, unknown>>({});
  const [internalEditingCell, setInternalEditingCell] = useState<DataGridEditingCell | null>(
    defaultEditingCell ?? null
  );
  const [cellEditValue, setCellEditValue] = useState('');
  const [cellEditError, setCellEditError] = useState<string | null>(null);
  const cellEditCancelledRef = useRef(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [columnViewportWidth, setColumnViewportWidth] = useState(0);
  const [internalRangeSelection, setInternalRangeSelection] =
    useState<DataGridRangeSelection | null>(defaultRangeSelection ?? null);
  const rangeAnchorRef = useRef<{ rowId: string | number; columnKey: string } | null>(null);
  const [fillTargetRange, setFillTargetRange] = useState<DataGridRangeSelection | null>(null);
  const fillDragRef = useRef<{
    source: DataGridRangeSelection;
    startX: number;
    startY: number;
    target: DataGridRangeSelection | null;
  } | null>(null);
  const [rangeCopyMessage, setRangeCopyMessage] = useState('');
  const [excelExportMessage, setExcelExportMessage] = useState('');
  const columnWidthsRef = useRef<Record<string, number>>({});
  const resizeStateRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const draggedColumnKeyRef = useRef<string | null>(null);
  const [currentPage, setCurrentPage] = useUncontrolled<number>({
    value: page,
    defaultValue: defaultPage,
    finalValue: 1,
    onChange: onPageChange
  });
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(0);
  const headRef = useRef<HTMLTableSectionElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const activeSort = useMemo<DataGridSort | null>(
    () =>
      sortKey !== undefined
        ? sortKey
          ? { key: sortKey, direction: sortDirection || 'asc' }
          : null
        : internalSort,
    [sortKey, sortDirection, internalSort]
  );
  const activeFilterValues = filterValues ?? internalFilterValues;
  const filterValuesKey = JSON.stringify(activeFilterValues);
  const activePageSize = props.pageSize !== undefined ? pageSize : internalPageSize;
  const activeViews = views ?? internalViews;
  const resolvedActiveViewId = activeViewId !== undefined ? activeViewId : internalActiveViewId;
  const activeView = activeViews.find((view) => view.id === resolvedActiveViewId) ?? null;
  const activeSelectedIds = selectedRowIds ?? internalSelectedIds;
  const activeColumnWidths = columnWidths ?? internalColumnWidths;
  columnWidthsRef.current = activeColumnWidths;

  const orderedColumns = useMemo(() => {
    const byKey = new Map(columns.map((column) => [column.key, column]));
    const order = columnOrder !== undefined ? columnOrder : internalColumnOrder;
    const result: DataGridColumn<T>[] = [];

    order.forEach((key) => {
      const column = byKey.get(key);

      if (column) {
        result.push(column);
        byKey.delete(key);
      }
    });

    byKey.forEach((column) => result.push(column));

    return result;
  }, [columns, columnOrder, internalColumnOrder]);

  const activeHiddenColumnKeys = hiddenColumnKeys ?? internalHiddenColumnKeys;
  const activePinnedColumns = pinnedColumns ?? internalPinnedColumns;
  const activeExpandedRowIds = expandedRowIds ?? internalExpandedRowIds;
  const activeExpandedGroupKeys = expandedGroupKeys ?? internalExpandedGroupKeys ?? [];
  const activeExpandedTreeKeys = expandedRowKeys ?? internalExpandedTreeKeys;
  // Tree data renders the full hierarchy, so pagination/virtualization are
  // bypassed. Local grouping and server-side grouping take precedence instead.
  const effectiveTreeData = Boolean(
    treeData && typeof getRowChildren === 'function' && !groupBy && !serverSideGrouping
  );
  const effectivePagination = Boolean(withPagination && !effectiveTreeData && !serverSideGrouping);
  const activeEditingRowId = editingRowId !== undefined ? editingRowId : internalEditingRowId;
  const activeEditingCell = editingCell !== undefined ? editingCell : internalEditingCell;
  const activeRangeSelection =
    rangeSelection !== undefined ? rangeSelection : internalRangeSelection;

  const filterVisibleTree = (nodes: DataGridColumn<T>[]): DataGridColumn<T>[] =>
    nodes.reduce<DataGridColumn<T>[]>((result, column) => {
      if (activeHiddenColumnKeys.includes(column.key)) {
        return result;
      }

      if (column.children && column.children.length > 0) {
        const children = filterVisibleTree(column.children);

        if (children.length > 0) {
          result.push({ ...column, children });
        }

        return result;
      }

      result.push(column);
      return result;
    }, []);

  const visibleTree = filterVisibleTree(orderedColumns);
  const allLeafColumns = useMemo(() => flattenColumns(columns), [columns]);
  const visibleColumns = flattenColumns(visibleTree);

  const hasGroupedHeaders = visibleTree.some(
    (column) => !!column.children && column.children.length > 0
  );

  const getPinnedSide = (column: DataGridColumn<T>): 'left' | 'right' | undefined => {
    if (hasGroupedHeaders || serverSideGrouping) {
      return undefined;
    }

    if (activePinnedColumns.left?.includes(column.key)) {
      return 'left';
    }

    if (activePinnedColumns.right?.includes(column.key)) {
      return 'right';
    }

    return column.pinned;
  };

  const headerColumns = hasGroupedHeaders
    ? visibleTree
    : [
        ...visibleTree.filter((column) => getPinnedSide(column) === 'left'),
        ...visibleTree.filter((column) => getPinnedSide(column) === undefined),
        ...visibleTree.filter((column) => getPinnedSide(column) === 'right')
      ];
  const displayColumns = flattenColumns(headerColumns);
  const leafTopLevelMap = new Map<string, DataGridColumn<T>>();

  headerColumns.forEach((topLevel) => {
    flattenColumns([topLevel]).forEach((leaf) => leafTopLevelMap.set(leaf.key, topLevel));
  });

  const resolveRowId = useCallback(
    (row: T, index: number): string | number => {
      const fallbackId = getRowValue(row, 'id');

      return getRowId
        ? getRowId(row, index)
        : typeof fallbackId === 'string' || typeof fallbackId === 'number'
          ? fallbackId
          : index;
    },
    [getRowId]
  );

  const serverSorting = Boolean(serverSide || serverSideSorting);
  const serverFiltering = Boolean(serverSide || serverSideFiltering);

  const sortedData = useMemo(() => {
    if (serverSorting || !activeSort) {
      return data;
    }

    const column = allLeafColumns.find((item) => item.key === activeSort.key);

    if (!column?.sortable) {
      return data;
    }

    const multiplier = activeSort.direction === 'asc' ? 1 : -1;

    return [...data].sort((rowA, rowB) => {
      const valueA = column.sortValue
        ? column.sortValue(rowA)
        : (getRowValue(rowA, column.key) as string | number | boolean | Date | null | undefined);
      const valueB = column.sortValue
        ? column.sortValue(rowB)
        : (getRowValue(rowB, column.key) as string | number | boolean | Date | null | undefined);

      return compareValues(valueA, valueB) * multiplier;
    });
  }, [activeSort, allLeafColumns, data, serverSorting]);

  const activeFilterEntries = useMemo(
    () =>
      Object.entries(activeFilterValues).filter(([key, value]) => {
        const column = allLeafColumns.find((item) => item.key === key && item.filterable);

        if (!column) {
          return false;
        }

        const operator = column.filterOperator ?? 'contains';

        return operator === 'isEmpty' || operator === 'isNotEmpty' ? true : value.trim() !== '';
      }),
    [activeFilterValues, allLeafColumns]
  );

  const filteredData = useMemo(() => {
    if (serverFiltering) {
      return data;
    }

    if (activeFilterEntries.length === 0) {
      return sortedData;
    }

    return sortedData.filter((row) =>
      rowMatchesFilterEntries(row, activeFilterEntries, allLeafColumns)
    );
  }, [activeFilterEntries, allLeafColumns, sortedData, serverFiltering, data]);

  const expandedTreeKeySet = useMemo(
    () => new Set(activeExpandedTreeKeys),
    [activeExpandedTreeKeys]
  );

  const treeRows = useMemo(() => {
    if (!effectiveTreeData) {
      return [] as DataGridTreeRow<T>[];
    }

    const sortColumn = activeSort
      ? allLeafColumns.find((column) => column.key === activeSort.key)
      : undefined;
    const sortMultiplier = activeSort?.direction === 'desc' ? -1 : 1;
    const sortable = Boolean(sortColumn?.sortable) && !serverSorting;
    const filters = serverFiltering ? [] : activeFilterEntries;

    const sortValue = (row: T) =>
      sortColumn?.sortValue
        ? sortColumn.sortValue(row)
        : (getRowValue(row, sortColumn?.key ?? '') as
            string | number | boolean | Date | null | undefined);

    const flatten = (
      rows: T[],
      depth: number,
      parentPath: string,
      output: DataGridTreeRow<T>[]
    ): boolean => {
      const siblings = sortable
        ? [...rows].sort(
            (rowA, rowB) => compareValues(sortValue(rowA), sortValue(rowB)) * sortMultiplier
          )
        : rows;
      let hasVisibleRow = false;

      siblings.forEach((row, index) => {
        const path = parentPath ? `${parentPath}.${index}` : String(index);
        const children = getRowChildren ? (getRowChildren(row) ?? []) : [];
        const childRows: DataGridTreeRow<T>[] = [];
        const hasVisibleChild = flatten(children, depth + 1, path, childRows);
        const selfVisible =
          filters.length === 0 || rowMatchesFilterEntries(row, filters, allLeafColumns);

        if (!selfVisible && !hasVisibleChild) {
          return;
        }

        const id = getRowId ? getRowId(row, output.length) : getRowValue(row, 'id');
        const key = typeof id === 'string' || typeof id === 'number' ? id : path;

        output.push({ row, key, depth, hasChildren: childRows.length > 0 });

        if (childRows.length > 0 && expandedTreeKeySet.has(key)) {
          output.push(...childRows);
        }

        hasVisibleRow = true;
      });

      return hasVisibleRow;
    };

    const result: DataGridTreeRow<T>[] = [];

    flatten(data, 0, '', result);

    return result;
  }, [
    effectiveTreeData,
    activeSort,
    allLeafColumns,
    activeFilterEntries,
    expandedTreeKeySet,
    data,
    getRowChildren,
    getRowId,
    serverSorting,
    serverFiltering
  ]);

  const treePageData = useMemo(() => treeRows.map((entry) => entry.row), [treeRows]);
  const treePageRowIds = useMemo(() => treeRows.map((entry) => entry.key), [treeRows]);
  const treeEntryMap = useMemo(
    () => new Map(treeRows.map((entry) => [entry.key, entry])),
    [treeRows]
  );
  const activeTreeColumnKey = treeColumnKey ?? displayColumns[0]?.key;

  const serverGrouped = useMemo(() => {
    const rows: T[] = [];
    const rowIds: (string | number)[] = [];
    const entries: DataGridServerGroupEntry<T>[] = [];

    if (!serverSideGrouping) {
      return { rows, rowIds, entries };
    }

    const isExpanded = (groupKey: string) => {
      if (expandedGroupKeys !== undefined) {
        return expandedGroupKeys.includes(groupKey);
      }

      if (internalExpandedGroupKeys === null) {
        return true;
      }

      return internalExpandedGroupKeys.includes(groupKey);
    };

    const walk = (groups: DataGridServerGroup<T>[], depth: number) => {
      groups.forEach((group) => {
        entries.push({ type: 'group', group, depth: group.depth ?? depth });

        if (!isExpanded(group.key)) {
          return;
        }

        if (group.children && group.children.length > 0) {
          walk(group.children, depth + 1);
        }

        group.rows.forEach((row) => {
          entries.push({ type: 'row', index: rows.length });
          rows.push(row);
          rowIds.push(resolveRowId(row, rowIds.length));
        });
      });
    };

    walk(groupedData ?? [], 0);

    return { rows, rowIds, entries };
  }, [serverSideGrouping, groupedData, expandedGroupKeys, internalExpandedGroupKeys, resolveRowId]);

  const allServerGroupKeys = useMemo(() => {
    const keys: string[] = [];

    const walk = (groups: DataGridServerGroup<T>[]) => {
      groups.forEach((group) => {
        keys.push(group.key);
        walk(group.children ?? []);
      });
    };

    if (serverSideGrouping) {
      walk(groupedData ?? []);
    }

    return keys;
  }, [serverSideGrouping, groupedData]);

  const totalRowCount = effectiveTreeData
    ? treeRows.length
    : serverSideGrouping
      ? serverGrouped.rows.length
      : serverSide
        ? (totalRows ?? data.length)
        : filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRowCount / activePageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const basePageData = serverSide
    ? data
    : effectivePagination
      ? filteredData.slice((activePage - 1) * activePageSize, activePage * activePageSize)
      : filteredData;
  const pageData = effectiveTreeData
    ? treePageData
    : serverSideGrouping
      ? serverGrouped.rows
      : basePageData;
  const pageRowIds = effectiveTreeData
    ? treePageRowIds
    : serverSideGrouping
      ? serverGrouped.rowIds
      : basePageData.map((row, index) =>
          resolveRowId(row, (activePage - 1) * activePageSize + index)
        );
  const hasRenderableRows = serverSideGrouping
    ? serverGrouped.entries.length > 0
    : pageData.length > 0;

  const undoStackRef = useRef<DataGridUndoRedoEntry<T>[]>([]);
  const redoStackRef = useRef<DataGridUndoRedoEntry<T>[]>([]);
  const datasetIdsRef = useRef<string[] | null>(null);
  const [, setHistoryVersion] = useState(0);
  const canUndo = Boolean(withUndoRedo) && undoStackRef.current.length > 0;
  const canRedo = Boolean(withUndoRedo) && redoStackRef.current.length > 0;

  const bumpHistory = () => setHistoryVersion((version) => version + 1);

  // Editing updates the dataset in place (same rows, new values), so the
  // history is only cleared when the row set itself changes. Undo/redo never
  // needs to mutate `data`: it re-emits the owner callbacks instead.
  useEffect(() => {
    const nextIds = data.map((row, index) => String(resolveRowId(row, index)));
    const previousIds = datasetIdsRef.current;

    datasetIdsRef.current = nextIds;

    if (!withUndoRedo) {
      undoStackRef.current = [];
      redoStackRef.current = [];
      return;
    }

    if (!previousIds || previousIds.length === 0) {
      return;
    }

    if (nextIds.length === previousIds.length) {
      const previousSet = new Set(previousIds);

      if (nextIds.every((id) => previousSet.has(id))) {
        return;
      }
    }

    undoStackRef.current = [];
    redoStackRef.current = [];
    bumpHistory();
  }, [data, resolveRowId, withUndoRedo]);

  const findHistoryRow = (rowId: string | number): T | undefined => {
    const pageIndex = pageRowIds.indexOf(rowId);

    if (pageIndex >= 0) {
      return pageData[pageIndex];
    }

    const dataIndex = data.findIndex((row, index) => resolveRowId(row, index) === rowId);

    return dataIndex >= 0 ? data[dataIndex] : undefined;
  };

  const getHistoryRowId = (row: T): string | number => {
    const pageIndex = pageData.indexOf(row);

    if (pageIndex >= 0) {
      return pageRowIds[pageIndex];
    }

    return resolveRowId(row, data.indexOf(row));
  };

  const pushHistory = (entry: DataGridUndoRedoEntry<T>) => {
    if (!withUndoRedo) {
      return;
    }

    const limit = Math.max(1, Number.isFinite(maxHistory) ? Math.floor(maxHistory as number) : 50);
    const stack = undoStackRef.current;

    stack.push(entry);

    if (stack.length > limit) {
      stack.splice(0, stack.length - limit);
    }

    redoStackRef.current = [];
    bumpHistory();
  };

  const emitHistoryEntry = (entry: DataGridUndoRedoEntry<T>, direction: 'undo' | 'redo') => {
    const row = entry.rowId !== undefined ? (findHistoryRow(entry.rowId) ?? entry.row) : entry.row;

    if (entry.type === 'cell' && row && entry.columnKey) {
      const value = direction === 'undo' ? entry.before : entry.after;

      typeof onCellEdit === 'function' && onCellEdit(row, entry.columnKey, value);
    } else if (entry.type === 'row' && row) {
      const changes = (direction === 'undo' ? entry.before : entry.after) as Partial<T>;

      typeof onRowEdit === 'function' && onRowEdit(row, changes);
    } else if (entry.type === 'reorder') {
      const from = direction === 'undo' ? entry.toIndex : entry.fromIndex;
      const to = direction === 'undo' ? entry.fromIndex : entry.toIndex;

      if (typeof from === 'number' && typeof to === 'number') {
        typeof onRowReorder === 'function' && onRowReorder(from, to);
      }
    }

    if (direction === 'undo') {
      typeof onUndo === 'function' && onUndo(entry);
    } else {
      typeof onRedo === 'function' && onRedo(entry);
    }

    bumpHistory();
  };

  const handleUndo = () => {
    if (!withUndoRedo) {
      return;
    }

    const entry = undoStackRef.current.pop();

    if (!entry) {
      return;
    }

    redoStackRef.current.push(entry);
    emitHistoryEntry(entry, 'undo');
  };

  const handleRedo = () => {
    if (!withUndoRedo) {
      return;
    }

    const entry = redoStackRef.current.pop();

    if (!entry) {
      return;
    }

    undoStackRef.current.push(entry);
    emitHistoryEntry(entry, 'redo');
  };

  const handleUndoRedoKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!withUndoRedo || (!event.ctrlKey && !event.metaKey)) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 'z') {
      event.preventDefault();

      if (event.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if (key === 'y' && !event.shiftKey) {
      event.preventDefault();
      handleRedo();
    }
  };

  const groupedPageTree = useMemo(() => {
    if (
      serverSideGrouping ||
      effectiveTreeData ||
      !groupBy ||
      (Array.isArray(groupBy) && groupBy.length === 0)
    ) {
      return null;
    }

    const groupKeys = Array.isArray(groupBy) ? groupBy : null;

    const resolveValue = (row: T, depth: number): string => {
      if (typeof groupBy === 'function') {
        return groupBy(row);
      }

      if (groupKeys) {
        return String(getRowValue(row, groupKeys[depth]) ?? '');
      }

      if (typeof groupBy === 'string') {
        return String(getRowValue(row, groupBy) ?? '');
      }

      return '';
    };

    const build = (
      entries: { row: T; index: number }[],
      depth: number,
      parentKey: string
    ): DataGridGroupNode<T>[] => {
      const buckets = new Map<string, { row: T; index: number }[]>();

      entries.forEach((entry) => {
        const value = resolveValue(entry.row, depth);
        const bucket = buckets.get(value);

        if (bucket) {
          bucket.push(entry);
        } else {
          buckets.set(value, [entry]);
        }
      });

      return Array.from(buckets.entries()).map(([value, items]) => {
        const key = parentKey ? `${parentKey} / ${value}` : value;
        const isLeaf = !groupKeys || depth >= groupKeys.length - 1;

        return {
          key,
          value,
          depth,
          allRows: items,
          rows: isLeaf ? items : [],
          children: isLeaf ? [] : build(items, depth + 1, key)
        };
      });
    };

    return build(
      pageData.map((row, index) => ({ row, index })),
      0,
      ''
    );
  }, [groupBy, pageData, effectiveTreeData, serverSideGrouping]);

  const allGroupKeys = useMemo(() => {
    if (!groupedPageTree) {
      return [];
    }

    const keys: string[] = [];

    const walk = (nodes: DataGridGroupNode<T>[]) => {
      nodes.forEach((node) => {
        keys.push(node.key);
        walk(node.children);
      });
    };

    walk(groupedPageTree);
    return keys;
  }, [groupedPageTree]);
  const hasRowExpansion =
    withRowExpansion && typeof renderRowExpansion === 'function' && !serverSideGrouping;
  const batchLabels = useMemo<DataGridBatchEditLabels>(
    () => ({
      apply: resolvedLabels.applyChanges,
      discard: resolvedLabels.discardChanges,
      pending: resolvedLabels.pendingChanges,
      applying: resolvedLabels.applying,
      commitError: resolvedLabels.commitError,
      unavailableColumn: resolvedLabels.unavailableColumn
    }),
    [resolvedLabels]
  );
  const batch = useBatchEditing(
    serverSideGrouping || !batchEditing
      ? undefined
      : { ...batchEditing, labels: { ...batchLabels, ...batchEditing.labels } }
  );
  const cellEditingEnabled = (withCellEditing || batch.enabled) && !serverSideGrouping;
  const hasRowEditing = withRowEditing && !cellEditingEnabled && !serverSideGrouping;
  const hasRowReorder =
    withRowReorder &&
    typeof onRowReorder === 'function' &&
    !groupBy &&
    !effectiveTreeData &&
    !serverSideGrouping;
  const summaryRows = useMemo(() => {
    if (!withSummary) {
      return [];
    }

    if (serverSideGrouping) {
      return serverGrouped.rows;
    }

    if (serverSide) {
      return data;
    }

    return summaryScope === 'page' ? pageData : filteredData;
  }, [
    withSummary,
    serverSideGrouping,
    serverGrouped.rows,
    serverSide,
    summaryScope,
    data,
    pageData,
    filteredData
  ]);

  const resolveAggregateValue = (column: DataGridColumn<T>, rows: T[]): React.ReactNode => {
    if (!column.aggregate || column.aggregate === 'none') {
      return null;
    }

    if (typeof column.aggregate === 'function') {
      return column.aggregate(rows);
    }

    const rawValue = computeDataGridAggregate(column, rows);

    if (rawValue === null) {
      return null;
    }

    const result = typeof rawValue === 'number' ? rawValue : Number(rawValue);

    return column.summaryFormatter
      ? column.summaryFormatter(result)
      : String(Number(result.toFixed(2)));
  };
  const expansionColumn = hasRowExpansion ? 1 : 0;
  const editingColumn = hasRowEditing ? 1 : 0;
  const columnCount =
    visibleColumns.length +
    (withSelection ? 1 : 0) +
    expansionColumn +
    editingColumn +
    (hasRowReorder ? 1 : 0);
  const summaryLeadCount =
    (withSelection ? 1 : 0) + expansionColumn + editingColumn + (hasRowReorder ? 1 : 0);
  const headerRowCount = (hasGroupedHeaders ? 1 : 0) + 1 + (withColumnFilters ? 1 : 0);
  const effectiveVirtualized =
    virtualized &&
    !hasRowExpansion &&
    !groupBy &&
    !hasRowEditing &&
    !hasGroupedHeaders &&
    !effectiveTreeData &&
    !serverSideGrouping;

  useEffect(() => {
    if (!headRef.current) {
      return;
    }

    setMeasuredHeaderHeight(headRef.current.getBoundingClientRect().height);
  }, [withColumnFilters, columns.length]);

  useEffect(() => {
    if (!openColumnMenuKey) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target?.closest('[data-datagrid-column-menu]')) {
        setOpenColumnMenuKey(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenColumnMenuKey(null);
        columnMenuTriggerRef.current?.focus({ preventScroll: true });
      }
    };
    const handleViewportChange = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-datagrid-menu-panel]')) {
        return;
      }
      setOpenColumnMenuKey(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [openColumnMenuKey]);

  const positionColumnMenu = useCallback((menu: HTMLDivElement | null) => {
    const trigger = columnMenuTriggerRef.current;
    if (!menu || !trigger) {
      return;
    }

    const gap = 4;
    const { clientWidth, clientHeight } = document.documentElement;
    const anchor = trigger.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const alignLeft = getComputedStyle(trigger).direction === 'rtl';
    const left = alignLeft ? anchor.left : anchor.right - width;
    const below = anchor.bottom + gap;
    const top = below + height <= clientHeight - gap ? below : anchor.top - height - gap;

    menu.style.left = `${Math.max(gap, Math.min(left, clientWidth - width - gap))}px`;
    menu.style.top = `${Math.max(gap, top)}px`;
    menu.querySelector<HTMLButtonElement>('[role="menuitem"]:enabled')?.focus({
      preventScroll: true
    });
  }, []);

  useEffect(() => {
    const element = viewportRef.current;

    if (!element || !virtualizeColumns) {
      return undefined;
    }

    const measure = () => setColumnViewportWidth(element.clientWidth);

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [virtualizeColumns]);

  useEffect(() => {
    setScrollTop(0);

    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [activePage, filterValuesKey, activeSort]);

  useEffect(() => {
    setCellEditError(null);
  }, [activeEditingCell?.rowId, activeEditingCell?.columnKey]);

  const rowHeight = Math.max(1, virtualizedRowHeight);
  const headerHeight = measuredHeaderHeight > 0 ? measuredHeaderHeight : 44;
  const bodyScrollTop = Math.max(0, scrollTop - headerHeight);
  const viewportBodyHeight = Math.max(0, virtualizedMaxHeight - headerHeight);
  const rowHeights = useMemo(() => {
    if (!effectiveVirtualized) {
      return [] as number[];
    }

    return pageData.map((row, index) => {
      if (typeof getRowHeight !== 'function') {
        return rowHeight;
      }

      const height = getRowHeight(row, index);

      return Number.isFinite(height) ? Math.max(1, height) : rowHeight;
    });
  }, [effectiveVirtualized, pageData, getRowHeight, rowHeight]);
  const rowOffsets = useMemo(() => {
    const offsets = new Array<number>(rowHeights.length + 1);

    offsets[0] = 0;

    rowHeights.forEach((height, index) => {
      offsets[index + 1] = offsets[index] + height;
    });

    return offsets;
  }, [rowHeights]);
  const virtualRowRange = effectiveVirtualized
    ? getVirtualRowRange(rowOffsets, bodyScrollTop, viewportBodyHeight, overscan)
    : {
        start: 0,
        end: pageData.length,
        topSpacer: 0,
        bottomSpacer: 0,
        totalHeight: rowOffsets[pageData.length] ?? 0
      };
  const startIndex = virtualRowRange.start;
  const endIndex = virtualRowRange.end;
  const visiblePageData = pageData.slice(startIndex, endIndex);
  const topSpacerHeight = virtualRowRange.topSpacer;
  const bottomSpacerHeight = virtualRowRange.bottomSpacer;
  const activeScrollRowId =
    activeEditingCell?.rowId ?? activeEditingRowId ?? activeRangeSelection?.startRowId ?? null;

  // With variable heights the active row may sit outside the rendered window
  // (for example a programmatically started cell edit): scroll it into view so
  // its editor mounts and receives focus.
  useEffect(() => {
    if (!effectiveVirtualized || activeScrollRowId === null) {
      return;
    }

    const index = pageRowIds.indexOf(activeScrollRowId);

    if (index < 0) {
      return;
    }

    const element = viewportRef.current;

    if (!element) {
      return;
    }

    const top = rowOffsets[index] ?? 0;
    const bottom = rowOffsets[index + 1] ?? top + rowHeight;
    const currentTop = Math.max(0, (element.scrollTop || 0) - headerHeight);
    let target: number | null = null;

    if (top < currentTop) {
      target = Math.max(0, top + headerHeight);
    } else if (bottom > currentTop + viewportBodyHeight) {
      target = Math.max(0, bottom - viewportBodyHeight + headerHeight);
    }

    if (target === null || Math.abs((element.scrollTop || 0) - target) < 1) {
      return;
    }

    element.scrollTop = target;
    setScrollTop(target);
  }, [
    effectiveVirtualized,
    activeScrollRowId,
    pageRowIds,
    rowOffsets,
    rowHeight,
    headerHeight,
    viewportBodyHeight
  ]);

  const applySort = (column: DataGridColumn<T>, direction: DataGridSortDirection) => {
    if (!column.sortable) {
      return;
    }

    const nextSort: DataGridSort = { key: column.key, direction };

    if (sortKey === undefined) {
      setInternalSort(nextSort);
    }

    typeof onSortChange === 'function' && onSortChange(nextSort);
    setCurrentPage(1);
    setOpenColumnMenuKey(null);
  };

  const handleSort = (column: DataGridColumn<T>) => {
    if (!column.sortable) {
      return;
    }

    const nextSort: DataGridSort =
      activeSort?.key === column.key
        ? {
            key: column.key,
            direction: activeSort.direction === 'asc' ? 'desc' : 'asc'
          }
        : { key: column.key, direction: 'asc' };

    if (sortKey === undefined) {
      setInternalSort(nextSort);
    }

    typeof onSortChange === 'function' && onSortChange(nextSort);
    setCurrentPage(1);
  };

  const handlePinColumn = (column: DataGridColumn<T>, side?: 'left' | 'right') => {
    const nextPinned: DataGridPinnedColumns = {
      left: (activePinnedColumns.left ?? []).filter((key) => key !== column.key),
      right: (activePinnedColumns.right ?? []).filter((key) => key !== column.key)
    };

    if (side === 'left') {
      nextPinned.left?.push(column.key);
    } else if (side === 'right') {
      nextPinned.right?.push(column.key);
    }

    if (pinnedColumns === undefined) {
      setInternalPinnedColumns(nextPinned);
    }

    typeof onPinnedColumnsChange === 'function' && onPinnedColumnsChange(nextPinned);
    setOpenColumnMenuKey(null);
  };

  const handleFilterChange = (column: DataGridColumn<T>, value: string) => {
    const nextFilterValues = { ...activeFilterValues, [column.key]: value };

    if (filterValues === undefined) {
      setInternalFilterValues(nextFilterValues);
    }

    typeof onFilterChange === 'function' && onFilterChange(nextFilterValues);
    setCurrentPage(1);
    setScrollTop(0);
  };

  const applyView = (view: DataGridView) => {
    if (sortKey === undefined) {
      setInternalSort(view.sort ?? null);
    }

    if (filterValues === undefined) {
      setInternalFilterValues(view.filters ?? {});
    }

    if (columnWidths === undefined) {
      setInternalColumnWidths(view.columnWidths ?? {});
    }

    if (columnOrder === undefined) {
      setInternalColumnOrder(view.columnOrder ?? []);
    }

    if (hiddenColumnKeys === undefined) {
      setInternalHiddenColumnKeys(view.hiddenColumnKeys ?? []);
    }

    if (pinnedColumns === undefined) {
      setInternalPinnedColumns(view.pinnedColumns ?? {});
    }

    if (props.pageSize === undefined) {
      setInternalPageSize(view.pageSize ?? 10);
    }

    typeof onSortChange === 'function' && onSortChange(view.sort ?? null);
    typeof onFilterChange === 'function' && onFilterChange(view.filters ?? {});
    typeof onColumnWidthChange === 'function' && onColumnWidthChange(view.columnWidths ?? {});
    typeof onColumnOrderChange === 'function' && onColumnOrderChange(view.columnOrder ?? []);
    typeof onHiddenColumnsChange === 'function' &&
      onHiddenColumnsChange(view.hiddenColumnKeys ?? []);
    typeof onPinnedColumnsChange === 'function' && onPinnedColumnsChange(view.pinnedColumns ?? {});

    setCurrentPage(1);
    setScrollTop(0);
    setOpenColumnMenuKey(null);
    setIsViewFormOpen(false);
    setViewName('');
  };

  const applyViewRef = useRef(applyView);
  applyViewRef.current = applyView;

  useEffect(() => {
    if (!resolvedActiveViewId) {
      lastAppliedViewIdRef.current = null;
      return;
    }

    if (resolvedActiveViewId === lastAppliedViewIdRef.current) {
      return;
    }

    const view = activeViews.find((item) => item.id === resolvedActiveViewId);

    if (!view) {
      // Views may arrive asynchronously; keep the pending id so it applies once available.
      return;
    }

    lastAppliedViewIdRef.current = resolvedActiveViewId;
    applyViewRef.current(view);
  }, [resolvedActiveViewId, activeViews]);

  useEffect(() => {
    if (props.pageSize !== undefined) {
      setInternalPageSize(pageSize);
    }
  }, [props.pageSize, pageSize]);

  useEffect(() => {
    if (!withViews || !viewStorageKey || views !== undefined || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(viewStorageKey, JSON.stringify(internalViews));
    } catch {
      // Persisting is best-effort: quota or privacy-mode failures must not break the grid.
    }
  }, [withViews, viewStorageKey, views, internalViews]);

  const handleViewSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value === '' ? null : event.target.value;

    if (activeViewId === undefined) {
      setInternalActiveViewId(nextId);
    }

    lastAppliedViewIdRef.current = nextId;

    if (nextId) {
      const view = activeViews.find((item) => item.id === nextId);

      if (view) {
        applyView(view);
      }
    }

    typeof onActiveViewChange === 'function' && onActiveViewChange(nextId);
  };

  const handleSaveView = () => {
    const name = viewName.trim();

    if (!name) {
      return;
    }

    const view: DataGridView = {
      id: createDataGridViewId(name, activeViews),
      name,
      sort: activeSort ? { key: activeSort.key, direction: activeSort.direction } : null,
      filters: { ...activeFilterValues },
      hiddenColumnKeys: [...activeHiddenColumnKeys],
      columnOrder: orderedColumns.map((column) => column.key),
      columnWidths: { ...activeColumnWidths },
      pinnedColumns: {
        left: [...(activePinnedColumns.left ?? [])],
        right: [...(activePinnedColumns.right ?? [])]
      },
      pageSize: activePageSize
    };
    const nextViews = [...activeViews, view];

    if (views === undefined) {
      setInternalViews(nextViews);
    }

    typeof onViewsChange === 'function' && onViewsChange(nextViews);

    if (activeViewId === undefined) {
      setInternalActiveViewId(view.id);
      lastAppliedViewIdRef.current = view.id;
    }

    typeof onActiveViewChange === 'function' && onActiveViewChange(view.id);
    setIsViewFormOpen(false);
    setViewName('');
  };

  const cancelViewForm = () => {
    setIsViewFormOpen(false);
    setViewName('');
  };

  const handleDeleteView = () => {
    if (!activeView) {
      return;
    }

    const nextViews = activeViews.filter((view) => view.id !== activeView.id);

    if (views === undefined) {
      setInternalViews(nextViews);
    }

    typeof onViewsChange === 'function' && onViewsChange(nextViews);

    if (activeViewId === undefined) {
      setInternalActiveViewId(null);
    }

    lastAppliedViewIdRef.current = null;
    typeof onActiveViewChange === 'function' && onActiveViewChange(null);
  };

  const updateSelection = (nextIds: (string | number)[]) => {
    if (selectedRowIds === undefined) {
      setInternalSelectedIds(nextIds);
    }

    typeof onSelectionChange === 'function' && onSelectionChange(nextIds);
  };

  const toggleRow = (rowId: string | number) => {
    updateSelection(
      activeSelectedIds.includes(rowId)
        ? activeSelectedIds.filter((id) => id !== rowId)
        : [...activeSelectedIds, rowId]
    );
  };

  const allPageRowsSelected =
    pageRowIds.length > 0 && pageRowIds.every((id) => activeSelectedIds.includes(id));
  const somePageRowsSelected =
    !allPageRowsSelected && pageRowIds.some((id) => activeSelectedIds.includes(id));

  const toggleAllPageRows = () => {
    if (allPageRowsSelected) {
      updateSelection(activeSelectedIds.filter((id) => !pageRowIds.includes(id)));
    } else {
      updateSelection(Array.from(new Set([...activeSelectedIds, ...pageRowIds])));
    }
  };

  const getAriaSort = (column: DataGridColumn<T>): 'ascending' | 'descending' | 'none' => {
    if (!column.sortable) return 'none';
    if (activeSort?.key !== column.key) return 'none';
    return activeSort.direction === 'asc' ? 'ascending' : 'descending';
  };

  const getFilterAriaLabel = (column: DataGridColumn<T>): string =>
    column.filterAriaLabel ??
    resolvedLabels.filterBy(typeof column.title === 'string' ? column.title : column.key);

  const getFilterTitle = (column: DataGridColumn<T>): string =>
    typeof column.title === 'string' ? column.title : column.key;

  const getColumnWidthValue = (column: DataGridColumn<T>): React.CSSProperties['width'] => {
    const width = activeColumnWidths[column.key];

    return typeof width === 'number' ? `${width}px` : column.width;
  };

  const getColumnWidthPx = (column: DataGridColumn<T>, element?: HTMLElement | null): number => {
    const width = activeColumnWidths[column.key];

    if (typeof width === 'number') {
      return width;
    }

    if (typeof column.width === 'number') {
      return column.width;
    }

    if (element) {
      const measured = element.getBoundingClientRect().width;

      if (measured > 0) {
        return measured;
      }
    }

    return 150;
  };

  const getHeaderStyle = (column: DataGridColumn<T>): React.CSSProperties => ({
    width: getColumnWidthValue(column),
    ...(withColumnResize
      ? { minWidth: column.minWidth ?? minColumnWidth, maxWidth: column.maxWidth }
      : {})
  });

  const getLeafPinnedSide = (leaf: DataGridColumn<T>) =>
    getPinnedSide(leafTopLevelMap.get(leaf.key) ?? leaf);

  const pinnedLeftLeafOffsets = new Map<string, number>();
  const pinnedRightLeafOffsets = new Map<string, number>();
  let pinnedLeftOffset = 0;
  let pinnedRightOffset = 0;

  displayColumns.forEach((leaf) => {
    if (getLeafPinnedSide(leaf) === 'left') {
      pinnedLeftLeafOffsets.set(leaf.key, pinnedLeftOffset);
      pinnedLeftOffset += getColumnWidthPx(leaf);
    }
  });

  [...displayColumns].reverse().forEach((leaf) => {
    if (getLeafPinnedSide(leaf) === 'right') {
      pinnedRightLeafOffsets.set(leaf.key, pinnedRightOffset);
      pinnedRightOffset += getColumnWidthPx(leaf);
    }
  });

  const lastPinnedLeftKey = [...displayColumns]
    .reverse()
    .find((leaf) => getLeafPinnedSide(leaf) === 'left')?.key;
  const firstPinnedRightKey = displayColumns.find(
    (leaf) => getLeafPinnedSide(leaf) === 'right'
  )?.key;

  const getPinnedCellStyle = (leaf: DataGridColumn<T>, header = false): React.CSSProperties => {
    const pin = getLeafPinnedSide(leaf);

    if (pin === 'left') {
      return {
        position: 'sticky',
        left: pinnedLeftLeafOffsets.get(leaf.key) ?? 0,
        zIndex: header ? 4 : 2
      };
    }

    if (pin === 'right') {
      return {
        position: 'sticky',
        right: pinnedRightLeafOffsets.get(leaf.key) ?? 0,
        zIndex: header ? 4 : 2
      };
    }

    return {};
  };

  const getPinnedCellClasses = (leaf: DataGridColumn<T>, header = false) => {
    const pin = getLeafPinnedSide(leaf);

    return {
      [classes.pinnedCell]: !!pin,
      [classes.pinnedHeader]: header && !!pin,
      [classes.pinnedLeftLast]: pin === 'left' && leaf.key === lastPinnedLeftKey,
      [classes.pinnedRightFirst]: pin === 'right' && leaf.key === firstPinnedRightKey
    };
  };

  const columnWidthsPx = displayColumns.map((column) => getColumnWidthPx(column));
  const columnOffsets: number[] = [];
  let runningColumnOffset = 0;

  columnWidthsPx.forEach((width) => {
    columnOffsets.push(runningColumnOffset);
    runningColumnOffset += width;
  });

  const columnVirtualizationEnabled =
    virtualizeColumns &&
    !hasGroupedHeaders &&
    !groupBy &&
    !effectiveTreeData &&
    !serverSideGrouping &&
    displayColumns.length >= columnVirtualizationThreshold &&
    displayColumns.every((column) => getPinnedSide(column) === undefined);

  const columnRange = columnVirtualizationEnabled
    ? getVirtualColumnRange(
        columnOffsets,
        columnWidthsPx,
        scrollLeft,
        columnViewportWidth,
        columnVirtualizationOverscan
      )
    : { start: 0, end: displayColumns.length };
  const windowedColumns = columnVirtualizationEnabled
    ? displayColumns.slice(columnRange.start, columnRange.end)
    : displayColumns;
  const leadingHiddenColumns = columnVirtualizationEnabled ? columnRange.start : 0;
  const trailingHiddenColumns = columnVirtualizationEnabled
    ? displayColumns.length - columnRange.end
    : 0;

  const getSpanSize = (span: number | undefined, max: number): number => {
    if (typeof span !== 'number' || !Number.isFinite(span)) {
      return 1;
    }

    const size = Math.floor(span);

    return size > 1 ? Math.max(1, Math.min(size, Math.max(1, max))) : 1;
  };

  const hasPinnedDisplayColumns = displayColumns.some(
    (column) => getLeafPinnedSide(column) !== undefined
  );
  // Static row/column spanning is only safe when the table renders one cell per
  // column and row: virtualization, pinned cells and grouped headers all inject
  // extra cells or reposition them, and grouping/expansion/row editing interleave
  // full-width rows that break a rowspan. Any of those disables spanning.
  const spanningEnabled =
    !effectiveVirtualized &&
    !columnVirtualizationEnabled &&
    !hasGroupedHeaders &&
    !hasPinnedDisplayColumns &&
    !groupBy &&
    !hasRowExpansion &&
    !hasRowEditing &&
    !effectiveTreeData &&
    !serverSideGrouping;

  const headerSpanPlan: {
    column: DataGridColumn<T>;
    colSpan?: number;
    rowSpan?: number;
  }[] = [];
  const filterSpannedColumnKeys = new Set<string>();

  if (spanningEnabled) {
    let headerIndex = 0;

    while (headerIndex < windowedColumns.length) {
      const column = windowedColumns[headerIndex];
      const colSpanSize = getSpanSize(column.colSpan, windowedColumns.length - headerIndex);
      const rowSpanSize = withColumnFilters ? getSpanSize(column.rowSpan, 2) : 1;

      headerSpanPlan.push({
        column,
        colSpan: colSpanSize > 1 ? colSpanSize : undefined,
        rowSpan: rowSpanSize > 1 ? rowSpanSize : undefined
      });

      if (rowSpanSize > 1) {
        for (let offset = 0; offset < colSpanSize; offset += 1) {
          const covered = windowedColumns[headerIndex + offset];

          if (covered) {
            filterSpannedColumnKeys.add(covered.key);
          }
        }
      }

      headerIndex += colSpanSize;
    }
  } else {
    windowedColumns.forEach((column) => headerSpanPlan.push({ column }));
  }

  const filterRowColumns = windowedColumns.filter(
    (column) => !filterSpannedColumnKeys.has(column.key)
  );

  const buildBodySpanPlan = (rowIndex: number, withRowSpan = true) => {
    if (!spanningEnabled) {
      return windowedColumns.map((column) => ({ column, colSpan: undefined, rowSpan: undefined }));
    }

    const plan: {
      column: DataGridColumn<T>;
      colSpan?: number;
      rowSpan?: number;
    }[] = [];
    let bodyIndex = 0;

    while (bodyIndex < windowedColumns.length) {
      const column = windowedColumns[bodyIndex];
      const rowSpanSize = withRowSpan
        ? getSpanSize(column.rowSpan, Math.max(1, pageData.length))
        : 1;

      if (withRowSpan && rowSpanSize > 1 && rowIndex % rowSpanSize !== 0) {
        bodyIndex += 1;
      } else {
        const colSpanSize = getSpanSize(column.colSpan, windowedColumns.length - bodyIndex);

        plan.push({
          column,
          colSpan: colSpanSize > 1 ? colSpanSize : undefined,
          rowSpan: rowSpanSize > 1 ? rowSpanSize : undefined
        });
        bodyIndex += colSpanSize;
      }
    }

    return plan;
  };

  const renderColumnSpacer = (span: number, key: string, header = false) => {
    if (span <= 0) {
      return null;
    }

    return header ? (
      <Table.HeaderCell
        key={key}
        colSpan={span}
        aria-hidden="true"
        className={cx(classes.virtualColumnSpacer)}
      />
    ) : (
      <Table.Cell
        key={key}
        colSpan={span}
        aria-hidden="true"
        className={cx(classes.virtualColumnSpacer)}
      />
    );
  };

  const autofitCanvasContextRef = useRef<CanvasRenderingContext2D | null | undefined>(undefined);
  const autofitOwnedWidthsRef = useRef<Record<string, number>>({});
  const autofitStateRef = useRef<{
    data: T[];
    columns: DataGridColumn<T>[];
    groupedData: DataGridServerGroup<T>[] | undefined;
    visible: string;
    expanded: string;
    filters: string;
    sort: string;
    page: number;
    totalRows: number;
    widths: Record<string, number>;
  } | null>(null);
  const onColumnWidthChangeRef = useRef(onColumnWidthChange);
  onColumnWidthChangeRef.current = onColumnWidthChange;

  const getAutofitCanvasContext = useCallback((): CanvasRenderingContext2D | null => {
    if (autofitCanvasContextRef.current !== undefined) {
      return autofitCanvasContextRef.current;
    }

    if (typeof document === 'undefined') {
      autofitCanvasContextRef.current = null;
      return null;
    }

    try {
      autofitCanvasContextRef.current = document.createElement('canvas').getContext('2d');
    } catch {
      autofitCanvasContextRef.current = null;
    }

    return autofitCanvasContextRef.current;
  }, []);

  const estimateAutofitTextWidth = useCallback(
    (text: string): number => {
      const context = getAutofitCanvasContext();

      if (context) {
        try {
          context.font = AUTOFIT_FONT;
          const measured = context.measureText(text).width;

          if (Number.isFinite(measured) && measured > 0) {
            return measured;
          }
        } catch {
          // Canvas measurement is best-effort; fall back to the character count.
        }
      }

      return text.length * AUTOFIT_CHAR_WIDTH;
    },
    [getAutofitCanvasContext]
  );

  useEffect(() => {
    if (!withColumnAutofit) {
      autofitStateRef.current = null;
      autofitOwnedWidthsRef.current = {};
      return;
    }

    const visibleSignature = displayColumns.map((column) => column.key).join('|');
    const expandedSignature = activeExpandedTreeKeys.join('|');
    const sortSignature = activeSort ? `${activeSort.key}:${activeSort.direction}` : '';
    const previous = autofitStateRef.current;

    if (
      previous &&
      previous.data === data &&
      previous.columns === columns &&
      previous.groupedData === groupedData &&
      previous.visible === visibleSignature &&
      previous.expanded === expandedSignature &&
      previous.filters === filterValuesKey &&
      previous.sort === sortSignature &&
      previous.page === activePage &&
      previous.totalRows === totalRowCount &&
      previous.widths === activeColumnWidths
    ) {
      return;
    }

    autofitStateRef.current = {
      data,
      columns,
      groupedData,
      visible: visibleSignature,
      expanded: expandedSignature,
      filters: filterValuesKey,
      sort: sortSignature,
      page: activePage,
      totalRows: totalRowCount,
      widths: activeColumnWidths
    };

    if (displayColumns.length === 0) {
      return;
    }

    const sampleSize = Math.max(1, autofitSampleSize ?? 50);
    const sampleRows = pageData.slice(0, sampleSize);
    const ownedWidths = autofitOwnedWidthsRef.current;
    const nextWidths = { ...columnWidthsRef.current };
    const measuredWidths: Record<string, number> = {};
    let changed = false;

    const getText = (row: T, column: DataGridColumn<T>): string => {
      const value = column.exportValue
        ? column.exportValue(row)
        : column.sortValue
          ? column.sortValue(row)
          : getRowValue(row, column.key);

      if (value === null || value === undefined) {
        return '';
      }

      return value instanceof Date ? value.toISOString() : String(value);
    };

    displayColumns.forEach((column) => {
      const currentWidth = nextWidths[column.key];

      // Explicit widths win, but the values produced by a previous autofit run
      // must stay eligible so a new sample can resize them again.
      if (typeof currentWidth === 'number' && ownedWidths[column.key] !== currentWidth) {
        return;
      }

      const headerText =
        column.exportTitle ?? (typeof column.title === 'string' ? column.title : column.key);
      let widest = estimateAutofitTextWidth(headerText);

      sampleRows.forEach((row) => {
        widest = Math.max(widest, estimateAutofitTextWidth(getText(row, column)));
      });

      const min = Math.max(0, column.minWidth ?? minColumnWidth);
      const max = Math.max(min, column.maxWidth ?? maxColumnWidth ?? 480);
      const width = Math.round(Math.min(Math.max(widest + AUTOFIT_CELL_PADDING, min), max));

      measuredWidths[column.key] = width;

      if (nextWidths[column.key] !== width) {
        nextWidths[column.key] = width;
        changed = true;
      }
    });

    autofitOwnedWidthsRef.current = measuredWidths;

    if (!changed) {
      return;
    }

    columnWidthsRef.current = nextWidths;

    if (columnWidths === undefined) {
      setInternalColumnWidths(nextWidths);
    }

    typeof onColumnWidthChangeRef.current === 'function' &&
      onColumnWidthChangeRef.current(nextWidths);
  }, [
    withColumnAutofit,
    data,
    columns,
    groupedData,
    displayColumns,
    pageData,
    totalRowCount,
    activeExpandedTreeKeys,
    filterValuesKey,
    activeSort,
    activePage,
    activeColumnWidths,
    autofitSampleSize,
    minColumnWidth,
    maxColumnWidth,
    columnWidths,
    estimateAutofitTextWidth
  ]);

  const applyColumnWidth = (column: DataGridColumn<T>, width: number) => {
    const min = column.minWidth ?? minColumnWidth;
    const max = column.maxWidth ?? Number.POSITIVE_INFINITY;
    const nextWidth = Math.round(Math.min(Math.max(width, min), max));
    const nextWidths = { ...columnWidthsRef.current, [column.key]: nextWidth };

    columnWidthsRef.current = nextWidths;

    if (columnWidths === undefined) {
      setInternalColumnWidths(nextWidths);
    }

    typeof onColumnWidthChange === 'function' && onColumnWidthChange(nextWidths);
  };

  const handleResizeMouseDown = (
    event: React.MouseEvent<HTMLElement>,
    column: DataGridColumn<T>
  ) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const element = event.currentTarget.closest('th') as HTMLElement | null;
    const startWidth = getColumnWidthPx(column, element);
    const startX = event.clientX;

    resizeStateRef.current = { key: column.key, startX, startWidth };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStateRef.current) {
        return;
      }

      applyColumnWidth(column, startWidth + (moveEvent.clientX - startX));
    };

    const handleMouseUp = () => {
      resizeStateRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    column: DataGridColumn<T>
  ) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const step = event.shiftKey ? 25 : 10;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const element = event.currentTarget.closest('th') as HTMLElement | null;

    applyColumnWidth(column, getColumnWidthPx(column, element) + step * direction);
  };

  const applyColumnOrder = (nextOrder: string[]) => {
    if (columnOrder === undefined) {
      setInternalColumnOrder(nextOrder);
    }

    typeof onColumnOrderChange === 'function' && onColumnOrderChange(nextOrder);
  };

  const moveColumnBy = (column: DataGridColumn<T>, direction: -1 | 1) => {
    const order = orderedColumns.map((item) => item.key);
    const index = order.indexOf(column.key);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= order.length) {
      return;
    }

    const nextOrder = [...order];
    [nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]];
    applyColumnOrder(nextOrder);
  };

  const handleReorderKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    column: DataGridColumn<T>
  ) => {
    if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    moveColumnBy(column, event.key === 'ArrowRight' ? 1 : -1);
  };

  const handleColumnDragStart = (
    event: React.DragEvent<HTMLElement>,
    column: DataGridColumn<T>
  ) => {
    draggedColumnKeyRef.current = column.key;

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', column.key);
    }
  };

  const handleColumnDrop = (event: React.DragEvent<HTMLElement>, column: DataGridColumn<T>) => {
    event.preventDefault();

    const fromKey = event.dataTransfer?.getData('text/plain') || draggedColumnKeyRef.current;
    draggedColumnKeyRef.current = null;

    if (!fromKey || fromKey === column.key) {
      return;
    }

    const order = orderedColumns.map((item) => item.key);
    const toIndex = order.indexOf(column.key);

    if (toIndex < 0) {
      return;
    }

    const nextOrder = order.filter((key) => key !== fromKey);
    nextOrder.splice(toIndex, 0, fromKey);
    applyColumnOrder(nextOrder);
  };

  const handleColumnDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  };

  const handleColumnVisibilityChange = (column: DataGridColumn<T>, checked: boolean) => {
    const nextHidden = checked
      ? activeHiddenColumnKeys.filter((key) => key !== column.key)
      : [...activeHiddenColumnKeys, column.key];

    if (hiddenColumnKeys === undefined) {
      setInternalHiddenColumnKeys(nextHidden);
    }

    typeof onHiddenColumnsChange === 'function' && onHiddenColumnsChange(nextHidden);
  };

  const handleExport = () => {
    const exportColumns = visibleColumns.filter((column) => column.exportable !== false);
    const exportData = serverSideGrouping
      ? serverGrouped.rows
      : exportScope === 'page'
        ? pageData
        : filteredData;
    const csv = createDataGridCsv(exportData, exportColumns, {
      separator: exportSeparator,
      withHeaders: withExportHeaders
    });

    if (typeof onExport === 'function') {
      onExport(csv, exportFileName);
      return;
    }

    if (
      typeof document === 'undefined' ||
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function'
    ) {
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = exportFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExcelExport = () => {
    const exportColumns = displayColumns.filter((column) => column.exportable !== false);
    const exportData = serverSideGrouping
      ? serverGrouped.rows
      : exportScope === 'page'
        ? pageData
        : filteredData;
    const fileName = getDataGridExcelFileName(excelFileName);
    const excelOptions: DataGridExcelOptions<T> = {
      fileName,
      withHeaders: withExportHeaders,
      summaryRows: withSummary ? summaryRows : undefined,
      summaryLabel: typeof summaryLabel === 'string' ? summaryLabel : undefined,
      sheetName: typeof caption === 'string' ? caption : undefined
    };

    if (typeof onExcelExport === 'function') {
      onExcelExport(createDataGridExcel(exportColumns, exportData, excelOptions), fileName);
    } else {
      exportDataGridExcel(exportColumns, exportData, excelOptions);
    }

    setExcelExportMessage(resolvedLabels.exportedFile(fileName));
  };

  const renderEmptyState = () =>
    typeof resolvedEmptyState === 'string' ? (
      <EmptyState compact title={resolvedEmptyState} />
    ) : (
      resolvedEmptyState
    );

  const renderSpacerRow = (height: number, key: string) =>
    height > 0 ? (
      <Table.Row key={key} aria-hidden="true" className={cx(classes.spacerRow)} style={{ height }}>
        <Table.Cell colSpan={columnCount} style={{ padding: 0, border: 0 }} />
      </Table.Row>
    ) : null;

  const toggleRowExpanded = (rowId: string | number) => {
    const nextExpanded = activeExpandedRowIds.includes(rowId)
      ? activeExpandedRowIds.filter((id) => id !== rowId)
      : [...activeExpandedRowIds, rowId];

    if (expandedRowIds === undefined) {
      setInternalExpandedRowIds(nextExpanded);
    }

    typeof onExpandedRowsChange === 'function' && onExpandedRowsChange(nextExpanded);
  };

  const applyExpandedGroupKeys = (nextExpanded: string[]) => {
    if (expandedGroupKeys === undefined) {
      setInternalExpandedGroupKeys(nextExpanded);
    }

    typeof onExpandedGroupsChange === 'function' && onExpandedGroupsChange(nextExpanded);
    typeof onExpandedGroupKeysChange === 'function' && onExpandedGroupKeysChange(nextExpanded);
  };

  const toggleExpandedGroup = (groupKey: string, allKeys: string[]) => {
    const current = activeExpandedGroupKeys.length ? activeExpandedGroupKeys : allKeys;
    const nextExpanded = current.includes(groupKey)
      ? current.filter((key) => key !== groupKey)
      : [...current, groupKey];

    applyExpandedGroupKeys(nextExpanded);
  };

  const isGroupExpanded = (groupKey: string): boolean => {
    if (!collapsibleGroups) {
      return true;
    }

    if (expandedGroupKeys !== undefined) {
      return activeExpandedGroupKeys.includes(groupKey);
    }

    if (internalExpandedGroupKeys === null) {
      return true;
    }

    return internalExpandedGroupKeys.includes(groupKey);
  };

  const toggleGroupExpanded = (groupKey: string) => {
    toggleExpandedGroup(groupKey, allGroupKeys);
  };

  const isServerGroupExpanded = (groupKey: string): boolean => {
    if (expandedGroupKeys !== undefined) {
      return expandedGroupKeys.includes(groupKey);
    }

    if (internalExpandedGroupKeys === null) {
      return true;
    }

    return internalExpandedGroupKeys.includes(groupKey);
  };

  const toggleServerGroupExpanded = (groupKey: string) => {
    toggleExpandedGroup(groupKey, allServerGroupKeys);
  };

  const applyExpandedTreeKeys = (nextExpanded: (string | number)[]) => {
    if (expandedRowKeys === undefined) {
      setInternalExpandedTreeKeys(nextExpanded);
    }

    typeof onExpandedRowKeysChange === 'function' && onExpandedRowKeysChange(nextExpanded);
  };

  const toggleTreeRow = (rowKey: string | number) => {
    applyExpandedTreeKeys(
      activeExpandedTreeKeys.includes(rowKey)
        ? activeExpandedTreeKeys.filter((key) => key !== rowKey)
        : [...activeExpandedTreeKeys, rowKey]
    );
  };

  const expandTreeRow = (rowKey: string | number) => {
    if (!activeExpandedTreeKeys.includes(rowKey)) {
      applyExpandedTreeKeys([...activeExpandedTreeKeys, rowKey]);
    }
  };

  const collapseTreeRow = (rowKey: string | number) => {
    if (activeExpandedTreeKeys.includes(rowKey)) {
      applyExpandedTreeKeys(activeExpandedTreeKeys.filter((key) => key !== rowKey));
    }
  };

  const handleTreeCellKeyDown = (
    event: React.KeyboardEvent<HTMLTableCellElement>,
    treeRow: DataGridTreeRow<T>
  ) => {
    // Keys pressed on the toggle button are handled by the button itself.
    if (event.target !== event.currentTarget) {
      return;
    }

    const expanded = activeExpandedTreeKeys.includes(treeRow.key);

    if (event.key === 'ArrowRight' && !expanded) {
      event.preventDefault();
      expandTreeRow(treeRow.key);
      return;
    }

    if (event.key === 'ArrowLeft' && expanded) {
      event.preventDefault();
      collapseTreeRow(treeRow.key);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTreeRow(treeRow.key);
    }
  };

  const applyEditingRowId = (rowId: string | number | null) => {
    if (editingRowId === undefined) {
      setInternalEditingRowId(rowId);
    }

    typeof onEditingRowChange === 'function' && onEditingRowChange(rowId);
  };

  const startEditingRow = (rowId: string | number, row: T) => {
    const draft: Record<string, unknown> = {};

    visibleColumns.forEach((column) => {
      draft[column.key] = getRowValue(row, column.key);
    });

    setRowEditDraft(draft);
    applyEditingRowId(rowId);
  };

  const saveEditingRow = (row: T, changes: Partial<T>) => {
    if (withUndoRedo) {
      const before: Record<string, unknown> = {};

      Object.keys(changes as Record<string, unknown>).forEach((key) => {
        before[key] = getRowValue(row, key);
      });

      pushHistory({
        type: 'row',
        rowId: getHistoryRowId(row),
        row,
        before: before as Partial<T>,
        after: changes
      });
    }

    typeof onRowEdit === 'function' && onRowEdit(row, changes);
    applyEditingRowId(null);
    setRowEditDraft({});
  };

  const cancelEditingRow = () => {
    applyEditingRowId(null);
    setRowEditDraft({});
  };

  const renderGroupHeaderRow = (group: DataGridGroupNode<T>) => {
    const groupRows = group.allRows.map((item) => item.row);
    const fallbackLabel =
      typeof groupBy === 'string'
        ? (allLeafColumns.find((column) => column.key === groupBy)?.title ?? groupBy)
        : Array.isArray(groupBy)
          ? `${
              allLeafColumns.find((column) => column.key === groupBy[group.depth])?.title ??
              groupBy[group.depth]
            }: ${group.value}`
          : group.key;
    const label = groupLabel ? groupLabel(group.key, groupRows) : fallbackLabel;
    const expanded = isGroupExpanded(group.key);
    const indentStyle =
      group.depth > 0
        ? { paddingInlineStart: `calc(${group.depth} * var(--datagrid-group-indent, 1.5rem))` }
        : undefined;

    return (
      <Table.Row key={`group-${group.key}`} className={cx(classes.groupRow)}>
        <Table.Cell colSpan={columnCount}>
          {renderGroupHeader ? (
            renderGroupHeader(group.key, groupRows)
          ) : (
            <div className={cx(classes.groupHeader)} style={indentStyle}>
              {collapsibleGroups && (
                <button
                  type="button"
                  className={cx(classes.groupToggle)}
                  aria-expanded={expanded}
                  aria-label={
                    expanded
                      ? resolvedLabels.collapseGroup(group.key)
                      : resolvedLabels.expandGroup(group.key)
                  }
                  onClick={() => toggleGroupExpanded(group.key)}
                >
                  <Icon
                    icon={expanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                    pack="nebular-essentials"
                    aria-hidden="true"
                  />
                </button>
              )}
              <span className={cx(classes.groupLabel)}>{label}</span>
              <span className={cx(classes.groupCount)}>{group.allRows.length}</span>
            </div>
          )}
        </Table.Cell>
      </Table.Row>
    );
  };

  const renderServerGroupHeaderRow = (group: DataGridServerGroup<T>, depth: number) => {
    const expanded = isServerGroupExpanded(group.key);
    const count = countServerGroupRows(group);
    const firstAggregateIndex = displayColumns.findIndex(
      (column) => group.aggregates?.[column.key] !== undefined
    );
    // The first visible column always hosts the group label; aggregates render
    // from the first following column that has a value.
    const aggregateStartIndex = firstAggregateIndex > 0 ? firstAggregateIndex : 1;
    const labelSpan = Math.max(1, aggregateStartIndex);
    const aggregateColumns =
      firstAggregateIndex >= 0 ? displayColumns.slice(aggregateStartIndex) : [];
    const indentStyle =
      depth > 0
        ? { paddingInlineStart: `calc(${depth} * var(--datagrid-group-indent, 1.5rem))` }
        : undefined;

    return (
      <Table.Row key={`server-group-${group.key}`} className={cx(classes.groupRow)}>
        {hasRowReorder && <Table.Cell className={cx(classes.reorderCell)} />}
        {withSelection && <Table.Cell className={cx(classes.selectionCell)} />}
        {renderColumnSpacer(leadingHiddenColumns, 'server-group-leading')}
        <Table.Cell colSpan={labelSpan}>
          <div className={cx(classes.groupHeader)} style={indentStyle}>
            <button
              type="button"
              className={cx(classes.groupToggle)}
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? resolvedLabels.collapseGroup(group.key)
                  : resolvedLabels.expandGroup(group.key)
              }
              onClick={() => toggleServerGroupExpanded(group.key)}
            >
              <Icon
                icon={expanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                pack="nebular-essentials"
                aria-hidden="true"
              />
            </button>
            <span className={cx(classes.groupLabel)}>{group.label}</span>
            <span className={cx(classes.groupCount)}>{count}</span>
          </div>
        </Table.Cell>
        {aggregateColumns.map((column) => {
          const value = group.aggregates?.[column.key];

          return (
            <Table.Cell
              key={column.key}
              className={cx(classes.serverGroupCell, {
                [classes.alignCenter]: column.align === 'center',
                [classes.alignRight]: column.align === 'right'
              })}
            >
              {value === undefined || value === null ? null : (
                <span className={cx(classes.groupAggregate)} data-datagrid-aggregate={column.key}>
                  {value as React.ReactNode}
                </span>
              )}
            </Table.Cell>
          );
        })}
        {renderColumnSpacer(trailingHiddenColumns, 'server-group-trailing')}
      </Table.Row>
    );
  };

  const draggedRowIndexRef = useRef<number | null>(null);

  const renderGroupSummaryRow = (group: DataGridGroupNode<T>) => {
    if (!withGroupSummary || !isGroupExpanded(group.key)) {
      return null;
    }

    const groupRows = group.rows.map((item) => item.row);
    const label = summaryLabel ?? resolvedLabels.groupTotal;

    return (
      <Table.Row key={`group-summary-${group.key}`} className={cx(classes.groupSummaryRow)}>
        {summaryLeadCount > 0 && (
          <Table.Cell colSpan={summaryLeadCount} className={cx(classes.groupSummaryLabel)}>
            {label}
          </Table.Cell>
        )}
        {displayColumns.map((column, index) => {
          const value = resolveAggregateValue(column, groupRows);
          const showLabel = summaryLeadCount === 0 && index === 0 && value == null;

          return (
            <Table.Cell
              key={column.key}
              style={getPinnedCellStyle(column)}
              className={cx(classes.summaryCell, getPinnedCellClasses(column), {
                [classes.alignCenter]: column.align === 'center',
                [classes.alignRight]: column.align === 'right'
              })}
            >
              {value ?? (showLabel ? label : null)}
            </Table.Cell>
          );
        })}
      </Table.Row>
    );
  };

  const renderGroupNode = (group: DataGridGroupNode<T>) => {
    const expanded = isGroupExpanded(group.key);
    const isLeaf = group.children.length === 0;

    return (
      <React.Fragment key={`group-${group.key}`}>
        {renderGroupHeaderRow(group)}
        {expanded &&
          (isLeaf
            ? group.rows.map((item) => renderDataRow(item.row, item.index))
            : group.children.map(renderGroupNode))}
        {expanded && isLeaf && renderGroupSummaryRow(group)}
      </React.Fragment>
    );
  };

  const handleRowDragStart = (event: React.DragEvent<HTMLButtonElement>, index: number): void => {
    draggedRowIndexRef.current = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const applyRowReorder = (fromIndex: number, toIndex: number) => {
    if (typeof onRowReorder !== 'function') {
      return;
    }

    pushHistory({ type: 'reorder', fromIndex, toIndex });
    onRowReorder(fromIndex, toIndex);
  };

  const handleRowDrop = (event: React.DragEvent<HTMLTableCellElement>, index: number): void => {
    event.preventDefault();
    const fromIndex = draggedRowIndexRef.current;
    draggedRowIndexRef.current = null;

    if (fromIndex === null || fromIndex === index) {
      return;
    }

    applyRowReorder(fromIndex, index);
  };

  const handleRowReorderKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ): void => {
    if (!event.altKey || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
      return;
    }

    event.preventDefault();
    const targetIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= pageData.length) {
      return;
    }

    applyRowReorder(index, targetIndex);
  };

  const applyEditingCell = (cell: DataGridEditingCell | null) => {
    if (editingCell === undefined) {
      setInternalEditingCell(cell);
    }

    typeof onEditingCellChange === 'function' && onEditingCellChange(cell);
  };

  const beginCellEdit = (rowId: string | number, row: T, column: DataGridColumn<T>) => {
    if (!cellEditingEnabled || column.editable === false || batch.saving) {
      return;
    }

    const draftRow = batch.previewRow(rowId, row);
    const rawValue = column.filterValue
      ? column.filterValue(draftRow)
      : getRowValue(draftRow, column.key);

    setCellEditValue(rawValue == null ? '' : String(rawValue));
    setCellEditError(null);
    cellEditCancelledRef.current = false;
    applyEditingCell({ rowId, columnKey: column.key });
  };

  const validateCellValue = (row: T, column: DataGridColumn<T>, value: unknown): string | null => {
    if (typeof column.validateCell !== 'function') {
      return null;
    }

    const result = column.validateCell(value, row);

    return typeof result === 'string' && result.length > 0 ? result : null;
  };

  const saveCellEdit = (row: T, column: DataGridColumn<T>, value: unknown): boolean => {
    if (batch.enabled && activeEditingCell) {
      batch.stage([
        {
          row,
          rowId: activeEditingCell.rowId,
          columnKey: column.key,
          before: getRowValue(row, column.key),
          value
        }
      ]);
      setCellEditError(null);
      applyEditingCell(null);
      return true;
    }

    const message = validateCellValue(row, column, value);

    if (message) {
      setCellEditError(message);
      typeof onCellValidationError === 'function' &&
        onCellValidationError(row, column.key, message);
      return false;
    }

    setCellEditError(null);

    if (withUndoRedo) {
      pushHistory({
        type: 'cell',
        rowId: getHistoryRowId(row),
        row,
        columnKey: column.key,
        before: getRowValue(row, column.key),
        after: value
      });
    }

    typeof onCellEdit === 'function' && onCellEdit(row, column.key, value);
    applyEditingCell(null);
    return true;
  };

  const commitCellEdit = (row: T, column: DataGridColumn<T>) => {
    if (cellEditCancelledRef.current) {
      cellEditCancelledRef.current = false;
      return;
    }

    saveCellEdit(row, column, cellEditValue);
  };

  const cancelCellEdit = () => {
    cellEditCancelledRef.current = true;
    setCellEditError(null);
    applyEditingCell(null);
  };

  const validateBatchCells = () => {
    const columnsByKey = new Map(flattenColumns(columns).map((column) => [column.key, column]));
    const draftRows = new Map<string | number, T>();
    for (const change of batch.changes) {
      const column = columnsByKey.get(change.columnKey);
      if (!column || column.editable === false) return batch.labels.unavailableColumn;

      if (!draftRows.has(change.rowId)) {
        draftRows.set(change.rowId, batch.previewRow(change.rowId, change.row));
      }
      const message = validateCellValue(draftRows.get(change.rowId)!, column, change.value);
      if (message) {
        onCellValidationError?.(change.row, change.columnKey, message);
        return message;
      }
    }
    return null;
  };

  const stageRangeChanges = (changes: readonly DataGridRangeFillChange[]) => {
    const columnsByKey = new Map(displayColumns.map((column) => [column.key, column]));
    const rowsById = new Map(pageRowIds.map((id, index) => [id, pageData[index]]));
    return changes.flatMap((change) => {
      const column = columnsByKey.get(change.columnKey);
      const row = rowsById.get(change.rowId);
      if (!column || column.editable === false || row === undefined) return [];
      return [{ ...change, row, before: getRowValue(row, change.columnKey) }];
    });
  };

  const updateRangeSelection = (nextRange: DataGridRangeSelection | null) => {
    if (rangeSelection === undefined) {
      setInternalRangeSelection(nextRange);
    }

    typeof onRangeSelectionChange === 'function' && onRangeSelectionChange(nextRange);
    setFillTargetRange(null);
    setRangeCopyMessage('');
  };

  const handleRangeCellMouseDown = (
    event: React.MouseEvent<HTMLTableCellElement>,
    rowId: string | number,
    columnKey: string
  ) => {
    if (!withRangeSelection || event.button !== 0) {
      return;
    }

    const anchor = rangeAnchorRef.current;

    if (event.shiftKey && anchor) {
      updateRangeSelection({
        startRowId: anchor.rowId,
        endRowId: rowId,
        startColumnKey: anchor.columnKey,
        endColumnKey: columnKey
      });
    } else {
      rangeAnchorRef.current = { rowId, columnKey };
      updateRangeSelection({
        startRowId: rowId,
        endRowId: rowId,
        startColumnKey: columnKey,
        endColumnKey: columnKey
      });
    }
  };

  interface DataGridRangeBounds {
    minRow: number;
    maxRow: number;
    minColumn: number;
    maxColumn: number;
  }

  const resolveRangeBounds = (range: DataGridRangeSelection | null): DataGridRangeBounds | null => {
    if (!range) {
      return null;
    }

    const startRow = pageRowIds.indexOf(range.startRowId);
    const endRow = pageRowIds.indexOf(range.endRowId);
    const startColumn = displayColumns.findIndex((column) => column.key === range.startColumnKey);
    const endColumn = displayColumns.findIndex((column) => column.key === range.endColumnKey);

    if (startRow < 0 || endRow < 0 || startColumn < 0 || endColumn < 0) {
      return null;
    }

    return {
      minRow: Math.min(startRow, endRow),
      maxRow: Math.max(startRow, endRow),
      minColumn: Math.min(startColumn, endColumn),
      maxColumn: Math.max(startColumn, endColumn)
    };
  };

  const getRangeBounds = () =>
    withRangeSelection ? resolveRangeBounds(activeRangeSelection) : null;

  const isRangeCellSelected = (rowId: string | number, columnKey: string): boolean => {
    const bounds = getRangeBounds();

    if (!bounds) {
      return false;
    }

    const rowIndex = pageRowIds.indexOf(rowId);
    const columnIndex = displayColumns.findIndex((column) => column.key === columnKey);

    return (
      rowIndex >= bounds.minRow &&
      rowIndex <= bounds.maxRow &&
      columnIndex >= bounds.minColumn &&
      columnIndex <= bounds.maxColumn
    );
  };

  const isFillTargetCell = (rowId: string | number, columnKey: string): boolean => {
    if (!withFillHandle || !fillTargetRange) {
      return false;
    }

    const bounds = resolveRangeBounds(fillTargetRange);

    if (!bounds) {
      return false;
    }

    const rowIndex = pageRowIds.indexOf(rowId);
    const columnIndex = displayColumns.findIndex((column) => column.key === columnKey);

    return (
      rowIndex >= bounds.minRow &&
      rowIndex <= bounds.maxRow &&
      columnIndex >= bounds.minColumn &&
      columnIndex <= bounds.maxColumn
    );
  };

  const fallbackCopyText = (text: string): boolean => {
    if (typeof document === 'undefined') {
      return false;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;

    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }

    document.body.removeChild(textarea);
    return copied;
  };

  const copyRangeSelection = async () => {
    const bounds = getRangeBounds();

    if (!bounds) {
      return;
    }

    const rangeColumns = displayColumns.slice(bounds.minColumn, bounds.maxColumn + 1);
    const rows = pageData
      .slice(bounds.minRow, bounds.maxRow + 1)
      .map((row, index) => batch.previewRow(pageRowIds[bounds.minRow + index], row));
    const text = rows
      .map((row) =>
        rangeColumns
          .map((column) => {
            const value = column.exportValue
              ? column.exportValue(row)
              : (getRowValue(row, column.key) as
                  string | number | boolean | Date | null | undefined);

            return String(value ?? '')
              .replace(/\t/g, ' ')
              .replace(/\r?\n/g, ' ');
          })
          .join('\t')
      )
      .join('\n');

    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      copied = fallbackCopyText(text);
    }

    if (copied) {
      setRangeCopyMessage(resolvedLabels.rowsCopied(rows.length));
    }
  };

  const buildRangePasteChanges = (
    text: string,
    anchorRowId: string | number,
    anchorColumnKey: string
  ): DataGridRangePasteChange[] => {
    const anchorRow = pageRowIds.indexOf(anchorRowId);
    const anchorColumn = displayColumns.findIndex((column) => column.key === anchorColumnKey);

    if (anchorRow < 0 || anchorColumn < 0) {
      return [];
    }

    const lines = text.replace(/\r/g, '').split('\n');

    while (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }

    const changes: DataGridRangePasteChange[] = [];

    lines.forEach((line, rowOffset) => {
      const rowIndex = anchorRow + rowOffset;

      if (rowIndex >= pageData.length) {
        return;
      }

      line.split('\t').forEach((value, columnOffset) => {
        const columnIndex = anchorColumn + columnOffset;

        if (columnIndex >= displayColumns.length) {
          return;
        }

        changes.push({
          rowId: pageRowIds[rowIndex],
          columnKey: displayColumns[columnIndex].key,
          value
        });
      });
    });

    return changes;
  };

  const pasteRangeSelection = async () => {
    const anchor = rangeAnchorRef.current;
    const anchorRowId = anchor?.rowId ?? activeRangeSelection?.startRowId;
    const anchorColumnKey = anchor?.columnKey ?? activeRangeSelection?.startColumnKey;

    if (anchorRowId === undefined || !anchorColumnKey) {
      return;
    }

    let text = '';

    try {
      if (!navigator.clipboard?.readText) {
        return;
      }

      text = await navigator.clipboard.readText();
    } catch {
      return;
    }

    const changes = buildRangePasteChanges(text, anchorRowId, anchorColumnKey);

    if (changes.length === 0) {
      return;
    }

    if (batch.enabled) {
      batch.stage(stageRangeChanges(changes));
    } else {
      setRangeCopyMessage(resolvedLabels.cellsPasted(changes.length));
      onRangePaste?.(changes, text);
    }
  };

  const applyRangeFill = (
    sourceRange: DataGridRangeSelection,
    targetRange: DataGridRangeSelection
  ) => {
    const sourceBounds = resolveRangeBounds(sourceRange);
    const targetBounds = resolveRangeBounds(targetRange);

    if (!sourceBounds || !targetBounds) {
      return;
    }

    const vertical =
      sourceBounds.minColumn === targetBounds.minColumn &&
      sourceBounds.maxColumn === targetBounds.maxColumn;
    const changes: DataGridRangeFillChange[] = [];

    for (let rowIndex = targetBounds.minRow; rowIndex <= targetBounds.maxRow; rowIndex += 1) {
      for (
        let columnIndex = targetBounds.minColumn;
        columnIndex <= targetBounds.maxColumn;
        columnIndex += 1
      ) {
        const sourceRow = vertical
          ? rowIndex < sourceBounds.minRow
            ? sourceBounds.minRow
            : sourceBounds.maxRow
          : Math.min(Math.max(rowIndex, sourceBounds.minRow), sourceBounds.maxRow);
        const sourceColumn = vertical
          ? columnIndex
          : columnIndex < sourceBounds.minColumn
            ? sourceBounds.minColumn
            : sourceBounds.maxColumn;

        changes.push({
          rowId: pageRowIds[rowIndex],
          columnKey: displayColumns[columnIndex].key,
          value: getRowValue(
            batch.previewRow(pageRowIds[sourceRow], pageData[sourceRow]),
            displayColumns[sourceColumn].key
          )
        });
      }
    }

    if (changes.length === 0) {
      return;
    }

    if (batch.enabled) {
      batch.stage(stageRangeChanges(changes));
    } else {
      setRangeCopyMessage(resolvedLabels.cellsFilled(changes.length));
      onRangeFill?.(changes, sourceRange, targetRange);
    }
    setFillTargetRange(null);
  };

  const buildFillTarget = (
    sourceRange: DataGridRangeSelection,
    axis: 'row' | 'column',
    steps: number
  ): DataGridRangeSelection | null => {
    if (steps === 0) {
      return null;
    }

    const bounds = resolveRangeBounds(sourceRange);

    if (!bounds) {
      return null;
    }

    if (axis === 'row') {
      if (steps > 0) {
        const lastRow = Math.min(pageData.length - 1, bounds.maxRow + steps);

        if (lastRow <= bounds.maxRow) {
          return null;
        }

        return {
          startRowId: pageRowIds[bounds.maxRow + 1],
          endRowId: pageRowIds[lastRow],
          startColumnKey: sourceRange.startColumnKey,
          endColumnKey: sourceRange.endColumnKey
        };
      }

      const lastRow = Math.max(0, bounds.minRow + steps);

      if (lastRow >= bounds.minRow) {
        return null;
      }

      return {
        startRowId: pageRowIds[lastRow],
        endRowId: pageRowIds[bounds.minRow - 1],
        startColumnKey: sourceRange.startColumnKey,
        endColumnKey: sourceRange.endColumnKey
      };
    }

    if (steps > 0) {
      const lastColumn = Math.min(displayColumns.length - 1, bounds.maxColumn + steps);

      if (lastColumn <= bounds.maxColumn) {
        return null;
      }

      return {
        startRowId: sourceRange.startRowId,
        endRowId: sourceRange.endRowId,
        startColumnKey: displayColumns[bounds.maxColumn + 1].key,
        endColumnKey: displayColumns[lastColumn].key
      };
    }

    const lastColumn = Math.max(0, bounds.minColumn + steps);

    if (lastColumn >= bounds.minColumn || !displayColumns[lastColumn]) {
      return null;
    }

    return {
      startRowId: sourceRange.startRowId,
      endRowId: sourceRange.endRowId,
      startColumnKey: displayColumns[lastColumn].key,
      endColumnKey: displayColumns[bounds.minColumn - 1].key
    };
  };

  const startFillDrag = (
    event: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!withFillHandle || !activeRangeSelection) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (fillDragRef.current) {
      return;
    }

    const sourceRange = activeRangeSelection;
    const bounds = resolveRangeBounds(sourceRange);

    if (!bounds) {
      return;
    }

    const startX = event.clientX;
    const startY = event.clientY;
    const columnStep = Math.max(1, columnWidthsPx[bounds.minColumn] ?? 150);
    const rowStep = Math.max(1, rowHeight);

    fillDragRef.current = { source: sourceRange, startX, startY, target: null };

    const updateTarget = (moveEvent: MouseEvent) => {
      if (!fillDragRef.current) {
        return;
      }

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const axis: 'row' | 'column' = Math.abs(deltaY) >= Math.abs(deltaX) ? 'row' : 'column';
      const steps = axis === 'row' ? Math.round(deltaY / rowStep) : Math.round(deltaX / columnStep);
      const target = steps === 0 ? null : buildFillTarget(sourceRange, axis, steps);

      fillDragRef.current.target = target;
      setFillTargetRange(target);
    };

    const finish = () => {
      const drag = fillDragRef.current;

      fillDragRef.current = null;
      document.removeEventListener('pointermove', updateTarget);
      document.removeEventListener('pointerup', finish);
      document.removeEventListener('mousemove', updateTarget);
      document.removeEventListener('mouseup', finish);

      if (drag?.target) {
        applyRangeFill(drag.source, drag.target);
      } else {
        setFillTargetRange(null);
      }
    };

    document.addEventListener('pointermove', updateTarget);
    document.addEventListener('pointerup', finish);
    document.addEventListener('mousemove', updateTarget);
    document.addEventListener('mouseup', finish);
  };

  const handleFillKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!withFillHandle || !activeRangeSelection) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      if (fillTargetRange) {
        applyRangeFill(activeRangeSelection, fillTargetRange);
      }

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setFillTargetRange(null);
      return;
    }

    const axisByKey: Record<string, { axis: 'row' | 'column'; direction: 1 | -1 }> = {
      ArrowDown: { axis: 'row', direction: 1 },
      ArrowUp: { axis: 'row', direction: -1 },
      ArrowRight: { axis: 'column', direction: 1 },
      ArrowLeft: { axis: 'column', direction: -1 }
    };
    const movement = axisByKey[event.key];

    if (!movement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const sourceBounds = resolveRangeBounds(activeRangeSelection);
    const current = fillTargetRange ? resolveRangeBounds(fillTargetRange) : null;
    let steps: number = movement.direction;

    if (sourceBounds && current) {
      if (movement.axis === 'row') {
        steps =
          movement.direction > 0
            ? current.maxRow - sourceBounds.maxRow + 1
            : current.minRow - sourceBounds.minRow - 1;
      } else {
        steps =
          movement.direction > 0
            ? current.maxColumn - sourceBounds.maxColumn + 1
            : current.minColumn - sourceBounds.minColumn - 1;
      }
    }

    setFillTargetRange(buildFillTarget(activeRangeSelection, movement.axis, steps));
  };

  const handleRangeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!withRangeSelection || !(event.ctrlKey || event.metaKey)) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest('input, textarea, [contenteditable="true"]')) {
      return;
    }

    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      copyRangeSelection();
    } else if (event.key.toLowerCase() === 'v') {
      event.preventDefault();
      pasteRangeSelection();
    }
  };

  const renderDataRow = (row: T, rowIndex: number) => {
    const rowId = pageRowIds[rowIndex];
    const draftRow = batch.previewRow(rowId, row);
    const selected = activeSelectedIds.includes(rowId);
    const expanded = activeExpandedRowIds.includes(rowId);
    const fillBounds = withFillHandle ? getRangeBounds() : null;
    const fillHandleRowId = fillBounds ? pageRowIds[fillBounds.maxRow] : null;
    const fillHandleColumnKey = fillBounds ? displayColumns[fillBounds.maxColumn]?.key : null;

    return (
      <React.Fragment key={rowId}>
        <Table.Row
          aria-selected={withSelection ? selected : undefined}
          aria-rowindex={effectiveVirtualized ? rowIndex + headerRowCount + 1 : undefined}
          style={effectiveVirtualized ? { height: rowHeights[rowIndex] ?? rowHeight } : undefined}
        >
          {hasRowReorder && (
            <Table.Cell
              className={cx(classes.reorderCell)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleRowDrop(event, rowIndex)}
            >
              <button
                type="button"
                draggable
                className={cx(classes.rowDragHandle)}
                onDragStart={(event) => handleRowDragStart(event, rowIndex)}
                onDragEnd={() => {
                  draggedRowIndexRef.current = null;
                }}
                onKeyDown={(event) => handleRowReorderKeyDown(event, rowIndex)}
                aria-label={resolvedLabels.reorderRow(rowId)}
              >
                <Icon icon="more-vertical-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            </Table.Cell>
          )}
          {withSelection && (
            <Table.Cell className={cx(classes.selectionCell)}>
              <Checkbox
                checked={selected}
                onCheck={() => toggleRow(rowId)}
                aria-label={resolvedLabels.selectRow(rowId)}
              />
            </Table.Cell>
          )}
          {hasRowExpansion && (
            <Table.Cell className={cx(classes.expansionCell)}>
              <button
                type="button"
                className={cx(classes.expansionButton)}
                aria-expanded={expanded}
                aria-label={
                  expanded ? resolvedLabels.collapseRow(rowId) : resolvedLabels.expandRow(rowId)
                }
                onClick={() => toggleRowExpanded(rowId)}
              >
                <Icon
                  icon={expanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                  pack="nebular-essentials"
                  aria-hidden="true"
                />
              </button>
            </Table.Cell>
          )}
          {hasRowEditing && (
            <Table.Cell className={cx(classes.editingCell)}>
              <button
                type="button"
                className={cx(classes.expansionButton)}
                aria-label={resolvedLabels.editRow(rowId)}
                onClick={() => startEditingRow(rowId, row)}
              >
                <Icon icon="edit-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            </Table.Cell>
          )}
          {renderColumnSpacer(leadingHiddenColumns, 'data-leading')}
          {buildBodySpanPlan(rowIndex).map(({ column, colSpan, rowSpan }) => {
            const editingThisCell =
              cellEditingEnabled &&
              activeEditingCell?.rowId === rowId &&
              activeEditingCell.columnKey === column.key;
            const canEditCell = cellEditingEnabled && column.editable !== false;
            const cellContent = column.render
              ? column.render(draftRow, rowIndex)
              : (getRowValue(draftRow, column.key) as React.ReactNode);
            const titleText = typeof column.title === 'string' ? column.title : column.key;
            const cellErrorId = `datagrid-cell-error-${String(rowId).replace(
              /[^a-zA-Z0-9_-]/g,
              '_'
            )}-${column.key.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
            const showFillHandle =
              withFillHandle && fillHandleRowId === rowId && fillHandleColumnKey === column.key;
            const treeRow = effectiveTreeData ? treeEntryMap.get(rowId) : undefined;
            const isTreeColumn = Boolean(treeRow) && column.key === activeTreeColumnKey;
            const treeExpanded = treeRow ? activeExpandedTreeKeys.includes(treeRow.key) : false;
            const bodyContent = editingThisCell ? (
              typeof renderCellEditor === 'function' ? (
                <div className={cx(classes.cellEditField)}>
                  {renderCellEditor(
                    draftRow,
                    column,
                    getRowValue(draftRow, column.key),
                    (value) => saveCellEdit(row, column, value),
                    cancelCellEdit
                  )}
                  {cellEditError && (
                    <span id={cellErrorId} role="alert" className={cx(classes.cellEditError)}>
                      {cellEditError}
                    </span>
                  )}
                </div>
              ) : (
                <div className={cx(classes.cellEditField)}>
                  <input
                    className={cx(classes.cellEditInput, {
                      [classes.cellEditInvalid]: !!cellEditError
                    })}
                    value={cellEditValue}
                    autoFocus
                    aria-label={resolvedLabels.editCell(titleText, rowId)}
                    aria-invalid={cellEditError ? true : undefined}
                    aria-describedby={cellEditError ? cellErrorId : undefined}
                    onChange={(event) => setCellEditValue(event.target.value)}
                    onBlur={() => commitCellEdit(row, column)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitCellEdit(row, column);
                      } else if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelCellEdit();
                      }
                    }}
                  />
                  {cellEditError && (
                    <span id={cellErrorId} role="alert" className={cx(classes.cellEditError)}>
                      {cellEditError}
                    </span>
                  )}
                </div>
              )
            ) : canEditCell ? (
              <button
                type="button"
                className={cx(classes.cellEditButton)}
                disabled={batch.saving}
                aria-label={resolvedLabels.editCell(titleText, rowId)}
                onClick={() => beginCellEdit(rowId, row, column)}
              >
                {cellContent}
              </button>
            ) : (
              cellContent
            );

            return (
              <Table.Cell
                key={column.key}
                colSpan={colSpan}
                rowSpan={rowSpan}
                className={cx(getPinnedCellClasses(column), {
                  [classes.alignCenter]: column.align === 'center',
                  [classes.alignRight]: column.align === 'right',
                  [classes.batchPendingCell]: batch.hasChange(rowId, column.key),
                  [classes.rangeSelected]: isRangeCellSelected(rowId, column.key),
                  [classes.rangeFillCell]: showFillHandle,
                  [classes.rangeFillTarget]: isFillTargetCell(rowId, column.key)
                })}
                style={getPinnedCellStyle(column)}
                data-datagrid-tree-cell={isTreeColumn ? '' : undefined}
                // The tree cell is a keyboard target: Enter/Space toggle and the
                // arrow keys expand/collapse the row, mirroring a treegrid.
                tabIndex={isTreeColumn && treeRow?.hasChildren ? 0 : undefined}
                onKeyDown={
                  isTreeColumn && treeRow?.hasChildren
                    ? (event) => handleTreeCellKeyDown(event, treeRow)
                    : undefined
                }
                onMouseDown={(event) => handleRangeCellMouseDown(event, rowId, column.key)}
              >
                {isTreeColumn && treeRow ? (
                  <div
                    className={cx(classes.treeCell)}
                    style={{ paddingInlineStart: treeRow.depth * (treeIndent ?? 16) }}
                  >
                    {treeRow.hasChildren ? (
                      <button
                        type="button"
                        className={cx(classes.treeToggle)}
                        aria-expanded={treeExpanded}
                        aria-label={
                          treeExpanded
                            ? resolvedLabels.collapseRow(treeRow.key)
                            : resolvedLabels.expandRow(treeRow.key)
                        }
                        onClick={() => toggleTreeRow(treeRow.key)}
                      >
                        <Icon
                          icon={treeExpanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                          pack="nebular-essentials"
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      <span className={cx(classes.treeSpacer)} aria-hidden="true" />
                    )}
                    <span className={cx(classes.treeContent)}>{bodyContent}</span>
                  </div>
                ) : (
                  bodyContent
                )}
                {showFillHandle && (
                  <button
                    type="button"
                    className={cx(classes.fillHandle)}
                    aria-label={resolvedLabels.fillHandle}
                    onPointerDown={startFillDrag}
                    onMouseDown={startFillDrag}
                    onKeyDown={handleFillKeyDown}
                  />
                )}
              </Table.Cell>
            );
          })}
          {renderColumnSpacer(trailingHiddenColumns, 'data-trailing')}
        </Table.Row>
        {hasRowExpansion && expanded && (
          <Table.Row key={`${rowId}-expansion`} className={cx(classes.expansionRow)}>
            <Table.Cell colSpan={columnCount}>
              {typeof renderRowExpansion === 'function' && renderRowExpansion(row, rowIndex)}
            </Table.Cell>
          </Table.Row>
        )}
        {hasRowEditing && activeEditingRowId === rowId && (
          <Table.Row key={`${rowId}-editor`} className={cx(classes.editorRow)}>
            <Table.Cell colSpan={columnCount}>
              {typeof renderRowEditor === 'function' ? (
                renderRowEditor(row, (changes) => saveEditingRow(row, changes), cancelEditingRow)
              ) : (
                <div className={cx(classes.editorForm)}>
                  {visibleColumns
                    .filter((column) => column.editable !== false)
                    .map((column) => (
                      <label key={column.key} className={cx(classes.editorField)}>
                        <span className={cx(classes.editorLabel)}>{column.title}</span>
                        <Input
                          value={
                            rowEditDraft[column.key] === undefined ||
                            rowEditDraft[column.key] === null
                              ? ''
                              : String(rowEditDraft[column.key])
                          }
                          onChange={(event) =>
                            setRowEditDraft((draft) => ({
                              ...draft,
                              [column.key]: event.target.value
                            }))
                          }
                          aria-label={resolvedLabels.editColumn(
                            typeof column.title === 'string' ? column.title : column.key
                          )}
                        />
                      </label>
                    ))}
                  <div className={cx(classes.editorActions)}>
                    <Button
                      size="small"
                      onClick={() => saveEditingRow(row, rowEditDraft as Partial<T>)}
                    >
                      {resolvedLabels.save}
                    </Button>
                    <Button size="small" appearance="ghost" onClick={cancelEditingRow}>
                      {resolvedLabels.cancel}
                    </Button>
                  </div>
                </div>
              )}
            </Table.Cell>
          </Table.Row>
        )}
      </React.Fragment>
    );
  };

  const renderReorderHandle = (column: DataGridColumn<T>) => (
    <button
      type="button"
      className={cx(classes.reorderHandle)}
      draggable
      onDragStart={(event) => handleColumnDragStart(event, column)}
      onDragEnd={() => {
        draggedColumnKeyRef.current = null;
      }}
      onKeyDown={(event) => handleReorderKeyDown(event, column)}
      aria-label={resolvedLabels.reorderColumn(
        typeof column.title === 'string' ? column.title : column.key
      )}
    >
      <Icon icon="more-vertical-outline" pack="nebular-essentials" aria-hidden="true" />
    </button>
  );

  const renderColumnMenu = (column: DataGridColumn<T>) => {
    if (!withColumnMenu) {
      return null;
    }

    const titleText = typeof column.title === 'string' ? column.title : column.key;
    const open = openColumnMenuKey === column.key;
    const pinnedSide = getPinnedSide(column);
    const canHide = column.hideable !== false;

    return (
      <div className={cx(classes.columnMenu)} data-datagrid-column-menu="">
        <button
          type="button"
          className={cx(classes.columnMenuButton)}
          aria-label={resolvedLabels.columnOptions(titleText)}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(event) => {
            event.stopPropagation();
            columnMenuTriggerRef.current = event.currentTarget;
            setOpenColumnMenuKey(open ? null : column.key);
          }}
        >
          <Icon icon="more-horizontal-outline" pack="nebular-essentials" aria-hidden="true" />
        </button>
        {open && (
          <Portal>
            <div
              ref={positionColumnMenu}
              className={cx(classes.columnMenuDropdown)}
              role="menu"
              aria-label={resolvedLabels.columnOptions(titleText)}
              data-datagrid-column-menu=""
              data-datagrid-menu-panel=""
            >
              {column.sortable && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(classes.columnMenuItem)}
                    onClick={() => applySort(column, 'asc')}
                  >
                    {resolvedLabels.sortAscending}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(classes.columnMenuItem)}
                    onClick={() => applySort(column, 'desc')}
                  >
                    {resolvedLabels.sortDescending}
                  </button>
                </>
              )}
              {!hasGroupedHeaders && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(classes.columnMenuItem)}
                    disabled={pinnedSide === 'left'}
                    onClick={() => handlePinColumn(column, 'left')}
                  >
                    {resolvedLabels.pinLeft}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(classes.columnMenuItem)}
                    disabled={pinnedSide === 'right'}
                    onClick={() => handlePinColumn(column, 'right')}
                  >
                    {resolvedLabels.pinRight}
                  </button>
                  {pinnedSide && (
                    <button
                      type="button"
                      role="menuitem"
                      className={cx(classes.columnMenuItem)}
                      onClick={() => handlePinColumn(column)}
                    >
                      {resolvedLabels.unpin}
                    </button>
                  )}
                </>
              )}
              {withColumnVisibility && canHide && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.columnMenuItem)}
                  onClick={() => {
                    handleColumnVisibilityChange(column, false);
                    setOpenColumnMenuKey(null);
                  }}
                >
                  {resolvedLabels.hideColumn}
                </button>
              )}
            </div>
          </Portal>
        )}
      </div>
    );
  };

  const renderLeafHeader = (
    column: DataGridColumn<T>,
    options: { rowSpan?: number; colSpan?: number; allowReorder?: boolean } = {}
  ) => (
    <Table.HeaderCell
      key={column.key}
      rowSpan={options.rowSpan && options.rowSpan > 1 ? options.rowSpan : undefined}
      colSpan={options.colSpan && options.colSpan > 1 ? options.colSpan : undefined}
      aria-sort={getAriaSort(column)}
      style={{ ...getHeaderStyle(column), ...getPinnedCellStyle(column, true) }}
      className={cx(classes.headerCell, getPinnedCellClasses(column, true), {
        [classes.alignCenter]: column.align === 'center',
        [classes.alignRight]: column.align === 'right'
      })}
      onDragOver={
        withColumnReorder && options.allowReorder !== false ? handleColumnDragOver : undefined
      }
      onDrop={
        withColumnReorder && options.allowReorder !== false
          ? (event) => handleColumnDrop(event, column)
          : undefined
      }
    >
      <div className={cx(classes.headerContent)}>
        {withColumnReorder && options.allowReorder !== false && renderReorderHandle(column)}
        {column.sortable ? (
          <button
            type="button"
            className={cx(classes.sortButton)}
            onClick={() => handleSort(column)}
          >
            {column.title}
            <span
              className={cx(classes.sortIcon, {
                [classes.sortIconActive]: activeSort?.key === column.key
              })}
              aria-hidden="true"
            >
              <Icon
                icon={
                  activeSort?.key === column.key && activeSort.direction === 'desc'
                    ? 'chevron-down-outline'
                    : 'chevron-up-outline'
                }
                pack="nebular-essentials"
              />
            </span>
          </button>
        ) : (
          column.title
        )}
        {renderColumnMenu(column)}
      </div>
      {withColumnResize && (
        <span
          role="separator"
          aria-orientation="vertical"
          aria-label={resolvedLabels.resizeColumn(
            typeof column.title === 'string' ? column.title : column.key
          )}
          aria-valuemin={column.minWidth ?? minColumnWidth}
          aria-valuemax={column.maxWidth ?? 2000}
          aria-valuenow={
            activeColumnWidths[column.key] ??
            (typeof column.width === 'number' ? column.width : 150)
          }
          // A focusable separator is the ARIA pattern for a resizable splitter.
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className={cx(classes.resizeHandle)}
          onMouseDown={(event) => handleResizeMouseDown(event, column)}
          onKeyDown={(event) => handleResizeKeyDown(event, column)}
        />
      )}
    </Table.HeaderCell>
  );

  const renderColumnGroupHeader = (column: DataGridColumn<T>) => (
    <Table.HeaderCell
      key={column.key}
      scope="colgroup"
      colSpan={countLeafColumns(column)}
      className={cx(classes.headerCell, classes.groupHeaderCell)}
      onDragOver={withColumnReorder ? handleColumnDragOver : undefined}
      onDrop={withColumnReorder ? (event) => handleColumnDrop(event, column) : undefined}
    >
      <div className={cx(classes.headerContent)}>
        {withColumnReorder && renderReorderHandle(column)}
        <span>{column.title}</span>
      </div>
    </Table.HeaderCell>
  );

  return (
    <div
      {...others}
      className={cx(classes.root, className, {
        [classes.densityCompact]: density === 'compact',
        [classes.densitySpacious]: density === 'spacious'
      })}
      role="region"
      aria-label={resolvedAriaLabel}
      aria-busy={loading || batch.saving || undefined}
      onKeyDown={(event) => {
        (others.onKeyDown as React.KeyboardEventHandler<HTMLDivElement> | undefined)?.(event);
        handleUndoRedoKeyDown(event);
        handleRangeKeyDown(event);
      }}
    >
      {(batch.enabled ||
        withColumnVisibility ||
        withExport ||
        withViews ||
        withUndoRedo ||
        withExcelExport) && (
        <div className={cx(classes.toolbar)}>
          {batch.enabled && (
            <div
              className={cx(classes.batchControls)}
              role="group"
              aria-label={resolvedLabels.batchChanges}
            >
              <span role="status">
                {batch.saving ? batch.labels.applying : batch.labels.pending(batch.changes.length)}
              </span>
              <button
                type="button"
                className={cx(classes.toolbarButton)}
                disabled={!batch.changes.length || batch.saving || Boolean(activeEditingCell)}
                onClick={() => batch.apply(validateBatchCells)}
              >
                {batch.labels.apply}
              </button>
              <button
                type="button"
                className={cx(classes.toolbarButton)}
                disabled={!batch.changes.length || batch.saving}
                onClick={() => {
                  cancelCellEdit();
                  batch.discard();
                }}
              >
                {batch.labels.discard}
              </button>
              {batch.error && <span role="alert">{batch.error}</span>}
            </div>
          )}
          {withUndoRedo && (
            <div
              className={cx(classes.historyControls)}
              role="group"
              aria-label={resolvedLabels.editHistory}
            >
              <button
                type="button"
                className={cx(classes.toolbarButton)}
                aria-label={resolvedLabels.undo}
                title={`${resolvedLabels.undo} (Ctrl/Cmd+Z)`}
                disabled={!canUndo}
                onClick={handleUndo}
              >
                {resolvedLabels.undo}
              </button>
              <button
                type="button"
                className={cx(classes.toolbarButton)}
                aria-label={resolvedLabels.redo}
                title={`${resolvedLabels.redo} (Ctrl/Cmd+Shift+Z or Ctrl+Y)`}
                disabled={!canRedo}
                onClick={handleRedo}
              >
                {resolvedLabels.redo}
              </button>
            </div>
          )}
          {withViews && (
            <div className={cx(classes.viewControls)}>
              <select
                className={cx(classes.viewSelect)}
                aria-label={resolvedLabels.savedViews}
                value={resolvedActiveViewId ?? ''}
                onChange={handleViewSelect}
              >
                <option value="">{resolvedLabels.noView}</option>
                {activeViews.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.name}
                  </option>
                ))}
              </select>
              {isViewFormOpen ? (
                <div
                  className={cx(classes.viewForm)}
                  role="group"
                  aria-label={resolvedLabels.saveView}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.stopPropagation();
                      cancelViewForm();
                    }
                  }}
                >
                  <input
                    type="text"
                    className={cx(classes.viewInput)}
                    value={viewName}
                    onChange={(event) => setViewName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSaveView();
                      }
                    }}
                    placeholder={resolvedLabels.viewName}
                    aria-label={resolvedLabels.viewName}
                  />
                  <button
                    type="button"
                    className={cx(classes.toolbarButton)}
                    onClick={handleSaveView}
                  >
                    {resolvedLabels.save}
                  </button>
                  <button
                    type="button"
                    className={cx(classes.toolbarButton)}
                    onClick={cancelViewForm}
                  >
                    {resolvedLabels.cancel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={cx(classes.toolbarButton)}
                  onClick={() => setIsViewFormOpen(true)}
                >
                  {resolvedLabels.saveView}
                </button>
              )}
              {activeView && (
                <button
                  type="button"
                  className={cx(classes.toolbarButton)}
                  onClick={handleDeleteView}
                >
                  {resolvedLabels.deleteView}
                </button>
              )}
            </div>
          )}
          {withColumnVisibility && (
            <details className={cx(classes.columnVisibility)}>
              <summary className={cx(classes.toolbarButton)}>{resolvedLabels.columns}</summary>
              <div className={cx(classes.columnPanel)}>
                {orderedColumns.length === 0 && <span>{resolvedLabels.noColumns}</span>}
                {orderedColumns.map((column) => {
                  const hidden = activeHiddenColumnKeys.includes(column.key);
                  const isLastVisible = visibleColumns.length === 1 && !hidden;

                  return (
                    <Checkbox
                      key={column.key}
                      checked={!hidden}
                      disabled={column.hideable === false || isLastVisible}
                      onCheck={(checked) => handleColumnVisibilityChange(column, checked)}
                    >
                      {column.title}
                    </Checkbox>
                  );
                })}
              </div>
            </details>
          )}
          {withExport && (
            <button type="button" className={cx(classes.toolbarButton)} onClick={handleExport}>
              {resolvedLabels.exportCsv}
            </button>
          )}
          {withExcelExport && (
            <button
              type="button"
              className={cx(classes.toolbarButton)}
              aria-label={resolvedLabels.exportExcel}
              onClick={handleExcelExport}
            >
              {resolvedLabels.exportExcel}
            </button>
          )}
          {withExcelExport && (
            <span role="status" aria-live="polite" className={cx(classes.excelStatus)}>
              {excelExportMessage}
            </span>
          )}
        </div>
      )}
      {!hasRenderableRows && !withColumnFilters && !loading ? (
        <div className={cx(classes.empty)}>{renderEmptyState()}</div>
      ) : (
        <LoadingOverlay visible={loading} message={resolvedLoadingMessage}>
          <div
            ref={viewportRef}
            className={cx(classes.viewport)}
            style={effectiveVirtualized ? { maxHeight: virtualizedMaxHeight } : undefined}
            onScroll={
              effectiveVirtualized || columnVirtualizationEnabled
                ? (event) => {
                    if (columnVirtualizationEnabled) {
                      setScrollLeft(event.currentTarget.scrollLeft);
                    }

                    if (effectiveVirtualized) {
                      setScrollTop(event.currentTarget.scrollTop);
                    }
                  }
                : undefined
            }
            data-nebular-datagrid-viewport=""
          >
            <Table
              striped={striped}
              highlightOnHover={highlightOnHover}
              withBorder={withBorder}
              className={cx({
                [classes.virtualizedTable]: effectiveVirtualized,
                [classes.resizableTable]: withColumnResize || columnVirtualizationEnabled,
                [classes.autofitTable]: withColumnAutofit
              })}
              aria-rowcount={
                effectiveVirtualized && pageData.length > 0
                  ? pageData.length + headerRowCount
                  : undefined
              }
            >
              {caption && <Table.Caption>{caption}</Table.Caption>}
              {columnVirtualizationEnabled && (
                <colgroup>
                  {hasRowReorder && <col style={{ width: '2.75rem' }} />}
                  {withSelection && <col style={{ width: '2.75rem' }} />}
                  {hasRowExpansion && <col style={{ width: '2.5rem' }} />}
                  {hasRowEditing && <col style={{ width: '2.5rem' }} />}
                  {displayColumns.map((column) => (
                    <col key={column.key} style={{ width: getColumnWidthValue(column) }} />
                  ))}
                </colgroup>
              )}
              <Table.Head ref={headRef}>
                {hasGroupedHeaders && (
                  <Table.Row>
                    {hasRowReorder && (
                      <Table.HeaderCell
                        rowSpan={headerRowCount}
                        className={cx(classes.reorderCell)}
                      >
                        <span className={cx(classes.visuallyHidden)}>
                          {resolvedLabels.reorderColumnHeader}
                        </span>
                      </Table.HeaderCell>
                    )}
                    {withSelection && (
                      <Table.HeaderCell
                        rowSpan={headerRowCount}
                        className={cx(classes.selectionCell)}
                      >
                        <Checkbox
                          checked={allPageRowsSelected}
                          indeterminate={somePageRowsSelected}
                          onCheck={toggleAllPageRows}
                          aria-label={resolvedLabels.selectAllRows}
                        />
                      </Table.HeaderCell>
                    )}
                    {hasRowExpansion && (
                      <Table.HeaderCell
                        rowSpan={headerRowCount}
                        className={cx(classes.expansionCell)}
                      >
                        <span className={cx(classes.visuallyHidden)}>
                          {resolvedLabels.rowDetails}
                        </span>
                      </Table.HeaderCell>
                    )}
                    {hasRowEditing && (
                      <Table.HeaderCell
                        rowSpan={headerRowCount}
                        className={cx(classes.editingCell)}
                      >
                        <span className={cx(classes.visuallyHidden)}>{resolvedLabels.actions}</span>
                      </Table.HeaderCell>
                    )}
                    {headerColumns.map((column) =>
                      column.children && column.children.length > 0
                        ? renderColumnGroupHeader(column)
                        : renderLeafHeader(column, { rowSpan: 2 })
                    )}
                  </Table.Row>
                )}
                <Table.Row>
                  {!hasGroupedHeaders && hasRowReorder && (
                    <Table.HeaderCell className={cx(classes.reorderCell)}>
                      <span className={cx(classes.visuallyHidden)}>
                        {resolvedLabels.reorderColumnHeader}
                      </span>
                    </Table.HeaderCell>
                  )}
                  {!hasGroupedHeaders && withSelection && (
                    <Table.HeaderCell className={cx(classes.selectionCell)}>
                      <Checkbox
                        checked={allPageRowsSelected}
                        indeterminate={somePageRowsSelected}
                        onCheck={toggleAllPageRows}
                        aria-label={resolvedLabels.selectAllRows}
                      />
                    </Table.HeaderCell>
                  )}
                  {!hasGroupedHeaders && hasRowExpansion && (
                    <Table.HeaderCell className={cx(classes.expansionCell)}>
                      <span className={cx(classes.visuallyHidden)}>
                        {resolvedLabels.rowDetails}
                      </span>
                    </Table.HeaderCell>
                  )}
                  {!hasGroupedHeaders && hasRowEditing && (
                    <Table.HeaderCell className={cx(classes.editingCell)}>
                      <span className={cx(classes.visuallyHidden)}>{resolvedLabels.actions}</span>
                    </Table.HeaderCell>
                  )}
                  {renderColumnSpacer(leadingHiddenColumns, 'header-leading', true)}
                  {(hasGroupedHeaders
                    ? headerColumns
                        .filter((column) => !!column.children && column.children.length > 0)
                        .flatMap((column) => flattenColumns([column]))
                        .map(
                          (
                            column
                          ): {
                            column: DataGridColumn<T>;
                            colSpan?: number;
                            rowSpan?: number;
                          } => ({ column })
                        )
                    : headerSpanPlan
                  ).map(({ column, colSpan, rowSpan }) =>
                    renderLeafHeader(column, {
                      colSpan,
                      rowSpan,
                      allowReorder: !hasGroupedHeaders
                    })
                  )}
                  {renderColumnSpacer(trailingHiddenColumns, 'header-trailing', true)}
                </Table.Row>
                {withColumnFilters && (
                  <Table.Row className={cx(classes.filterRow)} aria-label={resolvedLabels.filters}>
                    {!hasGroupedHeaders && hasRowReorder && (
                      <Table.HeaderCell className={cx(classes.reorderCell)}>
                        <span className={cx(classes.visuallyHidden)}>
                          {resolvedLabels.reorderColumnHeader}
                        </span>
                      </Table.HeaderCell>
                    )}
                    {!hasGroupedHeaders && withSelection && (
                      <Table.HeaderCell className={cx(classes.selectionCell)}>
                        <span className={cx(classes.visuallyHidden)}>
                          {resolvedLabels.selection}
                        </span>
                      </Table.HeaderCell>
                    )}
                    {!hasGroupedHeaders && hasRowExpansion && (
                      <Table.HeaderCell className={cx(classes.expansionCell)}>
                        <span className={cx(classes.visuallyHidden)}>
                          {resolvedLabels.rowDetails}
                        </span>
                      </Table.HeaderCell>
                    )}
                    {!hasGroupedHeaders && hasRowEditing && (
                      <Table.HeaderCell className={cx(classes.editingCell)}>
                        <span className={cx(classes.visuallyHidden)}>{resolvedLabels.actions}</span>
                      </Table.HeaderCell>
                    )}
                    {renderColumnSpacer(leadingHiddenColumns, 'filter-leading', true)}
                    {filterRowColumns.map((column) => (
                      <Table.HeaderCell
                        key={column.key}
                        aria-label={getFilterAriaLabel(column)}
                        style={getPinnedCellStyle(column, true)}
                        className={cx(getPinnedCellClasses(column, true), {
                          [classes.alignCenter]: column.align === 'center',
                          [classes.alignRight]: column.align === 'right'
                        })}
                      >
                        {!column.filterable && (
                          <span className={cx(classes.visuallyHidden)}>
                            {getFilterAriaLabel(column)}
                          </span>
                        )}
                        {column.filterable &&
                          (column.filterType === 'number' || column.filterType === 'date') && (
                            <div className={cx(classes.filterRange)}>
                              <input
                                type={column.filterType}
                                className={cx(classes.filterInput, classes.filterRangeInput)}
                                value={parseRangeFilterValue(activeFilterValues[column.key]).min}
                                onChange={(event) => {
                                  const range = parseRangeFilterValue(
                                    activeFilterValues[column.key]
                                  );

                                  handleFilterChange(column, `${event.target.value},${range.max}`);
                                }}
                                placeholder={resolvedLabels.fromPlaceholder}
                                aria-label={resolvedLabels.filterFrom(getFilterTitle(column))}
                              />
                              <input
                                type={column.filterType}
                                className={cx(classes.filterInput, classes.filterRangeInput)}
                                value={parseRangeFilterValue(activeFilterValues[column.key]).max}
                                onChange={(event) => {
                                  const range = parseRangeFilterValue(
                                    activeFilterValues[column.key]
                                  );

                                  handleFilterChange(column, `${range.min},${event.target.value}`);
                                }}
                                placeholder={resolvedLabels.toPlaceholder}
                                aria-label={resolvedLabels.filterTo(getFilterTitle(column))}
                              />
                            </div>
                          )}
                        {column.filterable && (column.filterType ?? 'text') === 'text' && (
                          <input
                            type="search"
                            className={cx(classes.filterInput)}
                            value={activeFilterValues[column.key] ?? ''}
                            onChange={(event) => handleFilterChange(column, event.target.value)}
                            placeholder={
                              column.filterPlaceholder ?? resolvedLabels.filterPlaceholder
                            }
                            aria-label={getFilterAriaLabel(column)}
                          />
                        )}
                      </Table.HeaderCell>
                    ))}
                    {renderColumnSpacer(trailingHiddenColumns, 'filter-trailing', true)}
                  </Table.Row>
                )}
              </Table.Head>
              <Table.Body>
                {!hasRenderableRows ? (
                  <Table.Row>
                    <Table.Cell colSpan={columnCount}>{renderEmptyState()}</Table.Cell>
                  </Table.Row>
                ) : (
                  <>
                    {renderSpacerRow(topSpacerHeight, 'data-grid-top-spacer')}
                    {serverSideGrouping
                      ? serverGrouped.entries.map((entry) =>
                          entry.type === 'group'
                            ? renderServerGroupHeaderRow(entry.group, entry.depth)
                            : renderDataRow(serverGrouped.rows[entry.index], entry.index)
                        )
                      : groupedPageTree
                        ? groupedPageTree.map(renderGroupNode)
                        : visiblePageData.map((row, index) =>
                            renderDataRow(row, startIndex + index)
                          )}
                    {renderSpacerRow(bottomSpacerHeight, 'data-grid-bottom-spacer')}
                  </>
                )}
              </Table.Body>
              {withSummary && (
                <Table.Foot>
                  <Table.Row className={cx(classes.summaryRow)}>
                    {hasRowReorder && <Table.Cell className={cx(classes.reorderCell)} />}
                    {withSelection && (
                      <Table.Cell className={cx(classes.selectionCell)}>
                        {!hasRowExpansion && !hasRowEditing ? summaryLabel : null}
                      </Table.Cell>
                    )}
                    {hasRowExpansion && (
                      <Table.Cell className={cx(classes.expansionCell)}>
                        {!hasRowEditing ? summaryLabel : null}
                      </Table.Cell>
                    )}
                    {hasRowEditing && (
                      <Table.Cell className={cx(classes.editingCell)}>{summaryLabel}</Table.Cell>
                    )}
                    {renderColumnSpacer(leadingHiddenColumns, 'summary-leading')}
                    {buildBodySpanPlan(0, false).map(({ column, colSpan }, index) => {
                      const aggregated = resolveAggregateValue(column, summaryRows);
                      const showLabel =
                        index === 0 &&
                        !withSelection &&
                        !hasRowExpansion &&
                        !hasRowEditing &&
                        aggregated == null;

                      return (
                        <Table.Cell
                          key={column.key}
                          colSpan={colSpan}
                          className={cx(classes.summaryCell, getPinnedCellClasses(column), {
                            [classes.alignCenter]: column.align === 'center',
                            [classes.alignRight]: column.align === 'right'
                          })}
                          style={getPinnedCellStyle(column)}
                        >
                          {aggregated ?? (showLabel ? summaryLabel : null)}
                        </Table.Cell>
                      );
                    })}
                    {renderColumnSpacer(trailingHiddenColumns, 'summary-trailing')}
                  </Table.Row>
                </Table.Foot>
              )}
            </Table>
          </div>
        </LoadingOverlay>
      )}

      {effectivePagination && totalPages > 1 && (
        <Pagination total={totalPages} page={activePage} onChange={setCurrentPage} />
      )}
      {withRangeSelection && (
        <span className={cx(classes.visuallyHidden)} role="status" aria-live="polite">
          {rangeCopyMessage}
        </span>
      )}
    </div>
  );
}

DataGrid.displayName = 'DataGrid';

export { DataGrid };
