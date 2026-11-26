import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';

export interface WindowBreadcrumbItem {
  key?: React.Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?(event: MouseEvent<HTMLElement>): void;
  href?: string;
  current?: boolean;
}

export interface WindowBreadcrumbLabels {
  /** Accessible name of the trigger that reveals collapsed items. */
  more: string;
  /** Accessible name of the popover that contains the collapsed items. */
  hiddenItems: string;
}

export interface WindowBreadcrumbProps
  extends DefaultProps<WindowBreadcrumbStylesNames>, React.ComponentPropsWithoutRef<'nav'> {
  items: WindowBreadcrumbItem[];
  /** Slot rendered before the breadcrumb trail, usually back/forward controls. */
  leading?: React.ReactNode;
  /** Slot rendered after the breadcrumb trail, usually search or actions. */
  trailing?: React.ReactNode;
  /** Maximum number of visible trail entries, including the overflow trigger. */
  maxItems?: number;
  /** Collapses middle items into an accessible popover. Defaults to true. */
  collapse?: boolean;
  separator?: React.ReactNode;
  ariaLabel?: string;
  labels?: Partial<WindowBreadcrumbLabels>;
  onItemClick?(item: WindowBreadcrumbItem, index: number): void;
}

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--window-breadcrumb-gap, 0.375rem)',
    boxSizing: 'border-box',
    minWidth: 0,
    height: 'var(--window-breadcrumb-height, 2rem)',
    paddingInline: 'var(--window-breadcrumb-padding-inline, 0.375rem)',
    background: 'var(--window-breadcrumb-background-color, transparent)',
    color: 'var(--window-breadcrumb-text-color, var(--text-hint-color, #8f9bb3))',
    fontFamily: 'var(--window-breadcrumb-font-family, inherit)',
    fontSize: 'var(--window-breadcrumb-font-size, 0.8rem)',
    lineHeight: 1.25
  },

  leading: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 0 auto',
    gap: 'var(--window-breadcrumb-slot-gap, 0.25rem)',
    minWidth: 0
  },

  list: {
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 auto',
    flexWrap: 'nowrap',
    gap: 'var(--window-breadcrumb-item-gap, 0.15rem)',
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    overflowX: 'auto',
    overflowY: 'hidden',
    scrollbarWidth: 'thin'
  },

  listCollapsed: {
    overflowX: 'visible',
    overflowY: 'visible'
  },

  item: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 0 auto',
    gap: 'var(--window-breadcrumb-item-gap, 0.15rem)',
    minWidth: 0
  },

  control: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--window-breadcrumb-control-gap, 0.3rem)',
    boxSizing: 'border-box',
    maxWidth: 'var(--window-breadcrumb-item-max-width, 14rem)',
    minWidth: 0,
    margin: 0,
    padding: 'var(--window-breadcrumb-item-padding, 0.15rem 0.3rem)',
    border: 0,
    borderRadius: 'var(--window-breadcrumb-item-radius, 0.25rem)',
    background: 'transparent',
    color: 'var(--window-breadcrumb-link-color, var(--text-hint-color, #8f9bb3))',
    font: 'inherit',
    lineHeight: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background-color 120ms ease, color 120ms ease',

    '&:hover': {
      background:
        'var(--window-breadcrumb-hover-background-color, var(--background-basic-color-2, #f7f9fc))',
      color: 'var(--window-breadcrumb-hover-color, var(--text-basic-color, #222b45))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--window-breadcrumb-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    },

    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none'
    }
  },

  current: {
    color: 'var(--window-breadcrumb-current-color, var(--text-basic-color, #222b45))',
    fontWeight: 600
  },

  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 0 auto',
    fontSize: 'var(--window-breadcrumb-icon-size, 1em)',
    lineHeight: 1
  },

  label: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  separator: {
    flex: '0 0 auto',
    color: 'var(--window-breadcrumb-separator-color, var(--text-hint-color, #8f9bb3))',
    opacity: 0.7,
    userSelect: 'none'
  },

  trailing: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 0 auto',
    gap: 'var(--window-breadcrumb-slot-gap, 0.25rem)',
    marginInlineStart: 'auto',
    minWidth: 0
  },

  moreItem: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 0 auto',
    gap: 'var(--window-breadcrumb-item-gap, 0.15rem)'
  },

  more: {
    justifyContent: 'center',
    minWidth: 'var(--window-breadcrumb-more-min-width, 1.25rem)',
    paddingInline: 'var(--window-breadcrumb-more-padding-inline, 0.35rem)',
    fontWeight: 600,
    letterSpacing: '0.04em'
  },

  menu: {
    position: 'absolute',
    insetBlockStart: 'calc(100% + var(--window-breadcrumb-menu-offset, 0.3rem))',
    insetInlineStart: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--window-breadcrumb-menu-gap, 0.1rem)',
    minWidth: 'var(--window-breadcrumb-menu-min-width, 10rem)',
    maxWidth: 'var(--window-breadcrumb-menu-max-width, 20rem)',
    maxHeight: 'var(--window-breadcrumb-menu-max-height, 16rem)',
    boxSizing: 'border-box',
    padding: 'var(--window-breadcrumb-menu-padding, 0.25rem)',
    overflowY: 'auto',
    border:
      '1px solid var(--window-breadcrumb-menu-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--window-breadcrumb-menu-radius, 0.375rem)',
    background:
      'var(--window-breadcrumb-menu-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--window-breadcrumb-menu-shadow, 0 6px 18px rgb(0 0 0 / 14%))'
  },

  menuItem: {
    width: '100%',
    maxWidth: 'none',
    justifyContent: 'flex-start',
    padding: 'var(--window-breadcrumb-menu-item-padding, 0.35rem 0.45rem)',
    fontSize: 'var(--window-breadcrumb-menu-font-size, 0.8rem)',
    textAlign: 'start'
  }
}));

