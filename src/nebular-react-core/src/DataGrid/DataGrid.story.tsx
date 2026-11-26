import React, { useEffect, useState } from 'react';
import { NebularProvider } from '@nebular-react/styles';
import { Badge } from '../Badge';
import {
  DataGrid,
  DataGridColumn,
  DataGridDensity,
  DataGridServerGroup,
  DataGridSort,
  DataGridView
} from './DataGrid';
import { SegmentedControl } from '../SegmentedControl';

export default { title: 'DataGrid', component: DataGrid };

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const data: User[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: ['Alice Johnson', 'Bruno Costa', 'Carla Souza', 'Diego Alves'][index % 4],
  email: `user${index + 1}@example.com`,
  role: index % 3 === 0 ? 'Admin' : 'Member',
  active: index % 2 === 0
}));

const inlineBadgeStyle = { position: 'static', display: 'inline-block' } as const;

const columns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', sortable: true, filterable: true },
  { key: 'email', title: 'E-mail' },
  {
    key: 'role',
    title: 'Role',
    sortable: true,
    filterable: true,
    render: (user) => (
      <Badge
        text={user.role}
        status={user.role === 'Admin' ? 'primary' : 'basic'}
        style={inlineBadgeStyle}
      />
    )
  },
  {
    key: 'active',
    title: 'Status',
    sortable: true,
    render: (user) => (
      <Badge
        text={user.active ? 'Active' : 'Inactive'}
        status={user.active ? 'success' : 'basic'}
        style={{ ...inlineBadgeStyle, color: user.active ? '#12131a' : undefined }}
      />
    )
  }
];

export function Showcase() {
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Selected: {selectedRows.length}</div>
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withSelection
        onSelectionChange={setSelectedRows}
        caption="Users"
      />
    </div>
  );
}

const batchColumns: DataGridColumn<User>[] = [
  {
    key: 'name',
    title: 'Name',
    validateCell: (value) => (String(value ?? '').trim() ? null : 'Enter a name.')
  },
  {
    key: 'email',
    title: 'E-mail',
    validateCell: (value) => (String(value).includes('@') ? null : 'Enter a valid email.')
  },
  { key: 'role', title: 'Role', editable: false }
];

export function BatchEditing() {
  const [rows, setRows] = useState(data);
  return (
    <DataGrid
      data={rows}
      columns={batchColumns}
      getRowId={(row) => row.id}
      withRangeSelection
      withFillHandle
      batchEditing={{
        onCommit: (changes) => {
          setRows((current) =>
            current.map((row) =>
              changes.reduce(
                (updated, change) =>
                  change.rowId === row.id
                    ? { ...updated, [change.columnKey]: change.value }
                    : updated,
                row
              )
            )
          );
        }
      }}
    />
  );
}

export function WithoutPagination() {
  return <DataGrid data={data.slice(0, 4)} columns={columns} withPagination={false} />;
}

export function Empty() {
  return <DataGrid data={[]} columns={columns} emptyState="No users found" />;
}

export function WithColumnFilters() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Filters: {JSON.stringify(filters)}</div>
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withColumnFilters
        onFilterChange={setFilters}
        caption="Users"
      />
    </div>
  );
}

const virtualizedData: User[] = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: index % 3 === 0 ? 'Admin' : 'Member',
  active: index % 2 === 0
}));

export function Virtualized() {
  return (
    <DataGrid
      data={virtualizedData}
      columns={columns}
      pageSize={500}
      withPagination={false}
      virtualized
      virtualizedRowHeight={44}
      virtualizedMaxHeight={320}
      caption="Virtualized users"
    />
  );
}

export function ResizableAndReorderable() {
  return (
    <DataGrid
      data={data}
      columns={columns}
      pageSize={5}
      withColumnResize
      withColumnReorder
      caption="Users"
    />
  );
}

export function ControlledColumnLayout() {
  const [widths, setWidths] = useState<Record<string, number>>({
    name: 220,
    email: 260,
    role: 140,
    active: 140
  });
  const [order, setOrder] = useState<string[]>(columns.map((column) => column.key));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Order: {order.join(' → ')}</div>
      <div>Widths: {JSON.stringify(widths)}</div>
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withColumnResize
        withColumnReorder
        columnWidths={widths}
        columnOrder={order}
        onColumnWidthChange={setWidths}
        onColumnOrderChange={setOrder}
        caption="Users"
      />
    </div>
  );
}

