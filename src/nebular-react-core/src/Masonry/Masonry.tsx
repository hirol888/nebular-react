import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsomorphicEffect, useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface MasonryColumns {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface MasonryItemPosition {
  column: number;
  top: number;
}

export interface MasonryLayout {
  positions: MasonryItemPosition[];
  height: number;
}

/**
 * Places each item in the shortest column (classic masonry). The resulting
 * reading order is left to right, row by row, whenever the items share the
 * same height. Columns are clamped to the 1..64 range.
 */
export function computeMasonryLayout(heights: number[], columns: number, gap = 0): MasonryLayout {
  const columnCount = Math.max(1, Math.min(64, Math.floor(columns) || 1));
  const columnHeights = new Array<number>(columnCount).fill(0);
  const positions: MasonryItemPosition[] = [];

  heights.forEach((rawHeight) => {
    const height = Math.max(0, rawHeight);
    let column = 0;

    for (let index = 1; index < columnCount; index += 1) {
      if (columnHeights[index] < columnHeights[column]) {
        column = index;
      }
    }

    const top = columnHeights[column] === 0 ? 0 : columnHeights[column] + gap;

    positions.push({ column, top });
    columnHeights[column] = top + height;
  });

  return { positions, height: Math.max(0, ...columnHeights) };
}

const BREAKPOINTS: Array<{ key: 'sm' | 'md' | 'lg'; query: string }> = [
  { key: 'sm', query: '(min-width: 576px)' },
  { key: 'md', query: '(min-width: 768px)' },
  { key: 'lg', query: '(min-width: 992px)' }
];

interface MasonryColumnsSpec {
  base: number;
  sm?: number;
  md?: number;
  lg?: number;
}

function sanitizeColumns(value: number | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const rounded = Math.floor(value);

  return Number.isFinite(rounded) && rounded > 0 ? rounded : fallback;
}

function normalizeColumns(columns: number | MasonryColumns): MasonryColumnsSpec {
  if (typeof columns === 'number') {
    return { base: columns };
  }

  return {
    base: columns.base ?? 1,
    sm: columns.sm,
    md: columns.md,
    lg: columns.lg
  };
}

function resolveColumnsFromViewport(spec: MasonryColumnsSpec): number {
  let resolved = spec.base;

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    BREAKPOINTS.forEach(({ key, query }) => {
      const value = spec[key];

      if (value !== undefined && window.matchMedia(query).matches) {
        resolved = value;
      }
    });
  }

  return sanitizeColumns(resolved, 1);
}

function useMasonryColumns(columns: number | MasonryColumns): number {
  const isFixed = typeof columns === 'number';
  const { base, sm, md, lg } = normalizeColumns(columns);
  const baseColumns = sanitizeColumns(base, 1);
  const [responsive, setResponsive] = useState(baseColumns);

  useEffect(() => {
    if (isFixed || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const compute = () => setResponsive(resolveColumnsFromViewport({ base, sm, md, lg }));

    compute();

    const lists = BREAKPOINTS.map(({ query }) => window.matchMedia(query));

    lists.forEach((list) => list.addEventListener?.('change', compute));

    return () => {
      lists.forEach((list) => list.removeEventListener?.('change', compute));
    };
  }, [base, isFixed, lg, md, sm]);

  return isFixed ? baseColumns : responsive;
}

const useStyles = createStyles((_theme) => ({
  root: {
    width: '100%',
    fontFamily: 'var(--masonry-font-family, inherit)'
  },

  canvas: {
    position: 'relative',
    width: '100%'
  },

  item: {
    position: 'absolute'
  },

  columns: {
    width: '100%'
  },

  itemFallback: {
    display: 'block',
    width: '100%',
    breakInside: 'avoid',
    pageBreakInside: 'avoid'
  }
}));

export type MasonryStylesNames = Selectors<typeof useStyles>;

export interface MasonryProps extends DefaultProps<MasonryStylesNames> {
  /** Fixed column count or responsive breakpoint map (base/sm/md/lg). */
  columns?: number | MasonryColumns;
  /** Space between items in pixels. */
  gap?: number;
  children: React.ReactNode;
  ariaLabel?: string;
}

const defaultProps: Partial<MasonryProps> = {
  columns: 3,
  gap: 16,
  ariaLabel: 'Masonry'
};

/**
 * Masonry layout. When item heights can be measured (browser with
 * `ResizeObserver`), items are positioned absolutely in the shortest column.
 * Server rendering and layouts without measurable heights fall back to CSS
 * multi-columns, which keeps the markup useful without JavaScript layout.
 */
const _Masonry = forwardRef<HTMLDivElement, MasonryProps>((props, ref) => {
  const { columns, gap, children, ariaLabel, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'masonry', classNames, styles, unstyled });
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const columnsCount = useMasonryColumns(columns);
  const gapSize = Math.max(0, gap);
  const items = React.Children.toArray(children);
  const count = items.length;
  const [heights, setHeights] = useState<number[]>([]);
  const measured = heights.length > 0 && heights.some((height) => height > 0);
  const layout = useMemo(
    () => computeMasonryLayout(heights, columnsCount, gapSize),
    [heights, columnsCount, gapSize]
  );

  const measure = useCallback(() => {
    const next = itemRefs.current.map((node) => (node ? node.offsetHeight : 0));

    setHeights((current) =>
      current.length === next.length && current.every((value, index) => value === next[index])
        ? current
        : next
    );
  }, []);

  useIsomorphicEffect(() => {
    measure();
  }, [measure, count]);

  useEffect(() => {
    if (!rootRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => measure());

    observer.observe(rootRef.current);
    itemRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [measure, count]);

  const itemWidth = `calc((100% - ${gapSize * (columnsCount - 1)}px) / ${columnsCount})`;

  return (
    <div
      {...others}
      ref={mergedRef}
      role="group"
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      data-masonry-layout={measured ? 'absolute' : 'columns'}
      data-masonry-columns={columnsCount}
      data-masonry-gap={gapSize}
    >
      {measured ? (
        <div className={cx(classes.canvas)} style={{ height: layout.height }}>
          {items.map((child, index) => {
            const position = layout.positions[index] ?? { column: 0, top: 0 };

            return (
              <div
                key={index}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className={cx(classes.item)}
                data-masonry-item
                data-masonry-column={position.column}
                style={{
                  top: position.top,
                  width: itemWidth,
                  left: `calc(${position.column} * ((100% + ${gapSize}px) / ${columnsCount}))`
                }}
              >
                {child}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={cx(classes.columns)}
          style={{ columnCount: columnsCount, columnGap: gapSize }}
        >
          {items.map((child, index) => (
            <div
              key={index}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className={cx(classes.itemFallback)}
              data-masonry-item
              style={{ marginBottom: gapSize }}
            >
              {child}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

_Masonry.displayName = 'Masonry';

export { _Masonry as Masonry };
