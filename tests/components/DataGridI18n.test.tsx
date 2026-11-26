import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import { DataGrid, type DataGridColumn } from '@nebular-react/core';

interface User {
  id: number;
  name: string;
  email: string;
}

const rows: User[] = [
  { id: 1, name: 'Ada', email: 'ada@example.com' },
  { id: 2, name: 'Bia', email: 'bia@example.com' }
];

const columns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', sortable: true, filterable: true },
  { key: 'email', title: 'E-mail', filterable: true }
];

const rangeSelection = {
  startRowId: 1,
  endRowId: 1,
  startColumnKey: 'name',
  endColumnKey: 'name'
};

describe('DataGrid i18n', () => {
  it('keeps the English labels when no provider is mounted', () => {
    render(
      <DataGrid
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        withSelection
        withViews
        withUndoRedo
        withColumnVisibility
        withColumnFilters
        withExport
        withExcelExport
        withRowExpansion
        renderRowExpansion={() => <div>Details</div>}
        batchEditing={{ onCommit: jest.fn() }}
      />
    );

    expect(screen.getByRole('region', { name: 'Data grid' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Edit history' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Saved views' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'No view' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export Excel' })).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select all rows on this page' })
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand row 1' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Filter by Name' })).toBeInTheDocument();
    expect(screen.getByText('0 pending changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Discard changes' })).toBeInTheDocument();

    render(<DataGrid data={[]} columns={columns} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('translates the toolbar, aria labels and empty state with the pt-BR catalog', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <DataGrid
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          withSelection
          withViews
          withUndoRedo
          withColumnVisibility
          withColumnFilters
          withExport
          withExcelExport
          withRowExpansion
          renderRowExpansion={() => <div>Detalhes</div>}
          withRangeSelection
          withFillHandle
          defaultRangeSelection={rangeSelection}
          batchEditing={{ onCommit: jest.fn() }}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Desfazer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refazer' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Histórico de edição' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Visões salvas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar Excel' })).toBeInTheDocument();
    expect(screen.getByText('Colunas')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Selecionar todas as linhas desta página' })
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Selecionar linha 1' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'Filtros' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alça de preenchimento' })).toBeInTheDocument();
    expect(screen.getByText('0 alterações pendentes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aplicar alterações' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar alterações' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expandir linha 1' }));
    expect(screen.getByRole('button', { name: 'Recolher linha 1' })).toBeInTheDocument();

    const empty = render(
      <NebularProvider locale="pt-BR">
        <DataGrid data={[]} columns={columns} />
      </NebularProvider>
    );
    expect(screen.getByText('Nenhum dado')).toBeInTheDocument();
    empty.unmount();

    const loading = render(
      <NebularProvider locale="pt-BR">
        <DataGrid data={rows} columns={columns} loading />
      </NebularProvider>
    );
    expect(within(loading.container).getByRole('status')).toHaveTextContent('Carregando dados.');
  });

  it('lets consumer labels override the provider catalog', () => {
    render(
      <NebularProvider locale="pt-BR">
        <DataGrid
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          withSelection
          withViews
          withUndoRedo
          batchEditing={{ onCommit: jest.fn() }}
          labels={{
            undo: 'Voltar',
            savedViews: 'Minhas visões',
            selectRow: (rowId) => `Escolher ${rowId}`,
            pendingChanges: (count) => `${count} pendentes`
          }}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desfazer' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Minhas visões' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Escolher 1' })).toBeInTheDocument();
    expect(screen.getByText('0 pendentes')).toBeInTheDocument();
    // Labels not overridden keep the provider catalog.
    expect(screen.getByRole('button', { name: 'Refazer' })).toBeInTheDocument();
  });

  it('keeps batchEditing.labels above the grid labels and the catalog', () => {
    render(
      <NebularProvider locale="pt-BR">
        <DataGrid
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          labels={{
            applyChanges: 'Salvar tudo',
            discardChanges: 'Descartar tudo',
            pendingChanges: (count) => `${count} gerais`
          }}
          batchEditing={{
            onCommit: jest.fn(),
            labels: {
              apply: 'Aplicar lote',
              pending: (count) => `${count} em lote`
            }
          }}
        />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Aplicar lote' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Salvar tudo' })).not.toBeInTheDocument();
    expect(screen.getByText('0 em lote')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar tudo' })).toBeInTheDocument();
  });

  it('has no accessibility violations with the pt-BR catalog', async () => {
    const { container } = render(
      <NebularProvider locale="pt-BR">
        <DataGrid
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Usuários"
          withSelection
          withColumnFilters
          withColumnVisibility
          withExport
          withViews
          withUndoRedo
          withRowExpansion
          renderRowExpansion={() => <div>Detalhes</div>}
        />
      </NebularProvider>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
