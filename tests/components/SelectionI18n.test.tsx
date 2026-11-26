import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import {
  Cascader,
  CascaderOption,
  MultiSelect,
  TreeSelect,
  TreeSelectNode,
  TreeTable,
  TreeTableColumn,
  TreeTableNode
} from '@nebular-react/core';

interface FileRow {
  name: string;
}

const treeColumns: TreeTableColumn<FileRow>[] = [{ key: 'name', title: 'Name' }];

const treeData: TreeTableNode<FileRow>[] = [
  {
    id: 'src',
    data: { name: 'src' },
    children: [
      {
        id: 'components',
        data: { name: 'components' },
        children: [{ id: 'button', data: { name: 'button' } }]
      }
    ]
  },
  { id: 'docs', data: { name: 'docs' } }
];

const treeSelectData: TreeSelectNode[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' }
    ]
  },
  { value: 'remote', label: 'Remote', hasChildren: true }
];

const multiSelectData = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' }
];

const cascaderOptions: CascaderOption[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [{ value: 'apple', label: 'Apple' }]
  },
  { value: 'other', label: 'Other' }
];

const openCombobox = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string
): Promise<HTMLElement> => {
  const combobox = screen.getByRole('combobox', { name });

  await user.click(combobox);
  await waitFor(() => expect(combobox).toHaveAttribute('aria-expanded', 'true'));

  return combobox;
};

