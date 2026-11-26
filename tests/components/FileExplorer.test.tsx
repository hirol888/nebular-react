import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  FileExplorer,
  FileExplorerDualPane,
  createMemoryFileSystemProvider,
  createRestFileSystemProvider,
  type FileEntry,
  type FileListOptions,
  type FileListResult,
  type FileSystemProvider,
  type FileUploadProgress
} from '@nebular-react/core';

const seed: FileEntry[] = [
  {
    id: 'docs',
    name: 'Documents',
    path: '/Documents',
    type: 'folder',
    modifiedAt: '2026-01-10'
  },
  {
    id: 'notes',
    name: 'notes.md',
    path: '/Documents/notes.md',
    type: 'file',
    mimeType: 'text/markdown',
    size: 1200,
    modifiedAt: '2026-02-02',
    url: 'data:text/markdown;charset=utf-8,%23%20Notes'
  },
  {
    id: 'pics',
    name: 'Pictures',
    path: '/Pictures',
    type: 'folder',
    modifiedAt: '2026-02-03'
  },
  {
    id: 'readme',
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    mimeType: 'text/markdown',
    size: 2100,
    modifiedAt: '2026-02-05',
    url: 'data:text/markdown;charset=utf-8,%23%20Readme'
  }
];

function createDataTransfer() {
  const store = new Map<string, string>();
  const dataTransfer = {
    types: [] as string[],
    effectAllowed: 'all',
    dropEffect: 'none',
    files: [] as unknown as FileList,
    setData(type: string, value: string) {
      store.set(type, value);

      if (!dataTransfer.types.includes(type)) {
        dataTransfer.types.push(type);
      }
    },
    getData(type: string) {
      return store.get(type) ?? '';
    },
    clearData() {
      store.clear();
      dataTransfer.types = [];
    }
  };

  return dataTransfer;
}

function createProvider() {
  return createMemoryFileSystemProvider(seed);
}

