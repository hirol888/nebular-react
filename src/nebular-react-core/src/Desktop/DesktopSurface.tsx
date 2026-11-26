import React, { useMemo } from 'react';
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
}

/**
 * Renders one display of a multi-surface desktop. Intended to run inside an auxiliary
 * window opened with `openDesktopSurfaces`; the host owns the shared window list and
 * merges updates from each surface.
 */
export function DesktopSurface({
  surfaceId,
  windows,
  onWindowsChange,
  displays,
  ...desktopProps
}: DesktopSurfaceProps) {
  const display = useMemo(
    () => displays.find((candidate) => candidate.id === surfaceId),
    [displays, surfaceId]
  );
  const primary = useMemo(
    () => displays.find((candidate) => candidate.primary) ?? displays[0],
    [displays]
  );
  const surfaceDisplays = display ? [display] : primary ? [primary] : [];
  const visibleWindows = useMemo(
    () =>
      windows.filter((window) =>
        window.displayId ? window.displayId === surfaceId : primary?.id === surfaceId
      ),
    [windows, surfaceId, primary?.id]
  );

  return (
    <Desktop
      {...desktopProps}
      displayMode="span"
      displays={surfaceDisplays}
      fitDisplays
      windows={visibleWindows}
      onWindowsChange={(nextWindows) => {
        const surfaceIds = new Set(
          windows
            .filter((window) =>
              window.displayId ? window.displayId === surfaceId : primary?.id === surfaceId
            )
            .map((window) => window.id)
        );
        const untouched = windows.filter((window) => !surfaceIds.has(window.id));
        const tagged = nextWindows.map((window) => ({
          ...window,
          displayId: window.displayId ?? surfaceId
        }));

        onWindowsChange([...untouched, ...tagged]);
      }}
    />
  );
}
