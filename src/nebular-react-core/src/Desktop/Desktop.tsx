import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Icon } from '../Icon';

export type DesktopTaskbarPosition = 'bottom' | 'top' | 'left' | 'right';

export interface DesktopWindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopWindowState extends DesktopWindowBounds {
  id: string;
  appId?: string;
  title?: React.ReactNode;
  parentId?: string;
  modal?: boolean;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  content?: DesktopWindowContent;
}

export type DesktopWindowContent =
  React.ReactNode | ((context: DesktopWindowContextValue) => React.ReactNode);

export interface DesktopApp {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: DesktopWindowContent;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  /** Focuses the existing window instead of opening another instance. */
  singleInstance?: boolean;
}

export interface DesktopOpenWindowOptions {
  id?: string;
  appId?: string;
  title?: React.ReactNode;
  content?: DesktopWindowContent;
  parentId?: string;
  modal?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
}

export interface DesktopLabels {
  region: string;
  taskbar: string;
  start: string;
  apps: string;
  openApp(name: string): string;
  minimize(name: string): string;
  maximize(name: string): string;
  restore(name: string): string;
  close(name: string): string;
  resize(name: string): string;
  window: string;
  clock: string;
  noApps: string;
}

export interface DesktopWindowContextValue {
  window: DesktopWindowState;
  openWindow(options: DesktopOpenWindowOptions): string;
  closeWindow(): void;
  minimizeWindow(): void;
  maximizeWindow(): void;
  restoreWindow(): void;
}

export interface DesktopContextValue {
  windows: DesktopWindowState[];
  openWindow(options: DesktopOpenWindowOptions): string;
  closeWindow(id: string): void;
  minimizeWindow(id: string): void;
  maximizeWindow(id: string): void;
  restoreWindow(id: string): void;
  focusWindow(id: string): void;
}

const DesktopContext = React.createContext<DesktopContextValue | null>(null);
const DesktopWindowContext = React.createContext<DesktopWindowContextValue | null>(null);

export function useDesktop(): DesktopContextValue {
  const context = React.useContext(DesktopContext);

  if (!context) {
    throw new Error('useDesktop must be used inside <Desktop>');
  }

  return context;
}

export function useDesktopWindow(): DesktopWindowContextValue {
  const context = React.useContext(DesktopWindowContext);

  if (!context) {
    throw new Error('useDesktopWindow must be used inside a Desktop window');
  }

  return context;
}