export function ColumnVisibility() {
  const [hidden, setHidden] = useState<string[]>(['email']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Hidden: {hidden.join(', ') || 'none'}</div>
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withColumnVisibility
        hiddenColumnKeys={hidden}
        onHiddenColumnsChange={setHidden}
        caption="Users"
      />
    </div>
  );
}

export function ExpandableRows() {
  return (
    <DataGrid
      data={data}
      columns={columns}
      pageSize={5}
      withRowExpansion
      renderRowExpansion={(user) => (
        <div>
          <strong>{user.name}</strong>
          <div>{user.email}</div>
          <div>Role: {user.role}</div>
        </div>
      )}
      caption="Users"
    />
  );
}

export function Exportable() {
  const [csv, setCsv] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withExport
        exportFileName="users.csv"
        onExport={(content) => setCsv(content)}
        caption="Users"
      />
      <pre style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>{csv}</pre>
    </div>
  );
}

export function GroupedRows() {
  return (
    <DataGrid
      data={data}
      columns={columns}
      withPagination={false}
      groupBy={(user) => user.role}
      groupLabel={(key, rows) => `${key} (${rows.length})`}
      collapsibleGroups
      caption="Users by role"
    />
  );
}

export function EditableRows() {
  const [rows, setRows] = useState<User[]>(data);

  return (
    <DataGrid
      data={rows}
      columns={columns}
      pageSize={5}
      withRowEditing
      onRowEdit={(row, changes) =>
        setRows((current) =>
          current.map((item) => (item.id === row.id ? { ...item, ...changes } : item))
        )
      }
      caption="Editable users"
    />
  );
}

export function ServerSide() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataGridSort | null>({ key: 'name', direction: 'asc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<User[]>(data.slice(0, 5));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setRows(data.slice((page - 1) * 5, page * 5));
      setLoading(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [page, sort, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Server page {page} · sort {sort ? `${sort.key} ${sort.direction}` : 'none'} · filters{' '}
        {JSON.stringify(filters)}
      </div>
      <DataGrid
        data={rows}
        columns={columns}
        serverSide
        totalRows={data.length}
        page={page}
        pageSize={5}
        onPageChange={setPage}
        sortKey={sort?.key}
        sortDirection={sort?.direction}
        onSortChange={setSort}
        withColumnFilters
        filterValues={filters}
        onFilterChange={setFilters}
        loading={loading}
        caption="Server-side users"
      />
    </div>
  );
}

const pinnedColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', sortable: true, filterable: true, pinned: 'left', width: 200 },
  { key: 'email', title: 'E-mail', filterable: true, width: 220 },
  { key: 'role', title: 'Role', sortable: true, filterable: true, width: 140 },
  { key: 'active', title: 'Status', width: 140, pinned: 'right' }
];

export function PinnedColumns() {
  return (
    <DataGrid
      data={data}
      columns={pinnedColumns}
      pageSize={5}
      withColumnFilters
      caption="Pinned columns"
    />
  );
}

const groupedColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', sortable: true, filterable: true, width: 220 },
  {
    key: 'contact',
    title: 'Contact',
    children: [
      { key: 'email', title: 'E-mail', sortable: true, filterable: true },
      { key: 'role', title: 'Role', sortable: true, filterable: true }
    ]
  },
  { key: 'active', title: 'Status', width: 140 }
];

export function MultiLevelHeaders() {
  return (
    <DataGrid
      data={data}
      columns={groupedColumns}
      pageSize={5}
      withColumnFilters
      caption="Grouped headers"
    />
  );
}

const summaryColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'role', title: 'Role' },
  {
    key: 'id',
    title: 'Registros',
    aggregate: 'count',
    align: 'right'
  },
  {
    key: 'active',
    title: 'Ativos',
    aggregate: (rows) => rows.filter((row) => row.active).length,
    align: 'right'
  }
];

export function WithSummary() {
  return (
    <DataGrid
      data={data}
      columns={summaryColumns}
      pageSize={5}
      withSummary
      summaryLabel="Total"
      caption="Aggregated summary"
    />
  );
}

