import React, { forwardRef, useId, useRef } from 'react';
import { useIsomorphicEffect } from '@nebular-react/hooks';
import { DefaultProps, Selectors, createStyles } from '@nebular-react/styles';
import { Button } from '../Button';

export type MatrixFieldValue = string | number | boolean | null;

interface MatrixFieldColumnBase {
  /** Unique column identifier, used as a key in each row's values. */
  id: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

export interface MatrixFieldOption {
  /** Nonempty value. The empty string represents no selection. */
  value: string;
  label: string;
  disabled?: boolean;
}

export type MatrixFieldColumn = MatrixFieldColumnBase &
  (
    | { type: 'text'; placeholder?: string; maxLength?: number }
    | { type: 'number'; min?: number; max?: number; step?: number | 'any' }
    | { type: 'select'; options: readonly MatrixFieldOption[]; placeholder?: string }
    | { type: 'checkbox' }
  );

export interface MatrixFieldRow {
  /** Unique and stable across edits and reordering. */
  id: string;
  label?: string;
  /** Numbers emit null when cleared. Text and select emit an empty string. */
  values: Readonly<Partial<Record<string, MatrixFieldValue>>>;
}

export interface MatrixFieldLabels {
  rowHeader: string;
  row(position: number): string;
  cell(column: string, row: string): string;
  actions: string;
  add: string;
  remove: string;
  removeRow(row: string): string;
  empty: string;
  selectPlaceholder: string;
}

const defaultLabels: MatrixFieldLabels = {
  rowHeader: 'Row',
  row: (position) => `Row ${position}`,
  cell: (column, row) => `${column}, ${row}`,
  actions: 'Actions',
  add: 'Add row',
  remove: 'Remove',
  removeRow: (row) => `Remove ${row}`,
  empty: 'No rows',
  selectPlaceholder: 'Select an option'
};

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0,
    maxWidth: '100%',
    color: 'var(--matrix-field-color, var(--text-basic-color, #222b45))'
  },
  viewport: {
    minWidth: 0,
    maxWidth: '100%',
    overflowX: 'auto',
    border: '1px solid var(--matrix-field-border, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: '0.375rem',
    '&:focus-visible': {
      outline: '2px solid var(--matrix-field-focus, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'start',
    fontSize: '0.875rem',
    backgroundColor: 'var(--matrix-field-surface, var(--background-basic-color-1, #fff))'
  },
  caption: {
    padding: '0.75rem',
    textAlign: 'start',
    fontWeight: 600,
    overflowWrap: 'anywhere'
  },
  header: {
    backgroundColor: 'var(--matrix-field-header, var(--background-basic-color-2, #f7f9fc))'
  },
  cell: {
    borderTop: '1px solid var(--matrix-field-border, var(--border-basic-color-3, #e4e9f2))',
    padding: '0.5rem',
    verticalAlign: 'top',
    overflowWrap: 'anywhere'
  },
  control: {
    boxSizing: 'border-box',
    width: '100%',
    minWidth: '6rem',
    minHeight: '2.25rem',
    padding: '0.375rem 0.5rem',
    border: '1px solid var(--matrix-field-input-border, var(--border-basic-color-4, #c5cee0))',
    borderRadius: '0.25rem',
    backgroundColor: 'var(--matrix-field-input-background, var(--background-basic-color-1, #fff))',
    color: 'inherit',
    font: 'inherit',
    '&:focus-visible': {
      outline: '2px solid var(--matrix-field-focus, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    },
    '&[aria-invalid="true"]': {
      borderColor: 'var(--matrix-field-invalid-border, var(--color-danger-500, #ff3d71))'
    },
    '&:disabled': { opacity: 0.6 }
  },
  checkbox: {
    inlineSize: '1.25rem',
    blockSize: '1.25rem',
    margin: '0.5rem 0',
    accentColor: 'var(--matrix-field-accent, var(--color-primary-500, #3366ff))',
    '&:focus-visible': {
      outline: '2px solid var(--matrix-field-focus, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    }
  },
  error: {
    marginBlockStart: '0.25rem',
    minWidth: '6rem',
    maxWidth: '15rem',
    fontSize: '0.8125rem',
    fontWeight: 600
  },
  actions: {
    whiteSpace: 'nowrap',
    '--button-outline-basic-text-color':
      'var(--matrix-field-color, var(--text-basic-color, #222b45))',
    '--button-outline-basic-focus-text-color':
      'var(--matrix-field-color, var(--text-basic-color, #222b45))',
    '--button-outline-basic-hover-text-color':
      'var(--matrix-field-color, var(--text-basic-color, #222b45))',
    '--button-outline-basic-active-text-color':
      'var(--matrix-field-color, var(--text-basic-color, #222b45))'
  },
  empty: { padding: '0.75rem', margin: 0 }
}));

