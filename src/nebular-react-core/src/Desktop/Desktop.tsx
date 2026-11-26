import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useComponentDefaultProps, useNebularLocale } from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { useStyles } from './Desktop.styles';
import { CommandPalette } from '../CommandPalette';
import type { CommandPaletteAction } from '../CommandPalette';
import { DesktopContextMenu, type DesktopContextMenuEntry } from './DesktopContextMenu';
import { DesktopTaskbar, type DesktopTaskbarGroup } from './DesktopTaskbar';
import { DesktopWindowFrame } from './DesktopWindow';
import { DesktopContext } from './Desktop.context';
import {
  createLocalStorageLayoutAdapter,
  deserializeDesktopLayout,
  serializeDesktopLayout
} from './Desktop.persistence';
import type {
  DesktopContextValue,
  DesktopDisplay,
  DesktopFileReference,
  DesktopLabels,
  DesktopLayoutStatus,
  DesktopOpenWindowOptions,
  DesktopPersistenceAdapter,
  DesktopProps,
  DesktopSnapPosition,
  DesktopWindowBounds,
  DesktopWindowState
} from './Desktop.types';
import {
  CASCADE_OFFSET,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  Z_INDEX_STEP,
  clamp,
  findTaskbarButton,
  findWindowElement,
  getAreaRect,
  getAncestorIds,
  getDescendantIds,
  getEffectiveZIndex,
  getNextActiveTabId,
  getNextZIndex,
  getTaskbarWindow,
  getVisibleModalDescendant,
  getWindowKey,
  isInWorkspace,
  focusWindowElement,
  resolveSnapBounds,
  windowIconNode,
  windowTitleText,
  clampBounds
} from './Desktop.utils';
import { Icon } from '../Icon';

const defaultProps: Partial<DesktopProps> = {
  apps: [],
  defaultWindows: [],
  workspaces: [],
  taskbarPosition: 'bottom',
  taskbarSize: 44,
  fullscreen: false,
  showClock: true,
  showLauncher: true,
  closeOnEscape: true,
  minWindowWidth: 240,
  minWindowHeight: 160,
  ariaLabel: 'Desktop',
  snapThreshold: 24,
  keepInBounds: true,
  groupTaskbar: true,
  enableContextMenu: true,
  autoCompact: true,
  compactBreakpoint: 640,
  keyboardShortcuts: true,
  startMenuSearch: true,
  animation: true,
  initialPosition: 'cascade',
  layoutDebounceMs: 300,
  displayMode: 'single',
  displays: [],
  fitDisplays: true,
  icons: [],
  commandPalette: true,
  commands: [],
  showOverview: true
};

