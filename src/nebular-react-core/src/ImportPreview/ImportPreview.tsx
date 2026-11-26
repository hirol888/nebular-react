import React, { forwardRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../Button';
import { Fieldset } from '../Fieldset';
import { NativeSelect } from '../NativeSelect';
import { Pagination } from '../Pagination';
import { Table } from '../Table';

export interface ImportPreviewColumn {
  /** Nonempty identifier unique among the source columns. */
  id: string;
  label: string;
}

export interface ImportPreviewField {
  /** Nonempty identifier unique among the destination fields. */
  id: string;
  label: string;
  required?: boolean;
}

export type ImportPreviewCell = string | number | boolean | null | undefined;

export interface ImportPreviewRow {
  /** Identifier unique among the source rows. */
  id: string | number;
  cells: Readonly<Record<string, ImportPreviewCell>>;
  errors?: readonly string[];
}

/** Maps destination field IDs to source column IDs. Empty entries are unmapped. */
export type ImportPreviewMapping = Readonly<Partial<Record<string, string>>>;

export interface ImportPreviewConfirmation {
  mapping: ImportPreviewMapping;
  rows: readonly ImportPreviewRow[];
}

export interface ImportPreviewLabels {
  region: string;
  mapping: string;
  unmapped: string;
  mappingRequired: string;
  unknownColumn: string;
  duplicateColumn: string;
  preview: string;
  emptyCell: string;
  rowErrors: string;
  rowErrorCount(count: number): string;
  noRows: string;
  pagination: string;
  page(page: number): string;
  confirm: string;
  confirming: string;
}

const defaultLabels: ImportPreviewLabels = {
  region: 'Import preview',
  mapping: 'Column mapping',
  unmapped: 'Choose a source column',
  mappingRequired: 'Map a source column for this required field.',
  unknownColumn: 'The mapped source column is unavailable.',
  duplicateColumn: 'This source column is mapped more than once.',
  preview: 'Source data',
  emptyCell: '—',
  rowErrors: 'Validation errors',
  rowErrorCount: (count) =>
    count === 1 ? '1 row has validation errors.' : `${count} rows have validation errors.`,
  noRows: 'There are no records to import.',
  pagination: 'Import preview pages',
  page: (page) => `Page ${page}`,
  confirm: 'Confirm import',
  confirming: 'Confirming…'
};

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gap: 'var(--import-preview-gap, 1rem)',
    minWidth: 0,
    color: 'var(--text-basic-color, #222b45)'
  },
  mapping: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
    gap: '0.75rem'
  },
  table: {
    maxWidth: '100%',
    overflowX: 'auto',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--import-preview-table-border-radius, 0.375rem)',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    }
  },
  cell: { overflowWrap: 'anywhere' },
  error: {
    color: 'var(--import-preview-error-color, var(--text-danger-color, #b81d51))',
    fontWeight: 600,
    margin: 0,
    overflowWrap: 'anywhere'
  },
  footer: { display: 'flex', justifyContent: 'flex-end' }
}));

export type ImportPreviewStylesNames = Selectors<typeof useStyles>;

export interface ImportPreviewProps
  extends
    DefaultProps<ImportPreviewStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  columns: readonly ImportPreviewColumn[];
  fields: readonly ImportPreviewField[];
  /** Already parsed input. Validation errors supplied here affect all preview pages. */
  rows: readonly ImportPreviewRow[];
  mapping: ImportPreviewMapping;
  onMappingChange(mapping: ImportPreviewMapping): void;
  onConfirm?(input: ImportPreviewConfirmation): void;
  pageSize?: number;
  labels?: Partial<ImportPreviewLabels>;
  disabled?: boolean;
  confirming?: boolean;
  renderCell?(
    value: ImportPreviewCell,
    row: ImportPreviewRow,
    column: ImportPreviewColumn
  ): React.ReactNode;
}

const defaultProps: Partial<ImportPreviewProps> = { pageSize: 10 };