const useStyles = createStyles((_theme) => ({
  root: {
    position: 'relative',
    display: 'grid',
    width: '100%',
    height: '100%',
    minHeight: '20rem',
    overflow: 'hidden',
    color: 'var(--desktop-text-color, var(--text-basic-color, #222b45))',
    backgroundColor: 'var(--desktop-background-color, #edf1f7)',
    fontFamily: 'var(--desktop-text-font-family, inherit)'
  },

  fullscreen: {
    position: 'fixed',
    inset: 0,
    zIndex: 'var(--desktop-z-index, 1000)' as unknown as number
  },

  taskbarBottom: {
    gridTemplateRows: 'minmax(0, 1fr) var(--desktop-taskbar-size, 2.75rem)',
    gridTemplateAreas: '"desktop" "taskbar"'
  },

  taskbarTop: {
    gridTemplateRows: 'var(--desktop-taskbar-size, 2.75rem) minmax(0, 1fr)',
    gridTemplateAreas: '"taskbar" "desktop"'
  },

  taskbarLeft: {
    gridTemplateColumns: 'var(--desktop-taskbar-size, 2.75rem) minmax(0, 1fr)',
    gridTemplateAreas: '"taskbar desktop"'
  },

  taskbarRight: {
    gridTemplateColumns: 'minmax(0, 1fr) var(--desktop-taskbar-size, 2.75rem)',
    gridTemplateAreas: '"desktop taskbar"'
  },

  desktop: {
    position: 'relative',
    gridArea: 'desktop',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--desktop-wallpaper, #edf1f7)',
    backgroundImage: 'var(--desktop-wallpaper-image, none)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },

  taskbar: {
    position: 'relative',
    zIndex: 2,
    gridArea: 'taskbar',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    minWidth: 0,
    minHeight: 0,
    padding: '0.25rem',
    backgroundColor: 'var(--desktop-taskbar-background-color, rgba(255, 255, 255, 0.94))',
    border: '1px solid var(--desktop-taskbar-border-color, var(--border-basic-color-3, #e4e9f2))',
    backdropFilter: 'var(--desktop-taskbar-backdrop-filter, blur(8px))'
  },

  taskbarVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start'
  },

  taskbarItems: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
    overflowX: 'auto',
    overflowY: 'hidden'
  },

  taskbarItemsVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    overflowX: 'hidden',
    overflowY: 'auto'
  },

  taskbarStart: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    gap: '0.35rem',
    minHeight: '2rem',
    padding: '0.25rem 0.55rem',
    border: 0,
    borderRadius: 'var(--desktop-taskbar-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    fontWeight: 600,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-taskbar-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  taskbarItem: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.4rem',
    flex: '0 1 auto',
    maxWidth: '12rem',
    minWidth: '2rem',
    minHeight: '2rem',
    padding: '0.25rem 0.55rem',
    border: 0,
    borderBottom: '2px solid transparent',
    borderRadius: 'var(--desktop-taskbar-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',

    '&:hover': {
      backgroundColor:
        'var(--desktop-taskbar-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '1px'
    }
  },

  taskbarItemActive: {
    backgroundColor:
      'var(--desktop-taskbar-item-active-background-color, var(--background-basic-color-2, #f7f9fc))',
    borderBottomColor:
      'var(--desktop-taskbar-item-active-border-color, var(--color-primary-500, #3366ff))'
  },

  taskbarItemMinimized: {
    opacity: 0.65
  },

  taskbarIcon: {
    display: 'inline-flex',
    flex: '0 0 auto',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.1rem',
    height: '1.1rem'
  },

  taskbarLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },

  taskbarSpacer: {
    flex: '1 1 auto',
    minWidth: '0.25rem'
  },

  taskbarMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flex: '0 0 auto',
    minWidth: 0
  },

  clock: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: '0 0 auto',
    padding: '0 0.35rem',
    font: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.15,
    color: 'var(--desktop-clock-color, var(--text-hint-color, #8f9bb3))'
  },

  clockTime: {
    color: 'var(--desktop-clock-time-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums'
  },

  tray: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flex: '0 0 auto'
  },

  startMenu: {
    position: 'absolute',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    width: 'var(--desktop-start-menu-width, 16rem)',
    maxHeight: 'min(28rem, 70vh)',
    overflowY: 'auto',
    padding: '0.35rem',
    border:
      '1px solid var(--desktop-start-menu-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-start-menu-radius, 0.5rem)',
    backgroundColor:
      'var(--desktop-start-menu-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--desktop-start-menu-shadow, 0 12px 32px rgba(0, 0, 0, 0.18))'
  },

  startMenuBottom: {
    left: 0,
    bottom: 'calc(100% + 0.25rem)'
  },

  startMenuTop: {
    left: 0,
    top: 'calc(100% + 0.25rem)'
  },

  startMenuLeft: {
    left: 'calc(100% + 0.25rem)',
    bottom: 0
  },

  startMenuRight: {
    right: 'calc(100% + 0.25rem)',
    bottom: 0
  },

  startMenuTitle: {
    padding: '0.35rem 0.5rem',
    color: 'var(--desktop-start-menu-title-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },

  startMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.6rem',
    border: 0,
    borderRadius: 'var(--desktop-start-menu-item-radius, 0.3rem)',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: '0.8375rem',
    textAlign: 'left',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-start-menu-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  startMenuEmpty: {
    padding: '0.75rem 0.5rem',
    color: 'var(--desktop-start-menu-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.8125rem',
    textAlign: 'center'
  },

  window: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 'var(--desktop-window-min-width, 15rem)',
    minHeight: 'var(--desktop-window-min-height, 9rem)',
    overflow: 'hidden',
    border: '1px solid var(--desktop-window-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--desktop-window-radius, 0.45rem)',
    backgroundColor:
      'var(--desktop-window-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--desktop-window-shadow, 0 10px 30px rgba(0, 0, 0, 0.22))',
    outline: 'none'
  },

  windowMaximized: {
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    border: 0
  },

  windowBlocked: {
    filter: 'saturate(0.7)'
  },

  titleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flex: '0 0 auto',
    minHeight: '2.1rem',
    padding: '0.2rem 0.25rem 0.2rem 0.6rem',
    borderBottom:
      '1px solid var(--desktop-window-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--desktop-window-titlebar-background-color, var(--background-basic-color-2, #f7f9fc))',
    cursor: 'grab',
    userSelect: 'none',

    '&:active': {
      cursor: 'grabbing'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-2px'
    }
  },

  titleBarStatic: {
    cursor: 'default'
  },

  windowIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: '1.1rem',
    height: '1.1rem',
    color: 'var(--desktop-window-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  windowTitle: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    color: 'var(--desktop-window-title-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  windowControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.1rem',
    flex: '0 0 auto'
  },

  windowControl: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.65rem',
    padding: 0,
    border: 0,
    borderRadius: '0.2rem',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--desktop-window-control-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '-1px'
    }
  },

  windowControlClose: {
    '&:hover': {
      backgroundColor: 'var(--color-danger-500, #ff3d71)',
      color: '#ffffff'
    }
  },

  windowBody: {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'auto',
    padding: 'var(--desktop-window-body-padding, 0.75rem)'
  },

  resizeHandle: {
    position: 'absolute',
    zIndex: 1,
    touchAction: 'none'
  },

  resizeN: {
    top: -4,
    left: 8,
    right: 8,
    height: 8,
    cursor: 'ns-resize'
  },

  resizeS: {
    bottom: -4,
    left: 8,
    right: 8,
    height: 8,
    cursor: 'ns-resize'
  },

  resizeE: {
    top: 8,
    right: -4,
    bottom: 8,
    width: 8,
    cursor: 'ew-resize'
  },

  resizeW: {
    top: 8,
    left: -4,
    bottom: 8,
    width: 8,
    cursor: 'ew-resize'
  },

  resizeNe: {
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    cursor: 'nesw-resize'
  },

  resizeNw: {
    top: -4,
    left: -4,
    width: 12,
    height: 12,
    cursor: 'nwse-resize'
  },

  resizeSe: {
    bottom: -4,
    right: -4,
    width: 12,
    height: 12,
    cursor: 'nwse-resize'
  },

  resizeSw: {
    bottom: -4,
    left: -4,
    width: 12,
    height: 12,
    cursor: 'nesw-resize'
  },

  modalBackdrop: {
    position: 'absolute',
    backgroundColor: 'var(--desktop-modal-backdrop-color, rgba(0, 0, 0, 0.24))'
  },

  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type DesktopStylesNames = Selectors<typeof useStyles>;

