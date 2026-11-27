import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import type { NebularMessageParams } from '@nebular-react/styles';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';
import { Checkbox } from '../Checkbox';
import { ConfirmDialog } from '../ConfirmDialog';
import { Dropzone } from '../Dropzone';
import { ProgressBar } from '../ProgressBar';

export type FileManagerView = 'list' | 'grid';
export type FileManagerSelectionMode = 'single' | 'multiple';
export type FileManagerUploadStatus = 'uploading' | 'success' | 'error';
export type FileManagerSortBy = 'name' | 'size' | 'modified';
export type FileManagerSortDirection = 'asc' | 'desc';

export interface FileManagerSort {
  by: FileManagerSortBy;
  direction: FileManagerSortDirection;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedAt?: Date | string | number;
  children?: FileNode[];
  /**
   * Optional source used by the built-in preview. Images render as a thumbnail and
   * text-like files are fetched (with `AbortController`) to show the first few KB.
   */
  url?: string;
  /**
   * Optional local file used by the built-in text preview. When available, `File.text()`
   * is preferred over fetching `url`.
   */
  file?: File;
}

export type FileManagerItem = FileNode;

export interface FileManagerUploadEntry {
  id: string;
  fileName: string;
  percent: number;
  status: FileManagerUploadStatus;
  error?: string;
}

/**
 * Visible text and accessible names rendered by `FileManager`.
 * Defaults come from the Nebular locale catalog; every entry can be overridden.
 */
export interface FileManagerLabels {
  // Header and breadcrumb
  back: string;
  allFiles: string;
  breadcrumb: string;

  // Context menu and header actions
  open: string;
  rename: string;
  download: string;
  delete: string;
  newFolder: string;
  menuLabel(name: string): string;

  // Search and sorting
  search: string;
  noResults: string;
  sortFiles: string;
  sortBy: string;
  defaultOrder: string;
  sortName: string;
  sortSize: string;
  sortModified: string;
  ascending: string;
  descending: string;
  sortDirection(direction: FileManagerSortDirection): string;

  // Selection toolbar
  selectionActions: string;
  selectAll: string;
  selectItem(name: string): string;
  selectionCount(count: number): string;
  downloadSelected: string;
  deleteSelected: string;
  clearSelection: string;

  // Rename bar
  renameLabel(name: string): string;
  save: string;
  cancel: string;

  // Upload panel
  upload: string;
  uploads: string;
  uploading(name: string): string;
  uploaded: string;
  uploadFailed: string;
  cancelUpload(name: string): string;
  dismissUpload(name: string): string;
  dismiss: string;
  uploadingCount(count: number): string;
  uploadedCount(count: number): string;
  failedCount(count: number): string;

  // Delete confirmation
  deleteTitle(name: string): string;
  deleteItemTitle: string;
  deleteMessage: string;
  deleteConfirm: string;
  deleteCancel: string;

  // Empty states
  empty: string;

  // Drag and drop announcements
  dragStatus: string;
  itemCount(count: number): string;
  moving(count: number): string;
  moveTo(count: number, target: string): string;
  movedTo(count: number, target: string): string;
  cannotMoveTo(target: string): string;
  cut(count: number): string;
  nothingToPaste: string;
  selectFolderToPaste: string;

  // Preview panel
  preview(name: string): string;
  closePreview(name: string): string;
  close: string;
  previewStatus: string;
  loadingPreview: string;
  previewUnavailable: string;
  previewRequestFailed(status: number): string;
  noPreview: string;
  folderSummary(count: number): string;
}

interface FileManagerContextMenuState {
  nodeId: string;
  x: number;
  y: number;
}

