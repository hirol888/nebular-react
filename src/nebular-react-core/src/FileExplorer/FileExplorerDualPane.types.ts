import React from 'react';
import { DefaultProps } from '@nebular-react/styles';
import type { FileExplorerDualPaneStylesNames } from './FileExplorerDualPane.styles';
import type {
  FileEntry,
  FileExplorerSelectionMode,
  FileExplorerView,
  FileSystemProvider
} from './FileExplorer.types';

export interface FileExplorerDualPaneLabels {
  primary: string;
  secondary: string;
  resize: string;
}

export interface FileExplorerDualPaneProps
  extends
    DefaultProps<FileExplorerDualPaneStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  provider: FileSystemProvider;
  primaryPath?: string;
  defaultPrimaryPath?: string;
  onPrimaryPathChange?(path: string): void;
  secondaryPath?: string;
  defaultSecondaryPath?: string;
  onSecondaryPathChange?(path: string): void;
  view?: FileExplorerView;
  defaultView?: FileExplorerView;
  onViewChange?(view: FileExplorerView): void;
  tabs?: boolean;
  searchable?: boolean;
  selectionMode?: FileExplorerSelectionMode;
  sidebar?: React.ReactNode;
  labels?: Partial<FileExplorerDualPaneLabels>;
  ariaLabel?: string;
  readOnly?: boolean;
  renderIcon?(entry: FileEntry): React.ReactNode;
  renderPreview?(entry: FileEntry): React.ReactNode;
  onPrimarySelectionChange?(keys: string[], entries: FileEntry[]): void;
  onSecondarySelectionChange?(keys: string[], entries: FileEntry[]): void;
  initialSplit?: number;
  split?: number;
  onSplitChange?(split: number): void;
  minPaneWidth?: number | string;
}
