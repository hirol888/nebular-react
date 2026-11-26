import React, { forwardRef, useId } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { CodeBlock } from '../CodeBlock';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { NativeSelect } from '../NativeSelect';

export interface DataMappingField {
  /** Dot-delimited path in the source or destination object. */
  path: string;
  label?: string;
  required?: boolean;
}

export type DataMappingBinding =
  { kind: 'field'; path: string } | { kind: 'constant'; value: string };
export type DataMapping = Readonly<Partial<Record<string, DataMappingBinding>>>;

export interface DataMappingEditorLabels {
  title: string;
  source(target: string): string;
  constant(target: string): string;
  useConstant: string;
  unmapped: string;
  required: string;
  invalidPath: string;
  missingSource: string;
  preview: string;
  previewUnavailable: string;
  empty: string;
}

const defaults: DataMappingEditorLabels = {
  title: 'Field mapping',
  source: (target) => `Source for ${target}`,
  constant: (target) => `Constant for ${target}`,
  useConstant: 'Use a constant',
  unmapped: 'Choose a source',
  required: 'Map a source or constant to this field.',
  invalidPath: 'This destination path is invalid or overlaps another destination.',
  missingSource: 'The mapped source field is unavailable.',
  preview: 'Mapped sample',
  previewUnavailable: 'This sample cannot be displayed as JSON.',
  empty: 'No destination fields.'
};

const reservedSegments = new Set(['__proto__', 'constructor', 'prototype']);
function pathSegments(path: string): string[] | null {
  const parts = path.split('.');
  return parts.every((part) => part.trim().length > 0 && !reservedSegments.has(part))
    ? parts
    : null;
}

function readPath(data: unknown, path: string): unknown {
  const parts = pathSegments(path);
  if (!parts) return undefined;
  return parts.reduce<unknown>((parent, part) => {
    if (parent !== null && typeof parent === 'object' && Object.hasOwn(parent, part)) {
      return (parent as Record<string, unknown>)[part];
    }
    return undefined;
  }, data);
}

/** Map JSON-like data into nested destination objects. Missing source values are omitted. */
export function applyDataMapping(data: unknown, mapping: DataMapping): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const containers = new WeakSet<object>();
  Object.entries(mapping).forEach(([target, binding]) => {
    const parts = pathSegments(target);
    if (!parts || !binding) return;
    const value = binding.kind === 'field' ? readPath(data, binding.path) : binding.value;
    if (value === undefined) return;
    let parent: Record<string, unknown> | null = result;
    for (const part of parts.slice(0, -1)) {
      if (!Object.hasOwn(parent, part)) {
        const child = {};
        parent[part] = child;
        containers.add(child);
      }
      const next: unknown = parent[part];
      if (!next || typeof next !== 'object' || !containers.has(next)) {
        parent = null;
        break;
      }
      parent = next as Record<string, unknown>;
    }
    const leaf = parts[parts.length - 1];
    if (parent && !Object.hasOwn(parent, leaf)) parent[leaf] = value;
  });
  return result;
}

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.75rem', minWidth: 0, color: 'var(--text-basic-color, #222b45)' },
  fields: { display: 'grid', gap: '0.5rem' },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%, 11rem),1fr))',
    alignItems: 'start',
    padding: '0.75rem',
    gap: '0.5rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)'
  },
  destination: { fontWeight: 600, overflowWrap: 'anywhere' }
}));

export type DataMappingEditorStylesNames = Selectors<typeof useStyles>;

export interface DataMappingEditorProps extends DefaultProps<DataMappingEditorStylesNames> {
  sources: readonly DataMappingField[];
  destinations: readonly DataMappingField[];
  value?: DataMapping;
  defaultValue?: DataMapping;
  onChange?(value: DataMapping): void;
  sample?: unknown;
  labels?: Partial<DataMappingEditorLabels>;
  disabled?: boolean;
}

const emptyMapping: DataMapping = {};
const constantOption = 'constant';
const fieldOptionPrefix = 'field:';

function serializePreview(sample: unknown, mapping: DataMapping): string | null {
  try {
    return JSON.stringify(applyDataMapping(sample, mapping), null, 2);
  } catch {
    return null;
  }
}

