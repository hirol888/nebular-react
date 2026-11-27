import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  DataGrid,
  DataGridColumn,
  DataGridServerGroup,
  DataGridView,
  createDataGridCsv,
  createDataGridExcel,
  exportDataGridExcel,
  getVirtualColumnRange,
  getVirtualRowRange,
  matchesRangeFilter,
  parseRangeFilterValue
} from '@nebular-react/core';

interface User {
  id: number;
  name: string;
  email: string;
}

const data: User[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `${['Charlie', 'Alice', 'Bruno'][index % 3]} ${index + 1}`,
  email: `user${index + 1}@example.com`
}));

const columns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', sortable: true, filterable: true },
  { key: 'email', title: 'E-mail', filterable: true }
];

const pinnedColumns: DataGridColumn<User>[] = [
  { key: 'id', title: 'ID', pinned: 'left', width: 80 },
  { key: 'name', title: 'Name', width: 160 },
  { key: 'email', title: 'E-mail', pinned: 'right', width: 220 }
];

const groupedColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', sortable: true, width: 160 },
  {
    key: 'contact',
    title: 'Contact',
    children: [
      { key: 'email', title: 'E-mail', sortable: true, filterable: true },
      { key: 'id', title: 'ID', align: 'right' }
    ]
  }
];