export function PageSummary() {
  return (
    <DataGrid
      data={data}
      columns={summaryColumns}
      pageSize={5}
      withSummary
      summaryScope="page"
      summaryLabel="Nesta página"
      caption="Page-scoped summary"
    />
  );
}

export function ReorderableRows() {
  const [rows, setRows] = useState<User[]>(data);

  return (
    <DataGrid
      data={rows}
      columns={columns}
      pageSize={6}
      withRowReorder
      onRowReorder={(fromIndex, toIndex) => {
        setRows((current) => {
          const next = [...current];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return next;
        });
      }}
      caption="Reorderable rows"
    />
  );
}

const operatorColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name', filterable: true, filterOperator: 'startsWith' },
  { key: 'email', title: 'E-mail', filterable: true, filterOperator: 'contains' },
  { key: 'id', title: 'ID', filterable: true, filterOperator: 'gte', align: 'right' }
];

export function FilterOperators() {
  return (
    <DataGrid
      data={data}
      columns={operatorColumns}
      pageSize={6}
      withColumnFilters
      caption="Filter operators"
    />
  );
}

export function ColumnMenu() {
  return (
    <DataGrid
      data={data}
      columns={columns}
      pageSize={6}
      withColumnMenu
      withColumnVisibility
      caption="Column menu"
    />
  );
}

const groupSummaryColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' },
  { key: 'id', title: 'Total', aggregate: 'sum', summaryValue: (user) => user.id }
];

export function GroupedSummary() {
  return (
    <DataGrid
      data={data}
      columns={groupSummaryColumns}
      pageSize={12}
      groupBy="role"
      withGroupSummary
      summaryLabel="Subtotal"
      caption="Grouped summary"
    />
  );
}

export function NestedGrouping() {
  return (
    <DataGrid
      data={data}
      columns={columns}
      pageSize={12}
      groupBy={['role', 'active']}
      collapsibleGroups
      caption="Nested grouping"
    />
  );
}

export function CellEditing() {
  const [rows, setRows] = useState<User[]>(data);

  return (
    <DataGrid
      data={rows}
      columns={columns}
      pageSize={6}
      withCellEditing
      onCellEdit={(row, columnKey, value) =>
        setRows((current) =>
          current.map((item) =>
            item.id === row.id ? { ...item, [columnKey]: String(value) } : item
          )
        )
      }
      caption="Cell editing"
    />
  );
}

const manyColumns: DataGridColumn<User>[] = Array.from({ length: 24 }, (_, index) => ({
  key: `metric${index}`,
  title: `Metric ${index}`,
  width: 120,
  render: (user) => `${user.id * (index + 1)}`
}));

export function VirtualizedColumns() {
  return (
    <DataGrid
      data={data}
      columns={manyColumns}
      pageSize={6}
      virtualizeColumns
      columnVirtualizationOverscan={1}
      caption="Virtualized columns"
    />
  );
}

export function RangeSelection() {
  return (
    <DataGrid
      data={data}
      columns={columns}
      pageSize={6}
      withRangeSelection
      caption="Range selection (Shift+click, Ctrl/Cmd+C)"
    />
  );
}

const initialViews: DataGridView[] = [
  {
    id: 'admins',
    name: 'Admins',
    sort: { key: 'name', direction: 'asc' },
    filters: { role: 'Admin' },
    pageSize: 5
  },
  {
    id: 'members',
    name: 'Members',
    sort: { key: 'name', direction: 'asc' },
    filters: { role: 'Member' },
    hiddenColumnKeys: ['email'],
    pageSize: 5
  }
];

export function SavedViews() {
  const [views, setViews] = useState<DataGridView[]>(initialViews);
  const [activeViewId, setActiveViewId] = useState<string | null>('admins');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Active view: {activeViewId ?? 'none'} · {views.length} saved
      </div>
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withViews
        withColumnFilters
        views={views}
        onViewsChange={setViews}
        activeViewId={activeViewId}
        onActiveViewChange={setActiveViewId}
        caption="Users with saved views"
      />
    </div>
  );
}

interface Invoice {
  id: number;
  customer: string;
  amount: number;
  discount: number;
  issuedAt: string;
}