export const DataMappingEditor = forwardRef<HTMLDivElement, DataMappingEditorProps>(
  (props, ref) => {
    const {
      sources,
      destinations,
      value,
      defaultValue,
      onChange,
      sample,
      labels,
      disabled,
      className,
      style,
      classNames,
      styles,
      unstyled
    } = props;
    const text = { ...defaults, ...labels };
    const { classes, cx } = useStyles(null, {
      name: 'data-mapping-editor',
      classNames,
      styles,
      unstyled
    });
    const [mapping, setMapping] = useUncontrolled({
      value,
      defaultValue,
      finalValue: emptyMapping,
      onChange
    });
    const id = useId();
    const available = sources.filter(({ path }) => pathSegments(path));
    const options = [
      ...available.map(({ path, label }) => ({
        value: `${fieldOptionPrefix}${path}`,
        label: label ?? path
      })),
      { value: constantOption, label: text.useConstant }
    ];
    const invalidTargets = new Set(
      destinations
        .filter(
          ({ path }, index) =>
            !pathSegments(path) ||
            destinations.some(
              (other, otherIndex) =>
                otherIndex !== index &&
                (other.path === path ||
                  other.path.startsWith(`${path}.`) ||
                  path.startsWith(`${other.path}.`))
            )
        )
        .map(({ path }) => path)
    );
    const previewMapping = Object.fromEntries(
      destinations.flatMap(({ path }) => {
        const binding = Object.hasOwn(mapping, path) ? mapping[path] : undefined;
        const valid =
          binding &&
          !invalidTargets.has(path) &&
          (binding.kind === 'constant' || available.some((field) => field.path === binding.path));
        return valid ? [[path, binding]] : [];
      })
    );
    const result = sample === undefined ? undefined : serializePreview(sample, previewMapping);

    const update = (path: string, binding?: DataMappingBinding) => {
      const next = { ...mapping };
      if (binding) {
        Object.defineProperty(next, path, {
          value: binding,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        delete next[path];
      }
      setMapping(next);
    };

    return (
      <div
        ref={ref}
        style={style}
        className={cx(classes.root, className)}
        role="region"
        aria-label={text.title}
      >
        {destinations.length === 0 && <div role="status">{text.empty}</div>}
        <div className={classes.fields}>
          {destinations.map((target, index) => {
            const { path, label = path, required } = target;
            const binding = Object.hasOwn(mapping, path) ? mapping[path] : undefined;
            const invalid = invalidTargets.has(path);
            const missing =
              binding?.kind === 'field' && !available.some((field) => field.path === binding.path);
            const selected =
              binding?.kind === 'constant'
                ? constantOption
                : binding?.kind === 'field' && !missing
                  ? `${fieldOptionPrefix}${binding.path}`
                  : '';
            const error = invalid
              ? text.invalidPath
              : missing
                ? text.missingSource
                : required && !binding
                  ? text.required
                  : undefined;
            const constantId = `${id}-constant-${index}`;
            return (
              <div className={classes.row} key={`${path}-${index}`}>
                <span className={classes.destination}>{label}</span>
                <NativeSelect
                  label={text.source(label)}
                  data={options}
                  value={selected}
                  disabled={disabled || invalid}
                  placeholder={text.unmapped}
                  error={error}
                  onChange={(next) => {
                    if (next === constantOption) update(path, { kind: 'constant', value: '' });
                    else if (next)
                      update(path, { kind: 'field', path: next.slice(fieldOptionPrefix.length) });
                    else update(path);
                  }}
                />
                {binding?.kind === 'constant' && (
                  <FormControl htmlFor={constantId} label={text.constant(label)}>
                    <Input
                      id={constantId}
                      fullWidth
                      value={binding.value}
                      disabled={disabled || invalid}
                      onChange={(event) =>
                        update(path, { kind: 'constant', value: event.target.value })
                      }
                    />
                  </FormControl>
                )}
              </div>
            );
          })}
        </div>
        {result !== undefined && (
          <div role="region" aria-label={text.preview}>
            {result === null ? (
              <p role="status">{text.previewUnavailable}</p>
            ) : (
              <CodeBlock code={result} language="json" />
            )}
          </div>
        )}
      </div>
    );
  }
);

DataMappingEditor.displayName = 'DataMappingEditor';
