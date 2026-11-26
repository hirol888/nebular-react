import React, { forwardRef, useMemo, useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';

export type TraceWaterfallSpanStatus = 'ok' | 'error' | 'unset';
export type TraceWaterfallAttribute = string | number | boolean | null;

export interface TraceWaterfallSpan {
  id: string;
  parentId?: string;
  name: string;
  service?: string;
  /** A timestamp or relative offset in milliseconds on the same time base as the other spans. */
  startTime: number;
  duration: number;
  status?: TraceWaterfallSpanStatus;
  attributes?: Readonly<Record<string, TraceWaterfallAttribute>>;
}

export interface TraceWaterfallLabels {
  title: string;
  empty: React.ReactNode;
  details: string;
  service: string;
  start: string;
  duration: string;
  status: string;
  ok: string;
  error: string;
  unset: string;
  expand(name: string): string;
  collapse(name: string): string;
}

const defaultLabels: TraceWaterfallLabels = {
  title: 'Trace waterfall',
  empty: 'No spans available.',
  details: 'Span details',
  service: 'Service',
  start: 'Relative start',
  duration: 'Duration',
  status: 'Status',
  ok: 'OK',
  error: 'Error',
  unset: 'Unset',
  expand: (name) => `Expand ${name}`,
  collapse: (name) => `Collapse ${name}`
};

const timelineColumns = {
  display: 'grid',
  gridTemplateColumns: 'minmax(12rem, 22rem) minmax(8rem, 1fr) 7rem',
  alignItems: 'center',
  gap: '0.5rem',
  minWidth: '29rem',
  padding: '0.25rem 0.5rem'
} as const;

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.75rem', minWidth: 0 },
  scroll: { overflowX: 'auto', padding: '0.25rem' },
  axis: {
    ...timelineColumns,
    fontSize: '0.75rem'
  },
  ticks: { display: 'flex', justifyContent: 'space-between', fontVariantNumeric: 'tabular-nums' },
  list: { margin: 0, padding: 0 },
  row: {
    ...timelineColumns,
    borderBlockStart: '1px solid var(--border-basic-color-3, #e4e9f2)'
  },
  selected: { background: 'var(--background-basic-color-2, #f7f9fc)' },
  spanLabel: { display: 'flex', gap: '0.25rem', alignItems: 'center', minWidth: 0 },
  disclosure: { width: '1.625rem', flexShrink: 0 },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingInline: 0
  },
  selection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem 0.5rem',
    textAlign: 'start',
    justifyContent: 'start',
    maxWidth: '100%',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere'
  },
  service: { fontWeight: 400 },
  track: {
    position: 'relative',
    height: '0.875rem',
    overflow: 'hidden',
    background: 'var(--background-basic-color-3, #edf1f7)',
    borderRadius: 'var(--border-radius, 0.25rem)'
  },
  bar: {
    position: 'absolute',
    insetBlock: 0,
    minWidth: 2,
    borderRadius: 'var(--border-radius, 0.25rem)',
    background: 'var(--color-primary-500, #3366ff)',
    '&[data-status="error"]': { background: 'var(--color-danger-600, #db2c66)' }
  },
  duration: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  details: {
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)',
    padding: '1rem',
    overflowWrap: 'anywhere'
  },
  detailTitle: { margin: 0 },
  metadata: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
    gap: '0.25rem 1rem',
    marginBlockEnd: 0,
    '& dt': { fontWeight: 600 },
    '& dd': { margin: 0 }
  }
}));

export type TraceWaterfallStylesNames = Selectors<typeof useStyles>;

