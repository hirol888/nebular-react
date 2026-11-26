import React, { forwardRef, useId, useRef, useState } from 'react';
import { useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    margin: 0,
    padding: 0,
    width: '100%',
    listStyle: 'none',
    fontFamily: 'var(--sortable-list-font-family, inherit)'
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: 'var(--sortable-list-item-padding, 0.5rem 0.625rem)',
    border:
      '1px solid var(--sortable-list-item-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--sortable-list-item-border-radius, 0.375rem)',
    backgroundColor:
      'var(--sortable-list-item-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--sortable-list-item-color, var(--text-basic-color, #222b45))',
    fontSize: 'var(--sortable-list-item-font-size, 0.8125rem)',
    listStyle: 'none',
    transition: 'box-shadow 120ms ease-in-out, opacity 120ms ease-in-out'
  },

  itemDragging: {
    opacity: 0.5,
    boxShadow: 'var(--sortable-list-dragging-shadow, 0 2px 6px rgba(0, 0, 0, 0.12))'
  },

  itemOver: {
    boxShadow: 'inset 0 0 0 2px var(--sortable-list-over-color, var(--color-primary-500, #3366ff))'
  },

  handle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.5rem',
    height: '1.5rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    backgroundColor: 'transparent',
    color: 'var(--sortable-list-handle-color, var(--text-hint-color, #8f9bb3))',
    cursor: 'grab',
    touchAction: 'none',

    '&:hover': {
      color: 'var(--sortable-list-handle-hover-color, var(--text-basic-color, #222b45))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--sortable-list-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '2px'
    },

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5
    }
  },

  handleGlyph: {
    display: 'block',
    fill: 'currentColor'
  },

  content: {
    flex: '1 1 auto',
    minWidth: 0
  },

  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type SortableListStylesNames = Selectors<typeof useStyles>;

export interface SortableListItemState {
  dragging: boolean;
  over: boolean;
}

export interface SortableListReorderMeta {
  from: number;
  to: number;
}

export interface SortableListProps<T> extends DefaultProps<SortableListStylesNames> {
  items: T[];
  onReorder(next: T[], meta: SortableListReorderMeta): void;
  keyExtractor(item: T): string | number;
  renderItem(item: T, index: number, state: SortableListItemState): React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  /** Prefix of the drag handle accessible name, e.g. "Reorder item 1". */
  handleLabel?: string;
}

const defaultProps: Partial<SortableListProps<unknown>> = {
  disabled: false,
  ariaLabel: 'Sortable list',
  handleLabel: 'Reorder item'
};