function createUploadMockProvider() {
  const base = createMemoryFileSystemProvider(seed);
  const attempts = new Map<string, number>();
  const upload = jest.fn(
    async (
      parentPath: string,
      files: File[],
      options?: { signal?: AbortSignal; onProgress?(progress: FileUploadProgress): void }
    ): Promise<FileEntry[]> => {
      const file = files[0];
      const attempt = (attempts.get(file.name) ?? 0) + 1;
      attempts.set(file.name, attempt);
      const uploaded: FileEntry = {
        id: `uploaded-${file.name}`,
        name: file.name,
        path: `${parentPath}/${file.name}`,
        type: 'file',
        size: file.size
      };

      if (file.name === 'ok.txt') {
        options?.onProgress?.({ file, percent: 40 });
        options?.onProgress?.({ file, percent: 100 });
        return [uploaded];
      }

      if (file.name === 'retry.txt' && attempt > 1) {
        options?.onProgress?.({ file, percent: 100 });
        return [uploaded];
      }

      if (file.name === 'retry.txt') {
        throw new Error('network down');
      }

      options?.onProgress?.({ file, percent: 25 });

      return new Promise<FileEntry[]>((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    }
  );

  return {
    provider: { ...base, upload } as FileSystemProvider,
    upload
  };
}

function createPaginatedProvider(total = 5, pageSize = 2) {
  const all: FileEntry[] = Array.from({ length: total }, (_, index) => ({
    id: `page-${index}`,
    name: `file-${index + 1}.txt`,
    path: `/file-${index + 1}.txt`,
    type: 'file',
    size: 10 * (index + 1)
  }));

  const list = jest.fn(
    async (_path: string, options?: FileListOptions): Promise<FileListResult> => {
      const page = options?.page ?? 0;
      const size = options?.pageSize ?? pageSize;
      const entries = all.slice(page * size, (page + 1) * size);
      return {
        entries,
        total,
        hasMore: (page + 1) * size < total
      };
    }
  );

  return {
    provider: { list } as FileSystemProvider,
    list
  };
}

describe('FileExplorer', () => {
  it('renders entries and navigates into folders', async () => {
    const user = userEvent.setup();
    const provider = createProvider();

    render(<FileExplorer provider={provider} ariaLabel="Files" />);

    expect(await screen.findByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('README.md')).toBeInTheDocument();

    await user.dblClick(screen.getByText('Documents'));

    expect(await screen.findByText('notes.md')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Documents');
  });

  it('switches between list, grid and details views', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');

    await user.click(screen.getByRole('button', { name: 'Grid view' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Details view' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Size/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects multiple entries and reports the selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(<FileExplorer provider={createProvider()} onSelectionChange={onSelectionChange} />);

    await screen.findByText('README.md');

    await user.click(screen.getByRole('option', { name: /README\.md/ }));
    await user.keyboard('{Control>}');
    await user.click(screen.getByRole('option', { name: /Documents/ }));
    await user.keyboard('{/Control}');

    expect(screen.getAllByText('2 selected')).toHaveLength(2);
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      ['/README.md', '/Documents'],
      expect.arrayContaining([
        expect.objectContaining({ path: '/README.md' }),
        expect.objectContaining({ path: '/Documents' })
      ])
    );
  });

  it('creates a folder inline', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    await user.click(screen.getByRole('button', { name: 'New folder' }));

    const input = screen.getByRole('textbox', { name: 'Folder name' });
    await user.type(input, 'Archive{Enter}');

    expect(await screen.findByText('Archive')).toBeInTheDocument();
  });

  it('renames an entry inline', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    await user.click(screen.getByRole('option', { name: /README\.md/ }));
    await user.click(screen.getByRole('button', { name: 'Rename' }));

    const input = screen.getByRole('textbox', { name: 'Rename README.md' });
    await user.clear(input);
    await user.type(input, 'GUIDE.md{Enter}');

    expect(await screen.findByText('GUIDE.md')).toBeInTheDocument();
    expect(screen.queryByText('README.md')).not.toBeInTheDocument();
  });

  it('deletes entries after confirmation', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    await user.click(screen.getByRole('option', { name: /README\.md/ }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(screen.queryByText('README.md')).not.toBeInTheDocument());
  });

  it('searches entries with the provider', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    await user.type(screen.getByRole('searchbox', { name: 'Search files' }), 'notes');

    expect(await screen.findByText('notes.md')).toBeInTheDocument();
    expect(screen.queryByText('README.md')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and opening a folder', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('Documents');
    const listbox = screen.getByRole('listbox');
    listbox.focus();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(await screen.findByText('notes.md')).toBeInTheDocument();
  });

  it('copies and pastes entries into another folder', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    await user.click(screen.getByRole('option', { name: /README\.md/ }));
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await user.dblClick(screen.getByText('Documents'));

    await screen.findByText('notes.md');
    await user.click(screen.getByRole('button', { name: 'Paste' }));

    expect(await screen.findByText('README.md')).toBeInTheDocument();
    expect(screen.getByText('notes.md')).toBeInTheDocument();
  });

  it('cuts and moves entries into another folder', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    await user.click(screen.getByRole('option', { name: /README\.md/ }));
    await user.click(screen.getByRole('button', { name: 'Cut' }));
    await user.dblClick(screen.getByText('Documents'));

    await screen.findByText('notes.md');
    await user.click(screen.getByRole('button', { name: 'Paste' }));

    expect(await screen.findByText('README.md')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Up' }));

    await waitFor(() => expect(screen.queryByText('README.md')).not.toBeInTheDocument());
  });

  it('opens and closes tabs', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createProvider()} tabs />);

    await screen.findByText('README.md');
    expect(screen.getByRole('tablist', { name: 'Open folders' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'New tab' }));
    expect(screen.getAllByRole('tab')).toHaveLength(2);

    await user.click(screen.getAllByRole('tab')[0]);
    await user.dblClick(screen.getByText('Documents'));
    expect(await screen.findByText('notes.md')).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[1]);

    expect(await screen.findByText('README.md')).toBeInTheDocument();
  });

  it('moves entries by dragging onto a folder', async () => {
    const user = userEvent.setup();
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: jest.fn(),
      getData: jest.fn(),
      types: []
    } as unknown as DataTransfer;

    render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    const file = screen.getByRole('option', { name: /README\.md/ });
    const folder = screen.getByRole('option', { name: /Documents/ });

    fireEvent.dragStart(file, { dataTransfer });
    fireEvent.dragOver(folder, { dataTransfer });
    fireEvent.drop(folder, { dataTransfer });

    await waitFor(() => expect(screen.queryByText('README.md')).not.toBeInTheDocument());
    await user.dblClick(screen.getByText('Documents'));

    expect(await screen.findByText('README.md')).toBeInTheDocument();
  });

  it('uploads files through the provider', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileExplorer provider={createProvider()} />);

    await screen.findByText('README.md');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'upload.txt', { type: 'text/plain' });

    await user.upload(input, file);

    expect(await screen.findByText('upload.txt')).toBeInTheDocument();
  });

  it('tracks multiple uploads independently and supports cancel, retry and dismiss', async () => {
    const user = userEvent.setup();
    const { provider, upload } = createUploadMockProvider();
    const { container } = render(<FileExplorer provider={provider} />);

    await screen.findByText('README.md');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, [
      new File(['a'], 'ok.txt', { type: 'text/plain' }),
      new File(['b'], 'retry.txt', { type: 'text/plain' }),
      new File(['c'], 'slow.txt', { type: 'text/plain' })
    ]);

    expect(await screen.findByText('Uploaded ok.txt')).toBeInTheDocument();
    expect(await screen.findByText('Upload failed: retry.txt')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Uploading slow.txt (25%)');

    await user.click(screen.getByRole('button', { name: 'Cancel upload of slow.txt' }));

    expect(await screen.findByText('Upload canceled: slow.txt')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry upload of retry.txt' }));

    expect(await screen.findByText('Uploaded retry.txt')).toBeInTheDocument();
    expect(upload.mock.calls.every(([, files]) => files.length === 1)).toBe(true);
    expect(upload).toHaveBeenCalledTimes(4);

    await user.click(screen.getByRole('button', { name: 'Dismiss ok.txt' }));

    await waitFor(() => expect(screen.queryByText('Uploaded ok.txt')).not.toBeInTheDocument());
  });

  it('blocks actions denied by entry permissions', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();
    const download = jest.fn(async () => new Blob(['locked']));
    const base = createMemoryFileSystemProvider([
      ...seed,
      {
        id: 'audit',
        name: 'audit.log',
        path: '/audit.log',
        type: 'file',
        size: 400,
        modifiedAt: '2026-03-01',
        permissions: { read: false, write: false, delete: false, download: false }
      },
      {
        id: 'contract',
        name: 'contract.pdf',
        path: '/contract.pdf',
        type: 'file',
        size: 500,
        modifiedAt: '2026-03-02',
        permissions: { write: false, delete: false, download: false }
      },
      {
        id: 'shared',
        name: 'Shared',
        path: '/Shared',
        type: 'folder',
        modifiedAt: '2026-03-03',
        permissions: { read: false }
      }
    ]);
    const provider: FileSystemProvider = { ...base, download };

    render(<FileExplorer provider={provider} onOpen={onOpen} />);

    await screen.findByText('audit.log');
    const lockedRow = screen.getByRole('option', { name: /audit\.log/ });

    expect(lockedRow).toHaveAttribute('aria-disabled', 'true');
    expect(lockedRow).toHaveAttribute('title', expect.stringContaining('Not allowed'));

    await user.click(lockedRow);
    expect(screen.getByRole('button', { name: 'Rename' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cut' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();

    await user.dblClick(lockedRow);
    expect(onOpen).not.toHaveBeenCalled();

    screen.getByRole('listbox').focus();
    await user.keyboard('{Delete}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    fireEvent.contextMenu(lockedRow);
    expect(screen.getByRole('menuitem', { name: 'Open' })).toBeDisabled();
    expect(screen.getByRole('menuitem', { name: 'Download' })).toBeDisabled();
    fireEvent.keyDown(document, { key: 'Escape' });

    const readOnlyRow = screen.getByRole('option', { name: /contract\.pdf/ });
    await user.click(readOnlyRow);
    expect(screen.getByRole('button', { name: 'Rename' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cut' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeEnabled();

    await user.dblClick(readOnlyRow);
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ path: '/contract.pdf' }));

    await user.dblClick(screen.getByRole('option', { name: /Shared/ }));
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).not.toHaveTextContent('Shared');
  });

  it('loads additional pages when the provider reports hasMore', async () => {
    const user = userEvent.setup();
    const { provider, list } = createPaginatedProvider();

    const { rerender } = render(<FileExplorer provider={provider} pageSize={2} />);

    expect(await screen.findByText('file-1.txt')).toBeInTheDocument();
    expect(screen.getByText('file-2.txt')).toBeInTheDocument();
    expect(screen.queryByText('file-3.txt')).not.toBeInTheDocument();
    expect(list).toHaveBeenNthCalledWith(1, '/', expect.objectContaining({ page: 0, pageSize: 2 }));

    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(await screen.findByText('file-3.txt')).toBeInTheDocument();
    expect(screen.getByText('file-4.txt')).toBeInTheDocument();
    expect(screen.queryByText('file-5.txt')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Load more' }));

    expect(await screen.findByText('file-5.txt')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
    );

    rerender(<FileExplorer provider={provider} pageSize={2} path="/Other" />);

    await waitFor(() =>
      expect(list).toHaveBeenLastCalledWith(
        '/Other',
        expect.objectContaining({ page: 0, pageSize: 2 })
      )
    );
  });

  it('virtualizes long lists while keeping keyboard navigation', async () => {
    const user = userEvent.setup();
    const manyEntries: FileEntry[] = Array.from({ length: 300 }, (_, index) => ({
      id: `virtual-${index}`,
      name: `file-${String(index + 1).padStart(3, '0')}.txt`,
      path: `/file-${String(index + 1).padStart(3, '0')}.txt`,
      type: 'file',
      size: 100 + index
    }));

    render(<FileExplorer provider={createMemoryFileSystemProvider(manyEntries)} />);

    await screen.findByText('file-001.txt');
    expect(screen.getAllByRole('option').length).toBeLessThan(300);

    const listbox = screen.getByRole('listbox');
    listbox.focus();
    await user.keyboard('{End}');

    expect(await screen.findByText('file-300.txt')).toBeInTheDocument();
    const lastRow = screen.getByRole('option', { name: /file-300\.txt/ });
    expect(lastRow).toHaveAttribute('aria-selected', 'true');
    expect(lastRow).toHaveAttribute('aria-setsize', '300');
    await waitFor(() => expect(lastRow).toHaveFocus());
    expect(screen.getAllByRole('option').length).toBeLessThan(300);

    await user.click(screen.getByRole('button', { name: 'Details view' }));

    expect(await screen.findByText('file-001.txt')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeLessThan(300);
  });

  it('has no accessibility violations with uploads and restricted entries', async () => {
    const user = userEvent.setup();
    const base = createMemoryFileSystemProvider([
      ...seed,
      {
        id: 'audit',
        name: 'audit.log',
        path: '/audit.log',
        type: 'file',
        permissions: { read: false, write: false, delete: false, download: false }
      }
    ]);
    const provider: FileSystemProvider = {
      ...base,
      upload: jest.fn(
        (_parent: string, _files: File[], options?: { signal?: AbortSignal }) =>
          new Promise<FileEntry[]>((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          })
      )
    };
    const { container } = render(<FileExplorer provider={provider} />);

    await screen.findByText('audit.log');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, new File(['x'], 'audit-upload.txt', { type: 'text/plain' }));
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel upload of audit-upload.txt' }));
    expect(await screen.findByText('Upload canceled: audit-upload.txt')).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FileExplorer provider={createProvider()} view="details" sidebar={<span>Sidebar</span>} />
    );

    await screen.findByText('README.md');

    expect(await axe(container)).toHaveNoViolations();
  });

  it('maps the REST provider contract', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ id: 'one', name: 'remote.txt', path: '/remote.txt', type: 'file' }]
    });
    const provider = createRestFileSystemProvider({
      endpoint: 'https://api.example.test/files',
      fetch: fetchMock as unknown as typeof fetch
    });

    const entries = await provider.list('/');

    expect(entries).toEqual([expect.objectContaining({ name: 'remote.txt', path: '/remote.txt' })]);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/files/entries?path=%2F',
      expect.objectContaining({ credentials: 'same-origin' })
    );
  });

  it('maps paginated REST responses and forwards page options', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        entries: [{ id: 'one', name: 'remote.txt', path: '/remote.txt', type: 'file' }],
        total: 10,
        hasMore: true
      })
    });
    const provider = createRestFileSystemProvider({
      endpoint: 'https://api.example.test/files',
      fetch: fetchMock as unknown as typeof fetch
    });

    const result = await provider.list('/', { page: 1, pageSize: 5 });

    expect(result).toEqual({
      entries: [expect.objectContaining({ name: 'remote.txt' })],
      total: 10,
      hasMore: true
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/files/entries?path=%2F&page=1&pageSize=5',
      expect.objectContaining({ credentials: 'same-origin' })
    );
  });
});