export type WindowBreadcrumbStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<WindowBreadcrumbProps> = {
  maxItems: 5,
  collapse: true,
  separator: '›'
};

const fallbackLabels: WindowBreadcrumbLabels = {
  more: 'Show hidden breadcrumb items',
  hiddenItems: 'Hidden breadcrumb items'
};

export const WindowBreadcrumb = forwardRef<HTMLElement, WindowBreadcrumbProps>((props, ref) => {
  const {
    items,
    leading,
    trailing,
    maxItems,
    collapse,
    separator,
    ariaLabel,
    labels: labelsProp,
    onItemClick,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': ariaLabelProp,
    onBlur,
    onKeyDown,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'window-breadcrumb',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const labels: WindowBreadcrumbLabels = {
    more: t('windowBreadcrumb.more', fallbackLabels.more),
    hiddenItems: t('windowBreadcrumb.hiddenItems', fallbackLabels.hiddenItems),
    ...labelsProp
  };
  const resolvedAriaLabel =
    ariaLabel ?? ariaLabelProp ?? t('windowBreadcrumb.navigation', 'Breadcrumb');
  const rootRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [opened, setOpened] = useState(false);

  const limit = Math.max(3, Math.floor(maxItems));
  const collapsed = Boolean(collapse) && items.length > limit;
  const lastCount = limit - 2;
  const tailStart = items.length - lastCount;
  const hiddenItems = collapsed ? items.slice(1, tailStart) : [];
  const tailItems = collapsed ? items.slice(tailStart) : [];
  const explicitCurrent = items.some((item) => item.current);

  useEffect(() => {
    if (!opened) {
      return;
    }

    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [opened]);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }

    const doc = rootRef.current?.ownerDocument;
    const closeFromOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpened(false);
      }
    };

    doc?.addEventListener('pointerdown', closeFromOutside);

    return () => doc?.removeEventListener('pointerdown', closeFromOutside);
  }, [opened]);

  const isCurrent = (item: WindowBreadcrumbItem, index: number) =>
    item.current ?? (!explicitCurrent && index === items.length - 1);

  const handleItemClick = (
    event: MouseEvent<HTMLElement>,
    item: WindowBreadcrumbItem,
    index: number,
    fromMenu: boolean
  ) => {
    item.onClick?.(event);
    onItemClick?.(item, index);

    if (fromMenu) {
      setOpened(false);
      triggerRef.current?.focus();
    }
  };

  const renderControl = (item: WindowBreadcrumbItem, index: number, inMenu: boolean) => {
    const current = isCurrent(item, index);
    const controlClassName = cx(classes.control, {
      [classes.current]: current,
      [classes.menuItem]: inMenu
    });
    const content = (
      <>
        {item.icon != null && (
          <span className={cx(classes.icon)} aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className={cx(classes.label)}>{item.label}</span>
      </>
    );
    const handleClick = (event: MouseEvent<HTMLElement>) =>
      handleItemClick(event, item, index, inMenu);

    if (item.href) {
      return (
        <a
          href={item.href}
          className={controlClassName}
          role={inMenu ? 'menuitem' : undefined}
          aria-current={current ? 'page' : undefined}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        type="button"
        className={controlClassName}
        role={inMenu ? 'menuitem' : undefined}
        aria-current={current ? 'page' : undefined}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  };

  const renderSeparator = () => (
    <span className={cx(classes.separator)} aria-hidden="true">
      {separator}
    </span>
  );

  const renderItem = (item: WindowBreadcrumbItem, index: number, withSeparator: boolean) => (
    <li key={item.key ?? index} className={cx(classes.item)}>
      {renderControl(item, index, false)}
      {withSeparator && renderSeparator()}
    </li>
  );

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') {
      setOpened(false);
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }

    const nodes = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

    if (nodes.length === 0) {
      return;
    }

    event.preventDefault();
    const active = menuRef.current?.ownerDocument.activeElement;
    const activeIndex = active instanceof HTMLElement ? nodes.indexOf(active) : -1;
    let nextIndex = 0;

    if (event.key === 'End') {
      nextIndex = nodes.length - 1;
    } else if (event.key === 'ArrowDown') {
      nextIndex = (activeIndex + 1) % nodes.length;
    } else if (event.key === 'ArrowUp') {
      nextIndex = activeIndex <= 0 ? nodes.length - 1 : activeIndex - 1;
    }

    nodes[nextIndex]?.focus();
  };

  return (
    <nav
      {...others}
      ref={mergedRef}
      aria-label={resolvedAriaLabel}
      className={cx(classes.root, className)}
      onBlur={(event) => {
        onBlur?.(event);

        if (opened && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpened(false);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (opened && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          setOpened(false);
          triggerRef.current?.focus();
        }
      }}
    >
      {leading != null && <div className={cx(classes.leading)}>{leading}</div>}
      <ol className={cx(classes.list, { [classes.listCollapsed]: collapsed })}>
        {collapsed && items.length > 0
          ? [
              renderItem(items[0], 0, true),
              <li key="__window-breadcrumb-more" className={cx(classes.moreItem)}>
                <button
                  ref={triggerRef}
                  type="button"
                  className={cx(classes.control, classes.more)}
                  aria-label={labels.more}
                  aria-haspopup="menu"
                  aria-expanded={opened}
                  aria-controls={opened ? menuId : undefined}
                  onClick={() => setOpened((previous) => !previous)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setOpened(true);
                    }
                  }}
                >
                  <span aria-hidden="true">…</span>
                </button>
                {opened && (
                  <div
                    ref={menuRef}
                    id={menuId}
                    role="menu"
                    aria-label={labels.hiddenItems}
                    className={cx(classes.menu)}
                    tabIndex={-1}
                    onKeyDown={handleMenuKeyDown}
                  >
                    {hiddenItems.map((item, offset) => {
                      const index = offset + 1;

                      return (
                        <React.Fragment key={item.key ?? index}>
                          {renderControl(item, index, true)}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
                {renderSeparator()}
              </li>,
              ...tailItems.map((item, offset) => {
                const index = tailStart + offset;

                return renderItem(item, index, index < items.length - 1);
              })
            ]
          : items.map((item, index) => renderItem(item, index, index < items.length - 1))}
      </ol>
      {trailing != null && <div className={cx(classes.trailing)}>{trailing}</div>}
    </nav>
  );
});

WindowBreadcrumb.displayName = 'WindowBreadcrumb';
