import React from 'react';
import { DefaultProps } from '@nebular-react/styles';
import type { CommandPaletteAction } from '../CommandPalette';
import type { NotificationItem } from '../NotificationCenter';
import type { DesktopStylesNames } from './Desktop.styles';

export type DesktopTaskbarPosition = 'bottom' | 'top' | 'left' | 'right';

export type DesktopSnapPosition =
  'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'maximize';

export interface DesktopWindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopWindowState extends DesktopWindowBounds {
  id: string;
  appId?: string;
  workspaceId?: string;
  displayId?: string;
  title?: React.ReactNode;
  icon?: React.ReactNode;
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
  /** Keeps the window above regular windows regardless of focus. */
  alwaysOnTop?: boolean;
  /** Hides the window button from the taskbar. */
  skipTaskbar?: boolean;
  centerOnOpen?: boolean;
  /** Serializable application state (path, tabs, filters, document id, etc.). */
  state?: unknown;
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
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  centerOnOpen?: boolean;
  /** Serializable application state used by `useDesktopWindowState`. */
  defaultState?: unknown;
  /** File extensions (`.md`, `.txt`) that can open this app. */
  fileExtensions?: string[];
  /** Optional taskbar hover preview (thumbnail, mini app, etc.). */
  preview?: React.ReactNode;
  /** Shows the app first in the start menu. */
  pinned?: boolean;
  /** Focuses the existing window instead of opening another instance. */
  singleInstance?: boolean;
}

export interface DesktopOpenWindowOptions {
  id?: string;
  appId?: string;
  workspaceId?: string;
  displayId?: string;
  /** Used by standalone windows; app windows inherit the app title. */
  title?: React.ReactNode;
  /** Used by standalone windows; app windows inherit the app icon. */
  icon?: React.ReactNode;
  content?: DesktopWindowContent;
  parentId?: string;
  modal?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  maximized?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  centerOnOpen?: boolean;
  state?: unknown;
}

export interface DesktopWorkspace {
  id: string;
  title: string;
  icon?: React.ReactNode;
  /** CSS background color applied while the workspace is active. */
  background?: string;
  /** CSS color used as the workspace accent. */
  accentColor?: string;
}

export interface DesktopIcon {
  id: string;
  label: string;
  appId?: string;
  icon?: React.ReactNode;
  x?: number;
  y?: number;
  onOpen?(): void;
}

export interface DesktopFileReference {
  path: string;
  name?: string;
  mimeType?: string;
}

export type DesktopDisplayMode = 'single' | 'span';

export interface DesktopDisplay {
  id: string;
  label?: string;
  /** Bounds in the desktop coordinate space. Negative values are allowed. */
  bounds: DesktopWindowBounds;
  primary?: boolean;
  scaleFactor?: number;
}

export interface DesktopWindowSnapshot {
  id: string;
  appId?: string;
  workspaceId?: string;
  displayId?: string;
  title?: string;
  parentId?: string;
  modal?: boolean;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closable?: boolean;
  alwaysOnTop?: boolean;
  skipTaskbar?: boolean;
  centerOnOpen?: boolean;
  state?: unknown;
}

export interface DesktopWorkspaceSnapshot {
  id: string;
  title: string;
}

export interface DesktopLayoutSnapshot {
  version: 2;
  windows: DesktopWindowSnapshot[];
  workspaces?: DesktopWorkspaceSnapshot[];
  activeWorkspace?: string;
  savedAt?: string;
}

export type DesktopLayoutStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

export interface DesktopLayoutStatusChange {
  status: DesktopLayoutStatus;
  error?: unknown;
}

export interface DesktopPersistenceAdapter {
  load?(signal?: AbortSignal): Promise<DesktopLayoutSnapshot | null> | DesktopLayoutSnapshot | null;
  save(snapshot: DesktopLayoutSnapshot): Promise<void> | void;
  /** Called on pagehide/visibilitychange for best-effort final persistence. */
  flush?(snapshot: DesktopLayoutSnapshot): Promise<void> | void;
  clear?(): Promise<void> | void;
}

export interface DesktopLabels {
  region: string;
  taskbar: string;
  start: string;
  apps: string;
  pinned: string;
  recent: string;
  allApps: string;
  searchApps: string;
  noResults: string;
  openApp(name: string): string;
  minimize(name: string): string;
  maximize(name: string): string;
  restore(name: string): string;
  close(name: string): string;
  resize(name: string): string;
  window: string;
  clock: string;
  noApps: string;
  windowGroup(name: string, count: number): string;
  windowItem(name: string, index: number): string;
  showWindows(name: string): string;
  moreWindows: string;
  windowMenu: string;
  workspace(name: string): string;
  workspaces: string;
  moveToWorkspace(name: string): string;
  displays: string;
  moveToDisplay(name: string): string;
  snapLayout: string;
  snapLeft: string;
  snapRight: string;
  snapTopLeft: string;
  snapTopRight: string;
  snapBottomLeft: string;
  snapBottomRight: string;
  snapMaximize: string;
  opened(name: string): string;
  minimizedAnnouncement(name: string): string;
  maximizedAnnouncement(name: string): string;
  restoredAnnouncement(name: string): string;
  closedAnnouncement(name: string): string;
  switchedWorkspace(name: string): string;
  windowError: string;
  reloadWindow: string;
  commandPlaceholder: string;
  commandEmpty: string;
  commandApps: string;
  commandWindows: string;
  commandWorkspaces: string;
  commandActions: string;
  reopenClosedWindow: string;
  overview: string;
  closeOverview: string;
}

