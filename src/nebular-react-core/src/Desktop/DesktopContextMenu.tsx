import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStyles } from './Desktop.styles';
import type { DesktopStyleProps } from './Desktop.types';

export type DesktopContextMenuEntry =
  | {
      type: 'item';
      key: string;
      label: string;
      icon?: React.ReactNode;
      danger?: boolean;
      onSelect(): void;
    }
  | { type: 'separator'; key: string }
  | { type: 'label'; key: string; label: string };

export interface DesktopContextMenuProps extends DesktopStyleProps {
  x: number;
  y: number;
  bounds: { width: number; height: number };
  label: string;
  entries: DesktopContextMenuEntry[];
  onClose(): void;
}

export function DesktopContextMenu({
  x,
  y,
  bounds,
  label,
  entries,
  onClose,
  classNames,
  styles,
  unstyled
}: DesktopContextMenuProps) {
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-context-menu',
    classNames,
    styles,
    unstyled
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const element = menuRef.current;

    if (!element) {
      return;
    }

    const { width, height } = element.getBoundingClientRect();
    setPosition({
      left: Math.max(0, Math.min(x, bounds.width - width)),
      top: Math.max(0, Math.min(y, bounds.height - height))
    });
  }, [x, y, bounds.width, bounds.height]);

  useEffect(() => {
    const first = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    (first ?? menuRef.current)?.focus();
  }, []);

  const focusItem = (offset: number) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

    if (items.length === 0) {
      return;
    }

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex =
      currentIndex === -1 ? 0 : (currentIndex + offset + items.length) % items.length;

    items[nextIndex].focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      items?.[items.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={menuRef}
      className={cx(classes.contextMenu)}
      style={{ left: position.left, top: position.top }}
      role="menu"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onPointerDown={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      {entries.map((entry) => {
        if (entry.type === 'separator') {
          return (
            <div key={entry.key} className={cx(classes.contextMenuSeparator)} role="separator" />
          );
        }

        if (entry.type === 'label') {
          return (
            <div key={entry.key} className={cx(classes.contextMenuLabel)} role="presentation">
              {entry.label}
            </div>
          );
        }

        return (
          <button
            key={entry.key}
            type="button"
            role="menuitem"
            className={cx(classes.contextMenuItem, {
              [classes.contextMenuItemDanger]: entry.danger
            })}
            onClick={() => {
              onClose();
              entry.onSelect();
            }}
          >
            {entry.icon && <span aria-hidden="true">{entry.icon}</span>}
            <span>{entry.label}</span>
          </button>
        );
      })}
    </div>
  );
}