export type MatrixFieldStylesNames = Selectors<typeof useStyles>;

export interface MatrixFieldProps
  extends
    DefaultProps<MatrixFieldStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** Accessible name of the table and its scrollable region. */
  label?: string;
  columns: readonly MatrixFieldColumn[];
  /** Controlled row list maintained by the application. */
  value: readonly MatrixFieldRow[];
  /** Receives the entire proposed row list after any edit, addition or removal. */
  onChange(rows: MatrixFieldRow[]): void;
  /** Provides an initial row with an ID that does not exist in value. */
  createRow?(): MatrixFieldRow;
  /** Returns the current error for a cell or undefined when it is valid. */
  getCellError?(row: MatrixFieldRow, column: MatrixFieldColumn): string | undefined;
  /** Prevents removal at or below this row count. */
  minRows?: number;
  /** Prevents adding at or above this row count. */
  maxRows?: number;
  removable?: boolean;
  disabled?: boolean;
  labels?: Partial<MatrixFieldLabels>;
}

interface CellEditorProps {
  column: MatrixFieldColumn;
  value: MatrixFieldValue | undefined;
  label: string;
  error: string | undefined;
  disabled: boolean;
  labels: MatrixFieldLabels;
  classes: Record<MatrixFieldStylesNames, string>;
  onChange(value: MatrixFieldValue): void;
}

function CellEditor({
  column,
  value,
  label,
  error,
  disabled,
  labels,
  classes,
  onChange
}: CellEditorProps) {
  const errorId = useId();
  const attributes = {
    'aria-label': label,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    disabled: disabled || column.disabled,
    required: column.required,
    'data-matrix-field-editor': ''
  };
  let editor: React.ReactNode;

  switch (column.type) {
    case 'checkbox':
      editor = (
        <input
          {...attributes}
          type="checkbox"
          className={classes.checkbox}
          checked={value === true}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
      );
      break;
    case 'select':
      editor = (
        <select
          {...attributes}
          className={classes.control}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          <option value="">{column.placeholder ?? labels.selectPlaceholder}</option>
          {column.options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'number':
      editor = (
        <input
          {...attributes}
          type="number"
          className={classes.control}
          min={column.min}
          max={column.max}
          step={column.step ?? 'any'}
          value={typeof value === 'number' && Number.isFinite(value) ? value : ''}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber;
            onChange(Number.isNaN(next) ? null : next);
          }}
        />
      );
      break;
    default:
      editor = (
        <input
          {...attributes}
          type="text"
          className={classes.control}
          placeholder={column.placeholder}
          maxLength={column.maxLength}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      );
  }

  return (
    <>
      {editor}
      {error && (
        <div id={errorId} className={classes.error}>
          {error}
        </div>
      )}
    </>
  );
}

type PendingFocus = {
  id: string;
  expectPresent: boolean;
  destinationId?: string;
  trigger: HTMLButtonElement;
};

