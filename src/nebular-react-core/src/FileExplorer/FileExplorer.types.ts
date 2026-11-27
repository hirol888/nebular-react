import React from 'react';
import { DefaultProps } from '@nebular-react/styles';
import type { FileExplorerStylesNames } from './FileExplorer.styles';

export interface FileEntryPermissions {
  /** Allows opening/previewing the entry and copying it. */
  read?: boolean;
  /** Allows renaming, cutting/moving and dropping into a folder. */
  write?: boolean;
  /** Allows deleting the entry. */
  delete?: boolean;
  /** Allows downloading the entry (also requires `read`). */
  download?: boolean;
}

export interface FileEntry {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedAt?: Date | string | number;
  mimeType?: string;
  url?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, unknown>;
  permissions?: FileEntryPermissions;
}

export type FileExplorerView = 'list' | 'grid' | 'details';
export type FileExplorerSortBy = 'name' | 'type' | 'size' | 'modified';
export type FileExplorerSortDirection = 'asc' | 'desc';
export type FileExplorerSelectionMode = 'single' | 'multiple';

export interface FileListOptions {
  signal?: AbortSignal;
  /** Zero-based page index requested by the explorer. */
  page?: number;
  /** Number of entries per page. Providers may fall back to their own default. */
  pageSize?: number;
}

export interface FileSearchOptions extends FileListOptions {
  limit?: number;
}

/**
 * Paginated list payload. Providers may keep returning a plain `FileEntry[]`;
 * the explorer normalizes both shapes.
 */
export interface FileListResult {
  entries: FileEntry[];
  total?: number;
  hasMore?: boolean;
}

export type FileListResponse = FileEntry[] | FileListResult;

export interface FileUploadProgress {
  file: File;
  percent: number;
}

export type FileUploadStatus = 'uploading' | 'success' | 'error' | 'canceled';

export interface FileSystemProvider {
  list(path: string, options?: FileListOptions): Promise<FileListResponse>;
  search?(query: string, options?: FileSearchOptions): Promise<FileListResponse>;
  createFolder?(parentPath: string, name: string): Promise<FileEntry>;
  rename?(path: string, name: string): Promise<FileEntry>;
  /** Permanently deletes the given paths. The explorer only uses it when `trash` is unavailable or disabled. */
  remove?(paths: string[]): Promise<void>;
  /** Moves the given paths to a recoverable trash. When present, the explorer uses it instead of `remove`. */
  trash?(paths: string[]): Promise<void>;
  /** Restores entries previously moved to the trash, returning them to their original paths. */
  restore?(paths: string[]): Promise<void>;
  /** Lists the entries currently held in the trash. Enables the trash panel when provided. */
  listTrash?(): Promise<FileEntry[]>;
  /** Permanently discards every entry in the trash. Must be idempotent. */
  emptyTrash?(): Promise<void>;
  move?(paths: string[], destinationPath: string): Promise<void>;
  copy?(paths: string[], destinationPath: string): Promise<void>;
  upload?(
    parentPath: string,
    files: File[],
    options?: { signal?: AbortSignal; onProgress?(progress: FileUploadProgress): void }
  ): Promise<FileEntry[]>;
  download?(path: string): Promise<Blob>;
}