export interface DesktopProps
  extends
    DefaultProps<DesktopStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  apps?: DesktopApp[];
  windows?: DesktopWindowState[];
  defaultWindows?: DesktopWindowState[];
  onWindowsChange?(windows: DesktopWindowState[]): void;
  taskbarPosition?: DesktopTaskbarPosition;
  taskbarSize?: number;
  fullscreen?: boolean;
  showClock?: boolean;
  clock?: React.ReactNode;
  clockFormat?: Intl.DateTimeFormatOptions;
  systemTray?: React.ReactNode;
  taskbarActions?: React.ReactNode;
  showLauncher?: boolean;
  labels?: Partial<DesktopLabels>;
  closeOnEscape?: boolean;
  minWindowWidth?: number;
  minWindowHeight?: number;
  ariaLabel?: string;
}

const defaultProps: Partial<DesktopProps> = {
  apps: [],
  defaultWindows: [],
  taskbarPosition: 'bottom',
  taskbarSize: 44,
  fullscreen: false,
  showClock: true,
  showLauncher: true,
  closeOnEscape: true,
  minWindowWidth: 240,
  minWindowHeight: 160,
  ariaLabel: 'Desktop'
};

const DEFAULT_WINDOW_WIDTH = 520;
const DEFAULT_WINDOW_HEIGHT = 360;
const CASCADE_OFFSET = 26;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function windowTitleText(window: DesktopWindowState, app: DesktopApp | undefined): string {
  if (typeof window.title === 'string' && window.title) {
    return window.title;
  }

  if (typeof app?.title === 'string' && app.title) {
    return app.title;
  }

  return window.id;
}