const MatrixField = forwardRef<HTMLDivElement, MatrixFieldProps>((props, ref) => {
  const {
    label = 'Editable rows',
    columns,
    value,
    onChange,
    createRow,
    getCellError,
    minRows = 0,
    maxRows = Infinity,
    removable = true,
    disabled = false,
    labels,
    className,
    classNames,
    styles,
    unstyled,
    ...otherProps
  } = props;
  const { classes, cx } = useStyles(null, { name: 'matrix-field', classNames, styles, unstyled });
  const text = { ...defaultLabels, ...labels };
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const viewportRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<PendingFocus | null>(null);
  const captionId = useId();

  useIsomorphicEffect(() => {
    const pending = pendingFocus.current;
    if (!pending || value.some((row) => row.id === pending.id) !== pending.expectPresent) return;
    pendingFocus.current = null;
    const document = pending.trigger.ownerDocument;
    if (document.activeElement !== pending.trigger && document.activeElement !== document.body) {
      return;
    }

    const destination =
      pending.destinationId !== undefined ? rowRefs.current.get(pending.destinationId) : undefined;
    const field = destination?.querySelector<HTMLElement>(
      '[data-matrix-field-editor]:not(:disabled), button:not(:disabled)'
    );
    const add = addRef.current && !addRef.current.disabled ? addRef.current : undefined;
    (field ?? add ?? viewportRef.current)?.focus();
  }, [value]);

  function addRow(trigger: HTMLButtonElement) {
    if (!createRow || disabled || value.length >= maxRows) return;
    const newRow = createRow();
    if (value.some((row) => row.id === newRow.id)) return;
    pendingFocus.current = {
      id: newRow.id,
      expectPresent: true,
      destinationId: newRow.id,
      trigger
    };
    onChange([...value, newRow]);
  }

  function removeRow(index: number, trigger: HTMLButtonElement) {
    if (disabled || value.length <= minRows) return;
    pendingFocus.current = {
      id: value[index].id,
      expectPresent: false,
      destinationId: (value[index + 1] ?? value[index - 1])?.id,
      trigger
    };
    onChange(value.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div {...otherProps} ref={ref} className={cx(classes.root, className)}>
      <div
        ref={viewportRef}
        className={classes.viewport}
        role="region"
        aria-labelledby={captionId}
        // Keyboard users can scroll when the table has no enabled editors.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <table className={classes.table}>
          <caption id={captionId} className={classes.caption}>
            {label}
          </caption>
          <thead className={classes.header}>
            <tr>
              <th scope="col" className={classes.cell}>
                {text.rowHeader}
              </th>
              {columns.map((column) => (
                <th key={column.id} scope="col" className={classes.cell}>
                  {column.label}
                </th>
              ))}
              {removable && (
                <th scope="col" className={classes.cell}>
                  {text.actions}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {value.length === 0 && (
              <tr>
                <td colSpan={columns.length + (removable ? 2 : 1)} className={classes.empty}>
                  {text.empty}
                </td>
              </tr>
            )}
            {value.map((row, index) => {
              const rowLabel = row.label ?? text.row(index + 1);
              return (
                <tr
                  key={row.id}
                  ref={(element) => {
                    if (element) rowRefs.current.set(row.id, element);
                    else rowRefs.current.delete(row.id);
                  }}
                >
                  <th scope="row" className={classes.cell}>
                    {rowLabel}
                  </th>
                  {columns.map((column) => (
                    <td key={column.id} className={classes.cell}>
                      <CellEditor
                        column={column}
                        value={
                          Object.hasOwn(row.values, column.id) ? row.values[column.id] : undefined
                        }
                        label={text.cell(column.label, rowLabel)}
                        error={getCellError?.(row, column)}
                        disabled={disabled}
                        labels={text}
                        classes={classes}
                        onChange={(cellValue) => {
                          onChange(
                            value.map((entry) =>
                              entry.id === row.id
                                ? { ...entry, values: { ...entry.values, [column.id]: cellValue } }
                                : entry
                            )
                          );
                        }}
                      />
                    </td>
                  ))}
                  {removable && (
                    <td className={cx(classes.cell, classes.actions)}>
                      <Button
                        type="button"
                        size="small"
                        appearance="outline"
                        aria-label={text.removeRow(rowLabel)}
                        disabled={disabled || value.length <= minRows}
                        onClick={(event) => removeRow(index, event.currentTarget)}
                      >
                        {text.remove}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {createRow && (
        <div>
          <Button
            ref={addRef}
            type="button"
            size="small"
            disabled={disabled || value.length >= maxRows}
            onClick={(event) => addRow(event.currentTarget)}
          >
            {text.add}
          </Button>
        </div>
      )}
    </div>
  );
});

MatrixField.displayName = 'MatrixField';
export { MatrixField };
