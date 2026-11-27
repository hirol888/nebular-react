import React, { useMemo, useRef, useState } from 'react';
import { useStyles } from './Desktop.styles';
import { useLongPress } from './Desktop.gestures';
import type {
  DesktopApp,
  DesktopLabels,
  DesktopStyleProps,
  DesktopTaskbarPosition,
  DesktopWindowState,
  DesktopWorkspace
} from './Desktop.types';
import { getWindowKey, isInWorkspace, windowTitleText } from './Desktop.utils';
import { DesktopStartMenu } from './DesktopStartMenu';
import { Icon } from '../Icon';
import { NotificationCenter } from '../NotificationCenter';
import type { NotificationItem } from '../NotificationCenter';

export interface DesktopTaskbarGroup {
  key: string;
  appId?: string;
  title: string;
  icon?: React.ReactNode;
  preview?: React.ReactNode;
  windows: DesktopWindowState[];
  active: boolean;
  minimized: boolean;
}

export interface DesktopTaskbarProps extends DesktopStyleProps {
  apps: DesktopApp[];
  windows: DesktopWindowState[];
  activeWorkspace?: string;
  workspaces: DesktopWorkspace[];
  labels: DesktopLabels;
  taskbarPosition: DesktopTaskbarPosition;
  compact: boolean;
  showClock: boolean;
  clockValue: React.ReactNode;
  systemTray?: React.ReactNode;
  taskbarActions?: React.ReactNode;
  showLauncher: boolean;
  launcherOpen: boolean;
  startButtonRef: React.RefObject<HTMLButtonElement | null>;
  launcherRef: React.RefObject<HTMLDivElement | null>;
  recentAppIds: string[];
  onToggleLauncher(): void;
  onCloseLauncher(): void;
  onOpenApp(appId: string): void;
  groupTaskbar: boolean;
  maxTaskbarItems?: number;
  activeWindowId?: string;
  showWorkspaceSwitcher: boolean;
  onSwitchWorkspace(workspaceId: string): void;
  onGroupClick(group: DesktopTaskbarGroup): void;
  onGroupContextMenu(
    group: DesktopTaskbarGroup,
    event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>
  ): void;
  onGroupMenu(group: DesktopTaskbarGroup, event: React.MouseEvent<HTMLElement>): void;
  onOverflowMenu(groups: DesktopTaskbarGroup[], event: React.MouseEvent<HTMLElement>): void;
  startMenuSearch: boolean;
  showOverview: boolean;
  overviewOpen: boolean;
  onToggleOverview(): void;
  notifications?: NotificationItem[];
  /** When provided, the clock becomes a button that opens the calendar flyout. */
  onClockClick?(rect: DOMRect): void;
  clockExpanded?: boolean;
}