export interface FileManagerProps
  extends
    DefaultProps<FileManagerStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect' | 'onContextMenu'> {
  items: FileNode[];
  value?: string | null;
  defaultSelectedId?: string | null;
  onSelect?(id: string, node: FileNode): void;
  onOpen?(node: FileNode): void;
  onCreateFolder?(): void;
  onDelete?(node: FileNode): void;
  onRename?(node: FileNode, name: string): void;
  view?: FileManagerView;
  searchable?: boolean;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  renderIcon?(node: FileNode): React.ReactNode;
  ariaLabel?: string;
  emptyState?: React.ReactNode;
  /** Overrides the visible text and accessible names rendered by the component. */
  labels?: Partial<FileManagerLabels>;

  selectable?: boolean;
  selectionMode?: FileManagerSelectionMode;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectionChange?(keys: string[]): void;
  onBatchDelete?(nodes: FileNode[]): void;
  onBatchDownload?(nodes: FileNode[]): void;

  uploadFile?(file: File, onProgress: (percent: number) => void): Promise<FileManagerItem | void>;
  onUploadComplete?(items: FileManagerItem[]): void;
  onUploadError?(file: File, error: unknown): void;
  accept?: string;
  multiple?: boolean;

  onContextMenu?(item: FileNode, event: React.MouseEvent<HTMLLIElement>): void;
  renderContextMenu?(item: FileNode, close: () => void): React.ReactNode;
  onDownload?(node: FileNode): void;

  /**
   * Enables drag-and-drop moves between folders (pointer). Keyboard users can mark
   * items with Ctrl/Cmd+X and paste them into the selected folder with Ctrl/Cmd+V.
   */
  draggable?: boolean;
  /** Called with the dragged nodes and the destination folder id. Props are never mutated. */
  onMove?(nodes: FileNode[], targetFolderId: string): void;

  sortBy?: FileManagerSortBy;
  sortDirection?: FileManagerSortDirection;
  defaultSortBy?: FileManagerSortBy;
  defaultSortDirection?: FileManagerSortDirection;
  onSortChange?(sort: FileManagerSort): void;

  /** Shows an inline preview panel for the selected node. */
  preview?: boolean;
  /** Replaces the built-in preview renderer. */
  renderPreview?(node: FileNode): React.ReactNode;
  /** Called when the preview panel opens for a node. */
  onPreview?(node: FileNode): void;
}

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--file-manager-gap, 0.5rem)',
    width: '100%',
    fontFamily: 'var(--file-manager-font-family, inherit)',
    color: 'var(--file-manager-color, var(--text-basic-color, #222b45))'
  },

  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--file-manager-header-gap, 0.5rem)',
    padding: 'var(--file-manager-header-padding, 0.5rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-border-radius, 0.5rem)',
    backgroundColor:
      'var(--file-manager-header-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  breadcrumbBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-breadcrumb-gap, 0.125rem)',
    minWidth: 0
  },

  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-breadcrumb-gap, 0.125rem)',
    minWidth: 0,
    fontSize: 'var(--file-manager-breadcrumb-font-size, 0.8125rem)'
  },

  crumb: {
    padding: 'var(--file-manager-crumb-padding, 0.1rem 0.35rem)',
    border: 0,
    borderRadius: 'var(--file-manager-crumb-border-radius, 0.25rem)',
    background: 'transparent',
    color: 'var(--file-manager-crumb-color, var(--color-primary-600, #274bdb))',
    font: 'inherit',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--file-manager-crumb-hover-background-color, rgba(51, 102, 255, 0.08))'
    },

    '&[aria-current="page"]': {
      color: 'var(--file-manager-crumb-current-color, var(--text-basic-color, #222b45))',
      fontWeight: 600
    },

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  separator: {
    color: 'var(--file-manager-separator-color, var(--text-hint-color, #8f9bb3))',
    userSelect: 'none'
  },

  controls: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-controls-gap, 0.35rem)'
  },

  sortBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--file-manager-controls-gap, 0.35rem)'
  },

  sortLabel: {
    color: 'var(--file-manager-meta-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)'
  },

  sortSelect: {
    padding: 'var(--file-manager-control-padding, 0.25rem 0.55rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-control-border-radius, 0.375rem)',
    backgroundColor:
      'var(--file-manager-control-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--file-manager-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)',

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  content: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--file-manager-content-gap, 0.5rem)',
    minWidth: 0,

    '@media (max-width: 48em)': {
      flexDirection: 'column'
    }
  },

  contentWithPreview: {
    alignItems: 'flex-start'
  },

  search: {
    minWidth: 'var(--file-manager-search-min-width, 10rem)',
    padding: 'var(--file-manager-search-padding, 0.25rem 0.5rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-control-border-radius, 0.375rem)',
    backgroundColor:
      'var(--file-manager-search-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--file-manager-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)',

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  actionButton: {
    padding: 'var(--file-manager-control-padding, 0.25rem 0.55rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-control-border-radius, 0.375rem)',
    backgroundColor:
      'var(--file-manager-control-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--file-manager-control-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)',
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--file-manager-control-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    },

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  renameBar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-controls-gap, 0.35rem)',
    padding: 'var(--file-manager-rename-padding, 0.5rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-border-radius, 0.5rem)',
    backgroundColor:
      'var(--file-manager-rename-background-color, var(--background-basic-color-1, #ffffff))'
  },

  renameLabel: {
    color: 'var(--file-manager-rename-label-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)'
  },

  renameInput: {
    flex: '1 1 10rem',
    minWidth: 'var(--file-manager-search-min-width, 10rem)',
    padding: 'var(--file-manager-search-padding, 0.25rem 0.5rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-control-border-radius, 0.375rem)',
    backgroundColor:
      'var(--file-manager-search-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--file-manager-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)',

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  selectionToolbar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-controls-gap, 0.35rem)',
    padding: 'var(--file-manager-selection-toolbar-padding, 0.4rem 0.5rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-border-radius, 0.5rem)',
    backgroundColor:
      'var(--file-manager-selection-toolbar-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  selectionCount: {
    color: 'var(--file-manager-meta-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)'
  },

  uploadPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--file-manager-upload-gap, 0.4rem)'
  },

  uploadList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--file-manager-upload-item-gap, 0.35rem)',
    margin: 0,
    padding: 'var(--file-manager-upload-list-padding, 0.5rem)',
    listStyle: 'none',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-border-radius, 0.5rem)',
    backgroundColor:
      'var(--file-manager-upload-background-color, var(--background-basic-color-1, #ffffff))'
  },

  uploadItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },

  uploadHeader: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-controls-gap, 0.35rem)'
  },

  uploadName: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)',
    fontWeight: 500,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  uploadStatus: {
    color: 'var(--file-manager-meta-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)'
  },

  uploadError: {
    color: 'var(--file-manager-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)'
  },

  uploadStatusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--file-manager-controls-gap, 0.35rem)',
    color: 'var(--file-manager-meta-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)'
  },

  linkButton: {
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'var(--file-manager-crumb-color, var(--color-primary-600, #274bdb))',
    font: 'inherit',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)',
    textDecoration: 'underline',
    cursor: 'pointer',

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '1px'
    }
  },

  menu: {
    position: 'fixed',
    zIndex: 'var(--file-manager-menu-z-index, 1000)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--file-manager-menu-item-gap, 0.1rem)',
    minWidth: 'var(--file-manager-menu-min-width, 11rem)',
    padding: 'var(--file-manager-menu-padding, 0.25rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-border-radius, 0.5rem)',
    backgroundColor:
      'var(--file-manager-menu-background-color, var(--background-basic-color-1, #ffffff))',
    boxShadow: 'var(--file-manager-menu-shadow, 0 8px 24px rgba(0, 0, 0, 0.2))'
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: 'var(--file-manager-menu-item-padding, 0.35rem 0.5rem)',
    border: 0,
    borderRadius: 'var(--file-manager-control-border-radius, 0.375rem)',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontSize: 'var(--file-manager-control-font-size, 0.8125rem)',
    textAlign: 'left',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor:
        'var(--file-manager-menu-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  list: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--file-manager-item-gap, 0.15rem)',
    minWidth: 0,
    margin: 0,
    padding: 'var(--file-manager-list-padding, 0.25rem)',
    listStyle: 'none',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-border-radius, 0.5rem)',
    backgroundColor:
      'var(--file-manager-background-color, var(--background-basic-color-1, #ffffff))'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))',
    gap: 'var(--file-manager-grid-gap, 0.5rem)',

    '@media (max-width: 40em)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))'
    }
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--file-manager-item-content-gap, 0.5rem)',
    minWidth: 0,
    padding: 'var(--file-manager-item-padding, 0.4rem 0.5rem)',
    borderRadius: 'var(--file-manager-item-border-radius, 0.375rem)',
    cursor: 'pointer',
    outline: 'none',

    '&:hover': {
      backgroundColor:
        'var(--file-manager-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--file-manager-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  itemGrid: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    minHeight: 'var(--file-manager-grid-item-min-height, 5.5rem)'
  },

  itemCheckbox: {
    display: 'inline-flex',
    alignItems: 'center',
    flex: '0 0 auto'
  },

  checkbox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    width: 'var(--file-manager-checkbox-size, 1rem)',
    height: 'var(--file-manager-checkbox-size, 1rem)',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-checkbox-border-radius, 0.2rem)',
    backgroundColor:
      'var(--file-manager-checkbox-background-color, var(--background-basic-color-1, #ffffff))',
    color: 'transparent',
    cursor: 'pointer',

    '&[aria-checked="true"]': {
      borderColor:
        'var(--file-manager-checkbox-checked-border-color, var(--color-primary-500, #3366ff))',
      backgroundColor:
        'var(--file-manager-checkbox-checked-background-color, var(--color-primary-500, #3366ff))',
      color: 'var(--file-manager-checkbox-check-color, #ffffff)'
    }
  },

  selected: {
    backgroundColor: 'var(--file-manager-selected-background-color, rgba(51, 102, 255, 0.12))',
    color: 'var(--file-manager-selected-color, var(--color-primary-600, #274bdb))'
  },

  itemDragging: {
    opacity: 0.5
  },

  itemCut: {
    opacity: 0.6,
    outline: '1px dashed var(--file-manager-cut-outline-color, var(--color-primary-500, #3366ff))',
    outlineOffset: '-2px'
  },

  dropTarget: {
    outline: '2px dashed var(--file-manager-drop-target-color, var(--color-primary-500, #3366ff))',
    outlineOffset: '-2px',
    backgroundColor: 'var(--file-manager-drop-target-background-color, rgba(51, 102, 255, 0.12))'
  },

  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    fontSize: 'var(--file-manager-icon-size, 1.25rem)',
    color: 'var(--file-manager-folder-icon-color, var(--color-primary-500, #3366ff))'
  },

  fileIcon: {
    color: 'var(--file-manager-file-icon-color, var(--text-hint-color, #8f9bb3))'
  },

  details: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    gap: '0.05rem'
  },

  name: {
    overflow: 'hidden',
    fontSize: 'var(--file-manager-name-font-size, 0.8125rem)',
    fontWeight: 500,
    lineHeight: 1.3,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-meta-gap, 0.5rem)',
    color: 'var(--file-manager-meta-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)',
    lineHeight: 1.3
  },

  preview: {
    display: 'flex',
    flex: '0 0 var(--file-manager-preview-width, 16rem)',
    flexDirection: 'column',
    gap: 'var(--file-manager-preview-gap, 0.4rem)',
    minWidth: 0,
    maxHeight: 'var(--file-manager-preview-max-height, 32rem)',
    padding: 'var(--file-manager-preview-padding, 0.5rem)',
    overflow: 'auto',
    border: '1px solid var(--file-manager-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--file-manager-border-radius, 0.5rem)',
    backgroundColor:
      'var(--file-manager-preview-background-color, var(--background-basic-color-1, #ffffff))'
  },

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 'var(--file-manager-controls-gap, 0.35rem)'
  },

  previewTitle: {
    overflow: 'hidden',
    minWidth: 0,
    fontSize: 'var(--file-manager-name-font-size, 0.8125rem)',
    fontWeight: 600,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  previewBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--file-manager-controls-gap, 0.35rem)',
    minWidth: 0
  },

  previewImage: {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 'var(--file-manager-item-border-radius, 0.375rem)'
  },

  previewText: {
    maxHeight: 'var(--file-manager-preview-text-max-height, 16rem)',
    margin: 0,
    padding: 'var(--file-manager-preview-text-padding, 0.4rem)',
    overflow: 'auto',
    borderRadius: 'var(--file-manager-item-border-radius, 0.375rem)',
    backgroundColor:
      'var(--file-manager-preview-text-background-color, var(--background-basic-color-2, #f7f9fc))',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },

  previewMeta: {
    color: 'var(--file-manager-meta-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)'
  },

  previewEmpty: {
    margin: 0,
    color: 'var(--file-manager-meta-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)'
  },

  previewError: {
    color: 'var(--file-manager-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--file-manager-meta-font-size, 0.6875rem)'
  },

  empty: {
    padding: 'var(--file-manager-empty-padding, 1.5rem)',
    color: 'var(--file-manager-empty-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--file-manager-empty-font-size, 0.8125rem)',
    textAlign: 'center'
  },

  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0
  }
}));