export interface TraceWaterfallProps extends DefaultProps<TraceWaterfallStylesNames> {
  spans: readonly TraceWaterfallSpan[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectionChange?(id: string | null): void;
  expandedIds?: readonly string[];
  /** When omitted, every parent starts expanded. */
  defaultExpandedIds?: readonly string[];
  onExpandedIdsChange?(ids: string[]): void;
  renderDetails?(span: TraceWaterfallSpan): React.ReactNode;
  formatDuration?(milliseconds: number): string;
  labels?: Partial<TraceWaterfallLabels>;
}

interface TraceNode {
  span: TraceWaterfallSpan;
  children: TraceNode[];
}

interface TraceRow {
  node: TraceNode;
  depth: number;
}

function prepareTrace(spans: readonly TraceWaterfallSpan[]) {
  const byId = new Map<string, TraceWaterfallSpan>();
  let start = Infinity;
  let end = -Infinity;

  for (const span of spans) {
    const { id, startTime, duration } = span;
    const spanEnd = startTime + duration;
    if (
      id &&
      !byId.has(id) &&
      Number.isFinite(startTime) &&
      Number.isFinite(spanEnd) &&
      Number.isFinite(duration) &&
      duration >= 0
    ) {
      byId.set(id, span);
      start = Math.min(start, startTime);
      end = Math.max(end, spanEnd);
    }
  }

  const ordered = [...byId.values()].sort((first, second) => first.startTime - second.startTime);
  const childrenByParent = new Map<string, TraceWaterfallSpan[]>();
  const rootCandidates: TraceWaterfallSpan[] = [];

  for (const span of ordered) {
    const { id, parentId } = span;
    if (!parentId || parentId === id || !byId.has(parentId)) {
      rootCandidates.push(span);
    } else {
      const siblings = childrenByParent.get(parentId) ?? [];
      siblings.push(span);
      childrenByParent.set(parentId, siblings);
    }
  }

  const roots: TraceNode[] = [];
  const visited = new Set<string>();
  const expandableIds: string[] = [];
  const addBranch = (span: TraceWaterfallSpan) => {
    const root: TraceNode = { span, children: [] };
    roots.push(root);
    visited.add(span.id);
    const pending = [root];

    while (pending.length > 0) {
      const node = pending.pop()!;
      for (const child of childrenByParent.get(node.span.id) ?? []) {
        if (!visited.has(child.id)) {
          const next: TraceNode = { span: child, children: [] };
          visited.add(child.id);
          node.children.push(next);
          pending.push(next);
        }
      }
      if (node.children.length) expandableIds.push(node.span.id);
    }
  };

  // Start a branch at the earliest unvisited span if invalid parent relationships form a cycle.
  for (const span of [...rootCandidates, ...ordered]) {
    if (!visited.has(span.id)) addBranch(span);
  }

  roots.sort((first, second) => first.span.startTime - second.span.startTime);
  return { roots, byId, expandableIds, start, duration: byId.size ? end - start : 0 };
}

function visibleRows(roots: TraceNode[], expanded: Set<string>): TraceRow[] {
  const rows: TraceRow[] = [];
  const pending = roots.map((node) => ({ node, depth: 1 })).reverse();
  while (pending.length > 0) {
    const row = pending.pop()!;
    rows.push(row);
    if (expanded.has(row.node.span.id)) {
      for (let index = row.node.children.length - 1; index >= 0; index -= 1) {
        pending.push({ node: row.node.children[index], depth: row.depth + 1 });
      }
    }
  }
  return rows;
}

const durationNumber = new Intl.NumberFormat('en', { maximumFractionDigits: 3 });
const defaultFormatDuration = (milliseconds: number) => `${durationNumber.format(milliseconds)} ms`;

export const TraceWaterfall = forwardRef<HTMLDivElement, TraceWaterfallProps>((props, ref) => {
  const {
    spans,
    selectedId,
    defaultSelectedId = null,
    onSelectionChange,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
    renderDetails,
    formatDuration = defaultFormatDuration,
    labels,
    classNames,
    styles,
    className,
    style,
    unstyled
  } = props;
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, {
    name: 'trace-waterfall',
    classNames,
    styles,
    unstyled
  });
  const [localSelectedId, setSelectedId] = useState(defaultSelectedId);
  const [localExpandedIds, setExpandedIds] = useState(defaultExpandedIds);
  const model = useMemo(() => prepareTrace(spans), [spans]);
  const currentSelection = selectedId === undefined ? localSelectedId : selectedId;
  const selected = currentSelection === null ? undefined : model.byId.get(currentSelection);
  const expanded = new Set(expandedIds ?? localExpandedIds ?? model.expandableIds);
  const rows = visibleRows(model.roots, expanded);
  const scale = model.duration || 1;

  const toggleBranch = (id: string) => {
    const next = expanded.has(id)
      ? [...expanded].filter((expandedId) => expandedId !== id)
      : [...expanded, id];
    if (expandedIds === undefined) setExpandedIds(next);
    onExpandedIdsChange?.(next);
  };

  const toggleSelection = (id: string) => {
    const next = id === currentSelection ? null : id;
    if (selectedId === undefined) setSelectedId(next);
    onSelectionChange?.(next);
  };

  const displayStatus = (status: TraceWaterfallSpanStatus | undefined) => text[status ?? 'unset'];

  return (
    <div
      ref={ref}
      className={cx(classes.root, className)}
      style={style}
      role="region"
      aria-label={text.title}
    >
      {rows.length ? (
        <div className={classes.scroll}>
          <div className={classes.axis} aria-hidden="true">
            <span />
            <div className={classes.ticks}>
              <span>{formatDuration(0)}</span>
              {model.duration > 0 && (
                <>
                  <span>{formatDuration(model.duration / 2)}</span>
                  <span>{formatDuration(model.duration)}</span>
                </>
              )}
            </div>
            <span className={classes.duration}>{text.duration}</span>
          </div>
          <ul className={classes.list}>
            {rows.map(({ node, depth }) => {
              const { span } = node;
              const isSelected = span.id === currentSelection;
              const isExpanded = expanded.has(span.id);
              const offset = span.startTime - model.start;
              const duration = formatDuration(span.duration);
              const accessibleName = [
                span.name,
                span.service,
                span.status === 'error' && text.error
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <li
                  key={span.id}
                  className={cx(classes.row, isSelected && classes.selected)}
                  aria-level={depth}
                >
                  <div
                    className={classes.spanLabel}
                    style={{ paddingInlineStart: `${Math.min(8, depth - 1) * 0.625}rem` }}
                  >
                    <div className={classes.disclosure}>
                      {node.children.length > 0 && (
                        <Button
                          type="button"
                          appearance="ghost"
                          size="tiny"
                          className={classes.toggle}
                          aria-label={(isExpanded ? text.collapse : text.expand)(span.name)}
                          aria-expanded={isExpanded}
                          onClick={() => toggleBranch(span.id)}
                        >
                          {isExpanded ? '−' : '+'}
                        </Button>
                      )}
                    </div>
                    <Button
                      type="button"
                      appearance="ghost"
                      size="tiny"
                      status={span.status === 'error' ? 'danger' : 'basic'}
                      className={classes.selection}
                      aria-label={`${accessibleName} · ${duration}`}
                      aria-pressed={isSelected}
                      onClick={() => toggleSelection(span.id)}
                    >
                      <span>{span.name}</span>
                      {span.service && <span className={classes.service}>{span.service}</span>}
                      {span.status === 'error' && <span>{text.error}</span>}
                    </Button>
                  </div>
                  <div className={classes.track} aria-hidden="true">
                    <div
                      className={classes.bar}
                      data-status={span.status}
                      style={{
                        insetInlineStart:
                          span.duration === 0 && offset === scale
                            ? 'calc(100% - 2px)'
                            : `${(offset / scale) * 100}%`,
                        width: `${(span.duration / scale) * 100}%`
                      }}
                    />
                  </div>
                  <span className={classes.duration} title={duration} aria-hidden="true">
                    {duration}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div role="status">{text.empty}</div>
      )}
      {selected && (
        <section className={classes.details} aria-label={text.details}>
          {renderDetails ? (
            renderDetails(selected)
          ) : (
            <>
              <h3 className={classes.detailTitle}>{selected.name}</h3>
              <dl className={classes.metadata}>
                {[
                  ...(selected.service ? [[text.service, selected.service]] : []),
                  [text.start, formatDuration(selected.startTime - model.start)],
                  [text.duration, formatDuration(selected.duration)],
                  [text.status, displayStatus(selected.status)],
                  ...Object.entries(selected.attributes ?? {}).map(([key, value]) => [
                    key,
                    String(value)
                  ])
                ].map(([key, value], index) => (
                  <React.Fragment key={`${key}-${index}`}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </>
          )}
        </section>
      )}
    </div>
  );
});

TraceWaterfall.displayName = 'TraceWaterfall';
