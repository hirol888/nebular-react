import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  FileExplorer,
  FileExplorerDualPane,
  createMemoryFileSystemProvider,
  createRestFileSystemProvider,
  type FileEntry
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

function createProvider() {
  return createMemoryFileSystemProvider(seed);
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
