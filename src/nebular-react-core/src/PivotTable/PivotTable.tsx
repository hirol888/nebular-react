import React from 'react';
import type { Property } from 'csstype';
import { useUncontrolled } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { Icon } from '../Icon';
import { Table } from '../Table';

export type PivotAggregate = 'sum' | 'avg' | 'min' | 'max' | 'count';

export interface PivotMeasure<T> {
  key: string;
  label: string;
  aggregate: PivotAggregate;
  value?(row: T): number | null | undefined;
  formatter?(value: number): React.ReactNode;
}

export interface PivotTableColumn {
  key: string;
  label: string;
  values: string[];
}

/**
 * Payload describing a single drill-down cell: the row group, the column group, the measure and
 * the aggregated value that was clicked.
 */
export interface PivotTableCellContext<T> {
  row: PivotTableRow<T>;
  column: PivotTableColumn;
  measure: PivotMeasure<T>;
  value: number;
}

export interface PivotTableRow<T> {
  key: string;
  values: string[];
  depth: number;
  isLeaf: boolean;
  /** Column cells of the first measure, kept for backwards compatibility. */
  cells: Record<string, number>;
  /** Row total of the first measure, kept for backwards compatibility. */
  total: number;
  /** Column cells keyed by measure key, then by column key. */
  measureCells: Record<string, Record<string, number>>;
  /** Row totals keyed by measure key. */
  measureTotals: Record<string, number>;
  row?: T;
  children: PivotTableRow<T>[];
}

export interface PivotTableModel<T> {
  columns: PivotTableColumn[];
  rows: PivotTableRow<T>[];
  /** Column totals of the first measure, kept for backwards compatibility. */
  columnTotals: Record<string, number>;
  /** Grand total of the first measure, kept for backwards compatibility. */
  grandTotal: number;
  measures: PivotMeasure<T>[];
  /**
   * Column cells keyed by measure key, then by column key. Mirrors `measureColumnTotals` so
   * consumers can read every measure with the same shape used by `cells`.
   */
  measureCells: Record<string, Record<string, number>>;
  /** Column totals keyed by measure key, then by column key. */
  measureColumnTotals: Record<string, Record<string, number>>;
  /** Grand totals keyed by measure key. */
  measureGrandTotals: Record<string, number>;
}

export interface BuildPivotTableOptions<T> {
  rows: string[];
  column?: string;
  measure?: PivotMeasure<T>;
  /** Takes precedence over `measure`; at least one measure is required. */
  measures?: PivotMeasure<T>[];
}

const DIMENSION_SEPARATOR = ' / ';

function toDimensionValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function compareDimensionValues(valueA: string, valueB: string): number {
  return valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' });
}

export function formatPivotNumber(value: number): string {
  return String(Number(value.toFixed(2)));
}

function resolveMeasureValue<T>(row: T, measure: PivotMeasure<T>): number | undefined {
  const rawValue = measure.value
    ? measure.value(row)
    : (row as Record<string, unknown>)[measure.key];

  return typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : undefined;
}

