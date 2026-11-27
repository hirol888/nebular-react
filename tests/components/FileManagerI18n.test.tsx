import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import { FileManager, FileNode } from '@nebular-react/core';

const items: FileNode[] = [
  {
    id: 'docs',
    name: 'Documents',
    type: 'folder',
    children: [{ id: 'notes', name: 'notes.txt', type: 'file', size: 10 }]
  },
  { id: 'photo', name: 'photo.png', type: 'file', size: 2048 }
];

const pendingUpload = jest.fn(
  (_file: File, _onProgress: (percent: number) => void) =>
    new Promise<FileNode | void>(() => {
      // Never resolves: keeps the upload panel in the "uploading" state.
    })
);

const openPhotoContextMenu = () => {
  fireEvent.contextMenu(screen.getByRole('option', { name: /photo\.png/ }));
};

const dropFile = () => {
  fireEvent.drop(screen.getByRole('button', { name: /^(Upload files|Enviar)$/ }), {
    dataTransfer: { files: [new File(['data'], 'upload.txt', { type: 'text/plain' })] }
  });
};

describe('FileManager i18n', () => {
  it('uses English defaults without a provider', async () => {
    const user = userEvent.setup();

    render(
      <FileManager
        items={items}
        selectable
        onCreateFolder={jest.fn()}
        onRename={jest.fn()}
        onDelete={jest.fn()}
        onDownload={jest.fn()}
        uploadFile={pendingUpload}
      />
    );

    expect(screen.getByRole('searchbox', { name: 'Search files' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New folder' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload files' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select all files' })).toBeInTheDocument();
    expect(screen.getByText('0 selected')).toBeInTheDocument();

    openPhotoContextMenu();

    const menu = screen.getByRole('menu', { name: 'Actions for photo.png' });

    ['Open', 'Rename', 'Download', 'Delete', 'New folder'].forEach((name) => {
      expect(within(menu).getByRole('menuitem', { name })).toBeInTheDocument();
    });

    dropFile();

    expect(screen.getByRole('list', { name: 'Uploads' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Uploading upload.txt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel upload of upload.txt' })).toBeInTheDocument();

    await user.click(within(menu).getByRole('menuitem', { name: 'Delete' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Delete photo.png?' });

    expect(within(dialog).getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows English empty states without a provider', () => {
    const { rerender } = render(<FileManager items={[]} />);

    expect(screen.getByText('This folder is empty')).toBeInTheDocument();

    rerender(<FileManager items={items} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search files' }), {
      target: { value: 'zzz' }
    });

    expect(screen.getByText('No matching files')).toBeInTheDocument();
  });

  it('translates the existing fileManager.* keys with locale="pt-BR"', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <FileManager
          items={items}
          onCreateFolder={jest.fn()}
          onRename={jest.fn()}
          onDelete={jest.fn()}
          onDownload={jest.fn()}
          uploadFile={pendingUpload}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('searchbox', { name: 'Pesquisar arquivos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova pasta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Renomear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();

    openPhotoContextMenu();

    const menu = screen.getByRole('menu', { name: 'Ações para photo.png' });

    ['Abrir', 'Renomear', 'Baixar', 'Excluir', 'Nova pasta'].forEach((name) => {
      expect(within(menu).getByRole('menuitem', { name })).toBeInTheDocument();
    });

    dropFile();

    expect(screen.getByRole('progressbar', { name: 'Enviando upload.txt' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar upload de upload.txt' })
    ).toBeInTheDocument();

    await user.click(within(menu).getByRole('menuitem', { name: 'Renomear' }));

    expect(screen.getByLabelText('Novo nome')).toHaveValue('photo.png');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.contextMenu(screen.getByRole('option', { name: /photo\.png/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Excluir photo.png?' });

    expect(within(dialog).getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('translates the empty state with locale="pt-BR"', () => {
    render(
      <NebularProvider locale="pt-BR">
        <FileManager items={[]} />
      </NebularProvider>
    );

    expect(screen.getByText('Nenhum arquivo')).toBeInTheDocument();
  });

  it('lets labels override provider messages', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <FileManager
          items={items}
          labels={{
            open: 'Abrir arquivo',
            newFolder: 'Criar pasta',
            search: 'Filtrar arquivos',
            deleteTitle: (name) => `Remover ${name}?`,
            deleteConfirm: 'Remover'
          }}
          onCreateFolder={jest.fn()}
          onRename={jest.fn()}
          onDelete={jest.fn()}
          actions={<button type="button">Ação extra</button>}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('searchbox', { name: 'Filtrar arquivos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar pasta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação extra' })).toBeInTheDocument();

    openPhotoContextMenu();

    expect(screen.getByRole('menuitem', { name: 'Abrir arquivo' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Abrir' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Remover photo.png?' });

    expect(within(dialog).getByRole('button', { name: 'Remover' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('keeps renderContextMenu and emptyState ahead of labels', () => {
    const renderContextMenu = jest.fn((node: FileNode, close: () => void) => (
      <button type="button" role="menuitem" onClick={close}>
        Custom action for {node.name}
      </button>
    ));

    const { rerender } = render(
      <FileManager
        items={items}
        labels={{ open: 'Abrir arquivo' }}
        renderContextMenu={renderContextMenu}
      />
    );

    openPhotoContextMenu();

    expect(
      screen.getByRole('menuitem', { name: 'Custom action for photo.png' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Abrir arquivo' })).not.toBeInTheDocument();

    rerender(<FileManager items={[]} labels={{ empty: 'Pasta vazia' }} />);

    expect(screen.getByText('Pasta vazia')).toBeInTheDocument();

    rerender(
      <FileManager
        items={[]}
        labels={{ empty: 'Pasta vazia' }}
        emptyState={<span>Empty state customizado</span>}
      />
    );

    expect(screen.getByText('Empty state customizado')).toBeInTheDocument();
    expect(screen.queryByText('Pasta vazia')).not.toBeInTheDocument();
  });

  it('has no a11y violations with localized labels', async () => {
    const { container } = render(
      <NebularProvider locale="pt-BR">
        <FileManager
          items={items}
          selectable
          onCreateFolder={jest.fn()}
          onRename={jest.fn()}
          onDelete={jest.fn()}
          onDownload={jest.fn()}
          uploadFile={pendingUpload}
        />
      </NebularProvider>
    );

    dropFile();
    openPhotoContextMenu();

    expect(await axe(container)).toHaveNoViolations();
  });
});