const invoices: Invoice[] = [
  { id: 1, customer: 'Alice Johnson', amount: 120, discount: 5, issuedAt: '2024-01-05' },
  { id: 2, customer: 'Bruno Costa', amount: 340, discount: 15, issuedAt: '2024-02-10' },
  { id: 3, customer: 'Carla Souza', amount: 560, discount: 0, issuedAt: '2024-03-15' },
  { id: 4, customer: 'Diego Alves', amount: 780, discount: 25, issuedAt: '2024-04-20' },
  { id: 5, customer: 'Elena Lima', amount: 950, discount: 10, issuedAt: '2024-05-25' }
];

const invoiceColumns: DataGridColumn<Invoice>[] = [
  { key: 'customer', title: 'Customer', filterable: true, width: 220 },
  {
    key: 'amount',
    title: 'Amount',
    filterable: true,
    filterType: 'number',
    filterOperator: 'between',
    align: 'right'
  },
  {
    key: 'discount',
    title: 'Discount',
    filterable: true,
    filterType: 'number',
    filterOperator: 'notBetween',
    align: 'right'
  },
  {
    key: 'issuedAt',
    title: 'Issued',
    filterable: true,
    filterType: 'date',
    filterOperator: 'between'
  }
];

export function RangeFilters() {
  return (
    <DataGrid
      data={invoices}
      columns={invoiceColumns}
      withColumnFilters
      withPagination={false}
      caption="Range filters"
    />
  );
}

const validationColumns: DataGridColumn<User>[] = [
  {
    key: 'name',
    title: 'Name',
    editable: true,
    validateCell: (value) =>
      String(value ?? '').trim().length >= 3 ? null : 'Name needs at least 3 characters'
  },
  {
    key: 'email',
    title: 'E-mail',
    editable: true,
    validateCell: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '')) ? null : 'Enter a valid e-mail'
  },
  { key: 'role', title: 'Role', editable: true },
  { key: 'active', title: 'Status', editable: false }
];

export function CellValidation() {
  const [rows, setRows] = useState<User[]>(data);
  const [lastError, setLastError] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div role="status">{lastError || 'Edit a cell to run its validation'}</div>
      <DataGrid
        data={rows}
        columns={validationColumns}
        pageSize={6}
        withCellEditing
        onCellValidationError={(_row, columnKey, message) =>
          setLastError(`${columnKey}: ${message}`)
        }
        onCellEdit={(row, columnKey, value) =>
          setRows((current) =>
            current.map((item) =>
              item.id === row.id ? ({ ...item, [columnKey]: value } as User) : item
            )
          )
        }
        caption="Cell validation"
      />
    </div>
  );
}

const pasteColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'E-mail' }
];

export function RangePaste() {
  const [rows, setRows] = useState<User[]>(data);
  const [lastPaste, setLastPaste] = useState('Copy TSV cells, select a cell and press Ctrl/Cmd+V');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div role="status">{lastPaste}</div>
      <DataGrid
        data={rows}
        columns={pasteColumns}
        pageSize={6}
        withRangeSelection
        onRangePaste={(changes, text) => {
          setLastPaste(`${changes.length} cells pasted (${text.split(/\r?\n/).length} lines)`);
          setRows((current) =>
            current.map((row) => {
              const rowChanges = changes.filter((change) => change.rowId === row.id);

              if (rowChanges.length === 0) {
                return row;
              }

              return rowChanges.reduce(
                (acc, change) => ({ ...acc, [change.columnKey]: change.value }),
                { ...row }
              ) as User;
            })
          );
        }}
        caption="Range paste (Ctrl/Cmd+V)"
      />
    </div>
  );
}

export function FillHandle() {
  const [rows, setRows] = useState<User[]>(data);
  const [lastFill, setLastFill] = useState('Drag the fill handle or use the arrow keys + Enter');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div role="status">{lastFill}</div>
      <DataGrid
        data={rows}
        columns={columns}
        pageSize={6}
        withRangeSelection
        withFillHandle
        onRangeFill={(changes, sourceRange, targetRange) => {
          setLastFill(
            `${changes.length} cells filled from ${sourceRange.startRowId}/${sourceRange.startColumnKey} to ${targetRange.endRowId}/${targetRange.endColumnKey}`
          );
          setRows((current) =>
            current.map((row) => {
              const rowChanges = changes.filter((change) => change.rowId === row.id);

              if (rowChanges.length === 0) {
                return row;
              }

              return rowChanges.reduce(
                (acc, change) => ({ ...acc, [change.columnKey]: change.value }),
                { ...row }
              ) as User;
            })
          );
        }}
        caption="Fill handle"
      />
    </div>
  );
}

