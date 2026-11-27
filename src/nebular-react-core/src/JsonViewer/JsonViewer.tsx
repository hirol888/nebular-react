import React, { forwardRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { CopyButton } from '../CopyButton';
import { Input } from '../Input';

export type JsonParseResult =
  { ok: true; value: unknown; error?: undefined } | { ok: false; error: string };

/**
 * Parses a JSON string, returning a friendly error instead of throwing.
 * Non string inputs are treated as already parsed values.
 */
export function parseJsonSafely(value: unknown): JsonParseResult {
  if (typeof value !== 'string') {
    return { ok: true, value };
  }

  try {
    return { ok: true, value: JSON.parse(value) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return { ok: false, error: `Invalid JSON: ${message}` };
  }
}

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === 'object' && value !== null;
}

function getEntries(value: unknown): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.map((item, index) => [String(index), item]);
  }

  if (isContainer(value)) {
    return Object.entries(value);
  }

  return [];
}

function formatPrimitive(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }

  if (value === undefined) {
    return 'undefined';
  }

  return String(value);
}

function matchesQuery(label: string, value: unknown, query: string): boolean {
  if (label.toLowerCase().includes(query)) {
    return true;
  }

  if (isContainer(value)) {
    return getEntries(value).some(([key, child]) => matchesQuery(key, child, query));
  }

  return formatPrimitive(value).toLowerCase().includes(query);
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    fontFamily: 'var(--json-viewer-font-family, inherit)'
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },

  tree: {
    padding: '0.5rem',
    overflow: 'auto',
    borderRadius: '0.375rem',
    backgroundColor: 'var(--json-viewer-background-color, #f7f9fc)',
    color: 'var(--json-viewer-text-color, #222b45)',
    fontFamily: 'var(--json-viewer-font-family, ui-monospace, SFMono-Regular, monospace)',
    fontSize: 'var(--json-viewer-font-size, 0.8125rem)',
    lineHeight: 1.6
  },

  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },

  children: {
    margin: 0,
    padding: 0,
    paddingLeft: '1.1rem',
    listStyle: 'none',
    borderLeft: '1px solid var(--json-viewer-border-color, var(--border-basic-color-3, #e4e9f2))'
  },

  item: {
    listStyle: 'none'
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexWrap: 'wrap'
  },

  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    margin: 0,
    padding: 0,
    border: 0,
    background: 'none',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px',
      borderRadius: '2px'
    }
  },

  chevron: {
    display: 'inline-block',
    width: '0.75rem',
    color: 'var(--json-viewer-chevron-color, var(--text-hint-color, #8f9bb3))'
  },

  key: {
    color: 'var(--json-viewer-key-color, var(--color-primary-800, #274bdb))'
  },

  colon: {
    color: 'var(--json-viewer-text-color, #222b45)'
  },

  type: {
    color: 'var(--json-viewer-type-color, var(--color-basic-700, #3d4d6a))',
    fontSize: '0.7rem'
  },

  count: {
    color: 'var(--json-viewer-count-color, var(--color-basic-700, #3d4d6a))',
    fontSize: '0.7rem'
  },

  valueString: {
    color: 'var(--json-viewer-string-color, var(--color-success-800, #007d6c))'
  },

  valueNumber: {
    color: 'var(--json-viewer-number-color, var(--color-danger-800, #94124e))'
  },

  valueBoolean: {
    color: 'var(--json-viewer-boolean-color, var(--color-primary-800, #274bdb))'
  },

  valueNull: {
    color: 'var(--json-viewer-null-color, var(--color-basic-700, #3d4d6a))'
  },

  valuePlain: {},

  highlight: {
    padding: 0,
    borderRadius: '2px',
    backgroundColor: 'var(--json-viewer-highlight-color, #ffe7a3)',
    color: 'inherit'
  },

  error: {
    padding: '0.75rem',
    borderRadius: '0.25rem',
    backgroundColor: 'var(--json-viewer-error-background-color, #ffe7e7)',
    color: 'var(--json-viewer-error-color, var(--color-danger-800, #94124e))',
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.4
  }
}));

export type JsonViewerStylesNames = Selectors<typeof useStyles>;

type JsonViewerClasses = ReturnType<typeof useStyles>['classes'];
type JsonViewerCx = ReturnType<typeof useStyles>['cx'];

function valueClassName(classes: JsonViewerClasses, value: unknown): string {
  if (typeof value === 'string') {
    return classes.valueString;
  }

  if (typeof value === 'number') {
    return classes.valueNumber;
  }

  if (typeof value === 'boolean') {
    return classes.valueBoolean;
  }

  if (value === null) {
    return classes.valueNull;
  }

  return classes.valuePlain;
}

