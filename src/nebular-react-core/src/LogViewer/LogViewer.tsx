import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useIsomorphicEffect, useUncontrolled } from '@nebular-react/hooks';
import { createStyles, useComponentDefaultProps } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';

export interface LogViewerEntry {
  /** Stable, unique identifier for the entry. */
  id: string | number;
  message: string;
  level?: string;
  timestamp?: string;
}

export interface LogViewerLabels {
  viewer: string;
  viewport: string;
  search: string;
  pause: string;
  resume: string;
  wrap: string;
  empty: string;
  noMatches: string;
  matches(count: number): string;
}

const defaultLabels: LogViewerLabels = {
  viewer: 'Log viewer',
  viewport: 'Log entries',
  search: 'Search logs',
  pause: 'Pause following',
  resume: 'Resume following',
  wrap: 'Wrap lines',
  empty: 'No log entries.',
  noMatches: 'No matching entries.',
  matches: (count) => `${count} matching ${count === 1 ? 'entry' : 'entries'}`
};

const useStyles = createStyles(() => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    color: 'var(--text-basic-color, #222b45)',
    backgroundColor: 'var(--background-basic-color-1, #fff)',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.375rem)',
    fontFamily: 'var(--font-family-primary, sans-serif)',
    minInlineSize: 0
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
    padding: '0.625rem',
    fontSize: '0.875rem'
  },
  search: {
    flex: '1 1 10rem',
    minInlineSize: 0,
    maxInlineSize: '100%',
    boxSizing: 'border-box',
    minBlockSize: '2.25rem',
    paddingInline: '0.625rem',
    color: 'inherit',
    font: 'inherit',
    border: '1px solid var(--border-basic-color-4, #8f9bb3)',
    borderRadius: 'var(--border-radius, 0.25rem)',
    background: 'var(--background-basic-color-1, #fff)',
    '&::placeholder': { color: 'inherit', opacity: 1 }
  },
  wrapToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    minBlockSize: '2.25rem'
  },
  viewport: {
    overflow: 'auto',
    overflowAnchor: 'none',
    borderBlockStart: '1px solid var(--border-basic-color-3, #e4e9f2)',
    background: 'var(--background-basic-color-2, #f7f9fc)',
    '&:focus-visible': { outline: '2px solid var(--color-primary-500, #3366ff)', outlineOffset: -2 }
  },
  list: {
    minInlineSize: '100%',
    fontFamily: 'var(--log-viewer-font-family, ui-monospace, monospace)',
    fontSize: 'var(--log-viewer-font-size, 0.8125rem)'
  },
  row: {
    boxSizing: 'border-box',
    minInlineSize: '100%',
    paddingInline: '0.625rem',
    tabSize: 4
  },
  singleLine: {
    inlineSize: 'max-content',
    whiteSpace: 'pre'
  },
  wrappedLine: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere'
  },
  feedback: { padding: '0.625rem', margin: 0, fontSize: '0.875rem' }
}));

export type LogViewerStylesNames = Selectors<typeof useStyles>;

export interface LogViewerProps extends DefaultProps<LogViewerStylesNames> {
  /** Records ordered from oldest to newest. Pass a new array when records change. */
  entries: readonly LogViewerEntry[];
  /** Height of the scrollable viewport in CSS pixels. Defaults to 320. */
  height?: number;
  /** Height of a single line in CSS pixels. Defaults to 24. */
  rowHeight?: number;
  /** Number of entries kept on each side of the virtual window. Defaults to 6. */
  overscan?: number;
  /** Controlled automatic following. Pausing preserves the viewport while records arrive. */
  following?: boolean;
  /** Initial following state when uncontrolled. Defaults to true. */
  defaultFollowing?: boolean;
  onFollowingChange?(following: boolean): void;
  /** Controlled wrapping of long lines and multiline entries. */
  wrap?: boolean;
  /** Initial wrapping state when uncontrolled. Defaults to false. */
  defaultWrap?: boolean;
  onWrapChange?(wrap: boolean): void;
  labels?: Partial<LogViewerLabels>;
}

interface MeasuredLine {
  entry: LogViewerEntry;
  height: number;
}

interface LogLayout {
  entries: readonly LogViewerEntry[];
  rowHeight: number;
  offsets?: number[];
  totalHeight: number;
}

function rowTop(layout: LogLayout, index: number) {
  return layout.offsets?.[index] ?? index * layout.rowHeight;
}