const spanningColumns: DataGridColumn<User>[] = [
  {
    key: 'name',
    title: 'Customer',
    colSpan: 2,
    render: (user) => `${user.name} · ${user.email}`
  },
  { key: 'email', title: 'E-mail' },
  { key: 'role', title: 'Role', rowSpan: 2 },
  { key: 'active', title: 'Status' }
];

export function Spanning() {
  return (
    <DataGrid
      data={data}
      columns={spanningColumns}
      withPagination={false}
      withSummary
      summaryLabel="Total"
      caption="Column and row spanning (flat headers only)"
    />
  );
}

interface OrgNode {
  id: number;
  name: string;
  role: string;
  children?: OrgNode[];
}

const orgTree: OrgNode[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'CEO',
    children: [
      {
        id: 2,
        name: 'Bruno Costa',
        role: 'CTO',
        children: [
          { id: 3, name: 'Carla Souza', role: 'Frontend lead' },
          { id: 4, name: 'Diego Alves', role: 'Backend lead' }
        ]
      },
      { id: 5, name: 'Elena Lima', role: 'CFO' },
      { id: 6, name: 'Felipe Rocha', role: 'COO' }
    ]
  },
  {
    id: 7,
    name: 'Gabriela Nunes',
    role: 'VP Sales',
    children: [{ id: 8, name: 'Hugo Prado', role: 'Account manager' }]
  }
];

const orgColumns: DataGridColumn<OrgNode>[] = [
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' }
];

export function TreeData() {
  const [expandedRows, setExpandedRows] = useState<(string | number)[]>([1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Expanded rows: {expandedRows.join(', ') || 'none'}</div>
      <DataGrid
        data={orgTree}
        columns={orgColumns}
        treeData
        getRowChildren={(row) => row.children}
        expandedRowKeys={expandedRows}
        onExpandedRowKeysChange={setExpandedRows}
        treeIndent={20}
        caption="Organization chart (tree data)"
      />
    </div>
  );
}

const serverGroupColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' },
  { key: 'id', title: 'Records', align: 'right' }
];

const serverGroups: DataGridServerGroup<User>[] = [
  {
    key: 'admin',
    label: 'Admins',
    count: 4,
    aggregates: { id: 4 },
    rows: data.filter((user) => user.role === 'Admin').slice(0, 2),
    children: [
      {
        key: 'admin-active',
        label: 'Active admins',
        rows: data.filter((user) => user.role === 'Admin' && user.active).slice(0, 2),
        aggregates: { id: 2 }
      }
    ]
  },
  {
    key: 'member',
    label: 'Members',
    count: 8,
    aggregates: { id: 8 },
    rows: data.filter((user) => user.role === 'Member').slice(0, 3)
  }
];

export function ServerGrouping() {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['admin']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Expanded groups: {expandedGroups.length > 0 ? expandedGroups.join(', ') : 'none'} · the grid
        renders labels, counts and aggregates exactly as sent by the server
      </div>
      <DataGrid
        data={[]}
        columns={serverGroupColumns}
        serverSideGrouping
        groupedData={serverGroups}
        expandedGroupKeys={expandedGroups}
        onExpandedGroupKeysChange={setExpandedGroups}
        withSelection
        caption="Server-side grouping"
      />
    </div>
  );
}

const autofitColumns: DataGridColumn<User>[] = [
  { key: 'name', title: 'Name' },
  { key: 'email', title: 'E-mail' },
  { key: 'role', title: 'Role' }
];

export function ColumnAutofit() {
  const [widths, setWidths] = useState<Record<string, number>>({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Measured widths: {JSON.stringify(widths)}</div>
      <DataGrid
        data={data}
        columns={autofitColumns}
        withColumnAutofit
        withColumnResize
        autofitSampleSize={8}
        minColumnWidth={100}
        maxColumnWidth={360}
        onColumnWidthChange={setWidths}
        caption="Column autofit"
      />
    </div>
  );
}

export function UndoRedo() {
  const [rows, setRows] = useState<User[]>(data);
  const [message, setMessage] = useState('Edit a cell, then press Ctrl/Cmd+Z');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>{message}</div>
      <DataGrid
        data={rows}
        columns={columns}
        pageSize={6}
        withCellEditing
        withUndoRedo
        maxHistory={10}
        onUndo={(entry) => setMessage(`Undo ${entry.type} on row ${String(entry.rowId)}`)}
        onRedo={(entry) => setMessage(`Redo ${entry.type} on row ${String(entry.rowId)}`)}
        onCellEdit={(row, columnKey, value) =>
          setRows((current) =>
            current.map((item) => (item.id === row.id ? { ...item, [columnKey]: value } : item))
          )
        }
        caption="Undo/redo (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y)"
      />
    </div>
  );
}

