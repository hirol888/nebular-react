import React, { useState } from 'react';
import { NebularProvider } from '@nebular-react/styles';
import { FileManager, FileManagerSort, FileNode } from './FileManager';

export default { title: 'FileManager', component: FileManager };

const initialItems: FileNode[] = [
  {
    id: 'documents',
    name: 'Documents',
    type: 'folder',
    modifiedAt: new Date('2024-03-15T12:00:00Z'),
    children: [
      {
        id: 'report',
        name: 'annual-report.pdf',
        type: 'file',
        size: 1_572_864,
        modifiedAt: new Date('2024-03-14T12:00:00Z')
      },
      {
        id: 'notes',
        name: 'meeting-notes.txt',
        type: 'file',
        size: 4096,
        modifiedAt: new Date('2024-03-10T12:00:00Z')
      },
      {
        id: 'archive',
        name: 'Archive',
        type: 'folder',
        children: [
          {
            id: 'archive-2023',
            name: '2023-summary.pdf',
            type: 'file',
            size: 524_288,
            modifiedAt: new Date('2023-12-31T12:00:00Z')
          }
        ]
      }
    ]
  },
  {
    id: 'images',
    name: 'Images',
    type: 'folder',
    modifiedAt: new Date('2024-02-20T12:00:00Z'),
    children: [
      {
        id: 'hero',
        name: 'hero.png',
        type: 'file',
        size: 2_097_152,
        modifiedAt: new Date('2024-02-20T12:00:00Z')
      }
    ]
  },
  {
    id: 'readme',
    name: 'README.md',
    type: 'file',
    size: 2048,
    modifiedAt: new Date('2024-01-05T12:00:00Z')
  }
];

const renameNode = (nodes: FileNode[], id: string, name: string): FileNode[] =>
  nodes.map((node) =>
    node.id === id
      ? { ...node, name }
      : { ...node, children: node.children ? renameNode(node.children, id, name) : undefined }
  );

const removeNode = (nodes: FileNode[], id: string): FileNode[] =>
  nodes
    .filter((node) => node.id !== id)
    .map((node) => (node.children ? { ...node, children: removeNode(node.children, id) } : node));

const removeNodes = (nodes: FileNode[], ids: string[]): FileNode[] =>
  nodes
    .filter((node) => !ids.includes(node.id))
    .map((node) => (node.children ? { ...node, children: removeNodes(node.children, ids) } : node));

const extractNodes = (nodes: FileNode[], ids: string[], collected: FileNode[] = []): FileNode[] =>
  nodes
    .filter((node) => {
      if (ids.includes(node.id)) {
        collected.push(node);
        return false;
      }

      return true;
    })
    .map((node) =>
      node.children ? { ...node, children: extractNodes(node.children, ids, collected) } : node
    );

const insertIntoFolder = (nodes: FileNode[], folderId: string, moved: FileNode[]): FileNode[] =>
  nodes.map((node) => {
    if (node.id === folderId) {
      return { ...node, children: [...(node.children ?? []), ...moved] };
    }

    return node.children
      ? { ...node, children: insertIntoFolder(node.children, folderId, moved) }
      : node;
  });

const moveNodes = (nodes: FileNode[], ids: string[], targetFolderId: string): FileNode[] => {
  const moved: FileNode[] = [];
  const remaining = extractNodes(nodes, ids, moved);

  return insertIntoFolder(remaining, targetFolderId, moved);
};

const previewItems: FileNode[] = [
  {
    id: 'preview-image',
    name: 'hero.png',
    type: 'file',
    size: 286_720,
    modifiedAt: new Date('2024-03-01T12:00:00Z'),
    url: 'https://picsum.photos/seed/nebular-file-manager/480/280'
  },
  {
    id: 'preview-readme',
    name: 'README.md',
    type: 'file',
    size: 1024,
    modifiedAt: new Date('2024-02-10T12:00:00Z'),
    url: 'data:text/plain;charset=utf-8,Hello%20from%20the%20built-in%20text%20preview.'
  },
  {
    id: 'preview-binary',
    name: 'archive.bin',
    type: 'file',
    size: 4096,
    modifiedAt: new Date('2024-01-15T12:00:00Z')
  },
  {
    id: 'preview-folder',
    name: 'Assets',
    type: 'folder',
    modifiedAt: new Date('2024-01-20T12:00:00Z'),
    children: [
      {
        id: 'preview-folder-logo',
        name: 'logo.svg',
        type: 'file',
        size: 2048,
        url: 'https://placehold.co/240x120?text=nebular'
      }
    ]
  }
];