export interface FileExplorerLabels {
  root: string;
  back: string;
  forward: string;
  up: string;
  refresh: string;
  breadcrumb: string;
  search: string;
  noResults: string;
  empty: string;
  loading: string;
  error: string;
  retry: string;
  viewList: string;
  viewGrid: string;
  viewDetails: string;
  newFolder: string;
  rename: string;
  delete: string;
  download: string;
  upload: string;
  copy: string;
  cut: string;
  paste: string;
  open: string;
  selectAll: string;
  clearSelection: string;
  selectionCount(count: number): string;
  deleteTitle: string;
  deleteMessage(count: number): string;
  confirmDelete: string;
  trash: string;
  trashTitle: string;
  trashHint: string;
  trashEmpty: string;
  restore: string;
  emptyTrash: string;
  movedToTrash(count: number): string;
  restored(count: number): string;
  undo: string;
  cancel: string;
  save: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  folder: string;
  file: string;
  newFolderPlaceholder: string;
  renameLabel(name: string): string;
  menuLabel(name: string): string;
  preview(name: string): string;
  closePreview: string;
  noPreview: string;
  uploadProgress(name: string, percent: number): string;
  uploadError(name: string): string;
  uploadQueue: string;
  uploadCancel(name: string): string;
  uploadRetry(name: string): string;
  uploadDismiss(name: string): string;
  uploadSuccess(name: string): string;
  uploadCanceled(name: string): string;
  loadMore: string;
  loadingMore: string;
  permissionDenied(action: string): string;
  dropToUpload: string;
  tabs: string;
  newTab: string;
  closeTab(name: string): string;
}

export type FileOperation =
  | 'read'
  | 'list'
  | 'search'
  | 'open'
  | 'create-folder'
  | 'rename'
  | 'delete'
  | 'trash'
  | 'restore'
  | 'empty-trash'
  | 'move'
  | 'copy'
  | 'upload'
  | 'download';

export interface FileAuthorizationRequest {
  operation: FileOperation;
  path?: string;
  paths?: string[];
  entry?: FileEntry;
  destination?: string;
}

export interface FileExplorerProps
  extends
    DefaultProps<FileExplorerStylesNames>,
    Omit<
      React.ComponentPropsWithoutRef<'div'>,
      'onSelect' | 'onChange' | 'onCopy' | 'onCut' | 'onPaste'
    > {
  provider: FileSystemProvider;
  path?: string;
  defaultPath?: string;
  onPathChange?(path: string): void;
  view?: FileExplorerView;
  defaultView?: FileExplorerView;
  onViewChange?(view: FileExplorerView): void;
  searchable?: boolean;
  tabs?: boolean;
  selectionMode?: FileExplorerSelectionMode;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?(keys: string[], entries: FileEntry[]): void;
  onOpen?(entry: FileEntry): void;
  onOpenFolder?(entry: FileEntry): void;
  onRename?(entry: FileEntry, name: string): void;
  onDelete?(entries: FileEntry[]): void;
  onTrash?(entries: FileEntry[]): void;
  onRestore?(entries: FileEntry[]): void;
  onMove?(entries: FileEntry[], destinationPath: string): void;
  onCopy?(entries: FileEntry[], destinationPath: string): void;
  onCreateFolder?(parentPath: string, name: string): void;
  onUpload?(entries: FileEntry[]): void;
  onDownload?(entry: FileEntry): void;
  readOnly?: boolean;
  /** Enables the trash flow when the provider implements `trash`. Defaults to `true`. */
  trashEnabled?: boolean;
  /** Auto-dismiss delay (ms) for the undo bar. Set to `0` or less to keep it visible. Defaults to `8000`. */
  undoTimeoutMs?: number;
  accept?: string;
  multiple?: boolean;
  /** Page size forwarded to `provider.list`/`provider.search`. Enables "Load more" when supported. */
  pageSize?: number;
  /** Entries above this count are windowed in list/details views. Set 0 to disable. */
  virtualizeThreshold?: number;
  /** Row height used by virtualization. Defaults to 34. */
  virtualRowHeight?: number;
  /** Async authorization hook called before every mutating/read action. */
  authorize?(request: FileAuthorizationRequest): boolean | Promise<boolean>;
  labels?: Partial<FileExplorerLabels>;
  ariaLabel?: string;
  sidebar?: React.ReactNode;
  sidebarWidth?: number | string;
  emptyState?: React.ReactNode;
  renderIcon?(entry: FileEntry): React.ReactNode;
  renderPreview?(entry: FileEntry): React.ReactNode;
}
