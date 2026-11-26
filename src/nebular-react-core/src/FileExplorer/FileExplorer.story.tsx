import React, { useMemo, useState } from 'react';
import { Button } from '../Button';
import { Desktop } from '../Desktop';
import { Tree, type TreeNode } from '../Tree';
import { FileExplorer } from './FileExplorer';
import { createMemoryFileSystemProvider } from './FileExplorer.providers';
import type { FileEntry, FileExplorerView } from './FileExplorer.types';

export default { title: 'FileExplorer', component: FileExplorer };

const seed: FileEntry[] = [
  { id: 'docs', name: 'Documents', path: '/Documents', type: 'folder', modifiedAt: '2026-01-10' },
  {
    id: 'reports',
    name: 'Reports',
    path: '/Documents/Reports',
    type: 'folder',
    modifiedAt: '2026-01-12'
  },
  {
    id: 'report',
    name: 'report.pdf',
    path: '/Documents/Reports/report.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    size: 248_000,
    modifiedAt: '2026-01-14'
  },
  {
    id: 'notes',
    name: 'notes.md',
    path: '/Documents/notes.md',
    type: 'file',
    mimeType: 'text/markdown',
    size: 1_240,
    modifiedAt: '2026-02-02',
    url: 'data:text/markdown;charset=utf-8,%23%20Notes%0A%0A-%20Primeiro%20item%0A-%20Segundo%20item'
  },
  { id: 'pics', name: 'Pictures', path: '/Pictures', type: 'folder', modifiedAt: '2026-02-03' },
  {
    id: 'logo',
    name: 'logo.svg',
    path: '/Pictures/logo.svg',
    type: 'file',
    mimeType: 'image/svg+xml',
    size: 3_800,
    modifiedAt: '2026-02-04'
  },
  {
    id: 'readme',
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    mimeType: 'text/markdown',
    size: 2_100,
    modifiedAt: '2026-02-05',
    url: 'data:text/markdown;charset=utf-8,%23%20File%20Explorer%0A%0AExemplo%20de%20provider%20em%20mem%C3%B3ria.'
  },
  {
    id: 'tasks',
    name: 'tasks.json',
    path: '/tasks.json',
    type: 'file',
    mimeType: 'application/json',
    size: 540,
    modifiedAt: '2026-02-06'
  }
];

function buildTree(entries: FileEntry[]): TreeNode[] {
  const folders = entries.filter((entry) => entry.type === 'folder');
  const roots = folders.filter((folder) => folder.path.split('/').filter(Boolean).length === 1);

  return roots.map((folder) => ({
    value: folder.path,
    label: folder.name,
    children: folders
      .filter(
        (child) =>
          child.path.startsWith(`${folder.path}/`) &&
          child.path.split('/').filter(Boolean).length ===
            folder.path.split('/').filter(Boolean).length + 1
      )
      .map((child) => ({ value: child.path, label: child.name }))
  }));
}

function Demo({
  initialView = 'list',
  readOnly = false,
  tabs = false
}: {
  initialView?: FileExplorerView;
  readOnly?: boolean;
  tabs?: boolean;
}) {
  const provider = useMemo(() => createMemoryFileSystemProvider(seed), []);
  const [path, setPath] = useState('/');
  const [view, setView] = useState<FileExplorerView>(initialView);
  const tree = useMemo(() => buildTree(provider.entries()), [provider]);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div style={{ height: '32rem' }}>
      <FileExplorer
        provider={provider}
        path={path}
        onPathChange={setPath}
        view={view}
        onViewChange={setView}
        readOnly={readOnly}
        tabs={tabs}
        selectedKeys={selected}
        onSelectionChange={setSelected}
        ariaLabel="Demo file explorer"
        sidebar={
          <Tree
            data={tree}
            selectedValues={[path]}
            onSelectionChange={(values) => setPath(values[0] ?? '/')}
            ariaLabel="Folders"
          />
        }
      />
    </div>
  );
}

export const ListView = () => <Demo />;
export const GridView = () => <Demo initialView="grid" />;
export const DetailsView = () => <Demo initialView="details" />;
export const ReadOnly = () => <Demo readOnly />;
export const Tabs = () => <Demo tabs />;

export function WithToolbar() {
  const [path, setPath] = useState('/');
  const provider = useMemo(() => createMemoryFileSystemProvider(seed), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '34rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="small" onClick={() => setPath('/')}>
          Root
        </Button>
        <Button size="small" appearance="outline" onClick={() => setPath('/Documents')}>
          Documents
        </Button>
        <Button size="small" appearance="outline" onClick={() => setPath('/Pictures')}>
          Pictures
        </Button>
      </div>
      <div style={{ flex: '1 1 auto', minHeight: 0 }}>
        <FileExplorer provider={provider} path={path} onPathChange={setPath} />
      </div>
    </div>
  );
}

export function InsideDesktop() {
  const provider = useMemo(() => createMemoryFileSystemProvider(seed), []);

  return (
    <div style={{ height: '34rem' }}>
      <Desktop
        apps={[
          {
            id: 'files',
            title: 'File Explorer',
            icon: '📁',
            content: <FileExplorer provider={provider} defaultPath="/Documents" view="details" />
          }
        ]}
        defaultWindows={[
          {
            id: 'files-window',
            appId: 'files',
            x: 32,
            y: 32,
            width: 760,
            height: 420,
            minimized: false,
            maximized: false,
            zIndex: 1
          }
        ]}
      />
    </div>
  );
}
