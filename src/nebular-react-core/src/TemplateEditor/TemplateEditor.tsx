import React, { forwardRef, useId, useRef, useState } from 'react';
import { useIsomorphicEffect, useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { FormControl } from '../FormControl';
import { NativeSelect } from '../NativeSelect';
import { Textarea } from '../Textarea';

export interface TemplateVariable {
  path: string;
  label?: string;
  sample?: string | number | boolean | null;
}

export interface TemplateEditorLabels {
  editor: string;
  variable: string;
  chooseVariable: string;
  insert: string;
  preview: string;
  unknown(paths: readonly string[]): string;
}

const defaults: TemplateEditorLabels = {
  editor: 'Template',
  variable: 'Variable',
  chooseVariable: 'Choose a variable',
  insert: 'Insert variable',
  preview: 'Preview',
  unknown: (paths) => `Unknown variables: ${paths.join(', ')}`
};
const tokenPattern = /\{\{\s*([\p{L}\p{N}_-]+(?:\.[\p{L}\p{N}_-]+)*)\s*\}\}/gu;
const pathPattern = /^[\p{L}\p{N}_-]+(?:\.[\p{L}\p{N}_-]+)*$/u;

export function previewTemplate(source: string, variables: readonly TemplateVariable[]) {
  const known = new Map(variables.map(({ path, sample }) => [path, sample]));
  const unknown = new Set<string>();
  const text = source.replace(tokenPattern, (token: string, path: string) => {
    if (!known.has(path)) {
      unknown.add(path);
      return token;
    }
    const sample = known.get(path);
    return sample == null ? token : String(sample);
  });
  return { text, unknown: [...unknown] };
}

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  controls: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.5rem' },
  select: { flex: '1 1 12rem', minWidth: 0 },
  preview: {
    margin: 0,
    padding: '0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    background: 'var(--background-basic-color-2, #f7f9fc)',
    color: 'var(--text-basic-color, #222b45)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere'
  },
  status: { margin: 0, color: 'var(--text-basic-color, #222b45)' }
}));

export type TemplateEditorStylesNames = Selectors<typeof useStyles>;

export interface TemplateEditorProps extends DefaultProps<TemplateEditorStylesNames> {
  variables: readonly TemplateVariable[];
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  labels?: Partial<TemplateEditorLabels>;
  disabled?: boolean;
  readOnly?: boolean;
}

export const TemplateEditor = forwardRef<HTMLDivElement, TemplateEditorProps>((props, ref) => {
  const {
    variables,
    value,
    defaultValue,
    onChange,
    disabled,
    readOnly,
    labels,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = props;
  const text = { ...defaults, ...labels };
  const { classes, cx } = useStyles(null, {
    name: 'template-editor',
    classNames,
    styles,
    unstyled
  });
  const [source, setSource] = useUncontrolled({ value, defaultValue, finalValue: '', onChange });
  const [path, setPath] = useState('');
  const input = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ next: string; end: number } | null>(null);
  const id = useId();
  const options = variables.filter((variable) => pathPattern.test(variable.path));
  const selected = options.some((variable) => variable.path === path) ? path : '';
  const preview = previewTemplate(source, options);

  useIsomorphicEffect(() => {
    const pending = pendingSelection.current;
    if (pending?.next === source) {
      input.current?.setSelectionRange(pending.end, pending.end);
      pendingSelection.current = null;
    }
  }, [source]);

  const insert = () => {
    const textarea = input.current;
    if (!textarea || !selected || disabled || readOnly) return;
    const { selectionStart, selectionEnd } = textarea;
    const token = `{{${selected}}}`;
    const next = `${source.slice(0, selectionStart)}${token}${source.slice(selectionEnd)}`;
    const end = selectionStart + token.length;
    textarea.focus();
    if (next === source) {
      textarea.setSelectionRange(end, end);
    } else {
      pendingSelection.current = { next, end };
      setSource(next);
    }
  };

  return (
    <div ref={ref} style={style} className={cx(classes.root, className)}>
      <FormControl label={text.editor} htmlFor={id}>
        <Textarea
          id={id}
          ref={input}
          value={source}
          fullWidth
          rows={5}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(event) => {
            pendingSelection.current = null;
            setSource(event.target.value);
          }}
        />
      </FormControl>
      {options.length > 0 && (
        <div className={classes.controls}>
          <NativeSelect
            className={classes.select}
            label={text.variable}
            value={selected}
            placeholder={text.chooseVariable}
            disabled={disabled || readOnly}
            onChange={setPath}
            data={options.map((variable) => ({
              value: variable.path,
              label: variable.label ?? variable.path
            }))}
          />
          <Button type="button" onClick={insert} disabled={!selected || disabled || readOnly}>
            {text.insert}
          </Button>
        </div>
      )}
      {preview.unknown.length > 0 && (
        <p role="status" className={classes.status}>
          {text.unknown(preview.unknown)}
        </p>
      )}
      <pre aria-label={text.preview} className={classes.preview}>
        {preview.text}
      </pre>
    </div>
  );
});

TemplateEditor.displayName = 'TemplateEditor';