function aggregateRows<T>(rows: T[], measure: PivotMeasure<T>): number | undefined {
  if (rows.length === 0) {
    return undefined;
  }

  if (measure.aggregate === 'count') {
    return rows.length;
  }

  const values = rows
    .map((row) => resolveMeasureValue(row, measure))
    .filter((value): value is number => value !== undefined);

  if (values.length === 0) {
    return undefined;
  }

  switch (measure.aggregate) {
    case 'avg':
      return values.reduce((total, value) => total + value, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return values.reduce((total, value) => total + value, 0);
  }
}

interface PivotGroup<T> {
  values: string[];
  rows: T[];
  children: PivotGroup<T>[];
}

function groupByLevel<T extends Record<string, unknown>>(
  data: T[],
  rowKeys: string[],
  level: number
): PivotGroup<T>[] {
  if (level >= rowKeys.length) {
    return [];
  }

  const rowKey = rowKeys[level];
  const buckets = new Map<string, T[]>();

  data.forEach((row) => {
    const value = toDimensionValue((row as Record<string, unknown>)[rowKey]);
    const bucket = buckets.get(value);

    if (bucket) {
      bucket.push(row);
    } else {
      buckets.set(value, [row]);
    }
  });

  return [...buckets.entries()]
    .sort(([valueA], [valueB]) => compareDimensionValues(valueA, valueB))
    .map(([value, groupRows]) => ({
      values: [value],
      rows: groupRows,
      children: level + 1 < rowKeys.length ? groupByLevel(groupRows, rowKeys, level + 1) : []
    }));
}

function buildPivotRows<T extends Record<string, unknown>>(
  groups: PivotGroup<T>[],
  parentValues: string[],
  depth: number,
  columns: PivotTableColumn[],
  column: string | undefined,
  measures: PivotMeasure<T>[]
): PivotTableRow<T>[] {
  return groups.map((group) => {
    const values = [...parentValues, ...group.values];
    const children = buildPivotRows(group.children, values, depth + 1, columns, column, measures);
    const measureCells: Record<string, Record<string, number>> = {};
    const measureTotals: Record<string, number> = {};

    measures.forEach((measure) => {
      const cells: Record<string, number> = {};

      if (column) {
        const columnKey = column;

        columns.forEach((pivotColumn) => {
          const columnValue = pivotColumn.values[0];
          const matchingRows = group.rows.filter(
            (row) => toDimensionValue((row as Record<string, unknown>)[columnKey]) === columnValue
          );
          const aggregated = aggregateRows(matchingRows, measure);

          if (aggregated !== undefined) {
            cells[pivotColumn.key] = aggregated;
          }
        });
      }

      measureCells[measure.key] = cells;
      measureTotals[measure.key] = aggregateRows(group.rows, measure) ?? 0;
    });

    const isLeaf = group.children.length === 0;
    const pivotRow: PivotTableRow<T> = {
      key: values.join(DIMENSION_SEPARATOR),
      values,
      depth,
      isLeaf,
      cells: measureCells[measures[0].key] ?? {},
      total: measureTotals[measures[0].key] ?? 0,
      measureCells,
      measureTotals,
      children
    };

    const [firstRow] = group.rows;

    if (isLeaf && firstRow !== undefined) {
      pivotRow.row = firstRow;
    }

    return pivotRow;
  });
}

/**
 * Resolves the measures used by the pivot table.
 * A non empty `measures` list always wins over the single `measure` prop.
 */
export function normalizePivotMeasures<T>(
  measure?: PivotMeasure<T> | null,
  measures?: PivotMeasure<T>[] | null
): PivotMeasure<T>[] {
  if (measures && measures.length > 0) {
    return measures;
  }

  if (measure) {
    return [measure];
  }

  return [];
}

export function buildPivotTable<T extends Record<string, unknown>>(
  data: T[],
  options: BuildPivotTableOptions<T>
): PivotTableModel<T> {
  const { rows: rowKeys, column } = options;
  const measures = normalizePivotMeasures(options.measure, options.measures);

  if (measures.length === 0) {
    throw new Error('buildPivotTable requires at least one measure');
  }

  const columnValues = column
    ? Array.from(
        new Set(data.map((row) => toDimensionValue((row as Record<string, unknown>)[column])))
      ).sort(compareDimensionValues)
    : [];
  const columns: PivotTableColumn[] = columnValues.map((value) => ({
    key: value,
    label: value,
    values: [value]
  }));
  const groups = groupByLevel(data, rowKeys, 0);
  const tableRows = buildPivotRows(groups, [], 0, columns, column, measures);
  const measureCells: Record<string, Record<string, number>> = {};
  const measureColumnTotals: Record<string, Record<string, number>> = {};
  const measureGrandTotals: Record<string, number> = {};

  measures.forEach((measure) => {
    const cells: Record<string, number> = {};

    columns.forEach((pivotColumn) => {
      const columnValue = pivotColumn.values[0];
      const matchingRows = column
        ? data.filter(
            (row) => toDimensionValue((row as Record<string, unknown>)[column]) === columnValue
          )
        : [];

      cells[pivotColumn.key] = aggregateRows(matchingRows, measure) ?? 0;
    });

    measureCells[measure.key] = { ...cells };
    measureColumnTotals[measure.key] = cells;
    measureGrandTotals[measure.key] = aggregateRows(data, measure) ?? 0;
  });

  const [firstMeasure] = measures;

  return {
    columns,
    rows: tableRows,
    columnTotals: { ...measureColumnTotals[firstMeasure.key] },
    grandTotal: measureGrandTotals[firstMeasure.key] ?? 0,
    measures,
    measureCells,
    measureColumnTotals,
    measureGrandTotals
  };
}

function flattenPivotRows<T>(rows: PivotTableRow<T>[]): PivotTableRow<T>[] {
  return rows.flatMap((row) => [row, ...flattenPivotRows(row.children)]);
}

export interface PivotTableCsvOptions {
  separator?: string;
  rowLabel?: string;
}

function isPivotMeasure<T>(
  value: PivotMeasure<T> | PivotTableCsvOptions | undefined
): value is PivotMeasure<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    'aggregate' in value &&
    'label' in value
  );
}