export function DesktopTaskbar({
  apps,
  windows,
  activeWorkspace,
  workspaces,
  labels,
  taskbarPosition,
  compact,
  showClock,
  clockValue,
  systemTray,
  taskbarActions,
  showLauncher,
  launcherOpen,
  startButtonRef,
  launcherRef,
  recentAppIds,
  onToggleLauncher,
  onCloseLauncher,
  onOpenApp,
  groupTaskbar,
  maxTaskbarItems,
  activeWindowId,
  showWorkspaceSwitcher,
  onSwitchWorkspace,
  onGroupClick,
  onGroupContextMenu,
  onGroupMenu,
  onOverflowMenu,
  startMenuSearch,
  showOverview,
  overviewOpen,
  onToggleOverview,
  notifications,
  onClockClick,
  clockExpanded,
  classNames,
  styles,
  unstyled
}: DesktopTaskbarProps) {
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-taskbar',
    classNames,
    styles,
    unstyled
  });
  const [preview, setPreview] = useState<{
    group: DesktopTaskbarGroup;
    rect: DOMRect;
  } | null>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const taskbarVertical = taskbarPosition === 'left' || taskbarPosition === 'right';
  const appsById = useMemo(() => new Map(apps.map((app) => [app.id, app])), [apps]);

  const groups = useMemo(() => {
    const result: DesktopTaskbarGroup[] = [];

    windows
      .filter(
        (window) => !window.skipTaskbar && !window.modal && isInWorkspace(window, activeWorkspace)
      )
      .forEach((window) => {
        const app = window.appId ? appsById.get(window.appId) : undefined;
        const key = getWindowKey(window, groupTaskbar);
        const existing = result.find((group) => group.key === key);

        if (existing) {
          existing.windows.push(window);
          return;
        }

        result.push({
          key,
          appId: window.appId,
          title: windowTitleText(window, app, labels.window),
          icon: app?.icon ?? window.icon,
          preview: app?.preview,
          windows: [window],
          active: false,
          minimized: false
        });
      });

    return result.map((group) => ({
      ...group,
      active: group.windows.some((window) => window.id === activeWindowId),
      minimized: group.windows.every((window) => window.minimized)
    }));
  }, [windows, activeWorkspace, appsById, groupTaskbar, activeWindowId, labels.window]);

  const visibleGroups =
    maxTaskbarItems === undefined ? groups : groups.slice(0, Math.max(0, maxTaskbarItems));
  const overflowGroups =
    maxTaskbarItems === undefined ? [] : groups.slice(Math.max(0, maxTaskbarItems));
  const groupLongPress = useLongPress({
    delayMs: 550,
    onLongPress: (event) => {
      const target = event.target as HTMLElement | null;
      const key = target?.closest<HTMLElement>('[data-desktop-taskbar-key]')?.dataset
        .desktopTaskbarKey;
      const group = groups.find((candidate) => candidate.key === key);

      if (group) {
        onGroupContextMenu(group, event as React.PointerEvent<HTMLElement>);
      }
    }
  });

  const handleItemsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      itemsRef.current?.querySelectorAll<HTMLElement>('[data-desktop-taskbar-item]') ?? []
    );
    const currentIndex = buttons.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) {
      return;
    }

    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % buttons.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = buttons.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      buttons[nextIndex].focus();
    }
  };

  return (
    <div
      className={cx(classes.taskbar, { [classes.taskbarVertical]: taskbarVertical })}
      role="toolbar"
      aria-label={labels.taskbar}
    >
      {showWorkspaceSwitcher && workspaces.length > 1 && (
        <div
          className={cx(classes.workspaceSwitcher, {
            [classes.workspaceSwitcherVertical]: taskbarVertical
          })}
          role="group"
          aria-label={labels.workspaces}
        >
          {workspaces.map((workspace) => {
            const selected = workspace.id === activeWorkspace;

            return (
              <button
                key={workspace.id}
                type="button"
                className={cx(classes.workspaceButton, {
                  [classes.workspaceButtonActive]: selected
                })}
                aria-label={labels.workspace(workspace.title)}
                aria-pressed={selected}
                title={workspace.title}
                onClick={() => onSwitchWorkspace(workspace.id)}
              >
                {workspace.icon ?? workspace.title}
              </button>
            );
          })}
        </div>
      )}
      <div ref={launcherRef} style={{ position: 'relative' }}>
        {showLauncher && (
          <button
            ref={startButtonRef}
            type="button"
            className={cx(classes.taskbarStart)}
            aria-haspopup="menu"
            aria-expanded={launcherOpen}
            aria-label={labels.start}
            onClick={onToggleLauncher}
          >
            <Icon icon="menu-outline" pack="nebular-essentials" aria-hidden="true" />
            {!taskbarVertical && !compact && <span>{labels.start}</span>}
          </button>
        )}
        {launcherOpen && (
          <DesktopStartMenu
            apps={apps}
            labels={labels}
            taskbarPosition={taskbarPosition}
            searchable={startMenuSearch}
            recentAppIds={recentAppIds}
            onOpenApp={(app) => onOpenApp(app.id)}
            onClose={onCloseLauncher}
            classNames={classNames}
            styles={styles}
            unstyled={unstyled}
          />
        )}
      </div>
      <div
        ref={itemsRef}
        className={cx(classes.taskbarItems, {
          [classes.taskbarItemsVertical]: taskbarVertical
        })}
        onKeyDown={handleItemsKeyDown}
        {...groupLongPress.handlers}
      >
        {visibleGroups.map((group) => {
          const count = group.windows.length;

          return (
            <div key={group.key} className={cx(classes.taskbarGroup)}>
              <button
                type="button"
                data-desktop-taskbar-item="true"
                data-desktop-taskbar-key={group.key}
                className={cx(classes.taskbarItem, classes.taskbarGroupButton, {
                  [classes.taskbarItemActive]: group.active,
                  [classes.taskbarItemMinimized]: group.minimized,
                  [classes.taskbarCompactItem]: compact
                })}
                aria-pressed={group.active}
                aria-label={count > 1 ? labels.windowGroup(group.title, count) : group.title}
                title={group.title}
                onClick={() => onGroupClick(group)}
                onContextMenu={(event) => onGroupContextMenu(group, event)}
                onMouseEnter={(event) =>
                  setPreview({ group, rect: event.currentTarget.getBoundingClientRect() })
                }
                onMouseLeave={() => setPreview(null)}
                onFocus={(event) =>
                  setPreview({ group, rect: event.currentTarget.getBoundingClientRect() })
                }
                onBlur={() => setPreview(null)}
              >
                {group.icon && (
                  <span className={cx(classes.taskbarIcon)} aria-hidden="true">
                    {group.icon}
                  </span>
                )}
                {!compact && <span className={cx(classes.taskbarLabel)}>{group.title}</span>}
                {count > 1 && (
                  <span className={cx(classes.taskbarCount)} aria-hidden="true">
                    {count}
                  </span>
                )}
              </button>
              {count > 1 && (
                <button
                  type="button"
                  data-desktop-taskbar-item="true"
                  className={cx(classes.taskbarGroupToggle)}
                  aria-label={labels.showWindows(group.title)}
                  title={labels.showWindows(group.title)}
                  aria-haspopup="menu"
                  onClick={(event) => onGroupMenu(group, event)}
                  onContextMenu={(event) => onGroupContextMenu(group, event)}
                >
                  <Icon icon="chevron-down-outline" pack="nebular-essentials" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
        {overflowGroups.length > 0 && (
          <button
            type="button"
            data-desktop-taskbar-item="true"
            data-desktop-taskbar-key="__overflow"
            className={cx(classes.taskbarItem, { [classes.taskbarCompactItem]: compact })}
            aria-label={labels.moreWindows}
            title={labels.moreWindows}
            aria-haspopup="menu"
            onClick={(event) => onOverflowMenu(overflowGroups, event)}
          >
            <Icon icon="more-horizontal-outline" pack="nebular-essentials" aria-hidden="true" />
            {!compact && <span>+{overflowGroups.length}</span>}
          </button>
        )}
      </div>
      <div className={cx(classes.taskbarSpacer)} />
      {showOverview && (
        <button
          type="button"
          className={cx(classes.iconButton)}
          aria-label={overviewOpen ? labels.closeOverview : labels.overview}
          aria-pressed={overviewOpen}
          title={overviewOpen ? labels.closeOverview : labels.overview}
          onClick={onToggleOverview}
        >
          <Icon icon="expand-outline" pack="nebular-essentials" aria-hidden="true" />
        </button>
      )}
      <div
        className={cx(classes.taskbarMeta, {
          [classes.taskbarMetaVertical]: taskbarVertical
        })}
      >
        {taskbarActions}
        {notifications && notifications.length > 0 && (
          <NotificationCenter
            notifications={notifications}
            placement={taskbarPosition === 'top' ? 'bottom-end' : 'top-end'}
          />
        )}
        {systemTray && (
          <div className={cx(classes.tray, { [classes.trayVertical]: taskbarVertical })}>
            {systemTray}
          </div>
        )}
        {showClock && (
          <div
            className={cx(classes.clock, { [classes.clockVertical]: taskbarVertical })}
            role="timer"
            aria-label={labels.clock}
          >
            {onClockClick ? (
              <button
                type="button"
                className={cx(classes.clockButton)}
                aria-label={labels.calendar}
                aria-haspopup="dialog"
                aria-expanded={clockExpanded ?? false}
                onClick={(event) => onClockClick(event.currentTarget.getBoundingClientRect())}
              >
                <span className={cx(classes.clockTime)}>{clockValue}</span>
              </button>
            ) : (
              <span className={cx(classes.clockTime)}>{clockValue}</span>
            )}
          </div>
        )}
      </div>
      {preview && (
        <div
          className={cx(classes.taskbarPreview)}
          style={{
            left: preview.rect.left + preview.rect.width / 2,
            top: taskbarPosition === 'top' ? preview.rect.bottom + 8 : preview.rect.top - 8,
            transform: taskbarPosition === 'top' ? 'translateX(-50%)' : 'translate(-50%, -100%)'
          }}
          role="tooltip"
        >
          <div className={cx(classes.taskbarPreviewTitle)}>
            {preview.group.icon && (
              <span className={cx(classes.taskbarIcon)} aria-hidden="true">
                {preview.group.icon}
              </span>
            )}
            {preview.group.title}
          </div>
          {preview.group.preview ?? (
            <ul className={cx(classes.taskbarPreviewList)}>
              {preview.group.windows.map((window) => (
                <li key={window.id}>
                  {windowTitleText(
                    window,
                    window.appId ? appsById.get(window.appId) : undefined,
                    labels.window
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
