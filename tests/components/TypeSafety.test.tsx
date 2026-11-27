import React from 'react';
import { render } from '@testing-library/react';
import { DataGrid, DataGridColumn, PivotTableProps, SelectProps } from '@nebular-react/core';

interface Row {
  id: number;
  name: string;
  total: number;
  active: boolean;
  [key: string]: unknown;
}

const rows: Row[] = [
  { id: 1, name: 'Alpha', total: 10, active: true },
  { id: 2, name: 'Beta', total: 20, active: false }
];

const typedColumns: DataGridColumn<Row>[] = [
  {
    key: 'name',
    title: 'Name',
    sortable: true,
    filterable: true,
    sortValue: (row) => row.name,
    filterValue: (row) => row.name,
    render: (row) => row.name.toUpperCase()
  },
  {
    key: 'total',
    title: 'Total',
    aggregate: 'sum',
    summaryValue: (row) => row.total,
    summaryFormatter: (value) => value.toFixed(2)
  },
  {
    key: 'active',
    title: 'Active',
    filterOperator: 'equals',
    filterValue: (row) => String(row.active)
  }
];

const invalidKeyColumn: DataGridColumn<Row> = {
  // @ts-expect-error column key must be a string
  key: 1,
  title: 'Invalid key'
};

const invalidAggregateColumn: DataGridColumn<Row> = {
  key: 'invalid',
  title: 'Invalid aggregate',
  // @ts-expect-error aggregate must be a supported operator
  aggregate: 'median'
};

describe('DataGrid type safety', () => {
  it('keeps row and column generics through props', () => {
    render(
      <DataGrid
        data={rows}
        columns={typedColumns}
        pageSize={5}
        withCellEditing
        onCellEdit={(row, columnKey, value) => {
          const typedRow: Row = row;
          const typedKey: string = columnKey;
          const typedValue: unknown = value;

          expect(typedRow.id).toBeGreaterThan(0);
          expect(typeof typedKey).toBe('string');
          expect(typedValue).toBeDefined();
        }}
        onSortChange={(sort) => {
          const key: string | null = sort?.key ?? null;
          expect(key).toBeNull();
        }}
      />
    );

    expect(invalidKeyColumn.title).toBe('Invalid key');
    expect(invalidAggregateColumn.aggregate).toBe('median');
  });

  it('types Select and PivotTable contracts', () => {
    const selectProps: SelectProps = {
      options: [{ type: 'option', value: 'a', label: 'Alpha' }],
      onSelect: (selected) => {
        const value: unknown = selected;
        expect(value).toBeDefined();
      }
    };

    const pivotProps: PivotTableProps<Row> = {
      data: rows,
      rows: ['name'],
      measure: {
        key: 'total',
        label: 'Total',
        aggregate: 'sum',
        value: (row) => row.total,
        formatter: (value) => value.toFixed(2)
      },
      onCellClick: ({ row, value }) => {
        const typedRow: Row = row.row as Row;
        const typedValue: number = value;
        expect(typedRow.id).toBeGreaterThan(0);
        expect(typeof typedValue).toBe('number');
      }
    };

    expect(selectProps.options).toHaveLength(1);
    expect(pivotProps.rows).toEqual(['name']);
    expect(pivotProps.measure?.key).toBe('total');
  });
});
