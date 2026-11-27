export { Desktop } from './Desktop';
export { useDesktop, useDesktopWindow, useDesktopWindowState } from './Desktop.context';
export { useDesktopDisplays } from './Desktop.displays';
export { DesktopSurface } from './DesktopSurface';
export type { DesktopSurfaceProps } from './DesktopSurface';
export { DesktopAppFrame } from './DesktopAppFrame';
export type {
  DesktopAppFrameHandle,
  DesktopAppFrameProps,
  DesktopAppFrameSandboxToken,
  DesktopAppFrameStylesNames
} from './DesktopAppFrame';
export {
  DESKTOP_LONG_PRESS_DEFAULT_DELAY,
  DESKTOP_LONG_PRESS_DEFAULT_MOVE_THRESHOLD,
  DESKTOP_SWIPE_DEFAULT_THRESHOLD,
  useLongPress,
  useOnlineStatus,
  useSwipeGesture
} from './Desktop.gestures';
export type {
  DesktopGesturePointerType,
  DesktopLongPressHandlers,
  DesktopSwipeDirection,
  DesktopSwipeHandlers,
  UseLongPressOptions,
  UseLongPressResult,
  UseSwipeGestureOptions,
  UseSwipeGestureResult
} from './Desktop.gestures';
export { DesktopOfflineBanner } from './DesktopOfflineBanner';
export type {
  DesktopOfflineBannerLabels,
  DesktopOfflineBannerPosition,
  DesktopOfflineBannerProps,
  DesktopOfflineBannerStylesNames
} from './DesktopOfflineBanner';
export { DesktopConnectionStatus } from './DesktopConnectionStatus';
export type {
  DesktopConnectionStatusLabels,
  DesktopConnectionStatusProps,
  DesktopConnectionStatusStylesNames
} from './DesktopConnectionStatus';
export {
  createDesktopSurfaceBus,
  getDesktopSurfaceDisplayId,
  openDesktopSurfaces,
  reconcileDesktopWindowDisplays,
  requestDesktopSurfaceFullscreen,
  syncDesktopSurfaces
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
export type {
  DesktopSurfaceBus,
  DesktopSurfaceOpenOptions,
  DesktopSurfaceSession,
  DesktopSurfaceSyncResult
} from './Desktop.surfaces';
export type {
  RestLayoutAdapterOptions,
  SerializeDesktopLayoutOptions
} from './Desktop.persistence';
export type { BroadcastLayoutAdapter } from './Desktop.persistence';
export type { VersionedLayoutTransport } from './Desktop.persistence';
export { createBroadcastCollaboration } from './Desktop.collaboration';
export type { DesktopCollaborationAdapter, DesktopCollaborator } from './Desktop.collaboration';
export { createWebSocketCollaboration } from './Desktop.collaboration.websocket';
export type {
  DesktopWebSocketCollaborationOptions,
  DesktopWebSocketLike,
  DesktopWebSocketReconnectOptions
} from './Desktop.collaboration.websocket';
export {
  createCollaborationRoom,
  isCollaboratorStale,
  mergeCollaborativeLayouts
} from './Desktop.collaboration.layouts';
export { useCollaborativeLayout, useDesktopCollaborators } from './Desktop.collaboration.react';
export type {
  UseCollaborativeLayoutOptions,
  UseCollaborativeLayoutResult,
  UseDesktopCollaboratorsOptions,
  UseDesktopCollaboratorsResult
} from './Desktop.collaboration.react';
export {
  createDesktopAppRegistry,
  DESKTOP_APP_DEFAULT_SCHEME,
  DESKTOP_APP_ID_PATTERN,
  DESKTOP_APP_MAX_COUNT,
  DESKTOP_APP_PERMISSIONS
} from './Desktop.apps';
export type {
  DesktopAppLoader,
  DesktopAppManifest,
  DesktopAppPermission,
  DesktopAppRegistry,
  DesktopAppsContext,
  DesktopDeepLink
} from './Desktop.apps';
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
