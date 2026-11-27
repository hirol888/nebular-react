import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useComponentDefaultProps, useNebularLocale } from '@nebular-react/styles';
import { ConfirmDialog } from '../ConfirmDialog';
import { Icon } from '../Icon';
import { Modal } from '../Modal';
import { useStyles } from './FileExplorer.styles';
import type {
  FileEntry,
  FileEntryPermissions,
  FileExplorerLabels,
  FileExplorerProps,
  FileExplorerSortBy,
  FileExplorerSortDirection,
  FileExplorerView,
  FileListResponse,
  FileListResult,
  FileUploadStatus
} from './FileExplorer.types';
import { FileSystemError, normalizePath, parentPath, pathSegments } from './FileExplorer.providers';

const VIRTUAL_ROW_HEIGHT = 34;
const VIRTUAL_OVERSCAN = 6;
const DETAILS_COLUMNS = 'minmax(0, 1fr) 5rem 6rem 8rem';

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  destination: string;
  percent: number;
  status: FileUploadStatus;
  error?: string;
}

type PermissionAction = keyof FileEntryPermissions;

const defaultProps: Partial<FileExplorerProps> = {
  defaultPath: '/',
  defaultView: 'list',
  searchable: true,
  tabs: false,
  selectionMode: 'multiple',
  readOnly: false,
  multiple: true,
  trashEnabled: true,
  undoTimeoutMs: 8000,
  virtualizeThreshold: 200,
  ariaLabel: 'File explorer',
  sidebarWidth: '14rem'
};

function normalizeListResult(result: FileListResponse): FileListResult {
  if (Array.isArray(result)) {
    return { entries: result };
  }

  return {
    entries: result.entries ?? [],
    total: result.total,
    hasMore: result.hasMore
  };
}

function resolveHasMore(result: FileListResult, loadedCount: number): boolean {
  if (typeof result.hasMore === 'boolean') {
    return result.hasMore;
  }

  return typeof result.total === 'number' ? loadedCount < result.total : false;
}

function allowsPermission(entry: FileEntry, action: PermissionAction): boolean {
  return entry.permissions?.[action] !== false;
}

function canReadEntry(entry: FileEntry): boolean {
  return allowsPermission(entry, 'read');
}

function canWriteEntry(entry: FileEntry): boolean {
  return allowsPermission(entry, 'write');
}

function canDeleteEntry(entry: FileEntry): boolean {
  return allowsPermission(entry, 'delete');
}

function canDownloadEntry(entry: FileEntry): boolean {
  return canReadEntry(entry) && allowsPermission(entry, 'download');
}

function matchesQuery(entry: FileEntry, query: string): boolean {
  return entry.name.toLowerCase().includes(query.toLowerCase());
}

function formatSize(size?: number): string {
  if (typeof size !== 'number' || !Number.isFinite(size)) {
    return '—';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = size / 1024;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

function formatDate(value?: Date | string | number): string {
  if (value === undefined) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

function sortEntries(
  entries: FileEntry[],
  by: FileExplorerSortBy,
  direction: FileExplorerSortDirection
): FileEntry[] {
  const factor = direction === 'asc' ? 1 : -1;

  return [...entries].sort((first, second) => {
    if (first.type !== second.type) {
      return first.type === 'folder' ? -1 : 1;
    }

    if (by === 'size') {
      return ((first.size ?? 0) - (second.size ?? 0)) * factor;
    }

    if (by === 'modified') {
      return (
        (new Date(first.modifiedAt ?? 0).getTime() - new Date(second.modifiedAt ?? 0).getTime()) *
        factor
      );
    }

    if (by === 'type') {
      return first.type.localeCompare(second.type) * factor;
    }

    return first.name.localeCompare(second.name, undefined, { numeric: true }) * factor;
  });
}

function downloadBlob(blob: Blob, name: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const EXTERNAL_DRAG_MIME = 'application/x-nebular-file-explorer-paths';
const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;
const AUDIO_EXTENSION = /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus)$/i;
const VIDEO_EXTENSION = /\.(mp4|webm|ogv|mov|m4v)$/i;
const PDF_EXTENSION = /\.pdf$/i;

type FilePreviewKind = 'image' | 'audio' | 'video' | 'pdf' | 'text' | 'none';

function readExternalDragPaths(event: React.DragEvent): string[] {
  try {
    const raw = event.dataTransfer?.getData(EXTERNAL_DRAG_MIME);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (candidate): candidate is string =>
          typeof candidate === 'string' && candidate.startsWith('/') && !candidate.includes('..')
      )
      .slice(0, 100);
  } catch {
    return [];
  }
}

function getFilePreviewKind(entry: FileEntry): FilePreviewKind {
  const mimeType = entry.mimeType?.toLowerCase() ?? '';

  if (mimeType.startsWith('image/') || IMAGE_EXTENSION.test(entry.name)) {
    return 'image';
  }

  if (mimeType.startsWith('audio/') || AUDIO_EXTENSION.test(entry.name)) {
    return 'audio';
  }

  if (mimeType.startsWith('video/') || VIDEO_EXTENSION.test(entry.name)) {
    return 'video';
  }

  if (mimeType === 'application/pdf' || PDF_EXTENSION.test(entry.name)) {
    return 'pdf';
  }

  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    /\.(md|txt|json|csv|log|ts|tsx|js|jsx|css|html|xml|yml|yaml)$/i.test(entry.name)
  ) {
    return 'text';
  }

  return 'none';
}

function FilePreview({
  entry,
  className,
  labels
}: {
  entry: FileEntry;
  className: string;
  labels: FileExplorerLabels;
}) {
  const [text, setText] = useState<string | null>(null);
  const kind = getFilePreviewKind(entry);
  const isText = kind === 'text';

  useEffect(() => {
    if (!isText || !entry.url || typeof fetch !== 'function') {
      return undefined;
    }

    const controller = new AbortController();
    fetch(entry.url, { signal: controller.signal })
      .then((response) => (response.ok ? response.text() : Promise.reject(response.status)))
      .then((value) => setText(value.slice(0, 20_000)))
      .catch(() => setText(null));

    return () => controller.abort();
  }, [entry.url, isText]);

  if (kind === 'image' && entry.url) {
    return <img className={className} src={entry.url} alt={entry.name} />;
  }

  if (kind === 'audio' && entry.url) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption -- previews user-supplied media; captions belong to the file/player.
      <audio className={className} src={entry.url} controls aria-label={entry.name} />
    );
  }

  if (kind === 'video' && entry.url) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption -- previews user-supplied media; captions belong to the file/player.
      <video className={className} src={entry.url} controls aria-label={entry.name} />
    );
  }

  if (kind === 'pdf' && entry.url) {
    return <iframe className={className} src={entry.url} title={entry.name} />;
  }

  if (isText && text !== null) {
    return <pre className={className}>{text}</pre>;
  }

  return <p className={className}>{labels.noPreview}</p>;
}

