import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

const useStyles = createStyles((_theme) => ({
  root: {
    width: '100%',
    border: '1px solid var(--virtual-list-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: '0.375rem',
    backgroundColor: 'var(--virtual-list-background-color, transparent)'
  },

  list: {
    margin: 0,
    padding: 0
  },

  item: {
    boxSizing: 'border-box',
    overflow: 'hidden'
  },

  spacer: {
    width: '100%'
  }
}));

export type VirtualListStylesNames = Selectors<typeof useStyles>;

export interface VirtualListProps<T> extends DefaultProps<VirtualListStylesNames> {
  items: T[];
  height: number;
  itemHeight: number;
  overscan?: number;
  renderItem(item: T, index: number): React.ReactNode;
  getKey?(item: T, index: number): string | number;
  ariaLabel?: string;
  className?: string;
  onEndReached?(): void;
  endReachedThreshold?: number;
}

const defaultProps: Partial<VirtualListProps<unknown>> = {
  overscan: 3,
  endReachedThreshold: 2,
  ariaLabel: 'Virtual list'
};

const VirtualListInner = <T,>(
  props: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  const {
    items,
    height,
    itemHeight,
    overscan,
    renderItem,
    getKey,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    onEndReached,
    endReachedThreshold
  } = useComponentDefaultProps(defaultProps as Partial<VirtualListProps<T>>, props);
  const { classes, cx } = useStyles(null, {
    name: 'virtual-list',
    classNames,
    styles,
    unstyled
  });
  const [scrollTop, setScrollTop] = useState(0);
  const endReachedRef = useRef(false);

  const rowHeight = Math.max(1, itemHeight);
  const overscanCount = Math.max(0, overscan ?? 0);
  const endThreshold = Math.max(0, endReachedThreshold ?? 0);
  const total = items.length;
  const visibleStart = Math.floor(scrollTop / rowHeight);
  const visibleEnd = Math.ceil((scrollTop + height) / rowHeight);
  const start = Math.max(0, Math.min(visibleStart, total) - overscanCount);
  const end = Math.min(total, Math.max(start, visibleEnd + overscanCount));
  const visibleItems = items.slice(start, end);
  const topSpacerHeight = start * rowHeight;
  const bottomSpacerHeight = Math.max(0, (total - end) * rowHeight);
  const atEnd = total > 0 && visibleEnd >= total - endThreshold;

  useEffect(() => {
    if (atEnd && !endReachedRef.current) {
      endReachedRef.current = true;
      onEndReached?.();
      return;
    }

    if (!atEnd) {
      endReachedRef.current = false;
    }
  }, [atEnd, onEndReached]);

  return (
    <div
      ref={ref}
      className={cx(classes.root, className)}
      style={{ height, overflowY: 'auto', overflowX: 'hidden' }}
      // Scrollable regions need to be focusable for keyboard scrolling.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div
        className={cx(classes.spacer)}
        style={{ height: topSpacerHeight }}
        data-virtual-spacer="top"
        aria-hidden="true"
      />
      <div role="list" aria-label={ariaLabel} className={cx(classes.list)}>
        {visibleItems.map((item, offset) => {
          const index = start + offset;
          const key = getKey ? getKey(item, index) : index;

          return (
            <div
              key={key}
              role="listitem"
              aria-setsize={total}
              aria-posinset={index + 1}
              data-key={String(key)}
              className={cx(classes.item)}
              style={{ height: rowHeight }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
      <div
        className={cx(classes.spacer)}
        style={{ height: bottomSpacerHeight }}
        data-virtual-spacer="bottom"
        aria-hidden="true"
      />
    </div>
  );
};

VirtualListInner.displayName = 'VirtualList';

export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;