export interface DesktopWindowContextValue {
  window: DesktopWindowState;
  openWindow(options: DesktopOpenWindowOptions): string;
  closeWindow(): void;
  minimizeWindow(): void;
  maximizeWindow(): void;
  restoreWindow(): void;
  setWindowState(state: unknown): void;
}

export interface DesktopContextValue {
  windows: DesktopWindowState[];
  apps: DesktopApp[];
  workspaces: DesktopWorkspace[];
  activeWorkspace?: string;
  displays: DesktopDisplay[];
  displayMode: DesktopDisplayMode;
  openWindow(options: DesktopOpenWindowOptions): string;
  closeWindow(id: string): void;
  minimizeWindow(id: string): void;
  maximizeWindow(id: string): void;
  restoreWindow(id: string): void;
  focusWindow(id: string): void;
  switchWorkspace(id: string): void;
  moveWindowToWorkspace(id: string, workspaceId: string): void;
  moveWindowToDisplay(id: string, displayId: string): void;
  setWindowState(id: string, state: unknown): void;
  openFile(file: DesktopFileReference): string | undefined;
  reopenClosedWindow(): void;
}

export interface DesktopProps
  extends
    DefaultProps<DesktopStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  apps?: DesktopApp[];
  windows?: DesktopWindowState[];
  defaultWindows?: DesktopWindowState[];
  onWindowsChange?(windows: DesktopWindowState[]): void;
  onWindowOpen?(window: DesktopWindowState): void;
  onWindowClose?(window: DesktopWindowState): void;
  onWindowFocus?(window: DesktopWindowState): void;
  onWindowMinimize?(window: DesktopWindowState): void;
  onWindowMaximize?(window: DesktopWindowState): void;
  onWindowRestore?(window: DesktopWindowState): void;
  onWindowSnap?(window: DesktopWindowState, position: DesktopSnapPosition): void;
  onWindowStateChange?(window: DesktopWindowState): void;
  onWindowDisplayChange?(window: DesktopWindowState, displayId: string): void;
  /** Async persistence for the desktop layout (database, REST, etc.). */
  layoutAdapter?: DesktopPersistenceAdapter;
  layoutDebounceMs?: number;
  onLayoutStatusChange?(change: DesktopLayoutStatusChange): void;
  onLayoutLoaded?(snapshot: DesktopLayoutSnapshot): void;
  onLayoutError?(error: unknown): void;
  displayMode?: DesktopDisplayMode;
  displays?: DesktopDisplay[];
  /** Scales physical display layouts to fit the desktop area. */
  fitDisplays?: boolean;
  onDisplayChange?(displayId: string): void;
  /** Shortcuts rendered on the wallpaper. */
  icons?: DesktopIcon[];
  onIconOpen?(icon: DesktopIcon): void;
  /** Enables Ctrl/Cmd+K command palette. */
  commandPalette?: boolean;
  commands?: CommandPaletteAction[];
  /** Shows the overview button in the taskbar. */
  showOverview?: boolean;
  /** Notifications shown in the taskbar notification center. */
  notifications?: NotificationItem[];
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
  /** Distance from the desktop edge, in pixels, that triggers snapping. */
  snapThreshold?: number;
  /** Keeps windows inside the desktop bounds while dragging and resizing. */
  keepInBounds?: boolean;
  /** Enables localStorage persistence of open windows and their bounds. */
  storageKey?: string;
  /** Groups windows of the same app into a single taskbar button. */
  groupTaskbar?: boolean;
  /** Renders the remaining taskbar groups in an overflow menu. */
  maxTaskbarItems?: number;
  /** Enables right-click context menus for windows and taskbar groups. */
  enableContextMenu?: boolean;
  workspaces?: DesktopWorkspace[];
  workspace?: string;
  defaultWorkspace?: string;
  onWorkspaceChange?(workspaceId: string): void;
  /** Forces the compact layout, regardless of the measured width. */
  compact?: boolean;
  /** Switches to the compact layout below `compactBreakpoint`. */
  autoCompact?: boolean;
  compactBreakpoint?: number;
  /** Enables Alt+Tab cycling inside the desktop. */
  keyboardShortcuts?: boolean;
  /** Initial placement for windows that do not specify x/y. */
  initialPosition?: 'cascade' | 'center';
  /** Shows a search field inside the start menu. */
  startMenuSearch?: boolean;
  /** Animates window and menu entrance. */
  animation?: boolean;
}

export type DesktopStyleProps = Pick<DesktopProps, 'classNames' | 'styles' | 'unstyled'>;
