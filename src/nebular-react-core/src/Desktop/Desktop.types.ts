import React from 'react';
import { DefaultProps } from '@nebular-react/styles';
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
  /** Shows the app first in the start menu. */
  pinned?: boolean;
  /** Focuses the existing window instead of opening another instance. */
  singleInstance?: boolean;
}

export interface DesktopOpenWindowOptions {
  id?: string;
  appId?: string;
  workspaceId?: string;
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
}

export interface DesktopWorkspace {
  id: string;
  title: string;
  icon?: React.ReactNode;
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
  opened(name: string): string;
  minimizedAnnouncement(name: string): string;
  maximizedAnnouncement(name: string): string;
  restoredAnnouncement(name: string): string;
  closedAnnouncement(name: string): string;
  switchedWorkspace(name: string): string;
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
  apps: DesktopApp[];
  workspaces: DesktopWorkspace[];
  activeWorkspace?: string;
  openWindow(options: DesktopOpenWindowOptions): string;
  closeWindow(id: string): void;
  minimizeWindow(id: string): void;
  maximizeWindow(id: string): void;
  restoreWindow(id: string): void;
  focusWindow(id: string): void;
  switchWorkspace(id: string): void;
  moveWindowToWorkspace(id: string, workspaceId: string): void;
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