const longData: User[] = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`
}));

describe('DataGrid', () => {
  it('applies the viewport styling to a regular table and keeps pagination outside it', () => {
    render(
      <DataGrid
        data={data}
        columns={pinnedColumns}
        pageSize={5}
        classNames={{ viewport: 'test-grid-viewport' }}
      />
    );

    const table = screen.getByRole('table');
    expect(table.parentElement).toHaveClass('test-grid-viewport');
    expect(table.parentElement).not.toContainElement(
      screen.getByRole('button', { name: 'Page 2' })
    );
  });

  it('renders a page of rows and paginates', async () => {
    const user = userEvent.setup();

    render(<DataGrid data={data} columns={columns} pageSize={5} />);

    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('Charlie 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(screen.getByText('Bruno 6')).toBeInTheDocument();
    expect(screen.queryByText('Charlie 1')).not.toBeInTheDocument();
  });

  it('sorts rows by a sortable column', async () => {
    const user = userEvent.setup();

    render(<DataGrid data={data} columns={columns} withPagination={false} />);

    const nameButton = screen.getByRole('button', { name: /Name/ });
    await user.click(nameButton);

    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Alice 2')).toBeInTheDocument();

    await user.click(nameButton);
    const sortedDescendingRows = screen.getAllByRole('row');
    expect(within(sortedDescendingRows[1]).getByText('Charlie 10')).toBeInTheDocument();
  });

  it('selects rows and selects the current page', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withSelection
        onSelectionChange={onSelectionChange}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([1]);

    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2, 3, 4, 5]);

    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));

    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('renders an empty state', () => {
    render(<DataGrid data={[]} columns={columns} emptyState="No users" />);

    expect(screen.getByText('No users')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('filters rows by column and resets to the first page', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        defaultPage={2}
        withColumnFilters
        onPageChange={onPageChange}
      />
    );

    await user.type(screen.getByRole('searchbox', { name: 'Filter by Name' }), 'r');

    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('Charlie 1')).toBeInTheDocument();
    expect(screen.getByText('Bruno 3')).toBeInTheDocument();
    expect(screen.queryByText('Alice 2')).not.toBeInTheDocument();
  });

  it('supports controlled column filters', () => {
    const onFilterChange = jest.fn();
    const { rerender } = render(
      <DataGrid
        data={data}
        columns={columns}
        withColumnFilters
        withPagination={false}
        filterValues={{ name: 'Bruno' }}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByText('Bruno 3')).toBeInTheDocument();
    expect(screen.queryByText('Charlie 1')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Filter by Name' })).toHaveValue('Bruno');

    fireEvent.change(screen.getByRole('searchbox', { name: 'Filter by Name' }), {
      target: { value: 'Alice' }
    });

    expect(onFilterChange).toHaveBeenCalledWith({ name: 'Alice' });

    rerender(
      <DataGrid
        data={data}
        columns={columns}
        withColumnFilters
        withPagination={false}
        filterValues={{ name: 'Alice' }}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByText('Alice 2')).toBeInTheDocument();
    expect(screen.queryByText('Bruno 3')).not.toBeInTheDocument();
  });

  it('keeps filters available when no rows match', async () => {
    const user = userEvent.setup();

    render(<DataGrid data={data} columns={columns} withColumnFilters emptyState="No users" />);

    const filter = screen.getByRole('searchbox', { name: 'Filter by Name' });
    await user.type(filter, 'zzz');

    expect(screen.getByText('No users')).toBeInTheDocument();
    expect(filter).toBeInTheDocument();
  });

  it('virtualizes rows and renders only the visible window', async () => {
    const { container } = render(
      <DataGrid
        data={longData}
        columns={columns}
        pageSize={500}
        virtualized
        virtualizedRowHeight={40}
        virtualizedMaxHeight={300}
      />
    );

    expect(screen.getAllByRole('row').length).toBeLessThan(30);

    const viewport = container.querySelector('[data-nebular-datagrid-viewport]');
    expect(viewport).not.toBeNull();

    fireEvent.scroll(viewport as HTMLElement, { target: { scrollTop: 4000 } });

    expect(await screen.findByText('User 100')).toBeInTheDocument();
  });

  it('resizes columns with pointer drag', () => {
    const onColumnWidthChange = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        withColumnResize
        onColumnWidthChange={onColumnWidthChange}
      />
    );

    const handle = screen.getByRole('separator', { name: 'Resize Name' });

    fireEvent.mouseDown(handle, { button: 0, clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 160 });
    fireEvent.mouseUp(document);

    expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 210 });
  });

  it('resizes columns with the keyboard', async () => {
    const user = userEvent.setup();
    const onColumnWidthChange = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        withColumnResize
        onColumnWidthChange={onColumnWidthChange}
      />
    );

    const handle = screen.getByRole('separator', { name: 'Resize Name' });
    expect(handle).toHaveAttribute('aria-valuenow', '150');

    handle.focus();
    await user.keyboard('{ArrowRight}');

    expect(handle).toHaveAttribute('aria-valuenow', '160');
    expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 160 });

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

    expect(handle).toHaveAttribute('aria-valuenow', '185');
    expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 185 });
  });

  it('supports controlled column widths', () => {
    const onColumnWidthChange = jest.fn();
    const { rerender } = render(
      <DataGrid
        data={data}
        columns={columns}
        withColumnResize
        columnWidths={{ name: 200 }}
        onColumnWidthChange={onColumnWidthChange}
      />
    );

    expect(screen.getByRole('separator', { name: 'Resize Name' })).toHaveAttribute(
      'aria-valuenow',
      '200'
    );

    fireEvent.keyDown(screen.getByRole('separator', { name: 'Resize Name' }), {
      key: 'ArrowRight'
    });

    expect(onColumnWidthChange).toHaveBeenCalledWith({ name: 210 });

    rerender(
      <DataGrid
        data={data}
        columns={columns}
        withColumnResize
        columnWidths={{ name: 210 }}
        onColumnWidthChange={onColumnWidthChange}
      />
    );

    expect(screen.getByRole('separator', { name: 'Resize Name' })).toHaveAttribute(
      'aria-valuenow',
      '210'
    );
  });

  it('reorders columns with the keyboard', async () => {
    const user = userEvent.setup();
    const onColumnOrderChange = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        withColumnReorder
        onColumnOrderChange={onColumnOrderChange}
      />
    );

    const handle = screen.getByRole('button', { name: /Reorder Name/ });
    handle.focus();

    await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

    expect(onColumnOrderChange).toHaveBeenCalledWith(['email', 'name']);

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('E-mail');
    expect(headers[1]).toHaveTextContent('Name');

    const cells = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('user1@example.com');
    expect(cells[1]).toHaveTextContent('Charlie 1');
  });

  it('reorders columns via drag and drop', () => {
    render(<DataGrid data={data} columns={columns} withColumnReorder />);

    const handle = screen.getByRole('button', { name: /Reorder Name/ });
    const emailHeader = screen.getAllByRole('columnheader')[1];
    const dataTransfer = {
      effectAllowed: 'move',
      dropEffect: 'move',
      setData: jest.fn(),
      getData: jest.fn(() => 'name')
    } as unknown as DataTransfer;

    fireEvent.dragStart(handle, { dataTransfer });
    fireEvent.dragOver(emailHeader, { dataTransfer });
    fireEvent.drop(emailHeader, { dataTransfer });

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('E-mail');
    expect(headers[1]).toHaveTextContent('Name');
  });

  it('toggles column visibility', async () => {
    const user = userEvent.setup();

    render(<DataGrid data={data} columns={columns} withColumnVisibility />);

    expect(screen.getByRole('columnheader', { name: 'E-mail' })).toBeInTheDocument();

    await user.click(screen.getByText('Columns'));
    await user.click(screen.getByRole('checkbox', { name: 'E-mail' }));

    expect(screen.queryByRole('columnheader', { name: 'E-mail' })).not.toBeInTheDocument();
    expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
  });

  it('expands and collapses row details', async () => {
    const user = userEvent.setup();

    render(
      <DataGrid
        data={data}
        columns={columns}
        withRowExpansion
        renderRowExpansion={(row) => `Details for ${row.name}`}
      />
    );

    const expand = screen.getByRole('button', { name: 'Expand row 1' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');

    await user.click(expand);

    expect(screen.getByText('Details for Charlie 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse row 1' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('exports filtered rows to CSV', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        withExport
        exportFileName="users.csv"
        onExport={onExport}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(onExport).toHaveBeenCalledTimes(1);

    const [csv, fileName] = onExport.mock.calls[0];
    expect(fileName).toBe('users.csv');
    expect(csv.split('\r\n')[0]).toBe('Name,E-mail');
    expect(csv).toContain('Charlie 1,user1@example.com');
  });

  it('escapes CSV separators and quotes', () => {
    const csv = createDataGridCsv(
      [{ id: 1, name: 'Doe, John', email: 'a"b@example.com' }],
      columns
    );

    expect(csv).toContain('"Doe, John"');
    expect(csv).toContain('"a""b@example.com"');
  });

  it('groups rows and supports collapsing groups', async () => {
    const user = userEvent.setup();

    render(
      <DataGrid
        data={data.slice(0, 3)}
        columns={columns}
        withPagination={false}
        groupBy={(row) => row.name.split(' ')[0]}
        collapsibleGroups
      />
    );

    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Charlie 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse group Charlie' }));

    expect(screen.queryByText('Charlie 1')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand group Charlie' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('edits a row and reports changes', async () => {
    const user = userEvent.setup();
    const onRowEdit = jest.fn();

    render(<DataGrid data={data} columns={columns} withRowEditing onRowEdit={onRowEdit} />);

    await user.click(screen.getByRole('button', { name: 'Edit row 1' }));

    const nameInput = screen.getByRole('textbox', { name: 'Edit Name' });
    await user.clear(nameInput);
    await user.type(nameInput, 'Alicia');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onRowEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ name: 'Alicia', email: 'user1@example.com' })
    );
    expect(screen.queryByRole('textbox', { name: 'Edit Name' })).not.toBeInTheDocument();
  });

  it('cancels row editing without reporting changes', async () => {
    const user = userEvent.setup();
    const onRowEdit = jest.fn();

    render(<DataGrid data={data} columns={columns} withRowEditing onRowEdit={onRowEdit} />);

    await user.click(screen.getByRole('button', { name: 'Edit row 1' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onRowEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: 'Edit Name' })).not.toBeInTheDocument();
  });

  it('renders the server-provided page without local pagination', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();

    render(
      <DataGrid
        data={data.slice(0, 2)}
        columns={columns}
        serverSide
        totalRows={12}
        pageSize={5}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Charlie 1')).toBeInTheDocument();
    expect(screen.getByText('Alice 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Page 3' }));

    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByText('Charlie 1')).toBeInTheDocument();
  });

  it('delegates sorting to the server in serverSide mode', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();

    render(
      <DataGrid
        data={data.slice(0, 2)}
        columns={columns}
        serverSide
        totalRows={2}
        onSortChange={onSortChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /Name/ }));

    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
    expect(screen.getByText('Charlie 1')).toBeInTheDocument();
    expect(screen.getByText('Alice 2')).toBeInTheDocument();
  });

  it('delegates filtering to the server in serverSide mode', async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();

    render(
      <DataGrid
        data={data.slice(0, 2)}
        columns={columns}
        serverSide
        totalRows={2}
        withColumnFilters
        onFilterChange={onFilterChange}
      />
    );

    await user.type(screen.getByRole('searchbox', { name: 'Filter by Name' }), 'zzz');

    expect(onFilterChange).toHaveBeenLastCalledWith({ name: 'zzz' });
    expect(screen.getByText('Charlie 1')).toBeInTheDocument();
    expect(screen.getByText('Alice 2')).toBeInTheDocument();
  });

  it('shows a loading state in serverSide mode', () => {
    render(<DataGrid data={[]} columns={columns} serverSide totalRows={12} loading />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading data');
  });

  it('has no accessibility violations in serverSide mode', async () => {
    const { container } = render(
      <DataGrid data={data.slice(0, 2)} columns={columns} serverSide totalRows={12} loading />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('pins columns to the left and right edges', () => {
    render(<DataGrid data={data} columns={pinnedColumns} pageSize={5} />);

    expect(screen.getByRole('columnheader', { name: 'ID' })).toHaveStyle({
      position: 'sticky',
      left: '0px'
    });
    expect(screen.getByRole('columnheader', { name: 'E-mail' })).toHaveStyle({
      position: 'sticky',
      right: '0px'
    });

    const firstRowCells = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
    expect(firstRowCells[0]).toHaveStyle({ position: 'sticky', left: '0px' });
    expect(firstRowCells[2]).toHaveStyle({ position: 'sticky', right: '0px' });
  });

  it('supports controlled column pinning', () => {
    render(
      <DataGrid data={data} columns={columns} pinnedColumns={{ left: ['name'] }} pageSize={5} />
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveStyle({
      position: 'sticky',
      left: '0px'
    });
  });

  it('renders multi-level headers and keeps leaf sorting/filtering', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={groupedColumns}
        withColumnFilters
        pageSize={5}
        onSortChange={onSortChange}
      />
    );

    const groupHeader = screen.getByRole('columnheader', { name: 'Contact' });
    expect(groupHeader).toHaveAttribute('colspan', '2');
    expect(groupHeader).toHaveAttribute('scope', 'colgroup');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('rowspan', '2');

    await user.type(screen.getByRole('searchbox', { name: 'Filter by E-mail' }), 'user2');
    expect(screen.getByText('Alice 2')).toBeInTheDocument();
    expect(screen.queryByText('Charlie 1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /E-mail/ }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'email', direction: 'asc' });
  });

  it('renders aggregated summary values in the footer', () => {
    const summaryColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      { key: 'id', title: 'ID', aggregate: 'sum' }
    ];

    render(
      <DataGrid
        data={data}
        columns={summaryColumns}
        pageSize={5}
        withSummary
        summaryLabel="Total"
      />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('78')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(7);
  });

  it('supports page-scoped summaries and all aggregate functions', () => {
    const summaryColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      { key: 'sum', title: 'Sum', aggregate: 'sum', summaryValue: (row) => row.id },
      { key: 'avg', title: 'Avg', aggregate: 'avg', summaryValue: (row) => row.id },
      { key: 'min', title: 'Min', aggregate: 'min', summaryValue: (row) => row.id },
      { key: 'max', title: 'Max', aggregate: 'max', summaryValue: (row) => row.id },
      { key: 'count', title: 'Count', aggregate: 'count' },
      { key: 'custom', title: 'Custom', aggregate: (rows) => `${rows.length} rows` }
    ];

    const { container } = render(
      <DataGrid data={data} columns={summaryColumns} pageSize={5} summaryScope="page" withSummary />
    );
    const footer = container.querySelector('tfoot') as HTMLElement;

    expect(footer).not.toBeNull();
    expect(within(footer).getByText('15')).toBeInTheDocument();
    expect(within(footer).getByText('3')).toBeInTheDocument();
    expect(within(footer).getByText('1')).toBeInTheDocument();
    expect(within(footer).getAllByText('5')).toHaveLength(2);
    expect(within(footer).getByText('5 rows')).toBeInTheDocument();
  });

  it('formats aggregate values with summaryFormatter', () => {
    const summaryColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      {
        key: 'id',
        title: 'ID',
        aggregate: 'sum',
        summaryFormatter: (value) => `#${value}`
      }
    ];

    render(<DataGrid data={data} columns={summaryColumns} pageSize={5} withSummary />);

    expect(screen.getByText('#78')).toBeInTheDocument();
  });

  it('supports filter operators per column', async () => {
    const user = userEvent.setup();
    const operatorColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name', filterable: true, filterOperator: 'startsWith' },
      { key: 'id', title: 'ID', filterable: true, filterOperator: 'gte' }
    ];

    render(<DataGrid data={data} columns={operatorColumns} pageSize={20} withColumnFilters />);

    await user.type(screen.getByRole('searchbox', { name: 'Filter by Name' }), 'Alice');
    expect(screen.getByText('Alice 2')).toBeInTheDocument();
    expect(screen.queryByText('Charlie 1')).not.toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: 'Filter by Name' }));
    await user.type(screen.getByRole('searchbox', { name: 'Filter by ID' }), '10');
    expect(screen.getByText('Charlie 10')).toBeInTheDocument();
    expect(screen.getByText('Alice 11')).toBeInTheDocument();
    expect(screen.queryByText('Alice 2')).not.toBeInTheDocument();
  });

  it('reorders rows via drag and keyboard', async () => {
    const onRowReorder = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withRowReorder
        onRowReorder={onRowReorder}
      />
    );

    const handles = screen.getAllByRole('button', { name: /Reorder row/ });
    expect(handles).toHaveLength(5);

    fireEvent.dragStart(handles[0], {
      dataTransfer: { setData: jest.fn(), effectAllowed: 'move' }
    });
    const rows = screen.getAllByRole('row');
    const targetCell = within(rows[2]).getAllByRole('cell')[0];
    fireEvent.drop(targetCell);

    expect(onRowReorder).toHaveBeenCalledWith(0, 1);

    fireEvent.keyDown(handles[1], { key: 'ArrowUp', altKey: true });
    expect(onRowReorder).toHaveBeenCalledWith(1, 0);

    fireEvent.keyDown(handles[0], { key: 'ArrowUp', altKey: true });
    expect(onRowReorder).toHaveBeenCalledTimes(2);
  });

  it('exposes a column menu with sort, pin and hide actions', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();
    const onPinnedColumnsChange = jest.fn();
    const onHiddenColumnsChange = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withColumnMenu
        withColumnVisibility
        onSortChange={onSortChange}
        onPinnedColumnsChange={onPinnedColumnsChange}
        onHiddenColumnsChange={onHiddenColumnsChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Column options for Name' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Sort descending' }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Column options for Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'Pin left' }));
    expect(onPinnedColumnsChange).toHaveBeenCalledWith({ left: ['name'], right: [] });

    await user.click(screen.getByRole('button', { name: 'Column options for E-mail' }));
    await user.click(screen.getByRole('menuitem', { name: 'Hide column' }));
    expect(onHiddenColumnsChange).toHaveBeenCalledWith(['email']);
  });

  it('opens the column menu outside the scroll viewport and restores focus on Escape', async () => {
    const user = userEvent.setup();

    render(<DataGrid data={data} columns={columns} pageSize={5} withColumnMenu />);

    const trigger = screen.getByRole('button', { name: 'Column options for Name' });
    await user.click(trigger);
    const menu = screen.getByRole('menu');
    expect(screen.getByRole('table').parentElement).not.toContainElement(menu);
    expect(within(menu).getByRole('menuitem', { name: 'Sort ascending' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('renders per-group aggregate summaries', () => {
    const groupSummaryColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      { key: 'id', title: 'ID', aggregate: 'sum' }
    ];

    const { container } = render(
      <DataGrid
        data={data}
        columns={groupSummaryColumns}
        pageSize={6}
        groupBy={(row) => row.name.split(' ')[0]}
        withGroupSummary
        summaryLabel="Total"
      />
    );

    const summaryRows = container.querySelectorAll('tr[class*="groupSummaryRow"]');
    expect(summaryRows).toHaveLength(3);
    const summaries = Array.from(summaryRows).map((row) => row.textContent);
    expect(summaries).toEqual(['Total5', 'Total7', 'Total9']);
  });

  it('groups by multiple columns with nested headers', () => {
    const people = [
      { id: '1', team: 'Alpha', role: 'Dev' },
      { id: '2', team: 'Alpha', role: 'Lead' },
      { id: '3', team: 'Beta', role: 'Dev' },
      { id: '4', team: 'Alpha', role: 'Dev' }
    ];
    const peopleColumns: DataGridColumn<(typeof people)[number]>[] = [
      { key: 'id', title: 'ID' },
      { key: 'team', title: 'Team' },
      { key: 'role', title: 'Role' }
    ];

    render(
      <DataGrid data={people} columns={peopleColumns} pageSize={10} groupBy={['team', 'role']} />
    );

    expect(screen.getByText('Team: Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team: Beta')).toBeInTheDocument();
    expect(screen.getAllByText('Role: Dev')).toHaveLength(2);
    expect(screen.getByText('Role: Lead')).toBeInTheDocument();
  });

  it('collapses nested groups independently', async () => {
    const user = userEvent.setup();
    const onExpandedGroupsChange = jest.fn();
    const people = [
      { id: '1', team: 'Alpha', role: 'Dev' },
      { id: '2', team: 'Alpha', role: 'Lead' },
      { id: '3', team: 'Beta', role: 'Dev' }
    ];
    const peopleColumns: DataGridColumn<(typeof people)[number]>[] = [
      { key: 'id', title: 'ID' },
      { key: 'team', title: 'Team' },
      { key: 'role', title: 'Role' }
    ];

    render(
      <DataGrid
        data={people}
        columns={peopleColumns}
        pageSize={10}
        groupBy={['team', 'role']}
        collapsibleGroups
        onExpandedGroupsChange={onExpandedGroupsChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Collapse group Alpha' }));
    expect(screen.queryByText('Role: Lead')).not.toBeInTheDocument();
    expect(screen.getAllByText('Role: Dev')).toHaveLength(1);
    expect(onExpandedGroupsChange).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Expand group Alpha' }));
    expect(screen.getByText('Role: Lead')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse group Alpha / Dev' }));
    expect(screen.getByRole('button', { name: 'Expand group Alpha / Dev' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse group Beta / Dev' })).toBeInTheDocument();
  });

  it('edits a cell and commits with Enter', async () => {
    const user = userEvent.setup();
    const onCellEdit = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withCellEditing
        onCellEdit={onCellEdit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit Name for row 1' }));
    const input = screen.getByRole('textbox', { name: 'Edit Name for row 1' });
    await user.clear(input);
    await user.type(input, 'Alice Updated{Enter}');

    expect(onCellEdit).toHaveBeenCalledWith(data[0], 'name', 'Alice Updated');
    expect(screen.queryByRole('textbox', { name: 'Edit Name for row 1' })).not.toBeInTheDocument();
  });

  it('cancels cell editing with Escape', async () => {
    const user = userEvent.setup();
    const onCellEdit = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withCellEditing
        onCellEdit={onCellEdit}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit E-mail for row 1' }));
    const input = screen.getByRole('textbox', { name: 'Edit E-mail for row 1' });
    await user.type(input, 'changed');
    await user.keyboard('{Escape}');

    expect(onCellEdit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Edit E-mail for row 1' })).toBeInTheDocument();
  });

  it('supports controlled cell editing and custom editors', async () => {
    const user = userEvent.setup();
    const onEditingCellChange = jest.fn();
    const onCellEdit = jest.fn();
    const { rerender } = render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withCellEditing
        editingCell={{ rowId: 1, columnKey: 'name' }}
        onEditingCellChange={onEditingCellChange}
        onCellEdit={onCellEdit}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Edit Name for row 1' });
    await user.clear(input);
    await user.type(input, 'Controlled{Enter}');

    expect(onCellEdit).toHaveBeenCalledWith(data[0], 'name', 'Controlled');
    expect(onEditingCellChange).toHaveBeenCalledWith(null);

    rerender(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withCellEditing
        editingCell={null}
        onEditingCellChange={onEditingCellChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Edit Name for row 1' })).toBeInTheDocument();
  });

  it('renders a custom cell editor', async () => {
    const user = userEvent.setup();
    const onCellEdit = jest.fn();

    render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withCellEditing
        defaultEditingCell={{ rowId: 1, columnKey: 'email' }}
        onCellEdit={onCellEdit}
        renderCellEditor={(row, column, value, onSave, onCancel) => (
          <input
            aria-label={`Custom editor ${column.key} ${String((row as User).id)}`}
            defaultValue={String(value ?? '')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSave(event.currentTarget.value);
              } else if (event.key === 'Escape') {
                onCancel();
              }
            }}
          />
        )}
      />
    );

    const custom = screen.getByRole('textbox', { name: 'Custom editor email 1' });
    await user.type(custom, 'x{Enter}');

    expect(onCellEdit).toHaveBeenCalledWith(data[0], 'email', expect.stringContaining('x'));
  });

  it('computes the virtual column window', () => {
    const offsets = [0, 100, 200, 300, 400];
    const widths = [100, 100, 100, 100, 100];

    expect(getVirtualColumnRange(offsets, widths, 0, 250, 0)).toEqual({ start: 0, end: 3 });
    expect(getVirtualColumnRange(offsets, widths, 250, 150, 1)).toEqual({ start: 1, end: 5 });
    expect(getVirtualColumnRange(offsets, widths, 0, 0, 2)).toEqual({ start: 0, end: 5 });
  });

  it('virtualizes columns horizontally', () => {
    const manyColumns: DataGridColumn<Record<string, unknown>>[] = Array.from(
      { length: 30 },
      (_, index) => ({ key: `col${index}`, title: `Column ${index}`, width: 100 })
    );
    const manyData = [
      Object.fromEntries(manyColumns.map((column, index) => [column.key, `value ${index}`]))
    ];
    const originalClientWidth = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientWidth'
    );

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      value: 300
    });

    try {
      const { container } = render(
        <DataGrid
          data={manyData}
          columns={manyColumns}
          pageSize={5}
          virtualizeColumns
          columnVirtualizationOverscan={0}
        />
      );

      expect(screen.getByRole('columnheader', { name: 'Column 0' })).toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: 'Column 20' })).not.toBeInTheDocument();

      const viewport = container.querySelector('[data-nebular-datagrid-viewport]') as HTMLElement;
      Object.defineProperty(viewport, 'scrollLeft', { configurable: true, value: 2000 });
      fireEvent.scroll(viewport);

      expect(screen.getByRole('columnheader', { name: 'Column 20' })).toBeInTheDocument();
      expect(screen.queryByRole('columnheader', { name: 'Column 0' })).not.toBeInTheDocument();
    } finally {
      if (originalClientWidth) {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth);
      } else {
        delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
      }
    }
  });

  it('selects a range and copies it as TSV', async () => {
    const writeText = jest.fn<Promise<void>, [string]>(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    });
    const onRangeSelectionChange = jest.fn();

    const { container } = render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withRangeSelection
        onRangeSelectionChange={onRangeSelectionChange}
      />
    );

    const rows = screen.getAllByRole('row');
    const startCell = within(rows[1]).getAllByRole('cell')[0];
    const endCell = within(rows[2]).getAllByRole('cell')[1];

    fireEvent.mouseDown(startCell, { button: 0 });
    fireEvent.mouseDown(endCell, { button: 0, shiftKey: true });

    expect(onRangeSelectionChange).toHaveBeenLastCalledWith({
      startRowId: 1,
      endRowId: 2,
      startColumnKey: 'name',
      endColumnKey: 'email'
    });
    expect(startCell).toHaveClass('nebular-data-grid-rangeSelected');
    expect(endCell).toHaveClass('nebular-data-grid-rangeSelected');

    const root = container.querySelector('.nebular-data-grid-root') as HTMLElement;
    fireEvent.keyDown(root, { key: 'c', ctrlKey: true });

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText).toHaveBeenCalledWith(
      'Charlie 1\tuser1@example.com\nAlice 2\tuser2@example.com'
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('2 rows copied'));
  });

  it('has no accessibility violations with range selection', async () => {
    const { container } = render(
      <DataGrid data={data} columns={columns} pageSize={5} withRangeSelection caption="Users" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with row reordering', async () => {
    const { container } = render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withRowReorder
        onRowReorder={jest.fn()}
        withSelection
        caption="Users"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with a summary row', async () => {
    const summaryColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      { key: 'id', title: 'ID', aggregate: 'sum' }
    ];
    const { container } = render(
      <DataGrid
        data={data}
        columns={summaryColumns}
        pageSize={5}
        withSummary
        withSelection
        summaryLabel="Total"
        caption="Users"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with grouped and pinned columns', async () => {
    const { container } = render(
      <DataGrid
        data={data}
        columns={groupedColumns}
        pageSize={5}
        withColumnFilters
        withSelection
        caption="Users"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with grouping and row editing', async () => {
    const { container } = render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        groupBy={(row) => row.name.split(' ')[0]}
        collapsibleGroups
        withRowEditing
        onRowEdit={jest.fn()}
        caption="Users"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with visibility, expansion and export', async () => {
    const { container } = render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withColumnVisibility
        withRowExpansion
        renderRowExpansion={(row) => row.email}
        withExport
        caption="Users"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with resize and reorder', async () => {
    const { container } = render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withColumnResize
        withColumnReorder
        caption="Users"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DataGrid data={data} columns={columns} pageSize={5} withSelection caption="Users" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with filters and virtualization', async () => {
    const { container } = render(
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withSelection
        withColumnFilters
        virtualized
        virtualizedMaxHeight={300}
        caption="Users"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('saved views', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('saves the current state as a view, applies it and deletes it', async () => {
      const user = userEvent.setup();
      const onViewsChange = jest.fn();

      render(
        <DataGrid
          data={data}
          columns={columns}
          withViews
          withColumnFilters
          withPagination={false}
          defaultSortKey="name"
          defaultSortDirection="desc"
          defaultFilterValues={{ name: 'Alice' }}
          onViewsChange={onViewsChange}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Save view' }));
      await user.type(screen.getByRole('textbox', { name: 'View name' }), 'Alice desc');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onViewsChange).toHaveBeenCalledTimes(1);

      const [savedViews] = onViewsChange.mock.calls[0] as [DataGridView[]];
      expect(savedViews).toHaveLength(1);
      expect(savedViews[0].id).toEqual(expect.any(String));
      expect(savedViews[0]).toMatchObject({
        name: 'Alice desc',
        sort: { key: 'name', direction: 'desc' },
        filters: { name: 'Alice' }
      });

      const select = screen.getByRole('combobox', { name: 'Saved views' });
      expect(select).toHaveValue(savedViews[0].id);
      expect(screen.queryByRole('textbox', { name: 'View name' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Name/ }));
      await user.clear(screen.getByRole('searchbox', { name: 'Filter by Name' }));

      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
        'aria-sort',
        'ascending'
      );
      expect(screen.getByRole('searchbox', { name: 'Filter by Name' })).toHaveValue('');

      fireEvent.change(select, { target: { value: '' } });
      fireEvent.change(select, { target: { value: savedViews[0].id } });

      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
        'aria-sort',
        'descending'
      );
      expect(screen.getByRole('searchbox', { name: 'Filter by Name' })).toHaveValue('Alice');

      await user.click(screen.getByRole('button', { name: 'Delete view' }));

      expect(onViewsChange).toHaveBeenLastCalledWith([]);
      expect(select).toHaveValue('');
      expect(screen.queryByRole('option', { name: 'Alice desc' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete view' })).not.toBeInTheDocument();
    });

    it('restores layout, pinned columns and page size from the default active view', () => {
      const views: DataGridView[] = [
        {
          id: 'compact',
          name: 'Compact',
          hiddenColumnKeys: ['email'],
          columnWidths: { name: 150 },
          columnOrder: ['email', 'name'],
          pinnedColumns: { left: ['name'] },
          pageSize: 5
        }
      ];

      render(
        <DataGrid
          data={data}
          columns={columns}
          withViews
          withColumnResize
          defaultViews={views}
          defaultActiveViewId="compact"
        />
      );

      expect(screen.getByRole('combobox', { name: 'Saved views' })).toHaveValue('compact');
      expect(screen.queryByRole('columnheader', { name: 'E-mail' })).not.toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(6);
      expect(screen.getByRole('separator', { name: 'Resize Name' })).toHaveAttribute(
        'aria-valuenow',
        '150'
      );
    });

    it('persists views in localStorage and ignores invalid payloads', async () => {
      const user = userEvent.setup();
      window.localStorage.setItem('datagrid-views', '{invalid');

      const { unmount } = render(
        <DataGrid data={data} columns={columns} withViews viewStorageKey="datagrid-views" />
      );

      expect(screen.getByRole('combobox', { name: 'Saved views' })).toHaveValue('');

      await user.click(screen.getByRole('button', { name: 'Save view' }));
      await user.type(screen.getByRole('textbox', { name: 'View name' }), 'Persisted');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      const stored = JSON.parse(
        window.localStorage.getItem('datagrid-views') as string
      ) as DataGridView[];
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Persisted');

      unmount();

      render(<DataGrid data={data} columns={columns} withViews viewStorageKey="datagrid-views" />);

      expect(screen.getByRole('option', { name: 'Persisted' })).toBeInTheDocument();
    });

    it('supports controlled views and active view selection', async () => {
      const user = userEvent.setup();
      const views: DataGridView[] = [
        { id: 'sorted', name: 'Sorted desc', sort: { key: 'name', direction: 'desc' } },
        { id: 'bruno', name: 'Bruno only', filters: { name: 'Bruno' } }
      ];
      const onViewsChange = jest.fn();
      const onActiveViewChange = jest.fn();
      const onSortChange = jest.fn();
      const onFilterChange = jest.fn();

      const renderGrid = (activeViewId: string | null) => (
        <DataGrid
          data={data}
          columns={columns}
          withViews
          withColumnFilters
          withPagination={false}
          views={views}
          activeViewId={activeViewId}
          onViewsChange={onViewsChange}
          onActiveViewChange={onActiveViewChange}
          onSortChange={onSortChange}
          onFilterChange={onFilterChange}
        />
      );

      const { rerender } = render(renderGrid(null));

      const select = screen.getByRole('combobox', { name: 'Saved views' });
      expect(select).toHaveValue('');

      fireEvent.change(select, { target: { value: 'bruno' } });

      expect(onActiveViewChange).toHaveBeenCalledWith('bruno');
      expect(onFilterChange).toHaveBeenCalledWith({ name: 'Bruno' });
      expect(screen.getByRole('searchbox', { name: 'Filter by Name' })).toHaveValue('Bruno');

      fireEvent.change(select, { target: { value: 'sorted' } });

      expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'desc' });
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
        'aria-sort',
        'descending'
      );

      rerender(renderGrid('sorted'));

      expect(screen.getByRole('combobox', { name: 'Saved views' })).toHaveValue('sorted');

      await user.click(screen.getByRole('button', { name: 'Delete view' }));

      expect(onViewsChange).toHaveBeenCalledWith([views[1]]);
      expect(onActiveViewChange).toHaveBeenLastCalledWith(null);
    });

    it('has no accessibility violations with saved views', async () => {
      const { container } = render(
        <DataGrid
          data={data}
          columns={columns}
          withViews
          withColumnFilters
          defaultViews={[{ id: 'alice', name: 'Alice only', filters: { name: 'Alice' } }]}
          pageSize={5}
          caption="Users"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('range filters', () => {
    interface Metric {
      id: number;
      name: string;
      amount: number;
      date: string;
    }

    const metrics: Metric[] = [
      { id: 1, name: 'Kickoff', amount: 5, date: '2024-01-05' },
      { id: 2, name: 'Review', amount: 10, date: '2024-02-10' },
      { id: 3, name: 'Launch', amount: 15, date: '2024-03-15' }
    ];

    const metricColumns: DataGridColumn<Metric>[] = [
      { key: 'name', title: 'Name' },
      {
        key: 'amount',
        title: 'Amount',
        filterable: true,
        filterType: 'number',
        filterOperator: 'between'
      },
      {
        key: 'date',
        title: 'Date',
        filterable: true,
        filterType: 'date',
        filterOperator: 'between'
      }
    ];

    it('filters numeric columns with a between range and open bounds', () => {
      render(
        <DataGrid data={metrics} columns={metricColumns} withColumnFilters withPagination={false} />
      );

      const from = screen.getByLabelText('Filter Amount from');
      const to = screen.getByLabelText('Filter Amount to');

      expect(from).toHaveAttribute('type', 'number');
      expect(to).toHaveAttribute('type', 'number');

      fireEvent.change(from, { target: { value: '6' } });
      fireEvent.change(to, { target: { value: '12' } });

      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.queryByText('Kickoff')).not.toBeInTheDocument();
      expect(screen.queryByText('Launch')).not.toBeInTheDocument();

      fireEvent.change(to, { target: { value: '' } });

      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
      expect(screen.queryByText('Kickoff')).not.toBeInTheDocument();
    });

    it('filters date columns with a between range', () => {
      render(
        <DataGrid data={metrics} columns={metricColumns} withColumnFilters withPagination={false} />
      );

      const from = screen.getByLabelText('Filter Date from');
      const to = screen.getByLabelText('Filter Date to');

      expect(from).toHaveAttribute('type', 'date');
      expect(to).toHaveAttribute('type', 'date');

      fireEvent.change(from, { target: { value: '2024-02-01' } });
      fireEvent.change(to, { target: { value: '2024-02-28' } });

      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.queryByText('Kickoff')).not.toBeInTheDocument();
      expect(screen.queryByText('Launch')).not.toBeInTheDocument();
    });

    it('supports notBetween and ignores invalid values', () => {
      const notBetweenColumns: DataGridColumn<Metric>[] = [
        { key: 'name', title: 'Name' },
        {
          key: 'amount',
          title: 'Amount',
          filterable: true,
          filterType: 'number',
          filterOperator: 'notBetween'
        }
      ];

      const { rerender } = render(
        <DataGrid
          data={metrics}
          columns={notBetweenColumns}
          withColumnFilters
          withPagination={false}
        />
      );

      fireEvent.change(screen.getByLabelText('Filter Amount from'), { target: { value: '6' } });
      fireEvent.change(screen.getByLabelText('Filter Amount to'), { target: { value: '12' } });

      expect(screen.getByText('Kickoff')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
      expect(screen.queryByText('Review')).not.toBeInTheDocument();

      rerender(
        <DataGrid
          data={metrics}
          columns={notBetweenColumns}
          withColumnFilters
          withPagination={false}
          filterValues={{ amount: 'invalid,invalid' }}
        />
      );

      expect(screen.getByText('Kickoff')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
    });

    it('parses range values and compares ranges', () => {
      expect(parseRangeFilterValue('5,10')).toEqual({ min: '5', max: '10' });
      expect(parseRangeFilterValue(',10')).toEqual({ min: '', max: '10' });
      expect(parseRangeFilterValue('5,')).toEqual({ min: '5', max: '' });
      expect(parseRangeFilterValue('5')).toEqual({ min: '5', max: '' });

      expect(matchesRangeFilter(10, '5,15', 'between')).toBe(true);
      expect(matchesRangeFilter(10, '5,15', 'notBetween')).toBe(false);
      expect(matchesRangeFilter(20, '5,15', 'notBetween')).toBe(true);
      expect(matchesRangeFilter('2024-02-10', '2024-02-01,2024-02-28', 'between')).toBe(true);
      expect(matchesRangeFilter('2024-03-10', '2024-02-01,2024-02-28', 'between')).toBe(false);
      expect(matchesRangeFilter(10, 'invalid,invalid', 'between')).toBe(true);
      expect(matchesRangeFilter(10, ',', 'between')).toBe(true);
    });

    it('has no accessibility violations with range filters', async () => {
      const { container } = render(
        <DataGrid
          data={metrics}
          columns={metricColumns}
          withColumnFilters
          withPagination={false}
          caption="Metrics"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('cell validation', () => {
    const validatingColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      {
        key: 'email',
        title: 'E-mail',
        validateCell: (value) =>
          typeof value === 'string' && value.includes('@') ? null : 'E-mail must contain @'
      }
    ];

    it('blocks invalid cell edits, keeps the editor open and reports the message', async () => {
      const user = userEvent.setup();
      const onCellEdit = jest.fn();
      const onCellValidationError = jest.fn();

      render(
        <DataGrid
          data={data}
          columns={validatingColumns}
          pageSize={5}
          withCellEditing
          onCellEdit={onCellEdit}
          onCellValidationError={onCellValidationError}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit E-mail for row 1' }));
      const input = screen.getByRole('textbox', { name: 'Edit E-mail for row 1' });
      await user.clear(input);
      await user.type(input, 'invalid{Enter}');

      expect(onCellEdit).not.toHaveBeenCalled();
      expect(onCellValidationError).toHaveBeenCalledWith(data[0], 'email', 'E-mail must contain @');
      expect(screen.getByRole('alert')).toHaveTextContent('E-mail must contain @');
      expect(input).toHaveAttribute('aria-invalid', 'true');

      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent(
        'E-mail must contain @'
      );

      await user.clear(input);
      await user.type(input, 'valid@example.com{Enter}');

      expect(onCellEdit).toHaveBeenCalledWith(data[0], 'email', 'valid@example.com');
      expect(
        screen.queryByRole('textbox', { name: 'Edit E-mail for row 1' })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('cancels a blocked cell edit with Escape', async () => {
      const user = userEvent.setup();
      const onCellEdit = jest.fn();

      render(
        <DataGrid
          data={data}
          columns={validatingColumns}
          pageSize={5}
          withCellEditing
          onCellEdit={onCellEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit E-mail for row 1' }));
      const input = screen.getByRole('textbox', { name: 'Edit E-mail for row 1' });
      await user.clear(input);
      await user.type(input, 'invalid');
      await user.keyboard('{Escape}');

      expect(onCellEdit).not.toHaveBeenCalled();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit E-mail for row 1' })).toBeInTheDocument();
    });

    it('blocks custom cell editors that fail validation', async () => {
      const user = userEvent.setup();
      const onCellEdit = jest.fn();
      const onCellValidationError = jest.fn();

      render(
        <DataGrid
          data={data}
          columns={validatingColumns}
          pageSize={5}
          withCellEditing
          defaultEditingCell={{ rowId: 1, columnKey: 'email' }}
          onCellEdit={onCellEdit}
          onCellValidationError={onCellValidationError}
          renderCellEditor={(row, column, value, onSave, onCancel) => (
            <input
              aria-label={`Custom editor ${column.key} ${String((row as User).id)}`}
              defaultValue={String(value ?? '')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSave(event.currentTarget.value);
                } else if (event.key === 'Escape') {
                  onCancel();
                }
              }}
            />
          )}
        />
      );

      const custom = screen.getByRole('textbox', { name: 'Custom editor email 1' });
      await user.clear(custom);
      await user.type(custom, 'invalid{Enter}');

      expect(onCellEdit).not.toHaveBeenCalled();
      expect(onCellValidationError).toHaveBeenCalledWith(data[0], 'email', 'E-mail must contain @');
      expect(screen.getByRole('alert')).toHaveTextContent('E-mail must contain @');
      expect(screen.getByRole('textbox', { name: 'Custom editor email 1' })).toBeInTheDocument();

      await user.clear(custom);
      await user.type(custom, 'ok@example.com{Enter}');

      expect(onCellEdit).toHaveBeenCalledWith(data[0], 'email', 'ok@example.com');
    });
  });

  describe('range paste', () => {
    const setClipboardText = (text: string) => {
      const readText = jest.fn<Promise<string>, []>(() => Promise.resolve(text));

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText }
      });

      return readText;
    };

    const selectAnchorCell = (rowIndex: number, columnIndex: number) => {
      const rows = screen.getAllByRole('row');

      fireEvent.mouseDown(within(rows[rowIndex]).getAllByRole('cell')[columnIndex], {
        button: 0
      });
    };

    it('pastes TSV from the clipboard starting at the range anchor', async () => {
      const readText = setClipboardText('Ana\tana@example.com\r\nBia\tbia@example.com\n');
      const onRangePaste = jest.fn();
      const text = 'Ana\tana@example.com\r\nBia\tbia@example.com\n';

      const { container } = render(
        <DataGrid
          data={data}
          columns={columns}
          pageSize={5}
          withRangeSelection
          onRangePaste={onRangePaste}
        />
      );

      selectAnchorCell(1, 0);

      const root = container.querySelector('.nebular-data-grid-root') as HTMLElement;
      fireEvent.keyDown(root, { key: 'v', ctrlKey: true });

      await waitFor(() => expect(onRangePaste).toHaveBeenCalledTimes(1));
      expect(readText).toHaveBeenCalledTimes(1);

      const [changes, pastedText] = onRangePaste.mock.calls[0];
      expect(pastedText).toBe(text);
      expect(changes).toEqual([
        { rowId: 1, columnKey: 'name', value: 'Ana' },
        { rowId: 1, columnKey: 'email', value: 'ana@example.com' },
        { rowId: 2, columnKey: 'name', value: 'Bia' },
        { rowId: 2, columnKey: 'email', value: 'bia@example.com' }
      ]);
      expect(screen.getByText('Charlie 1')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('4 cells pasted');
    });

    it('ignores pasted cells outside the grid bounds', async () => {
      const readText = setClipboardText('A\tB\tC\nD\tE\tF');
      const onRangePaste = jest.fn();

      const { container } = render(
        <DataGrid
          data={data}
          columns={columns}
          pageSize={5}
          withRangeSelection
          onRangePaste={onRangePaste}
        />
      );

      selectAnchorCell(5, 1);

      fireEvent.keyDown(container.querySelector('.nebular-data-grid-root') as HTMLElement, {
        key: 'V',
        ctrlKey: true
      });

      await waitFor(() => expect(onRangePaste).toHaveBeenCalledTimes(1));
      expect(readText).toHaveBeenCalledTimes(1);

      const [changes] = onRangePaste.mock.calls[0];
      expect(changes).toEqual([{ rowId: 5, columnKey: 'email', value: 'A' }]);
    });
  });

  describe('range fill', () => {
    const renderFillGrid = (onRangeFill: jest.Mock) =>
      render(
        <DataGrid
          data={data}
          columns={columns}
          pageSize={5}
          withRangeSelection
          withFillHandle
          onRangeFill={onRangeFill}
        />
      );

    const selectFirstCell = () => {
      const rows = screen.getAllByRole('row');

      fireEvent.mouseDown(within(rows[1]).getAllByRole('cell')[0], { button: 0 });
    };

    it('fills rows by dragging the fill handle', () => {
      const onRangeFill = jest.fn();
      const firePointer = (
        target: Element | Document,
        type: 'pointerdown' | 'pointermove' | 'pointerup',
        clientX: number,
        clientY: number
      ) => {
        const event = new Event(type, { bubbles: true, cancelable: true });

        Object.defineProperty(event, 'clientX', { value: clientX });
        Object.defineProperty(event, 'clientY', { value: clientY });
        fireEvent(target, event);
      };

      renderFillGrid(onRangeFill);
      selectFirstCell();

      const handle = screen.getByRole('button', { name: 'Fill handle' });
      firePointer(handle, 'pointerdown', 100, 100);
      firePointer(document, 'pointermove', 100, 188);
      firePointer(document, 'pointerup', 100, 188);

      expect(onRangeFill).toHaveBeenCalledTimes(1);

      const [changes, sourceRange, targetRange] = onRangeFill.mock.calls[0];
      expect(sourceRange).toEqual({
        startRowId: 1,
        endRowId: 1,
        startColumnKey: 'name',
        endColumnKey: 'name'
      });
      expect(targetRange).toEqual({
        startRowId: 2,
        endRowId: 3,
        startColumnKey: 'name',
        endColumnKey: 'name'
      });
      expect(changes).toEqual([
        { rowId: 2, columnKey: 'name', value: 'Charlie 1' },
        { rowId: 3, columnKey: 'name', value: 'Charlie 1' }
      ]);
      expect(screen.getByText('Alice 2')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('2 cells filled');
    });

    it('fills rows with the keyboard on the fill handle and applies with Enter', async () => {
      const user = userEvent.setup();
      const onRangeFill = jest.fn();

      renderFillGrid(onRangeFill);
      selectFirstCell();

      const handle = screen.getByRole('button', { name: 'Fill handle' });
      handle.focus();
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

      expect(onRangeFill).toHaveBeenCalledTimes(1);

      const [changes, , targetRange] = onRangeFill.mock.calls[0];
      expect(targetRange).toEqual({
        startRowId: 2,
        endRowId: 3,
        startColumnKey: 'name',
        endColumnKey: 'name'
      });
      expect(changes).toHaveLength(2);

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('status')).toHaveTextContent('2 cells filled');
      await user.keyboard('{Escape}');
    });
  });

  describe('tree data', () => {
    interface OrgNode {
      id: number;
      name: string;
      role: string;
      children?: OrgNode[];
    }

    const orgTree: OrgNode[] = [
      {
        id: 1,
        name: 'Alice',
        role: 'CEO',
        children: [
          {
            id: 2,
            name: 'Bruno',
            role: 'CTO',
            children: [{ id: 3, name: 'Carla', role: 'Developer' }]
          },
          { id: 4, name: 'Diego', role: 'CFO' }
        ]
      },
      { id: 5, name: 'Elena', role: 'COO' }
    ];

    const orgColumns: DataGridColumn<OrgNode>[] = [
      { key: 'name', title: 'Name' },
      { key: 'role', title: 'Role' }
    ];

    it('flattens the tree, indents rows and expands from the default keys', async () => {
      const user = userEvent.setup();

      render(
        <DataGrid
          data={orgTree}
          columns={orgColumns}
          treeData
          getRowChildren={(row) => row.children}
          defaultExpandedRowKeys={[1]}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bruno')).toBeInTheDocument();
      expect(screen.getByText('Diego')).toBeInTheDocument();
      expect(screen.getByText('Elena')).toBeInTheDocument();
      expect(screen.queryByText('Carla')).not.toBeInTheDocument();

      const brunoToggle = screen.getByRole('button', { name: 'Expand row 2' });
      expect(brunoToggle).toHaveAttribute('aria-expanded', 'false');
      expect(brunoToggle.parentElement).toHaveStyle({ paddingInlineStart: '16px' });

      await user.click(brunoToggle);

      expect(screen.getByText('Carla')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collapse row 2' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      expect(screen.getByText('Carla').closest('td')?.firstElementChild).toHaveStyle({
        paddingInlineStart: '32px'
      });

      await user.click(screen.getByRole('button', { name: 'Collapse row 1' }));

      expect(screen.queryByText('Bruno')).not.toBeInTheDocument();
      expect(screen.queryByText('Carla')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Expand row 1' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('supports controlled expanded row keys', async () => {
      const user = userEvent.setup();
      const onExpandedRowKeysChange = jest.fn();
      const { rerender } = render(
        <DataGrid
          data={orgTree}
          columns={orgColumns}
          treeData
          getRowChildren={(row) => row.children}
          expandedRowKeys={[]}
          onExpandedRowKeysChange={onExpandedRowKeysChange}
        />
      );

      expect(screen.getByRole('button', { name: 'Expand row 1' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
      expect(screen.queryByText('Bruno')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Expand row 1' }));

      expect(onExpandedRowKeysChange).toHaveBeenCalledWith([1]);
      expect(screen.queryByText('Bruno')).not.toBeInTheDocument();

      rerender(
        <DataGrid
          data={orgTree}
          columns={orgColumns}
          treeData
          getRowChildren={(row) => row.children}
          expandedRowKeys={[1]}
          onExpandedRowKeysChange={onExpandedRowKeysChange}
        />
      );

      expect(screen.getByText('Bruno')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collapse row 1' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('toggles rows with the keyboard when the tree cell is focused', () => {
      render(
        <DataGrid
          data={orgTree}
          columns={orgColumns}
          treeData
          getRowChildren={(row) => row.children}
          defaultExpandedRowKeys={[1]}
        />
      );

      const brunoCell = screen
        .getByRole('button', { name: 'Expand row 2' })
        .closest('td') as HTMLElement;

      brunoCell.focus();
      expect(brunoCell).toHaveFocus();

      fireEvent.keyDown(brunoCell, { key: 'ArrowRight' });
      expect(screen.getByText('Carla')).toBeInTheDocument();

      fireEvent.keyDown(brunoCell, { key: 'ArrowLeft' });
      expect(screen.queryByText('Carla')).not.toBeInTheDocument();

      fireEvent.keyDown(brunoCell, { key: 'Enter' });
      expect(screen.getByText('Carla')).toBeInTheDocument();

      fireEvent.keyDown(brunoCell, { key: ' ' });
      expect(screen.queryByText('Carla')).not.toBeInTheDocument();
    });

    it('ignores pagination and disables tree mode when grouping is active', () => {
      const roots: OrgNode[] = Array.from({ length: 15 }, (_, index) => ({
        id: index + 1,
        name: `Root ${index + 1}`,
        role: 'Member'
      }));
      const { unmount } = render(
        <DataGrid
          data={roots}
          columns={orgColumns}
          treeData
          getRowChildren={() => undefined}
          pageSize={5}
        />
      );

      expect(screen.getByText('Root 15')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Page 2' })).not.toBeInTheDocument();

      unmount();

      render(
        <DataGrid
          data={orgTree}
          columns={orgColumns}
          treeData
          getRowChildren={(row) => row.children}
          groupBy="role"
        />
      );

      expect(screen.queryByRole('button', { name: /Expand row/ })).not.toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('has no accessibility violations with tree data', async () => {
      const { container } = render(
        <DataGrid
          data={orgTree}
          columns={orgColumns}
          treeData
          getRowChildren={(row) => row.children}
          defaultExpandedRowKeys={[1, 2]}
          caption="Org chart"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('server-side grouping', () => {
    const serverColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      { key: 'email', title: 'E-mail' },
      { key: 'id', title: 'ID', align: 'right' }
    ];

    const serverGroups: DataGridServerGroup<User>[] = [
      {
        key: 'charlie',
        label: 'Charlie',
        count: 2,
        aggregates: { id: 42 },
        rows: [
          { id: 1, name: 'Charlie 1', email: 'user1@example.com' },
          { id: 2, name: 'Charlie 2', email: 'user2@example.com' }
        ],
        children: [
          {
            key: 'charlie-senior',
            label: 'Charlie senior',
            rows: [{ id: 7, name: 'Charlie 7', email: 'user7@example.com' }]
          }
        ]
      },
      {
        key: 'alice',
        label: 'Alice',
        rows: [{ id: 4, name: 'Alice 4', email: 'user4@example.com' }]
      }
    ];

    it('renders pre-grouped data, counts and server aggregates while ignoring data', () => {
      render(
        <DataGrid
          data={[{ id: 99, name: 'Ignored local row', email: 'ignored@example.com' }]}
          columns={serverColumns}
          serverSideGrouping
          groupedData={serverGroups}
        />
      );

      expect(screen.getByText('Charlie')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Ignored local row')).not.toBeInTheDocument();
      expect(screen.getByText('Charlie 1')).toBeInTheDocument();
      expect(screen.getByText('Charlie senior')).toBeInTheDocument();
      expect(screen.getByText('Charlie 7')).toBeInTheDocument();

      expect(screen.getByText('Charlie').closest('div')).toHaveTextContent('Charlie2');
      expect(screen.getByText('42')).toHaveAttribute('data-datagrid-aggregate', 'id');
    });

    it('expands and collapses server groups and reports the expanded keys', async () => {
      const user = userEvent.setup();
      const onExpandedGroupKeysChange = jest.fn();

      render(
        <DataGrid
          data={[]}
          columns={serverColumns}
          serverSideGrouping
          groupedData={serverGroups}
          onExpandedGroupKeysChange={onExpandedGroupKeysChange}
        />
      );

      expect(screen.getByText('Charlie 1')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Collapse group charlie' }));

      expect(screen.queryByText('Charlie 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Charlie senior')).not.toBeInTheDocument();

      const [expandedKeys] = onExpandedGroupKeysChange.mock.calls[0] as [string[]];
      expect(expandedKeys).toContain('charlie-senior');
      expect(expandedKeys).toContain('alice');
      expect(expandedKeys).not.toContain('charlie');
      expect(screen.getByRole('button', { name: 'Expand group charlie' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('supports controlled expanded server group keys', async () => {
      const user = userEvent.setup();
      const onExpandedGroupKeysChange = jest.fn();
      const { rerender } = render(
        <DataGrid
          data={[]}
          columns={serverColumns}
          serverSideGrouping
          groupedData={serverGroups}
          expandedGroupKeys={['charlie']}
          onExpandedGroupKeysChange={onExpandedGroupKeysChange}
        />
      );

      expect(screen.getByText('Charlie 1')).toBeInTheDocument();
      expect(screen.getByText('Charlie senior')).toBeInTheDocument();
      expect(screen.queryByText('Charlie 7')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Collapse group charlie' }));

      expect(onExpandedGroupKeysChange).toHaveBeenCalledWith([]);
      expect(screen.getByText('Charlie 1')).toBeInTheDocument();

      rerender(
        <DataGrid
          data={[]}
          columns={serverColumns}
          serverSideGrouping
          groupedData={serverGroups}
          expandedGroupKeys={[]}
          onExpandedGroupKeysChange={onExpandedGroupKeysChange}
        />
      );

      expect(screen.queryByText('Charlie 1')).not.toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('has no accessibility violations with server-side grouping', async () => {
      const { container } = render(
        <DataGrid
          data={[]}
          columns={serverColumns}
          serverSideGrouping
          groupedData={serverGroups}
          withSelection
          caption="Grouped users"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('column autofit', () => {
    const autofitColumns: DataGridColumn<User>[] = [
      { key: 'name', title: 'Name' },
      { key: 'email', title: 'E-mail' }
    ];
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    beforeEach(() => {
      // jsdom ships a stub canvas: force the deterministic character-count
      // fallback unless a test installs its own measureText implementation.
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value: () => null
      });
    });

    afterEach(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value: originalGetContext
      });
    });

    it('measures headers and cells and applies the widths', () => {
      const onColumnWidthChange = jest.fn();

      render(
        <DataGrid
          data={data}
          columns={autofitColumns}
          withColumnAutofit
          onColumnWidthChange={onColumnWidthChange}
        />
      );

      expect(onColumnWidthChange).toHaveBeenCalledTimes(1);
      expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 108, email: 172 });
      expect(screen.getByRole('columnheader', { name: 'E-mail' })).toHaveStyle({
        width: '172px'
      });
    });

    it('clamps measured widths to minColumnWidth and maxColumnWidth', () => {
      const onColumnWidthChange = jest.fn();

      render(
        <DataGrid
          data={data}
          columns={autofitColumns}
          withColumnAutofit
          minColumnWidth={120}
          maxColumnWidth={130}
          onColumnWidthChange={onColumnWidthChange}
        />
      );

      expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 120, email: 130 });
    });

    it('keeps explicit column widths and recomputes when data changes', () => {
      const onColumnWidthChange = jest.fn();
      const { rerender } = render(
        <DataGrid
          data={data}
          columns={autofitColumns}
          withColumnAutofit
          columnWidths={{ name: 240 }}
          onColumnWidthChange={onColumnWidthChange}
        />
      );

      expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 240, email: 172 });

      rerender(
        <DataGrid
          data={[{ id: 1, name: 'Ana', email: 'ana.verylong.address@example.com' }]}
          columns={autofitColumns}
          withColumnAutofit
          columnWidths={{ name: 240 }}
          onColumnWidthChange={onColumnWidthChange}
        />
      );

      expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 240, email: 284 });
    });

    it('uses canvas measureText when it is available', () => {
      const onColumnWidthChange = jest.fn();
      const measureText = jest.fn((text: string) => ({ width: text.length * 10 }));

      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        configurable: true,
        value: () => ({ font: '', measureText })
      });

      render(
        <DataGrid
          data={[{ id: 1, name: 'Ana', email: 'a@b.co' }]}
          columns={autofitColumns}
          withColumnAutofit
          onColumnWidthChange={onColumnWidthChange}
        />
      );

      expect(measureText).toHaveBeenCalledWith('Name');
      expect(measureText).toHaveBeenCalledWith('a@b.co');
      expect(onColumnWidthChange).toHaveBeenLastCalledWith({ name: 80, email: 88 });
    });

    it('has no accessibility violations with column autofit', async () => {
      const { container } = render(
        <DataGrid
          data={data}
          columns={autofitColumns}
          withColumnAutofit
          withColumnResize
          caption="Autofit users"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('cell spanning', () => {
    it('renders column spans in headers, body and footer', () => {
      const spanColumns: DataGridColumn<User>[] = [
        { key: 'name', title: 'Name', colSpan: 2 },
        { key: 'email', title: 'E-mail', colSpan: 2 },
        { key: 'id', title: 'ID' }
      ];

      const { container } = render(
        <DataGrid
          data={data.slice(0, 2)}
          columns={spanColumns}
          withPagination={false}
          withSummary
          summaryLabel="Total"
        />
      );

      const header = screen.getByRole('columnheader', { name: 'Name' });
      expect(header).toHaveAttribute('colspan', '2');
      expect(screen.queryByRole('columnheader', { name: 'E-mail' })).not.toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();

      const firstRowCells = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
      expect(firstRowCells).toHaveLength(2);
      expect(firstRowCells[0]).toHaveAttribute('colspan', '2');

      const footer = container.querySelector('tfoot') as HTMLElement;
      expect(within(footer).getAllByRole('cell')).toHaveLength(2);
      expect(within(footer).getAllByRole('cell')[0]).toHaveAttribute('colspan', '2');
    });

    it('renders header row spans over the filter row', () => {
      const rowSpanColumns: DataGridColumn<User>[] = [
        { key: 'name', title: 'Name', rowSpan: 2 },
        { key: 'email', title: 'E-mail', filterable: true }
      ];

      render(
        <DataGrid
          data={data.slice(0, 2)}
          columns={rowSpanColumns}
          withPagination={false}
          withColumnFilters
        />
      );

      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute('rowspan', '2');
      expect(screen.queryByRole('searchbox', { name: 'Filter by Name' })).not.toBeInTheDocument();
      expect(screen.getByRole('searchbox', { name: 'Filter by E-mail' })).toBeInTheDocument();
    });

    it('renders body row spans and omits covered cells', () => {
      const rowSpanColumns: DataGridColumn<User>[] = [
        { key: 'name', title: 'Name', rowSpan: 2 },
        { key: 'email', title: 'E-mail' }
      ];

      render(<DataGrid data={data.slice(0, 2)} columns={rowSpanColumns} withPagination={false} />);

      const rows = screen.getAllByRole('row');
      const firstCells = within(rows[1]).getAllByRole('cell');
      expect(firstCells).toHaveLength(2);
      expect(firstCells[0]).toHaveAttribute('rowspan', '2');

      const secondCells = within(rows[2]).getAllByRole('cell');
      expect(secondCells).toHaveLength(1);
      expect(secondCells[0]).toHaveTextContent('user2@example.com');
    });

    it('does not apply spans when columns are pinned', () => {
      const pinnedSpanColumns: DataGridColumn<User>[] = [
        { key: 'name', title: 'Name', colSpan: 2, pinned: 'left' },
        { key: 'email', title: 'E-mail' }
      ];

      render(
        <DataGrid data={data.slice(0, 2)} columns={pinnedSpanColumns} withPagination={false} />
      );

      expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('colspan');
    });

    it('has no accessibility violations with spans, validation and fill handle', async () => {
      const spanColumns: DataGridColumn<User>[] = [
        {
          key: 'name',
          title: 'Name',
          colSpan: 2,
          editable: true,
          validateCell: (value) => (String(value ?? '').length > 0 ? null : 'Name is required')
        },
        { key: 'email', title: 'E-mail', editable: true },
        { key: 'id', title: 'ID' }
      ];
      const { container } = render(
        <DataGrid
          data={data.slice(0, 3)}
          columns={spanColumns}
          withPagination={false}
          withSummary
          withCellEditing
          withRangeSelection
          withFillHandle
          caption="Users"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('undo/redo', () => {
    function EditableGrid({
      maxHistory,
      onCellEdit,
      onUndo,
      onRedo,
      onRowReorder
    }: {
      maxHistory?: number;
      onCellEdit?(row: User, columnKey: string, value: unknown): void;
      onUndo?(entry: unknown): void;
      onRedo?(entry: unknown): void;
      onRowReorder?(fromIndex: number, toIndex: number): void;
    }) {
      const [rows, setRows] = React.useState<User[]>(data);

      return (
        <DataGrid
          data={rows}
          columns={columns}
          pageSize={5}
          withCellEditing
          withUndoRedo
          maxHistory={maxHistory}
          withRowReorder={Boolean(onRowReorder)}
          onRowReorder={onRowReorder}
          onUndo={onUndo}
          onRedo={onRedo}
          onCellEdit={(row, columnKey, value) => {
            onCellEdit?.(row, columnKey, value);
            setRows((current) =>
              current.map((item) => (item.id === row.id ? { ...item, [columnKey]: value } : item))
            );
          }}
        />
      );
    }

    const editName = async (user: ReturnType<typeof userEvent.setup>, value: string) => {
      await user.click(screen.getByRole('button', { name: 'Edit Name for row 1' }));
      const input = screen.getByRole('textbox', { name: 'Edit Name for row 1' });
      await user.clear(input);
      await user.type(input, `${value}{Enter}`);
    };

    it('undoes and redoes a cell edit from the keyboard', async () => {
      const user = userEvent.setup();
      const onCellEdit = jest.fn();
      const onUndo = jest.fn();
      const onRedo = jest.fn();
      const { container } = render(
        <EditableGrid onCellEdit={onCellEdit} onUndo={onUndo} onRedo={onRedo} />
      );
      const root = container.querySelector('.nebular-data-grid-root') as HTMLElement;

      await editName(user, 'Zed');

      expect(screen.getByText('Zed')).toBeInTheDocument();

      fireEvent.keyDown(root, { key: 'z', ctrlKey: true });

      expect(screen.getByText('Charlie 1')).toBeInTheDocument();
      expect(onUndo).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'cell', columnKey: 'name', before: 'Charlie 1' })
      );

      fireEvent.keyDown(root, { key: 'z', ctrlKey: true, shiftKey: true });

      expect(screen.getByText('Zed')).toBeInTheDocument();
      expect(onRedo).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(root, { key: 'z', ctrlKey: true });
      fireEvent.keyDown(root, { key: 'y', ctrlKey: true });

      expect(screen.getByText('Zed')).toBeInTheDocument();
    });

    it('exposes undo and redo buttons with aria labels', async () => {
      const user = userEvent.setup();

      render(<EditableGrid />);

      const undoButton = screen.getByRole('button', { name: 'Undo' });
      const redoButton = screen.getByRole('button', { name: 'Redo' });

      expect(undoButton).toBeDisabled();
      expect(redoButton).toBeDisabled();

      await editName(user, 'Grace');

      expect(undoButton).toBeEnabled();

      await user.click(undoButton);

      expect(screen.getByText('Charlie 1')).toBeInTheDocument();
      expect(redoButton).toBeEnabled();

      await user.click(redoButton);

      expect(screen.getByText('Grace')).toBeInTheDocument();
    });

    it('limits the history to maxHistory entries', async () => {
      const user = userEvent.setup();

      render(<EditableGrid maxHistory={2} />);

      await editName(user, 'A');
      await editName(user, 'B');
      await editName(user, 'C');

      const undoButton = screen.getByRole('button', { name: 'Undo' });

      await user.click(undoButton);
      expect(screen.getByText('B')).toBeInTheDocument();

      await user.click(undoButton);
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(undoButton).toBeDisabled();
    });

    it('reports the inverse changes when undoing a row edit', async () => {
      const user = userEvent.setup();
      const onRowEdit = jest.fn();
      const { container } = render(
        <DataGrid
          data={data}
          columns={columns}
          pageSize={5}
          withRowEditing
          withUndoRedo
          onRowEdit={onRowEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit row 1' }));
      const nameInput = screen.getByRole('textbox', { name: 'Edit Name' });
      await user.clear(nameInput);
      await user.type(nameInput, 'Alicia');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onRowEdit).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(container.querySelector('.nebular-data-grid-root') as HTMLElement, {
        key: 'z',
        ctrlKey: true
      });

      expect(onRowEdit).toHaveBeenCalledTimes(2);
      expect(onRowEdit).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 1 }),
        expect.objectContaining({ name: 'Charlie 1', email: 'user1@example.com' })
      );
      expect(data[0].name).toBe('Charlie 1');
    });

    it('undoes and redoes a row reorder', () => {
      const onRowReorder = jest.fn();
      const { container } = render(<EditableGrid onRowReorder={onRowReorder} />);
      const root = container.querySelector('.nebular-data-grid-root') as HTMLElement;
      const handles = screen.getAllByRole('button', { name: /Reorder row/ });

      fireEvent.keyDown(handles[0], { key: 'ArrowDown', altKey: true });
      expect(onRowReorder).toHaveBeenCalledWith(0, 1);

      fireEvent.keyDown(root, { key: 'z', ctrlKey: true });
      expect(onRowReorder).toHaveBeenLastCalledWith(1, 0);

      fireEvent.keyDown(root, { key: 'z', ctrlKey: true, shiftKey: true });
      expect(onRowReorder).toHaveBeenCalledTimes(3);
      expect(onRowReorder).toHaveBeenLastCalledWith(0, 1);
    });

    it('clears the history when the dataset is replaced', async () => {
      const user = userEvent.setup();
      const onCellEdit = jest.fn();
      const { rerender } = render(
        <DataGrid
          data={data}
          columns={columns}
          pageSize={5}
          withCellEditing
          withUndoRedo
          onCellEdit={onCellEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Edit Name for row 1' }));
      const input = screen.getByRole('textbox', { name: 'Edit Name for row 1' });
      await user.clear(input);
      await user.type(input, 'Changed{Enter}');

      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();

      rerender(
        <DataGrid
          data={data.slice(6)}
          columns={columns}
          pageSize={5}
          withCellEditing
          withUndoRedo
          onCellEdit={onCellEdit}
        />
      );

      expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
    });
  });

  describe('excel export', () => {
    it('builds an Excel HTML table with namespaces, headers and aggregates', () => {
      const summaryColumns: DataGridColumn<User>[] = [
        { key: 'name', title: 'Name' },
        { key: 'id', title: 'ID', aggregate: 'sum' },
        { key: 'email', title: 'E-mail', aggregate: 'count' }
      ];
      const html = createDataGridExcel(summaryColumns, [data[0]], {
        fileName: 'users',
        summaryRows: data.slice(0, 2),
        summaryLabel: 'Total',
        sheetName: 'People'
      });

      expect(html).toContain('xmlns:x="urn:schemas-microsoft-com:office:excel"');
      expect(html).toContain('<x:Name>People</x:Name>');
      expect(html).toContain('<th>Name</th>');
      expect(html).toContain('<td>Charlie 1</td>');
      expect(html).toContain('<td>1</td>');
      expect(html).toContain('<tfoot>');
      expect(html).toContain('<td>Total</td>');
      expect(html).toContain('<td>3</td>');
      expect(html).toContain('<td>2</td>');
    });

    it('escapes HTML and neutralizes formula injection', () => {
      const risky = [
        { id: 1, name: '<script>alert("x")</script>', email: '=SUM(A1:A2)' },
        { id: 2, name: '+lead@example.com', email: '@cmd' },
        { id: 3, name: '-5', email: 'plain' }
      ];
      const html = createDataGridExcel(columns, risky);

      expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
      expect(html).toContain('&#39;=SUM(A1:A2)');
      expect(html).toContain('&#39;+lead@example.com');
      expect(html).toContain('&#39;@cmd');
      expect(html).toContain('&#39;-5');
    });

    it('exports the visible columns from the toolbar button', async () => {
      const user = userEvent.setup();
      const onExcelExport = jest.fn();

      render(
        <DataGrid
          data={data}
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'E-mail', exportable: false },
            { key: 'id', title: 'ID' }
          ]}
          pageSize={5}
          hiddenColumnKeys={['id']}
          withExcelExport
          excelFileName="users"
          onExcelExport={onExcelExport}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Export Excel' }));

      const [html, fileName] = onExcelExport.mock.calls[0] as [string, string];

      expect(fileName).toBe('users.xls');
      expect(html).toContain('<th>Name</th>');
      expect(html).not.toContain('<th>E-mail</th>');
      expect(html).not.toContain('<th>ID</th>');
      expect(html).toContain('<td>Charlie 1</td>');
      expect(screen.getByRole('status')).toHaveTextContent('users.xls');
    });

    it('includes the summary row when withSummary is enabled', async () => {
      const user = userEvent.setup();
      const onExcelExport = jest.fn();
      const summaryExportColumns: DataGridColumn<User>[] = [
        { key: 'name', title: 'Name' },
        { key: 'id', title: 'ID', aggregate: 'sum' }
      ];

      render(
        <DataGrid
          data={data.slice(0, 2)}
          columns={summaryExportColumns}
          withPagination={false}
          withSummary
          withExcelExport
          onExcelExport={onExcelExport}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Export Excel' }));

      const [html] = onExcelExport.mock.calls[0] as [string, string];

      expect(html).toContain('<tfoot>');
      expect(html).toContain('<td>Total</td>');
      expect(html).toContain('<td>3</td>');
    });

    it('defaults the Excel file name to data-grid.xls', async () => {
      const user = userEvent.setup();
      const onExcelExport = jest.fn();

      render(
        <DataGrid
          data={data.slice(0, 1)}
          columns={columns}
          withExcelExport
          onExcelExport={onExcelExport}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Export Excel' }));

      expect(onExcelExport).toHaveBeenCalledWith(expect.any(String), 'data-grid.xls');
    });

    it('downloads the workbook with the Excel MIME type and file name', () => {
      const createObjectURL = jest.fn<string, [Blob]>(() => 'blob:data-grid');
      const revokeObjectURL = jest.fn();
      const originalCreate = URL.createObjectURL;
      const originalRevoke = URL.revokeObjectURL;

      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        value: createObjectURL
      });
      Object.defineProperty(URL, 'revokeObjectURL', {
        configurable: true,
        value: revokeObjectURL
      });

      let downloaded = '';
      const click = jest
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(function capture(this: HTMLAnchorElement) {
          downloaded = this.download;
        });

      try {
        const html = exportDataGridExcel(columns, [data[0]], { fileName: 'report' });

        expect(html).toContain('<th>Name</th>');
        expect(createObjectURL).toHaveBeenCalledTimes(1);

        const [[blob]] = createObjectURL.mock.calls;

        expect(blob.type).toBe('application/vnd.ms-excel');
        expect(downloaded).toBe('report.xls');
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:data-grid');
        expect(document.querySelector('a[download="report.xls"]')).toBeNull();
      } finally {
        click.mockRestore();
        Object.defineProperty(URL, 'createObjectURL', {
          configurable: true,
          value: originalCreate
        });
        Object.defineProperty(URL, 'revokeObjectURL', {
          configurable: true,
          value: originalRevoke
        });
      }
    });

    it('has no accessibility violations with the Excel and history toolbar', async () => {
      const { container } = render(
        <DataGrid
          data={data}
          columns={columns}
          pageSize={5}
          withCellEditing
          withUndoRedo
          withExcelExport
          caption="Users"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('server-side sorting and filtering', () => {
    it('delegates sorting to the server without reordering rows', async () => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();

      render(
        <DataGrid
          data={data.slice(0, 3)}
          columns={columns}
          serverSideSorting
          withPagination={false}
          onSortChange={onSortChange}
        />
      );

      const firstRowName = () =>
        within(screen.getAllByRole('row')[1]).getAllByRole('cell')[0].textContent;

      expect(firstRowName()).toBe('Charlie 1');

      await user.click(screen.getByRole('button', { name: /Name/ }));

      expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
      expect(firstRowName()).toBe('Charlie 1');
      expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveAttribute(
        'aria-sort',
        'ascending'
      );
    });

    it('delegates filtering to the server without filtering rows', async () => {
      const user = userEvent.setup();
      const onFilterChange = jest.fn();

      render(
        <DataGrid
          data={data.slice(0, 3)}
          columns={columns}
          serverSideFiltering
          withColumnFilters
          withPagination={false}
          onFilterChange={onFilterChange}
        />
      );

      await user.type(screen.getByRole('searchbox', { name: 'Filter by Name' }), 'zzz');

      expect(onFilterChange).toHaveBeenLastCalledWith({ name: 'zzz' });
      expect(screen.getByText('Charlie 1')).toBeInTheDocument();
      expect(screen.getByText('Bruno 3')).toBeInTheDocument();
    });

    it('marks the grid busy while a server operation is loading', () => {
      render(
        <DataGrid
          data={data.slice(0, 2)}
          columns={columns}
          serverSideSorting
          serverSideFiltering
          totalRows={12}
          loading
        />
      );

      expect(screen.getByRole('region', { name: 'Data grid' })).toHaveAttribute(
        'aria-busy',
        'true'
      );
    });
  });

  describe('variable row height virtualization', () => {
    it('computes the virtual row window from cumulative offsets', () => {
      const offsets = [0, 20, 60, 80, 140];

      expect(getVirtualRowRange(offsets, 0, 100, 0)).toEqual({
        start: 0,
        end: 4,
        topSpacer: 0,
        bottomSpacer: 0,
        totalHeight: 140
      });
      expect(getVirtualRowRange(offsets, 60, 40, 1)).toEqual({
        start: 1,
        end: 4,
        topSpacer: 20,
        bottomSpacer: 0,
        totalHeight: 140
      });
      expect(getVirtualRowRange(offsets, 500, 40, 1)).toEqual({
        start: 3,
        end: 4,
        topSpacer: 80,
        bottomSpacer: 0,
        totalHeight: 140
      });
      expect(getVirtualRowRange([0], 0, 100)).toEqual({
        start: 0,
        end: 0,
        topSpacer: 0,
        bottomSpacer: 0,
        totalHeight: 0
      });
    });

    it('sizes rows with getRowHeight and offsets the spacers', () => {
      const getRowHeight = (_row: User, index: number) => (index % 2 === 0 ? 30 : 50);
      const { container } = render(
        <DataGrid
          data={longData}
          columns={columns}
          withPagination={false}
          pageSize={500}
          virtualized
          virtualizedMaxHeight={300}
          getRowHeight={getRowHeight}
        />
      );

      const rows = screen.getAllByRole('row');

      expect(rows[1]).toHaveStyle({ height: '30px' });
      expect(rows[2]).toHaveStyle({ height: '50px' });

      const viewport = container.querySelector('[data-nebular-datagrid-viewport]') as HTMLElement;

      fireEvent.scroll(viewport, { target: { scrollTop: 1044 } });

      const spacers = container.querySelectorAll('tbody tr[aria-hidden="true"]');

      expect(spacers).toHaveLength(2);
      expect(spacers[0]).toHaveStyle({ height: '880px' });
      expect(spacers[1]).toHaveStyle({ height: '18610px' });
      expect(screen.getByText('User 23')).toBeInTheDocument();
      expect(screen.queryByText('User 22')).not.toBeInTheDocument();
    });

    it('scrolls to and focuses the active row', async () => {
      const { container } = render(
        <DataGrid
          data={longData}
          columns={columns}
          withPagination={false}
          pageSize={500}
          virtualized
          virtualizedMaxHeight={300}
          getRowHeight={() => 40}
          withCellEditing
          defaultEditingCell={{ rowId: 120, columnKey: 'name' }}
        />
      );

      const input = await screen.findByRole('textbox', { name: 'Edit Name for row 120' });
      const viewport = container.querySelector('[data-nebular-datagrid-viewport]') as HTMLElement;

      expect(viewport.scrollTop).toBeGreaterThan(0);
      expect(input).toHaveFocus();
    });

    it('keeps aria row metadata in variable-height mode', () => {
      render(
        <DataGrid
          data={longData}
          columns={columns}
          withPagination={false}
          pageSize={500}
          virtualized
          virtualizedMaxHeight={300}
          getRowHeight={() => 24}
        />
      );

      expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount', '501');
      expect(screen.getAllByRole('row')[1]).toHaveAttribute('aria-rowindex', '2');
    });

    it('has no accessibility violations with variable row heights', async () => {
      const { container } = render(
        <DataGrid
          data={longData}
          columns={columns}
          withPagination={false}
          pageSize={500}
          virtualized
          virtualizedMaxHeight={300}
          getRowHeight={(row) => (row.id % 2 === 0 ? 32 : 56)}
          caption="People"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