const ImportPreview = forwardRef<HTMLDivElement, ImportPreviewProps>((props, ref) => {
  const {
    columns,
    fields,
    rows,
    mapping,
    onMappingChange,
    onConfirm,
    pageSize,
    labels,
    disabled,
    confirming,
    renderCell,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': ariaLabel,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'import-preview',
    classNames,
    styles,
    unstyled
  });
  const text = { ...defaultLabels, ...labels };
  const [page, setPage] = useState(1);
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 10;
  const lastPage = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(page, lastPage);
  const visibleRows = rows.slice((currentPage - 1) * size, currentPage * size);
  const errorCount = rows.reduce((count, row) => count + Number(!!row.errors?.length), 0);
  const fieldIds = new Set(fields.map(({ id }) => id));
  const activeMapping = Object.keys(mapping).every((id) => fieldIds.has(id))
    ? mapping
    : Object.fromEntries(Object.entries(mapping).filter(([id]) => fieldIds.has(id)));
  const columnIds = new Set(columns.map(({ id }) => id));
  const columnUsage = new Map<string, number>();
  Object.values(activeMapping).forEach((id) => {
    if (id && columnIds.has(id)) columnUsage.set(id, (columnUsage.get(id) ?? 0) + 1);
  });
  const mappingFields = fields.map((field) => {
    const value = Object.hasOwn(activeMapping, field.id) ? (activeMapping[field.id] ?? '') : '';
    const missing = Boolean(value) && !columnIds.has(value);
    let error: 'unknownColumn' | 'mappingRequired' | 'duplicateColumn' | undefined;
    if (missing) error = 'unknownColumn';
    else if (field.required && !value) error = 'mappingRequired';
    else if ((columnUsage.get(value) ?? 0) > 1) error = 'duplicateColumn';
    return { field, value: missing ? '' : value, error };
  });
  const options = [
    { value: '', label: text.unmapped },
    ...columns.map(({ id, label }) => ({ value: id, label }))
  ];
  const inactive = Boolean(disabled || confirming);
  const canConfirm =
    !inactive && rows.length > 0 && errorCount === 0 && !mappingFields.some(({ error }) => error);

  const changeMapping = (fieldId: string, columnId: string) => {
    if (inactive) return;
    const next = { ...activeMapping, [fieldId]: columnId };
    if (!columnId) delete next[fieldId];
    onMappingChange(next);
  };

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      role="region"
      aria-label={ariaLabel ?? text.region}
      aria-busy={confirming || undefined}
    >
      {mappingFields.length > 0 && (
        <Fieldset legend={text.mapping}>
          <div className={classes.mapping}>
            {mappingFields.map(({ field, value, error }) => (
              <NativeSelect
                key={field.id}
                label={field.label}
                data={options}
                value={value}
                required={field.required}
                disabled={inactive}
                error={error && (text[error] || defaultLabels[error])}
                onChange={(next) => changeMapping(field.id, next)}
              />
            ))}
          </div>
        </Fieldset>
      )}
      {errorCount > 0 && (
        <p role="status" className={classes.error}>
          {text.rowErrorCount(errorCount)}
        </p>
      )}
      {visibleRows.length > 0 ? (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Enable horizontal keyboard scrolling.
        <div className={classes.table} tabIndex={0} role="group" aria-label={text.preview}>
          <Table aria-label={text.preview}>
            <Table.Head>
              <Table.Row>
                {columns.map(({ id, label }) => (
                  <Table.HeaderCell key={id}>{label}</Table.HeaderCell>
                ))}
                {errorCount > 0 && <Table.HeaderCell>{text.rowErrors}</Table.HeaderCell>}
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {visibleRows.map((row) => (
                <Table.Row key={`${typeof row.id}:${row.id}`}>
                  {columns.map((column) => {
                    const value = Object.hasOwn(row.cells, column.id) ? row.cells[column.id] : null;
                    return (
                      <Table.Cell key={column.id} className={classes.cell}>
                        {renderCell
                          ? renderCell(value, row, column)
                          : String(value ?? text.emptyCell)}
                      </Table.Cell>
                    );
                  })}
                  {errorCount > 0 && (
                    <Table.Cell className={classes.cell}>
                      {row.errors?.length ? (
                        <ul className={classes.error}>
                          {row.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      ) : (
                        text.emptyCell
                      )}
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <p role="status">{text.noRows}</p>
      )}
      {lastPage > 1 && (
        <Pagination
          page={currentPage}
          total={lastPage}
          onChange={setPage}
          withControls={false}
          disabled={inactive}
          ariaLabel={text.pagination}
          getItemA11yLabel={text.page}
        />
      )}
      {onConfirm && (
        <div className={classes.footer}>
          <Button
            type="button"
            status="primary"
            styles={{ disabled: { pointerEvents: 'auto' } }}
            disabled={!canConfirm}
            onClick={() => onConfirm({ mapping: activeMapping, rows })}
          >
            {confirming ? text.confirming : text.confirm}
          </Button>
        </div>
      )}
    </div>
  );
});

ImportPreview.displayName = 'ImportPreview';

export { ImportPreview };