function rowAt(layout: LogLayout, scrollTop: number) {
  if (!layout.offsets) {
    return Math.min(layout.entries.length - 1, Math.floor(scrollTop / layout.rowHeight));
  }

  let start = 0;
  let end = layout.entries.length;
  while (start < end) {
    const middle = Math.floor((start + end) / 2);
    if (layout.offsets[middle + 1] <= scrollTop) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return Math.min(start, layout.entries.length - 1);
}

function restoreAnchor(previous: LogLayout, current: LogLayout, scrollTop: number) {
  const index = rowAt(previous, scrollTop);
  const anchor = previous.entries[index];
  if (!anchor) return scrollTop;
  const newIndex =
    current.entries[index]?.id === anchor.id
      ? index
      : current.entries.findIndex(({ id }) => id === anchor.id);
  if (newIndex < 0) return scrollTop;

  const offset = scrollTop - rowTop(previous, index);
  const lineHeight = rowTop(current, newIndex + 1) - rowTop(current, newIndex);
  return rowTop(current, newIndex) + Math.min(offset, lineHeight - 1);
}

function positivePixels(value: number | undefined, fallback: number) {
  return value && Number.isFinite(value) && value > 0 ? value : fallback;
}

const multiline = /\r\n|\r|\n/g;
const followButtonColor = 'var(--text-basic-color, #222b45)';

export const LogViewer = forwardRef<HTMLDivElement, LogViewerProps>((props, ref) => {
  const {
    entries,
    height,
    rowHeight,
    overscan = 6,
    following,
    defaultFollowing,
    onFollowingChange,
    wrap,
    defaultWrap,
    onWrapChange,
    labels,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps({}, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'log-viewer',
    classNames,
    styles,
    unstyled
  });
  const text = { ...defaultLabels, ...labels };
  const [isFollowing, setFollowing] = useUncontrolled({
    value: following,
    defaultValue: defaultFollowing,
    finalValue: true,
    onChange: onFollowingChange
  });
  const [isWrapped, setWrapped] = useUncontrolled({
    value: wrap,
    defaultValue: defaultWrap,
    finalValue: false,
    onChange: onWrapChange
  });
  const [filter, setFilter] = useState('');
  const query = filter.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return entries;
    const terms = query.split(/\s+/);
    return entries.filter(({ level, timestamp, message }) => {
      const searchable = [timestamp, level, message].filter(Boolean).join(' ').toLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [entries, query]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportHeight = positivePixels(height, 320);
  const lineHeight = positivePixels(rowHeight, 24);
  const extraRows = Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 6;
  const [measured, setMeasured] = useState(() => ({
    width: -1,
    rowHeight: -1,
    lines: new Map<LogViewerEntry['id'], MeasuredLine>()
  }));
  const currentLayout = useMemo<LogLayout>(() => {
    const offsets = isWrapped ? [0] : undefined;
    if (offsets) {
      for (const entry of filtered) {
        const cached = measured.rowHeight === lineHeight ? measured.lines.get(entry.id) : undefined;
        const size = cached?.entry === entry ? cached.height : lineHeight;
        offsets.push(offsets[offsets.length - 1] + size);
      }
    }
    return {
      entries: filtered,
      rowHeight: lineHeight,
      offsets,
      totalHeight: offsets?.[filtered.length] ?? filtered.length * lineHeight
    };
  }, [filtered, isWrapped, lineHeight, measured]);
  const maxScrollTop = Math.max(0, currentLayout.totalHeight - viewportHeight);
  const [scrollTop, setScrollTop] = useState(() => (isFollowing ? maxScrollTop : 0));
  const previousScroll = useRef(scrollTop);
  const previousLayout = useRef({ layout: currentLayout, query });
  const first = Math.max(0, rowAt(currentLayout, scrollTop) - extraRows);
  const end = Math.min(
    filtered.length,
    rowAt(currentLayout, scrollTop + viewportHeight) + extraRows + 1
  );
  const visibleEntries = filtered.slice(first, end);

  useIsomorphicEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const previous = previousLayout.current;
    previousLayout.current = { layout: currentLayout, query };
    let next = viewport.scrollTop;
    if (isFollowing && !query) {
      next = viewport.clientHeight ? viewport.scrollHeight - viewport.clientHeight : maxScrollTop;
    } else if (query !== previous.query) {
      next = 0;
    } else if (currentLayout !== previous.layout) {
      next = Math.min(maxScrollTop, restoreAnchor(previous.layout, currentLayout, next));
    }
    viewport.scrollTop = next;
    previousScroll.current = viewport.scrollTop;
    setScrollTop(viewport.scrollTop);
  }, [currentLayout, isFollowing, maxScrollTop, query]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!isWrapped || !viewport) return undefined;
    const elements = Array.from(viewport.querySelectorAll<HTMLElement>('[data-log-row]'));
    const measure = () => {
      const width = viewport.clientWidth;
      const updates = elements.map((element, index) => {
        const entry = filtered[first + index];
        return { entry, height: element.getBoundingClientRect().height };
      });
      setMeasured((current) => {
        const reset = width !== current.width || lineHeight !== current.rowHeight;
        const lines = reset
          ? new Map<LogViewerEntry['id'], MeasuredLine>()
          : new Map(current.lines);
        let changed = reset;
        for (const update of updates) {
          const existing = lines.get(update.entry.id);
          if (
            update.height > 0 &&
            (existing?.entry !== update.entry || existing.height !== update.height)
          ) {
            lines.set(update.entry.id, update);
            changed = true;
          }
        }
        if (lines.size > Math.max(entries.length * 2, 64)) {
          const ids = new Set(entries.map(({ id }) => id));
          for (const id of lines.keys()) {
            if (!ids.has(id)) {
              lines.delete(id);
              changed = true;
            }
          }
        }
        return changed ? { width, rowHeight: lineHeight, lines } : current;
      });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [end, entries, filtered, first, isWrapped, lineHeight]);

  // Stored scroll positions include programmatic tail moves, so only a genuine upward
  // scroll away from the newest log entries pauses automatic following.
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const top = Math.max(0, event.currentTarget.scrollTop);
    if (isFollowing && !query && top < previousScroll.current && top < maxScrollTop - 4) {
      setFollowing(false);
    }
    previousScroll.current = top;
    setScrollTop(top);
  };
  const wrapText = (value: string) => (isWrapped ? value : value.replace(multiline, ' ↵ '));

  return (
    <div ref={ref} role="region" aria-label={text.viewer} className={cx(classes.root, className)}>
      <div className={classes.controls}>
        <input
          className={classes.search}
          type="search"
          aria-label={text.search}
          placeholder={text.search}
          value={filter}
          onChange={(event) => setFilter(event.currentTarget.value)}
        />
        <Button
          type="button"
          size="small"
          appearance="outline"
          styles={{
            root: {
              color: followButtonColor,
              '&:hover, &:focus, &:active': { color: followButtonColor }
            }
          }}
          onClick={() => setFollowing(!isFollowing)}
        >
          {isFollowing ? text.pause : text.resume}
        </Button>
        <label className={classes.wrapToggle}>
          <input
            type="checkbox"
            checked={isWrapped}
            onChange={(event) => setWrapped(event.currentTarget.checked)}
          />
          {text.wrap}
        </label>
      </div>
      {!!query && (
        <p role="status" className={classes.feedback}>
          {filtered.length ? text.matches(filtered.length) : text.noMatches}
        </p>
      )}
      <div
        ref={viewportRef}
        role="region"
        aria-label={text.viewport}
        // A focusable viewport allows keyboard scrolling without extra controls.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className={classes.viewport}
        style={{ height: viewportHeight }}
        onScroll={handleScroll}
      >
        {!entries.length && !query && <p className={classes.feedback}>{text.empty}</p>}
        {!!filtered.length && (
          <div role="list" className={classes.list}>
            <div aria-hidden="true" style={{ height: rowTop(currentLayout, first) }} />
            {visibleEntries.map(({ id, message, level, timestamp }, index) => (
              <div
                key={`${typeof id}:${id}`}
                role="listitem"
                aria-setsize={filtered.length}
                aria-posinset={first + index + 1}
                data-log-row=""
                className={cx(classes.row, isWrapped ? classes.wrappedLine : classes.singleLine)}
                style={{
                  lineHeight: `${lineHeight}px`,
                  minHeight: lineHeight,
                  height: isWrapped ? undefined : lineHeight
                }}
              >
                {timestamp && <span>{wrapText(timestamp)} </span>}
                {level && <strong>{wrapText(level)} </strong>}
                <span>{wrapText(message)}</span>
              </div>
            ))}
            <div
              aria-hidden="true"
              style={{ height: currentLayout.totalHeight - rowTop(currentLayout, end) }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

LogViewer.displayName = 'LogViewer';
