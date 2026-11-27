import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useStyles } from './Desktop.styles';
import type {
  DesktopApp,
  DesktopAppGroup,
  DesktopLabels,
  DesktopStyleProps,
  DesktopTaskbarPosition
} from './Desktop.types';

export interface DesktopStartMenuProps extends DesktopStyleProps {
  apps: DesktopApp[];
  groups?: DesktopAppGroup[];
  compact?: boolean;
  labels: DesktopLabels;
  taskbarPosition: DesktopTaskbarPosition;
  searchable: boolean;
  recentAppIds: string[];
  onOpenApp(app: DesktopApp): void;
  onClose(): void;
}

function resolveGroupPath(groups: DesktopAppGroup[], path: string[]): DesktopAppGroup[] {
  const resolved: DesktopAppGroup[] = [];
  let level = groups;

  for (const id of path) {
    const group = level.find((entry) => entry.id === id);

    if (!group) {
      break;
    }

    resolved.push(group);
    level = group.groups ?? [];
  }

  return resolved;
}

function collectAppsByGroup(apps: DesktopApp[]): Map<string, DesktopApp[]> {
  const result = new Map<string, DesktopApp[]>();

  apps.forEach((app) => {
    if (!app.groupId) {
      return;
    }

    const list = result.get(app.groupId) ?? [];
    list.push(app);
    result.set(app.groupId, list);
  });

  return result;
}

function groupHasApps(group: DesktopAppGroup, appsByGroup: Map<string, DesktopApp[]>): boolean {
  if ((appsByGroup.get(group.id)?.length ?? 0) > 0) {
    return true;
  }

  return (group.groups ?? []).some((child) => groupHasApps(child, appsByGroup));
}

