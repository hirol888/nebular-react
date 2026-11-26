import type { ReactNode } from 'react';
import type {
  DesktopApp,
  DesktopSnapPosition,
  DesktopWindowBounds,
  DesktopWindowState
} from './Desktop.types';

export const DEFAULT_WINDOW_WIDTH = 520;
export const DEFAULT_WINDOW_HEIGHT = 360;
export const CASCADE_OFFSET = 26;
export const ALWAYS_ON_TOP_OFFSET = 1_000_000_000;
export const Z_INDEX_STEP = 10;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',');

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function windowTitleText(
  window: DesktopWindowState,
  app: DesktopApp | undefined,
  fallback: string = 'Window'
): string {
  if (app?.title) {
    return app.title;
  }

  if (typeof window.title === 'string' && window.title) {
    return window.title;
  }

  return fallback;
}

export function windowTitleNode(
  window: DesktopWindowState,
  app: DesktopApp | undefined,
  fallback: string
): ReactNode {
  return app?.title ?? window.title ?? fallback;
}

export function windowIconNode(window: DesktopWindowState, app: DesktopApp | undefined): ReactNode {
  return app?.icon ?? window.icon;
}

export function getEffectiveZIndex(window: DesktopWindowState): number {
  return window.zIndex + (window.alwaysOnTop ? ALWAYS_ON_TOP_OFFSET : 0);
}

export function getNextZIndex(windows: DesktopWindowState[]): number {
  return Math.max(0, ...windows.map((window) => window.zIndex)) + Z_INDEX_STEP;
}

export function sortByZIndex(windows: DesktopWindowState[]): DesktopWindowState[] {
  return [...windows].sort(
    (first, second) => getEffectiveZIndex(first) - getEffectiveZIndex(second)
  );
}

export function getDescendantIds(windows: DesktopWindowState[], id: string): Set<string> {
  const ids = new Set<string>([id]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const window of windows) {
      if (window.parentId && ids.has(window.parentId) && !ids.has(window.id)) {
        ids.add(window.id);
        changed = true;
      }
    }
  }

  return ids;
}

export function getAncestorIds(windows: DesktopWindowState[], id: string): Set<string> {
  const ids = new Set<string>();
  let current = windows.find((window) => window.id === id);

  while (current?.parentId && !ids.has(current.parentId)) {
    const { parentId } = current;
    ids.add(parentId);
    let parent: DesktopWindowState | undefined;

    for (const window of windows) {
      if (window.id === parentId) {
        parent = window;
        break;
      }
    }

    current = parent;
  }

  return ids;
}

export function getVisibleModalDescendant(
  windows: DesktopWindowState[],
  id: string,
  activeWorkspace?: string
): DesktopWindowState | undefined {
  const ids = getDescendantIds(windows, id);

  return windows
    .filter(
      (window) =>
        window.id !== id &&
        window.modal &&
        !window.minimized &&
        ids.has(window.id) &&
        isInWorkspace(window, activeWorkspace)
    )
    .sort((first, second) => second.zIndex - first.zIndex)[0];
}

export function getTaskbarWindow(
  windows: DesktopWindowState[],
  window: DesktopWindowState | null
): DesktopWindowState | null {
  if (!window) {
    return null;
  }

  let current = window;
  const visited = new Set<string>();

  while (current.modal && current.parentId && !visited.has(current.id)) {
    visited.add(current.id);
    let parent: DesktopWindowState | undefined;

    for (const candidate of windows) {
      if (candidate.id === current.parentId) {
        parent = candidate;
        break;
      }
    }

    if (!parent) {
      break;
    }

    if (!parent.modal) {
      return parent;
    }

    current = parent;
  }

  return current;
}

export function getWindowKey(window: DesktopWindowState, groupTaskbar: boolean): string {
  return groupTaskbar ? (window.appId ?? window.id) : window.id;
}

export function isInWorkspace(
  window: DesktopWindowState,
  activeWorkspace: string | undefined
): boolean {
  if (!activeWorkspace) {
    return true;
  }

  return (window.workspaceId ?? activeWorkspace) === activeWorkspace;
}

export interface DesktopAreaRect {
  width: number;
  height: number;
}

export function getFocusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) {
    return [];
  }

  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getAttribute('aria-hidden') !== 'true'
  );
}

export function focusWindowElement(
  windowElement: HTMLElement | null,
  options: { modal?: boolean } = {}
): void {
  if (!windowElement) {
    return;
  }

  const initial = windowElement.querySelector<HTMLElement>(
    '[data-focus-initial], [data-focusInitial]'
  );

  if (initial) {
    initial.focus();
    return;
  }

  if (options.modal) {
    const focusable = getFocusableElements(windowElement).filter(
      (element) => element !== windowElement
    );

    if (focusable.length > 0) {
      focusable[0].focus();
      return;
    }
  }

  windowElement.focus();
}

export function resolveSnapBounds(
  position: DesktopSnapPosition,
  area: DesktopAreaRect
): DesktopWindowBounds | null {
  const halfWidth = Math.round(area.width / 2);
  const halfHeight = Math.round(area.height / 2);

  switch (position) {
    case 'left':
      return { x: 0, y: 0, width: halfWidth, height: area.height };
    case 'right':
      return { x: halfWidth, y: 0, width: area.width - halfWidth, height: area.height };
    case 'top-left':
      return { x: 0, y: 0, width: halfWidth, height: halfHeight };
    case 'top-right':
      return { x: halfWidth, y: 0, width: area.width - halfWidth, height: halfHeight };
    case 'bottom-left':
      return { x: 0, y: halfHeight, width: halfWidth, height: area.height - halfHeight };
    case 'bottom-right':
      return {
        x: halfWidth,
        y: halfHeight,
        width: area.width - halfWidth,
        height: area.height - halfHeight
      };
    default:
      return null;
  }
}

