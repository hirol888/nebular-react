export { Desktop } from './Desktop';
export { useDesktop, useDesktopWindow, useDesktopWindowState } from './Desktop.context';
export { useDesktopDisplays } from './Desktop.displays';
export {
  createDesktopSurfaceBus,
  getDesktopSurfaceDisplayId,
  openDesktopSurfaces
} from './Desktop.surfaces';
export {
  createLocalStorageLayoutAdapter,
  createMemoryLayoutAdapter,
  createRestLayoutAdapter,
  createSessionStorageLayoutAdapter,
  deserializeDesktopLayout,
  serializeDesktopLayout
} from './Desktop.persistence';
export type { UseDesktopDisplaysResult } from './Desktop.displays';
export type { DesktopSurfaceBus, DesktopSurfaceSession } from './Desktop.surfaces';
export type {
  RestLayoutAdapterOptions,
  SerializeDesktopLayoutOptions
} from './Desktop.persistence';
export type {
  DesktopApp,
  DesktopContextValue,
  DesktopDisplay,
  DesktopDisplayMode,
  DesktopFileReference,
  DesktopIcon,
  DesktopLabels,
  DesktopLayoutSnapshot,
  DesktopLayoutStatus,
  DesktopLayoutStatusChange,
  DesktopOpenWindowOptions,
  DesktopPersistenceAdapter,
  DesktopProps,
  DesktopSnapPosition,
  DesktopStyleProps,
  DesktopTaskbarPosition,
  DesktopWindowBounds,
  DesktopWindowContent,
  DesktopWindowContextValue,
  DesktopWindowSnapshot,
  DesktopWindowState,
  DesktopWorkspace,
  DesktopWorkspaceSnapshot
} from './Desktop.types';
export type { DesktopStylesNames } from './Desktop.styles';
