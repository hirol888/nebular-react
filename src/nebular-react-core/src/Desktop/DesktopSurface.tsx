import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Desktop } from './Desktop';
import type { DesktopDisplay, DesktopProps, DesktopWindowState } from './Desktop.types';

export interface DesktopSurfaceProps extends Omit<
  DesktopProps,
  | 'windows'
  | 'defaultWindows'
  | 'onWindowsChange'
  | 'displayMode'
  | 'displays'
  | 'layoutAdapter'
  | 'storageKey'
  | 'onLayoutLoaded'
  | 'onLayoutError'
  | 'onLayoutStatusChange'
> {
  /** Display id rendered by this surface. */
  surfaceId: string;
  windows: DesktopWindowState[];
  onWindowsChange(windows: DesktopWindowState[]): void;
  displays: DesktopDisplay[];
  /** Accessible name for this surface region. */
  surfaceLabel?: string;
  /** Called when the surface document enters or leaves fullscreen. */
  onFullscreenChange?(fullscreen: boolean): void;
  /** Called once after the surface mounts (and whenever `surfaceId` changes). */
  onReady?(): void;
  /** Focuses the surface region when it mounts. */
  autoFocus?: boolean;
  /** Rendered when the surface has no windows assigned to its display. */
  emptyState?: React.ReactNode;
}

const surfaceStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 0
};

const emptyStateStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  pointerEvents: 'none'
};

const emptyStateContentStyle: React.CSSProperties = {
  pointerEvents: 'auto'
};

function getPrimaryDisplay(displays: DesktopDisplay[]): DesktopDisplay | undefined {
  return displays.find((display) => display.primary) ?? displays[0];
}

/**
 * Renders one display of a multi-surface desktop. Intended to run inside an auxiliary
 * window opened with `openDesktopSurfaces`; the host owns the shared window list and
 * merges updates from each surface.
 *
 * Windows assigned to displays that no longer exist are ignored instead of being
 * reassigned to this surface: the host decides where orphan windows should land
 * (see `reconcileDesktopWindowDisplays`).
 */
export function DesktopSurface({
  surfaceId,
  windows,
  onWindowsChange,
  displays,
  surfaceLabel,
  onFullscreenChange,
  onReady,
  autoFocus,
  emptyState,
  ...desktopProps
}: DesktopSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const primary = useMemo(() => getPrimaryDisplay(displays), [displays]);
  const display = useMemo(
    () => displays.find((candidate) => candidate.id === surfaceId) ?? primary,
    [displays, surfaceId, primary]
  );
  const effectiveSurfaceId = display?.id;
  const displayIds = useMemo(() => new Set(displays.map((item) => item.id)), [displays]);
  const belongsToSurface = useCallback(
    (window: DesktopWindowState) => {
      if (effectiveSurfaceId === undefined) {
        return false;
      }

      if (window.displayId === undefined) {
        return primary?.id === effectiveSurfaceId;
      }

      return window.displayId === effectiveSurfaceId;
    },
    [effectiveSurfaceId, primary?.id]
  );
  const visibleWindows = useMemo(
    () => windows.filter((window) => belongsToSurface(window)),
    [windows, belongsToSurface]
  );
  const surfaceDisplays = useMemo(() => (display ? [display] : []), [display]);

  useEffect(() => {
    onReadyRef.current?.();
  }, [surfaceId]);

  useEffect(() => {
    if (!onFullscreenChange || typeof document === 'undefined') {
      return undefined;
    }

    const handleFullscreenChange = () => {
      onFullscreenChange(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  useEffect(() => {
    if (autoFocus) {
      rootRef.current?.focus();
    }
  }, [autoFocus]);

  const handleWindowsChange = useCallback(
    (nextWindows: DesktopWindowState[]) => {
      const nextById = new Map<string, DesktopWindowState>();
      nextWindows.forEach((window) => nextById.set(window.id, window));

      const normalize = (window: DesktopWindowState): DesktopWindowState => {
        const displayId =
          window.displayId !== undefined && displayIds.has(window.displayId)
            ? window.displayId
            : (effectiveSurfaceId ?? window.displayId);

        return displayId === window.displayId ? window : { ...window, displayId };
      };

      const merged: DesktopWindowState[] = [];
      const seen = new Set<string>();

      windows.forEach((window) => {
        if (!belongsToSurface(window)) {
          // Preserve windows owned by other surfaces (and orphans) untouched.
          merged.push(window);
          seen.add(window.id);
          return;
        }

        const nextWindow = nextById.get(window.id);

        if (!nextWindow) {
          // The window was closed on this surface.
          return;
        }

        merged.push(normalize(nextWindow));
        seen.add(window.id);
      });

      nextWindows.forEach((window) => {
        if (seen.has(window.id)) {
          // Never duplicate an id or steal a window from another display.
          return;
        }

        merged.push(normalize(window));
        seen.add(window.id);
      });

      onWindowsChange(merged);
    },
    [belongsToSurface, displayIds, effectiveSurfaceId, onWindowsChange, windows]
  );

  const showEmptyState =
    emptyState !== undefined && emptyState !== null && visibleWindows.length === 0;

  return (
    <div data-desktop-surface={surfaceId} style={surfaceStyle}>
      <Desktop
        {...desktopProps}
        ref={rootRef}
        displayMode="span"
        displays={surfaceDisplays}
        fitDisplays
        windows={visibleWindows}
        ariaLabel={surfaceLabel ?? desktopProps.ariaLabel ?? desktopProps['aria-label']}
        tabIndex={autoFocus && desktopProps.tabIndex === undefined ? -1 : desktopProps.tabIndex}
        onWindowsChange={handleWindowsChange}
      />
      {showEmptyState && (
        <div data-desktop-surface-empty="true" style={emptyStateStyle}>
          <div style={emptyStateContentStyle}>{emptyState}</div>
        </div>
      )}
    </div>
  );
}