function highlightText(text: string, query: string, classes: JsonViewerClasses): React.ReactNode {
  if (!query) {
    return text;
  }

  const index = text.toLowerCase().indexOf(query);

  if (index === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <mark className={classes.highlight}>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

interface JsonNodeProps {
  label: string;
  value: unknown;
  path: string;
  depth: number;
  expandDepth: number;
  overrides: Record<string, boolean>;
  onToggle(path: string, expanded: boolean): void;
  query: string;
  classes: JsonViewerClasses;
  cx: JsonViewerCx;
}

function JsonNode({
  label,
  value,
  path,
  depth,
  expandDepth,
  overrides,
  onToggle,
  query,
  classes,
  cx
}: JsonNodeProps) {
  const container = isContainer(value);
  const entries = container ? getEntries(value) : [];
  const defaultExpanded = depth + 1 <= expandDepth;
  const isExpanded = overrides[path] ?? defaultExpanded;
  const expanded = query.length > 0 ? true : isExpanded;
  const visibleEntries =
    query.length > 0 ? entries.filter(([key, child]) => matchesQuery(key, child, query)) : entries;

  return (
    <li className={cx(classes.item)}>
      {container ? (
        <div className={cx(classes.row)}>
          <button
            type="button"
            className={cx(classes.toggle)}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
            onClick={() => onToggle(path, !isExpanded)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' && !expanded) {
                event.preventDefault();
                onToggle(path, true);
              }

              if (event.key === 'ArrowLeft' && expanded) {
                event.preventDefault();
                onToggle(path, false);
              }
            }}
          >
            <span className={cx(classes.chevron)} aria-hidden="true">
              {expanded ? '▾' : '▸'}
            </span>
            <span className={cx(classes.key)}>{highlightText(label, query, classes)}</span>
          </button>
          <span className={cx(classes.type)}>{Array.isArray(value) ? 'array' : 'object'}</span>
          <span className={cx(classes.count)}>
            {entries.length} {entries.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      ) : (
        <div className={cx(classes.row)}>
          <span className={cx(classes.key)}>{highlightText(label, query, classes)}</span>
          <span className={cx(classes.colon)}>:</span>
          <span className={cx(valueClassName(classes, value))}>{formatPrimitive(value)}</span>
        </div>
      )}
      {container && expanded && (
        <ul className={cx(classes.children)}>
          {visibleEntries.map(([key, child]) => (
            <JsonNode
              key={`${path}.${key}`}
              label={key}
              value={child}
              path={`${path}.${key}`}
              depth={depth + 1}
              expandDepth={expandDepth}
              overrides={overrides}
              onToggle={onToggle}
              query={query}
              classes={classes}
              cx={cx}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export interface JsonViewerProps extends DefaultProps<JsonViewerStylesNames> {
  data: unknown;
  expandDepth?: number;
  rootLabel?: string;
  copyable?: boolean;
  searchable?: boolean;
  maxHeight?: number;
  ariaLabel?: string;
}

const defaultProps: Partial<JsonViewerProps> = {
  expandDepth: 1,
  rootLabel: 'root',
  copyable: true,
  searchable: false
};

const _JsonViewer = forwardRef<HTMLDivElement, JsonViewerProps>((props, ref) => {
  const {
    data,
    expandDepth,
    rootLabel,
    copyable,
    searchable,
    maxHeight,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'json-viewer',
    classNames,
    styles,
    unstyled
  });
  const [query, setQuery] = useState('');
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const parsed = parseJsonSafely(data);
  const hasToolbar = searchable || copyable;
  const normalizedQuery = query.trim().toLowerCase();

  const handleToggle = (path: string, expanded: boolean) => {
    setOverrides((current) => ({ ...current, [path]: expanded }));
  };

  if (!parsed.ok) {
    return (
      <div ref={ref} className={cx(classes.root, className)}>
        <div className={cx(classes.error)} role="alert">
          {parsed.error}
        </div>
      </div>
    );
  }

  const formatted = JSON.stringify(parsed.value, null, 2) ?? String(parsed.value);

  return (
    <div
      ref={ref}
      className={cx(classes.root, className)}
      role={ariaLabel ? 'group' : undefined}
      aria-label={ariaLabel}
    >
      {hasToolbar && (
        <div className={cx(classes.toolbar)}>
          {searchable && (
            <Input
              size="tiny"
              aria-label="Search"
              placeholder="Search keys"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          )}
          {copyable && <CopyButton value={formatted} size="tiny" />}
        </div>
      )}
      <div
        className={cx(classes.tree)}
        style={{ maxHeight, overflowY: maxHeight ? 'auto' : undefined }}
      >
        <ul className={cx(classes.list)}>
          <JsonNode
            label={rootLabel}
            value={parsed.value}
            path="$"
            depth={0}
            expandDepth={expandDepth}
            overrides={overrides}
            onToggle={handleToggle}
            query={normalizedQuery}
            classes={classes}
            cx={cx}
          />
        </ul>
      </div>
    </div>
  );
});

_JsonViewer.displayName = 'JsonViewer';

export { _JsonViewer as JsonViewer };
