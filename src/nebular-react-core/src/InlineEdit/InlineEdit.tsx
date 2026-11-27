import React, { forwardRef, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useIsomorphicEffect, useUncontrolled } from '@nebular-react/hooks';
import { createStyles, useComponentDefaultProps } from '@nebular-react/styles';
import type { ComponentSize, DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Input } from '../Input';
import { Textarea } from '../Textarea';

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.5rem', minWidth: 0 },
  preview: {
    justifySelf: 'start',
    textAlign: 'start',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    maxWidth: '100%'
  },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  error: { color: 'var(--text-danger-color, #b41939)', margin: 0 }
}));

export type InlineEditStylesNames = Selectors<typeof useStyles>;

export interface InlineEditLabels {
  edit: (label: string) => string;
  save: string;
  cancel: string;
  saving: string;
  empty: string;
  saveError: string;
}

export interface InlineEditProps extends DefaultProps<InlineEditStylesNames> {
  label: string;
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  /** Called before committing. Reject to preserve the draft for another attempt. */
  onCommit?(value: string): void | Promise<void>;
  validate?(value: string): ReactNode;
  multiline?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoSelect?: boolean;
  size?: ComponentSize;
  labels?: Partial<InlineEditLabels>;
}

const defaultLabels: InlineEditLabels = {
  edit: (label) => `Edit ${label}`,
  save: 'Save',
  cancel: 'Cancel',
  saving: 'Saving…',
  empty: 'Empty',
  saveError: 'Could not save. Try again.'
};

const defaultProps: Partial<InlineEditProps> = { size: 'medium' };

const InlineEdit = forwardRef<HTMLDivElement, InlineEditProps>((props, ref) => {
  const {
    label,
    value,
    defaultValue,
    onChange,
    onCommit,
    validate,
    multiline,
    disabled,
    readOnly,
    autoSelect,
    size,
    labels,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, { name: 'inline-edit', classNames, styles, unstyled });
  const [committed, setCommitted] = useUncontrolled({
    value,
    defaultValue,
    finalValue: '',
    onChange
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const pending = useRef(false);
  const moveFocus = useRef(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const errorId = `${id}-error`;
  const previewId = `${id}-preview`;

  useIsomorphicEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    if (editing) {
      inputRef.current?.focus();
      if (autoSelect) inputRef.current?.select();
    } else {
      previewRef.current?.focus();
    }
  }, [editing, autoSelect]);

  const startEdit = () => {
    setDraft(committed);
    setError(null);
    moveFocus.current = true;
    setEditing(true);
  };

  const closeEditor = () => {
    setError(null);
    moveFocus.current = true;
    setEditing(false);
  };

  const commit = async () => {
    if (pending.current || disabled || readOnly) return;
    const validationError = validate?.(draft);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }
    if (draft === committed) {
      closeEditor();
      return;
    }

    pending.current = true;
    setSaving(true);
    setError(null);
    try {
      await onCommit?.(draft);
      setCommitted(draft);
      closeEditor();
    } catch {
      setError(text.saveError);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || pending.current) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeEditor();
    }
    if (event.key === 'Enter' && (!multiline || event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      commit();
    }
  };

  const fieldProps = {
    'aria-label': label,
    'aria-invalid': !!error || undefined,
    'aria-describedby': error ? errorId : undefined,
    value: draft,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDraft(event.target.value);
      setError(null);
    },
    onKeyDown,
    disabled: disabled || readOnly || saving,
    status: error ? ('danger' as const) : ('basic' as const),
    size,
    fullWidth: true
  };

  return (
    <div ref={ref} className={cx(classes.root, className)} aria-busy={saving || undefined}>
      {editing ? (
        <>
          {multiline ? (
            <Textarea
              {...fieldProps}
              ref={(node) => {
                inputRef.current = node;
              }}
            />
          ) : (
            <Input
              {...fieldProps}
              ref={(node) => {
                inputRef.current = node;
              }}
            />
          )}
          {error && (
            <p id={errorId} className={classes.error} role="alert">
              {error}
            </p>
          )}
          <div className={classes.actions}>
            <Button
              type="button"
              size={size}
              onClick={() => {
                commit();
              }}
              disabled={fieldProps.disabled}
            >
              {saving ? text.saving : text.save}
            </Button>
            <Button
              type="button"
              size={size}
              appearance="ghost"
              onClick={closeEditor}
              disabled={saving}
            >
              {text.cancel}
            </Button>
          </div>
        </>
      ) : readOnly ? (
        <span className={classes.preview}>{committed || text.empty}</span>
      ) : (
        <Button
          ref={previewRef}
          type="button"
          appearance="ghost"
          status="basic"
          size={size}
          className={classes.preview}
          aria-label={text.edit(label)}
          aria-describedby={previewId}
          onClick={startEdit}
          disabled={disabled}
        >
          <span id={previewId}>{committed || text.empty}</span>
        </Button>
      )}
    </div>
  );
});

InlineEdit.displayName = 'InlineEdit';

export { InlineEdit };
