export { Desktop } from './Desktop';
export { useDesktop, useDesktopWindow, useDesktopWindowState } from './Desktop.context';
export { useDesktopDisplays } from './Desktop.displays';
export { DesktopSurface } from './DesktopSurface';
export type { DesktopSurfaceProps } from './DesktopSurface';
export {
  createDesktopSurfaceBus,
  getDesktopSurfaceDisplayId,
  openDesktopSurfaces
} from './Desktop.surfaces';
export {
  createBroadcastLayoutAdapter,
  createLocalStorageLayoutAdapter,
  createMemoryLayoutAdapter,
  createRestLayoutAdapter,
  createSessionStorageLayoutAdapter,
  createVersionedLayoutAdapter,
  deserializeDesktopLayout,
  getDesktopDeviceId,
  serializeDesktopLayout
} from './Desktop.persistence';
export type { UseDesktopDisplaysResult } from './Desktop.displays';
export type { DesktopSurfaceBus, DesktopSurfaceSession } from './Desktop.surfaces';
export type {
  RestLayoutAdapterOptions,
  SerializeDesktopLayoutOptions
} from './Desktop.persistence';
export type { BroadcastLayoutAdapter } from './Desktop.persistence';
export type { VersionedLayoutTransport } from './Desktop.persistence';
export { createBroadcastCollaboration } from './Desktop.collaboration';
export type { DesktopCollaborationAdapter, DesktopCollaborator } from './Desktop.collaboration';
export {
  createDesktopLayoutTemplate,
  createTemplateWindows,
  exportDesktopLayout,
  importDesktopLayout,
  layoutToTemplateSnapshot,
  sanitizeDesktopLayout
} from './Desktop.layouts';
export type { DesktopLayoutTemplate, SanitizeDesktopLayoutOptions } from './Desktop.layouts';
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
  DesktopWindowTab,
  DesktopWorkspace,
  DesktopWorkspaceSnapshot
} from './Desktop.types';
export type { DesktopStylesNames } from './Desktop.styles';