/** Returns a copy of `items` with the item at `from` moved to `to`. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length || to < 0 || to >= items.length) {
    return items.slice();
  }

  const next = items.slice();
  const [moved] = next.splice(from, 1);

  next.splice(to, 0, moved);

  return next;
}

type SortableListComponent = <T>(
  props: SortableListProps<T> & React.RefAttributes<HTMLUListElement>
) => React.ReactElement | null;

const _SortableList = forwardRef<HTMLUListElement, SortableListProps<unknown>>((props, ref) => {
  const {
    items,
    onReorder,
    keyExtractor,
    renderItem,
    disabled,
    ariaLabel,
    handleLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'sortable-list', classNames, styles, unstyled });
  const listRef = useRef<HTMLUListElement>(null);
  const mergedRef = useMergedRef(listRef, ref);
  const capturedHandleRef = useRef<HTMLElement | null>(null);
  const instructionsId = useId();
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const total = items.length;

  const resolvePointerIndex = (clientY: number): number => {
    const rows = listRef.current?.children;

    if (!rows || rows.length === 0) {
      return 0;
    }

    for (let index = 0; index < rows.length; index += 1) {
      const rect = rows[index].getBoundingClientRect();

      if (clientY < rect.top + rect.height / 2) {
        return index;
      }
    }

    return rows.length - 1;
  };

  const releaseCapture = (pointerId: number) => {
    const handle = capturedHandleRef.current;

    capturedHandleRef.current = null;

    if (handle && typeof handle.releasePointerCapture === 'function') {
      try {
        handle.releasePointerCapture(pointerId);
      } catch {
        // Pointer capture is optional (and unavailable in some environments).
      }
    }
  };

  const startDrag = (index: number) => {
    setDraggingIndex(index);
    setTargetIndex(index);
    setAnnouncement(
      `Picked up item ${index + 1} of ${total}. Use arrow keys to move, ` +
        'Space or Enter to drop and Escape to cancel.'
    );
  };

  const cancelDrag = () => {
    if (draggingIndex === null) {
      return;
    }

    setAnnouncement(`Reorder cancelled. Item ${draggingIndex + 1} of ${total} returned.`);
    setDraggingIndex(null);
    setTargetIndex(null);
  };

  const dropDrag = () => {
    if (draggingIndex === null || targetIndex === null) {
      return;
    }

    const from = draggingIndex;
    const to = targetIndex;

    setDraggingIndex(null);
    setTargetIndex(null);
    setAnnouncement(`Item ${from + 1} of ${total} moved to position ${to + 1}.`);

    if (from !== to) {
      onReorder(moveItem(items, from, to), { from, to });
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    if (disabled || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.focus();

    if (typeof event.currentTarget.setPointerCapture === 'function') {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
        capturedHandleRef.current = event.currentTarget;
      } catch {
        // Pointer capture is optional (and unavailable in some environments).
      }
    }

    startDrag(index);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    if (disabled || draggingIndex === null) {
      return;
    }

    const index = resolvePointerIndex(event.clientY);

    if (index !== targetIndex) {
      setTargetIndex(index);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLUListElement>) => {
    if (disabled || draggingIndex === null) {
      return;
    }

    releaseCapture(event.pointerId);
    dropDrag();
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLUListElement>) => {
    releaseCapture(event.pointerId);
    cancelDrag();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (disabled) {
      return;
    }

    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
      event.preventDefault();

      if (draggingIndex === null) {
        startDrag(index);
      } else {
        dropDrag();
      }

      return;
    }

    if (draggingIndex === null) {
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();

      const current = targetIndex ?? draggingIndex;
      const next = Math.max(0, Math.min(total - 1, current + (event.key === 'ArrowUp' ? -1 : 1)));

      setTargetIndex(next);
      setAnnouncement(`Item ${draggingIndex + 1} of ${total} moved to position ${next + 1}.`);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelDrag();
    }
  };

  return (
    <>
      <ul
        {...others}
        ref={mergedRef}
        aria-label={ariaLabel}
        aria-describedby={instructionsId}
        className={cx(classes.root, className)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {items.map((item, index) => (
          <li
            key={keyExtractor(item)}
            data-sortable-item
            className={cx(classes.item, {
              [classes.itemDragging]: draggingIndex === index,
              [classes.itemOver]: targetIndex === index
            })}
          >
            <button
              type="button"
              className={cx(classes.handle)}
              aria-label={`${handleLabel} ${index + 1}`}
              aria-pressed={draggingIndex === index}
              data-sortable-handle
              disabled={disabled}
              onPointerDown={(event) => handlePointerDown(event, index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <svg
                className={cx(classes.handleGlyph)}
                width="10"
                height="16"
                viewBox="0 0 10 16"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="3" cy="3" r="1.4" />
                <circle cx="7" cy="3" r="1.4" />
                <circle cx="3" cy="8" r="1.4" />
                <circle cx="7" cy="8" r="1.4" />
                <circle cx="3" cy="13" r="1.4" />
                <circle cx="7" cy="13" r="1.4" />
              </svg>
            </button>
            <div className={cx(classes.content)}>
              {renderItem(item, index, {
                dragging: draggingIndex === index,
                over: targetIndex === index
              })}
            </div>
          </li>
        ))}
      </ul>
      <p id={instructionsId} className={cx(classes.visuallyHidden)}>
        Press Space or Enter to pick up an item, use the arrow keys to move it, Space or Enter to
        drop it and Escape to cancel.
      </p>
      <div role="status" aria-live="polite" className={cx(classes.visuallyHidden)}>
        {announcement}
      </div>
    </>
  );
});

_SortableList.displayName = 'SortableList';

export const SortableList = _SortableList as unknown as SortableListComponent;
