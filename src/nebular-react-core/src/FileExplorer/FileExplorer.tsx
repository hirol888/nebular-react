import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useComponentDefaultProps, useNebularLocale } from '@nebular-react/styles';
import { ConfirmDialog } from '../ConfirmDialog';
import { Icon } from '../Icon';
import { useStyles } from './FileExplorer.styles';
import type {
  FileEntry,
  FileExplorerLabels,
  FileExplorerProps,
  FileExplorerSortBy,
  FileExplorerSortDirection,
  FileExplorerView,
  FileUploadProgress
} from './FileExplorer.types';
import { FileSystemError, normalizePath, parentPath, pathSegments } from './FileExplorer.providers';

const defaultProps: Partial<FileExplorerProps> = {
  defaultPath: '/',
  defaultView: 'list',
  searchable: true,
  selectionMode: 'multiple',
  readOnly: false,
  multiple: true,
  ariaLabel: 'File explorer',
  sidebarWidth: '14rem'
};

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
  const isImage = entry.mimeType?.startsWith('image/');
  const isText =
    entry.mimeType?.startsWith('text/') ||
    entry.mimeType === 'application/json' ||
    /\.(md|txt|json|csv|log|ts|tsx|js|jsx|css|html|xml|yml|yaml)$/i.test(entry.name);

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

  if (isImage && entry.url) {
    return <img className={className} src={entry.url} alt={entry.name} />;
  }

  if (isText && text !== null) {
    return <pre className={className}>{text}</pre>;
  }

  return <p className={className}>{labels.empty}</p>;
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
    selectionMode,
    selectedKeys,
    defaultSelectedKeys,
    onSelectionChange,
    onOpen,
    onOpenFolder,
    onRename,
    onDelete,
    onCreateFolder,
    onUpload,
    onDownload,
    readOnly,
    accept,
    multiple,
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
      open: t('fileExplorer.open', 'Open'),
      selectAll: t('fileExplorer.selectAll', 'Select all'),
      clearSelection: t('fileExplorer.clearSelection', 'Clear selection'),
      selectionCount: (count) => t('fileExplorer.selectionCount', '{count} selected', { count }),
      deleteTitle: t('fileExplorer.deleteTitle', 'Delete items'),
      deleteMessage: (count) =>
        t('fileExplorer.deleteMessage', 'Delete {count} item(s)?', { count }),
      confirmDelete: t('fileExplorer.confirmDelete', 'Delete'),
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
      uploadProgress: (name, percent) =>
        t('fileExplorer.uploadProgress', 'Uploading {name} ({percent}%)', { name, percent }),
      uploadError: (name) => t('fileExplorer.uploadError', 'Upload failed: {name}', { name }),
      dropToUpload: t('fileExplorer.dropToUpload', 'Drop files to upload'),
      ...labelsProp
    }),
    [t, labelsProp]
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [internalPath, setInternalPath] = useState(defaultPath);
  const path = normalizePath(controlledPath ?? internalPath);
  const [history, setHistory] = useState<string[]>([path]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [internalView, setInternalView] = useState<FileExplorerView>(defaultView);
  const view = controlledView ?? internalView;
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [dragging, setDragging] = useState(false);
  const [upload, setUpload] = useState<FileUploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
    [onSelectionChange, selectedKeys]
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
      onPathChange?.(normalized);
      setQuery('');
      setSearching(false);
      applySelection([], []);
    },
    [applySelection, controlledPath, historyIndex, onPathChange, path]
  );

  useEffect(() => {
    if (searching || query.trim()) {
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(undefined);

    provider
      .list(path, { signal: controller.signal })
      .then((next) => {
        if (!controller.signal.aborted) {
          setEntries(next);
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(reason);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [provider, path, refreshToken, query, searching]);

  useEffect(() => {
    const normalized = query.trim();

    if (!normalized) {
      setSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError(undefined);
      setSearching(true);

      const request = provider.search
        ? provider.search(normalized, { signal: controller.signal, limit: 200 })
        : provider
            .list(path, { signal: controller.signal })
            .then((items) =>
              items.filter((entry) => entry.name.toLowerCase().includes(normalized.toLowerCase()))
            );

      request
        .then((next) => {
          if (!controller.signal.aborted) {
            setEntries(next);
            setLoading(false);
          }
        })
        .catch((reason) => {
          if (!controller.signal.aborted) {
            setError(reason);
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [provider, path, query, refreshToken]);

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

  const setView = (next: FileExplorerView) => {
    if (controlledView === undefined) {
      setInternalView(next);
    }
    onViewChange?.(next);
  };

  const openEntry = (entry: FileEntry) => {
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
    } else if (event.key === 'Delete' && selectedEntries.length > 0) {
      event.preventDefault();
      setDeleting(selectedEntries);
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
      contentRef.current?.querySelectorAll<HTMLElement>('[data-file-path]').forEach((element) => {
        if (element.getAttribute('data-file-path') === sortedEntries[nextIndex].path) {
          element.focus();
        }
      });
    }
  };

  const startRename = (entry: FileEntry) => {
    if (readOnly || !provider.rename) {
      return;
    }

    setRenaming(entry);
    setRenameValue(entry.name);
    setMenu(null);
  };

  const commitRename = async () => {
    if (!renaming || !provider.rename) {
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

  const confirmDelete = async () => {
    if (!deleting || !provider.remove) {
      setDeleting(null);
      return;
    }

    try {
      await provider.remove(deleting.map((entry) => entry.path));
      onDelete?.(deleting);
      setDeleting(null);
      applySelection([], sortedEntries);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setError(reason);
    }
  };

  const downloadEntry = async (entry: FileEntry) => {
    setMenu(null);

    if (!provider.download) {
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

  const uploadFiles = async (files: FileList | File[]) => {
    if (readOnly || !provider.upload) {
      return;
    }

    const list = Array.from(files);

    if (list.length === 0) {
      return;
    }

    setUploadError(null);

    try {
      const uploaded = await provider.upload(path, list, {
        onProgress: (progress) => setUpload(progress)
      });
      setUpload(null);
      onUpload?.(uploaded);
      setRefreshToken((token) => token + 1);
    } catch (reason) {
      setUpload(null);
      setUploadError(reason instanceof Error ? reason.message : labels.uploadError(list[0].name));
      setError(reason);
    }
  };

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

  const renderList = () => (
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
      <div className={cx(classes.list)}>
        {sortedEntries.map((entry, index) => (
          <div
            key={entry.path}
            role="option"
            aria-selected={selectedSet.has(entry.path)}
            data-file-path={entry.path}
            className={cx(classes.row, {
              [classes.rowSelected]: selectedSet.has(entry.path)
            })}
            tabIndex={-1}
            onClick={(event) => toggleEntry(entry, index, event)}
            onDoubleClick={() => openEntry(entry)}
            onContextMenu={(event) => openMenu(entry, event)}
          >
            <span className={cx(classes.rowName)}>
              <span className={cx(classes.entryIcon)}>{getEntryIcon(entry)}</span>
              {renderEntryName(entry)}
            </span>
            <span className={cx(classes.entryMeta)}>{formatSize(entry.size)}</span>
            <span className={cx(classes.entryMeta)}>{formatDate(entry.modifiedAt)}</span>
          </div>
        ))}
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
        {sortedEntries.map((entry, index) => (
          <div
            key={entry.path}
            role="option"
            aria-selected={selectedSet.has(entry.path)}
            data-file-path={entry.path}
            className={cx(classes.tile, {
              [classes.tileSelected]: selectedSet.has(entry.path)
            })}
            tabIndex={-1}
            onClick={(event) => toggleEntry(entry, index, event)}
            onDoubleClick={() => openEntry(entry)}
            onContextMenu={(event) => openMenu(entry, event)}
          >
            <span className={cx(classes.tileIcon)}>{getEntryIcon(entry)}</span>
            {renderEntryName(entry)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetails = () => {
    const columns = 'minmax(0, 1fr) 5rem 6rem 8rem';

    return (
      <div className={cx(classes.content)}>
        <div
          className={cx(classes.detailsHead)}
          style={{ display: 'grid', gridTemplateColumns: columns }}
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
          {sortedEntries.map((entry, index) => (
            <div
              key={entry.path}
              role="option"
              aria-selected={selectedSet.has(entry.path)}
              data-file-path={entry.path}
              className={cx(classes.row, {
                [classes.rowSelected]: selectedSet.has(entry.path)
              })}
              style={{ gridTemplateColumns: columns }}
              tabIndex={-1}
              onClick={(event) => toggleEntry(entry, index, event)}
              onDoubleClick={() => openEntry(entry)}
              onContextMenu={(event) => openMenu(entry, event)}
            >
              <span className={cx(classes.rowName)}>
                <span className={cx(classes.entryIcon)}>{getEntryIcon(entry)}</span>
                {renderEntryName(entry)}
              </span>
              <span className={cx(classes.entryMeta)}>
                {entry.type === 'folder' ? labels.folder : labels.file}
              </span>
              <span className={cx(classes.entryMeta)}>{formatSize(entry.size)}</span>
              <span className={cx(classes.entryMeta)}>{formatDate(entry.modifiedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const segments = pathSegments(path);
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;
  const showPreviewPanel = showPreview && !!previewEntry;

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
        if (provider.upload && !readOnly && event.dataTransfer.files.length > 0) {
          event.preventDefault();
          setDragging(false);
          uploadFiles(event.dataTransfer.files).catch(() => undefined);
        }
      }}
    >
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
                onClick={() => startRename(selectedEntries[0])}
              >
                {labels.rename}
              </button>
            )}
            {provider.remove && selectedEntries.length > 0 && (
              <button
                type="button"
                className={cx(classes.actionButton, classes.danger)}
                onClick={() => setDeleting(selectedEntries)}
              >
                {labels.delete}
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
          </div>
        )}
      </div>
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
          {upload && (
            <div className={cx(classes.uploadBar)} role="status">
              <span>{labels.uploadProgress(upload.file.name, Math.round(upload.percent))}</span>
              <div className={cx(classes.uploadTrack)}>
                <div
                  className={cx(classes.uploadFill)}
                  style={{ width: `${Math.max(0, Math.min(100, upload.percent))}%` }}
                />
              </div>
            </div>
          )}
          {uploadError && (
            <div className={cx(classes.uploadBar)} role="alert">
              {uploadError}
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
                className={
                  previewEntry.mimeType?.startsWith('image/')
                    ? cx(classes.previewImage)
                    : cx(classes.previewText)
                }
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
                  onClick={() => startRename(menu.entry as FileEntry)}
                >
                  {labels.rename}
                </button>
              )}
              {provider.download && menu.entry.type === 'file' && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  onClick={() => {
                    downloadEntry(menu.entry as FileEntry).catch(() => undefined);
                  }}
                >
                  {labels.download}
                </button>
              )}
              {provider.remove && !readOnly && (
                <>
                  <div className={cx(classes.menuSeparator)} role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    className={cx(classes.menuItem, classes.danger)}
                    onClick={() => {
                      setDeleting([menu.entry as FileEntry]);
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
    </div>
  );
});

FileExplorer.displayName = 'FileExplorer';