export type FileManagerStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<FileManagerProps> = {
  defaultSelectedId: null,
  view: 'list',
  searchable: true,
  selectable: false,
  selectionMode: 'multiple',
  multiple: true,
  ariaLabel: 'File manager',
  draggable: false,
  preview: false,
  defaultSortDirection: 'asc'
};

type FileManagerTranslate = (
  key: string,
  fallback: string,
  params?: NebularMessageParams
) => string;

const createFileManagerLabels = (t: FileManagerTranslate): FileManagerLabels => {
  const itemCount = (count: number): string =>
    t('fileManager.itemCount', count === 1 ? '{count} item' : '{count} items', { count });

  return {
    back: t('fileManager.back', 'Back'),
    allFiles: t('fileManager.allFiles', 'All files'),
    breadcrumb: t('fileManager.breadcrumb', 'Breadcrumb'),

    open: t('fileManager.open', 'Open'),
    rename: t('fileManager.rename', 'Rename'),
    download: t('fileManager.download', 'Download'),
    delete: t('fileManager.delete', 'Delete'),
    newFolder: t('fileManager.newFolder', 'New folder'),
    menuLabel: (name) => t('fileManager.menuLabel', 'Actions for {name}', { name }),

    search: t('fileManager.search', 'Search files'),
    noResults: t('fileManager.noResults', 'No matching files'),
    sortFiles: t('fileManager.sortFiles', 'Sort files'),
    sortBy: t('fileManager.sortBy', 'Sort by'),
    defaultOrder: t('fileManager.defaultOrder', 'Default order'),
    sortName: t('fileManager.sortName', 'Name'),
    sortSize: t('fileManager.sortSize', 'Size'),
    sortModified: t('fileManager.sortModified', 'Last modified'),
    ascending: t('fileManager.ascending', 'Ascending'),
    descending: t('fileManager.descending', 'Descending'),
    sortDirection: (direction) =>
      t('fileManager.sortDirection', 'Sort direction: {direction}', {
        direction: direction === 'asc' ? 'ascending' : 'descending'
      }),

    selectionActions: t('fileManager.selectionActions', 'Selection actions'),
    selectAll: t('fileManager.selectAll', 'Select all files'),
    selectItem: (name) => t('fileManager.selectItem', 'Select {name}', { name }),
    selectionCount: (count) => t('fileManager.selectionCount', '{count} selected', { count }),
    downloadSelected: t('fileManager.downloadSelected', 'Download selected'),
    deleteSelected: t('fileManager.deleteSelected', 'Delete selected'),
    clearSelection: t('fileManager.clearSelection', 'Clear selection'),

    renameLabel: (name) => t('fileManager.renameLabel', 'New name for {name}', { name }),
    save: t('common.save', 'Save'),
    cancel: t('common.cancel', 'Cancel'),

    upload: t('fileManager.upload', 'Upload files'),
    uploads: t('fileManager.uploads', 'Uploads'),
    uploading: (name) => t('fileManager.uploading', 'Uploading {name}', { name }),
    uploaded: t('fileManager.uploaded', 'Uploaded'),
    uploadFailed: t('fileManager.uploadFailed', 'Upload failed'),
    cancelUpload: (name) => t('fileManager.cancelUpload', 'Cancel upload of {name}', { name }),
    dismissUpload: (name) => t('fileManager.dismissUpload', 'Dismiss upload of {name}', { name }),
    dismiss: t('fileManager.dismiss', 'Dismiss'),
    uploadingCount: (count) => t('fileManager.uploadingCount', '{count} uploading', { count }),
    uploadedCount: (count) => t('fileManager.uploadedCount', '{count} uploaded', { count }),
    failedCount: (count) => t('fileManager.failedCount', '{count} failed', { count }),

    deleteTitle: (name) => t('fileManager.deleteTitle', 'Delete {name}?', { name }),
    deleteItemTitle: t('fileManager.deleteItemTitle', 'Delete item?'),
    deleteMessage: t('fileManager.deleteMessage', 'This action cannot be undone.'),
    deleteConfirm: t('fileManager.deleteConfirm', 'Delete'),
    deleteCancel: t('fileManager.deleteCancel', 'Cancel'),

    empty: t('fileManager.empty', 'This folder is empty'),

    dragStatus: t('fileManager.dragStatus', 'Drag and drop status'),
    itemCount,
    moving: (count) => t('fileManager.moving', `Moving ${itemCount(count)}`, { count }),
    moveTo: (count, target) =>
      t('fileManager.moveTo', `Move ${itemCount(count)} to ${target}`, { count, name: target }),
    movedTo: (count, target) =>
      t('fileManager.movedTo', `Moved ${itemCount(count)} to ${target}`, { count, name: target }),
    cannotMoveTo: (target) =>
      t('fileManager.cannotMoveTo', `Cannot move items into ${target}`, { name: target }),
    cut: (count) => t('fileManager.cut', `Cut ${itemCount(count)}`, { count }),
    nothingToPaste: t('fileManager.nothingToPaste', 'Nothing to paste'),
    selectFolderToPaste: t('fileManager.selectFolderToPaste', 'Select a folder to paste into'),

    preview: (name) => t('fileManager.preview', 'Preview of {name}', { name }),
    closePreview: (name) => t('fileManager.closePreview', 'Close preview of {name}', { name }),
    close: t('common.close', 'Close'),
    previewStatus: t('fileManager.previewStatus', 'Preview status'),
    loadingPreview: t('fileManager.loadingPreview', 'Loading preview…'),
    previewUnavailable: t('fileManager.previewUnavailable', 'Preview unavailable'),
    previewRequestFailed: (status) =>
      t('fileManager.previewRequestFailed', 'Preview request failed ({status})', {
        status
      }),
    noPreview: t('fileManager.noPreview', 'No preview available'),
    folderSummary: (count) =>
      t('fileManager.folderSummary', `Folder · ${itemCount(count)}`, { count })
  };
};

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const PREVIEW_MAX_BYTES = 4096;

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'];
const TEXT_EXTENSIONS = [
  'txt',
  'md',
  'markdown',
  'json',
  'csv',
  'log',
  'xml',
  'yml',
  'yaml',
  'html',
  'htm',
  'js',
  'jsx',
  'ts',
  'tsx',
  'css',
  'scss',
  'sh',
  'ini',
  'env'
];

type FileManagerPreviewKind = 'folder' | 'image' | 'text' | 'unsupported';

interface FileManagerPreviewText {
  nodeId: string;
  status: 'loading' | 'ready' | 'error';
  text?: string;
  error?: string;
}

const formatSize = (size?: number): string | null => {
  if (size === undefined || size === null || Number.isNaN(size)) {
    return null;
  }

  let value = Math.max(0, size);
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return `${Math.round(value)} ${SIZE_UNITS[unitIndex]}`;
  }

  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;

  return `${rounded} ${SIZE_UNITS[unitIndex]}`;
};

const formatModifiedAt = (
  value?: Date | string | number
): { label: string; dateTime: string } | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    label: date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    dateTime: date.toISOString()
  };
};

const getFolderChain = (
  nodes: FileNode[],
  path: string[]
): { chain: FileNode[]; current: FileNode[] } => {
  const chain: FileNode[] = [];
  let current = nodes;

  for (const id of path) {
    const folder = current.find((node) => node.id === id && node.type === 'folder');

    if (!folder) {
      break;
    }

    chain.push(folder);
    current = folder.children ?? [];
  }

  return { chain, current };
};

const getUploadStatusLabel = (entry: FileManagerUploadEntry, labels: FileManagerLabels): string => {
  if (entry.status === 'success') {
    return labels.uploaded;
  }

  if (entry.status === 'error') {
    return labels.uploadFailed;
  }

  return `${entry.percent}%`;
};