function getDescendantIds(windows: DesktopWindowState[], id: string): Set<string> {
  const ids = new Set<string>([id]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const windowState of windows) {
      if (windowState.parentId && ids.has(windowState.parentId) && !ids.has(windowState.id)) {
        ids.add(windowState.id);
        changed = true;
      }
    }
  }

  return ids;
}

interface DesktopWindowFrameProps {
  windowState: DesktopWindowState;
  app?: DesktopApp;
  labels: DesktopLabels;
  areaRef: React.RefObject<HTMLDivElement | null>;
  minWidth: number;
  minHeight: number;
  hasModalChild: boolean;
  onUpdate(id: string, patch: Partial<DesktopWindowState>): void;
  onFocus(id: string): void;
  onClose(id: string): void;
  onMinimize(id: string): void;
  onMaximize(id: string): void;
  onRestore(id: string): void;
  openWindow(options: DesktopOpenWindowOptions): string;
}

interface InteractionState {
  mode: 'drag' | 'resize';
  direction?: string;
  startX: number;
  startY: number;
  bounds: DesktopWindowBounds;
}

function DesktopWindowFrame({
  windowState,
  app,
  labels,
  areaRef,
  minWidth,
  minHeight,
  hasModalChild,
  onUpdate,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  openWindow
}: DesktopWindowFrameProps) {
  const { classes, cx } = useStyles(undefined, { name: 'desktop-window' });
  const frameRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<InteractionState | null>(null);
  const title = windowTitleText(windowState, app);
  const isMaximized = windowState.maximized;
  const isDraggable = windowState.draggable !== false && app?.draggable !== false;
  const isResizable = windowState.resizable !== false && app?.resizable !== false;
  const minWindowWidth = Math.max(minWidth, app?.minWidth ?? 0);
  const minWindowHeight = Math.max(minHeight, app?.minHeight ?? 0);
  const windowContext = useMemo<DesktopWindowContextValue>(
    () => ({
      window: windowState,
      openWindow: (options) => openWindow({ parentId: windowState.id, ...options }),
      closeWindow: () => onClose(windowState.id),
      minimizeWindow: () => onMinimize(windowState.id),
      maximizeWindow: () => onMaximize(windowState.id),
      restoreWindow: () => onRestore(windowState.id)
    }),
    [windowState, openWindow, onClose, onMinimize, onMaximize, onRestore]
  );

  useEffect(() => {
    if (windowState.modal) {
      frameRef.current?.focus();
    }
  }, [windowState.id, windowState.modal]);

  const getAreaSize = () => {
    const rect = areaRef.current?.getBoundingClientRect();

    return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
  };

  const applyInteraction = (clientX: number, clientY: number) => {
    const interaction = interactionRef.current;

    if (!interaction) {
      return;
    }

    const start = interaction.bounds;
    const dx = clientX - interaction.startX;
    const dy = clientY - interaction.startY;
    const area = getAreaSize();

    if (interaction.mode === 'drag') {
      let x = start.x + dx;
      let y = start.y + dy;

      if (area.width > 0) {
        x = clamp(x, 0, Math.max(0, area.width - start.width));
      }
      if (area.height > 0) {
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

    if (x < 0) {
      width += x;
      x = 0;
    }
    if (y < 0) {
      height += y;
      y = 0;
    }

    if (area.width > 0) {
      width = Math.min(width, area.width - x);
    }
    if (area.height > 0) {
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
      }
    };
    onFocus(windowState.id);
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
  };

  const toggleMaximize = () => {
    if (windowState.maximizable === false || app?.maximizable === false) {
      return;
    }

    if (isMaximized) {
      onRestore(windowState.id);
    } else {
      onMaximize(windowState.id);
    }
  };

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isMaximized || !isDraggable) {
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
    const area = getAreaSize();
    let x = windowState.x + dx;
    let y = windowState.y + dy;

    if (area.width > 0) {
      x = clamp(x, 0, Math.max(0, area.width - windowState.width));
    }
    if (area.height > 0) {
      y = clamp(y, 0, Math.max(0, area.height - windowState.height));
    }

    onUpdate(windowState.id, { x, y });
  };

  const resolvedContent = windowState.content ?? app?.content;
  const content =
    typeof resolvedContent === 'function' ? resolvedContent(windowContext) : resolvedContent;
  const style: React.CSSProperties = isMaximized
    ? { zIndex: windowState.zIndex }
    : {
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex
      };

  return (
    <DesktopWindowContext.Provider value={windowContext}>
      <div
        ref={frameRef}
        className={cx(classes.window, {
          [classes.windowMaximized]: isMaximized,
          [classes.windowBlocked]: hasModalChild
        })}
        style={style}
        role="dialog"
        aria-label={title}
        aria-modal={windowState.modal || undefined}
        aria-hidden={hasModalChild || undefined}
        inert={hasModalChild || undefined}
        tabIndex={-1}
        data-desktop-window-id={windowState.id}
        onPointerDown={() => onFocus(windowState.id)}
      >
        <div
          className={cx(classes.titleBar, {
            [classes.titleBarStatic]: !isDraggable || isMaximized
          })}
          role="toolbar"
          aria-label={labels.window}
          tabIndex={0}
          onPointerDown={(event) => beginInteraction(event, 'drag')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onDoubleClick={toggleMaximize}
          onKeyDown={handleTitleKeyDown}
        >
          {app?.icon && <span className={cx(classes.windowIcon)}>{app.icon}</span>}
          <span className={cx(classes.windowTitle)}>
            {windowState.title ?? app?.title ?? labels.window}
          </span>
          <div
            className={cx(classes.windowControls)}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {windowState.minimizable !== false && app?.minimizable !== false && (
              <button
                type="button"
                className={cx(classes.windowControl)}
                aria-label={labels.minimize(title)}
                onClick={() => onMinimize(windowState.id)}
              >
                <Icon icon="minus-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            )}
            {windowState.maximizable !== false && app?.maximizable !== false && (
              <button
                type="button"
                className={cx(classes.windowControl)}
                aria-label={isMaximized ? labels.restore(title) : labels.maximize(title)}
                onClick={toggleMaximize}
              >
                <Icon
                  icon={isMaximized ? 'collapse-outline' : 'expand-outline'}
                  pack="nebular-essentials"
                  aria-hidden="true"
                />
              </button>
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
        <div className={cx(classes.windowBody)}>{content}</div>
        {isResizable && !isMaximized && (
          <>
            <span
              className={cx(classes.resizeHandle, classes.resizeN)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 'n')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
            <span
              className={cx(classes.resizeHandle, classes.resizeS)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 's')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
            <span
              className={cx(classes.resizeHandle, classes.resizeE)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 'e')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
            <span
              className={cx(classes.resizeHandle, classes.resizeW)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 'w')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
            <span
              className={cx(classes.resizeHandle, classes.resizeNe)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 'ne')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
            <span
              className={cx(classes.resizeHandle, classes.resizeNw)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 'nw')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
            <span
              className={cx(classes.resizeHandle, classes.resizeSe)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 'se')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
            <span
              className={cx(classes.resizeHandle, classes.resizeSw)}
              aria-hidden="true"
              onPointerDown={(event) => beginInteraction(event, 'resize', 'sw')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            />
          </>
        )}
      </div>
    </DesktopWindowContext.Provider>
  );
}

const _Desktop = forwardRef<HTMLDivElement, DesktopProps>((props, ref) => {
  const {
    apps,
    windows: controlledWindows,
    defaultWindows,
    onWindowsChange,
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
    className,
    classNames,
    styles,
    unstyled,
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
      openApp: (name) => t('desktop.openApp', 'Open {name}', { name }),
      minimize: (name) => t('desktop.minimize', 'Minimize {name}', { name }),
      maximize: (name) => t('desktop.maximize', 'Maximize {name}', { name }),
      restore: (name) => t('desktop.restore', 'Restore {name}', { name }),
      close: (name) => t('desktop.close', 'Close {name}', { name }),
      resize: (name) => t('desktop.resize', 'Resize {name}', { name }),
      window: t('desktop.window', 'Window'),
      clock: t('desktop.clock', 'Clock'),
      noApps: t('desktop.noApps', 'No apps available'),
      ...labelsProp
    }),
    [t, labelsProp]
  );
  const [internalWindows, setInternalWindows] = useState<DesktopWindowState[]>(
    defaultWindows ?? []
  );
  const isControlled = controlledWindows !== undefined;
  const currentWindows = isControlled ? controlledWindows : internalWindows;
  const windowsRef = useRef(currentWindows);
  windowsRef.current = currentWindows;
  const nextZRef = useRef(
    Math.max(0, ...currentWindows.map((windowState) => windowState.zIndex)) + 1
  );
  const idBase = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const idCounterRef = useRef(0);
  const desktopAreaRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLDivElement>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    nextZRef.current = Math.max(
      nextZRef.current,
      ...currentWindows.map((windowState) => windowState.zIndex + 1)
    );
  }, [currentWindows]);

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

  const focusWindow = useCallback(
    (id: string) => {
      updateWindows((windows) =>
        windows.map((windowState) =>
          windowState.id === id ? { ...windowState, zIndex: nextZRef.current++ } : windowState
        )
      );
    },
    [updateWindows]
  );

  const closeWindow = useCallback(
    (id: string) => {
      updateWindows((windows) => {
        const ids = getDescendantIds(windows, id);
        return windows.filter((windowState) => !ids.has(windowState.id));
      });
    },
    [updateWindows]
  );

  const minimizeWindow = useCallback(
    (id: string) => {
      updateWindows((windows) => {
        const ids = getDescendantIds(windows, id);
        return windows.map((windowState) =>
          ids.has(windowState.id)
            ? { ...windowState, minimized: true, maximized: false }
            : windowState
        );
      });
    },
    [updateWindows]
  );

  const maximizeWindow = useCallback(
    (id: string) => {
      updateWindows((windows) =>
        windows.map((windowState) =>
          windowState.id === id
            ? { ...windowState, minimized: false, maximized: true, zIndex: nextZRef.current++ }
            : windowState
        )
      );
    },
    [updateWindows]
  );

  const restoreWindow = useCallback(
    (id: string) => {
      updateWindows((windows) =>
        windows.map((windowState) =>
          windowState.id === id
            ? { ...windowState, minimized: false, maximized: false, zIndex: nextZRef.current++ }
            : windowState
        )
      );
    },
    [updateWindows]
  );

  const appsById = useMemo(() => new Map(apps.map((app) => [app.id, app])), [apps]);

  const openWindow = useCallback(
    (options: DesktopOpenWindowOptions) => {
      const app = options.appId ? appsById.get(options.appId) : undefined;

      if (app?.singleInstance) {
        const existing = windowsRef.current.find(
          (windowState) => windowState.appId === app.id && !windowState.parentId
        );

        if (existing) {
          if (existing.minimized) {
            restoreWindow(existing.id);
          } else {
            focusWindow(existing.id);
          }
          return existing.id;
        }
      }

      const parent = options.parentId
        ? windowsRef.current.find((windowState) => windowState.id === options.parentId)
        : undefined;
      const id = options.id ?? `${idBase}-window-${idCounterRef.current++}`;

      if (windowsRef.current.some((windowState) => windowState.id === id)) {
        focusWindow(id);
        return id;
      }

      const width = options.width ?? app?.defaultWidth ?? DEFAULT_WINDOW_WIDTH;
      const height = options.height ?? app?.defaultHeight ?? DEFAULT_WINDOW_HEIGHT;
      const cascade = windowsRef.current.length % 8;
      const windowState: DesktopWindowState = {
        id,
        appId: options.appId,
        title: options.title ?? app?.title,
        parentId: options.parentId,
        modal: options.modal ?? false,
        x: options.x ?? (parent ? parent.x + 32 : 48 + cascade * CASCADE_OFFSET),
        y: options.y ?? (parent ? parent.y + 32 : 48 + cascade * CASCADE_OFFSET),
        width,
        height,
        minimized: false,
        maximized: false,
        zIndex: nextZRef.current++,
        draggable: options.draggable ?? app?.draggable,
        resizable: options.resizable ?? app?.resizable,
        minimizable: options.minimizable ?? app?.minimizable,
        maximizable: options.maximizable ?? app?.maximizable,
        closable: options.closable ?? app?.closable,
        content: options.content ?? app?.content
      };

      updateWindows((windows) => [...windows, windowState]);
      return id;
    },
    [appsById, focusWindow, idBase, restoreWindow, updateWindows]
  );

  const desktopContext = useMemo<DesktopContextValue>(
    () => ({
      windows: currentWindows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow
    }),
    [
      currentWindows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow
    ]
  );

  const visibleWindows = currentWindows.filter((windowState) => !windowState.minimized);
  const activeWindow = visibleWindows.reduce<DesktopWindowState | null>(
    (active, windowState) => (!active || windowState.zIndex > active.zIndex ? windowState : active),
    null
  );
  const blockedParentIds = new Set(
    visibleWindows
      .filter((windowState) => windowState.modal && windowState.parentId)
      .map((windowState) => windowState.parentId as string)
  );
  const modalBackdrops = currentWindows
    .filter((windowState) => blockedParentIds.has(windowState.id) && !windowState.minimized)
    .map((windowState) => {
      const children = visibleWindows.filter(
        (candidate) => candidate.parentId === windowState.id && candidate.modal
      );
      const backdropZ = Math.max(...children.map((child) => child.zIndex)) - 0.5;

      return {
        id: windowState.id,
        windowState,
        zIndex: backdropZ
      };
    });

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
    if (!closeOnEscape) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (launcherOpen) {
        setLauncherOpen(false);
        return;
      }

      const modal = windowsRef.current
        .filter((windowState) => windowState.modal && !windowState.minimized)
        .sort((first, second) => second.zIndex - first.zIndex)[0];

      if (modal) {
        event.preventDefault();
        closeWindow(modal.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, launcherOpen, closeWindow]);

  const taskbarPositionClass = {
    bottom: classes.taskbarBottom,
    top: classes.taskbarTop,
    left: classes.taskbarLeft,
    right: classes.taskbarRight
  }[taskbarPosition];
  const taskbarVertical = taskbarPosition === 'left' || taskbarPosition === 'right';
  const startMenuPositionClass = {
    bottom: classes.startMenuBottom,
    top: classes.startMenuTop,
    left: classes.startMenuLeft,
    right: classes.startMenuRight
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
        ref={ref}
        className={cx(
          classes.root,
          taskbarPositionClass,
          { [classes.fullscreen]: fullscreen },
          className
        )}
        style={
          {
            ...others.style,
            '--desktop-taskbar-size': `${taskbarSize}px`
          } as React.CSSProperties
        }
        role="region"
        aria-label={ariaLabel}
        data-taskbar-position={taskbarPosition}
      >
        <div ref={desktopAreaRef} className={cx(classes.desktop)} data-desktop-area="true">
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
          {currentWindows
            .filter((windowState) => !windowState.minimized)
            .sort((first, second) => first.zIndex - second.zIndex)
            .map((windowState) => (
              <DesktopWindowFrame
                key={windowState.id}
                windowState={windowState}
                app={windowState.appId ? appsById.get(windowState.appId) : undefined}
                labels={labels}
                areaRef={desktopAreaRef}
                minWidth={minWindowWidth}
                minHeight={minWindowHeight}
                hasModalChild={blockedParentIds.has(windowState.id)}
                onUpdate={(id, patch) =>
                  updateWindows((windows) =>
                    windows.map((candidate) =>
                      candidate.id === id ? { ...candidate, ...patch } : candidate
                    )
                  )
                }
                onFocus={focusWindow}
                onClose={closeWindow}
                onMinimize={minimizeWindow}
                onMaximize={maximizeWindow}
                onRestore={restoreWindow}
                openWindow={openWindow}
              />
            ))}
        </div>
        <div
          className={cx(classes.taskbar, { [classes.taskbarVertical]: taskbarVertical })}
          role="toolbar"
          aria-label={labels.taskbar}
        >
          <div ref={launcherRef} style={{ position: 'relative' }}>
            {showLauncher && (
              <button
                type="button"
                className={cx(classes.taskbarStart)}
                aria-haspopup="menu"
                aria-expanded={launcherOpen}
                aria-label={labels.start}
                onClick={() => setLauncherOpen((open) => !open)}
              >
                <Icon icon="menu-outline" pack="nebular-essentials" aria-hidden="true" />
                {!taskbarVertical && <span>{labels.start}</span>}
              </button>
            )}
            {launcherOpen && (
              <div
                className={cx(classes.startMenu, startMenuPositionClass)}
                role="menu"
                aria-label={labels.apps}
              >
                <div className={cx(classes.startMenuTitle)}>{labels.apps}</div>
                {apps.length === 0 ? (
                  <div className={cx(classes.startMenuEmpty)}>{labels.noApps}</div>
                ) : (
                  apps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      role="menuitem"
                      className={cx(classes.startMenuItem)}
                      onClick={() => {
                        openWindow({ appId: app.id });
                        setLauncherOpen(false);
                      }}
                    >
                      {app.icon && <span className={cx(classes.taskbarIcon)}>{app.icon}</span>}
                      <span>{app.title}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div
            className={cx(classes.taskbarItems, {
              [classes.taskbarItemsVertical]: taskbarVertical
            })}
          >
            {currentWindows.map((windowState) => {
              const app = windowState.appId ? appsById.get(windowState.appId) : undefined;
              const title = windowTitleText(windowState, app);
              const isActive = activeWindow?.id === windowState.id;

              return (
                <button
                  key={windowState.id}
                  type="button"
                  className={cx(classes.taskbarItem, {
                    [classes.taskbarItemActive]: isActive,
                    [classes.taskbarItemMinimized]: windowState.minimized
                  })}
                  aria-pressed={isActive}
                  aria-label={title}
                  title={title}
                  onClick={() => {
                    if (windowState.minimized) {
                      restoreWindow(windowState.id);
                      focusWindow(windowState.id);
                    } else if (isActive) {
                      minimizeWindow(windowState.id);
                    } else {
                      focusWindow(windowState.id);
                    }
                  }}
                >
                  {app?.icon && <span className={cx(classes.taskbarIcon)}>{app.icon}</span>}
                  <span className={cx(classes.taskbarLabel)}>{title}</span>
                </button>
              );
            })}
          </div>
          <div className={cx(classes.taskbarSpacer)} />
          <div className={cx(classes.taskbarMeta)}>
            {taskbarActions}
            {systemTray && <div className={cx(classes.tray)}>{systemTray}</div>}
            {showClock && (
              <div className={cx(classes.clock)} role="status" aria-label={labels.clock}>
                <span className={cx(classes.clockTime)}>{clockValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DesktopContext.Provider>
  );
});

_Desktop.displayName = 'Desktop';

export { _Desktop as Desktop };