export function getSnapPosition(
  pointerX: number,
  pointerY: number,
  area: DesktopAreaRect,
  threshold: number
): DesktopSnapPosition | null {
  if (area.width <= 0 || area.height <= 0) {
    return null;
  }

  const nearLeft = pointerX <= threshold;
  const nearRight = pointerX >= area.width - threshold;
  const nearTop = pointerY <= threshold;
  const nearBottom = pointerY >= area.height - threshold;

  if (nearTop && nearLeft) {
    return 'top-left';
  }
  if (nearTop && nearRight) {
    return 'top-right';
  }
  if (nearBottom && nearLeft) {
    return 'bottom-left';
  }
  if (nearBottom && nearRight) {
    return 'bottom-right';
  }
  if (nearTop) {
    return 'maximize';
  }
  if (nearLeft) {
    return 'left';
  }
  if (nearRight) {
    return 'right';
  }

  return null;
}

export function clampBounds(
  bounds: DesktopWindowBounds,
  area: DesktopAreaRect,
  minWidth: number,
  minHeight: number
): DesktopWindowBounds {
  if (area.width <= 0 || area.height <= 0) {
    return bounds;
  }

  const width = clamp(bounds.width, Math.min(minWidth, area.width), area.width);
  const height = clamp(bounds.height, Math.min(minHeight, area.height), area.height);

  return {
    x: clamp(bounds.x, 0, Math.max(0, area.width - width)),
    y: clamp(bounds.y, 0, Math.max(0, area.height - height)),
    width,
    height
  };
}

interface PersistedWindow extends Omit<DesktopWindowState, 'content' | 'icon' | 'title'> {
  title?: string;
}

interface PersistedDesktop {
  version: 1;
  windows: PersistedWindow[];
  activeWorkspace?: string;
}

export interface StoredDesktop {
  windows: DesktopWindowState[];
  activeWorkspace?: string;
}

export function readStoredDesktop(
  storageKey: string | undefined,
  apps: DesktopApp[]
): StoredDesktop | null {
  if (!storageKey || typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedDesktop;

    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.windows)) {
      return null;
    }

    const appsById = new Map(apps.map((app) => [app.id, app]));

    return {
      activeWorkspace:
        typeof parsed.activeWorkspace === 'string' ? parsed.activeWorkspace : undefined,
      windows: parsed.windows
        .filter((window) => !!window && typeof window.id === 'string')
        .map((window) => {
          const app = window.appId ? appsById.get(window.appId) : undefined;
          const finite = (value: number | undefined, fallback: number) =>
            Number.isFinite(value) ? (value as number) : fallback;

          return {
            ...window,
            x: finite(window.x, 48),
            y: finite(window.y, 48),
            width: Math.max(1, finite(window.width, DEFAULT_WINDOW_WIDTH)),
            height: Math.max(1, finite(window.height, DEFAULT_WINDOW_HEIGHT)),
            title: window.title ?? app?.title,
            minimized: !!window.minimized,
            maximized: !!window.maximized,
            zIndex: finite(window.zIndex, 0),
            content: app?.content
          } satisfies DesktopWindowState;
        })
    };
  } catch {
    return null;
  }
}

export function writeStoredDesktop(
  storageKey: string | undefined,
  windows: DesktopWindowState[],
  activeWorkspace?: string
): void {
  if (!storageKey || typeof window === 'undefined') {
    return;
  }

  try {
    const persisted: PersistedDesktop = {
      version: 1,
      activeWorkspace,
      windows: windows.map((window) => {
        const { content: _content, icon: _icon, title, ...rest } = window;

        return {
          ...rest,
          title: typeof title === 'string' ? title : undefined
        };
      })
    };

    window.localStorage.setItem(storageKey, JSON.stringify(persisted));
  } catch {
    // Storage can be unavailable (private mode, quota); persistence is best-effort.
  }
}

export function getAreaRect(element: HTMLElement | null): DesktopAreaRect & {
  left: number;
  top: number;
} {
  const bounds = element?.getBoundingClientRect();

  return {
    width: bounds?.width ?? 0,
    height: bounds?.height ?? 0,
    left: bounds?.left ?? 0,
    top: bounds?.top ?? 0
  };
}

export function findWindowElement(root: HTMLElement | null, id: string): HTMLElement | null {
  if (!root) {
    return null;
  }

  return (
    Array.from(root.querySelectorAll<HTMLElement>('[data-desktop-window-id]')).find(
      (element) => element.getAttribute('data-desktop-window-id') === id
    ) ?? null
  );
}

export function findTaskbarButton(root: HTMLElement | null, key: string): HTMLElement | null {
  if (!root) {
    return null;
  }

  return (
    Array.from(root.querySelectorAll<HTMLElement>('[data-desktop-taskbar-key]')).find(
      (element) => element.getAttribute('data-desktop-taskbar-key') === key
    ) ?? null
  );
}
