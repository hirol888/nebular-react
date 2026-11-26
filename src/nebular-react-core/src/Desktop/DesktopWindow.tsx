import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useStyles } from './Desktop.styles';
import type {
  DesktopApp,
  DesktopLabels,
  DesktopOpenWindowOptions,
  DesktopSnapPosition,
  DesktopStyleProps,
  DesktopWindowBounds,
  DesktopWindowContextValue,
  DesktopWindowState,
  DesktopWindowTab
} from './Desktop.types';
import { DesktopWindowContext } from './Desktop.context';
import { DesktopWindowErrorBoundary } from './DesktopWindowErrorBoundary';
import {
  clamp,
  focusWindowElement,
  getActiveWindowTab,
  getAreaRect,
  getFocusableElements,
  getSnapPosition,
  resolveSnapBounds,
  windowIconNode,
  windowTabTitleText,
  windowTitleNode,
  windowTitleText
} from './Desktop.utils';
import { Icon } from '../Icon';

export interface DesktopWindowFrameProps extends DesktopStyleProps {
  windowState: DesktopWindowState;
  app?: DesktopApp;
  labels: DesktopLabels;
  areaRef: React.RefObject<HTMLDivElement | null>;
  minWidth: number;
  minHeight: number;
  hasModalChild: boolean;
  active: boolean;
  hidden: boolean;
  zIndex: number;
  displayBounds?: DesktopWindowBounds;
  maximizedBounds?: DesktopWindowBounds;
  snapThreshold: number;
  keepInBounds: boolean;
  onPromote(id: string): void;
  onUpdate(id: string, patch: Partial<DesktopWindowState>): void;
  onClose(id: string): void;
  onMinimize(id: string): void;
  onMaximize(id: string): void;
  onRestore(id: string): void;
  onSnap(id: string, position: DesktopSnapPosition): void;
  onSnapPreview(bounds: DesktopWindowBounds | null): void;
  onContextMenu(id: string, event: React.MouseEvent | React.KeyboardEvent): void;
  onSetWindowState(id: string, state: unknown): void;
  onSetActiveTab(id: string, tabId: string): void;
  onCloseTab(id: string, tabId: string): void;
  onTearOffTab(id: string, tabId: string, position?: { x: number; y: number }): string | undefined;
  openWindow(options: DesktopOpenWindowOptions): string;
}

interface InteractionState {
  mode: 'drag' | 'resize';
  direction?: string;
  startX: number;
  startY: number;
  bounds: DesktopWindowBounds;
  area: ReturnType<typeof getAreaRect>;
}

interface TabInteractionState {
  tabId: string;
  pointerId: number;
  startX: number;
  startY: number;
  dragging: boolean;
}

const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
const TAB_DRAG_THRESHOLD = 6;