describe('Selection family i18n', () => {
  it('TreeTable uses English defaults without a provider', async () => {
    const user = userEvent.setup();

    render(
      <TreeTable data={treeData} columns={treeColumns} checkable defaultExpandedIds={['src']} />
    );

    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select src' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse src' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand components' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand components' }));

    expect(screen.getByRole('button', { name: 'Collapse components' })).toBeInTheDocument();
  });

  it('TreeTable falls back to "No data" when empty', () => {
    render(<TreeTable data={[]} columns={treeColumns} />);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('TreeSelect uses English defaults without a provider', async () => {
    const user = userEvent.setup();

    render(<TreeSelect data={treeSelectData} ariaLabel="Choose" searchable placeholder="Pick" />);

    await openCombobox(user, 'Choose');

    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand Fruits' })).toBeInTheDocument();

    const search = screen.getByRole('searchbox', { name: 'Search options' });

    await user.type(search, 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('No options');
  });

  it('MultiSelect uses English defaults without a provider', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <MultiSelect data={multiSelectData} ariaLabel="Fruits" searchable />
    );

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();

    await openCombobox(user, 'Fruits');

    await user.type(screen.getByRole('combobox', { name: 'Fruits' }), 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('No options');

    rerender(<MultiSelect data={multiSelectData} ariaLabel="Fruits" searchable loading />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading options…');
  });

  it('Cascader uses English defaults without a provider', async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <Cascader options={cascaderOptions} ariaLabel="Choose" searchable clearable />
    );

    expect(screen.getByPlaceholderText('Select an item')).toBeInTheDocument();

    await openCombobox(user, 'Choose');

    expect(screen.getByRole('listbox', { name: 'Level 1' })).toBeInTheDocument();

    const search = screen.getByRole('combobox', { name: 'Search options' });

    await user.type(search, 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('No results');

    unmount();

    render(<Cascader options={[]} ariaLabel="Choose" />);

    await openCombobox(user, 'Choose');

    expect(screen.getByText('No options')).toBeInTheDocument();

    unmount();

    render(<Cascader options={cascaderOptions} ariaLabel="Choose" clearable value={['other']} />);

    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument();
  });

  it('TreeTable translates the existing treeTable.* keys with locale="pt-BR"', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <TreeTable data={treeData} columns={treeColumns} checkable defaultExpandedIds={['src']} />
      </NebularProvider>
    );

    expect(screen.getByRole('checkbox', { name: 'Selecionar src' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recolher src' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir components' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expandir components' }));

    expect(screen.getByRole('button', { name: 'Recolher components' })).toBeInTheDocument();
  });

  it('TreeSelect translates the existing treeSelect.* keys with locale="pt-BR"', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <TreeSelect
          data={treeSelectData}
          label="Categoria"
          searchable
          defaultExpandedValues={['fruits']}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveAttribute(
      'placeholder',
      'Selecione um item'
    );

    await openCombobox(user, 'Categoria');

    expect(screen.getByPlaceholderText('Pesquisar…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recolher Fruits' })).toBeInTheDocument();
  });

  it('MultiSelect translates the existing multiSelect.* keys with locale="pt-BR"', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <NebularProvider locale="pt-BR">
        <MultiSelect data={multiSelectData} ariaLabel="Frutas" searchable />
      </NebularProvider>
    );

    expect(screen.getByPlaceholderText('Pesquisar')).toBeInTheDocument();

    await openCombobox(user, 'Frutas');

    await user.type(screen.getByRole('combobox', { name: 'Frutas' }), 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma opção');

    rerender(
      <NebularProvider locale="pt-BR">
        <MultiSelect data={multiSelectData} ariaLabel="Frutas" searchable loading />
      </NebularProvider>
    );

    expect(screen.getByRole('status')).toHaveTextContent('Carregando opções…');
  });

  it('Cascader translates the existing cascader.* keys with locale="pt-BR"', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <Cascader
          options={cascaderOptions}
          ariaLabel="Local"
          searchable
          clearable
          defaultValue={['other']}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Limpar seleção' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Selecione um item')).toBeInTheDocument();

    await openCombobox(user, 'Local');

    expect(screen.getByRole('listbox', { name: 'Nível 1' })).toBeInTheDocument();

    const search = screen.getByRole('combobox', { name: 'Pesquisar opções' });

    expect(search).toHaveAttribute('placeholder', 'Pesquisar opções');

    await user.type(search, 'apple');

    expect(screen.getByRole('listbox', { name: 'Resultados da pesquisa' })).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('Nenhum resultado');
  });

  it('lets labels override provider messages', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <TreeTable
          data={treeData}
          columns={treeColumns}
          checkable
          defaultExpandedIds={['src']}
          labels={{
            expand: (name) => `Abrir ${name}`,
            collapse: (name) => `Fechar ${name}`,
            select: (name) => `Marcar ${name}`,
            selectAll: 'Marcar tudo',
            empty: 'Sem registros'
          }}
        />
        <MultiSelect
          data={multiSelectData}
          ariaLabel="Frutas"
          searchable
          clearable
          labels={{
            noOptions: 'Nenhum item',
            loading: 'Buscando itens…',
            search: 'Filtrar',
            clear: 'Limpar tudo',
            remove: (name) => `Desmarcar ${name}`
          }}
        />
        <TreeSelect
          data={treeSelectData}
          ariaLabel="Categoria"
          searchable
          placeholder="Escolha"
          labels={{
            search: 'Filtrar…',
            expand: (name) => `Abrir ${name}`,
            collapse: (name) => `Fechar ${name}`,
            loadingChildren: (name) => `Carregando filhos de ${name}`,
            empty: 'Nada encontrado'
          }}
        />
        <Cascader
          options={cascaderOptions}
          ariaLabel="Local"
          searchable
          clearable
          defaultValue={['other']}
          labels={{
            search: 'Filtrar opções',
            searchResults: 'Resultados da busca',
            noResults: 'Nada por aqui',
            clear: 'Limpar tudo',
            placeholder: 'Escolha um local',
            noOptions: 'Vazio',
            level: (level) => `Nível ${level}`,
            loadingChildren: (name) => `Carregando filhos de ${name}`
          }}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('checkbox', { name: 'Marcar tudo' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Marcar src' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar src' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir components' })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Filtrar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escolha')).toBeInTheDocument();

    const multiSearch = screen.getByRole('combobox', { name: 'Frutas' });

    await user.click(multiSearch);
    await user.click(screen.getByRole('option', { name: 'Alpha' }));

    expect(screen.getByRole('button', { name: 'Desmarcar Alpha' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Limpar tudo' })).toHaveLength(2);

    await user.type(multiSearch, 'zzz');

    expect(screen.getByText('Nenhum item')).toBeInTheDocument();

    await openCombobox(user, 'Categoria');

    expect(screen.getByPlaceholderText('Filtrar…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir Fruits' })).toBeInTheDocument();
    expect(screen.getByRole('tree')).toHaveAttribute('aria-label', 'Categoria');

    const treeSearch = screen.getByRole('searchbox', { name: 'Search options' });

    await user.type(treeSearch, 'zzz');

    expect(screen.getByText('Nada encontrado')).toBeInTheDocument();

    await user.clear(treeSearch);
    await user.click(screen.getByRole('button', { name: 'Abrir Fruits' }));

    expect(screen.getByRole('button', { name: 'Fechar Fruits' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Local' }));

    expect(screen.getAllByRole('listbox', { name: 'Nível 1' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('combobox', { name: 'Filtrar opções' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Limpar tudo' }).length).toBeGreaterThan(0);
  });

  it('keeps legacy props ahead of labels and provider messages', async () => {
    const user = userEvent.setup();
    const pendingLoad = jest.fn(
      () =>
        new Promise<TreeSelectNode[]>(() => {
          // Never resolves: keeps the node in the loading state.
        })
    );

    render(
      <NebularProvider locale="pt-BR">
        <TreeTable
          data={[]}
          columns={treeColumns}
          emptyState="No files"
          labels={{ empty: 'Sem registros' }}
        />
        <TreeSelect
          data={treeSelectData}
          ariaLabel="Categoria"
          searchable
          placeholder="Select a node"
          nothingFoundMessage="Nothing here"
          loadingLabel="Fetching children of"
          loadData={pendingLoad}
          labels={{ placeholder: 'Escolha', empty: 'Nada encontrado', search: 'Filtrar' }}
        />
        <MultiSelect
          data={multiSelectData}
          ariaLabel="Frutas"
          searchable
          nothingFoundMessage="Nothing found"
          labels={{ noOptions: 'Nenhum item' }}
        />
        <Cascader
          options={[{ value: 'remote', label: 'Remote', hasChildren: true }]}
          ariaLabel="Local"
          placeholder="Select a location"
          loadingLabel="Fetching children of"
          loadData={jest.fn(
            () =>
              new Promise<CascaderOption[]>(() => {
                // Never resolves: keeps the option in the loading state.
              })
          )}
          labels={{ placeholder: 'Escolha', loadingChildren: () => 'Ignorado' }}
        />
      </NebularProvider>
    );

    expect(screen.getByText('No files')).toBeInTheDocument();
    expect(screen.queryByText('Sem registros')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveAttribute(
      'placeholder',
      'Select a node'
    );
    expect(screen.getByRole('combobox', { name: 'Local' })).toHaveAttribute(
      'placeholder',
      'Select a location'
    );

    await openCombobox(user, 'Categoria');

    expect(screen.getByPlaceholderText('Filtrar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expandir Remote' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expandir Remote' }));

    expect(pendingLoad).toHaveBeenCalledWith(expect.objectContaining({ value: 'remote' }));
    expect(screen.getByRole('button', { name: 'Fetching children of Remote' })).toBeDisabled();

    await user.type(screen.getByRole('searchbox', { name: 'Search options' }), 'zzz');

    expect(screen.getByText('Nothing here')).toBeInTheDocument();

    const multiSearch = screen.getByRole('combobox', { name: 'Frutas' });

    await user.click(multiSearch);
    await user.type(multiSearch, 'zzz');

    expect(screen.getByText('Nothing found')).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Local' }));
    await user.click(screen.getByRole('option', { name: 'Remote' }));

    expect(screen.getByRole('option', { name: 'Fetching children of Remote' })).toBeInTheDocument();
  });

  it('has no a11y violations with localized labels', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <NebularProvider locale="pt-BR">
        <TreeTable
          data={treeData}
          columns={treeColumns}
          checkable
          selectable
          defaultExpandedIds={['src']}
        />
        <MultiSelect
          data={multiSelectData}
          label="Frutas"
          searchable
          clearable
          defaultValue={['alpha']}
        />
        <TreeSelect data={treeSelectData} label="Categoria" searchable required />
        <Cascader
          options={cascaderOptions}
          label="Local"
          searchable
          clearable
          required
          defaultValue={['fruits', 'apple']}
        />
      </NebularProvider>
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole('combobox', { name: 'Frutas' }));

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole('combobox', { name: 'Categoria' }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Categoria' })).toHaveAttribute(
        'aria-expanded',
        'true'
      )
    );

    const pane = document.querySelector('.overlay-pane') as HTMLElement;

    expect(await axe(pane)).toHaveNoViolations();
  });
});
