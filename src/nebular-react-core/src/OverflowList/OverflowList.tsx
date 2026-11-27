import React, { useEffect, useId, useRef, useState } from 'react';
import type { Key, ReactNode, Ref } from 'react';
import { useIsomorphicEffect, useMergedRef } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';

const useStyles = createStyles(() => ({
  root: { position: 'relative', minWidth: 0 },
  row: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    columnGap: 'var(--overflow-list-gap, 0.5rem)',
    minWidth: 0
  },
  item: { minWidth: 0 },
  trigger: { fontVariantNumeric: 'tabular-nums', maxInlineSize: '100%' },
  panel: {
    display: 'grid',
    gap: 'var(--overflow-list-gap, 0.5rem)',
    insetBlockStart: 'calc(100% + 0.25rem)',
    insetInlineEnd: 0,
    zIndex: 'var(--overflow-list-z-index, 10)',
    maxInlineSize: 'min(24rem, 100vw)',
    maxBlockSize: 'min(18rem, 50vh)',
    overflow: 'auto',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    background: 'var(--background-basic-color-1, #fff)',
    color: 'var(--text-basic-color, #222b45)',
    borderRadius: 'var(--border-radius, 0.25rem)',
    boxShadow: 'var(--shadow, 0 4px 12px rgb(0 0 0 / 15%))',
    padding: '0.5rem'
  }
}));

export type OverflowListStylesNames = Selectors<typeof useStyles>;

export interface OverflowListLabels {
  more(count: number): string;
  overflow: string;
}

export interface OverflowListProps<Item> extends DefaultProps<OverflowListStylesNames> {
  items: readonly Item[];
  getItemKey(item: Item): Key;
  renderItem(item: Item): ReactNode;
  labels?: Partial<OverflowListLabels>;
  ref?: Ref<HTMLDivElement>;
}

const defaultLabels: OverflowListLabels = {
  more: (count) => `Show ${count} more items`,
  overflow: 'More items'
};
const focusable =
  'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

export function OverflowList<Item>({
  items,
  getItemKey,
  renderItem,
  labels,
  ref,
  className,
  classNames,
  styles,
  unstyled
}: OverflowListProps<Item>) {
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, { name: 'overflow-list', classNames, styles, unstyled });
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const rowRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusAfterLayout = useRef<number | 'trigger' | 'panel' | undefined>(undefined);
  const [count, setCount] = useState(items.length);
  const [opened, setOpened] = useState(false);
  const visible = Math.min(count, items.length);
  const remaining = items.length - visible;
  const showPanel = opened && remaining > 0;
  const panelId = useId();

  useIsomorphicEffect(() => {
    const root = rootRef.current;
    const row = rowRef.current;
    const trigger = triggerRef.current;
    if (!root || !row || !trigger || items.length === 0) return undefined;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-overflow-item]')).filter(
      (node) => node.closest('[data-overflow-root]') === root
    );

    const measure = () => {
      const available = row.getBoundingClientRect().width;
      if (available <= 0) return;
      const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
      const widths = nodes.map((node) => node.getBoundingClientRect().width);
      const fullWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1);
      let next = items.length;
      if (fullWidth > available) {
        let used = trigger.getBoundingClientRect().width;
        next = 0;
        for (const width of widths) {
          used += width + gap;
          if (used > available) break;
          next += 1;
        }
      }
      if (next === visible) return;

      const active = root.ownerDocument.activeElement;
      const focused = nodes.findIndex((node) => node.contains(active));
      if (focused >= 0 && focused < visible !== focused < next) {
        focusAfterLayout.current = focused < next || showPanel ? focused : 'trigger';
      } else if (active === trigger && next === items.length) {
        focusAfterLayout.current = next - 1;
      }
      if (next === items.length) setOpened(false);
      setCount(next);
    };

    const browser = root.ownerDocument.defaultView;
    const observer = browser?.ResizeObserver ? new browser.ResizeObserver(measure) : undefined;
    [row, trigger, ...nodes].forEach((node) => observer?.observe(node));
    browser?.addEventListener('resize', measure);
    measure();
    return () => {
      observer?.disconnect();
      browser?.removeEventListener('resize', measure);
    };
  }, [items, renderItem, visible, showPanel]);

  useIsomorphicEffect(() => {
    const target = focusAfterLayout.current;
    focusAfterLayout.current = undefined;
    if (target === 'trigger') {
      triggerRef.current?.focus();
    } else if (target === 'panel') {
      const panel = panelRef.current;
      (panel?.querySelector<HTMLElement>(focusable) ?? panel)?.focus();
    } else if (target !== undefined) {
      rootRef.current
        ?.querySelector<HTMLElement>(`[data-overflow-item="${target}"]`)
        ?.querySelector<HTMLElement>(focusable)
        ?.focus();
    }
  }, [visible, showPanel]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !showPanel) return undefined;
    const closeFromOutside = (event: PointerEvent) => {
      if (!root.contains(event.target as Node)) setOpened(false);
    };
    root.ownerDocument.addEventListener('pointerdown', closeFromOutside);
    return () => root.ownerDocument.removeEventListener('pointerdown', closeFromOutside);
  }, [showPanel]);

  const render = (item: Item, index: number) => (
    <div
      key={getItemKey(item)}
      data-overflow-item={index}
      className={classes.item}
      style={{ flex: 'none', width: 'max-content' }}
    >
      {renderItem(item)}
    </div>
  );

  return (
    <div
      ref={mergedRef}
      data-overflow-root=""
      className={cx(classes.root, className)}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
          setOpened(false);
      }}
      onKeyDown={(event) => {
        if (showPanel && !event.defaultPrevented && event.key === 'Escape') {
          event.stopPropagation();
          event.preventDefault();
          setOpened(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <div ref={rowRef} data-overflow-row="" className={classes.row}>
        {items.slice(0, visible).map(render)}
        <span
          aria-hidden={remaining === 0 || undefined}
          inert={remaining === 0 || undefined}
          style={remaining === 0 ? { position: 'absolute', visibility: 'hidden' } : undefined}
        >
          <Button
            ref={triggerRef}
            type="button"
            size="small"
            appearance="outline"
            className={classes.trigger}
            style={{ minInlineSize: `${String(items.length).length + 3}ch` }}
            aria-label={text.more(remaining)}
            aria-expanded={showPanel}
            aria-controls={panelId}
            onClick={() => {
              if (!showPanel) focusAfterLayout.current = 'panel';
              setOpened(!showPanel);
            }}
          >
            +{remaining}
          </Button>
        </span>
      </div>
      <div
        id={panelId}
        ref={panelRef}
        className={classes.panel}
        role="group"
        aria-label={text.overflow}
        aria-hidden={!showPanel || undefined}
        inert={!showPanel || undefined}
        tabIndex={-1}
        style={
          showPanel
            ? { position: 'absolute' }
            : {
                position: 'absolute',
                width: 0,
                height: 0,
                padding: 0,
                border: 0,
                visibility: 'hidden',
                overflow: 'hidden'
              }
        }
      >
        {items.slice(visible).map((item, index) => render(item, visible + index))}
      </div>
    </div>
  );
}