const getTimestamp = (value?: Date | string | number): number => {
  if (value === undefined || value === null) {
    return 0;
  }

  const date = value instanceof Date ? value : new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
};

const compareFileNames = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

const compareFileNodes = (a: FileNode, b: FileNode, sort: FileManagerSort): number => {
  // Folders always come first, regardless of direction.
  if (a.type !== b.type) {
    return a.type === 'folder' ? -1 : 1;
  }

  let result = 0;

  if (sort.by === 'name') {
    result = compareFileNames(a.name, b.name);
  } else if (sort.by === 'size') {
    result = (a.size ?? -1) - (b.size ?? -1);
  } else {
    result = getTimestamp(a.modifiedAt) - getTimestamp(b.modifiedAt);
  }

  if (result === 0 && sort.by !== 'name') {
    result = compareFileNames(a.name, b.name);
  }

  return sort.direction === 'asc' ? result : -result;
};

const getFileExtension = (name: string): string => {
  const index = name.lastIndexOf('.');

  return index === -1 || index === name.length - 1 ? '' : name.slice(index + 1).toLowerCase();
};

const getPreviewKind = (node: FileNode): FileManagerPreviewKind => {
  if (node.type === 'folder') {
    return 'folder';
  }

  const mime = node.file?.type ?? '';

  if (mime.startsWith('image/')) {
    return 'image';
  }

  if (mime.startsWith('text/')) {
    return 'text';
  }

  const extension = getFileExtension(node.name);

  if (IMAGE_EXTENSIONS.includes(extension)) {
    return 'image';
  }

  if (TEXT_EXTENSIONS.includes(extension)) {
    return 'text';
  }

  return 'unsupported';
};

const containsNodeId = (node: FileNode, id: string): boolean =>
  (node.children ?? []).some((child) => child.id === id || containsNodeId(child, id));

const truncatePreviewText = (text: string): string =>
  text.length > PREVIEW_MAX_BYTES ? `${text.slice(0, PREVIEW_MAX_BYTES)}…` : text;

const FolderIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.9a2 2 0 0 1 1.6.8L12.1 7h6.4A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
  </svg>
);

const FileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
    <path d="M13 3v6h6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="0.8em"
    height="0.8em"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M3 8.5 6.5 12 13 4.5" />
  </svg>
);

const createUploadNode = (result: FileManagerItem | void, file: File, suffix: string): FileNode => {
  if (result && result.id && result.name) {
    return { ...result, type: result.type ?? 'file' };
  }

  return {
    id: `upload-${suffix}`,
    name: file.name,
    type: 'file',
    size: file.size,
    modifiedAt: Date.now()
  };
};