/**
 * Serializes a pivot model as CSV.
 *
 * The measures come from `model.measures`; the legacy `measure` argument is still accepted (with
 * its options) so existing call sites keep working.
 */
export function createPivotTableCsv<T>(
  model: PivotTableModel<T>,
  measureOrOptions?: PivotMeasure<T> | PivotTableCsvOptions,
  maybeOptions: PivotTableCsvOptions = {}
): string {
  const measures = model.measures?.length
    ? model.measures
    : isPivotMeasure(measureOrOptions)
      ? [measureOrOptions]
      : [];
  const options = isPivotMeasure(measureOrOptions) ? maybeOptions : (measureOrOptions ?? {});
  const { separator = ',', rowLabel = 'Group' } = options;
  const hasColumns = model.columns.length > 0;
  const isMultiMeasure = measures.length > 1;
  const escapeValue = (value: string): string =>
    value.includes(separator) || value.includes('"') || /[\n\r]/.test(value)
      ? `"${value.replace(/"/g, '""')}"`
      : value;
  const measureHeader = (label: string, measure: PivotMeasure<T>): string =>
    `${label}${DIMENSION_SEPARATOR}${measure.label}`;
  let header: string[];

  if (hasColumns) {
    header = isMultiMeasure
      ? [
          rowLabel,
          ...model.columns.flatMap((column) =>
            measures.map((measure) => measureHeader(column.label, measure))
          ),
          ...measures.map((measure) => measureHeader('Total', measure))
        ]
      : [rowLabel, ...model.columns.map((column) => column.label), 'Total'];
  } else {
    header = [rowLabel, ...measures.map((measure) => measure.label)];
  }

  const lines = [header.map(escapeValue).join(separator)];

  flattenPivotRows(model.rows).forEach((row) => {
    const values = [row.values.join(DIMENSION_SEPARATOR)];

    if (hasColumns) {
      if (isMultiMeasure) {
        model.columns.forEach((column) => {
          measures.forEach((measure) => {
            const cell = row.measureCells[measure.key]?.[column.key];

            values.push(cell === undefined ? '' : formatPivotNumber(cell));
          });
        });
        measures.forEach((measure) => {
          values.push(formatPivotNumber(row.measureTotals[measure.key] ?? 0));
        });
      } else {
        model.columns.forEach((column) => {
          const cell = row.cells[column.key];

          values.push(cell === undefined ? '' : formatPivotNumber(cell));
        });
        values.push(formatPivotNumber(row.total));
      }
    } else if (isMultiMeasure) {
      measures.forEach((measure) => {
        values.push(formatPivotNumber(row.measureTotals[measure.key] ?? 0));
      });
    } else {
      values.push(formatPivotNumber(row.total));
    }

    lines.push(values.map(escapeValue).join(separator));
  });

  return lines.join('\r\n');
}

