import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useStyles } from './Desktop.styles';
import type {
  DesktopApp,
  DesktopLabels,
  DesktopStyleProps,
  DesktopTaskbarPosition
} from './Desktop.types';

export interface DesktopStartMenuProps extends DesktopStyleProps {
  apps: DesktopApp[];
  labels: DesktopLabels;
  taskbarPosition: DesktopTaskbarPosition;
  searchable: boolean;
  recentAppIds: string[];
  onOpenApp(app: DesktopApp): void;
  onClose(): void;
}

export function DesktopStartMenu({
  apps,
  labels,
  taskbarPosition,
  searchable,
  recentAppIds,
  onOpenApp,
  onClose,
  classNames,
  styles,
  unstyled
}: DesktopStartMenuProps) {
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-start-menu',
    classNames,
    styles,
    unstyled
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [viewport, setViewport] = useState<{
    maxHeight?: number;
    maxWidth?: number;
  }>({});

  const positionClass = {
    bottom: classes.startMenuBottom,
    top: classes.startMenuTop,
    left: classes.startMenuLeft,
    right: classes.startMenuRight
  }[taskbarPosition];

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return apps;
    }

    return apps.filter((app) => app.title.toLowerCase().includes(normalized));
  }, [apps, query]);

  const pinnedApps = query ? [] : filteredApps.filter((app) => app.pinned);
  const recentApps = query
    ? []
    : recentAppIds
        .map((id) => filteredApps.find((app) => app.id === id))
        .filter((app): app is DesktopApp => !!app && !app.pinned);
  const recentSet = new Set(recentApps.map((app) => app.id));
  const otherApps = query
    ? filteredApps
    : filteredApps.filter((app) => !app.pinned && !recentSet.has(app.id));

  useLayoutEffect(() => {
    const menu = containerRef.current;
    const root = menu?.closest<HTMLElement>('[data-taskbar-position]');
    const launcher = menu?.parentElement;

    if (!menu || !root || !launcher) {
      return undefined;
    }

    const update = () => {
      const rootRect = root.getBoundingClientRect();
      const launcherRect = launcher.getBoundingClientRect();
      let availableHeight = rootRect.height - 8;

      if (taskbarPosition === 'bottom') {
        availableHeight = launcherRect.top - rootRect.top - 8;
      } else if (taskbarPosition === 'top') {
        availableHeight = rootRect.bottom - launcherRect.bottom - 8;
      }

      setViewport({
        maxHeight: availableHeight > 120 ? availableHeight : undefined,
        maxWidth: rootRect.width > 180 ? rootRect.width - 8 : undefined
      });
    };

    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, [taskbarPosition]);

  useEffect(() => {
    const input = containerRef.current?.querySelector<HTMLInputElement>('input[type="search"]');
    const firstItem = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');

    (input ?? firstItem ?? containerRef.current)?.focus();
  }, []);

  const focusItem = (offset: number) => {
    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
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
      return;
    }

    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      const first = containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      if (first) {
        event.preventDefault();
        first.click();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const items = containerRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      items?.[items.length - 1]?.focus();
    }
  };

  const renderApp = (app: DesktopApp) => (
    <button
      key={app.id}
      type="button"
      role="menuitem"
      className={cx(classes.startMenuItem)}
      aria-label={labels.openApp(app.title)}
      title={labels.openApp(app.title)}
      onClick={() => onOpenApp(app)}
    >
      {app.icon && (
        <span className={cx(classes.taskbarIcon)} aria-hidden="true">
          {app.icon}
        </span>
      )}
      <span className={cx(classes.startMenuLabel)}>{app.title}</span>
    </button>
  );

  return (
    <div
      ref={containerRef}
      className={cx(classes.startMenu, positionClass)}
      style={viewport}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {searchable && (
        <div className={cx(classes.startMenuSearch)}>
          <input
            type="search"
            className={cx(classes.startMenuSearchInput)}
            value={query}
            placeholder={labels.searchApps}
            aria-label={labels.searchApps}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        </div>
      )}
      {filteredApps.length === 0 ? (
        <div className={cx(classes.startMenuEmpty)}>
          {apps.length === 0 ? labels.noApps : labels.noResults}
        </div>
      ) : (
        <div role="menu" aria-label={labels.apps}>
          {pinnedApps.length > 0 && (
            <div role="group" aria-label={labels.pinned}>
              <div className={cx(classes.startMenuSection)} aria-hidden="true">
                {labels.pinned}
              </div>
              {pinnedApps.map(renderApp)}
            </div>
          )}
          {recentApps.length > 0 && (
            <div role="group" aria-label={labels.recent}>
              <div className={cx(classes.startMenuSection)} aria-hidden="true">
                {labels.recent}
              </div>
              {recentApps.map(renderApp)}
            </div>
          )}
          {otherApps.length > 0 &&
            (pinnedApps.length > 0 || recentApps.length > 0 ? (
              <div role="group" aria-label={labels.allApps}>
                <div className={cx(classes.startMenuSection)} aria-hidden="true">
                  {labels.allApps}
                </div>
                {otherApps.map(renderApp)}
              </div>
            ) : (
              otherApps.map(renderApp)
            ))}
        </div>
      )}
    </div>
  );
}
