import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Input } from '../Input';

export interface TranscriptSegment {
  id: string;
  /** Beginning and end of the segment in seconds. */
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface TranscriptViewerLabels {
  title: string;
  search: string;
  empty: string;
  noResults: string;
}

const defaults: TranscriptViewerLabels = {
  title: 'Transcript',
  search: 'Search transcript',
  empty: 'No transcript available.',
  noResults: 'No matching segments.'
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.5rem', minWidth: 0 },
  list: {
    display: 'grid',
    gap: '0.25rem',
    margin: 0,
    padding: '0.25rem',
    maxHeight: 'var(--transcript-viewer-max-height, 20rem)',
    overflow: 'auto'
  },
  item: { minWidth: 0, '&::marker': { fontSize: 0 } },
  segment: {
    display: 'flex',
    width: '100%',
    alignItems: 'baseline',
    gap: '0.5rem',
    textAlign: 'start',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    padding: '0.375rem 0.5rem',
    color: 'var(--text-basic-color, #222b45)'
  },
  current: {
    borderInlineStart: '2px solid var(--color-primary-500, #3366ff)',
    backgroundColor: 'var(--background-basic-color-2, #f7f9fc)'
  },
  time: { whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }
}));

export type TranscriptViewerStylesNames = Selectors<typeof useStyles>;

export interface TranscriptViewerProps extends DefaultProps<TranscriptViewerStylesNames> {
  segments: readonly TranscriptSegment[];
  currentTime?: number;
  onSeek?(seconds: number): void;
  followPlayback?: boolean;
  searchable?: boolean;
  labels?: Partial<TranscriptViewerLabels>;
  disabled?: boolean;
}

function formatTime(seconds: number): string {
  const total = Math.floor(seconds);
  const hour = Math.floor(total / 3600);
  const minute = Math.floor((total % 3600) / 60);
  const suffix = String(total % 60).padStart(2, '0');
  return hour ? `${hour}:${String(minute).padStart(2, '0')}:${suffix}` : `${minute}:${suffix}`;
}

export const TranscriptViewer = forwardRef<HTMLDivElement, TranscriptViewerProps>((props, ref) => {
  const {
    segments,
    currentTime,
    onSeek,
    followPlayback,
    searchable = true,
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
    name: 'transcript-viewer',
    classNames,
    styles,
    unstyled
  });
  const [search, setSearch] = useState('');
  const activeSegment = useRef<HTMLLIElement>(null);
  const query = searchable ? search.trim().toLocaleLowerCase() : '';
  const ordered = useMemo(
    () =>
      segments
        .filter(
          ({ start, end }) =>
            Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end > start
        )
        .sort((first, second) => first.start - second.start),
    [segments]
  );
  const activeId =
    currentTime === undefined
      ? undefined
      : ordered.findLast(({ start, end }) => start <= currentTime && currentTime < end)?.id;
  const visible = query
    ? ordered.filter(
        (segment) =>
          segment.text.toLocaleLowerCase().includes(query) ||
          segment.speaker?.toLocaleLowerCase().includes(query)
      )
    : ordered;

  useEffect(() => {
    if (followPlayback && !query && activeId) {
      activeSegment.current?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [activeId, followPlayback, query]);

  return (
    <div
      ref={ref}
      style={style}
      className={cx(classes.root, className)}
      role="region"
      aria-label={text.title}
    >
      {searchable && (
        <Input
          type="search"
          value={search}
          fullWidth
          aria-label={text.search}
          placeholder={text.search}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}
      {visible.length > 0 ? (
        <ol className={classes.list}>
          {visible.map((segment) => {
            const current = segment.id === activeId;
            const shared = {
              'aria-current': current || undefined,
              className: cx(classes.segment, current && classes.current)
            };
            const body = (
              <>
                <span className={classes.time}>{formatTime(segment.start)}</span>
                <span>
                  {segment.speaker && <strong>{segment.speaker} · </strong>}
                  {segment.text}
                </span>
              </>
            );
            return (
              <li
                key={segment.id}
                className={classes.item}
                ref={current ? activeSegment : undefined}
              >
                {onSeek ? (
                  <Button
                    {...shared}
                    type="button"
                    status="basic"
                    size="small"
                    appearance="ghost"
                    disabled={disabled}
                    onClick={() => onSeek(segment.start)}
                  >
                    {body}
                  </Button>
                ) : (
                  <div {...shared}>{body}</div>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <div role="status">{ordered.length ? text.noResults : text.empty}</div>
      )}
    </div>
  );
});

TranscriptViewer.displayName = 'TranscriptViewer';