function DesktopWindowFrameComponent({
  windowState,
  app,
  labels,
  areaRef,
  minWidth,
  minHeight,
  hasModalChild,
  active,
  hidden,
  zIndex,
  displayBounds,
  maximizedBounds,
  snapThreshold,
  keepInBounds,
  onPromote,
  onUpdate,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  onSnap,
  onSnapPreview,
  onContextMenu,
  onSetWindowState,
  onSetActiveTab,
  onCloseTab,
  onTearOffTab,
  openWindow,
  classNames,
  styles,
  unstyled
}: DesktopWindowFrameProps) {
  const { classes, cx } = useStyles(undefined, {
    name: 'desktop-window',
    classNames,
    styles,
    unstyled
  });
  const frameRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const interactionRef = useRef<InteractionState | null>(null);
  const tabInteractionRef = useRef<TabInteractionState | null>(null);
  const snapRef = useRef<DesktopSnapPosition | null>(null);
  const [draggingTabId, setDraggingTabId] = useState<string | null>(null);
  const tabIdBase = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [snapMenuOpen, setSnapMenuOpen] = useState(false);
  const [snapMenuPosition, setSnapMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [interacting, setInteracting] = useState(false);
  const maximizeButtonRef = useRef<HTMLButtonElement>(null);
  const snapMenuRef = useRef<HTMLDivElement>(null);
  const snapMenuCloseTimerRef = useRef<number | null>(null);
  const snapFocusPendingRef = useRef<'first' | 'last' | null>(null);
  const suppressSnapMenuRef = useRef(false);
  const snapMenuId = `${tabIdBase}-snap-menu`;
  const tabs = windowState.tabs ?? [];
  const activeTab = getActiveWindowTab(windowState);
  const activeTabIndex = activeTab ? tabs.findIndex((tab) => tab.id === activeTab.id) : -1;
  const tabPanelId = `${tabIdBase}-tabpanel`;
  const title = windowTitleText(windowState, app, labels.window);
  const titleContent = windowTitleNode(windowState, app, labels.window);
  const icon = windowIconNode(windowState, app);
  const isMaximized = windowState.maximized;
  const isDraggable = windowState.draggable !== false && app?.draggable !== false;
  const isResizable = windowState.resizable !== false && app?.resizable !== false;
  const canMinimize =
    !windowState.modal && windowState.minimizable !== false && app?.minimizable !== false;
  const canMaximize =
    !windowState.modal && windowState.maximizable !== false && app?.maximizable !== false;
  const minWindowWidth = Math.max(minWidth, app?.minWidth ?? 0);
  const minWindowHeight = Math.max(minHeight, app?.minHeight ?? 0);
  const resizeClassNames: Record<string, string> = {
    n: classes.resizeN,
    s: classes.resizeS,
    e: classes.resizeE,
    w: classes.resizeW,
    ne: classes.resizeNe,
    nw: classes.resizeNw,
    se: classes.resizeSe,
    sw: classes.resizeSw
  };

  const windowContext = useMemo<DesktopWindowContextValue>(
    () => ({
      window: windowState,
      openWindow: (options) => openWindow({ parentId: windowState.id, ...options }),
      closeWindow: () => onClose(windowState.id),
      minimizeWindow: () => onMinimize(windowState.id),
      maximizeWindow: () => onMaximize(windowState.id),
      restoreWindow: () => onRestore(windowState.id),
      setWindowState: (state) => onSetWindowState(windowState.id, state),
      setActiveTab: (tabId) => onSetActiveTab(windowState.id, tabId),
      closeTab: (tabId) => onCloseTab(windowState.id, tabId),
      tearOffTab: (tabId, position) => onTearOffTab(windowState.id, tabId, position)
    }),
    [
      windowState,
      openWindow,
      onClose,
      onMinimize,
      onMaximize,
      onRestore,
      onSetWindowState,
      onSetActiveTab,
      onCloseTab,
      onTearOffTab
    ]
  );

  useLayoutEffect(() => {
    if (hidden || !windowState.modal || !frameRef.current) {
      return;
    }

    if (!frameRef.current.contains(document.activeElement)) {
      focusWindowElement(frameRef.current, { modal: true });
    }
  }, [windowState.id, windowState.modal, hidden]);

  useEffect(() => () => onSnapPreview(null), [onSnapPreview]);

  useEffect(
    () => () => {
      if (snapMenuCloseTimerRef.current !== null) {
        window.clearTimeout(snapMenuCloseTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!snapMenuOpen) {
      return;
    }

    const pending = snapFocusPendingRef.current;

    if (!pending) {
      return;
    }

    snapFocusPendingRef.current = null;
    const items = snapMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');

    if (!items || items.length === 0) {
      return;
    }

    const target = pending === 'first' ? items[0] : items[items.length - 1];
    target?.focus();
  }, [snapMenuOpen]);

  const applyInteraction = (clientX: number, clientY: number) => {
    const interaction = interactionRef.current;

    if (!interaction) {
      return;
    }

    const start = interaction.bounds;
    const dx = clientX - interaction.startX;
    const dy = clientY - interaction.startY;
    const { area } = interaction;

    if (interaction.mode === 'drag') {
      const snapArea = displayBounds ?? {
        x: 0,
        y: 0,
        width: area.width,
        height: area.height
      };
      const position = getSnapPosition(
        clientX - area.left - snapArea.x,
        clientY - area.top - snapArea.y,
        snapArea,
        snapThreshold
      );

      if (position) {
        snapRef.current = position;
        const preview = resolveSnapBounds(position, snapArea);

        if (preview) {
          onSnapPreview({
            ...preview,
            x: preview.x + snapArea.x,
            y: preview.y + snapArea.y
          });
        }
        return;
      }

      if (snapRef.current) {
        snapRef.current = null;
        onSnapPreview(null);
      }

      let x = start.x + dx;
      let y = start.y + dy;

      if (keepInBounds && area.width > 0) {
        x = clamp(x, 0, Math.max(0, area.width - start.width));
      }
      if (keepInBounds && area.height > 0) {
        y = clamp(y, 0, Math.max(0, area.height - start.height));
      }

      onUpdate(windowState.id, { x, y });
      return;
    }

    const direction = interaction.direction ?? '';
    let { x, y, width, height } = start;

    if (direction.includes('e')) {
      width = start.width + dx;
    }
    if (direction.includes('s')) {
      height = start.height + dy;
    }
    if (direction.includes('w')) {
      x = start.x + dx;
      width = start.width - dx;
    }
    if (direction.includes('n')) {
      y = start.y + dy;
      height = start.height - dy;
    }

    width = Math.max(minWindowWidth, width);
    height = Math.max(minWindowHeight, height);

    if (direction.includes('w')) {
      x = start.x + start.width - width;
    }
    if (direction.includes('n')) {
      y = start.y + start.height - height;
    }

    if (keepInBounds && x < 0) {
      width += x;
      x = 0;
    }
    if (keepInBounds && y < 0) {
      height += y;
      y = 0;
    }

    if (keepInBounds && area.width > 0) {
      width = Math.min(width, area.width - x);
    }
    if (keepInBounds && area.height > 0) {
      height = Math.min(height, area.height - y);
    }

    onUpdate(windowState.id, {
      x,
      y,
      width: Math.max(minWindowWidth, width),
      height: Math.max(minWindowHeight, height)
    });
  };

  const beginInteraction = (
    event: React.PointerEvent<HTMLElement>,
    mode: 'drag' | 'resize',
    direction?: string
  ) => {
    if (event.button !== 0 || windowState.minimized || isMaximized) {
      return;
    }
    if (mode === 'drag' && !isDraggable) {
      return;
    }
    if (mode === 'resize' && !isResizable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setInteracting(true);
    interactionRef.current = {
      mode,
      direction,
      startX: event.clientX,
      startY: event.clientY,
      bounds: {
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height
      },
      area: getAreaRect(areaRef.current)
    };
    onPromote(windowState.id);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!interactionRef.current) {
      return;
    }

    event.preventDefault();
    applyInteraction(event.clientX, event.clientY);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    if (!interactionRef.current) {
      return;
    }

    interactionRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setInteracting(false);

    const snap = snapRef.current;
    snapRef.current = null;

    if (snap) {
      onSnapPreview(null);
      if (snap === 'maximize') {
        onMaximize(windowState.id);
      } else {
        const area = getAreaRect(areaRef.current);
        const snapArea = displayBounds ?? {
          x: 0,
          y: 0,
          width: area.width,
          height: area.height
        };
        const bounds = resolveSnapBounds(snap, snapArea);

        if (bounds) {
          onUpdate(windowState.id, {
            ...bounds,
            x: bounds.x + snapArea.x,
            y: bounds.y + snapArea.y,
            maximized: false
          });
        }
      }
      onSnap(windowState.id, snap);
      return;
    }

    onSnapPreview(null);
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLElement>) => {
    interactionRef.current = null;
    snapRef.current = null;
    setInteracting(false);
    onSnapPreview(null);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const focusTabAt = (index: number) => {
    if (tabs.length === 0) {
      return;
    }

    const nextTab = tabs[(index + tabs.length) % tabs.length];
    onSetActiveTab(windowState.id, nextTab.id);
    tabButtonRefs.current.get(nextTab.id)?.focus();
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTabAt(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTabAt(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTabAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusTabAt(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  const beginTabInteraction = (
    event: React.PointerEvent<HTMLButtonElement>,
    tab: DesktopWindowTab
  ) => {
    if (event.button !== 0) {
      return;
    }

    if ((event.target as Element).closest('[data-desktop-tab-close]')) {
      return;
    }

    tabInteractionRef.current = {
      tabId: tab.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);

    if (windowState.activeTabId !== tab.id) {
      onSetActiveTab(windowState.id, tab.id);
    }
    onPromote(windowState.id);
  };

  const handleTabPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const interaction = tabInteractionRef.current;

    if (!interaction) {
      return;
    }

    if (!interaction.dragging) {
      const dx = event.clientX - interaction.startX;
      const dy = event.clientY - interaction.startY;

      if (Math.hypot(dx, dy) < TAB_DRAG_THRESHOLD) {
        return;
      }

      interaction.dragging = true;
      setDraggingTabId(interaction.tabId);
    }

    event.preventDefault();
  };

  const handleTabPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const interaction = tabInteractionRef.current;

    if (!interaction) {
      return;
    }

    tabInteractionRef.current = null;
    setDraggingTabId(null);

    try {
      event.currentTarget.releasePointerCapture?.(interaction.pointerId);
    } catch {
      // Capture may already have been released by the browser.
    }

    if (!interaction.dragging) {
      return;
    }

    const barBounds = tabBarRef.current?.getBoundingClientRect();
    const insideBar =
      !!barBounds &&
      barBounds.width > 0 &&
      barBounds.height > 0 &&
      event.clientX >= barBounds.left &&
      event.clientX <= barBounds.right &&
      event.clientY >= barBounds.top &&
      event.clientY <= barBounds.bottom;

    if (insideBar) {
      return;
    }

    const area = getAreaRect(areaRef.current);
    onTearOffTab(windowState.id, interaction.tabId, {
      x: event.clientX - area.left,
      y: event.clientY - area.top
    });
  };

  const handleTabPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const pointerId = tabInteractionRef.current?.pointerId;
    tabInteractionRef.current = null;
    setDraggingTabId(null);

    if (pointerId !== undefined) {
      try {
        event.currentTarget.releasePointerCapture?.(pointerId);
      } catch {
        // Capture may already have been released by the browser.
      }
    }
  };

  const handleTabClose = (
    event: React.MouseEvent<HTMLButtonElement>,
    tab: DesktopWindowTab,
    index: number
  ) => {
    event.stopPropagation();
    const fallback =
      activeTab && activeTab.id !== tab.id ? activeTab : (tabs[index + 1] ?? tabs[index - 1]);

    onCloseTab(windowState.id, tab.id);

    if (tabs.length > 1 && fallback) {
      tabButtonRefs.current.get(fallback.id)?.focus();
    }
  };

  const toggleMaximize = () => {
    if (!canMaximize) {
      return;
    }

    if (isMaximized) {
      onRestore(windowState.id);
    } else {
      onMaximize(windowState.id);
    }
  };

  const snapWindow = (position: DesktopSnapPosition) => {
    if (position === 'maximize' && !canMaximize) {
      return;
    }

    if (position === 'maximize') {
      onMaximize(windowState.id);
    } else {
      const area = getAreaRect(areaRef.current);
      const snapArea = displayBounds ?? {
        x: 0,
        y: 0,
        width: area.width,
        height: area.height
      };
      const bounds = resolveSnapBounds(position, snapArea);

      if (bounds) {
        onUpdate(windowState.id, {
          ...bounds,
          x: bounds.x + snapArea.x,
          y: bounds.y + snapArea.y,
          maximized: false
        });
      }
    }
    onSnap(windowState.id, position);
  };

  const cancelSnapMenuClose = () => {
    if (snapMenuCloseTimerRef.current !== null) {
      window.clearTimeout(snapMenuCloseTimerRef.current);
      snapMenuCloseTimerRef.current = null;
    }
  };

  const scheduleSnapMenuClose = () => {
    cancelSnapMenuClose();

    snapMenuCloseTimerRef.current = window.setTimeout(() => {
      snapMenuCloseTimerRef.current = null;

      if (!snapMenuRef.current?.contains(document.activeElement)) {
        setSnapMenuOpen(false);
      }
    }, 140);
  };

  const showSnapMenu = () => {
    if (interactionRef.current) {
      return;
    }

    cancelSnapMenuClose();
    const rect = maximizeButtonRef.current?.getBoundingClientRect();
    const menuWidth = 240;
    const maxLeft =
      typeof window === 'undefined' ? 8 : Math.max(8, window.innerWidth - menuWidth - 8);
    const left = rect ? Math.min(Math.max(8, rect.right - menuWidth), maxLeft) : 8;

    setSnapMenuPosition({ top: (rect?.bottom ?? 0) + 6, left });
    setSnapMenuOpen(true);
  };

  const focusMaximizeButton = () => {
    if (!maximizeButtonRef.current) {
      return;
    }

    // Focusing the button reopens the flyout through onFocus; suppress that
    // single programmatic focus so Escape/selection can close it for good.
    suppressSnapMenuRef.current = true;
    maximizeButtonRef.current.focus();
    suppressSnapMenuRef.current = false;
  };

  const closeSnapMenu = (focusButton = false) => {
    cancelSnapMenuClose();
    setSnapMenuOpen(false);

    if (focusButton) {
      focusMaximizeButton();
    }
  };

  const focusSnapMenuItem = (edge: 'first' | 'last') => {
    const items = snapMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');

    if (!items || items.length === 0) {
      return false;
    }

    const target = edge === 'first' ? items[0] : items[items.length - 1];
    target?.focus();
    return !!target;
  };

  const handleSnapMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeSnapMenu(true);
      return;
    }

    const items = Array.from(
      snapMenuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );

    if (items.length === 0) {
      return;
    }

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      event.stopPropagation();
      items[nextIndex]?.focus();
    }
  };

  const applySnapFromMenu = (position: DesktopSnapPosition) => {
    snapWindow(position);
    closeSnapMenu(true);
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isMaximized) {
      if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        onRestore(windowState.id);
      }
      return;
    }

    if (event.altKey && event.shiftKey && isResizable) {
      const step = event.ctrlKey ? 1 : 10;
      const area = getAreaRect(areaRef.current);
      let width = Math.max(minWindowWidth, windowState.width);
      let height = Math.max(minWindowHeight, windowState.height);

      if (event.key === 'ArrowRight') width += step;
      else if (event.key === 'ArrowLeft') width -= step;
      else if (event.key === 'ArrowDown') height += step;
      else if (event.key === 'ArrowUp') height -= step;
      else return;

      event.preventDefault();
      width = Math.max(minWindowWidth, width);
      height = Math.max(minWindowHeight, height);
      if (keepInBounds && area.width > 0) {
        width = Math.min(width, area.width - windowState.x);
      }
      if (keepInBounds && area.height > 0) {
        height = Math.min(height, area.height - windowState.y);
      }
      onUpdate(windowState.id, { width, height });
      return;
    }

    if (event.altKey && isDraggable) {
      const snapByArrow: Record<string, DesktopSnapPosition> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'maximize'
      };
      const position = snapByArrow[event.key];

      if (position) {
        event.preventDefault();
        snapWindow(position);
        return;
      }
    }

    if (!isDraggable) {
      return;
    }

    const step = event.shiftKey ? 1 : 10;
    let dx = 0;
    let dy = 0;

    if (event.key === 'ArrowLeft') dx = -step;
    else if (event.key === 'ArrowRight') dx = step;
    else if (event.key === 'ArrowUp') dy = -step;
    else if (event.key === 'ArrowDown') dy = step;
    else return;

    event.preventDefault();
    const area = getAreaRect(areaRef.current);
    let x = windowState.x + dx;
    let y = windowState.y + dy;

    if (keepInBounds && area.width > 0) {
      x = clamp(x, 0, Math.max(0, area.width - windowState.width));
    }
    if (keepInBounds && area.height > 0) {
      y = clamp(y, 0, Math.max(0, area.height - windowState.height));
    }

    onUpdate(windowState.id, { x, y });
  };

  const handleFrameKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab' && windowState.modal) {
      const focusable = getFocusableElements(frameRef.current);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (focusable.length === 0) {
        event.preventDefault();
        frameRef.current?.focus();
        return;
      }

      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === frameRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    if (event.key === 'F10' && event.shiftKey) {
      event.preventDefault();
      onContextMenu(windowState.id, event);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    onPromote(windowState.id);
    onContextMenu(windowState.id, event);
  };

  const resolvedContent = activeTab
    ? (activeTab.content ?? windowState.content ?? app?.content)
    : (windowState.content ?? app?.content);
  const content =
    typeof resolvedContent === 'function' ? resolvedContent(windowContext) : resolvedContent;
  const resolvedToolbar = windowState.toolbar ?? app?.toolbar;
  const toolbar =
    typeof resolvedToolbar === 'function' ? resolvedToolbar(windowContext) : resolvedToolbar;
  const resolvedFooter = windowState.footer ?? app?.footer;
  const footer =
    typeof resolvedFooter === 'function' ? resolvedFooter(windowContext) : resolvedFooter;
  const style: React.CSSProperties = isMaximized
    ? maximizedBounds
      ? {
          left: maximizedBounds.x,
          top: maximizedBounds.y,
          width: maximizedBounds.width,
          height: maximizedBounds.height,
          zIndex
        }
      : { zIndex }
    : {
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex
      };
  const snapLayouts: { position: DesktopSnapPosition; label: string; wide?: boolean }[] = [
    { position: 'left', label: labels.snapLeft },
    { position: 'right', label: labels.snapRight },
    { position: 'top-left', label: labels.snapTopLeft },
    { position: 'top-right', label: labels.snapTopRight },
    { position: 'bottom-left', label: labels.snapBottomLeft },
    { position: 'bottom-right', label: labels.snapBottomRight },
    { position: 'maximize', label: labels.snapMaximize, wide: true }
  ];
  const snapPreviewClassNames: Record<DesktopSnapPosition, string> = {
    left: classes.snapMiniLeft,
    right: classes.snapMiniRight,
    'top-left': classes.snapMiniTopLeft,
    'top-right': classes.snapMiniTopRight,
    'bottom-left': classes.snapMiniBottomLeft,
    'bottom-right': classes.snapMiniBottomRight,
    maximize: classes.snapMiniMaximize
  };

  return (
    <DesktopWindowContext.Provider value={windowContext}>
      <div
        ref={frameRef}
        className={cx(classes.window, {
          [classes.windowMaximized]: isMaximized,
          [classes.windowBlocked]: hasModalChild,
          [classes.windowInactive]: !active && !hasModalChild,
          [classes.windowInteracting]: interacting
        })}
        style={style}
        role="dialog"
        aria-label={title}
        aria-modal={windowState.modal || undefined}
        aria-hidden={hasModalChild || hidden || undefined}
        inert={hasModalChild || hidden || undefined}
        hidden={hidden || undefined}
        tabIndex={-1}
        data-desktop-window-id={windowState.id}
        onPointerDown={() => onPromote(windowState.id)}
        onKeyDown={handleFrameKeyDown}
        onContextMenu={handleContextMenu}
      >
        <div
          className={cx(classes.titleBar, {
            [classes.titleBarStatic]: !isDraggable || isMaximized,
            [classes.titleBarInactive]: !active && !hasModalChild
          })}
          role="toolbar"
          aria-label={labels.window}
          tabIndex={0}
          onPointerDown={(event) => beginInteraction(event, 'drag')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerCancel}
          onDoubleClick={toggleMaximize}
          onKeyDown={handleTitleKeyDown}
        >
          {icon && (
            <span className={cx(classes.windowIcon)} aria-hidden="true">
              {icon}
            </span>
          )}
          <span className={cx(classes.windowTitle)}>{titleContent}</span>
          <div
            className={cx(classes.windowControls)}
            onPointerDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            {canMinimize && (
              <button
                type="button"
                className={cx(classes.windowControl)}
                aria-label={labels.minimize(title)}
                onClick={() => onMinimize(windowState.id)}
              >
                <Icon icon="minus-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            )}
            {canMaximize && (
              <div
                className={cx(classes.snapLayoutHost)}
                onPointerEnter={() => {
                  cancelSnapMenuClose();
                  showSnapMenu();
                }}
                onPointerLeave={scheduleSnapMenuClose}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    cancelSnapMenuClose();
                    setSnapMenuOpen(false);
                  }
                }}
              >
                <button
                  ref={maximizeButtonRef}
                  type="button"
                  className={cx(classes.windowControl)}
                  aria-label={isMaximized ? labels.restore(title) : labels.maximize(title)}
                  aria-haspopup="menu"
                  aria-expanded={snapMenuOpen}
                  aria-controls={snapMenuOpen ? snapMenuId : undefined}
                  title={labels.snapLayout}
                  onClick={() => {
                    closeSnapMenu();
                    toggleMaximize();
                  }}
                  onFocus={() => {
                    if (!suppressSnapMenuRef.current) {
                      showSnapMenu();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                      event.preventDefault();
                      event.stopPropagation();
                      const edge = event.key === 'ArrowDown' ? 'first' : 'last';

                      if (snapMenuOpen && focusSnapMenuItem(edge)) {
                        return;
                      }

                      snapFocusPendingRef.current = edge;
                      showSnapMenu();
                    }
                  }}
                >
                  <Icon
                    icon={isMaximized ? 'collapse-outline' : 'expand-outline'}
                    pack="nebular-essentials"
                    aria-hidden="true"
                  />
                </button>
                {snapMenuOpen && (
                  <div
                    ref={snapMenuRef}
                    id={snapMenuId}
                    className={cx(classes.snapMenu)}
                    style={snapMenuPosition ?? undefined}
                    role="menu"
                    aria-label={labels.snapLayout}
                    tabIndex={-1}
                    onPointerEnter={cancelSnapMenuClose}
                    onPointerMove={cancelSnapMenuClose}
                    onKeyDown={handleSnapMenuKeyDown}
                  >
                    {snapLayouts.map((option) => (
                      <button
                        key={option.position}
                        type="button"
                        role="menuitem"
                        className={cx(classes.snapMenuItem, {
                          [classes.snapMenuItemWide]: option.wide
                        })}
                        aria-label={option.label}
                        title={option.label}
                        tabIndex={-1}
                        onClick={() => applySnapFromMenu(option.position)}
                      >
                        <span
                          className={cx(classes.snapMini, {
                            [classes.snapMiniWide]: option.wide
                          })}
                          aria-hidden="true"
                        >
                          <span
                            className={cx(
                              classes.snapMiniFill,
                              snapPreviewClassNames[option.position]
                            )}
                          />
                        </span>
                        <span className={cx(classes.snapMenuLabel)}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {windowState.closable !== false && app?.closable !== false && (
              <button
                type="button"
                className={cx(classes.windowControl, classes.windowControlClose)}
                aria-label={labels.close(title)}
                onClick={() => onClose(windowState.id)}
              >
                <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {tabs.length > 0 && (
          <div
            ref={tabBarRef}
            className={cx(classes.tabBar)}
            onPointerMove={handleTabPointerMove}
            onPointerUp={handleTabPointerEnd}
            onPointerCancel={handleTabPointerCancel}
          >
            <div role="tablist" aria-label={labels.tabList} className={cx(classes.tabList)}>
              {tabs.map((tab, index) => {
                const selected = tab.id === activeTab?.id;

                return (
                  <button
                    key={tab.id}
                    ref={(element) => {
                      if (element) {
                        tabButtonRefs.current.set(tab.id, element);
                      } else {
                        tabButtonRefs.current.delete(tab.id);
                      }
                    }}
                    type="button"
                    role="tab"
                    id={`${tabIdBase}-tab-${index}`}
                    className={cx(classes.tabButton, {
                      [classes.tabActive]: selected,
                      [classes.tabDragging]: draggingTabId === tab.id
                    })}
                    style={{ gridColumn: index + 1, gridRow: 1 }}
                    aria-selected={selected}
                    aria-controls={tabPanelId}
                    tabIndex={selected ? 0 : -1}
                    title={typeof tab.title === 'string' ? tab.title : undefined}
                    data-desktop-window-tab={tab.id}
                    onClick={() => onSetActiveTab(windowState.id, tab.id)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    onPointerDown={(event) => beginTabInteraction(event, tab)}
                  >
                    {tab.icon && (
                      <span className={cx(classes.windowIcon)} aria-hidden="true">
                        {tab.icon}
                      </span>
                    )}
                    <span className={cx(classes.tabTitle)}>{tab.title}</span>
                  </button>
                );
              })}
            </div>
            {tabs.map((tab, index) =>
              tab.closable === false ? null : (
                <button
                  key={`close-${tab.id}`}
                  type="button"
                  className={cx(classes.tabClose, {
                    [classes.tabCloseActive]: tab.id === activeTab?.id
                  })}
                  style={{ gridColumn: index + 1, gridRow: 1 }}
                  data-desktop-tab-close="true"
                  tabIndex={tab.id === activeTab?.id ? 0 : -1}
                  aria-label={labels.closeTab(windowTabTitleText(tab, labels.window))}
                  onClick={(event) => handleTabClose(event, tab, index)}
                >
                  <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
                </button>
              )
            )}
          </div>
        )}
        {toolbar != null && (
          <div className={cx(classes.windowToolbar)} data-desktop-window-toolbar="true">
            {toolbar}
          </div>
        )}
        <div
          className={cx(classes.windowBody)}
          data-desktop-window-body="true"
          role={tabs.length > 0 ? 'tabpanel' : undefined}
          id={tabs.length > 0 ? tabPanelId : undefined}
          aria-labelledby={
            tabs.length > 0 && activeTabIndex >= 0
              ? `${tabIdBase}-tab-${activeTabIndex}`
              : undefined
          }
          tabIndex={tabs.length > 0 ? 0 : undefined}
        >
          <DesktopWindowErrorBoundary
            resetKey={activeTab ? `${windowState.id}:${activeTab.id}` : windowState.id}
            message={labels.windowError}
            reloadLabel={labels.reloadWindow}
            className={cx(classes.windowError)}
            actionClassName={cx(classes.windowErrorAction)}
          >
            {content}
          </DesktopWindowErrorBoundary>
        </div>
        {footer != null && (
          <div className={cx(classes.windowFooter)} data-desktop-window-footer="true">
            {footer}
          </div>
        )}
        {isResizable && !isMaximized && (
          <>
            {RESIZE_DIRECTIONS.map((direction) => (
              <span
                key={direction}
                className={cx(classes.resizeHandle, resizeClassNames[direction])}
                aria-hidden="true"
                onPointerDown={(event) => beginInteraction(event, 'resize', direction)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerCancel}
              />
            ))}
          </>
        )}
      </div>
    </DesktopWindowContext.Provider>
  );
}

export const DesktopWindowFrame = React.memo(DesktopWindowFrameComponent);
DesktopWindowFrame.displayName = 'DesktopWindowFrame';