export function DesktopStartMenu({
  apps,
  groups,
  compact = false,
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
  const pendingFocusRef = useRef<(() => void) | null>(null);
  const [query, setQuery] = useState('');
  const [activePath, setActivePath] = useState<string[]>([]);
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

  const grouped = !compact && (groups?.length ?? 0) > 0;
  const groupedActive = grouped && !query;

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return apps;
    }

    return apps.filter((app) => app.title.toLowerCase().includes(normalized));
  }, [apps, query]);

  const appsByGroup = useMemo(
    () => (grouped ? collectAppsByGroup(filteredApps) : new Map<string, DesktopApp[]>()),
    [filteredApps, grouped]
  );

  const activeGroups = useMemo(
    () => (groupedActive ? resolveGroupPath(groups ?? [], activePath) : []),
    [activePath, groupedActive, groups]
  );

  const knownGroupIds = useMemo(() => {
    const ids = new Set<string>();
    const walk = (list?: DesktopAppGroup[]) => {
      list?.forEach((group) => {
        ids.add(group.id);
        walk(group.groups);
      });
    };

    walk(groups);

    return ids;
  }, [groups]);

  const visibleGroups = (list: DesktopAppGroup[] | undefined) =>
    (list ?? []).filter((group) => groupHasApps(group, appsByGroup));

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
  const rootApps = groupedActive
    ? otherApps.filter((app) => !app.groupId || !knownGroupIds.has(app.groupId))
    : otherApps;

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

  useEffect(() => {
    const focus = pendingFocusRef.current;

    if (!focus) {
      return;
    }

    pendingFocusRef.current = null;
    focus();
  }, [activePath]);

  const focusInColumn = (column: number) => {
    const target = containerRef.current?.querySelector<HTMLElement>(
      `[data-start-column="${column}"] [role="menuitem"]`
    );

    target?.focus();
  };

  const focusGroupTrigger = (column: number, groupId: string) => {
    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>(
        `[data-start-column="${column}"] [data-start-group]`
      ) ?? []
    );

    items.find((item) => item.dataset.startGroup === groupId)?.focus();
  };

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

      if (activeGroups.length > 0) {
        const closing = activeGroups[activeGroups.length - 1];
        const column = activeGroups.length - 1;

        pendingFocusRef.current = () => focusGroupTrigger(column, closing.id);
        setActivePath(activePath.slice(0, column));
        return;
      }

      onClose();
      return;
    }

    if (event.key === 'ArrowLeft') {
      const focused = document.activeElement as HTMLElement | null;
      const depth = focused?.dataset.startDepth ? Number(focused.dataset.startDepth) : 0;

      if (depth > 0 && activeGroups[depth - 1]) {
        event.preventDefault();

        const closing = activeGroups[depth - 1];

        pendingFocusRef.current = () => focusGroupTrigger(depth - 1, closing.id);
        setActivePath(activePath.slice(0, depth - 1));
        return;
      }
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

  const activateGroup = (parentPath: string[], group: DesktopAppGroup, depth: number) => {
    setActivePath([...parentPath, group.id]);
    pendingFocusRef.current = () => focusInColumn(depth + 1);
  };

  const renderApp = (app: DesktopApp, depth = 0) => (
    <button
      key={app.id}
      type="button"
      role="menuitem"
      data-start-depth={depth}
      className={cx(classes.startMenuItem)}
      aria-label={labels.openApp(app.title)}
      title={labels.openApp(app.title)}
      onMouseEnter={() => setActivePath(activePath.slice(0, depth))}
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

  const renderGroup = (group: DesktopAppGroup, parentPath: string[], depth: number) => {
    const open = activeGroups[depth]?.id === group.id;
    const columnId = `desktop-start-menu-${group.id}`;

    return (
      <button
        key={group.id}
        type="button"
        role="menuitem"
        data-start-depth={depth}
        data-start-group={group.id}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? columnId : undefined}
        className={cx(
          classes.startMenuItem,
          classes.startMenuGroupItem,
          open && classes.startMenuGroupItemOpen
        )}
        onMouseEnter={() => setActivePath([...parentPath, group.id])}
        onClick={() => setActivePath([...parentPath, group.id])}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            event.stopPropagation();
            activateGroup(parentPath, group, depth);
          }
        }}
      >
        {group.icon && (
          <span className={cx(classes.taskbarIcon)} aria-hidden="true">
            {group.icon}
          </span>
        )}
        <span className={cx(classes.startMenuLabel)}>{group.title}</span>
        <span className={cx(classes.startMenuGroupChevron)} aria-hidden="true" />
      </button>
    );
  };

  const renderFlatMenu = () => (
    <div role="menu" aria-label={labels.apps}>
      {pinnedApps.length > 0 && (
        <div role="group" aria-label={labels.pinned}>
          <div className={cx(classes.startMenuSection)} aria-hidden="true">
            {labels.pinned}
          </div>
          {pinnedApps.map((app) => renderApp(app))}
        </div>
      )}
      {recentApps.length > 0 && (
        <div role="group" aria-label={labels.recent}>
          <div className={cx(classes.startMenuSection)} aria-hidden="true">
            {labels.recent}
          </div>
          {recentApps.map((app) => renderApp(app))}
        </div>
      )}
      {otherApps.length > 0 &&
        (pinnedApps.length > 0 || recentApps.length > 0 ? (
          <div role="group" aria-label={labels.allApps}>
            <div className={cx(classes.startMenuSection)} aria-hidden="true">
              {labels.allApps}
            </div>
            {otherApps.map((app) => renderApp(app))}
          </div>
        ) : (
          otherApps.map((app) => renderApp(app))
        ))}
    </div>
  );

  const renderGroupedMenu = () => (
    <div role="menu" aria-label={labels.apps} className={cx(classes.startMenuColumns)}>
      <div className={cx(classes.startMenuColumn)} data-start-column={0}>
        {pinnedApps.length > 0 && (
          <div role="group" aria-label={labels.pinned}>
            <div className={cx(classes.startMenuSection)} aria-hidden="true">
              {labels.pinned}
            </div>
            {pinnedApps.map((app) => renderApp(app, 0))}
          </div>
        )}
        {recentApps.length > 0 && (
          <div role="group" aria-label={labels.recent}>
            <div className={cx(classes.startMenuSection)} aria-hidden="true">
              {labels.recent}
            </div>
            {recentApps.map((app) => renderApp(app, 0))}
          </div>
        )}
        {rootApps.map((app) => renderApp(app, 0))}
        {visibleGroups(groups).map((group) => renderGroup(group, [], 0))}
      </div>
      {activeGroups.map((group, index) => {
        const parentPath = activeGroups.slice(0, index + 1).map((entry) => entry.id);
        const appsInGroup = appsByGroup.get(group.id) ?? [];

        return (
          <div
            key={group.id}
            id={`desktop-start-menu-${group.id}`}
            role="group"
            aria-label={group.title}
            className={cx(classes.startMenuColumn)}
            data-start-column={index + 1}
          >
            <div className={cx(classes.startMenuSection)} aria-hidden="true">
              {group.title}
            </div>
            {visibleGroups(group.groups).map((child) => renderGroup(child, parentPath, index + 1))}
            {appsInGroup.map((app) => renderApp(app, index + 1))}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cx(classes.startMenu, positionClass, groupedActive && classes.startMenuGrouped)}
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
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setActivePath([]);
            }}
          />
        </div>
      )}
      {filteredApps.length === 0 ? (
        <div className={cx(classes.startMenuEmpty)}>
          {apps.length === 0 ? labels.noApps : labels.noResults}
        </div>
      ) : groupedActive ? (
        renderGroupedMenu()
      ) : (
        renderFlatMenu()
      )}
    </div>
  );
}