const _FileManager = forwardRef<HTMLDivElement, FileManagerProps>((props, ref) => {
  const {
    items,
    value,
    defaultSelectedId,
    onSelect,
    onOpen,
    onCreateFolder,
    onDelete,
    onRename,
    view,
    searchable,
    breadcrumb,
    actions,
    renderIcon,
    ariaLabel,
    emptyState,
    labels,
    selectable,
    selectionMode,
    selectedKeys: selectedKeysProp,
    defaultSelectedKeys,
    onSelectionChange,
    onBatchDelete,
    onBatchDownload,
    uploadFile,
    onUploadComplete,
    onUploadError,
    accept,
    multiple,
    onContextMenu,
    renderContextMenu,
    onDownload,
    draggable,
    onMove,
    sortBy,
    sortDirection,
    defaultSortBy,
    defaultSortDirection,
    onSortChange,
    preview,
    renderPreview,
    onPreview,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { t } = useNebularLocale();
  const resolvedLabels: FileManagerLabels = { ...createFileManagerLabels(t), ...labels };
  const labelsRef = useRef(resolvedLabels);
  labelsRef.current = resolvedLabels;
  const { classes, cx } = useStyles(null, { name: 'file-manager', classNames, styles, unstyled });
  const renameInputId = useId();
  const sortSelectId = useId();
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const uploadCounter = useRef(0);
  const cancelledUploads = useRef<Set<string>>(new Set());
  const selectionAnchor = useRef<string | null>(null);
  const draggedNodesRef = useRef<FileNode[]>([]);
  const previewNodeRef = useRef<FileNode | null>(null);
  const previewCloseRef = useRef<HTMLButtonElement>(null);
  const previewWasVisible = useRef(false);
  const onPreviewRef = useRef(onPreview);

  const [path, setPath] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [uploads, setUploads] = useState<FileManagerUploadEntry[]>([]);
  const [uploadedByFolder, setUploadedByFolder] = useState<Record<string, FileNode[]>>({});
  const [contextMenu, setContextMenu] = useState<FileManagerContextMenuState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FileNode | null>(null);
  const [internalSort, setInternalSort] = useState<FileManagerSort | null>(
    defaultSortBy ? { by: defaultSortBy, direction: defaultSortDirection ?? 'asc' } : null
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dragAnnouncement, setDragAnnouncement] = useState('');
  const [cutIds, setCutIds] = useState<string[]>([]);
  const [liveMessage, setLiveMessage] = useState('');
  const [dismissedPreviewId, setDismissedPreviewId] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<FileManagerPreviewText | null>(null);

  let controlledSelection: string[] | undefined;
  if (selectedKeysProp !== undefined) {
    controlledSelection = selectedKeysProp;
  } else if (value !== undefined) {
    controlledSelection = value === null ? [] : [value];
  }

  const [selectedKeys, setSelectedKeys] = useUncontrolled<string[]>({
    value: controlledSelection,
    defaultValue: defaultSelectedKeys ?? (defaultSelectedId ? [defaultSelectedId] : []),
    finalValue: []
  });

  const { chain, current: folderItems } = getFolderChain(items, path);
  const folderKey = path.join('/');
  const uploadedItems = uploadedByFolder[folderKey] ?? [];
  const current = [
    ...folderItems,
    ...uploadedItems.filter((uploaded) => !folderItems.some((node) => node.id === uploaded.id))
  ];
  const activeSort: FileManagerSort | null =
    sortBy !== undefined ? { by: sortBy, direction: sortDirection ?? 'asc' } : internalSort;
  const activeSortDirection = activeSort ? activeSort.direction : 'asc';
  const sortedItems = activeSort
    ? [...current].sort((a, b) => compareFileNodes(a, b, activeSort))
    : current;
  const query = search.trim().toLowerCase();
  const visibleItems = query
    ? sortedItems.filter((node) => node.name.toLowerCase().includes(query))
    : sortedItems;
  const visibleIds = visibleItems.map((node) => node.id);
  const selectedNodes = selectedKeys
    .map((id) => current.find((node) => node.id === id))
    .filter((node): node is FileNode => Boolean(node));
  const activeSelectedId = selectedKeys[selectedKeys.length - 1] ?? null;
  const selectedNode = activeSelectedId
    ? (current.find((node) => node.id === activeSelectedId) ?? null)
    : null;
  const previewNode =
    preview && selectedNode && dismissedPreviewId !== selectedNode.id ? selectedNode : null;
  const previewNodeId = previewNode ? previewNode.id : null;
  const previewKind = previewNode ? getPreviewKind(previewNode) : null;
  const previewUrl = previewNode ? (previewNode.url ?? null) : null;
  const previewFile = previewNode ? (previewNode.file ?? null) : null;
  const hasCustomPreview = typeof renderPreview === 'function';
  const currentFolderId = chain.length > 0 ? chain[chain.length - 1].id : null;
  const renameNode = renamingId ? (current.find((node) => node.id === renamingId) ?? null) : null;
  const contextNode = contextMenu
    ? (current.find((node) => node.id === contextMenu.nodeId) ?? null)
    : null;
  const selectedVisibleCount = visibleIds.filter((id) => selectedKeys.includes(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  const uploadingCount = uploads.filter((entry) => entry.status === 'uploading').length;
  const successCount = uploads.filter((entry) => entry.status === 'success').length;
  const errorCount = uploads.filter((entry) => entry.status === 'error').length;
  const uploadStatusText = [
    uploadingCount > 0 ? resolvedLabels.uploadingCount(uploadingCount) : null,
    successCount > 0 ? resolvedLabels.uploadedCount(successCount) : null,
    errorCount > 0 ? resolvedLabels.failedCount(errorCount) : null
  ]
    .filter(Boolean)
    .join(', ');

  const applySelection = (keys: string[], activeNode?: FileNode | null) => {
    setSelectedKeys(keys);
    onSelectionChange?.(keys);

    if (activeNode) {
      onSelect?.(activeNode.id, activeNode);
    }
  };

  const selectNode = (
    node: FileNode,
    event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    if (selectionMode === 'single') {
      selectionAnchor.current = node.id;
      applySelection([node.id], node);
      return;
    }

    const additive = event?.ctrlKey || event?.metaKey;

    if (event?.shiftKey) {
      const anchorId = selectionAnchor.current;
      const anchorIndex = anchorId ? visibleItems.findIndex((item) => item.id === anchorId) : -1;
      const targetIndex = visibleItems.findIndex((item) => item.id === node.id);

      if (anchorIndex === -1 || targetIndex === -1) {
        selectionAnchor.current = node.id;
        applySelection([node.id], node);
        return;
      }

      const start = Math.min(anchorIndex, targetIndex);
      const end = Math.max(anchorIndex, targetIndex);
      const rangeIds = visibleItems
        .slice(start, end + 1)
        .map((item) => item.id)
        .filter((id) => id !== node.id);
      const nextKeys = additive
        ? [
            ...selectedKeys.filter((id) => !rangeIds.includes(id) && id !== node.id),
            ...rangeIds,
            node.id
          ]
        : [...rangeIds, node.id];

      applySelection(nextKeys, node);
      return;
    }

    if (!additive) {
      selectionAnchor.current = node.id;
      applySelection([node.id], node);
      return;
    }

    const nextKeys = selectedKeys.includes(node.id)
      ? selectedKeys.filter((id) => id !== node.id)
      : [...selectedKeys, node.id];

    selectionAnchor.current = node.id;
    applySelection(nextKeys, node);
  };

  const handleItemCheck = (node: FileNode, checked: boolean) => {
    selectionAnchor.current = node.id;

    if (selectionMode === 'single') {
      applySelection(checked ? [node.id] : [], checked ? node : null);
      return;
    }

    const nextKeys = checked
      ? [...selectedKeys.filter((id) => id !== node.id), node.id]
      : selectedKeys.filter((id) => id !== node.id);

    applySelection(nextKeys, checked ? node : null);
  };

  const handleSelectAll = (checked: boolean) => {
    const isVisible = (id: string) => visibleIds.includes(id);
    const nextKeys = checked
      ? [...selectedKeys.filter((id) => !isVisible(id)), ...visibleIds]
      : selectedKeys.filter((id) => !isVisible(id));

    applySelection(nextKeys);
  };

  const changeSort = (nextSort: FileManagerSort | null) => {
    if (sortBy === undefined) {
      setInternalSort(nextSort);
    }

    if (nextSort) {
      onSortChange?.(nextSort);
    }
  };

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value: nextBy } = event.currentTarget;

    if (!nextBy) {
      changeSort(null);
      return;
    }

    changeSort({ by: nextBy as FileManagerSortBy, direction: activeSortDirection });
  };

  const toggleSortDirection = () => {
    if (!activeSort) {
      changeSort({ by: 'name', direction: 'asc' });
      return;
    }

    changeSort({
      by: activeSort.by,
      direction: activeSort.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const resolveDraggedNodes = (node: FileNode): FileNode[] => {
    if (selectedKeys.includes(node.id) && selectedNodes.length > 0) {
      return selectedNodes;
    }

    return [node];
  };

  const isValidDropTarget = (target: FileNode): boolean => {
    if (target.type !== 'folder' || draggedNodesRef.current.length === 0) {
      return false;
    }

    if (target.id === currentFolderId) {
      return false;
    }

    return draggedNodesRef.current.every(
      (node) => node.id !== target.id && !containsNodeId(node, target.id)
    );
  };

  const resetDragState = () => {
    draggedNodesRef.current = [];
    setDraggingId(null);
    setDropTargetId(null);
    setDragAnnouncement('');
  };

  const handleItemDragStart = (event: React.DragEvent<HTMLLIElement>, node: FileNode) => {
    if (!draggable) {
      return;
    }

    const dragged = resolveDraggedNodes(node);

    draggedNodesRef.current = dragged;
    setDraggingId(node.id);
    setDropTargetId(null);
    setDragAnnouncement(resolvedLabels.moving(dragged.length));

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', node.id);
    }
  };

  const handleItemDragOver = (event: React.DragEvent<HTMLLIElement>, node: FileNode) => {
    if (!draggable || !draggingId) {
      return;
    }

    if (!isValidDropTarget(node)) {
      if (dropTargetId !== null) {
        setDropTargetId(null);
      }

      if (node.type === 'folder') {
        setDragAnnouncement(resolvedLabels.cannotMoveTo(node.name));
      }

      return;
    }

    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    if (dropTargetId !== node.id) {
      setDropTargetId(node.id);
    }

    setDragAnnouncement(resolvedLabels.moveTo(draggedNodesRef.current.length, node.name));
  };

  const handleItemDragLeave = (event: React.DragEvent<HTMLLIElement>, node: FileNode) => {
    if (!draggable) {
      return;
    }

    const related = event.relatedTarget;

    if (related instanceof Node && event.currentTarget.contains(related)) {
      return;
    }

    if (dropTargetId === node.id) {
      setDropTargetId(null);
    }
  };

  const handleItemDrop = (event: React.DragEvent<HTMLLIElement>, node: FileNode) => {
    if (!draggable) {
      return;
    }

    const dragged = draggedNodesRef.current;
    const valid = isValidDropTarget(node);

    if (!valid) {
      resetDragState();
      return;
    }

    event.preventDefault();
    resetDragState();
    onMove?.(dragged, node.id);
    setLiveMessage(resolvedLabels.movedTo(dragged.length, node.name));
  };

  const handleCut = (node: FileNode) => {
    const nodes = resolveDraggedNodes(node);

    setCutIds(nodes.map((item) => item.id));
    setLiveMessage(resolvedLabels.cut(nodes.length));
  };

  const handlePaste = () => {
    const sources = current.filter((node) => cutIds.includes(node.id));

    if (sources.length === 0) {
      setLiveMessage(resolvedLabels.nothingToPaste);
      return;
    }

    const target =
      selectedNode && selectedNode.type === 'folder'
        ? selectedNode
        : (selectedNodes.find((node) => node.type === 'folder') ?? null);

    if (!target) {
      setLiveMessage(resolvedLabels.selectFolderToPaste);
      return;
    }

    const movable = sources.filter(
      (node) => node.id !== target.id && !containsNodeId(node, target.id)
    );

    if (movable.length === 0) {
      setLiveMessage(resolvedLabels.cannotMoveTo(target.name));
      return;
    }

    onMove?.(movable, target.id);
    setCutIds([]);
    setLiveMessage(resolvedLabels.movedTo(movable.length, target.name));
  };

  const closePreview = () => {
    if (!previewNode) {
      return;
    }

    const nodeId = previewNode.id;

    setDismissedPreviewId(nodeId);
    itemRefs.current.get(nodeId)?.focus();
  };

  const handlePreviewKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closePreview();
    }
  };

  const removeLocalUploads = (ids: string[]) => {
    setUploadedByFolder((previous) => {
      const list = previous[folderKey] ?? [];
      const nextList = list.filter((node) => !ids.includes(node.id));

      if (nextList.length === list.length) {
        return previous;
      }

      return { ...previous, [folderKey]: nextList };
    });
  };

  const renameLocalUpload = (id: string, name: string) => {
    setUploadedByFolder((previous) => {
      const list = previous[folderKey] ?? [];

      if (!list.some((node) => node.id === id)) {
        return previous;
      }

      return {
        ...previous,
        [folderKey]: list.map((node) => (node.id === id ? { ...node, name } : node))
      };
    });
  };

  const navigateTo = (ids: string[]) => {
    setPath(ids);
    setSearch('');
    setRenamingId(null);
    setContextMenu(null);
    selectionAnchor.current = null;

    if (selectedKeys.length > 0) {
      applySelection([]);
    }
  };

  const openNode = (node: FileNode) => {
    onOpen?.(node);

    if (node.type === 'folder') {
      navigateTo([...chain.map((item) => item.id), node.id]);
    }
  };

  const startRename = (node?: FileNode | null) => {
    const target = node ?? selectedNode;

    if (!target) {
      return;
    }

    setRenamingId(target.id);
    setRenameValue(target.name);
  };

  const commitRename = () => {
    if (!renameNode) {
      return;
    }

    const name = renameValue.trim();

    if (name && name !== renameNode.name) {
      renameLocalUpload(renameNode.id, name);
      onRename?.(renameNode, name);
    }

    setRenamingId(null);
  };

  const handleRenameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitRename();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setRenamingId(null);
    }
  };

  const openContextMenuAt = (node: FileNode, x: number, y: number) => {
    setContextMenu({ nodeId: node.id, x, y });
  };

  const openContextMenuFromKeyboard = (node: FileNode) => {
    const element = itemRefs.current.get(node.id);
    const rect = element?.getBoundingClientRect();

    openContextMenuAt(node, rect ? rect.left + 16 : 0, rect ? rect.top + rect.height : 0);
  };

  const handleItemContextMenu = (event: React.MouseEvent<HTMLLIElement>, node: FileNode) => {
    event.preventDefault();
    onContextMenu?.(node, event);
    openContextMenuAt(node, event.clientX || 0, event.clientY || 0);
  };

  const closeContextMenu = (restoreFocus = false) => {
    const nodeId = contextMenu?.nodeId;
    setContextMenu(null);

    if (restoreFocus && nodeId) {
      itemRefs.current.get(nodeId)?.focus();
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const menuItems = Array.from(
      menuPanelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    ).filter(
      (element) =>
        !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true'
    );

    if (menuItems.length === 0) {
      return;
    }

    const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      menuItems[(currentIndex + 1 + menuItems.length) % menuItems.length].focus();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      menuItems[currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1].focus();
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      menuItems[0].focus();
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      menuItems[menuItems.length - 1].focus();
      return;
    }

    if (event.key === 'Tab') {
      setContextMenu(null);
    }
  };

  useEffect(() => {
    if (!contextMenu) {
      return undefined;
    }

    const panel = menuPanelRef.current;
    const firstMenuItem = panel?.querySelector<HTMLElement>('[role="menuitem"]');
    (firstMenuItem ?? panel)?.focus();

    const handlePointerDown = (event: MouseEvent) => {
      if (panel && event.target instanceof Node && panel.contains(event.target)) {
        return;
      }

      setContextMenu(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      const { nodeId } = contextMenu;
      setContextMenu(null);
      itemRefs.current.get(nodeId)?.focus();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Keep refs in sync so the effects below can depend only on stable primitives.
  useEffect(() => {
    previewNodeRef.current = previewNode;
    onPreviewRef.current = onPreview;
  });

  useEffect(() => {
    if (previewNodeId && !previewWasVisible.current) {
      previewCloseRef.current?.focus();
    }

    previewWasVisible.current = Boolean(previewNodeId);
  }, [previewNodeId]);

  useEffect(() => {
    if (!previewNodeId) {
      return;
    }

    const node = previewNodeRef.current;

    if (node) {
      onPreviewRef.current?.(node);
    }
  }, [previewNodeId]);

  useEffect(() => {
    if (!preview) {
      setDismissedPreviewId(null);
    }
  }, [preview]);

  useEffect(() => {
    if (!previewNodeId || hasCustomPreview || previewKind !== 'text') {
      setPreviewText(null);
      return undefined;
    }

    const file = previewFile;
    const url = previewUrl;

    if (!file && !url) {
      setPreviewText(null);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    setPreviewText({ nodeId: previewNodeId, status: 'loading' });

    const loadPreviewText = async () => {
      try {
        let text = '';

        if (file && typeof file.text === 'function') {
          const sliced =
            file.size > PREVIEW_MAX_BYTES && typeof file.slice === 'function'
              ? file.slice(0, PREVIEW_MAX_BYTES)
              : file;

          text = typeof sliced.text === 'function' ? await sliced.text() : await file.text();
        } else if (url) {
          if (typeof fetch !== 'function') {
            throw new Error(labelsRef.current.previewUnavailable);
          }

          const response = await fetch(url, { signal: controller.signal });

          if (!response.ok) {
            throw new Error(labelsRef.current.previewRequestFailed(response.status));
          }

          text = await response.text();
        }

        if (!active || controller.signal.aborted) {
          return;
        }

        setPreviewText({
          nodeId: previewNodeId,
          status: 'ready',
          text: truncatePreviewText(text)
        });
      } catch (error) {
        if (!active || controller.signal.aborted) {
          return;
        }

        setPreviewText({
          nodeId: previewNodeId,
          status: 'error',
          error: error instanceof Error ? error.message : labelsRef.current.previewUnavailable
        });
      }
    };

    loadPreviewText();

    return () => {
      active = false;
      controller.abort();
    };
  }, [previewNodeId, previewKind, previewFile, previewUrl, hasCustomPreview]);

  const handleItemKeyDown = (event: React.KeyboardEvent<HTMLLIElement>, node: FileNode) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const key = event.key.toLowerCase();

      if (key === 'x' && draggable && typeof onMove === 'function') {
        event.preventDefault();
        handleCut(node);
        return;
      }

      if (key === 'v' && draggable && typeof onMove === 'function') {
        event.preventDefault();
        handlePaste();
        return;
      }
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      openNode(node);
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      selectNode(node, event);
      return;
    }

    if ((event.key === 'F10' && event.shiftKey) || event.key === 'ContextMenu') {
      event.preventDefault();
      openContextMenuFromKeyboard(node);
      return;
    }

    if (event.key === 'F2' && typeof onRename === 'function') {
      event.preventDefault();
      startRename(node);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const options = Array.from(
        event.currentTarget
          .closest('[role="listbox"]')
          ?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
      );
      const index = options.indexOf(event.currentTarget);
      const next = options[index + (event.key === 'ArrowDown' ? 1 : -1)];

      if (next) {
        event.preventDefault();
        next.focus();
      }
    }
  };

  const startUpload = (
    file: File,
    targetFolderKey: string,
    upload: NonNullable<FileManagerProps['uploadFile']>
  ): Promise<FileNode | null> => {
    uploadCounter.current += 1;
    const uploadId = `upload-${targetFolderKey || 'root'}-${uploadCounter.current}`;
    const suffix = `${targetFolderKey || 'root'}-${uploadCounter.current}`;

    setUploads((previous) => [
      ...previous,
      { id: uploadId, fileName: file.name, percent: 0, status: 'uploading' }
    ]);

    const reportProgress = (percent: number) => {
      if (cancelledUploads.current.has(uploadId)) {
        return;
      }

      const clamped = Math.max(
        0,
        Math.min(100, Math.round(Number.isFinite(percent) ? percent : 0))
      );

      setUploads((previous) =>
        previous.map((entry) =>
          entry.id === uploadId && entry.status === 'uploading'
            ? { ...entry, percent: clamped }
            : entry
        )
      );
    };

    let uploadPromise: Promise<FileManagerItem | void>;

    try {
      uploadPromise = Promise.resolve(upload(file, reportProgress));
    } catch (error) {
      uploadPromise = Promise.reject(error);
    }

    return uploadPromise
      .then((result) => {
        if (cancelledUploads.current.has(uploadId)) {
          return null;
        }

        const node = createUploadNode(result, file, suffix);

        setUploadedByFolder((previous) => {
          const list = previous[targetFolderKey] ?? [];

          if (list.some((item) => item.id === node.id)) {
            return previous;
          }

          return { ...previous, [targetFolderKey]: [...list, node] };
        });
        setUploads((previous) =>
          previous.map((entry) =>
            entry.id === uploadId ? { ...entry, percent: 100, status: 'success' } : entry
          )
        );

        return node;
      })
      .catch((error: unknown) => {
        if (cancelledUploads.current.has(uploadId)) {
          return null;
        }

        const message = error instanceof Error ? error.message : String(error);

        setUploads((previous) =>
          previous.map((entry) =>
            entry.id === uploadId ? { ...entry, status: 'error', error: message } : entry
          )
        );
        onUploadError?.(file, error);

        return null;
      });
  };

  const handleUploadFiles = (files: File[]) => {
    if (typeof uploadFile !== 'function' || files.length === 0) {
      return;
    }

    const upload = uploadFile;
    const targetFolderKey = folderKey;
    const tasks = files.map((file) => startUpload(file, targetFolderKey, upload));

    Promise.allSettled(tasks).then((results) => {
      const completed = results
        .filter(
          (result): result is PromiseFulfilledResult<FileNode | null> =>
            result.status === 'fulfilled'
        )
        .map((result) => result.value)
        .filter((node): node is FileNode => node !== null);

      if (completed.length > 0) {
        onUploadComplete?.(completed);
      }
    });
  };

  const cancelUpload = (entry: FileManagerUploadEntry) => {
    cancelledUploads.current.add(entry.id);
    setUploads((previous) => previous.filter((item) => item.id !== entry.id));
  };

  const dismissUpload = (entry: FileManagerUploadEntry) => {
    setUploads((previous) => previous.filter((item) => item.id !== entry.id));
  };

  const handleBatchDelete = () => {
    removeLocalUploads(selectedNodes.map((node) => node.id));
    onBatchDelete?.(selectedNodes);
  };

  const handleDelete = (node: FileNode) => {
    removeLocalUploads([node.id]);
    onDelete?.(node);
  };

  const confirmDelete = () => {
    const node = pendingDelete;
    setPendingDelete(null);

    if (node) {
      handleDelete(node);
    }
  };

  const renderBuiltInPreview = (node: FileNode) => {
    const kind = getPreviewKind(node);

    if (kind === 'folder') {
      const count = node.children?.length ?? 0;

      return <p className={cx(classes.previewEmpty)}>{resolvedLabels.folderSummary(count)}</p>;
    }

    if (kind === 'image') {
      if (!node.url) {
        return <p className={cx(classes.previewEmpty)}>{resolvedLabels.previewUnavailable}</p>;
      }

      return <img className={cx(classes.previewImage)} src={node.url} alt={node.name} />;
    }

    if (kind === 'text') {
      if (!node.file && !node.url) {
        return <p className={cx(classes.previewEmpty)}>{resolvedLabels.previewUnavailable}</p>;
      }

      if (!previewText || previewText.nodeId !== node.id || previewText.status === 'loading') {
        return (
          <span
            role="status"
            aria-label={resolvedLabels.previewStatus}
            className={cx(classes.previewMeta)}
          >
            {resolvedLabels.loadingPreview}
          </span>
        );
      }

      if (previewText.status === 'error') {
        return (
          <span role="alert" className={cx(classes.previewError)}>
            {previewText.error}
          </span>
        );
      }

      return <pre className={cx(classes.previewText)}>{previewText.text}</pre>;
    }

    return <p className={cx(classes.previewEmpty)}>{resolvedLabels.noPreview}</p>;
  };

  const renderDefaultBreadcrumb = () => (
    <nav className={cx(classes.breadcrumb)} aria-label={resolvedLabels.breadcrumb}>
      <button
        type="button"
        className={cx(classes.crumb)}
        aria-current={chain.length === 0 ? 'page' : undefined}
        onClick={() => navigateTo([])}
      >
        {resolvedLabels.allFiles}
      </button>
      {chain.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <span className={cx(classes.separator)} aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className={cx(classes.crumb)}
            aria-current={index === chain.length - 1 ? 'page' : undefined}
            onClick={() => navigateTo(chain.slice(0, index + 1).map((item) => item.id))}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      <div className={cx(classes.header)}>
        <div className={cx(classes.breadcrumbBar)}>
          {chain.length > 0 && (
            <button
              type="button"
              className={cx(classes.crumb)}
              onClick={() => navigateTo(chain.slice(0, -1).map((item) => item.id))}
            >
              {resolvedLabels.back}
            </button>
          )}
          {breadcrumb ?? renderDefaultBreadcrumb()}
        </div>
        <div className={cx(classes.controls)}>
          {searchable && (
            <input
              type="search"
              className={cx(classes.search)}
              aria-label={resolvedLabels.search}
              placeholder={resolvedLabels.search}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          )}
          <div className={cx(classes.sortBar)} role="group" aria-label={resolvedLabels.sortFiles}>
            <label className={cx(classes.sortLabel)} htmlFor={sortSelectId}>
              {resolvedLabels.sortBy}
            </label>
            <select
              id={sortSelectId}
              className={cx(classes.sortSelect)}
              value={activeSort ? activeSort.by : ''}
              onChange={handleSortByChange}
            >
              <option value="">{resolvedLabels.defaultOrder}</option>
              <option value="name">{resolvedLabels.sortName}</option>
              <option value="size">{resolvedLabels.sortSize}</option>
              <option value="modified">{resolvedLabels.sortModified}</option>
            </select>
            <button
              type="button"
              className={cx(classes.actionButton)}
              aria-label={resolvedLabels.sortDirection(activeSortDirection)}
              onClick={toggleSortDirection}
            >
              {activeSortDirection === 'asc' ? resolvedLabels.ascending : resolvedLabels.descending}
            </button>
          </div>
          {typeof onCreateFolder === 'function' && (
            <button
              type="button"
              className={cx(classes.actionButton)}
              onClick={() => onCreateFolder()}
            >
              {resolvedLabels.newFolder}
            </button>
          )}
          {typeof onRename === 'function' && (
            <button
              type="button"
              className={cx(classes.actionButton)}
              disabled={!selectedNode}
              onClick={() => startRename()}
            >
              {resolvedLabels.rename}
            </button>
          )}
          {typeof onDelete === 'function' && (
            <button
              type="button"
              className={cx(classes.actionButton)}
              disabled={!selectedNode}
              onClick={() => selectedNode && handleDelete(selectedNode)}
            >
              {resolvedLabels.delete}
            </button>
          )}
          {actions}
        </div>
      </div>

      {selectable && (
        <div
          className={cx(classes.selectionToolbar)}
          role="toolbar"
          aria-label={resolvedLabels.selectionActions}
        >
          <Checkbox
            aria-label={resolvedLabels.selectAll}
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onCheck={handleSelectAll}
          />
          <span className={cx(classes.selectionCount)} role="status">
            {resolvedLabels.selectionCount(selectedKeys.length)}
          </span>
          {typeof onBatchDownload === 'function' && (
            <button
              type="button"
              className={cx(classes.actionButton)}
              disabled={selectedKeys.length === 0}
              onClick={() => onBatchDownload(selectedNodes)}
            >
              {resolvedLabels.downloadSelected}
            </button>
          )}
          {typeof onBatchDelete === 'function' && (
            <button
              type="button"
              className={cx(classes.actionButton)}
              disabled={selectedKeys.length === 0}
              onClick={handleBatchDelete}
            >
              {resolvedLabels.deleteSelected}
            </button>
          )}
          <button
            type="button"
            className={cx(classes.actionButton)}
            disabled={selectedKeys.length === 0}
            onClick={() => applySelection([])}
          >
            {resolvedLabels.clearSelection}
          </button>
        </div>
      )}

      {renameNode && (
        <div className={cx(classes.renameBar)}>
          <label className={cx(classes.renameLabel)} htmlFor={renameInputId}>
            {resolvedLabels.renameLabel(renameNode.name)}
          </label>
          <input
            id={renameInputId}
            className={cx(classes.renameInput)}
            value={renameValue}
            onChange={(event) => setRenameValue(event.currentTarget.value)}
            onKeyDown={handleRenameKeyDown}
          />
          <button type="button" className={cx(classes.actionButton)} onClick={commitRename}>
            {resolvedLabels.save}
          </button>
          <button
            type="button"
            className={cx(classes.actionButton)}
            onClick={() => setRenamingId(null)}
          >
            {resolvedLabels.cancel}
          </button>
        </div>
      )}

      {typeof uploadFile === 'function' && (
        <div className={cx(classes.uploadPanel)}>
          <Dropzone
            onDrop={handleUploadFiles}
            accept={accept}
            multiple={multiple}
            ariaLabel={resolvedLabels.upload}
          />
          {uploads.length > 0 && (
            <>
              <div className={cx(classes.uploadStatusRow)}>
                <span role="status">{uploadStatusText}</span>
              </div>
              <ul className={cx(classes.uploadList)} aria-label={resolvedLabels.uploads}>
                {uploads.map((entry) => (
                  <li key={entry.id} className={cx(classes.uploadItem)}>
                    <div className={cx(classes.uploadHeader)}>
                      <span className={cx(classes.uploadName)}>{entry.fileName}</span>
                      <span className={cx(classes.uploadStatus)}>
                        {getUploadStatusLabel(entry, resolvedLabels)}
                      </span>
                      {entry.status === 'uploading' ? (
                        <button
                          type="button"
                          className={cx(classes.linkButton)}
                          aria-label={resolvedLabels.cancelUpload(entry.fileName)}
                          onClick={() => cancelUpload(entry)}
                        >
                          {resolvedLabels.cancel}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={cx(classes.linkButton)}
                          aria-label={resolvedLabels.dismissUpload(entry.fileName)}
                          onClick={() => dismissUpload(entry)}
                        >
                          {resolvedLabels.dismiss}
                        </button>
                      )}
                    </div>
                    {entry.status === 'uploading' && (
                      <div
                        role="progressbar"
                        aria-label={resolvedLabels.uploading(entry.fileName)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={entry.percent}
                        aria-valuetext={`${entry.percent}%`}
                      >
                        <ProgressBar
                          value={entry.percent}
                          status="primary"
                          size="small"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    {entry.status === 'error' && entry.error && (
                      <span role="alert" className={cx(classes.uploadError)}>
                        {entry.error}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {dragAnnouncement !== '' && (
        <span
          role="status"
          aria-label={resolvedLabels.dragStatus}
          className={cx(classes.visuallyHidden)}
        >
          {dragAnnouncement}
        </span>
      )}

      <div
        className={cx(classes.content, {
          [classes.contentWithPreview]: previewNode !== null
        })}
      >
        {visibleItems.length === 0 ? (
          <div className={cx(classes.empty)}>
            {query ? resolvedLabels.noResults : (emptyState ?? resolvedLabels.empty)}
          </div>
        ) : (
          <ul
            role="listbox"
            aria-label={ariaLabel}
            aria-multiselectable={selectable && selectionMode === 'multiple' ? true : undefined}
            data-view={view}
            className={cx(classes.list, { [classes.grid]: view === 'grid' })}
          >
            {visibleItems.map((node) => {
              const size = formatSize(node.size);
              const modified = formatModifiedAt(node.modifiedAt);
              const isSelected = selectedKeys.includes(node.id);
              const isDragging = draggingId === node.id;
              const isDropTarget = dropTargetId === node.id;
              const isCut = cutIds.includes(node.id);

              return (
                <li
                  key={node.id}
                  ref={(element) => {
                    if (element) {
                      itemRefs.current.set(node.id, element);
                    } else {
                      itemRefs.current.delete(node.id);
                    }
                  }}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  draggable={draggable ? true : undefined}
                  data-dragging={isDragging ? 'true' : undefined}
                  data-cut={isCut ? 'true' : undefined}
                  data-drop-target={isDropTarget ? 'true' : undefined}
                  className={cx(classes.item, {
                    [classes.itemGrid]: view === 'grid',
                    [classes.selected]: isSelected,
                    [classes.itemDragging]: isDragging,
                    [classes.itemCut]: isCut,
                    [classes.dropTarget]: isDropTarget
                  })}
                  onClick={(event) => selectNode(node, event)}
                  onDoubleClick={() => openNode(node)}
                  onContextMenu={(event) => handleItemContextMenu(event, node)}
                  onKeyDown={(event) => handleItemKeyDown(event, node)}
                  onDragStart={(event) => handleItemDragStart(event, node)}
                  onDragOver={(event) => handleItemDragOver(event, node)}
                  onDragLeave={(event) => handleItemDragLeave(event, node)}
                  onDrop={(event) => handleItemDrop(event, node)}
                  onDragEnd={resetDragState}
                >
                  {selectable && (
                    <span
                      className={cx(classes.itemCheckbox)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {/*
                        Visual affordance only: making it focusable would create a nested
                        interactive control inside role="option". Keyboard users toggle the
                        option itself with Space, while aria-selected exposes the state.
                      */}
                      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
                      <span
                        role="checkbox"
                        aria-checked={isSelected}
                        aria-label={resolvedLabels.selectItem(node.name)}
                        className={cx(classes.checkbox)}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleItemCheck(node, !isSelected);
                        }}
                      >
                        {isSelected && <CheckIcon />}
                      </span>
                    </span>
                  )}
                  <span
                    className={cx(classes.icon, { [classes.fileIcon]: node.type === 'file' })}
                    aria-hidden="true"
                  >
                    {typeof renderIcon === 'function' ? (
                      renderIcon(node)
                    ) : node.type === 'folder' ? (
                      <FolderIcon />
                    ) : (
                      <FileIcon />
                    )}
                  </span>
                  <span className={cx(classes.details)}>
                    <span className={cx(classes.name)}>{node.name}</span>
                    {(size || modified) && (
                      <span className={cx(classes.meta)}>
                        {size && <span>{size}</span>}
                        {modified && <time dateTime={modified.dateTime}>{modified.label}</time>}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {previewNode && (
          <div
            role="region"
            aria-label={resolvedLabels.preview(previewNode.name)}
            className={cx(classes.preview)}
            onKeyDown={handlePreviewKeyDown}
          >
            <div className={cx(classes.previewHeader)}>
              <span className={cx(classes.previewTitle)}>{previewNode.name}</span>
              <button
                ref={previewCloseRef}
                type="button"
                className={cx(classes.actionButton)}
                aria-label={resolvedLabels.closePreview(previewNode.name)}
                onClick={closePreview}
              >
                {resolvedLabels.close}
              </button>
            </div>
            <div className={cx(classes.previewBody)}>
              {renderPreview ? renderPreview(previewNode) : renderBuiltInPreview(previewNode)}
            </div>
          </div>
        )}
      </div>

      {contextMenu && contextNode && (
        <div
          ref={menuPanelRef}
          role="menu"
          aria-label={resolvedLabels.menuLabel(contextNode.name)}
          className={cx(classes.menu)}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          tabIndex={-1}
          onKeyDown={handleMenuKeyDown}
        >
          {typeof renderContextMenu === 'function' ? (
            renderContextMenu(contextNode, () => closeContextMenu())
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                className={cx(classes.menuItem)}
                onClick={() => {
                  closeContextMenu();
                  openNode(contextNode);
                }}
              >
                {resolvedLabels.open}
              </button>
              {typeof onRename === 'function' && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  onClick={() => {
                    closeContextMenu();
                    startRename(contextNode);
                  }}
                >
                  {resolvedLabels.rename}
                </button>
              )}
              {typeof onDownload === 'function' && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  onClick={() => {
                    closeContextMenu();
                    onDownload(contextNode);
                  }}
                >
                  {resolvedLabels.download}
                </button>
              )}
              {typeof onDelete === 'function' && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  onClick={() => {
                    closeContextMenu();
                    setPendingDelete(contextNode);
                  }}
                >
                  {resolvedLabels.delete}
                </button>
              )}
              {typeof onCreateFolder === 'function' && (
                <button
                  type="button"
                  role="menuitem"
                  className={cx(classes.menuItem)}
                  onClick={() => {
                    closeContextMenu();
                    onCreateFolder();
                  }}
                >
                  {resolvedLabels.newFolder}
                </button>
              )}
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        opened={pendingDelete !== null}
        title={
          pendingDelete
            ? resolvedLabels.deleteTitle(pendingDelete.name)
            : resolvedLabels.deleteItemTitle
        }
        message={resolvedLabels.deleteMessage}
        confirmLabel={resolvedLabels.deleteConfirm}
        cancelLabel={resolvedLabels.deleteCancel}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <span className={cx(classes.visuallyHidden)} aria-live="polite">
        {liveMessage || resolvedLabels.itemCount(visibleItems.length)}
      </span>
    </div>
  );
});

_FileManager.displayName = 'FileManager';

export const FileManager = _FileManager;