const Desktop = forwardRef<HTMLDivElement, DesktopProps>((props, ref) => {
  const {
    apps,
    windows: controlledWindows,
    defaultWindows,
    onWindowsChange,
    onWindowOpen,
    onWindowClose,
    onWindowFocus,
    onWindowMinimize,
    onWindowMaximize,
    onWindowRestore,
    onWindowSnap,
    onWindowStateChange,
    onWindowDisplayChange,
    taskbarPosition,
    taskbarSize,
    fullscreen,
    showClock,
    clock,
    clockFormat,
    systemTray,
    taskbarActions,
    showLauncher,
    labels: labelsProp,
    closeOnEscape,
    minWindowWidth,
    minWindowHeight,
    ariaLabel,
    snapThreshold,
    keepInBounds,
    storageKey,
    layoutAdapter,
    layoutDebounceMs,
    onLayoutStatusChange,
    onLayoutLoaded,
    onLayoutError,
    displayMode,
    displays,
    fitDisplays,
    onDisplayChange,
    icons,
    onIconOpen,
    commandPalette,
    commands,
    showOverview,
    notifications,
    groupTaskbar,
    maxTaskbarItems,
    enableContextMenu: contextMenuEnabled,
    workspaces,
    workspace: controlledWorkspace,
    defaultWorkspace,
    onWorkspaceChange,
    compact,
    autoCompact,
    compactBreakpoint,
    keyboardShortcuts,
    startMenuSearch,
    animation,
    initialPosition,
    className,
    classNames,
    styles,
    unstyled,
    style,
    onKeyDown: onKeyDownProp,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop',
    classNames,
    styles,
    unstyled
  });
  const { t, locale } = useNebularLocale();
  const labels = useMemo<DesktopLabels>(
    () => ({
      region: t('desktop.region', 'Desktop'),
      taskbar: t('desktop.taskbar', 'Taskbar'),
      start: t('desktop.start', 'Start'),
      apps: t('desktop.apps', 'Apps'),
      pinned: t('desktop.pinned', 'Pinned'),
      recent: t('desktop.recent', 'Recent'),
      allApps: t('desktop.allApps', 'All apps'),
      searchApps: t('desktop.searchApps', 'Search apps'),
      noResults: t('desktop.noResults', 'No apps found'),
      openApp: (name) => t('desktop.openApp', 'Open {name}', { name }),
      minimize: (name) => t('desktop.minimize', 'Minimize {name}', { name }),
      maximize: (name) => t('desktop.maximize', 'Maximize {name}', { name }),
      restore: (name) => t('desktop.restore', 'Restore {name}', { name }),
      close: (name) => t('desktop.close', 'Close {name}', { name }),
      resize: (name) => t('desktop.resize', 'Resize {name}', { name }),
      tabList: t('desktop.tabList', 'Window tabs'),
      closeTab: (name) => t('desktop.closeTab', 'Close {name}', { name }),
      window: t('desktop.window', 'Window'),
      clock: t('desktop.clock', 'Clock'),
      noApps: t('desktop.noApps', 'No apps available'),
      windowGroup: (name, count) =>
        t('desktop.windowGroup', '{name} ({count} windows)', { name, count }),
      windowItem: (name, index) => t('desktop.windowItem', '{name} ({index})', { name, index }),
      showWindows: (name) => t('desktop.showWindows', 'Show windows for {name}', { name }),
      moreWindows: t('desktop.moreWindows', 'More windows'),
      windowMenu: t('desktop.windowMenu', 'Window menu'),
      workspace: (name) => t('desktop.workspace', 'Workspace {name}', { name }),
      workspaces: t('desktop.workspaces', 'Workspaces'),
      moveToWorkspace: (name) => t('desktop.moveToWorkspace', 'Move to {name}', { name }),
      displays: t('desktop.displays', 'Displays'),
      moveToDisplay: (name) => t('desktop.moveToDisplay', 'Move to display {name}', { name }),
      snapLayout: t('desktop.snapLayout', 'Snap layout'),
      snapLeft: t('desktop.snapLeft', 'Left half'),
      snapRight: t('desktop.snapRight', 'Right half'),
      snapTopLeft: t('desktop.snapTopLeft', 'Top left quarter'),
      snapTopRight: t('desktop.snapTopRight', 'Top right quarter'),
      snapBottomLeft: t('desktop.snapBottomLeft', 'Bottom left quarter'),
      snapBottomRight: t('desktop.snapBottomRight', 'Bottom right quarter'),
      snapMaximize: t('desktop.snapMaximize', 'Maximize'),
      opened: (name) => t('desktop.opened', '{name} opened', { name }),
      minimizedAnnouncement: (name) =>
        t('desktop.minimizedAnnouncement', '{name} minimized', { name }),
      maximizedAnnouncement: (name) =>
        t('desktop.maximizedAnnouncement', '{name} maximized', { name }),
      restoredAnnouncement: (name) =>
        t('desktop.restoredAnnouncement', '{name} restored', { name }),
      closedAnnouncement: (name) => t('desktop.closedAnnouncement', '{name} closed', { name }),
      switchedWorkspace: (name) => t('desktop.switchedWorkspace', 'Switched to {name}', { name }),
      windowError: t('desktop.windowError', 'This window crashed.'),
      reloadWindow: t('desktop.reloadWindow', 'Reload'),
      commandPlaceholder: t('desktop.commandPlaceholder', 'Search apps, windows and actions…'),
      commandEmpty: t('desktop.commandEmpty', 'No results'),
      commandApps: t('desktop.commandApps', 'Apps'),
      commandWindows: t('desktop.commandWindows', 'Windows'),
      commandWorkspaces: t('desktop.commandWorkspaces', 'Workspaces'),
      commandActions: t('desktop.commandActions', 'Actions'),
      reopenClosedWindow: t('desktop.reopenClosedWindow', 'Reopen closed window'),
      overview: t('desktop.overview', 'Overview'),
      closeOverview: t('desktop.closeOverview', 'Close overview'),
      ...labelsProp
    }),
    [t, labelsProp]
  );
  const [internalWindows, setInternalWindows] = useState<DesktopWindowState[]>(() =>
    (defaultWindows ?? []).map((window) => ({
      ...window,
      minimized: !!window.minimized,
      maximized: !!window.maximized,
      zIndex: window.zIndex ?? 0
    }))
  );
  const isControlled = controlledWindows !== undefined;
  const currentWindows = isControlled ? controlledWindows : internalWindows;
  const windowsRef = useRef(currentWindows);
  windowsRef.current = currentWindows;
  const skipPersistenceRef = useRef(false);
  const resolvedLayoutAdapter = useMemo<DesktopPersistenceAdapter | undefined>(
    () => layoutAdapter ?? (storageKey ? createLocalStorageLayoutAdapter(storageKey) : undefined),
    [layoutAdapter, storageKey]
  );
  const loadedLayoutAdapterRef = useRef<DesktopPersistenceAdapter | null>(null);
  const layoutLoadPendingRef = useRef(false);
  const [layoutStatus, setLayoutStatus] = useState<DesktopLayoutStatus>('idle');
  const [layoutError, setLayoutError] = useState<unknown>(undefined);
  const nextZRef = useRef(getNextZIndex(currentWindows));
  const takeNextZIndex = useCallback(() => {
    nextZRef.current += Z_INDEX_STEP;
    return nextZRef.current;
  }, []);
  const previousFocusRef = useRef(new Map<string, HTMLElement | null>());
  const closedWindowsRef = useRef<DesktopWindowState[][]>([]);
  const idBase = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const idCounterRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);
  const desktopAreaRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [recentAppIds, setRecentAppIds] = useState<string[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const announcementCounterRef = useRef(0);
  const [snapPreview, setSnapPreview] = useState<DesktopWindowBounds | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    label: string;
    entries: DesktopContextMenuEntry[];
  } | null>(null);
  const contextMenuTriggerRef = useRef<HTMLElement | null>(null);
  const [focusRequest, setFocusRequest] = useState<{
    id: string;
    modal: boolean;
    token: number;
  } | null>(null);
  const [taskbarFocusRequest, setTaskbarFocusRequest] = useState<{
    key: string;
    token: number;
  } | null>(null);
  const focusTokenRef = useRef(0);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [internalWorkspace, setInternalWorkspace] = useState<string | undefined>(
    defaultWorkspace ?? workspaces[0]?.id
  );
  const activeWorkspace = controlledWorkspace ?? internalWorkspace;
  const appsById = useMemo(() => new Map(apps.map((app) => [app.id, app])), [apps]);
  const isCompact =
    !!compact || (!!autoCompact && measuredWidth > 0 && measuredWidth < compactBreakpoint);
  const [desktopSize, setDesktopSize] = useState({ width: 0, height: 0 });
  const displayZones = useMemo<DesktopDisplay[]>(() => {
    if (displayMode !== 'span' || displays.length === 0) {
      return [];
    }

    const minX = Math.min(...displays.map((display) => display.bounds.x));
    const minY = Math.min(...displays.map((display) => display.bounds.y));
    const maxX = Math.max(...displays.map((display) => display.bounds.x + display.bounds.width));
    const maxY = Math.max(...displays.map((display) => display.bounds.y + display.bounds.height));
    const unionWidth = Math.max(1, maxX - minX);
    const unionHeight = Math.max(1, maxY - minY);
    const scaleX = fitDisplays && desktopSize.width > 0 ? desktopSize.width / unionWidth : 1;
    const scaleY = fitDisplays && desktopSize.height > 0 ? desktopSize.height / unionHeight : 1;

    return displays.map((display) => ({
      ...display,
      bounds: {
        x: (display.bounds.x - minX) * scaleX,
        y: (display.bounds.y - minY) * scaleY,
        width: Math.max(1, display.bounds.width * scaleX),
        height: Math.max(1, display.bounds.height * scaleY)
      }
    }));
  }, [displayMode, displays, fitDisplays, desktopSize.width, desktopSize.height]);
  const getDisplayZone = useCallback(
    (displayId?: string) =>
      displayZones.find((display) => display.id === displayId) ??
      displayZones.find((display) => display.primary) ??
      displayZones[0],
    [displayZones]
  );
  const getDisplayForBounds = useCallback(
    (bounds: DesktopWindowBounds) => {
      if (displayZones.length === 0) {
        return undefined;
      }

      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;

      return (
        displayZones.find(
          (display) =>
            centerX >= display.bounds.x &&
            centerX <= display.bounds.x + display.bounds.width &&
            centerY >= display.bounds.y &&
            centerY <= display.bounds.y + display.bounds.height
        ) ??
        displayZones.find((display) => display.primary) ??
        displayZones[0]
      );
    },
    [displayZones]
  );

  const updateWindows = useCallback(
    (updater: (windows: DesktopWindowState[]) => DesktopWindowState[]) => {
      const next = updater(windowsRef.current);
      windowsRef.current = next;
      if (!isControlled) {
        setInternalWindows(next);
      }
      onWindowsChange?.(next);
    },
    [isControlled, onWindowsChange]
  );

  const announce = useCallback((message: string) => {
    announcementCounterRef.current += 1;
    setAnnouncement(`${message}${announcementCounterRef.current % 2 === 0 ? '\u200B' : ''}`);
  }, []);

  const getApp = useCallback(
    (window: DesktopWindowState | undefined) =>
      window?.appId ? appsById.get(window.appId) : undefined,
    [appsById]
  );

  const requestWindowFocus = useCallback((id: string, modal: boolean) => {
    focusTokenRef.current += 1;
    setFocusRequest({ id, modal, token: focusTokenRef.current });
  }, []);

  const patchWindow = useCallback(
    (id: string, patch: Partial<DesktopWindowState>) => {
      updateWindows((windows) =>
        windows.map((window) => (window.id === id ? { ...window, ...patch } : window))
      );
    },
    [updateWindows]
  );

  const promoteWindow = useCallback(
    (id: string) => {
      const windows = windowsRef.current;
      const target = windows.find((window) => window.id === id);

      if (!target || target.minimized) {
        return;
      }

      if (getVisibleModalDescendant(windows, id, activeWorkspace)) {
        return;
      }

      const topZIndex = Math.max(
        ...windows
          .filter((window) => !window.minimized && isInWorkspace(window, activeWorkspace))
          .map((window) => window.zIndex)
      );

      if (target.zIndex >= topZIndex) {
        return;
      }

      updateWindows((current) =>
        current.map((window) =>
          window.id === id ? { ...window, zIndex: takeNextZIndex() } : window
        )
      );
      onWindowFocus?.(target);
    },
    [updateWindows, onWindowFocus, takeNextZIndex, activeWorkspace]
  );

  const focusWindow = useCallback(
    (id: string) => {
      const windows = windowsRef.current;
      const requested = windows.find((window) => window.id === id);

      if (!requested) {
        return;
      }

      const modalDescendant = getVisibleModalDescendant(windows, id, activeWorkspace);
      const target = modalDescendant ?? requested;
      const ids = getDescendantIds(windows, target.id);
      const topZIndex = Math.max(
        ...windows
          .filter((window) => !window.minimized && isInWorkspace(window, activeWorkspace))
          .map((window) => window.zIndex)
      );
      const shouldPromote = target.minimized || target.zIndex < topZIndex;

      if (shouldPromote) {
        updateWindows((current) =>
          current.map((window) =>
            ids.has(window.id) && (window.id === target.id || window.modal)
              ? {
                  ...window,
                  minimized: false,
                  zIndex: takeNextZIndex()
                }
              : window
          )
        );
      }

      if (target.minimized) {
        announce(
          labels.restoredAnnouncement(windowTitleText(target, getApp(target), labels.window))
        );
        onWindowRestore?.(target);
      }
      requestWindowFocus(target.id, !!target.modal);
      onWindowFocus?.(target);
    },
    [
      updateWindows,
      requestWindowFocus,
      onWindowFocus,
      onWindowRestore,
      takeNextZIndex,
      announce,
      labels,
      getApp,
      activeWorkspace
    ]
  );

  const closeWindow = useCallback(
    (id: string) => {
      const windows = windowsRef.current;
      const target = windows.find((window) => window.id === id);

      if (!target) {
        return;
      }

      const ids = getDescendantIds(windows, id);
      const removed = windows.filter((window) => ids.has(window.id));
      closedWindowsRef.current.push(removed.map((window) => ({ ...window })));
      if (closedWindowsRef.current.length > 20) {
        closedWindowsRef.current.shift();
      }
      updateWindows((current) => current.filter((window) => !ids.has(window.id)));
      removed.forEach((window) => onWindowClose?.(window));
      announce(labels.closedAnnouncement(windowTitleText(target, getApp(target), labels.window)));

      const previous = previousFocusRef.current.get(id);
      previousFocusRef.current.delete(id);
      ids.forEach((removedId) => previousFocusRef.current.delete(removedId));

      if (previous?.isConnected && previous !== document.body) {
        previous.focus();
      } else if (!target.skipTaskbar) {
        setTaskbarFocusRequest({ key: getWindowKey(target, groupTaskbar), token: Date.now() });
      } else {
        desktopAreaRef.current?.focus();
      }
    },
    [updateWindows, onWindowClose, announce, labels, getApp, groupTaskbar]
  );

  const minimizeWindow = useCallback(
    (id: string) => {
      const windows = windowsRef.current;
      const target = windows.find((window) => window.id === id);

      if (
        !target ||
        target.modal ||
        target.minimizable === false ||
        getApp(target)?.minimizable === false
      ) {
        return;
      }

      const ids = getDescendantIds(windows, id);
      const minimized = windows.filter((window) => ids.has(window.id));
      updateWindows((current) =>
        current.map((window) => (ids.has(window.id) ? { ...window, minimized: true } : window))
      );
      minimized.forEach((window) => onWindowMinimize?.(window));
      announce(
        labels.minimizedAnnouncement(windowTitleText(target, getApp(target), labels.window))
      );

      if (!target.skipTaskbar) {
        setTaskbarFocusRequest({ key: getWindowKey(target, groupTaskbar), token: Date.now() });
      } else {
        desktopAreaRef.current?.focus();
      }
    },
    [updateWindows, onWindowMinimize, announce, labels, getApp, groupTaskbar]
  );

  const maximizeWindow = useCallback(
    (id: string) => {
      const target = windowsRef.current.find((window) => window.id === id);

      if (
        !target ||
        target.modal ||
        target.maximizable === false ||
        getApp(target)?.maximizable === false ||
        getVisibleModalDescendant(windowsRef.current, id, activeWorkspace)
      ) {
        return;
      }

      const display = getDisplayForBounds(target);
      updateWindows((windows) =>
        windows.map((window) =>
          window.id === id
            ? {
                ...window,
                minimized: false,
                maximized: true,
                displayId: display?.id ?? window.displayId,
                zIndex: takeNextZIndex()
              }
            : window
        )
      );
      announce(
        labels.maximizedAnnouncement(windowTitleText(target, getApp(target), labels.window))
      );
      onWindowMaximize?.(target);
    },
    [
      updateWindows,
      announce,
      labels,
      getApp,
      onWindowMaximize,
      takeNextZIndex,
      activeWorkspace,
      getDisplayForBounds
    ]
  );

  const restoreWindow = useCallback(
    (id: string) => {
      const target = windowsRef.current.find((window) => window.id === id);

      if (!target || getVisibleModalDescendant(windowsRef.current, id, activeWorkspace)) {
        return;
      }

      updateWindows((windows) =>
        windows.map((window) =>
          window.id === id
            ? {
                ...window,
                minimized: false,
                maximized: false,
                zIndex: takeNextZIndex()
              }
            : window
        )
      );
      announce(labels.restoredAnnouncement(windowTitleText(target, getApp(target), labels.window)));
      onWindowRestore?.(target);
    },
    [updateWindows, announce, labels, getApp, onWindowRestore, takeNextZIndex, activeWorkspace]
  );

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      if (workspaceId === activeWorkspace) {
        return;
      }

      if (controlledWorkspace === undefined) {
        setInternalWorkspace(workspaceId);
      }

      const workspace = workspaces.find((item) => item.id === workspaceId);
      onWorkspaceChange?.(workspaceId);
      if (workspace) {
        announce(labels.switchedWorkspace(workspace.title));
      }
    },
    [activeWorkspace, controlledWorkspace, workspaces, onWorkspaceChange, announce, labels]
  );

  const moveWindowToWorkspace = useCallback(
    (id: string, workspaceId: string) => {
      const windows = windowsRef.current;
      const target = windows.find((window) => window.id === id);

      if (!target) {
        return;
      }

      const ids = getDescendantIds(windows, id);
      const topZIndex = Math.max(
        ...windows
          .filter((window) => !window.minimized && isInWorkspace(window, activeWorkspace))
          .map((window) => window.zIndex)
      );
      const wasActive = !target.minimized && target.zIndex >= topZIndex;

      updateWindows((current) =>
        current.map((window) =>
          ids.has(window.id) ? { ...window, workspaceId, minimized: false } : window
        )
      );

      if (wasActive) {
        setTaskbarFocusRequest({
          key: getWindowKey(target, groupTaskbar),
          token: Date.now()
        });
      }
    },
    [updateWindows, groupTaskbar, activeWorkspace]
  );

  const setWindowState = useCallback(
    (id: string, state: unknown) => {
      let updated: DesktopWindowState | undefined;
      updateWindows((windows) =>
        windows.map((window) => {
          if (window.id !== id) {
            return window;
          }

          updated = { ...window, state };
          return updated;
        })
      );

      if (updated) {
        onWindowStateChange?.(updated);
      }
    },
    [updateWindows, onWindowStateChange]
  );

  const moveWindowToDisplay = useCallback(
    (id: string, displayId: string) => {
      const zone = getDisplayZone(displayId);
      const target = windowsRef.current.find((window) => window.id === id);

      if (!zone || !target) {
        return;
      }

      const width = Math.min(target.width, zone.bounds.width);
      const height = Math.min(target.height, zone.bounds.height);
      const x = zone.bounds.x + Math.max(0, (zone.bounds.width - width) / 2);
      const y = zone.bounds.y + Math.max(0, (zone.bounds.height - height) / 2);
      const updated = { ...target, displayId: zone.id, x, y, width, height };

      updateWindows((windows) => windows.map((window) => (window.id === id ? updated : window)));
      onWindowDisplayChange?.(updated, zone.id);
      onDisplayChange?.(zone.id);
    },
    [getDisplayZone, updateWindows, onWindowDisplayChange, onDisplayChange]
  );

  const openWindow = useCallback(
    (options: DesktopOpenWindowOptions) => {
      const app = options.appId ? appsById.get(options.appId) : undefined;

      if (app) {
        setRecentAppIds((recent) =>
          [app.id, ...recent.filter((appId) => appId !== app.id)].slice(0, 4)
        );
      }

      if (app?.singleInstance) {
        const existing = windowsRef.current.find(
          (window) => window.appId === app.id && !window.parentId
        );

        if (existing) {
          if (existing.workspaceId && existing.workspaceId !== activeWorkspace) {
            switchWorkspace(existing.workspaceId);
          }
          focusWindow(existing.id);
          return existing.id;
        }
      }

      const parent = options.parentId
        ? windowsRef.current.find((window) => window.id === options.parentId)
        : undefined;
      let { id } = options;

      if (!id) {
        const ids = new Set(windowsRef.current.map((window) => window.id));
        let nextId: string;

        do {
          nextId = `${idBase}-window-${idCounterRef.current++}`;
        } while (ids.has(nextId));

        id = nextId;
      }

      if (windowsRef.current.some((window) => window.id === id)) {
        const existing = windowsRef.current.find((window) => window.id === id);
        if (existing?.workspaceId && existing.workspaceId !== activeWorkspace) {
          switchWorkspace(existing.workspaceId);
        }
        focusWindow(id);
        return id;
      }

      const area = getAreaRect(desktopAreaRef.current);
      const displayZone = getDisplayZone(options.displayId ?? parent?.displayId);
      const displayBounds = displayZone?.bounds;
      const availableWidth = displayBounds?.width ?? area.width;
      const availableHeight = displayBounds?.height ?? area.height;
      const targetWorkspace = options.workspaceId ?? activeWorkspace;

      if (options.workspaceId && options.workspaceId !== activeWorkspace) {
        switchWorkspace(options.workspaceId);
      }

      const desiredWidth = options.width ?? app?.defaultWidth ?? DEFAULT_WINDOW_WIDTH;
      const desiredHeight = options.height ?? app?.defaultHeight ?? DEFAULT_WINDOW_HEIGHT;
      const minimumWidth = Math.max(minWindowWidth, app?.minWidth ?? 0);
      const minimumHeight = Math.max(minWindowHeight, app?.minHeight ?? 0);
      const width =
        availableWidth > 0
          ? Math.min(Math.max(desiredWidth, minimumWidth), availableWidth)
          : Math.max(desiredWidth, minimumWidth);
      const height =
        availableHeight > 0
          ? Math.min(Math.max(desiredHeight, minimumHeight), availableHeight)
          : Math.max(desiredHeight, minimumHeight);
      const center = options.centerOnOpen ?? app?.centerOnOpen ?? initialPosition === 'center';
      const cascade = windowsRef.current.length % 8;
      const originX = displayBounds?.x ?? 0;
      const originY = displayBounds?.y ?? 0;
      let x = options.x ?? (parent ? parent.x + 32 : originX + 48 + cascade * CASCADE_OFFSET);
      let y = options.y ?? (parent ? parent.y + 32 : originY + 48 + cascade * CASCADE_OFFSET);

      if (center && options.x === undefined && options.y === undefined) {
        const centerWidth = displayBounds?.width ?? area.width;
        const centerHeight = displayBounds?.height ?? area.height;
        x = centerWidth > 0 ? originX + (centerWidth - width) / 2 : x;
        y = centerHeight > 0 ? originY + (centerHeight - height) / 2 : y;
      }

      if (keepInBounds && area.width > 0 && area.height > 0) {
        const bounded = {
          x,
          y,
          width: Math.min(width, area.width),
          height: Math.min(height, area.height)
        };
        x = clamp(bounded.x, 0, Math.max(0, area.width - bounded.width));
        y = clamp(bounded.y, 0, Math.max(0, area.height - bounded.height));
      }

      const windowState: DesktopWindowState = {
        id,
        appId: options.appId,
        workspaceId: targetWorkspace,
        displayId: displayZone?.id ?? options.displayId,
        title: options.title ?? app?.title,
        icon: options.icon,
        parentId: options.parentId,
        modal: options.modal ?? false,
        x,
        y,
        width,
        height,
        minimized: false,
        maximized: options.maximized ?? isCompact,
        zIndex: takeNextZIndex(),
        draggable: options.draggable ?? app?.draggable,
        resizable: options.resizable ?? app?.resizable,
        minimizable: options.minimizable ?? (options.modal ? false : app?.minimizable),
        maximizable: options.maximizable ?? (options.modal ? false : app?.maximizable),
        closable: options.closable ?? app?.closable,
        alwaysOnTop: options.alwaysOnTop ?? app?.alwaysOnTop,
        skipTaskbar: options.skipTaskbar ?? (options.modal ? true : app?.skipTaskbar),
        centerOnOpen: center,
        state: options.state ?? app?.defaultState,
        toolbar: options.toolbar ?? app?.toolbar,
        footer: options.footer ?? app?.footer,
        content: options.content ?? app?.content,
        tabs: options.tabs,
        activeTabId: options.tabs?.length
          ? options.tabs.some((tab) => tab.id === options.activeTabId)
            ? options.activeTabId
            : options.tabs[0].id
          : options.activeTabId
      };

      previousFocusRef.current.set(id, document.activeElement as HTMLElement | null);
      updateWindows((windows) => [...windows, windowState]);
      requestWindowFocus(id, !!windowState.modal);
      announce(labels.opened(windowTitleText(windowState, app, labels.window)));
      onWindowOpen?.(windowState);
      return id;
    },
    [
      appsById,
      focusWindow,
      switchWorkspace,
      idBase,
      initialPosition,
      isCompact,
      activeWorkspace,
      updateWindows,
      requestWindowFocus,
      announce,
      labels,
      onWindowOpen,
      keepInBounds,
      takeNextZIndex,
      minWindowWidth,
      minWindowHeight,
      getDisplayZone
    ]
  );

  const setActiveTab = useCallback(
    (id: string, tabId: string) => {
      const target = windowsRef.current.find((window) => window.id === id);

      if (
        !target ||
        target.activeTabId === tabId ||
        !target.tabs?.some((tab) => tab.id === tabId)
      ) {
        return;
      }

      updateWindows((windows) =>
        windows.map((window) => (window.id === id ? { ...window, activeTabId: tabId } : window))
      );
    },
    [updateWindows]
  );

  const closeTab = useCallback(
    (id: string, tabId: string) => {
      const target = windowsRef.current.find((window) => window.id === id);
      const tabs = target?.tabs;

      if (!target || !tabs) {
        return;
      }

      const index = tabs.findIndex((tab) => tab.id === tabId);

      if (index < 0) {
        return;
      }

      const remaining = tabs.filter((tab) => tab.id !== tabId);

      // Closing the last tab closes the window: an empty tab bar has no useful
      // content and would leave a window that cannot be distinguished from a
      // plain content window.
      if (remaining.length === 0) {
        closeWindow(id);
        return;
      }

      const activeTabId = getNextActiveTabId(tabs, tabId, target.activeTabId);

      patchWindow(id, { tabs: remaining, activeTabId });
    },
    [closeWindow, patchWindow]
  );

  const tearOffTab = useCallback(
    (id: string, tabId: string, position?: { x: number; y: number }) => {
      const windows = windowsRef.current;
      const target = windows.find((window) => window.id === id);
      const tab = target?.tabs?.find((candidate) => candidate.id === tabId);

      if (!target || !target.tabs || !tab) {
        return undefined;
      }

      const app = getApp(target);
      const area = getAreaRect(desktopAreaRef.current);
      const displayZone = getDisplayZone(target.displayId);
      const availableWidth = displayZone?.bounds.width ?? area.width;
      const availableHeight = displayZone?.bounds.height ?? area.height;
      const width =
        availableWidth > 0
          ? Math.min(Math.max(target.width, minWindowWidth), availableWidth)
          : Math.max(target.width, minWindowWidth);
      const height =
        availableHeight > 0
          ? Math.min(Math.max(target.height, minWindowHeight), availableHeight)
          : Math.max(target.height, minWindowHeight);
      let x = position?.x ?? target.x + CASCADE_OFFSET;
      let y = position?.y ?? target.y + CASCADE_OFFSET;

      if (position && keepInBounds && area.width > 0 && area.height > 0) {
        x = clamp(x, 0, Math.max(0, area.width - width));
        y = clamp(y, 0, Math.max(0, area.height - height));
      }

      const newId = openWindow({
        workspaceId: target.workspaceId,
        displayId: target.displayId,
        title: tab.title,
        icon: tab.icon ?? windowIconNode(target, app),
        content: tab.content ?? target.content ?? app?.content,
        x,
        y,
        width,
        height,
        maximized: false,
        draggable: target.draggable,
        resizable: target.resizable,
        minimizable: target.minimizable,
        maximizable: target.maximizable,
        closable: target.closable,
        alwaysOnTop: target.alwaysOnTop,
        skipTaskbar: target.skipTaskbar
      });

      if (target.tabs.length === 1) {
        closeWindow(id);
      } else {
        const remaining = target.tabs.filter((candidate) => candidate.id !== tabId);
        const activeTabId = getNextActiveTabId(target.tabs, tabId, target.activeTabId);

        patchWindow(id, { tabs: remaining, activeTabId });
      }

      return newId;
    },
    [
      getApp,
      getDisplayZone,
      minWindowWidth,
      minWindowHeight,
      keepInBounds,
      openWindow,
      closeWindow,
      patchWindow
    ]
  );

  const reopenClosedWindow = useCallback(() => {
    const group = closedWindowsRef.current.pop();

    if (!group || group.length === 0) {
      return;
    }

    const existing = new Set(windowsRef.current.map((window) => window.id));
    const restored = group
      .filter((window) => !existing.has(window.id))
      .map((window) => ({
        ...window,
        minimized: false,
        zIndex: takeNextZIndex()
      }));

    if (restored.length === 0) {
      return;
    }

    updateWindows((windows) => [...windows, ...restored]);
    const top = restored[restored.length - 1];
    requestWindowFocus(top.id, !!top.modal);
    onWindowOpen?.(top);
  }, [updateWindows, requestWindowFocus, takeNextZIndex, onWindowOpen]);

  const openFile = useCallback(
    (file: DesktopFileReference) => {
      const extension = file.path.includes('.')
        ? file.path.slice(file.path.lastIndexOf('.')).toLowerCase()
        : '';
      const app = apps.find((candidate) =>
        candidate.fileExtensions?.some((value) => value.toLowerCase() === extension)
      );

      if (!app) {
        return undefined;
      }

      return openWindow({
        appId: app.id,
        state: {
          ...(app.defaultState && typeof app.defaultState === 'object'
            ? (app.defaultState as Record<string, unknown>)
            : {}),
          file
        }
      });
    },
    [apps, openWindow]
  );

  const desktopContext = useMemo<DesktopContextValue>(
    () => ({
      windows: currentWindows,
      apps,
      workspaces,
      activeWorkspace,
      displays: displayZones,
      displayMode,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      switchWorkspace,
      moveWindowToWorkspace,
      moveWindowToDisplay,
      setWindowState,
      openFile,
      reopenClosedWindow
    }),
    [
      currentWindows,
      apps,
      workspaces,
      activeWorkspace,
      displayZones,
      displayMode,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      switchWorkspace,
      moveWindowToWorkspace,
      moveWindowToDisplay,
      setWindowState,
      openFile,
      reopenClosedWindow
    ]
  );

  useEffect(() => {
    nextZRef.current = Math.max(nextZRef.current, getNextZIndex(currentWindows));
  }, [currentWindows]);

  useEffect(() => {
    const ids = new Set(currentWindows.map((window) => window.id));
    previousFocusRef.current.forEach((_value, key) => {
      if (!ids.has(key)) {
        previousFocusRef.current.delete(key);
      }
    });
  }, [currentWindows]);

  useEffect(() => {
    if (
      isControlled ||
      !resolvedLayoutAdapter ||
      loadedLayoutAdapterRef.current === resolvedLayoutAdapter
    ) {
      return undefined;
    }

    loadedLayoutAdapterRef.current = resolvedLayoutAdapter;
    layoutLoadPendingRef.current = true;
    const controller = new AbortController();
    let cancelled = false;
    setLayoutStatus('loading');

    const apply = (
      snapshot: Awaited<ReturnType<NonNullable<DesktopPersistenceAdapter['load']>>> | null
    ) => {
      if (cancelled) {
        return;
      }

      if (!snapshot) {
        layoutLoadPendingRef.current = false;
        setLayoutStatus('idle');
        return;
      }

      const restored = deserializeDesktopLayout(snapshot, apps);

      if (!restored) {
        layoutLoadPendingRef.current = false;
        setLayoutStatus('idle');
        return;
      }

      const area = getAreaRect(desktopAreaRef.current);
      const restoredWindows =
        area.width > 0 && area.height > 0
          ? restored.windows.map((window) => {
              const app = window.appId ? appsById.get(window.appId) : undefined;

              return {
                ...window,
                ...clampBounds(
                  window,
                  area,
                  Math.max(minWindowWidth, app?.minWidth ?? 0),
                  Math.max(minWindowHeight, app?.minHeight ?? 0)
                )
              };
            })
          : restored.windows;

      skipPersistenceRef.current = true;
      windowsRef.current = restoredWindows;
      setInternalWindows(restoredWindows);

      if (
        controlledWorkspace === undefined &&
        restored.activeWorkspace &&
        (workspaces.length === 0 ||
          workspaces.some((workspace) => workspace.id === restored.activeWorkspace))
      ) {
        setInternalWorkspace(restored.activeWorkspace);
      }

      setLayoutStatus('saved');
      layoutLoadPendingRef.current = false;
      onLayoutLoaded?.(snapshot);
    };

    const fail = (error: unknown) => {
      if (cancelled) {
        return;
      }

      setLayoutStatus('error');
      layoutLoadPendingRef.current = false;
      setLayoutError(error);
      onLayoutError?.(error);
    };

    try {
      const result = resolvedLayoutAdapter.load?.(controller.signal);

      if (result && typeof (result as Promise<unknown>).then === 'function') {
        (result as Promise<Awaited<ReturnType<NonNullable<DesktopPersistenceAdapter['load']>>>>)
          .then(apply)
          .catch(fail);
      } else {
        apply(
          (result ?? null) as Awaited<
            ReturnType<NonNullable<DesktopPersistenceAdapter['load']>>
          > | null
        );
      }
    } catch (error) {
      fail(error);
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    resolvedLayoutAdapter,
    isControlled,
    apps,
    appsById,
    minWindowWidth,
    minWindowHeight,
    controlledWorkspace,
    workspaces,
    onLayoutLoaded,
    onLayoutError
  ]);

  useEffect(() => {
    if (isControlled || !resolvedLayoutAdapter || layoutLoadPendingRef.current) {
      return undefined;
    }

    if (skipPersistenceRef.current) {
      skipPersistenceRef.current = false;
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setLayoutStatus('saving');
      setLayoutError(undefined);
      const snapshot = serializeDesktopLayout(windowsRef.current, {
        workspaces,
        activeWorkspace
      });

      Promise.resolve(resolvedLayoutAdapter.save(snapshot))
        .then(() => setLayoutStatus('saved'))
        .catch((error) => {
          setLayoutStatus('error');
          setLayoutError(error);
          onLayoutError?.(error);
        });
    }, layoutDebounceMs);

    return () => window.clearTimeout(timeout);
  }, [
    resolvedLayoutAdapter,
    isControlled,
    currentWindows,
    workspaces,
    activeWorkspace,
    layoutDebounceMs,
    onLayoutError
  ]);

  useEffect(() => {
    if (!resolvedLayoutAdapter) {
      return undefined;
    }

    const flush = () => {
      const snapshot = serializeDesktopLayout(windowsRef.current, {
        workspaces,
        activeWorkspace
      });

      try {
        const result = resolvedLayoutAdapter.flush
          ? resolvedLayoutAdapter.flush(snapshot)
          : resolvedLayoutAdapter.save(snapshot);
        Promise.resolve(result).catch(() => undefined);
      } catch {
        // Best-effort flush during page hide.
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [resolvedLayoutAdapter, workspaces, activeWorkspace]);

  useEffect(() => {
    if (!resolvedLayoutAdapter || isControlled) {
      return undefined;
    }

    return () => {
      const snapshot = serializeDesktopLayout(windowsRef.current, {
        workspaces,
        activeWorkspace
      });

      try {
        const result = resolvedLayoutAdapter.flush
          ? resolvedLayoutAdapter.flush(snapshot)
          : resolvedLayoutAdapter.save(snapshot);
        Promise.resolve(result).catch(() => undefined);
      } catch {
        // Ignore unmount flush errors.
      }
    };
  }, [resolvedLayoutAdapter, isControlled, workspaces, activeWorkspace]);

  useEffect(() => {
    onLayoutStatusChange?.({ status: layoutStatus, error: layoutError });
  }, [layoutStatus, layoutError, onLayoutStatusChange]);

  useEffect(() => {
    if (workspaces.length === 0) {
      return;
    }

    if (!activeWorkspace || !workspaces.some((workspace) => workspace.id === activeWorkspace)) {
      if (controlledWorkspace === undefined) {
        setInternalWorkspace(
          defaultWorkspace && workspaces.some((workspace) => workspace.id === defaultWorkspace)
            ? defaultWorkspace
            : workspaces[0].id
        );
      }
    }
  }, [workspaces, activeWorkspace, defaultWorkspace, controlledWorkspace]);

  useEffect(() => {
    if (!showClock || clock !== undefined) {
      return undefined;
    }

    const update = () => setNow(new Date());
    update();
    const interval = setInterval(update, 30_000);

    return () => clearInterval(interval);
  }, [showClock, clock]);

  useEffect(() => {
    if (!launcherOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!launcherRef.current?.contains(event.target as Node)) {
        setLauncherOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [launcherOpen]);

  useEffect(() => {
    if (!contextMenu) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (contextMenuTriggerRef.current?.contains(event.target as Node)) {
        return;
      }

      setContextMenu(null);
      contextMenuTriggerRef.current = null;
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [contextMenu]);

  useEffect(() => {
    if (!closeOnEscape) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;

      if (
        activeElement &&
        activeElement !== document.body &&
        !rootRef.current?.contains(activeElement)
      ) {
        return;
      }

      if (contextMenu) {
        setContextMenu(null);
        const trigger = contextMenuTriggerRef.current;
        contextMenuTriggerRef.current = null;
        if (trigger?.isConnected) {
          trigger.focus();
        }
        return;
      }

      if (launcherOpen) {
        setLauncherOpen(false);
        startButtonRef.current?.focus();
        return;
      }

      const modal = currentWindows
        .filter(
          (window) => window.modal && !window.minimized && isInWorkspace(window, activeWorkspace)
        )
        .sort((first, second) => getEffectiveZIndex(second) - getEffectiveZIndex(first))[0];

      if (modal) {
        event.preventDefault();
        closeWindow(modal.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, contextMenu, launcherOpen, currentWindows, activeWorkspace, closeWindow]);

  useEffect(() => {
    if (!focusRequest) {
      return;
    }

    const element = findWindowElement(rootRef.current, focusRequest.id);

    if (element) {
      focusWindowElement(element, { modal: focusRequest.modal });
    } else {
      desktopAreaRef.current?.focus();
    }

    setFocusRequest(null);
  }, [focusRequest, currentWindows]);

  useEffect(() => {
    if (!taskbarFocusRequest) {
      return;
    }

    const element =
      findTaskbarButton(rootRef.current, taskbarFocusRequest.key) ??
      findTaskbarButton(rootRef.current, '__overflow');

    if (element) {
      element.focus();
    } else {
      desktopAreaRef.current?.focus();
    }

    setTaskbarFocusRequest(null);
  }, [taskbarFocusRequest, currentWindows]);

  useEffect(() => {
    if (!autoCompact) {
      return undefined;
    }

    const element = rootRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      setMeasuredWidth(entries[0]?.contentRect.width || element.clientWidth);
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [autoCompact]);

  useEffect(() => {
    const element = desktopAreaRef.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const update = () => {
      setDesktopSize({ width: element.clientWidth, height: element.clientHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const visibleWindows = useMemo(
    () =>
      currentWindows
        .filter((window) => !window.minimized && isInWorkspace(window, activeWorkspace))
        .sort((first, second) => first.zIndex - second.zIndex),
    [currentWindows, activeWorkspace]
  );
  const activeWindow = visibleWindows.reduce<DesktopWindowState | null>(
    (active, window) => (!active || window.zIndex > active.zIndex ? window : active),
    null
  );
  const activeWorkspaceTheme = workspaces.find((workspace) => workspace.id === activeWorkspace);
  const commandActions = useMemo<CommandPaletteAction[]>(() => {
    const appActions = apps.map((app) => ({
      id: `app-${app.id}`,
      label: app.title,
      group: labels.commandApps,
      icon: app.icon,
      keywords: ['open', 'app', app.id],
      onSelect: () => {
        openWindow({ appId: app.id });
        setCommandOpen(false);
      }
    }));
    const windowActions = visibleWindows.map((window) => {
      const app = getApp(window);

      return {
        id: `window-${window.id}`,
        label: windowTitleText(window, app, labels.window),
        group: labels.commandWindows,
        icon: app?.icon ?? window.icon,
        keywords: ['window', window.id],
        onSelect: () => {
          focusWindow(window.id);
          setCommandOpen(false);
        }
      };
    });
    const workspaceActions = workspaces.map((workspace) => ({
      id: `workspace-${workspace.id}`,
      label: workspace.title,
      group: labels.commandWorkspaces,
      icon: workspace.icon,
      keywords: ['workspace', workspace.id],
      onSelect: () => {
        switchWorkspace(workspace.id);
        setCommandOpen(false);
      }
    }));
    const actionCommands: CommandPaletteAction[] = [
      ...commands,
      {
        id: 'reopen-closed-window',
        label: labels.reopenClosedWindow,
        group: labels.commandActions,
        keywords: ['undo', 'reopen', 'closed', 'window'],
        onSelect: () => {
          reopenClosedWindow();
          setCommandOpen(false);
        }
      }
    ];

    return [...appActions, ...windowActions, ...workspaceActions, ...actionCommands];
  }, [
    apps,
    visibleWindows,
    workspaces,
    commands,
    labels,
    getApp,
    openWindow,
    focusWindow,
    switchWorkspace,
    reopenClosedWindow
  ]);
  const taskbarActiveWindow = getTaskbarWindow(currentWindows, activeWindow);
  const blockedParentIds = new Set<string>();

  visibleWindows
    .filter((window) => window.modal && window.parentId)
    .forEach((window) => {
      getAncestorIds(currentWindows, window.id).forEach((id) => {
        blockedParentIds.add(id);
      });
    });
  const windowZIndex = (window: DesktopWindowState): number =>
    blockedParentIds.has(window.id) ? window.zIndex : getEffectiveZIndex(window);
  const orderedWindows = [...currentWindows].sort(
    (first, second) => windowZIndex(first) - windowZIndex(second)
  );
  const modalBackdrops = currentWindows
    .filter(
      (window) =>
        blockedParentIds.has(window.id) &&
        !window.minimized &&
        isInWorkspace(window, activeWorkspace)
    )
    .map((window) => {
      const children = visibleWindows.filter(
        (candidate) => candidate.parentId === window.id && candidate.modal
      );
      const zIndex =
        children.length > 0
          ? Math.max(...children.map(windowZIndex)) - 1
          : windowZIndex(window) + 1;

      return { id: window.id, windowState: window, zIndex };
    });

  const eventPoint = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ): { x: number; y: number } => {
    const rootRect = rootRef.current?.getBoundingClientRect();
    const native = event.nativeEvent as MouseEvent;
    const hasPoint = native.type === 'contextmenu' || native.type === 'click';
    const fallback = event.currentTarget.getBoundingClientRect();
    const clientX =
      hasPoint && Number.isFinite(native.clientX) ? native.clientX : fallback.left + 24;
    const clientY =
      hasPoint && Number.isFinite(native.clientY) ? native.clientY : fallback.top + 24;

    return {
      x: clientX - (rootRect?.left ?? 0),
      y: clientY - (rootRect?.top ?? 0)
    };
  };

  const openWindowContextMenu = (
    id: string,
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    if (!contextMenuEnabled) {
      return;
    }

    const target = windowsRef.current.find((window) => window.id === id);

    if (!target) {
      return;
    }

    const app = getApp(target);
    const title = windowTitleText(target, app);
    const point = eventPoint(event);
    const entries: DesktopContextMenuEntry[] = [{ type: 'label', key: 'title', label: title }];

    if (!target.modal) {
      const applySnap = (position: DesktopSnapPosition) => {
        if (position === 'maximize') {
          maximizeWindow(id);
          onWindowSnap?.(target, position);
          return;
        }

        const area = getAreaRect(desktopAreaRef.current);
        const zone = getDisplayForBounds(target)?.bounds ?? {
          x: 0,
          y: 0,
          width: area.width,
          height: area.height
        };
        const bounds = resolveSnapBounds(position, zone);

        if (bounds) {
          patchWindow(id, {
            ...bounds,
            x: bounds.x + zone.x,
            y: bounds.y + zone.y,
            maximized: false
          });
          onWindowSnap?.(target, position);
        }
      };

      entries.push({ type: 'separator', key: 'snap-separator' });
      entries.push({ type: 'label', key: 'snap-label', label: labels.snapLayout });

      (
        [
          ['left', labels.snapLeft],
          ['right', labels.snapRight],
          ['top-left', labels.snapTopLeft],
          ['top-right', labels.snapTopRight],
          ['bottom-left', labels.snapBottomLeft],
          ['bottom-right', labels.snapBottomRight],
          ['maximize', labels.snapMaximize]
        ] as [DesktopSnapPosition, string][]
      ).forEach(([position, label]) => {
        entries.push({
          type: 'item',
          key: `snap-${position}`,
          label,
          onSelect: () => applySnap(position)
        });
      });
    }

    if (!target.modal && target.minimizable !== false && app?.minimizable !== false) {
      entries.push({
        type: 'item',
        key: 'minimize',
        label: labels.minimize(title),
        icon: <Icon icon="minus-outline" pack="nebular-essentials" aria-hidden="true" />,
        onSelect: () => minimizeWindow(id)
      });
    }

    if (!target.modal && target.maximizable !== false && app?.maximizable !== false) {
      entries.push({
        type: 'item',
        key: 'maximize',
        label: target.maximized ? labels.restore(title) : labels.maximize(title),
        icon: (
          <Icon
            icon={target.maximized ? 'collapse-outline' : 'expand-outline'}
            pack="nebular-essentials"
            aria-hidden="true"
          />
        ),
        onSelect: () => (target.maximized ? restoreWindow(id) : maximizeWindow(id))
      });
    }

    if (target.closable !== false && app?.closable !== false) {
      entries.push({
        type: 'item',
        key: 'close',
        label: labels.close(title),
        danger: true,
        icon: <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />,
        onSelect: () => closeWindow(id)
      });
    }

    if (workspaces.length > 1 && !target.modal) {
      entries.push({ type: 'separator', key: 'workspaces-separator' });
      entries.push({ type: 'label', key: 'workspaces-label', label: labels.workspaces });

      workspaces
        .filter((workspace) => workspace.id !== (target.workspaceId ?? activeWorkspace))
        .forEach((workspace) => {
          entries.push({
            type: 'item',
            key: `workspace-${workspace.id}`,
            label: labels.moveToWorkspace(workspace.title),
            onSelect: () => moveWindowToWorkspace(id, workspace.id)
          });
        });
    }

    const currentDisplay = getDisplayForBounds(target);

    if (displayMode === 'span' && displayZones.length > 1 && !target.modal) {
      entries.push({ type: 'separator', key: 'displays-separator' });
      entries.push({ type: 'label', key: 'displays-label', label: labels.displays });

      displayZones
        .filter((display) => display.id !== currentDisplay?.id)
        .forEach((display) => {
          entries.push({
            type: 'item',
            key: `display-${display.id}`,
            label: labels.moveToDisplay(display.label ?? display.id),
            onSelect: () => moveWindowToDisplay(id, display.id)
          });
        });
    }

    contextMenuTriggerRef.current = event.currentTarget as HTMLElement;
    setContextMenu({ ...point, label: labels.windowMenu, entries });
  };

  const openGroupContextMenu = (
    group: DesktopTaskbarGroup,
    event: React.MouseEvent<HTMLElement>
  ) => {
    if (!contextMenuEnabled) {
      return;
    }

    event.preventDefault();
    const point = eventPoint(event);
    const entries: DesktopContextMenuEntry[] = [
      { type: 'label', key: 'title', label: group.title }
    ];

    if (group.minimized) {
      entries.push({
        type: 'item',
        key: 'restore-all',
        label: labels.restore(group.title),
        onSelect: () => group.windows.forEach((window) => focusWindow(window.id))
      });
    } else {
      entries.push({
        type: 'item',
        key: 'minimize-all',
        label: labels.minimize(group.title),
        onSelect: () => group.windows.forEach((window) => minimizeWindow(window.id))
      });
    }

    entries.push({
      type: 'item',
      key: 'close-all',
      label: labels.close(group.title),
      danger: true,
      onSelect: () => group.windows.forEach((window) => closeWindow(window.id))
    });

    contextMenuTriggerRef.current = event.currentTarget as HTMLElement;
    setContextMenu({ ...point, label: labels.windowMenu, entries });
  };

  const openGroupMenu = (group: DesktopTaskbarGroup, event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const point = eventPoint(event);
    const entries: DesktopContextMenuEntry[] = [
      { type: 'label', key: 'title', label: group.title }
    ];

    group.windows.forEach((window, index) => {
      const app = getApp(window);
      const title = windowTitleText(window, app, labels.window);
      entries.push({
        type: 'item',
        key: `window-${window.id}`,
        label: group.windows.length > 1 ? labels.windowItem(title, index + 1) : title,
        onSelect: () => focusWindow(window.id)
      });
    });

    contextMenuTriggerRef.current = event.currentTarget as HTMLElement;
    setContextMenu({ ...point, label: labels.windowMenu, entries });
  };

  const handleGroupClick = (group: DesktopTaskbarGroup) => {
    const visible = group.windows.filter((window) => !window.minimized);

    if (visible.length === 0) {
      const target = [...group.windows].sort(
        (first, second) => getEffectiveZIndex(first) - getEffectiveZIndex(second)
      )[group.windows.length - 1];
      if (target) {
        focusWindow(target.id);
      }
      return;
    }

    if (group.active && visible.length === 1) {
      minimizeWindow(visible[0].id);
      return;
    }

    const ordered = [...visible].sort(
      (first, second) => getEffectiveZIndex(first) - getEffectiveZIndex(second)
    );
    const currentIndex = ordered.findIndex((window) => window.id === activeWindow?.id);
    const next =
      currentIndex === -1
        ? ordered[ordered.length - 1]
        : ordered[(currentIndex + 1) % ordered.length];
    focusWindow(next.id);
  };

  const openOverflowMenu = (
    groups: DesktopTaskbarGroup[],
    event: React.MouseEvent<HTMLElement>
  ) => {
    event.preventDefault();
    const point = eventPoint(event);
    const entries: DesktopContextMenuEntry[] = [
      { type: 'label', key: 'title', label: labels.apps }
    ];

    groups.forEach((group) => {
      entries.push({
        type: 'item',
        key: `group-${group.key}`,
        label:
          group.windows.length > 1
            ? labels.windowGroup(group.title, group.windows.length)
            : group.title,
        onSelect: () => handleGroupClick(group)
      });
    });

    contextMenuTriggerRef.current = event.currentTarget as HTMLElement;
    setContextMenu({ ...point, label: labels.windowMenu, entries });
  };

  const handleRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (commandPalette && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      setCommandOpen((open) => !open);
      return;
    }

    if (event.key === 'Escape' && overviewOpen) {
      event.preventDefault();
      setOverviewOpen(false);
      return;
    }

    if (!keyboardShortcuts || !event.altKey || event.key !== 'Tab') {
      return;
    }

    if (visibleWindows.length < 2) {
      return;
    }

    event.preventDefault();
    if (launcherOpen) {
      setLauncherOpen(false);
    }
    if (contextMenu) {
      setContextMenu(null);
    }
    if (commandOpen) {
      setCommandOpen(false);
    }
    if (overviewOpen) {
      setOverviewOpen(false);
    }
    const currentIndex = visibleWindows.findIndex((window) => window.id === activeWindow?.id);
    const offset = event.shiftKey ? -1 : 1;
    const next =
      visibleWindows[(currentIndex + offset + visibleWindows.length) % visibleWindows.length];
    focusWindow(next.id);
  };

  const toggleLauncher = () => setLauncherOpen((open) => !open);
  const closeLauncher = () => {
    setLauncherOpen(false);
    startButtonRef.current?.focus();
  };
  const handleOpenApp = (appId: string) => {
    openWindow({ appId });
    setLauncherOpen(false);
  };
  const handleWindowSnap = (id: string, position: DesktopSnapPosition) => {
    const target = windowsRef.current.find((window) => window.id === id);
    if (target) {
      onWindowSnap?.(target, position);
    }
  };

  const taskbarPositionClass = {
    bottom: classes.taskbarBottom,
    top: classes.taskbarTop,
    left: classes.taskbarLeft,
    right: classes.taskbarRight
  }[taskbarPosition];
  const clockValue =
    clock ??
    (now
      ? now.toLocaleTimeString(locale, clockFormat ?? { hour: '2-digit', minute: '2-digit' })
      : '--:--');

  return (
    <DesktopContext.Provider value={desktopContext}>
      <div
        {...others}
        ref={mergedRef}
        className={cx(
          classes.root,
          taskbarPositionClass,
          {
            [classes.fullscreen]: fullscreen
          },
          className
        )}
        style={
          {
            ...style,
            '--desktop-taskbar-size': `${taskbarSize}px`,
            '--desktop-animation-duration': animation ? undefined : '0ms',
            '--desktop-window-min-width': `${minWindowWidth}px`,
            '--desktop-window-min-height': `${minWindowHeight}px`,
            '--desktop-wallpaper': activeWorkspaceTheme?.background,
            '--desktop-accent': activeWorkspaceTheme?.accentColor
          } as React.CSSProperties
        }
        role="region"
        aria-label={ariaLabel}
        data-taskbar-position={taskbarPosition}
        data-compact={isCompact || undefined}
        onKeyDown={(event) => {
          onKeyDownProp?.(event);
          if (!event.defaultPrevented) {
            handleRootKeyDown(event);
          }
        }}
      >
        <div
          ref={desktopAreaRef}
          className={cx(classes.desktop)}
          data-desktop-area="true"
          tabIndex={-1}
        >
          <div className={cx(classes.icons)}>
            {icons.map((icon) => {
              const app = icon.appId ? appsById.get(icon.appId) : undefined;

              return (
                <button
                  key={icon.id}
                  type="button"
                  className={cx(classes.iconButton)}
                  style={
                    icon.x !== undefined || icon.y !== undefined
                      ? {
                          position: 'absolute',
                          left: icon.x,
                          top: icon.y
                        }
                      : undefined
                  }
                  aria-label={icon.label}
                  onClick={() => {
                    if (icon.onOpen) {
                      icon.onOpen();
                    } else if (icon.appId) {
                      openWindow({ appId: icon.appId });
                    }
                    onIconOpen?.(icon);
                  }}
                >
                  <span className={cx(classes.iconGlyph)} aria-hidden="true">
                    {icon.icon ?? app?.icon}
                  </span>
                  <span className={cx(classes.iconLabel)}>{icon.label}</span>
                </button>
              );
            })}
          </div>
          {displayZones.map((display) => (
            <div
              key={display.id}
              className={cx(classes.displayZone)}
              style={{
                left: display.bounds.x,
                top: display.bounds.y,
                width: display.bounds.width,
                height: display.bounds.height
              }}
              data-desktop-display-id={display.id}
              aria-hidden="true"
            />
          ))}
          {snapPreview && (
            <div
              className={cx(classes.snapPreview)}
              style={{
                left: snapPreview.x,
                top: snapPreview.y,
                width: snapPreview.width,
                height: snapPreview.height
              }}
              aria-hidden="true"
            />
          )}
          {modalBackdrops.map((backdrop) => (
            <div
              key={`backdrop-${backdrop.id}`}
              className={cx(classes.modalBackdrop)}
              style={
                backdrop.windowState.maximized
                  ? { inset: 0, zIndex: backdrop.zIndex }
                  : {
                      left: backdrop.windowState.x,
                      top: backdrop.windowState.y,
                      width: backdrop.windowState.width,
                      height: backdrop.windowState.height,
                      zIndex: backdrop.zIndex
                    }
              }
              aria-hidden="true"
            />
          ))}
          {orderedWindows.map((windowState) => {
            const hidden = windowState.minimized || !isInWorkspace(windowState, activeWorkspace);
            const display = getDisplayForBounds(windowState);

            return (
              <DesktopWindowFrame
                key={windowState.id}
                windowState={windowState}
                app={getApp(windowState)}
                labels={labels}
                areaRef={desktopAreaRef}
                minWidth={minWindowWidth}
                minHeight={minWindowHeight}
                hasModalChild={!hidden && blockedParentIds.has(windowState.id)}
                active={!hidden && activeWindow?.id === windowState.id}
                hidden={hidden}
                zIndex={windowZIndex(windowState)}
                displayBounds={display?.bounds}
                maximizedBounds={display?.bounds}
                snapThreshold={snapThreshold}
                keepInBounds={keepInBounds}
                onPromote={promoteWindow}
                onUpdate={patchWindow}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onMaximize={maximizeWindow}
                onRestore={restoreWindow}
                onSnap={handleWindowSnap}
                onSnapPreview={setSnapPreview}
                onContextMenu={openWindowContextMenu}
                onSetWindowState={setWindowState}
                onSetActiveTab={setActiveTab}
                onCloseTab={closeTab}
                onTearOffTab={tearOffTab}
                openWindow={openWindow}
                classNames={classNames}
                styles={styles}
                unstyled={unstyled}
              />
            );
          })}
          {overviewOpen && (
            <div className={cx(classes.overview)} role="dialog" aria-label={labels.overview}>
              <div className={cx(classes.overviewHeader)}>
                <span>{labels.overview}</span>
                <button
                  type="button"
                  className={cx(classes.windowControl)}
                  aria-label={labels.closeOverview}
                  onClick={() => setOverviewOpen(false)}
                >
                  <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
                </button>
              </div>
              <div className={cx(classes.overviewGrid)}>
                {visibleWindows.map((windowState) => {
                  const app = getApp(windowState);
                  const title = windowTitleText(windowState, app, labels.window);

                  return (
                    <button
                      key={windowState.id}
                      type="button"
                      className={cx(classes.overviewCard)}
                      onClick={() => {
                        focusWindow(windowState.id);
                        setOverviewOpen(false);
                      }}
                    >
                      <span className={cx(classes.overviewCardTitle)}>
                        {(app?.icon ?? windowState.icon) && (
                          <span className={cx(classes.windowIcon)} aria-hidden="true">
                            {app?.icon ?? windowState.icon}
                          </span>
                        )}
                        {title}
                      </span>
                      <span className={cx(classes.overviewCardMeta)}>
                        {windowState.minimized
                          ? labels.minimizedAnnouncement(title)
                          : windowState.maximized
                            ? labels.maximizedAnnouncement(title)
                            : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <DesktopTaskbar
          apps={apps}
          windows={currentWindows}
          activeWorkspace={activeWorkspace}
          workspaces={workspaces}
          labels={labels}
          taskbarPosition={taskbarPosition}
          compact={isCompact}
          showClock={showClock}
          clockValue={clockValue}
          systemTray={systemTray}
          taskbarActions={taskbarActions}
          showLauncher={showLauncher}
          launcherOpen={launcherOpen}
          startButtonRef={startButtonRef}
          launcherRef={launcherRef}
          recentAppIds={recentAppIds}
          onToggleLauncher={toggleLauncher}
          onCloseLauncher={closeLauncher}
          onOpenApp={handleOpenApp}
          groupTaskbar={groupTaskbar}
          maxTaskbarItems={maxTaskbarItems}
          activeWindowId={taskbarActiveWindow?.id}
          showWorkspaceSwitcher={workspaces.length > 1}
          onSwitchWorkspace={switchWorkspace}
          onGroupClick={handleGroupClick}
          onGroupContextMenu={openGroupContextMenu}
          onGroupMenu={openGroupMenu}
          onOverflowMenu={openOverflowMenu}
          startMenuSearch={startMenuSearch}
          showOverview={showOverview}
          overviewOpen={overviewOpen}
          onToggleOverview={() => setOverviewOpen((open) => !open)}
          notifications={notifications}
          classNames={classNames}
          styles={styles}
          unstyled={unstyled}
        />
        {contextMenu && (
          <DesktopContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            bounds={{
              width: rootRef.current?.clientWidth ?? 0,
              height: rootRef.current?.clientHeight ?? 0
            }}
            label={contextMenu.label}
            entries={contextMenu.entries}
            onClose={() => {
              setContextMenu(null);
              const trigger = contextMenuTriggerRef.current;
              contextMenuTriggerRef.current = null;
              if (trigger?.isConnected) {
                trigger.focus();
              }
            }}
            classNames={classNames}
            styles={styles}
            unstyled={unstyled}
          />
        )}
        {commandPalette && (
          <CommandPalette
            opened={commandOpen}
            onClose={() => setCommandOpen(false)}
            actions={commandActions}
            placeholder={labels.commandPlaceholder}
            nothingFoundMessage={labels.commandEmpty}
            ariaLabel={labels.commandPlaceholder}
            zIndex={2100000000}
          />
        )}
        <div
          className={cx(classes.visuallyHidden)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </div>
      </div>
    </DesktopContext.Provider>
  );
});

Desktop.displayName = 'Desktop';

export { Desktop };
