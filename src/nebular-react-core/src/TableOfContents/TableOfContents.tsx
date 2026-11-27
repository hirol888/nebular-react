import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Anchor, AnchorProps } from '../Anchor';

export interface TableOfContentsItem {
  id: string;
  label: React.ReactNode;
  depth?: number;
}

export interface TableOfContentsProps extends Omit<
  AnchorProps,
  'items' | 'activeKey' | 'getScrollContainer'
> {
  items: readonly TableOfContentsItem[];
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>((props, ref) => {
  const {
    items,
    scrollContainerRef,
    offset = 0,
    ariaLabel = 'Table of contents',
    onActiveChange,
    ...anchorProps
  } = props;
  const [active, setActive] = useState('');
  const current = useRef('');
  const activate = useCallback(
    (id: string) => {
      if (current.current !== id) {
        current.current = id;
        setActive(id);
        onActiveChange?.(id);
      }
    },
    [onActiveChange]
  );

  useEffect(() => {
    const scrollElement = scrollContainerRef?.current;
    if (scrollContainerRef && !scrollElement) {
      return;
    }
    const ownerDocument = scrollElement?.ownerDocument ?? document;
    const view = ownerDocument.defaultView;
    if (!view) {
      return;
    }
    const scrollTarget = scrollElement ?? view;

    const update = () => {
      const viewport = scrollElement?.getBoundingClientRect();
      const top = (viewport?.top ?? 0) + (scrollElement?.clientTop ?? 0);
      const bottom = top + (scrollElement?.clientHeight || viewport?.height || view.innerHeight);
      const activationLine = Math.min(top + offset, bottom);
      let above: { id: string; top: number } | undefined;
      let visible: { id: string; top: number } | undefined;

      for (const item of items) {
        const heading = ownerDocument.getElementById(item.id);
        const bounds =
          heading && (!scrollElement || scrollElement.contains(heading))
            ? heading.getBoundingClientRect()
            : undefined;
        if (bounds && bounds.height > 0) {
          if (bounds.top <= activationLine && (!above || bounds.top >= above.top)) {
            above = { id: item.id, top: bounds.top };
          } else if (
            bounds.top < bottom &&
            bounds.bottom > top &&
            (!visible || bounds.top < visible.top)
          ) {
            visible = { id: item.id, top: bounds.top };
          }
        }
      }
      activate(above?.id ?? visible?.id ?? '');
    };

    update();
    scrollTarget.addEventListener('scroll', update, { passive: true });
    view.addEventListener('resize', update);
    return () => {
      scrollTarget.removeEventListener('scroll', update);
      view.removeEventListener('resize', update);
    };
  }, [activate, items, offset, scrollContainerRef]);

  return (
    <Anchor
      {...anchorProps}
      ref={ref}
      ariaLabel={ariaLabel}
      items={items.map(({ id, label, depth }) => ({
        key: id,
        href: `#${encodeURIComponent(id)}`,
        label,
        depth
      }))}
      activeKey={active}
      onActiveChange={activate}
      offset={offset}
      getScrollContainer={scrollContainerRef ? () => scrollContainerRef.current : undefined}
    />
  );
});

TableOfContents.displayName = 'TableOfContents';