export function Showcase() {
  const [selected, setSelected] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileManager
        items={initialItems}
        value={selected}
        onSelect={setSelected}
        onOpen={(node) => setOpened(node.name)}
      />
      <span>
        Selected: {selected ?? 'none'}
        {opened ? ` · Last opened: ${opened}` : ''}
      </span>
    </div>
  );
}

export function Grid() {
  const [selected, setSelected] = useState<string | null>('readme');

  return (
    <FileManager
      items={initialItems}
      view="grid"
      ariaLabel="Files grid"
      value={selected}
      onSelect={setSelected}
    />
  );
}

export function Actions() {
  const [items, setItems] = useState<FileNode[]>(initialItems);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('No action yet');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileManager
        items={items}
        value={selected}
        onSelect={setSelected}
        onCreateFolder={() => {
          const id = `folder-${Date.now()}`;
          setItems((current) => [
            ...current,
            { id, name: 'New folder', type: 'folder', children: [] }
          ]);
          setMessage('Folder created');
        }}
        onRename={(node, name) => {
          setItems((current) => renameNode(current, node.id, name));
          setMessage(`Renamed ${node.name} to ${name}`);
        }}
        onDelete={(node) => {
          setItems((current) => removeNode(current, node.id));
          setMessage(`Deleted ${node.name}`);
        }}
        actions={
          <button
            type="button"
            style={{
              padding: '0.25rem 0.55rem',
              border: '1px solid #e4e9f2',
              borderRadius: '0.375rem',
              background: '#fff',
              cursor: 'pointer'
            }}
            onClick={() => {
              const id = `file-${Date.now()}`;
              setItems((current) => [
                ...current,
                { id, name: 'upload.txt', type: 'file', size: 1024, modifiedAt: Date.now() }
              ]);
              setMessage('File uploaded');
            }}
          >
            Upload
          </button>
        }
      />
      <span>{message}</span>
    </div>
  );
}

export function MultiSelect() {
  const [items, setItems] = useState<FileNode[]>(initialItems);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['readme']);
  const [message, setMessage] = useState('Ctrl/Cmd+click toggles, Shift+click selects a range');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileManager
        items={items}
        selectable
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        onBatchDownload={(nodes) => {
          setMessage(`Downloading ${nodes.map((node) => node.name).join(', ')}`);
        }}
        onBatchDelete={(nodes) => {
          const ids = nodes.map((node) => node.id);
          setItems((current) => removeNodes(current, ids));
          setSelectedKeys((current) => current.filter((id) => !ids.includes(id)));
          setMessage(`Deleted ${nodes.length} item(s)`);
        }}
        onRename={(node, name) => {
          setItems((current) => renameNode(current, node.id, name));
          setMessage(`Renamed ${node.name} to ${name}`);
        }}
        onDelete={(node) => {
          setItems((current) => removeNode(current, node.id));
          setSelectedKeys((current) => current.filter((id) => id !== node.id));
          setMessage(`Deleted ${node.name}`);
        }}
      />
      <span>
        {selectedKeys.length} selected
        {selectedKeys.length > 0 ? `: ${selectedKeys.join(', ')}` : ''}
      </span>
      <span>{message}</span>
    </div>
  );
}