export function ExcelExport() {
  const [message, setMessage] = useState('Click "Export Excel" to generate the .xls workbook');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>{message}</div>
      <DataGrid
        data={data}
        columns={summaryColumns}
        pageSize={6}
        withSummary
        summaryLabel="Total"
        withExcelExport
        excelFileName="users"
        onExcelExport={(html, fileName) => setMessage(`${fileName}: ${html.length} characters`)}
        caption="Users"
      />
    </div>
  );
}

export function ServerSortFilter() {
  const [sort, setSort] = useState<DataGridSort | null>({ key: 'name', direction: 'asc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<User[]>(data);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timeout = setTimeout(() => {
      const valueOf = (row: User, key: string) =>
        String((row as unknown as Record<string, unknown>)[key] ?? '').toLowerCase();
      const filtered = data.filter((row) =>
        Object.entries(filters).every(([key, value]) =>
          value ? valueOf(row, key).includes(value.toLowerCase()) : true
        )
      );
      const sorted = sort
        ? [...filtered].sort((rowA, rowB) => {
            const comparison = valueOf(rowA, sort.key).localeCompare(
              valueOf(rowB, sort.key),
              undefined,
              { numeric: true }
            );

            return sort.direction === 'asc' ? comparison : -comparison;
          })
        : filtered;

      setRows(sorted);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timeout);
  }, [sort, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Server sort {sort ? `${sort.key} ${sort.direction}` : 'none'} · filters{' '}
        {JSON.stringify(filters)}
      </div>
      <DataGrid
        data={rows}
        columns={columns}
        pageSize={5}
        serverSideSorting
        serverSideFiltering
        withColumnFilters
        sortKey={sort?.key}
        sortDirection={sort?.direction}
        onSortChange={setSort}
        filterValues={filters}
        onFilterChange={setFilters}
        loading={loading}
        caption="Server-side sorting and filtering"
      />
    </div>
  );
}

const variableHeightRows: User[] = Array.from({ length: 300 }, (_, index) => ({
  id: index + 1,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: index % 3 === 0 ? 'Admin' : 'Member',
  active: index % 2 === 0
}));

export function VariableRowHeight() {
  return (
    <DataGrid
      data={variableHeightRows}
      columns={columns}
      pageSize={300}
      withPagination={false}
      virtualized
      virtualizedMaxHeight={360}
      virtualizedRowHeight={40}
      getRowHeight={(row) => (row.role === 'Admin' ? 64 : 36)}
      caption="Variable row height (admins are taller)"
    />
  );
}

export function Density() {
  const [density, setDensity] = useState<DataGridDensity>('comfortable');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <SegmentedControl
        ariaLabel="Density"
        value={density}
        onChange={(value) => setDensity(value as DataGridDensity)}
        data={[
          { label: 'Compact', value: 'compact' },
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Spacious', value: 'spacious' }
        ]}
      />
      <DataGrid
        data={data}
        columns={columns}
        density={density}
        pageSize={5}
        caption={`${density} rows`}
      />
    </div>
  );
}

export function Localized() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <NebularProvider locale="pt-BR">
        <DataGrid
          data={data}
          columns={columns}
          pageSize={5}
          withSelection
          withUndoRedo
          withColumnVisibility
          withExport
          withExcelExport
          caption="Usuários"
        />
      </NebularProvider>
      <DataGrid
        data={data}
        columns={columns}
        pageSize={5}
        withUndoRedo
        withColumnVisibility
        labels={{ undo: 'Back', redo: 'Forward', columns: 'Visible columns' }}
        caption="Custom labels"
      />
      <span>
        The first grid reads the pt-BR catalog from NebularProvider; the second overrides labels
        directly and keeps English fallbacks for every other string.
      </span>
    </div>
  );
}
