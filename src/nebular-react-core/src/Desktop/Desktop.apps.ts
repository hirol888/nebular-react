import React from 'react';
import type { DesktopApp, DesktopWindowBounds } from './Desktop.types';

export type DesktopAppPermission =
  'files' | 'clipboard' | 'notifications' | 'fullscreen' | 'window-management' | 'network';

/** Maximum number of manifests kept by a single registry. */
export const DESKTOP_APP_MAX_COUNT = 500;

/** App ids are used in deep links and must stay URL-safe. */
export const DESKTOP_APP_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/;

/** Scheme used when a manifest does not declare `deepLinkScheme`. */
export const DESKTOP_APP_DEFAULT_SCHEME = 'app';

export const DESKTOP_APP_PERMISSIONS: readonly DesktopAppPermission[] = [
  'files',
  'clipboard',
  'notifications',
  'fullscreen',
  'window-management',
  'network'
];

const PERMISSION_SET = new Set<string>(DESKTOP_APP_PERMISSIONS);
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*$/;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_URL_LENGTH = 4096;

export type DesktopAppLoader = () => Promise<{ default: React.ComponentType<any> }>;

export interface DesktopAppManifest {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  version?: string;
  hidden?: boolean;
  singleton?: boolean;
  defaultBounds?: Partial<DesktopWindowBounds>;
  fileExtensions?: string[];
  permissions?: DesktopAppPermission[];
  deepLinkScheme?: string;
  load?: DesktopAppLoader | React.ComponentType<any>;
  content?: React.ReactNode | React.ComponentType<any>;
  metadata?: Record<string, unknown>;
}

export interface DesktopDeepLink {
  appId: string;
  path: string;
  query: Record<string, string>;
}

export interface DesktopAppsContext {
  /** Defaults merged into every generated DesktopApp; manifest fields take precedence. */
  defaults?: Partial<Omit<DesktopApp, 'id' | 'title' | 'content'>>;
  /** Per-app overrides keyed by manifest id; manifest fields take precedence. */
  overrides?: Record<string, Partial<Omit<DesktopApp, 'id' | 'title' | 'content'>>>;
}

export interface DesktopAppRegistry {
  /** Registers or replaces a manifest. Invalid manifests are ignored with a warning. */
  register(manifest: DesktopAppManifest): boolean;
  unregister(id: string): boolean;
  get(id: string): DesktopAppManifest | undefined;
  list(options?: { includeHidden?: boolean }): DesktopAppManifest[];
  has(id: string): boolean;
  /** Finds manifests by extension, accepting `md`, `.md`, `MD`, etc. */
  findByExtension(extension: string): DesktopAppManifest[];
  filterByPermission(permission: DesktopAppPermission): DesktopAppManifest[];
  resolveDeepLink(url: string): DesktopDeepLink | null;
  createDeepLink(appId: string, path?: string, query?: Record<string, string>): string;
  loadComponent(id: string): Promise<React.ComponentType<any> | null>;
  toDesktopApps(context?: DesktopAppsContext): DesktopApp[];
}

function warn(message: string): void {
  if (typeof console === 'undefined') {
    return;
  }

  const logger = console;

  if (typeof logger.warn !== 'function') {
    return;
  }

  logger.warn(`[Desktop.apps] ${message}`);
}

function normalizeScheme(scheme: unknown): string {
  if (typeof scheme === 'string') {
    const normalized = scheme.trim().toLowerCase();

    if (SCHEME_PATTERN.test(normalized)) {
      return normalized;
    }
  }

  return DESKTOP_APP_DEFAULT_SCHEME;
}

function normalizeExtension(extension: unknown): string | null {
  if (typeof extension !== 'string') {
    return null;
  }

  let normalized = extension.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (!normalized.startsWith('.')) {
    normalized = `.${normalized}`;
  }

  if (normalized === '.' || /[\\/\s]/.test(normalized)) {
    return null;
  }

  return normalized;
}

function normalizeExtensions(extensions: unknown): string[] | undefined {
  if (!Array.isArray(extensions)) {
    return undefined;
  }

  const normalized = extensions
    .map((extension) => normalizeExtension(extension))
    .filter((extension): extension is string => extension !== null);

  return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
}

function normalizePermissions(permissions: unknown): DesktopAppPermission[] | undefined {
  if (!Array.isArray(permissions)) {
    return undefined;
  }

  const normalized = permissions.filter(
    (permission): permission is DesktopAppPermission =>
      typeof permission === 'string' && PERMISSION_SET.has(permission)
  );

  return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
}

