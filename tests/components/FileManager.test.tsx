import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { FileManager, FileNode } from '@nebular-react/core';

const formatDate = (value: Date | string | number) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

const items: FileNode[] = [
  {
    id: 'docs',
    name: 'Documents',
    type: 'folder',
    modifiedAt: new Date('2024-03-15T12:00:00Z'),
    children: [
      {
        id: 'report',
        name: 'report.pdf',
        type: 'file',
        size: 1536,
        modifiedAt: new Date('2024-03-14T12:00:00Z')
      },
      { id: 'notes', name: 'notes.txt', type: 'file', size: 2048 }
    ]
  },
  {
    id: 'photo',
    name: 'photo.png',
    type: 'file',
    size: 2 * 1024 * 1024,
    modifiedAt: '2024-01-02T12:00:00Z'
  }
];

const selectionItems: FileNode[] = [
  { id: 'alpha', name: 'Alpha.txt', type: 'file', size: 10 },
  { id: 'beta', name: 'Beta.txt', type: 'file', size: 20 },
  { id: 'gamma', name: 'Gamma.txt', type: 'file', size: 30 },
  { id: 'delta', name: 'Delta.txt', type: 'file', size: 40 }
];

const dndItems: FileNode[] = [
  {
    id: 'folder-alpha',
    name: 'Alpha folder',
    type: 'folder',
    modifiedAt: '2024-01-01T00:00:00Z',
    children: []
  },
  {
    id: 'folder-beta',
    name: 'Beta folder',
    type: 'folder',
    modifiedAt: '2024-01-02T00:00:00Z',
    children: []
  },
  { id: 'one', name: 'one.txt', type: 'file', size: 10, modifiedAt: '2024-01-03T00:00:00Z' },
  { id: 'two', name: 'two.txt', type: 'file', size: 20, modifiedAt: '2024-01-04T00:00:00Z' }
];

const sortItems: FileNode[] = [
  { id: 'zebra', name: 'zebra.txt', type: 'file', size: 1, modifiedAt: '2024-01-03T00:00:00Z' },
  {
    id: 'zeta-folder',
    name: 'Zeta',
    type: 'folder',
    modifiedAt: '2024-01-01T00:00:00Z',
    children: []
  },
  { id: 'apple', name: 'apple.txt', type: 'file', size: 3, modifiedAt: '2024-01-02T00:00:00Z' },
  { id: 'banana', name: 'banana.txt', type: 'file', size: 2, modifiedAt: '2024-01-01T00:00:00Z' }
];

const localeItems: FileNode[] = [
  { id: 'upper-zebra', name: 'Zebra.txt', type: 'file', size: 1 },
  { id: 'lower-banana', name: 'banana.txt', type: 'file', size: 1 },
  { id: 'accent', name: 'Árvore.txt', type: 'file', size: 1 }
];

const previewItems: FileNode[] = [
  {
    id: 'preview-photo',
    name: 'photo.png',
    type: 'file',
    url: 'https://cdn.example/photo.png'
  },
  {
    id: 'preview-notes',
    name: 'notes.txt',
    type: 'file',
    url: 'https://cdn.example/notes.txt'
  },
  {
    id: 'preview-readme',
    name: 'readme.md',
    type: 'file',
    url: 'https://cdn.example/readme.md'
  },
  {
    id: 'preview-docs',
    name: 'Documents',
    type: 'folder',
    children: [{ id: 'preview-report', name: 'report.pdf', type: 'file', size: 10 }]
  }
];