const INDENT_SIZE = 16;

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
    color: 'var(--pivot-table-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--pivot-table-font-family, inherit)',
    fontSize: 'var(--pivot-table-font-size, 0.875rem)'
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end'
  },

  scroll: {
    width: '100%',
    overflow: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,

    '& th, & td': {
      padding: 'var(--pivot-table-cell-padding, 0.5rem 0.75rem)',
      borderBottom:
        '1px solid var(--pivot-table-border-color, var(--border-basic-color-3, #e4e9f2))',
      whiteSpace: 'nowrap'
    },

    '& thead th': {
      backgroundColor:
        'var(--pivot-table-header-background-color, var(--background-basic-color-2, #f7f9fc))',
      color: 'var(--pivot-table-header-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: 'var(--pivot-table-header-font-size, 0.75rem)',
      fontWeight: 'var(--pivot-table-header-font-weight, 600)' as unknown as Property.FontWeight,
      letterSpacing: '0.02em',
      textAlign: 'left'
    },

    '& thead th:first-child, & tbody th, & tfoot th': {
      position: 'sticky',
      left: 0,
      zIndex: 2,
      backgroundColor:
        'var(--pivot-table-sticky-background-color, var(--background-basic-color-1, #fff))',
      textAlign: 'left'
    },

    '& thead th:first-child': {
      zIndex: 3,
      backgroundColor:
        'var(--pivot-table-header-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '& tbody th, & tfoot th': {
      fontWeight: 'var(--pivot-table-row-header-font-weight, 500)' as unknown as Property.FontWeight
    },

    '& tbody tr:last-child th, & tbody tr:last-child td': {
      borderBottom:
        '1px solid var(--pivot-table-border-color, var(--border-basic-color-3, #e4e9f2))'
    }
  },

  measureHeader: {
    textAlign: 'center'
  },

  columnHeader: {
    textAlign: 'right'
  },

  rowLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  expander: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.5rem',
    height: '1.5rem',
    padding: 0,
    border: 0,
    borderRadius: '0.2rem',
    background: 'transparent',
    color: 'var(--pivot-table-expander-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--pivot-table-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  expanderPlaceholder: {
    flex: '0 0 auto',
    width: '1.5rem',
    height: '1.5rem'
  },

  rowText: {
    minWidth: 0
  },

  valueCell: {
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums'
  },

  cellButton: {
    display: 'block',
    width: '100%',
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: 'var(--pivot-table-cell-button-border-radius, 0.2rem)',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'right',
    cursor: 'pointer',

    '&:hover': {
      textDecoration: 'underline'
    },

    '&:focus-visible': {
      outline: '2px solid var(--pivot-table-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  rowButton: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: 'var(--pivot-table-row-button-border-radius, 0.2rem)',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',

    '&:hover': {
      textDecoration: 'underline'
    },

    '&:focus-visible': {
      outline: '2px solid var(--pivot-table-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },

  totalCell: {
    textAlign: 'right',
    fontWeight: 'var(--pivot-table-total-font-weight, 600)' as unknown as Property.FontWeight,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor:
      'var(--pivot-table-total-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  footerLabel: {
    fontWeight: 'var(--pivot-table-total-font-weight, 600)' as unknown as Property.FontWeight
  },

  footerCell: {
    textAlign: 'right',
    fontWeight: 'var(--pivot-table-total-font-weight, 600)' as unknown as Property.FontWeight,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor:
      'var(--pivot-table-total-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  grandTotalCell: {
    textAlign: 'right',
    fontWeight: 'var(--pivot-table-grand-total-font-weight, 700)' as unknown as Property.FontWeight,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor:
      'var(--pivot-table-grand-total-background-color, var(--background-basic-color-3, #edf1f7))'
  },

  empty: {
    padding: '1.5rem',
    textAlign: 'center'
  }
}));

export type PivotTableStylesNames = Selectors<typeof useStyles>;

export interface PivotTableProps<T extends Record<string, unknown>>
  extends
    DefaultProps<PivotTableStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  data: T[];
  rows: string[];
  column?: string;
  /**
   * Single measure kept for backwards compatibility. Ignored when `measures` is provided.
   */
  measure?: PivotMeasure<T>;
  /**
   * Measures rendered side by side. Takes precedence over `measure`; at least one measure is
   * required.
   */
  measures?: PivotMeasure<T>[];
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?(keys: string[]): void;
  showRowTotals?: boolean;
  showColumnTotals?: boolean;
  showGrandTotal?: boolean;
  emptyState?: React.ReactNode;
  ariaLabel?: string;
  exportable?: boolean;
  exportFileName?: string;
  onExport?(csv: string, fileName: string): void;
  maxHeight?: number;
  /** Turns value cells into drill-down buttons. */
  onCellClick?(context: PivotTableCellContext<T>): void;
  /** Turns the row header of every body row into a button. */
  onRowClick?(row: PivotTableRow<T>): void;
  /** Custom cell content, rendered instead of the measure formatter. */
  renderCell?(value: number, context: PivotTableCellContext<T>): React.ReactNode;
}