function normalizeBounds(bounds: unknown): DesktopAppManifest['defaultBounds'] {
  if (!bounds || typeof bounds !== 'object') {
    return undefined;
  }

  const source = bounds as Record<string, unknown>;
  const normalized: NonNullable<DesktopAppManifest['defaultBounds']> = {};

  (['x', 'y', 'width', 'height'] as const).forEach((key) => {
    const value = source[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      normalized[key] = key === 'width' || key === 'height' ? Math.max(1, value) : value;
    }
  });

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function validateManifest(manifest: DesktopAppManifest): string | null {
  if (!manifest || typeof manifest !== 'object') {
    return 'manifest must be an object.';
  }

  if (typeof manifest.id !== 'string' || !DESKTOP_APP_ID_PATTERN.test(manifest.id)) {
    return `invalid id "${String(manifest.id)}"; expected ${DESKTOP_APP_ID_PATTERN}.`;
  }

  if (
    typeof manifest.title !== 'string' ||
    manifest.title.trim().length === 0 ||
    manifest.title.trim().length > MAX_TITLE_LENGTH
  ) {
    return `app "${manifest.id}" must declare a title between 1 and ${MAX_TITLE_LENGTH} characters.`;
  }

  if (manifest.load !== undefined && typeof manifest.load !== 'function') {
    return `app "${manifest.id}" has an invalid load function.`;
  }

  return null;
}

function normalizeManifest(manifest: DesktopAppManifest): DesktopAppManifest {
  const normalized: DesktopAppManifest = {
    id: manifest.id,
    title: manifest.title.trim(),
    deepLinkScheme: normalizeScheme(manifest.deepLinkScheme)
  };

  if (typeof manifest.description === 'string') {
    const description = manifest.description.trim().slice(0, MAX_DESCRIPTION_LENGTH);

    if (description) {
      normalized.description = description;
    }
  }

  if (manifest.icon !== undefined) {
    normalized.icon = manifest.icon;
  }

  if (typeof manifest.version === 'string') {
    const version = manifest.version.trim().slice(0, 50);

    if (version) {
      normalized.version = version;
    }
  }

  if (manifest.hidden !== undefined) {
    normalized.hidden = Boolean(manifest.hidden);
  }

  if (manifest.singleton !== undefined) {
    normalized.singleton = Boolean(manifest.singleton);
  }

  const defaultBounds = normalizeBounds(manifest.defaultBounds);

  if (defaultBounds) {
    normalized.defaultBounds = defaultBounds;
  }

  const fileExtensions = normalizeExtensions(manifest.fileExtensions);

  if (fileExtensions) {
    normalized.fileExtensions = fileExtensions;
  }

  const permissions = normalizePermissions(manifest.permissions);

  if (permissions) {
    normalized.permissions = permissions;
  }

  if (manifest.load !== undefined) {
    normalized.load = manifest.load;
  }

  if (manifest.content !== undefined) {
    normalized.content = manifest.content;
  }

  if (
    manifest.metadata &&
    typeof manifest.metadata === 'object' &&
    !Array.isArray(manifest.metadata)
  ) {
    normalized.metadata = { ...manifest.metadata };
  }

  return normalized;
}

/**
 * Detects whether `load` is a component instead of a lazy loader.
 * React has no reliable runtime marker for function components, so this uses the
 * conventions that separate them from module loaders: class markers, displayName,
 * capitalized names and declared props (loaders take no arguments).
 */
function isStaticComponent(value: unknown): value is React.ComponentType<any> {
  if (typeof value !== 'function') {
    return false;
  }

  const candidate = value as React.ComponentType<any> & {
    prototype?: { isReactComponent?: unknown };
    displayName?: string;
    name: string;
    length: number;
    constructor?: { name?: string };
  };

  if (candidate.constructor?.name === 'AsyncFunction') {
    return false;
  }

  return (
    Boolean(candidate.prototype && candidate.prototype.isReactComponent) ||
    typeof candidate.displayName === 'string' ||
    /^[A-Z]/.test(candidate.name ?? '') ||
    candidate.length > 0
  );
}

function resolveContent(
  registry: DesktopAppRegistry,
  manifest: DesktopAppManifest
): React.ReactNode {
  if (manifest.content !== undefined) {
    return typeof manifest.content === 'function'
      ? React.createElement(manifest.content as React.ComponentType<any>)
      : manifest.content;
  }

  if (manifest.load === undefined) {
    return null;
  }

  if (isStaticComponent(manifest.load)) {
    return React.createElement(manifest.load);
  }

  const LazyComponent = React.lazy(async () => {
    const component = await registry.loadComponent(manifest.id);

    if (!component) {
      throw new Error(`[Desktop.apps] Unable to load the "${manifest.id}" app component.`);
    }

    return { default: component };
  });

  const SuspenseWrapper = () =>
    React.createElement(React.Suspense, { fallback: null }, React.createElement(LazyComponent));

  SuspenseWrapper.displayName = `DesktopApp(${manifest.id})`;

  return React.createElement(SuspenseWrapper);
}

/**
 * Creates an in-memory registry for desktop app/plugin manifests.
 * Manifests are validated and normalized before being stored.
 */
export function createDesktopAppRegistry(manifests: DesktopAppManifest[] = []): DesktopAppRegistry {
  const registered = new Map<string, DesktopAppManifest>();
  const componentCache = new Map<string, Promise<React.ComponentType<any> | null>>();

  const registry: DesktopAppRegistry = {
    register(manifest) {
      const error = validateManifest(manifest);

      if (error) {
        warn(`Ignoring invalid app manifest: ${error}`);
        return false;
      }

      if (!registered.has(manifest.id) && registered.size >= DESKTOP_APP_MAX_COUNT) {
        warn(
          `Ignoring app "${manifest.id}": the registry reached the ${DESKTOP_APP_MAX_COUNT} app limit.`
        );
        return false;
      }

      registered.set(manifest.id, normalizeManifest(manifest));
      componentCache.delete(manifest.id);
      return true;
    },

    unregister(id) {
      componentCache.delete(id);
      return registered.delete(id);
    },

    get(id) {
      return registered.get(id);
    },

    list({ includeHidden = false } = {}) {
      const apps = Array.from(registered.values());

      return includeHidden ? apps : apps.filter((manifest) => !manifest.hidden);
    },

    has(id) {
      return registered.has(id);
    },

    findByExtension(extension) {
      const normalized = normalizeExtension(extension);

      if (!normalized) {
        return [];
      }

      return Array.from(registered.values()).filter((manifest) =>
        manifest.fileExtensions?.includes(normalized)
      );
    },

    filterByPermission(permission) {
      if (!PERMISSION_SET.has(permission)) {
        return [];
      }

      return Array.from(registered.values()).filter((manifest) =>
        manifest.permissions?.includes(permission)
      );
    },

    resolveDeepLink(url) {
      if (typeof url !== 'string' || url.length === 0 || url.length > MAX_URL_LENGTH) {
        return null;
      }

      let parsed: URL;

      try {
        parsed = new URL(url);
      } catch {
        return null;
      }

      const scheme = parsed.protocol.replace(/:$/, '').toLowerCase();

      if (scheme !== DESKTOP_APP_DEFAULT_SCHEME && scheme !== 'nebular') {
        const customScheme = Array.from(registered.values()).some(
          (manifest) => manifest.deepLinkScheme === scheme
        );

        if (!customScheme) {
          return null;
        }
      }

      if (parsed.username || parsed.password || parsed.port) {
        return null;
      }

      const appId = parsed.hostname.toLowerCase();

      if (!DESKTOP_APP_ID_PATTERN.test(appId) || !registered.has(appId)) {
        return null;
      }

      const path = parsed.pathname
        .split('/')
        .filter((segment) => segment.length > 0)
        .map((segment) => {
          try {
            return decodeURIComponent(segment);
          } catch {
            return segment;
          }
        })
        .join('/');

      const query: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        query[key] = value;
      });

      return { appId, path, query };
    },

    createDeepLink(appId, path = '', query = {}) {
      if (typeof appId !== 'string' || !DESKTOP_APP_ID_PATTERN.test(appId)) {
        throw new Error(`[Desktop.apps] Invalid app id "${String(appId)}".`);
      }

      const scheme = normalizeScheme(registered.get(appId)?.deepLinkScheme);
      const encodedPath = path
        .split('/')
        .filter((segment) => segment.length > 0)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
      const params = new URLSearchParams();

      Object.keys(query ?? {}).forEach((key) => {
        const value = query[key];

        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const search = params.toString();

      return `${scheme}://${appId}${encodedPath ? `/${encodedPath}` : ''}${
        search ? `?${search}` : ''
      }`;
    },

    loadComponent(id) {
      const cached = componentCache.get(id);

      if (cached) {
        return cached;
      }

      const manifest = registered.get(id);

      if (!manifest || manifest.load === undefined) {
        return Promise.resolve(null);
      }

      const loader = manifest.load;

      if (isStaticComponent(loader)) {
        return Promise.resolve(loader);
      }

      const pending = Promise.resolve()
        .then(() => loader())
        .then((module) => (module && module.default ? module.default : null))
        .catch((error: unknown) => {
          componentCache.delete(id);
          throw error;
        });

      componentCache.set(id, pending);
      return pending;
    },

    toDesktopApps(context = {}) {
      return registry.list().map((manifest) => {
        const app: DesktopApp = {
          ...(context.defaults ?? {}),
          ...(context.overrides?.[manifest.id] ?? {}),
          id: manifest.id,
          title: manifest.title,
          content: resolveContent(registry, manifest)
        };

        if (manifest.icon !== undefined) {
          app.icon = manifest.icon;
        }

        if (manifest.fileExtensions) {
          app.fileExtensions = [...manifest.fileExtensions];
        }

        if (manifest.singleton !== undefined) {
          app.singleInstance = manifest.singleton;
        }

        if (manifest.defaultBounds?.width !== undefined) {
          app.defaultWidth = manifest.defaultBounds.width;
        }

        if (manifest.defaultBounds?.height !== undefined) {
          app.defaultHeight = manifest.defaultBounds.height;
        }

        return app;
      });
    }
  };

  if (Array.isArray(manifests)) {
    manifests.forEach((manifest) => registry.register(manifest));
  }

  return registry;
}