describe('FileExplorerDualPane', () => {
  it('renders two panes and navigates them independently', async () => {
    const user = userEvent.setup();

    render(<FileExplorerDualPane provider={createProvider()} ariaLabel="Dual files" />);

    const primary = screen.getByRole('group', { name: 'Primary pane' });
    const secondary = screen.getByRole('group', { name: 'Secondary pane' });

    expect(await within(primary).findByText('README.md')).toBeInTheDocument();
    expect(await within(secondary).findByText('README.md')).toBeInTheDocument();

    await user.dblClick(within(primary).getByText('Documents'));

    expect(await within(primary).findByText('notes.md')).toBeInTheDocument();
    expect(within(primary).queryByText('README.md')).not.toBeInTheDocument();
    expect(within(secondary).getByText('README.md')).toBeInTheDocument();
  });

  it('resizes the split with the keyboard', async () => {
    const user = userEvent.setup();
    const { container } = render(<FileExplorerDualPane provider={createProvider()} />);

    await screen.findAllByText('README.md');

    const separator = screen.getByRole('separator', { name: 'Resize panes' });
    const primaryPane = container.querySelector('[data-pane="primary"]') as HTMLElement;

    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('aria-valuenow', '50');
    expect(separator).toHaveAttribute('aria-valuemin', '10');
    expect(separator).toHaveAttribute('aria-valuemax', '90');
    expect(primaryPane).toHaveStyle({ flexBasis: '50%' });

    separator.focus();
    await user.keyboard('{ArrowRight}');

    expect(separator).toHaveAttribute('aria-valuenow', '55');
    expect(primaryPane).toHaveStyle({ flexBasis: '55%' });

    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}');

    expect(separator).toHaveAttribute('aria-valuenow', '40');
    expect(primaryPane).toHaveStyle({ flexBasis: '40%' });

    await user.keyboard('{Home}');
    expect(separator).toHaveAttribute('aria-valuenow', '10');

    await user.keyboard('{End}');
    expect(separator).toHaveAttribute('aria-valuenow', '90');
  });

  it('moves a dragged entry between panes', async () => {
    const provider = createProvider();
    const move = jest.spyOn(provider, 'move');
    const { container } = render(
      <FileExplorerDualPane
        provider={provider}
        defaultPrimaryPath="/"
        defaultSecondaryPath="/Documents"
      />
    );

    await screen.findByText('README.md');
    await screen.findByText('notes.md');

    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(screen.getByRole('option', { name: /README\.md/ }), { dataTransfer });

    const secondary = container.querySelector('[data-pane="secondary"]') as HTMLElement;
    const explorerRoot = secondary.firstElementChild as HTMLElement;

    fireEvent.dragOver(explorerRoot, { dataTransfer });
    fireEvent.drop(explorerRoot, { dataTransfer });

    await waitFor(() => expect(move).toHaveBeenCalledWith(['/README.md'], '/Documents'));
  });

  it('has no accessibility violations in dual-pane mode', async () => {
    const { container } = render(
      <FileExplorerDualPane
        provider={createProvider()}
        defaultPrimaryPath="/"
        defaultSecondaryPath="/Documents"
      />
    );

    await screen.findByText('README.md');
    await screen.findByText('notes.md');

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('FileExplorer media preview', () => {
  const mediaSeed: FileEntry[] = [
    {
      id: 'track',
      name: 'track.mp3',
      path: '/track.mp3',
      type: 'file',
      mimeType: 'audio/mpeg',
      size: 1024,
      url: 'data:audio/mpeg;base64,AAAA'
    },
    {
      id: 'movie',
      name: 'movie.mp4',
      path: '/movie.mp4',
      type: 'file',
      mimeType: 'video/mp4',
      size: 2048,
      url: 'data:video/mp4;base64,AAAA'
    },
    {
      id: 'manual',
      name: 'manual.pdf',
      path: '/manual.pdf',
      type: 'file',
      mimeType: 'application/pdf',
      size: 4096,
      url: 'data:application/pdf;base64,AAAA'
    },
    {
      id: 'photo',
      name: 'photo.png',
      path: '/photo.png',
      type: 'file',
      size: 512,
      url: 'data:image/png;base64,AAAA'
    }
  ];

  it('renders audio, video, PDF and image previews', async () => {
    const user = userEvent.setup();

    render(<FileExplorer provider={createMemoryFileSystemProvider(mediaSeed)} />);

    await screen.findByText('track.mp3');
    await user.click(screen.getByRole('option', { name: /track\.mp3/ }));
    expect(screen.getByLabelText('track.mp3').tagName).toBe('AUDIO');

    await user.click(screen.getByRole('option', { name: /movie\.mp4/ }));
    expect(screen.getByLabelText('movie.mp4').tagName).toBe('VIDEO');

    await user.click(screen.getByRole('option', { name: /manual\.pdf/ }));
    expect(screen.getByTitle('manual.pdf').tagName).toBe('IFRAME');

    await user.click(screen.getByRole('option', { name: /photo\.png/ }));
    expect(screen.getByAltText('photo.png').tagName).toBe('IMG');
  });

  it('falls back to the empty message for unsupported files', async () => {
    const user = userEvent.setup();

    render(
      <FileExplorer
        provider={createMemoryFileSystemProvider([
          {
            id: 'archive',
            name: 'archive.zip',
            path: '/archive.zip',
            type: 'file',
            mimeType: 'application/zip',
            size: 10
          }
        ])}
      />
    );

    await screen.findByText('archive.zip');
    await user.click(screen.getByRole('option', { name: /archive\.zip/ }));

    expect(screen.getByText('No preview available')).toBeInTheDocument();
  });
});