const defaultProps: Partial<PivotTableProps<Record<string, unknown>>> = {
  rows: [],
  defaultExpandedKeys: [],
  showRowTotals: true,
  showColumnTotals: true,
  showGrandTotal: true,
  ariaLabel: 'Pivot table',
  exportable: false,
  exportFileName: 'pivot.csv',
  emptyState: 'No data'
};

function PivotTable<T extends Record<string, unknown>>(props: PivotTableProps<T>) {
  const {
    data,
    rows,
    column,
    measure,
    measures: measuresProp,
    expandedKeys,
    defaultExpandedKeys,
    onExpandedChange,
    showRowTotals,
    showColumnTotals,
    showGrandTotal,
    emptyState,
    ariaLabel,
    exportable,
    exportFileName,
    onExport,
    maxHeight,
    onCellClick,
    onRowClick,
    renderCell,
    className,
    classNames,
    styles,
    unstyled,
    style,
    ...others
  } = useComponentDefaultProps(defaultProps as unknown as PivotTableProps<T>, props);
  const { classes, cx } = useStyles(null, { name: 'pivot-table', classNames, styles, unstyled });
  const [expanded, setExpanded] = useUncontrolled<string[]>({
    value: expandedKeys,
    defaultValue: defaultExpandedKeys,
    finalValue: [],
    onChange: onExpandedChange
  });

  const model = React.useMemo(() => {
    const normalized = normalizePivotMeasures(measure, measuresProp);

    if (normalized.length === 0) {
      return null;
    }

    return buildPivotTable(data, { rows, column, measures: normalized });
  }, [data, rows, column, measure, measuresProp]);

  const visibleRows = React.useMemo(() => {
    const result: PivotTableRow<T>[] = [];

    if (!model) {
      return result;
    }

    const visit = (nodes: PivotTableRow<T>[]) => {
      nodes.forEach((node) => {
        result.push(node);

        if (node.children.length > 0 && expanded.includes(node.key)) {
          visit(node.children);
        }
      });
    };

    visit(model.rows);

    return result;
  }, [model, expanded]);

  if (!model || model.rows.length === 0) {
    return (
      <div {...others} className={cx(classes.root, className)} style={style}>
        <div className={cx(classes.empty)}>
          {typeof emptyState === 'string' ? <EmptyState compact title={emptyState} /> : emptyState}
        </div>
      </div>
    );
  }

  const { measures } = model;
  const measureCount = measures.length;
  const isMultiMeasure = measureCount > 1;
  const measureLabels = measures.map((item) => item.label).join(', ');
  const hasColumns = model.columns.length > 0;
  const showsTotalsColumn = showRowTotals && hasColumns;
  const hasFooter = hasColumns ? showColumnTotals || showGrandTotal : showGrandTotal;
  const rowHeaderLabel = rows.length > 0 ? rows.join(DIMENSION_SEPARATOR) : measures[0].label;
  const grandTotalLabelSpan =
    model.columns.length * measureCount + (showsTotalsColumn ? measureCount : 0) - measureCount + 1;

  const toggleExpanded = (rowKey: string) => {
    setExpanded(
      expanded.includes(rowKey) ? expanded.filter((key) => key !== rowKey) : [...expanded, rowKey]
    );
  };

  const handleToggleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    rowKey: string,
    isExpanded: boolean
  ) => {
    if (event.key === 'ArrowRight' && !isExpanded) {
      event.preventDefault();
      toggleExpanded(rowKey);
    } else if (event.key === 'ArrowLeft' && isExpanded) {
      event.preventDefault();
      toggleExpanded(rowKey);
    }
  };

  const handleExport = () => {
    const csv = createPivotTableCsv(model, { rowLabel: rowHeaderLabel });

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

  const renderMeasureValue = (
    target: PivotMeasure<T>,
    value: number | undefined
  ): React.ReactNode => {
    if (value === undefined) {
      return null;
    }

    return target.formatter ? target.formatter(value) : formatPivotNumber(value);
  };

  const renderValueCell = (
    row: PivotTableRow<T>,
    pivotColumn: PivotTableColumn,
    item: PivotMeasure<T>
  ): React.ReactNode => {
    const value = row.measureCells[item.key]?.[pivotColumn.key];

    if (value === undefined) {
      return null;
    }

    const context: PivotTableCellContext<T> = { row, column: pivotColumn, measure: item, value };
    const content = renderCell ? renderCell(value, context) : renderMeasureValue(item, value);

    if (typeof onCellClick !== 'function') {
      return content;
    }

    return (
      <button
        type="button"
        className={cx(classes.cellButton)}
        aria-label={`${row.values.join(DIMENSION_SEPARATOR)}, ${pivotColumn.label}, ${item.label}: ${formatPivotNumber(value)}`}
        onClick={() => onCellClick(context)}
      >
        {content}
      </button>
    );
  };

  return (
    <div {...others} className={cx(classes.root, className)} style={style}>
      {exportable && (
        <div className={cx(classes.toolbar)}>
          <Button size="small" appearance="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      )}

      <div
        className={cx(classes.scroll)}
        style={maxHeight === undefined ? undefined : { maxHeight }}
      >
        <Table
          className={cx(classes.table)}
          style={{ borderCollapse: 'separate', borderSpacing: 0 }}
          aria-label={ariaLabel}
        >
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell scope="col" rowSpan={hasColumns ? 2 : undefined}>
                {rowHeaderLabel}
              </Table.HeaderCell>

              {hasColumns && isMultiMeasure && (
                <>
                  {model.columns.map((pivotColumn) => (
                    <Table.HeaderCell
                      key={pivotColumn.key}
                      scope="colgroup"
                      colSpan={measureCount}
                      className={cx(classes.measureHeader)}
                      aria-label={`${pivotColumn.label} (${measureLabels})`}
                    >
                      {pivotColumn.label}
                    </Table.HeaderCell>
                  ))}
                  {showsTotalsColumn && (
                    <Table.HeaderCell scope="col" rowSpan={2}>
                      Total
                    </Table.HeaderCell>
                  )}
                </>
              )}

              {hasColumns && !isMultiMeasure && (
                <>
                  <Table.HeaderCell
                    scope="colgroup"
                    colSpan={model.columns.length}
                    className={cx(classes.measureHeader)}
                  >
                    {measures[0].label}
                  </Table.HeaderCell>
                  {showsTotalsColumn && (
                    <Table.HeaderCell scope="col" rowSpan={2}>
                      Total
                    </Table.HeaderCell>
                  )}
                </>
              )}

              {!hasColumns &&
                (isMultiMeasure ? (
                  measures.map((item) => (
                    <Table.HeaderCell
                      key={item.key}
                      scope="col"
                      className={cx(classes.measureHeader)}
                    >
                      {item.label}
                    </Table.HeaderCell>
                  ))
                ) : (
                  <Table.HeaderCell scope="col">{measures[0].label}</Table.HeaderCell>
                ))}
            </Table.Row>

            {hasColumns && (
              <Table.Row>
                {isMultiMeasure
                  ? model.columns.flatMap((pivotColumn) =>
                      measures.map((item) => (
                        <Table.HeaderCell
                          key={`${pivotColumn.key}-${item.key}`}
                          scope="col"
                          className={cx(classes.columnHeader)}
                        >
                          {item.label}
                        </Table.HeaderCell>
                      ))
                    )
                  : model.columns.map((pivotColumn) => (
                      <Table.HeaderCell
                        key={pivotColumn.key}
                        scope="col"
                        className={cx(classes.columnHeader)}
                      >
                        {pivotColumn.label}
                      </Table.HeaderCell>
                    ))}
              </Table.Row>
            )}
          </Table.Head>

          <Table.Body>
            {visibleRows.map((row) => {
              const label = row.values[row.values.length - 1] ?? '';
              const hasChildren = row.children.length > 0;
              const isExpanded = expanded.includes(row.key);

              return (
                <Table.Row key={row.key}>
                  <Table.HeaderCell scope="row" title={row.values.join(DIMENSION_SEPARATOR)}>
                    <span
                      className={cx(classes.rowLabel)}
                      style={{ marginLeft: row.depth * INDENT_SIZE }}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          className={cx(classes.expander)}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} group ${label}`}
                          onClick={() => toggleExpanded(row.key)}
                          onKeyDown={(event) => handleToggleKeyDown(event, row.key, isExpanded)}
                        >
                          <Icon
                            icon={isExpanded ? 'chevron-down-outline' : 'chevron-right-outline'}
                            pack="nebular-essentials"
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        <span className={cx(classes.expanderPlaceholder)} aria-hidden="true" />
                      )}
                      {typeof onRowClick === 'function' ? (
                        <button
                          type="button"
                          className={cx(classes.rowButton)}
                          aria-label={row.values.join(DIMENSION_SEPARATOR)}
                          onClick={() => onRowClick(row)}
                        >
                          {label}
                        </button>
                      ) : (
                        <span className={cx(classes.rowText)}>{label}</span>
                      )}
                    </span>
                  </Table.HeaderCell>

                  {hasColumns
                    ? model.columns.flatMap((pivotColumn) =>
                        measures.map((item) => (
                          <Table.Cell
                            key={`${pivotColumn.key}-${item.key}`}
                            className={cx(classes.valueCell)}
                          >
                            {renderValueCell(row, pivotColumn, item)}
                          </Table.Cell>
                        ))
                      )
                    : measures.map((item) => (
                        <Table.Cell key={item.key} className={cx(classes.valueCell)}>
                          {renderMeasureValue(item, row.measureTotals[item.key])}
                        </Table.Cell>
                      ))}

                  {showsTotalsColumn &&
                    measures.map((item) => (
                      <Table.Cell key={item.key} className={cx(classes.totalCell)}>
                        {renderMeasureValue(item, row.measureTotals[item.key])}
                      </Table.Cell>
                    ))}
                </Table.Row>
              );
            })}
          </Table.Body>

          {hasFooter ? (
            <Table.Foot>
              {hasColumns && showColumnTotals && (
                <Table.Row>
                  <Table.HeaderCell scope="row" className={cx(classes.footerLabel)}>
                    Total
                  </Table.HeaderCell>
                  {model.columns.flatMap((pivotColumn) =>
                    measures.map((item) => (
                      <Table.Cell
                        key={`${pivotColumn.key}-${item.key}`}
                        className={cx(classes.footerCell)}
                      >
                        {renderMeasureValue(
                          item,
                          model.measureColumnTotals[item.key]?.[pivotColumn.key]
                        )}
                      </Table.Cell>
                    ))
                  )}
                  {showsTotalsColumn &&
                    measures.map((item) => (
                      <Table.Cell key={item.key} className={cx(classes.grandTotalCell)}>
                        {renderMeasureValue(
                          item,
                          showGrandTotal ? model.measureGrandTotals[item.key] : undefined
                        )}
                      </Table.Cell>
                    ))}
                </Table.Row>
              )}

              {!hasColumns && showGrandTotal && (
                <Table.Row>
                  <Table.HeaderCell scope="row" className={cx(classes.footerLabel)}>
                    Total
                  </Table.HeaderCell>
                  {measures.map((item) => (
                    <Table.Cell key={item.key} className={cx(classes.grandTotalCell)}>
                      {renderMeasureValue(item, model.measureGrandTotals[item.key])}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}

              {hasColumns && showGrandTotal && (!showColumnTotals || !showRowTotals) && (
                <Table.Row>
                  <Table.HeaderCell
                    scope="row"
                    colSpan={grandTotalLabelSpan}
                    className={cx(classes.footerLabel)}
                  >
                    Grand total
                  </Table.HeaderCell>
                  {measures.map((item) => (
                    <Table.Cell key={item.key} className={cx(classes.grandTotalCell)}>
                      {renderMeasureValue(item, model.measureGrandTotals[item.key])}
                    </Table.Cell>
                  ))}
                </Table.Row>
              )}
            </Table.Foot>
          ) : null}
        </Table>
      </div>
    </div>
  );
}

PivotTable.displayName = 'PivotTable';

export { PivotTable };