export const FileExplorer = forwardRef<HTMLDivElement, FileExplorerProps>((props, ref) => {
  const {
    provider,
    path: controlledPath,
    defaultPath,
    onPathChange,
    view: controlledView,
    defaultView,
    onViewChange,
    searchable,
    tabs,
    selectionMode,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    onOpen,
    onOpenFolder,
    onRename,
    onDelete,
    onTrash,
    onRestore,
    onMove,
    onCopy,
    onCreateFolder,
    onUpload,
    onDownload,
    readOnly,
    trashEnabled,
    undoTimeoutMs,
    accept,
    multiple,
    pageSize,
    virtualizeThreshold,
    labels: labelsProp,
    ariaLabel,
    sidebar,
    sidebarWidth,
    emptyState,
    renderIcon,
    renderPreview,
    className,
    classNames,
    styles,
    unstyled,
    style,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'file-explorer',
    classNames,
    styles,
    unstyled
  });
  const { t } = useNebularLocale();
  const labels = useMemo<FileExplorerLabels>(
    () => ({
      root: t('fileExplorer.root', 'Files'),
      back: t('fileExplorer.back', 'Back'),
      forward: t('fileExplorer.forward', 'Forward'),
      up: t('fileExplorer.up', 'Up'),
      refresh: t('fileExplorer.refresh', 'Refresh'),
      breadcrumb: t('fileExplorer.breadcrumb', 'Breadcrumb'),
      search: t('fileExplorer.search', 'Search files'),
      noResults: t('fileExplorer.noResults', 'No files found'),
      empty: t('fileExplorer.empty', 'This folder is empty'),
      loading: t('fileExplorer.loading', 'Loading files…'),
      error: t('fileExplorer.error', 'Could not load files'),
      retry: t('fileExplorer.retry', 'Retry'),
      viewList: t('fileExplorer.viewList', 'List view'),
      viewGrid: t('fileExplorer.viewGrid', 'Grid view'),
      viewDetails: t('fileExplorer.viewDetails', 'Details view'),
      newFolder: t('fileExplorer.newFolder', 'New folder'),
      rename: t('fileExplorer.rename', 'Rename'),
      delete: t('fileExplorer.delete', 'Delete'),
      download: t('fileExplorer.download', 'Download'),
      upload: t('fileExplorer.upload', 'Upload'),
      copy: t('fileExplorer.copy', 'Copy'),
      cut: t('fileExplorer.cut', 'Cut'),
      paste: t('fileExplorer.paste', 'Paste'),
      open: t('fileExplorer.open', 'Open'),
      selectAll: t('fileExplorer.selectAll', 'Select all'),
      clearSelection: t('fileExplorer.clearSelection', 'Clear selection'),
      selectionCount: (count) => t('fileExplorer.selectionCount', '{count} selected', { count }),
      deleteTitle: t('fileExplorer.deleteTitle', 'Delete items'),
      deleteMessage: (count) =>
        t('fileExplorer.deleteMessage', 'Delete {count} item(s)?', { count }),
      confirmDelete: t('fileExplorer.confirmDelete', 'Delete'),
      trash: t('fileExplorer.trash', 'Trash'),
      trashTitle: t('fileExplorer.trashTitle', 'Trash'),
      trashHint: t('fileExplorer.trashHint', 'Items stay here until you empty the trash.'),
      trashEmpty: t('fileExplorer.trashEmpty', 'Trash is empty'),
      restore: t('fileExplorer.restore', 'Restore'),
      emptyTrash: t('fileExplorer.emptyTrash', 'Empty trash'),
      movedToTrash: (count) =>
        t('fileExplorer.movedToTrash', '{count} item(s) moved to trash', { count }),
      restored: (count) => t('fileExplorer.restored', '{count} item(s) restored', { count }),
      undo: t('fileExplorer.undo', 'Undo'),
      cancel: t('fileExplorer.cancel', 'Cancel'),
      save: t('fileExplorer.save', 'Save'),
      name: t('fileExplorer.name', 'Name'),
      type: t('fileExplorer.type', 'Type'),
      size: t('fileExplorer.size', 'Size'),
      modified: t('fileExplorer.modified', 'Modified'),
      folder: t('fileExplorer.folder', 'Folder'),
      file: t('fileExplorer.file', 'File'),
      newFolderPlaceholder: t('fileExplorer.newFolderPlaceholder', 'Folder name'),
      renameLabel: (name) => t('fileExplorer.renameLabel', 'Rename {name}', { name }),
      menuLabel: (name) => t('fileExplorer.menuLabel', 'Actions for {name}', { name }),
      preview: (name) => t('fileExplorer.preview', 'Preview {name}', { name }),
      closePreview: t('fileExplorer.closePreview', 'Close preview'),
      noPreview: t('fileExplorer.noPreview', 'No preview available'),
      uploadProgress: (name, percent) =>
        t('fileExplorer.uploadProgress', 'Uploading {name} ({percent}%)', { name, percent }),
      uploadError: (name) => t('fileExplorer.uploadError', 'Upload failed: {name}', { name }),
      uploadQueue: t('fileExplorer.uploadQueue', 'Uploads'),
      uploadCancel: (name) => t('fileExplorer.uploadCancel', 'Cancel upload of {name}', { name }),
      uploadRetry: (name) => t('fileExplorer.uploadRetry', 'Retry upload of {name}', { name }),
      uploadDismiss: (name) => t('fileExplorer.uploadDismiss', 'Dismiss {name}', { name }),
      uploadSuccess: (name) => t('fileExplorer.uploadSuccess', 'Uploaded {name}', { name }),
      uploadCanceled: (name) =>
        t('fileExplorer.uploadCanceled', 'Upload canceled: {name}', { name }),
      loadMore: t('fileExplorer.loadMore', 'Load more'),
      loadingMore: t('fileExplorer.loadingMore', 'Loading more…'),
      permissionDenied: (action) =>
        t('fileExplorer.permissionDenied', 'Not allowed: {action}', { action }),
      dropToUpload: t('fileExplorer.dropToUpload', 'Drop files to upload'),
      tabs: t('fileExplorer.tabs', 'Open folders'),
      newTab: t('fileExplorer.newTab', 'New tab'),
      closeTab: (name) => t('fileExplorer.closeTab', 'Close {name}', { name }),
      ...labelsProp
    }),
    [t, labelsProp]
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadControllersRef = useRef(new Map<string, AbortController>());
  const uploadIdRef = useRef(0);
  const fetchTokenRef = useRef(0);
  const [internalPath, setInternalPath] = useState(defaultPath);
  const path = normalizePath(controlledPath ?? internalPath);
  const tabCounterRef = useRef(1);
  const [tabState, setTabState] = useState([{ id: 'tab-1', path }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [history, setHistory] = useState<string[]>([path]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [internalView, setInternalView] = useState<FileExplorerView>(defaultView);
  const view = controlledView ?? internalView;
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const [refreshToken, setRefreshToken] = useState(0);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [sortBy, setSortBy] = useState<FileExplorerSortBy>('name');
  const [sortDirection, setSortDirection] = useState<FileExplorerSortDirection>('asc');
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelectedKeys ?? []);
  const selected = selectedKeys ?? internalSelected;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const [anchorIndex, setAnchorIndex] = useState(-1);
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    entry?: FileEntry;
  } | null>(null);
  const [creating, setCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renaming, setRenaming] = useState<FileEntry | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<FileEntry[] | null>(null);
  const [pendingUndo, setPendingUndo] = useState<FileEntry[] | null>(null);
  const [trashPanelOpen, setTrashPanelOpen] = useState(false);
  const [trashItems, setTrashItems] = useState<FileEntry[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashError, setTrashError] = useState<unknown>(undefined);
  const [clipboard, setClipboard] = useState<{
    mode: 'copy' | 'cut';
    entries: FileEntry[];
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragEntries, setDragEntries] = useState<FileEntry[] | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadQueueItem[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const listboxId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const menuRef = useRef<HTMLDivElement>(null);

  const applySelection = useCallback(
    (keys: string[], sourceEntries: FileEntry[]) => {
      if (selectedKeys === undefined) {
        setInternalSelected(keys);
      }

      onSelectionChange?.(
        keys,
        sourceEntries.filter((entry) => keys.includes(entry.path))
      );
      setPreviewDismissed(false);
    },
    [onSelectionChange, selectedKeys, setPreviewDismissed]
  );

  const navigate = useCallback(
    (nextPath: string) => {
      const normalized = normalizePath(nextPath);

      if (normalized === path) {
        return;
      }

      setHistory((current) => {
        const base = current.slice(0, historyIndex + 1);
        const next = [...base, normalized];
        setHistoryIndex(next.length - 1);
        return next;
      });
      if (controlledPath === undefined) {
        setInternalPath(normalized);
      }
      setTabState((current) =>
        current.map((tab) => (tab.id === activeTabId ? { ...tab, path: normalized } : tab))
      );
      onPathChange?.(normalized);
      setQuery('');
      setSearching(false);
      applySelection([], []);
    },
    [applySelection, controlledPath, historyIndex, onPathChange, path, activeTabId]
  );

  useEffect(() => {
    if (searching || query.trim()) {
      return undefined;
    }

    const controller = new AbortController();
    const token = fetchTokenRef.current + 1;
    fetchTokenRef.current = token;
    setLoading(true);
    setLoadingMore(false);
    setError(undefined);
    setPage(0);
    setHasMore(false);

    const options =
      pageSize === undefined
        ? { signal: controller.signal }
        : { signal: controller.signal, page: 0, pageSize };

    provider
      .list(path, options)
      .then((next) => {
        if (!controller.signal.aborted && fetchTokenRef.current === token) {
          const result = normalizeListResult(next);
          setEntries(result.entries);
          setHasMore(resolveHasMore(result, result.entries.length));
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted && fetchTokenRef.current === token) {
          setError(reason);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [provider, path, refreshToken, query, searching, pageSize]);

  useEffect(() => {
    const normalized = query.trim();

    if (!normalized) {
      setSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const token = fetchTokenRef.current + 1;
    fetchTokenRef.current = token;
    setPage(0);
    setHasMore(false);
    setLoadingMore(false);
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(undefined);
      setSearching(true);

      const listOptions =
        pageSize === undefined
          ? { signal: controller.signal }
          : { signal: controller.signal, page: 0, pageSize };
      const request: Promise<FileListResponse> = provider.search
        ? provider.search(normalized, {
            signal: controller.signal,
            limit: pageSize ?? 200,
            ...(pageSize === undefined ? {} : { page: 0, pageSize })
          })
        : provider
            .list(path, listOptions)
            .then((response) => normalizeListResult(response))
            .then((result) => ({
              ...result,
              entries: result.entries.filter((entry) => matchesQuery(entry, normalized))
            }));

      request
        .then((next) => {
          if (!controller.signal.aborted && fetchTokenRef.current === token) {
            const result = normalizeListResult(next);
            setEntries(result.entries);
            setHasMore(resolveHasMore(result, result.entries.length));
            setLoading(false);
          }
        })
        .catch((reason) => {
          if (!controller.signal.aborted && fetchTokenRef.current === token) {
            setError(reason);
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [provider, path, query, refreshToken, pageSize]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenu(null);
      }
    };

    if (!menu) {
      return undefined;
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [menu]);

  useEffect(() => {
    if (!menu) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menu]);

  const sortedEntries = useMemo(
    () => sortEntries(entries, sortBy, sortDirection),
    [entries, sortBy, sortDirection]
  );

  const selectedEntries = useMemo(
    () => sortedEntries.filter((entry) => selectedSet.has(entry.path)),
    [sortedEntries, selectedSet]
  );

  const previewEntry =
    selectedEntries.length === 1 && selectedEntries[0].type === 'file'
      ? selectedEntries[0]
      : undefined;
  const showPreview = !!previewEntry && !previewDismissed;
  const previewKind = previewEntry ? getFilePreviewKind(previewEntry) : 'none';
  const selectedCanRead = selectedEntries.length > 0 && selectedEntries.every(canReadEntry);
  const selectedCanWrite = selectedEntries.length > 0 && selectedEntries.every(canWriteEntry);
  const selectedCanDelete = selectedEntries.length > 0 && selectedEntries.every(canDeleteEntry);
  const canTrash = !readOnly && trashEnabled !== false && !!provider.trash;
  const showTrashPanel = !readOnly && trashEnabled !== false && !!provider.listTrash;

  const virtualEnabled =
    (view === 'list' || view === 'details') &&
    virtualizeThreshold > 0 &&
    sortedEntries.length > virtualizeThreshold;
  const virtualViewport = viewportHeight > 0 ? viewportHeight : VIRTUAL_ROW_HEIGHT * 10;
  const visibleStart = virtualEnabled
    ? Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN)
    : 0;
  const visibleEnd = virtualEnabled
    ? Math.min(
        sortedEntries.length,
        visibleStart + Math.ceil(virtualViewport / VIRTUAL_ROW_HEIGHT) + VIRTUAL_OVERSCAN * 2
      )
    : sortedEntries.length;
  const visibleEntries = sortedEntries.slice(visibleStart, visibleEnd);

  useEffect(() => {
    if (!virtualEnabled) {
      return undefined;
    }

    const element = scrollRef.current;

    if (!element) {
      return undefined;
    }

    const measure = () => setViewportHeight(element.clientHeight);
    measure();

    if (typeof ResizeObserver === 'undefined') {
      if (typeof window === 'undefined') {
        return undefined;
      }

      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [virtualEnabled, view, loading]);

  useEffect(() => {
    if (!focusPath) {
      return;
    }

    const elements = contentRef.current?.querySelectorAll<HTMLElement>('[data-file-path]');
    const target = elements
      ? Array.from(elements).find((element) => element.getAttribute('data-file-path') === focusPath)
      : undefined;

    target?.focus();
    setFocusPath(null);
  }, [focusPath, visibleStart, visibleEnd]);

  useEffect(() => {
    setScrollTop(0);

    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [path, query, view]);

  useEffect(() => {
    setPendingUndo(null);
  }, [path]);

  useEffect(() => {
    if (!pendingUndo || undoTimeoutMs <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPendingUndo(null), undoTimeoutMs);
    return () => window.clearTimeout(timer);
  }, [pendingUndo, undoTimeoutMs]);

  const ensureIndexVisible = (index: number) => {
    if (!virtualEnabled) {
      return;
    }

    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const itemTop = index * VIRTUAL_ROW_HEIGHT;
    const itemBottom = itemTop + VIRTUAL_ROW_HEIGHT;
    const currentTop = element.scrollTop;
    const height = element.clientHeight || virtualViewport;
    let nextTop = currentTop;

    if (itemTop < currentTop) {
      nextTop = itemTop;
    } else if (itemBottom > currentTop + height) {
      nextTop = itemBottom - height;
    }

    if (nextTop !== currentTop) {
      element.scrollTop = nextTop;
      setScrollTop(nextTop);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore || loading) {
      return;
    }

    const searchTerm = query.trim();
    const token = fetchTokenRef.current;
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const pagination = pageSize === undefined ? { page: nextPage } : { page: nextPage, pageSize };
      let result: FileListResult;

      if (searchTerm && provider.search) {
        result = normalizeListResult(
          await provider.search(searchTerm, { ...pagination, limit: pageSize ?? 200 })
        );
      } else {
        result = normalizeListResult(await provider.list(path, pagination));

        if (searchTerm) {
          result = {
            ...result,
            entries: result.entries.filter((entry) => matchesQuery(entry, searchTerm))
          };
        }
      }

      if (token !== fetchTokenRef.current) {
        return;
      }

      setEntries((current) => {
        const known = new Set(current.map((entry) => entry.path));
        return [...current, ...result.entries.filter((entry) => !known.has(entry.path))];
      });
      setPage(nextPage);
      setHasMore(resolveHasMore(result, entries.length + result.entries.length));
    } catch (reason) {
      if (token === fetchTokenRef.current) {
        setError(reason);
      }
    } finally {
      if (token === fetchTokenRef.current) {
        setLoadingMore(false);
      }
    }
  };

  const permissionActionLabel = (action: PermissionAction): string => {
    switch (action) {
      case 'read':
        return labels.open;
      case 'write':
        return labels.rename;
      case 'delete':
        return labels.delete;
      default:
        return labels.download;
    }
  };

  const entryRestrictionTitle = (entry: FileEntry): string | undefined => {
    const denied = (['read', 'write', 'delete', 'download'] as PermissionAction[]).filter(
      (action) =>
        !allowsPermission(entry, action) && (action !== 'download' || entry.type === 'file')
    );

    return denied.length > 0
      ? labels.permissionDenied(denied.map(permissionActionLabel).join(', '))
      : undefined;
  };

  const setView = (next: FileExplorerView) => {
    if (controlledView === undefined) {
      setInternalView(next);
    }
    onViewChange?.(next);
  };

  const openEntry = (entry: FileEntry) => {
    if (!canReadEntry(entry)) {
      return;
    }

    onOpen?.(entry);

    if (entry.type === 'folder') {
      onOpenFolder?.(entry);
      navigate(entry.path);
    }
  };

  const toggleEntry = (entry: FileEntry, index: number, event?: React.MouseEvent) => {
    const additive = !!event && (event.ctrlKey || event.metaKey);
    const range = !!event && event.shiftKey && anchorIndex >= 0;

    if (selectionMode === 'single') {
      applySelection([entry.path], sortedEntries);
      setAnchorIndex(index);
      return;
    }

    if (range) {
      const [start, end] = [anchorIndex, index].sort((first, second) => first - second);
      const keys = sortedEntries.slice(start, end + 1).map((item) => item.path);
      applySelection(Array.from(new Set([...selected, ...keys])), sortedEntries);
      return;
    }

    if (additive) {
      const keys = selectedSet.has(entry.path)
        ? selected.filter((key) => key !== entry.path)
        : [...selected, entry.path];
      applySelection(keys, sortedEntries);
      setAnchorIndex(index);
      return;
    }

    applySelection([entry.path], sortedEntries);
    setAnchorIndex(index);
  };

  const handleContentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    ) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const key = event.key.toLowerCase();

      if (key === 'c' && selectedCanRead) {
        event.preventDefault();
        copySelection('copy');
        return;
      }

      if (key === 'x' && selectedCanWrite && !readOnly) {
        event.preventDefault();
        copySelection('cut');
        return;
      }

      if (
        key === 'v' &&
        clipboard &&
        !readOnly &&
        (clipboard.mode === 'cut' ? provider.move : provider.copy)
      ) {
        event.preventDefault();
        pasteSelection().catch(() => undefined);
        return;
      }
    }

    const currentIndex = selectedEntries[0]
      ? sortedEntries.findIndex((entry) => entry.path === selectedEntries[0].path)
      : -1;
    let nextIndex = currentIndex;

    if (event.key === 'ArrowDown') {
      nextIndex = Math.min(sortedEntries.length - 1, currentIndex + 1);
    } else if (event.key === 'ArrowUp') {
      nextIndex = Math.max(0, currentIndex - 1);
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = sortedEntries.length - 1;
    } else if (event.key === 'Enter' && sortedEntries[currentIndex]) {
      event.preventDefault();
      openEntry(sortedEntries[currentIndex]);
      return;
    } else if (event.key === 'F2' && sortedEntries[currentIndex]) {
      event.preventDefault();
      startRename(sortedEntries[currentIndex]);
      return;
    } else if (event.key === 'Delete' && !readOnly && selectedCanDelete) {
      event.preventDefault();
      requestDelete(selectedEntries);
      return;
    } else if (event.key === 'Escape') {
      applySelection([], sortedEntries);
      return;
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      applySelection(
        sortedEntries.map((entry) => entry.path),
        sortedEntries
      );
      return;
    } else {
      return;
    }

    if (nextIndex >= 0 && sortedEntries[nextIndex]) {
      event.preventDefault();
      applySelection([sortedEntries[nextIndex].path], sortedEntries);
      setAnchorIndex(nextIndex);
      ensureIndexVisible(nextIndex);
      setFocusPath(sortedEntries[nextIndex].path);
    }
  };

  const startRename = (entry: FileEntry) => {
    if (readOnly || !provider.rename || !canWriteEntry(entry)) {
      return;
    }

    setRenaming(entry);
    setRenameValue(entry.name);
    setMenu(null);
  };

  const commitRename = async () => {
    if (!renaming || !provider.rename || !canWriteEntry(renaming)) {
      return;
    }

    const name = renameValue.trim();

    if (!name || name === renaming.name) {
      setRenaming(null);
      return;
    }

    try {
      await provider.rename(renaming.path, name);
      onRename?.(renaming, name);
      setRenaming(null);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const createFolder = async () => {
    if (!provider.createFolder) {
      return;
    }

    const name = newFolderName.trim();

    if (!name) {
      setCreating(false);
      return;
    }

    try {
      await provider.createFolder(path, name);
      onCreateFolder?.(path, name);
      setNewFolderName('');
      setCreating(false);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const moveEntriesToTrash = async (targets: FileEntry[]) => {
    const deletable = targets.filter(canDeleteEntry);

    if (!provider.trash || deletable.length === 0) {
      return;
    }

    try {
      await provider.trash(deletable.map((entry) => entry.path));
      onTrash?.(deletable);
      setDeleting(null);
      applySelection([], sortedEntries);
      setPendingUndo(deletable);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const requestDelete = (targets: FileEntry[]) => {
    if (canTrash) {
      moveEntriesToTrash(targets).catch(() => undefined);
      return;
    }

    setDeleting(targets);
  };

  const undoTrash = async () => {
    const pending = pendingUndo;

    if (!provider.restore || !pending || pending.length === 0) {
      return;
    }

    try {
      await provider.restore(pending.map((entry) => entry.path));
      onRestore?.(pending);
      setPendingUndo(null);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const loadTrashItems = async () => {
    if (!provider.listTrash) {
      return;
    }

    setTrashLoading(true);
    setTrashError(undefined);

    try {
      setTrashItems(await provider.listTrash());
    } catch (reason) {
      setTrashError(reason);
    } finally {
      setTrashLoading(false);
    }
  };

  const openTrashPanel = () => {
    setMenu(null);
    setTrashItems([]);
    setTrashPanelOpen(true);
    loadTrashItems().catch(() => undefined);
  };

  const closeTrashPanel = () => {
    setTrashPanelOpen(false);
  };

  const restoreTrashEntry = async (entry: FileEntry) => {
    if (!provider.restore) {
      return;
    }

    try {
      await provider.restore([entry.path]);
      onRestore?.([entry]);
      setPendingUndo((current) => {
        if (!current) {
          return current;
        }

        const remaining = current.filter((candidate) => candidate.path !== entry.path);
        return remaining.length > 0 ? remaining : null;
      });
      setRefreshToken((token) => token + 1);
      await loadTrashItems();
    } catch (reason) {
      setTrashError(reason);
    }
  };

  const emptyAllTrash = async () => {
    if (!provider.emptyTrash) {
      return;
    }

    try {
      await provider.emptyTrash();
      setTrashItems([]);
      setPendingUndo(null);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setTrashError(reason);
    }
  };

  const confirmDelete = async () => {
    const deletable = deleting?.filter(canDeleteEntry) ?? [];

    if (deletable.length === 0 || !provider.remove) {
      setDeleting(null);
      return;
    }

    try {
      await provider.remove(deletable.map((entry) => entry.path));
      onDelete?.(deletable);
      setDeleting(null);
      applySelection([], sortedEntries);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const downloadEntry = async (entry: FileEntry) => {
    setMenu(null);

    if (!provider.download || !canDownloadEntry(entry)) {
      return;
    }

    try {
      const blob = await provider.download(entry.path);
      downloadBlob(blob, entry.name);
      onDownload?.(entry);
    } catch (reason) {
      setError(reason);
    }
  };

  const copySelection = (mode: 'copy' | 'cut') => {
    const allowed = selectedEntries.filter((entry) =>
      mode === 'cut' ? canWriteEntry(entry) : canReadEntry(entry)
    );

    if (allowed.length === 0) {
      return;
    }

    setClipboard({ mode, entries: allowed });
  };

  const pasteSelection = async () => {
    if (!clipboard || clipboard.entries.length === 0) {
      return;
    }

    const moveEntry = provider.move;
    const copyEntry = provider.copy;

    if (clipboard.mode === 'cut' ? !moveEntry : !copyEntry) {
      return;
    }

    const entriesToPaste = clipboard.entries.filter((entry) =>
      clipboard.mode === 'cut' ? canWriteEntry(entry) : canReadEntry(entry)
    );

    if (entriesToPaste.length === 0) {
      return;
    }

    const paths = entriesToPaste.map((entry) => entry.path);

    try {
      if (clipboard.mode === 'cut' && moveEntry) {
        await moveEntry(paths, path);
        onMove?.(entriesToPaste, path);
        applySelection([], sortedEntries);
        setClipboard(null);
      } else if (copyEntry) {
        await copyEntry(paths, path);
        onCopy?.(entriesToPaste, path);
      }

      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const moveEntriesTo = async (destination: string, externalPaths: string[] = []) => {
    const movable = dragEntries?.filter(canWriteEntry) ?? [];
    const localPaths = new Set(movable.map((entry) => entry.path));
    const paths = [
      ...movable.map((entry) => entry.path),
      ...externalPaths.filter(
        (externalPath) =>
          !localPaths.has(externalPath) &&
          externalPath !== destination &&
          !destination.startsWith(`${externalPath}/`)
      )
    ];

    if (!provider.move || paths.length === 0) {
      setDragEntries(null);
      setDropTarget(null);
      return;
    }

    setDragEntries(null);
    setDropTarget(null);

    try {
      await provider.move(paths, destination);

      if (movable.length > 0) {
        onMove?.(movable, destination);
      }

      applySelection([], sortedEntries);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const startEntryDrag = (entry: FileEntry, event: React.DragEvent) => {
    if (readOnly || !canWriteEntry(entry)) {
      return;
    }

    const draggedSelection = (selectedSet.has(entry.path) ? selectedEntries : [entry]).filter(
      canWriteEntry
    );

    if (draggedSelection.length === 0) {
      return;
    }

    setDragEntries(draggedSelection);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/x-nebular-file-explorer', '1');
      event.dataTransfer.setData(
        EXTERNAL_DRAG_MIME,
        JSON.stringify(draggedSelection.map((dragged) => dragged.path))
      );
    }
  };

  const handleFolderDragOver = (entry: FileEntry, event: React.DragEvent) => {
    const externalDrag = event.dataTransfer?.types?.includes(EXTERNAL_DRAG_MIME);

    if (
      entry.type !== 'folder' ||
      !canWriteEntry(entry) ||
      (!dragEntries && !externalDrag) ||
      dragEntries?.some((dragged) => dragged.path === entry.path)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    setDropTarget(entry.path);
  };

  const handleFolderDrop = (entry: FileEntry, event: React.DragEvent) => {
    if (entry.type !== 'folder' || !canWriteEntry(entry)) {
      return;
    }

    const externalPaths = readExternalDragPaths(event);

    if (!dragEntries && externalPaths.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    moveEntriesTo(entry.path, externalPaths).catch(() => undefined);
  };

  const updateUpload = useCallback((id: string, patch: Partial<UploadQueueItem>) => {
    setUploads((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const runUpload = async (item: UploadQueueItem) => {
    if (!provider.upload) {
      return;
    }

    const controller = new AbortController();
    uploadControllersRef.current.set(item.id, controller);
    updateUpload(item.id, { status: 'uploading', percent: 0, error: undefined });

    let uploaded: FileEntry[];

    try {
      uploaded = await provider.upload(item.destination, [item.file], {
        signal: controller.signal,
        onProgress: (progress) => {
          if (!controller.signal.aborted) {
            updateUpload(item.id, {
              percent: Math.max(0, Math.min(100, progress.percent)),
              status: 'uploading'
            });
          }
        }
      });
    } catch (reason) {
      uploadControllersRef.current.delete(item.id);

      if (controller.signal.aborted) {
        updateUpload(item.id, { status: 'canceled' });
        return;
      }

      updateUpload(item.id, {
        status: 'error',
        error: reason instanceof Error ? reason.message : undefined
      });
      return;
    }

    uploadControllersRef.current.delete(item.id);

    if (controller.signal.aborted) {
      return;
    }

    updateUpload(item.id, { status: 'success', percent: 100 });
    setRefreshToken((token) => token + 1);
    onUpload?.(uploaded);
  };

  const cancelUpload = (id: string) => {
    uploadControllersRef.current.get(id)?.abort();
    uploadControllersRef.current.delete(id);
    updateUpload(id, { status: 'canceled' });
  };

  const retryUpload = (id: string) => {
    const item = uploads.find((candidate) => candidate.id === id);

    if (!item || !provider.upload) {
      return;
    }

    runUpload(item).catch(() => undefined);
  };

  const dismissUpload = (id: string) => {
    uploadControllersRef.current.get(id)?.abort();
    uploadControllersRef.current.delete(id);
    setUploads((current) => current.filter((item) => item.id !== id));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (readOnly || !provider.upload) {
      return;
    }

    const list = Array.from(files);

    if (list.length === 0) {
      return;
    }

    const destination = path;
    const items: UploadQueueItem[] = list.map((file) => ({
      id: `upload-${++uploadIdRef.current}`,
      file,
      name: file.name,
      destination,
      percent: 0,
      status: 'uploading'
    }));

    setUploads((current) => [...current.slice(-19), ...items]);
    await Promise.all(items.map((item) => runUpload(item)));
  };

  useEffect(
    () => () => {
      uploadControllersRef.current.forEach((controller) => controller.abort());
      uploadControllersRef.current.clear();
    },
    []
  );

  const openMenu = (entry: FileEntry | undefined, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = rootRef.current?.getBoundingClientRect();
    setMenu({
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
      entry
    });
  };

  const getEntryIcon = (entry: FileEntry) => {
    if (renderIcon) {
      return renderIcon(entry);
    }

    return (
      <Icon
        icon={entry.type === 'folder' ? 'folder-outline' : 'file-text-outline'}
        pack="nebular-essentials"
        aria-hidden="true"
      />
    );
  };

  const renderEntryName = (entry: FileEntry) => {
    if (renaming?.path === entry.path) {
      return (
        <input
          className={cx(classes.renameInput)}
          value={renameValue}
          autoFocus
          aria-label={labels.renameLabel(entry.name)}
          onChange={(event) => setRenameValue(event.currentTarget.value)}
          onBlur={() => {
            commitRename().catch(() => undefined);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitRename().catch(() => undefined);
            } else if (event.key === 'Escape') {
              event.preventDefault();
              setRenaming(null);
            }
          }}
        />
      );
    }

    return <span className={cx(classes.entryName)}>{entry.name}</span>;
  };

  const renderTopSpacer = () =>
    virtualEnabled && visibleStart > 0 ? (
      <div aria-hidden="true" style={{ height: visibleStart * VIRTUAL_ROW_HEIGHT }} />
    ) : null;

  const renderBottomSpacer = () =>
    virtualEnabled && visibleEnd < sortedEntries.length ? (
      <div
        aria-hidden="true"
        style={{ height: (sortedEntries.length - visibleEnd) * VIRTUAL_ROW_HEIGHT }}
      />
    ) : null;

  const renderRow = (entry: FileEntry, index: number, details = false) => {
    const disabled = !canReadEntry(entry);
    const rowStyle: React.CSSProperties = {};

    if (virtualEnabled) {
      rowStyle.height = VIRTUAL_ROW_HEIGHT;
    }

    if (details) {
      rowStyle.gridTemplateColumns = DETAILS_COLUMNS;
    }

    return (
      <div
        key={entry.path}
        role="option"
        aria-selected={selectedSet.has(entry.path)}
        aria-disabled={disabled || undefined}
        aria-posinset={index + 1}
        aria-setsize={sortedEntries.length}
        data-file-path={entry.path}
        title={entryRestrictionTitle(entry)}
        className={cx(classes.row, {
          [classes.rowSelected]: selectedSet.has(entry.path),
          [classes.rowDropTarget]: dropTarget === entry.path,
          [classes.rowDisabled]: disabled
        })}
        style={Object.keys(rowStyle).length > 0 ? rowStyle : undefined}
        tabIndex={-1}
        draggable={!readOnly && !!provider.move && canWriteEntry(entry)}
        onClick={(event) => toggleEntry(entry, index, event)}
        onDoubleClick={() => openEntry(entry)}
        onContextMenu={(event) => openMenu(entry, event)}
        onDragStart={(event) => startEntryDrag(entry, event)}
        onDragOver={(event) => handleFolderDragOver(entry, event)}
        onDragLeave={() => {
          if (dropTarget === entry.path) {
            setDropTarget(null);
          }
        }}
        onDrop={(event) => handleFolderDrop(entry, event)}
      >
        <span className={cx(classes.rowName)}>
          <span className={cx(classes.entryIcon)}>{getEntryIcon(entry)}</span>
          {renderEntryName(entry)}
        </span>
        {details && (
          <span className={cx(classes.entryMeta)}>
            {entry.type === 'folder' ? labels.folder : labels.file}
          </span>
        )}
        <span className={cx(classes.entryMeta)}>{formatSize(entry.size)}</span>
        <span className={cx(classes.entryMeta)}>{formatDate(entry.modifiedAt)}</span>
      </div>
    );
  };

  const renderList = () => (
    <div
      ref={(element) => {
        contentRef.current = element;
        scrollRef.current = element;
      }}
      className={cx(classes.content)}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      tabIndex={0}
      onKeyDown={handleContentKeyDown}
      onContextMenu={(event) => openMenu(undefined, event)}
      onScroll={(event) => {
        if (virtualEnabled) {
          setScrollTop(event.currentTarget.scrollTop);
        }
      }}
    >
      <div className={cx(classes.list)}>
        {renderTopSpacer()}
        {visibleEntries.map((entry, index) => renderRow(entry, visibleStart + index))}
        {renderBottomSpacer()}
      </div>
    </div>
  );

  const renderGrid = () => (
    <div
      ref={contentRef}
      className={cx(classes.content)}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      tabIndex={0}
      onKeyDown={handleContentKeyDown}
      onContextMenu={(event) => openMenu(undefined, event)}
    >
      <div className={cx(classes.grid)}>
        {sortedEntries.map((entry, index) => {
          const disabled = !canReadEntry(entry);

          return (
            <div
              key={entry.path}
              role="option"
              aria-selected={selectedSet.has(entry.path)}
              aria-disabled={disabled || undefined}
              aria-posinset={index + 1}
              aria-setsize={sortedEntries.length}
              data-file-path={entry.path}
              title={entryRestrictionTitle(entry)}
              className={cx(classes.tile, {
                [classes.tileSelected]: selectedSet.has(entry.path),
                [classes.tileDropTarget]: dropTarget === entry.path,
                [classes.tileDisabled]: disabled
              })}
              tabIndex={-1}
              draggable={!readOnly && !!provider.move && canWriteEntry(entry)}
              onClick={(event) => toggleEntry(entry, index, event)}
              onDoubleClick={() => openEntry(entry)}
              onContextMenu={(event) => openMenu(entry, event)}
              onDragStart={(event) => startEntryDrag(entry, event)}
              onDragOver={(event) => handleFolderDragOver(entry, event)}
              onDragLeave={() => {
                if (dropTarget === entry.path) {
                  setDropTarget(null);
                }
              }}
              onDrop={(event) => handleFolderDrop(entry, event)}
            >
              <span className={cx(classes.tileIcon)}>{getEntryIcon(entry)}</span>
              {renderEntryName(entry)}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDetails = () => (
    <div
      ref={scrollRef}
      className={cx(classes.content)}
      onScroll={(event) => {
        if (virtualEnabled) {
          setScrollTop(event.currentTarget.scrollTop);
        }
      }}
    >
      <div
        className={cx(classes.detailsHead)}
        style={{ display: 'grid', gridTemplateColumns: DETAILS_COLUMNS }}
      >
        {(
          [
            ['name', labels.name],
            ['type', labels.type],
            ['size', labels.size],
            ['modified', labels.modified]
          ] as [FileExplorerSortBy, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={cx(classes.detailsHeader)}
            onClick={() => {
              if (sortBy === key) {
                setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
              } else {
                setSortBy(key);
                setSortDirection('asc');
              }
            }}
          >
            {label}
            {sortBy === key ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
          </button>
        ))}
      </div>
      <div
        ref={contentRef}
        role="listbox"
        aria-label={ariaLabel}
        aria-multiselectable={selectionMode === 'multiple' || undefined}
        tabIndex={0}
        onKeyDown={handleContentKeyDown}
        onContextMenu={(event) => openMenu(undefined, event)}
      >
        {renderTopSpacer()}
        {visibleEntries.map((entry, index) => renderRow(entry, visibleStart + index, true))}
        {renderBottomSpacer()}
      </div>
    </div>
  );

  const segments = pathSegments(path);
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;
  const showPreviewPanel = showPreview && !!previewEntry;
  const menuEntry = menu?.entry;
  const menuEntryCanRead = menuEntry ? canReadEntry(menuEntry) : false;
  const menuEntryCanWrite = menuEntry ? canWriteEntry(menuEntry) : false;
  const menuEntryCanDelete = menuEntry ? canDeleteEntry(menuEntry) : false;
  const menuEntryCanDownload = menuEntry ? canDownloadEntry(menuEntry) : false;

  const tabLabel = (tabPath: string) => pathSegments(tabPath).at(-1)?.name ?? labels.root;

  const goToTabPath = (nextPath: string) => {
    if (nextPath === path) {
      return;
    }

    if (controlledPath === undefined) {
      setInternalPath(nextPath);
    }
    onPathChange?.(nextPath);
    setQuery('');
    setSearching(false);
    applySelection([], []);
  };

  const activateTab = (id: string) => {
    const tab = tabState.find((item) => item.id === id);

    setActiveTabId(id);

    if (tab) {
      goToTabPath(tab.path);
    }
  };

  const addTab = () => {
    const id = `tab-${++tabCounterRef.current}`;
    setTabState((current) => [...current, { id, path }]);
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    if (tabState.length <= 1) {
      return;
    }

    const index = tabState.findIndex((tab) => tab.id === id);
    const remaining = tabState.filter((tab) => tab.id !== id);
    setTabState(remaining);

    if (activeTabId === id) {
      const next = remaining[Math.max(0, index - 1)] ?? remaining[0];
      setActiveTabId(next.id);
      goToTabPath(next.path);
    }
  };

  return (
    <div
      {...others}
      ref={(element) => {
        rootRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      }}
      className={cx(classes.root, className)}
      style={
        {
          ...style,
          '--file-explorer-sidebar-width':
            typeof sidebarWidth === 'number' ? `${sidebarWidth}px` : sidebarWidth
        } as React.CSSProperties
      }
      onDragOver={(event) => {
        const externalDrag = event.dataTransfer?.types?.includes(EXTERNAL_DRAG_MIME);

        if (externalDrag && provider.move && !readOnly) {
          event.preventDefault();
          return;
        }

        if (provider.upload && !readOnly) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) {
          setDragging(false);
        }
      }}
      onDrop={(event) => {
        if (dragEntries) {
          setDropTarget(null);
          return;
        }

        const externalPaths = readExternalDragPaths(event);

        if (externalPaths.length > 0 && provider.move && !readOnly) {
          event.preventDefault();
          setDragging(false);
          moveEntriesTo(path, externalPaths).catch(() => undefined);
          return;
        }

        if (provider.upload && !readOnly && event.dataTransfer.files.length > 0) {
          event.preventDefault();
          setDragging(false);
          uploadFiles(event.dataTransfer.files).catch(() => undefined);
        }
      }}
    >
      {tabs && (
        <div className={cx(classes.tabBar)} role="tablist" aria-label={labels.tabs}>
          {tabState.map((tab) => (
            <div key={tab.id} className={cx(classes.tab)}>
              <button
                type="button"
                role="tab"
                aria-selected={tab.id === activeTabId}
                className={cx(classes.tabButton, {
                  [classes.tabButtonActive]: tab.id === activeTabId
                })}
                onClick={() => activateTab(tab.id)}
              >
                {tabLabel(tab.path)}
              </button>
              <button
                type="button"
                className={cx(classes.tabClose)}
                aria-label={labels.closeTab(tabLabel(tab.path))}
                disabled={tabState.length <= 1}
                onClick={() => closeTab(tab.id)}
              >
                <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className={cx(classes.tabNew)}
            aria-label={labels.newTab}
            title={labels.newTab}
            onClick={addTab}
          >
            +
          </button>
        </div>
      )}
      <div className={cx(classes.toolbar)}>
        <div className={cx(classes.navGroup)}>
          <button
            type="button"
            className={cx(classes.iconButton)}
            aria-label={labels.back}
            title={labels.back}
            disabled={!canGoBack}
            onClick={() => {
              if (!canGoBack) return;
              const nextIndex = historyIndex - 1;
              setHistoryIndex(nextIndex);
              const nextPath = history[nextIndex];
              if (controlledPath === undefined) setInternalPath(nextPath);
              onPathChange?.(nextPath);
              setQuery('');
              setSearching(false);
            }}
          >
            <Icon icon="chevron-left-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cx(classes.iconButton)}
            aria-label={labels.forward}
            title={labels.forward}
            disabled={!canGoForward}
            onClick={() => {
              if (!canGoForward) return;
              const nextIndex = historyIndex + 1;
              setHistoryIndex(nextIndex);
              const nextPath = history[nextIndex];
              if (controlledPath === undefined) setInternalPath(nextPath);
              onPathChange?.(nextPath);
              setQuery('');
              setSearching(false);
            }}
          >
            <Icon icon="chevron-right-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cx(classes.iconButton)}
            aria-label={labels.up}
            title={labels.up}
            disabled={path === '/'}
            onClick={() => navigate(parentPath(path))}
          >
            <Icon icon="chevron-up-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cx(classes.iconButton)}
            aria-label={labels.refresh}
            title={labels.refresh}
            onClick={() => setRefreshToken((token) => token + 1)}
          >
            <Icon icon="refresh-outline" pack="nebular-essentials" aria-hidden="true" />
          </button>
        </div>
        <nav className={cx(classes.breadcrumb)} aria-label={labels.breadcrumb}>
          <button
            type="button"
            className={cx(classes.breadcrumbButton, {
              [classes.breadcrumbCurrent]: segments.length === 0
            })}
            aria-current={segments.length === 0 ? 'page' : undefined}
            onClick={() => navigate('/')}
          >
            {labels.root}
          </button>
          {segments.map((segment, index) => (
            <React.Fragment key={segment.path}>
              <span className={cx(classes.breadcrumbSeparator)} aria-hidden="true">
                /
              </span>
              <button
                type="button"
                className={cx(classes.breadcrumbButton, {
                  [classes.breadcrumbCurrent]: index === segments.length - 1
                })}
                aria-current={index === segments.length - 1 ? 'page' : undefined}
                onClick={() => navigate(segment.path)}
              >
                {segment.name}
              </button>
            </React.Fragment>
          ))}
        </nav>
        {searchable && (
          <input
            type="search"
            className={cx(classes.search)}
            value={query}
            placeholder={labels.search}
            aria-label={labels.search}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        )}
        <div className={cx(classes.spacer)} />
        <div className={cx(classes.viewGroup)} role="group" aria-label={labels.viewList}>
          {(
            [
              ['list', labels.viewList],
              ['grid', labels.viewGrid],
              ['details', labels.viewDetails]
            ] as [FileExplorerView, string][]
          ).map(([nextView, label]) => (
            <button
              key={nextView}
              type="button"
              className={cx(classes.viewButton, {
                [classes.viewButtonActive]: view === nextView
              })}
              aria-label={label}
              aria-pressed={view === nextView}
              title={label}
              onClick={() => setView(nextView)}
            >
              {nextView === 'list' ? '☰' : nextView === 'grid' ? '▦' : '☷'}
            </button>
          ))}
        </div>
        {!readOnly && (
          <div className={cx(classes.actions)}>
            {provider.createFolder && (
              <button
                type="button"
                className={cx(classes.actionButton)}
                onClick={() => {
                  setCreating(true);
                  setNewFolderName('');
                }}
              >
                {labels.newFolder}
              </button>
            )}
            {provider.rename && selectedEntries.length === 1 && (
              <button
                type="button"
                className={cx(classes.actionButton)}
                disabled={!selectedCanWrite}
                title={selectedCanWrite ? undefined : labels.permissionDenied(labels.rename)}
                onClick={() => startRename(selectedEntries[0])}
              >
                {labels.rename}
              </button>
            )}
            {(provider.remove || canTrash) && selectedEntries.length > 0 && (
              <button
                type="button"
                className={cx(classes.actionButton, classes.danger)}
                disabled={!selectedCanDelete}
                title={selectedCanDelete ? undefined : labels.permissionDenied(labels.delete)}
                onClick={() => requestDelete(selectedEntries)}
              >
                {labels.delete}
              </button>
            )}
            {selectedEntries.length > 0 && provider.move && (
              <button
                type="button"
                className={cx(classes.actionButton)}
                disabled={!selectedCanWrite}
                title={selectedCanWrite ? undefined : labels.permissionDenied(labels.cut)}
                onClick={() => copySelection('cut')}
              >
                {labels.cut}
              </button>
            )}
            {selectedEntries.length > 0 && provider.copy && (
              <button
                type="button"
                className={cx(classes.actionButton)}
                disabled={!selectedCanRead}
                title={selectedCanRead ? undefined : labels.permissionDenied(labels.copy)}
                onClick={() => copySelection('copy')}
              >
                {labels.copy}
              </button>
            )}
            {clipboard && (clipboard.mode === 'cut' ? provider.move : provider.copy) && (
              <button
                type="button"
                className={cx(classes.actionButton)}
                onClick={() => {
                  pasteSelection().catch(() => undefined);
                }}
              >
                {labels.paste}
              </button>
            )}
            {provider.upload && (
              <>
                <button
                  type="button"
                  className={cx(classes.actionButton)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {labels.upload}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  className={cx(classes.visuallyHidden)}
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={(event) => {
                    if (event.currentTarget.files) {
                      uploadFiles(event.currentTarget.files).catch(() => undefined);
                      event.currentTarget.value = '';
                    }
                  }}
                />
              </>
            )}
            {showTrashPanel && (
              <button type="button" className={cx(classes.actionButton)} onClick={openTrashPanel}>
                {labels.trash}
              </button>
            )}
          </div>
        )}
      </div>
      {pendingUndo && pendingUndo.length > 0 && (
        <div className={cx(classes.undoBar)} role="status" aria-live="polite" aria-atomic="true">
          <span>{labels.movedToTrash(pendingUndo.length)}</span>
          {provider.restore && (
            <button
              type="button"
              className={cx(classes.actionButton)}
              onClick={() => {
                undoTrash().catch(() => undefined);
              }}
            >
              {labels.undo}
            </button>
          )}
        </div>
      )}
      {creating && (
        <div className={cx(classes.createBar)}>
          <input
            className={cx(classes.input)}
            value={newFolderName}
            autoFocus
            placeholder={labels.newFolderPlaceholder}
            aria-label={labels.newFolderPlaceholder}
            onChange={(event) => setNewFolderName(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                createFolder().catch(() => undefined);
              } else if (event.key === 'Escape') {
                setCreating(false);
              }
            }}
          />
          <button
            type="button"
            className={cx(classes.actionButton)}
            onClick={() => {
              createFolder().catch(() => undefined);
            }}
          >
            {labels.save}
          </button>
          <button
            type="button"
            className={cx(classes.actionButton)}
            onClick={() => setCreating(false)}
          >
            {labels.cancel}
          </button>
        </div>
      )}
      {selectedEntries.length > 1 && (
        <div className={cx(classes.selectionBar)}>
          <span>{labels.selectionCount(selectedEntries.length)}</span>
          <button
            type="button"
            className={cx(classes.actionButton)}
            onClick={() => applySelection([], sortedEntries)}
          >
            {labels.clearSelection}
          </button>
        </div>
      )}
      <div className={cx(classes.body)}>
        {sidebar && (
          <aside className={cx(classes.sidebar)} aria-label={ariaLabel}>
            {sidebar}
          </aside>
        )}
        <div className={cx(classes.main)}>
          {loading ? (
            <div className={cx(classes.empty)} role="status">
              {labels.loading}
            </div>
          ) : error ? (
            <div className={cx(classes.error)} role="alert">
              <span>{labels.error}</span>
              {error instanceof FileSystemError && <span>{error.message}</span>}
              <button
                type="button"
                className={cx(classes.actionButton)}
                onClick={() => setRefreshToken((token) => token + 1)}
              >
                {labels.retry}
              </button>
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className={cx(classes.empty)}>
              {emptyState ?? (searching ? labels.noResults : labels.empty)}
            </div>
          ) : view === 'grid' ? (
            renderGrid()
          ) : view === 'details' ? (
            renderDetails()
          ) : (
            renderList()
          )}
          {hasMore && (
            <div className={cx(classes.paginationBar)}>
              <button
                type="button"
                className={cx(classes.actionButton)}
                disabled={loadingMore}
                onClick={() => {
                  loadMore().catch(() => undefined);
                }}
              >
                {loadingMore ? labels.loadingMore : labels.loadMore}
              </button>
            </div>
          )}
          {uploads.length > 0 && (
            <div className={cx(classes.uploadPanel)} role="region" aria-label={labels.uploadQueue}>
              {uploads.map((item) => {
                const percent = Math.round(Math.max(0, Math.min(100, item.percent)));
                const terminalLabel =
                  item.status === 'success'
                    ? labels.uploadSuccess(item.name)
                    : item.status === 'error'
                      ? labels.uploadError(item.name)
                      : item.status === 'canceled'
                        ? labels.uploadCanceled(item.name)
                        : '';

                return (
                  <div
                    key={item.id}
                    className={cx(classes.uploadItem)}
                    data-upload-status={item.status}
                  >
                    <span className={cx(classes.uploadName)} title={item.error ?? item.name}>
                      {item.name}
                    </span>
                    {item.status === 'uploading' && (
                      <>
                        <div
                          className={cx(classes.uploadTrack)}
                          role="progressbar"
                          aria-label={labels.uploadProgress(item.name, percent)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={percent}
                        >
                          <div
                            className={cx(classes.uploadFill)}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className={cx(classes.uploadPercent)}>{percent}%</span>
                      </>
                    )}
                    <span
                      className={cx(classes.uploadState, {
                        [classes.uploadStateSuccess]: item.status === 'success',
                        [classes.uploadStateError]: item.status === 'error',
                        [classes.uploadStateCanceled]: item.status === 'canceled'
                      })}
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      {terminalLabel}
                    </span>
                    <span className={cx(classes.uploadActions)}>
                      {item.status === 'uploading' && (
                        <button
                          type="button"
                          className={cx(classes.iconButton)}
                          aria-label={labels.uploadCancel(item.name)}
                          title={labels.uploadCancel(item.name)}
                          onClick={() => cancelUpload(item.id)}
                        >
                          <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
                        </button>
                      )}
                      {(item.status === 'error' || item.status === 'canceled') && (
                        <button
                          type="button"
                          className={cx(classes.iconButton)}
                          aria-label={labels.uploadRetry(item.name)}
                          title={labels.uploadRetry(item.name)}
                          onClick={() => retryUpload(item.id)}
                        >
                          <Icon
                            icon="refresh-outline"
                            pack="nebular-essentials"
                            aria-hidden="true"
                          />
                        </button>
                      )}
                      {item.status !== 'uploading' && (
                        <button
                          type="button"
                          className={cx(classes.iconButton)}
                          aria-label={labels.uploadDismiss(item.name)}
                          title={labels.uploadDismiss(item.name)}
                          onClick={() => dismissUpload(item.id)}
                        >
                          <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {showPreviewPanel && previewEntry && (
          <aside className={cx(classes.preview)} aria-label={labels.preview(previewEntry.name)}>
            <div className={cx(classes.previewHeader)}>
              <span>{labels.preview(previewEntry.name)}</span>
              <button
                type="button"
                className={cx(classes.iconButton)}
                aria-label={labels.closePreview}
                title={labels.closePreview}
                onClick={() => setPreviewDismissed(true)}
              >
                <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
              </button>
            </div>
            {renderPreview ? (
              renderPreview(previewEntry)
            ) : (
              <FilePreview
                entry={previewEntry}
                labels={labels}
                className={cx(
                  previewKind === 'image'
                    ? classes.previewImage
                    : previewKind === 'audio' || previewKind === 'video'
                      ? classes.previewMedia
                      : previewKind === 'pdf'
                        ? classes.previewPdf
                        : classes.previewText
                )}
              />
            )}
          </aside>
        )}
      </div>
      {dragging && (
        <div className={cx(classes.dropOverlay)} aria-hidden="true">
          {labels.dropToUpload}
        </div>
      )}
      {menu && (
        <div
          ref={menuRef}
          className={cx(classes.menu)}
          style={{ left: menu.x, top: menu.y }}
          role="menu"
          aria-label={menu.entry ? labels.menuLabel(menu.entry.name) : labels.root}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {menu.entry && (
            <>
              <button
                type="button"
                role="menuitem"
                className={cx(classes.menuItem)}
                disabled={!menuEntryCanRead}
                title={menuEntryCanRead ? undefined : labels.permissionDenied(labels.open)}
                onClick={() => {
                  openEntry(menu.entry as FileEntry);
                  setMenu(null);
                }}
              >
                {labels.open}
              </button>
              {provider.rename && !readOnly && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  disabled={!menuEntryCanWrite}
                  title={menuEntryCanWrite ? undefined : labels.permissionDenied(labels.rename)}
                  onClick={() => startRename(menu.entry as FileEntry)}
                >
                  {labels.rename}
                </button>
              )}
              {provider.copy && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  disabled={!menuEntryCanRead}
                  title={menuEntryCanRead ? undefined : labels.permissionDenied(labels.copy)}
                  onClick={() => {
                    if (!menuEntryCanRead) {
                      return;
                    }

                    applySelection([(menu.entry as FileEntry).path], sortedEntries);
                    setClipboard({ mode: 'copy', entries: [menu.entry as FileEntry] });
                    setMenu(null);
                  }}
                >
                  {labels.copy}
                </button>
              )}
              {provider.move && !readOnly && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  disabled={!menuEntryCanWrite}
                  title={menuEntryCanWrite ? undefined : labels.permissionDenied(labels.cut)}
                  onClick={() => {
                    if (!menuEntryCanWrite) {
                      return;
                    }

                    applySelection([(menu.entry as FileEntry).path], sortedEntries);
                    setClipboard({ mode: 'cut', entries: [menu.entry as FileEntry] });
                    setMenu(null);
                  }}
                >
                  {labels.cut}
                </button>
              )}
              {provider.download && menu.entry.type === 'file' && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  disabled={!menuEntryCanDownload}
                  title={
                    menuEntryCanDownload ? undefined : labels.permissionDenied(labels.download)
                  }
                  onClick={() => {
                    downloadEntry(menu.entry as FileEntry).catch(() => undefined);
                  }}
                >
                  {labels.download}
                </button>
              )}
              {(provider.remove || canTrash) && !readOnly && (
                <>
                  <div className={cx(classes.menuSeparator)} role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(classes.menuItem, classes.danger)}
                    disabled={!menuEntryCanDelete}
                    title={menuEntryCanDelete ? undefined : labels.permissionDenied(labels.delete)}
                    onClick={() => {
                      requestDelete([menu.entry as FileEntry]);
                      setMenu(null);
                    }}
                  >
                    {labels.delete}
                  </button>
                </>
              )}
            </>
          )}
          {!menu.entry && !readOnly && provider.createFolder && (
            <button
              type="button"
              role="menuitem"
              className={cx(classes.menuItem)}
              onClick={() => {
                setCreating(true);
                setMenu(null);
              }}
            >
              {labels.newFolder}
            </button>
          )}
          {!menu.entry && !readOnly && provider.upload && (
            <button
              type="button"
              role="menuitem"
              className={cx(classes.menuItem)}
              onClick={() => {
                fileInputRef.current?.click();
                setMenu(null);
              }}
            >
              {labels.upload}
            </button>
          )}
          {!menu.entry &&
            !readOnly &&
            clipboard &&
            (clipboard.mode === 'cut' ? provider.move : provider.copy) && (
              <button
                type="button"
                role="menuitem"
                className={cx(classes.menuItem)}
                onClick={() => {
                  pasteSelection().catch(() => undefined);
                  setMenu(null);
                }}
              >
                {labels.paste}
              </button>
            )}
          {!menu.entry && showTrashPanel && (
            <button
              type="button"
              role="menuitem"
              className={cx(classes.menuItem)}
              onClick={openTrashPanel}
            >
              {labels.trash}
            </button>
          )}
        </div>
      )}
      <span id={`${listboxId}-status`} className={cx(classes.visuallyHidden)} aria-live="polite">
        {selectedEntries.length > 0 ? labels.selectionCount(selectedEntries.length) : ''}
      </span>
      <ConfirmDialog
        opened={!!deleting}
        title={labels.deleteTitle}
        message={labels.deleteMessage(deleting?.length ?? 0)}
        confirmLabel={labels.confirmDelete}
        cancelLabel={labels.cancel}
        danger
        zIndex={2100000000}
        onConfirm={() => {
          confirmDelete().catch(() => undefined);
        }}
        onCancel={() => setDeleting(null)}
      />
      <Modal
        opened={trashPanelOpen && showTrashPanel}
        onClose={closeTrashPanel}
        title={labels.trashTitle}
        size={480}
        zIndex={2100000000}
        withCloseButton={false}
        footer={
          <>
            {provider.emptyTrash && (
              <button
                type="button"
                className={cx(classes.actionButton)}
                disabled={trashLoading || trashItems.length === 0}
                onClick={() => {
                  emptyAllTrash().catch(() => undefined);
                }}
              >
                {labels.emptyTrash}
              </button>
            )}
            <button
              type="button"
              className={cx(classes.actionButton)}
              aria-label={labels.closePreview}
              title={labels.closePreview}
              onClick={closeTrashPanel}
            >
              <Icon icon="close-outline" pack="nebular-essentials" aria-hidden="true" />
            </button>
          </>
        }
      >
        <p className={cx(classes.trashHint)}>{labels.trashHint}</p>
        {trashError ? (
          <p className={cx(classes.trashError)} role="alert">
            {labels.error}
          </p>
        ) : null}
        {trashLoading ? (
          <p className={cx(classes.trashStatus)} role="status">
            {labels.loading}
          </p>
        ) : trashItems.length === 0 ? (
          <p className={cx(classes.trashStatus)}>{labels.trashEmpty}</p>
        ) : (
          <ul className={cx(classes.trashList)}>
            {trashItems.map((entry) => (
              <li key={entry.path} className={cx(classes.trashItem)}>
                <span className={cx(classes.entryIcon)}>{getEntryIcon(entry)}</span>
                <span className={cx(classes.trashEntryText)}>
                  <span className={cx(classes.trashEntryName)}>{entry.name}</span>
                  <span className={cx(classes.trashEntryPath)}>{entry.path}</span>
                </span>
                {provider.restore && (
                  <button
                    type="button"
                    className={cx(classes.actionButton)}
                    aria-label={`${labels.restore} ${entry.name}`}
                    onClick={() => {
                      restoreTrashEntry(entry).catch(() => undefined);
                    }}
                  >
                    {labels.restore}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