export function UploadProgress() {
  const [items, setItems] = useState<FileNode[]>(initialItems);
  const [message, setMessage] = useState('Drop files below to simulate an upload');

  const uploadFile = (file: File, onProgress: (percent: number) => void) =>
    new Promise<FileNode>((resolve, reject) => {
      if (file.name.startsWith('fail-')) {
        reject(new Error('Simulated upload failure'));
        return;
      }

      let percent = 0;
      const interval = window.setInterval(() => {
        percent = Math.min(100, percent + 20);
        onProgress(percent);

        if (percent === 100) {
          window.clearInterval(interval);
          resolve({
            id: `uploaded-${file.name}-${Date.now()}`,
            name: file.name,
            type: 'file',
            size: file.size,
            modifiedAt: Date.now()
          });
        }
      }, 250);
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileManager
        items={items}
        uploadFile={uploadFile}
        accept=".pdf,.txt,.png"
        multiple
        onUploadComplete={(uploaded) => {
          setItems((current) => [...current, ...uploaded]);
          setMessage(`Uploaded ${uploaded.map((item) => item.name).join(', ')}`);
        }}
        onUploadError={(file, error) => {
          setMessage(
            `Failed ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }}
      />
      <span>Name a file fail-* to preview the error state. Cancel stops tracking the upload.</span>
      <span>{message}</span>
    </div>
  );
}

export function ContextMenu() {
  const [items, setItems] = useState<FileNode[]>(initialItems);
  const [message, setMessage] = useState('Right-click an item or press Shift+F10');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileManager
        items={items}
        onContextMenu={(node) => setMessage(`Context menu for ${node.name}`)}
        onDownload={(node) => setMessage(`Downloading ${node.name}`)}
        onRename={(node, name) => {
          setItems((current) => renameNode(current, node.id, name));
          setMessage(`Renamed ${node.name} to ${name}`);
        }}
        onDelete={(node) => {
          setItems((current) => removeNode(current, node.id));
          setMessage(`Deleted ${node.name}`);
        }}
        onCreateFolder={() => {
          const id = `folder-${Date.now()}`;
          setItems((current) => [
            ...current,
            { id, name: 'New folder', type: 'folder', children: [] }
          ]);
          setMessage('Folder created');
        }}
      />
      <span>{message}</span>
    </div>
  );
}

export function DragAndDrop() {
  const [items, setItems] = useState<FileNode[]>(initialItems);
  const [message, setMessage] = useState(
    'Drag items onto a folder, or select one and press Ctrl/Cmd+X then Ctrl/Cmd+V.'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileManager
        items={items}
        draggable
        selectable
        onMove={(nodes, targetFolderId) => {
          const ids = nodes.map((node) => node.id);

          setItems((current) => moveNodes(current, ids, targetFolderId));
          setMessage(`Moved ${nodes.map((node) => node.name).join(', ')} into ${targetFolderId}`);
        }}
      />
      <span>{message}</span>
    </div>
  );
}

export function Sorting() {
  const [sort, setSort] = useState<FileManagerSort>({ by: 'name', direction: 'asc' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileManager
        items={initialItems}
        sortBy={sort.by}
        sortDirection={sort.direction}
        onSortChange={setSort}
      />
      <span>
        Sorted by {sort.by} ({sort.direction})
      </span>
    </div>
  );
}

export function Preview() {
  const [custom, setCustom] = useState(false);
  const [lastPreview, setLastPreview] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <input
          type="checkbox"
          checked={custom}
          onChange={(event) => setCustom(event.currentTarget.checked)}
        />
        Use renderPreview
      </label>
      <FileManager
        items={previewItems}
        preview
        defaultSelectedKeys={['preview-image']}
        onPreview={(node) => setLastPreview(node.name)}
        renderPreview={
          custom
            ? (node: FileNode) => (
                <div>
                  <strong>{node.name}</strong>
                  <p style={{ margin: '0.35rem 0 0' }}>
                    Custom preview for a {node.type} with {node.children?.length ?? 0} children.
                  </p>
                </div>
              )
            : undefined
        }
      />
      <span>
        Last preview: {lastPreview}. Images render as thumbnails, text uses fetch with an
        AbortController, and other types show a fallback message.
      </span>
    </div>
  );
}

export function Localized() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <NebularProvider locale="pt-BR">
        <FileManager
          items={initialItems}
          onCreateFolder={() => undefined}
          onRename={() => undefined}
          onDelete={() => undefined}
          onDownload={() => undefined}
        />
      </NebularProvider>
      <FileManager
        items={initialItems}
        labels={{ newFolder: 'Create folder (custom)', empty: 'Nothing to show' }}
        onCreateFolder={() => undefined}
      />
      <span>
        The first instance reads the pt-BR catalog from NebularProvider; the second overrides labels
        directly and keeps English fallbacks for every other string.
      </span>
    </div>
  );
}