const readOptionTexts = () =>
  within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((option) => option.textContent ?? '');

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('FileManager', () => {
  it('FileManager_Render_ShouldShowItemsWithFormattedMeta', () => {
    render(<FileManager items={items} />);

    expect(screen.getByRole('listbox', { name: 'File manager' })).toHaveAttribute(
      'data-view',
      'list'
    );
    expect(screen.getByRole('option', { name: /Documents/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /photo\.png/ })).toBeInTheDocument();
    expect(screen.getByText('2 MB')).toBeInTheDocument();
    expect(screen.getByText(formatDate('2024-01-02T12:00:00Z'))).toBeInTheDocument();
  });

  it('FileManager_OpenFolder_ShouldNavigateAndUpdateBreadcrumb', async () => {
    const user = userEvent.setup();
    const onOpen = jest.fn();

    render(<FileManager items={items} onOpen={onOpen} />);

    await user.dblClick(screen.getByRole('option', { name: /Documents/ }));

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen.mock.calls[0][0]).toMatchObject({ id: 'docs' });
    expect(screen.getByRole('option', { name: /report\.pdf/ })).toBeInTheDocument();
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /photo\.png/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All files' }));

    expect(screen.getByRole('option', { name: /photo\.png/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /report\.pdf/ })).not.toBeInTheDocument();
  });

  it('FileManager_Keyboard_ShouldSelectWithSpaceAndOpenWithEnter', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const onOpen = jest.fn();

    render(<FileManager items={items} onSelect={onSelect} onOpen={onOpen} />);

    const folder = screen.getByRole('option', { name: /Documents/ });
    folder.focus();

    await user.keyboard(' ');

    expect(onSelect).toHaveBeenCalledWith('docs', expect.objectContaining({ id: 'docs' }));

    await user.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'docs' }));
    expect(screen.getByRole('option', { name: /report\.pdf/ })).toBeInTheDocument();
  });

  it('FileManager_Select_ShouldNotifyAndMarkSelectedItem', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<FileManager items={items} onSelect={onSelect} />);

    const file = screen.getByRole('option', { name: /photo\.png/ });

    await user.click(file);

    expect(onSelect).toHaveBeenCalledWith('photo', expect.objectContaining({ id: 'photo' }));
    expect(file).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: /Documents/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('FileManager_Value_ShouldFollowControlledSelection', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    const { rerender } = render(<FileManager items={items} value="docs" onSelect={onSelect} />);

    expect(screen.getByRole('option', { name: /Documents/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await user.click(screen.getByRole('option', { name: /photo\.png/ }));

    expect(onSelect).toHaveBeenCalled();
    expect(screen.getByRole('option', { name: /photo\.png/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );

    rerender(<FileManager items={items} value="photo" onSelect={onSelect} />);

    expect(screen.getByRole('option', { name: /photo\.png/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('FileManager_Search_ShouldFilterCurrentFolder', async () => {
    const user = userEvent.setup();

    render(<FileManager items={items} />);

    const search = screen.getByRole('searchbox', { name: 'Search files' });

    await user.type(search, 'photo');

    expect(screen.getByRole('option', { name: /photo\.png/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Documents/ })).not.toBeInTheDocument();

    await user.clear(search);

    expect(screen.getByRole('option', { name: /Documents/ })).toBeInTheDocument();
  });

  it('FileManager_Search_ShouldShowEmptyStateWhenNothingMatches', async () => {
    const user = userEvent.setup();

    render(<FileManager items={items} />);

    await user.type(screen.getByRole('searchbox', { name: 'Search files' }), 'zzz');

    expect(screen.getByText('No matching files')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('FileManager_SearchableFalse_ShouldHideSearchField', () => {
    render(<FileManager items={items} searchable={false} />);

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('FileManager_Actions_ShouldCallHandlersForSelectedItem', async () => {
    const user = userEvent.setup();
    const onCreateFolder = jest.fn();
    const onDelete = jest.fn();
    const onRename = jest.fn();

    render(
      <FileManager
        items={items}
        onCreateFolder={onCreateFolder}
        onDelete={onDelete}
        onRename={onRename}
      />
    );

    await user.click(screen.getByRole('button', { name: 'New folder' }));
    expect(onCreateFolder).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rename' })).toBeDisabled();

    await user.click(screen.getByRole('option', { name: /photo\.png/ }));

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'photo' }));

    await user.click(screen.getByRole('button', { name: 'Rename' }));

    const input = screen.getByLabelText('New name for photo.png');
    await user.clear(input);
    await user.type(input, 'vacation.png{Enter}');

    expect(onRename).toHaveBeenCalledWith(expect.objectContaining({ id: 'photo' }), 'vacation.png');
  });

  it('FileManager_Rename_ShouldCancelWithEscape', async () => {
    const user = userEvent.setup();
    const onRename = jest.fn();

    render(<FileManager items={items} onRename={onRename} />);

    await user.click(screen.getByRole('option', { name: /photo\.png/ }));
    await user.click(screen.getByRole('button', { name: 'Rename' }));

    const input = screen.getByLabelText('New name for photo.png');
    await user.type(input, 'ignored{Escape}');

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('New name for photo.png')).not.toBeInTheDocument();
  });

  it('FileManager_Grid_ShouldApplyGridView', () => {
    render(<FileManager items={items} view="grid" />);

    expect(screen.getByRole('listbox')).toHaveAttribute('data-view', 'grid');
  });

  it('FileManager_Empty_ShouldRenderDefaultAndCustomEmptyState', () => {
    const { rerender } = render(<FileManager items={[]} />);

    expect(screen.getByText('This folder is empty')).toBeInTheDocument();

    rerender(<FileManager items={[]} emptyState={<span>Nothing here</span>} />);

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('FileManager_BreadcrumbAndActions_ShouldRenderCustomContent', () => {
    render(
      <FileManager
        items={items}
        breadcrumb={<span>My drive</span>}
        actions={<button type="button">Upload</button>}
      />
    );

    expect(screen.getByText('My drive')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
  });

  it('FileManager_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <FileManager
        items={items}
        onSelect={jest.fn()}
        onOpen={jest.fn()}
        onCreateFolder={jest.fn()}
        onDelete={jest.fn()}
        onRename={jest.fn()}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('FileManager_MultiSelect_ShouldToggleWithCtrlClick', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    const onSelect = jest.fn();

    render(
      <FileManager
        items={selectionItems}
        selectable
        onSelectionChange={onSelectionChange}
        onSelect={onSelect}
      />
    );

    const alpha = screen.getByRole('option', { name: /Alpha\.txt/ });
    const beta = screen.getByRole('option', { name: /Beta\.txt/ });

    await user.click(alpha);

    expect(onSelectionChange).toHaveBeenLastCalledWith(['alpha']);
    expect(onSelect).toHaveBeenLastCalledWith('alpha', expect.objectContaining({ id: 'alpha' }));

    await user.keyboard('{Control>}');
    await user.click(beta);
    await user.keyboard('{/Control}');

    expect(onSelectionChange).toHaveBeenLastCalledWith(['alpha', 'beta']);
    expect(alpha).toHaveAttribute('aria-selected', 'true');
    expect(beta).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('2 selected');

    await user.keyboard('{Control>}');
    await user.click(alpha);
    await user.keyboard('{/Control}');

    expect(onSelectionChange).toHaveBeenLastCalledWith(['beta']);
    expect(alpha).toHaveAttribute('aria-selected', 'false');
  });

  it('FileManager_ShiftClick_ShouldSelectRange', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(<FileManager items={selectionItems} selectable onSelectionChange={onSelectionChange} />);

    await user.click(screen.getByRole('option', { name: /Alpha\.txt/ }));

    await user.keyboard('{Shift>}');
    await user.click(screen.getByRole('option', { name: /Gamma\.txt/ }));
    await user.keyboard('{/Shift}');

    expect(onSelectionChange).toHaveBeenLastCalledWith(['alpha', 'beta', 'gamma']);
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');
  });

  it('FileManager_SelectionModeSingle_ShouldKeepOnlyOneSelectedKey', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(
      <FileManager
        items={selectionItems}
        selectable
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      />
    );

    await user.click(screen.getByRole('option', { name: /Alpha\.txt/ }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['alpha']);

    await user.keyboard('{Control>}');
    await user.click(screen.getByRole('option', { name: /Gamma\.txt/ }));
    await user.keyboard('{/Control}');

    expect(onSelectionChange).toHaveBeenLastCalledWith(['gamma']);
  });

  it('FileManager_SelectedKeys_ShouldFollowControlledSelection', () => {
    const { rerender } = render(
      <FileManager items={selectionItems} selectable selectedKeys={['alpha', 'gamma']} />
    );

    expect(screen.getByRole('option', { name: /Alpha\.txt/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('option', { name: /Beta\.txt/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('status')).toHaveTextContent('2 selected');

    rerender(<FileManager items={selectionItems} selectable selectedKeys={['beta']} />);

    expect(screen.getByRole('option', { name: /Beta\.txt/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('option', { name: /Alpha\.txt/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('FileManager_DefaultSelectedKeys_ShouldStartWithProvidedSelection', () => {
    render(
      <FileManager items={selectionItems} selectable defaultSelectedKeys={['beta', 'delta']} />
    );

    expect(screen.getByRole('option', { name: /Beta\.txt/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('option', { name: /Delta\.txt/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('option', { name: /Alpha\.txt/ })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByRole('status')).toHaveTextContent('2 selected');
  });

  it('FileManager_SelectAll_ShouldToggleVisibleItemsWithIndeterminateState', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(<FileManager items={selectionItems} selectable onSelectionChange={onSelectionChange} />);

    const selectAll = screen.getByRole('checkbox', { name: 'Select all files' });

    await user.click(selectAll);

    expect(onSelectionChange).toHaveBeenLastCalledWith(['alpha', 'beta', 'gamma', 'delta']);
    expect(selectAll).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('4 selected');
    expect(screen.getByRole('checkbox', { name: 'Select Alpha.txt' })).toHaveAttribute(
      'aria-checked',
      'true'
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select Beta.txt' }));

    expect(onSelectionChange).toHaveBeenLastCalledWith(['alpha', 'gamma', 'delta']);
    expect(selectAll).toBePartiallyChecked();
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');

    await user.click(selectAll);

    expect(onSelectionChange).toHaveBeenLastCalledWith(['alpha', 'beta', 'gamma', 'delta']);
    expect(selectAll).toBeChecked();

    await user.click(selectAll);

    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole('status')).toHaveTextContent('0 selected');
  });

  it('FileManager_BatchActions_ShouldPassSelectedNodesAndAllowClearing', async () => {
    const user = userEvent.setup();
    const onBatchDelete = jest.fn();
    const onBatchDownload = jest.fn();

    render(
      <FileManager
        items={selectionItems}
        selectable
        onBatchDelete={onBatchDelete}
        onBatchDownload={onBatchDownload}
      />
    );

    expect(screen.getByRole('button', { name: 'Delete selected' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Download selected' })).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'Select Alpha.txt' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select Gamma.txt' }));

    await user.click(screen.getByRole('button', { name: 'Download selected' }));

    expect(onBatchDownload).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'alpha' }),
      expect.objectContaining({ id: 'gamma' })
    ]);

    await user.click(screen.getByRole('button', { name: 'Delete selected' }));

    expect(onBatchDelete).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'alpha' }),
      expect.objectContaining({ id: 'gamma' })
    ]);

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(screen.getByRole('status')).toHaveTextContent('0 selected');
  });

  it('FileManager_Upload_ShouldReportProgressAndAddCompletedItem', async () => {
    const onUploadComplete = jest.fn();
    const file = new File(['hello'], 'upload.txt', { type: 'text/plain' });
    let reportProgress: ((percent: number) => void) | undefined;
    let resolveUpload: ((item: FileNode) => void) | undefined;

    const uploadFile = jest.fn(
      (_file: File, onProgress: (percent: number) => void) =>
        new Promise<FileNode | void>((resolve) => {
          reportProgress = onProgress;
          resolveUpload = resolve;
        })
    );

    render(<FileManager items={[]} uploadFile={uploadFile} onUploadComplete={onUploadComplete} />);

    fireEvent.drop(screen.getByRole('button', { name: 'Upload files' }), {
      dataTransfer: { files: [file] }
    });

    expect(uploadFile).toHaveBeenCalledWith(file, expect.any(Function));
    expect(screen.getByText('upload.txt')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Uploading upload.txt' })).toHaveAttribute(
      'aria-valuenow',
      '0'
    );

    act(() => reportProgress?.(40));

    expect(screen.getByRole('progressbar', { name: 'Uploading upload.txt' })).toHaveAttribute(
      'aria-valuenow',
      '40'
    );

    await act(async () => {
      resolveUpload?.({ id: 'uploaded-1', name: 'upload.txt', type: 'file', size: 5 });
    });

    expect(onUploadComplete).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'uploaded-1', name: 'upload.txt' })
    ]);
    expect(screen.getByRole('option', { name: /upload\.txt/ })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
  });

  it('FileManager_Upload_ShouldSynthesizeItemWhenUploadResolvesVoid', async () => {
    const onUploadComplete = jest.fn();
    const file = new File(['abc'], 'void-upload.txt', { type: 'text/plain' });
    const uploadFile = jest.fn(() => Promise.resolve());

    render(<FileManager items={[]} uploadFile={uploadFile} onUploadComplete={onUploadComplete} />);

    fireEvent.drop(screen.getByRole('button', { name: 'Upload files' }), {
      dataTransfer: { files: [file] }
    });

    await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));

    expect(onUploadComplete.mock.calls[0][0]).toEqual([
      expect.objectContaining({ name: 'void-upload.txt', type: 'file', size: 3 })
    ]);
    expect(screen.getByRole('option', { name: /void-upload\.txt/ })).toBeInTheDocument();
  });

  it('FileManager_Upload_ShouldReportErrorAndSupportCancel', async () => {
    const user = userEvent.setup();
    const onUploadComplete = jest.fn();
    const onUploadError = jest.fn();
    const failingFile = new File(['x'], 'broken.bin', { type: 'application/octet-stream' });
    const pendingFile = new File(['y'], 'slow.bin', { type: 'application/octet-stream' });
    let resolveSlow: ((item: FileNode) => void) | undefined;

    const uploadFile = jest.fn((file: File, _onProgress: (percent: number) => void) => {
      if (file.name === 'broken.bin') {
        return Promise.reject(new Error('Network down'));
      }

      return new Promise<FileNode | void>((resolve) => {
        resolveSlow = resolve;
      });
    });

    render(
      <FileManager
        items={[]}
        uploadFile={uploadFile}
        onUploadComplete={onUploadComplete}
        onUploadError={onUploadError}
      />
    );

    fireEvent.drop(screen.getByRole('button', { name: 'Upload files' }), {
      dataTransfer: { files: [failingFile, pendingFile] }
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Network down'));

    expect(onUploadError).toHaveBeenCalledWith(failingFile, expect.any(Error));
    expect(screen.getAllByText('Upload failed').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Cancel upload of slow.bin' }));

    expect(
      screen.queryByRole('progressbar', { name: 'Uploading slow.bin' })
    ).not.toBeInTheDocument();

    await act(async () => {
      resolveSlow?.({ id: 'slow', name: 'slow.bin', type: 'file', size: 1 });
    });

    expect(onUploadComplete).not.toHaveBeenCalled();
    expect(screen.queryByRole('option', { name: /slow\.bin/ })).not.toBeInTheDocument();
  });

  it('FileManager_Upload_ShouldConfigureAcceptAndMultiple', () => {
    const { container } = render(
      <FileManager items={[]} uploadFile={jest.fn()} accept=".pdf" multiple={false} />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input).toHaveAttribute('accept', '.pdf');
    expect(input).not.toHaveAttribute('multiple');
  });

  it('FileManager_ContextMenu_ShouldOpenAndRunBuiltInActions', async () => {
    const user = userEvent.setup();
    const onContextMenu = jest.fn();
    const onDownload = jest.fn();
    const onDelete = jest.fn();
    const onRename = jest.fn();

    render(
      <FileManager
        items={items}
        onContextMenu={onContextMenu}
        onDownload={onDownload}
        onDelete={onDelete}
        onRename={onRename}
      />
    );

    const photo = screen.getByRole('option', { name: /photo\.png/ });

    fireEvent.contextMenu(photo, { clientX: 20, clientY: 30 });

    expect(onContextMenu).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'photo' }),
      expect.anything()
    );
    expect(screen.getByRole('menu', { name: 'Actions for photo.png' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus();

    await user.click(screen.getByRole('menuitem', { name: 'Download' }));

    expect(onDownload).toHaveBeenCalledWith(expect.objectContaining({ id: 'photo' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.contextMenu(photo);
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));

    const renameInput = screen.getByLabelText('New name for photo.png');

    await user.clear(renameInput);
    await user.type(renameInput, 'screenshot.png{Enter}');

    expect(onRename).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'photo' }),
      'screenshot.png'
    );

    fireEvent.contextMenu(photo);
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Delete photo.png?' });

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'photo' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('FileManager_ContextMenu_ShouldConfirmCancelDelete', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    render(<FileManager items={items} onDelete={onDelete} />);

    fireEvent.contextMenu(screen.getByRole('option', { name: /photo\.png/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Delete photo.png?' });

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('FileManager_ContextMenu_Keyboard_ShouldNavigateAndCloseOnEscape', () => {
    render(<FileManager items={items} onRename={jest.fn()} onDelete={jest.fn()} />);

    const photo = screen.getByRole('option', { name: /photo\.png/ });
    photo.focus();

    fireEvent.keyDown(photo, { key: 'F10', shiftKey: true });

    const open = screen.getByRole('menuitem', { name: 'Open' });
    const rename = screen.getByRole('menuitem', { name: 'Rename' });

    expect(open).toHaveFocus();

    fireEvent.keyDown(open, { key: 'ArrowDown' });
    expect(rename).toHaveFocus();

    fireEvent.keyDown(rename, { key: 'ArrowUp' });
    expect(open).toHaveFocus();

    fireEvent.keyDown(open, { key: 'End' });
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Delete' }), { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(photo).toHaveFocus();
  });

  it('FileManager_ContextMenu_ShouldOpenWithContextMenuKeyAndCloseOnOutsideClick', () => {
    render(<FileManager items={items} onRename={jest.fn()} />);

    const photo = screen.getByRole('option', { name: /photo\.png/ });
    photo.focus();

    fireEvent.keyDown(photo, { key: 'ContextMenu' });

    expect(screen.getByRole('menu', { name: 'Actions for photo.png' })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('FileManager_RenderContextMenu_ShouldReplaceBuiltInItemsAndClose', async () => {
    const user = userEvent.setup();
    const renderContextMenu = jest.fn((node: FileNode, close: () => void) => (
      <button type="button" role="menuitem" onClick={close}>
        Custom action for {node.name}
      </button>
    ));

    render(<FileManager items={items} renderContextMenu={renderContextMenu} />);

    fireEvent.contextMenu(screen.getByRole('option', { name: /photo\.png/ }));

    expect(renderContextMenu).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'photo' }),
      expect.any(Function)
    );
    expect(screen.queryByRole('menuitem', { name: 'Open' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Custom action for photo.png' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('FileManager_A11y_ShouldHaveNoViolationsWithSelectionUploadAndContextMenu', async () => {
    const uploadFile = jest.fn(
      (_file: File, _onProgress: (percent: number) => void) =>
        new Promise<FileNode | void>(() => {
          // Never resolves: keeps the progress state visible for the a11y check.
        })
    );

    const { container } = render(
      <FileManager
        items={selectionItems}
        selectable
        onSelectionChange={jest.fn()}
        onRename={jest.fn()}
        onDelete={jest.fn()}
        onDownload={jest.fn()}
        onBatchDelete={jest.fn()}
        onBatchDownload={jest.fn()}
        uploadFile={uploadFile}
      />
    );

    fireEvent.drop(screen.getByRole('button', { name: 'Upload files' }), {
      dataTransfer: { files: [new File(['data'], 'accessible.txt', { type: 'text/plain' })] }
    });
    fireEvent.contextMenu(screen.getByRole('option', { name: /Beta\.txt/ }));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('FileManager_DragAndDrop_ShouldOnlyEnableDraggingWhenRequested', () => {
    const onMove = jest.fn();
    const { rerender } = render(<FileManager items={dndItems} onMove={onMove} />);

    expect(screen.getByRole('option', { name: /one\.txt/ })).not.toHaveAttribute('draggable');

    rerender(<FileManager items={dndItems} draggable onMove={onMove} />);

    expect(screen.getByRole('option', { name: /one\.txt/ })).toHaveAttribute('draggable', 'true');
  });

  it('FileManager_DragAndDrop_ShouldMoveSelectedNodesToFolder', () => {
    const onMove = jest.fn();
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: jest.fn(),
      getData: jest.fn(() => '')
    };

    render(
      <FileManager
        items={dndItems}
        draggable
        selectable
        defaultSelectedKeys={['one', 'two']}
        onMove={onMove}
      />
    );

    const one = screen.getByRole('option', { name: /one\.txt/ });
    const alpha = screen.getByRole('option', { name: /Alpha folder/ });

    fireEvent.dragStart(one, { dataTransfer });

    expect(screen.getByRole('status', { name: 'Drag and drop status' })).toHaveTextContent(
      'Moving 2 items'
    );

    fireEvent.dragOver(alpha, { dataTransfer });

    expect(alpha).toHaveAttribute('data-drop-target', 'true');
    expect(screen.getByRole('status', { name: 'Drag and drop status' })).toHaveTextContent(
      'Move 2 items to Alpha folder'
    );

    fireEvent.drop(alpha, { dataTransfer });

    expect(onMove).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'one' }), expect.objectContaining({ id: 'two' })],
      'folder-alpha'
    );
    expect(alpha).not.toHaveAttribute('data-drop-target');
  });

  it('FileManager_DragAndDrop_ShouldRejectInvalidDropTargets', () => {
    const onMove = jest.fn();
    const dataTransfer = { effectAllowed: '', dropEffect: '', setData: jest.fn() };

    render(<FileManager items={dndItems} draggable onMove={onMove} />);

    const alpha = screen.getByRole('option', { name: /Alpha folder/ });
    const one = screen.getByRole('option', { name: /one\.txt/ });

    fireEvent.dragStart(alpha, { dataTransfer });
    fireEvent.dragOver(alpha, { dataTransfer });

    expect(alpha).not.toHaveAttribute('data-drop-target');
    expect(screen.getByRole('status', { name: 'Drag and drop status' })).toHaveTextContent(
      'Cannot move items into Alpha folder'
    );

    fireEvent.drop(alpha, { dataTransfer });

    expect(onMove).not.toHaveBeenCalled();

    fireEvent.dragStart(alpha, { dataTransfer });
    fireEvent.dragOver(one, { dataTransfer });

    expect(one).not.toHaveAttribute('data-drop-target');

    fireEvent.drop(one, { dataTransfer });

    expect(onMove).not.toHaveBeenCalled();
  });

  it('FileManager_DragAndDrop_Keyboard_ShouldCutAndPasteIntoSelectedFolder', async () => {
    const user = userEvent.setup();
    const onMove = jest.fn();

    render(<FileManager items={dndItems} draggable onMove={onMove} />);

    const one = screen.getByRole('option', { name: /one\.txt/ });

    one.focus();
    fireEvent.keyDown(one, { key: 'x', ctrlKey: true });

    expect(one).toHaveAttribute('data-cut', 'true');
    expect(screen.getByText('Cut 1 item')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: /Alpha folder/ }));
    fireEvent.keyDown(screen.getByRole('option', { name: /Alpha folder/ }), {
      key: 'v',
      ctrlKey: true
    });

    expect(onMove).toHaveBeenCalledWith([expect.objectContaining({ id: 'one' })], 'folder-alpha');
    expect(one).not.toHaveAttribute('data-cut');
  });

  it('FileManager_DragAndDrop_Keyboard_ShouldRejectPasteWithoutFolderTarget', () => {
    const onMove = jest.fn();

    render(<FileManager items={dndItems} draggable onMove={onMove} />);

    const one = screen.getByRole('option', { name: /one\.txt/ });

    one.focus();
    fireEvent.keyDown(one, { key: 'x', metaKey: true });
    fireEvent.keyDown(one, { key: 'v', metaKey: true });

    expect(onMove).not.toHaveBeenCalled();
    expect(screen.getByText('Select a folder to paste into')).toBeInTheDocument();
  });

  it('FileManager_DragAndDrop_Keyboard_ShouldRejectPasteIntoCutFolder', async () => {
    const user = userEvent.setup();
    const onMove = jest.fn();

    render(<FileManager items={dndItems} draggable onMove={onMove} />);

    await user.click(screen.getByRole('option', { name: /Alpha folder/ }));

    const alpha = screen.getByRole('option', { name: /Alpha folder/ });

    fireEvent.keyDown(alpha, { key: 'x', ctrlKey: true });
    fireEvent.keyDown(alpha, { key: 'v', ctrlKey: true });

    expect(onMove).not.toHaveBeenCalled();
    expect(screen.getByText('Cannot move items into Alpha folder')).toBeInTheDocument();
  });

  it('FileManager_Sorting_ShouldSortByNameWithFoldersFirst', () => {
    render(<FileManager items={sortItems} defaultSortBy="name" />);

    const texts = readOptionTexts();

    expect(texts[0]).toContain('Zeta');
    expect(texts[1]).toContain('apple.txt');
    expect(texts[2]).toContain('banana.txt');
    expect(texts[3]).toContain('zebra.txt');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('name');
    expect(screen.getByRole('button', { name: 'Sort direction: ascending' })).toBeInTheDocument();
  });

  it('FileManager_Sorting_ShouldRespectLocaleCompare', () => {
    render(<FileManager items={localeItems} defaultSortBy="name" />);

    const texts = readOptionTexts();

    expect(texts[0]).toContain('Árvore.txt');
    expect(texts[1]).toContain('banana.txt');
    expect(texts[2]).toContain('Zebra.txt');
  });

  it('FileManager_Sorting_ShouldToggleDirectionAndNotify', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();

    render(<FileManager items={sortItems} onSortChange={onSortChange} />);

    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveValue('');
    expect(readOptionTexts()[0]).toContain('zebra.txt');

    await user.click(screen.getByRole('button', { name: 'Sort direction: ascending' }));

    expect(onSortChange).toHaveBeenLastCalledWith({ by: 'name', direction: 'asc' });

    let texts = readOptionTexts();

    expect(texts[0]).toContain('Zeta');
    expect(texts[1]).toContain('apple.txt');
    expect(texts[2]).toContain('banana.txt');
    expect(texts[3]).toContain('zebra.txt');

    await user.click(screen.getByRole('button', { name: 'Sort direction: ascending' }));

    expect(onSortChange).toHaveBeenLastCalledWith({ by: 'name', direction: 'desc' });

    texts = readOptionTexts();

    expect(texts[0]).toContain('Zeta');
    expect(texts[1]).toContain('zebra.txt');
    expect(texts[2]).toContain('banana.txt');
    expect(texts[3]).toContain('apple.txt');
    expect(screen.getByRole('button', { name: 'Sort direction: descending' })).toBeInTheDocument();
  });

  it('FileManager_Sorting_ShouldSortBySizeAndNotify', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();

    render(<FileManager items={sortItems} onSortChange={onSortChange} />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'size');

    expect(onSortChange).toHaveBeenLastCalledWith({ by: 'size', direction: 'asc' });

    const texts = readOptionTexts();

    expect(texts[0]).toContain('Zeta');
    expect(texts[1]).toContain('zebra.txt');
    expect(texts[2]).toContain('banana.txt');
    expect(texts[3]).toContain('apple.txt');
  });

  it('FileManager_Sorting_ShouldRespectDefaultSort', () => {
    render(<FileManager items={sortItems} defaultSortBy="modified" defaultSortDirection="desc" />);

    const texts = readOptionTexts();

    expect(texts[0]).toContain('Zeta');
    expect(texts[1]).toContain('zebra.txt');
    expect(texts[2]).toContain('apple.txt');
    expect(texts[3]).toContain('banana.txt');
  });

  it('FileManager_Sorting_ShouldKeepSearchAndSelectionIntact', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(
      <FileManager
        items={sortItems}
        selectable
        defaultSelectedKeys={['banana']}
        onSelectionChange={onSelectionChange}
      />
    );

    expect(screen.getByRole('option', { name: /banana\.txt/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'size');

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(screen.getByRole('option', { name: /banana\.txt/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await user.type(screen.getByRole('searchbox', { name: 'Search files' }), 'zeb');

    expect(readOptionTexts()).toHaveLength(1);
    expect(readOptionTexts()[0]).toContain('zebra.txt');
  });

  it('FileManager_Preview_ShouldBeOptIn', () => {
    render(<FileManager items={previewItems} defaultSelectedKeys={['preview-photo']} />);

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('FileManager_Preview_ShouldRenderCustomPreviewAndClose', async () => {
    const user = userEvent.setup();
    const onPreview = jest.fn();
    const renderPreview = jest.fn((node: FileNode) => <div>Custom preview for {node.name}</div>);

    render(
      <FileManager
        items={previewItems}
        preview
        defaultSelectedKeys={['preview-photo']}
        renderPreview={renderPreview}
        onPreview={onPreview}
      />
    );

    const panel = screen.getByRole('region', { name: 'Preview of photo.png' });

    expect(within(panel).getByText('Custom preview for photo.png')).toBeInTheDocument();
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ id: 'preview-photo' }));

    const close = within(panel).getByRole('button', { name: 'Close preview of photo.png' });

    expect(close).toHaveFocus();

    await user.click(close);

    expect(screen.queryByRole('region', { name: 'Preview of photo.png' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /photo\.png/ })).toHaveFocus();
  });

  it('FileManager_Preview_ShouldFallbackToImageThumbnail', () => {
    render(<FileManager items={previewItems} preview defaultSelectedKeys={['preview-photo']} />);

    expect(screen.getByRole('img', { name: 'photo.png' })).toHaveAttribute(
      'src',
      'https://cdn.example/photo.png'
    );
    expect(screen.getByRole('button', { name: 'Close preview of photo.png' })).toHaveFocus();
  });

  it('FileManager_Preview_ShouldFetchTextWithAbortSignal', async () => {
    let resolvePreview: ((value: string) => void) | undefined;
    const fetchMock = jest.fn(
      () =>
        new Promise((resolve) => {
          resolvePreview = (text: string) =>
            resolve({ ok: true, status: 200, text: () => Promise.resolve(text) });
        })
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<FileManager items={previewItems} preview defaultSelectedKeys={['preview-notes']} />);

    expect(screen.getByRole('status', { name: 'Preview status' })).toHaveTextContent(
      'Loading preview'
    );

    await act(async () => {
      resolvePreview?.('First lines of the file');
    });

    expect(screen.getByText('First lines of the file')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cdn.example/notes.txt',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('FileManager_Preview_ShouldShowErrorWhenFetchFails', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network down'))
    ) as unknown as typeof fetch;

    render(<FileManager items={previewItems} preview defaultSelectedKeys={['preview-readme']} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Network down');
  });

  it('FileManager_Preview_ShouldAbortPendingRequestOnUnmount', () => {
    let signal: AbortSignal | undefined;

    global.fetch = jest.fn((_url: string, init?: RequestInit) => {
      signal = init?.signal ?? undefined;
      return new Promise(() => {});
    }) as unknown as typeof fetch;

    const { unmount } = render(
      <FileManager items={previewItems} preview defaultSelectedKeys={['preview-notes']} />
    );

    expect(signal).toBeDefined();

    unmount();

    expect(signal?.aborted).toBe(true);
  });

  it('FileManager_Preview_ShouldReadFileTextWhenAvailable', async () => {
    const localFile = new File(['local file body'], 'local.txt', { type: 'text/plain' });

    Object.defineProperty(localFile, 'text', { value: () => Promise.resolve('local file body') });

    render(
      <FileManager
        items={[{ id: 'local', name: 'local.txt', type: 'file', file: localFile }]}
        preview
        defaultSelectedKeys={['local']}
      />
    );

    expect(await screen.findByText('local file body')).toBeInTheDocument();
  });

  it('FileManager_Preview_ShouldSummarizeFolders', () => {
    render(<FileManager items={previewItems} preview defaultSelectedKeys={['preview-docs']} />);

    expect(screen.getByText('Folder · 1 item')).toBeInTheDocument();
  });

  it('FileManager_Preview_ShouldCloseWithEscapeAndRestoreFocus', () => {
    render(<FileManager items={previewItems} preview defaultSelectedKeys={['preview-photo']} />);

    const close = screen.getByRole('button', { name: 'Close preview of photo.png' });

    fireEvent.keyDown(close, { key: 'Escape' });

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /photo\.png/ })).toHaveFocus();
  });

  it('FileManager_A11y_ShouldHaveNoViolationsWithDragSortAndPreview', async () => {
    const { container } = render(
      <FileManager
        items={dndItems}
        draggable
        selectable
        preview
        defaultSelectedKeys={['one']}
        onMove={jest.fn()}
        onSelectionChange={jest.fn()}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
