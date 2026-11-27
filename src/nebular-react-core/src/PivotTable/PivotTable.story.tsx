import React, { useState } from 'react';
import { PivotTable, formatPivotNumber } from './PivotTable';
import type { PivotMeasure, PivotTableCellContext, PivotTableRow } from './PivotTable';

export default { title: 'PivotTable', component: PivotTable };

type Sale = {
  region: string;
  country: string;
  product: string;
  amount: number;
  quantity: number;
};

const sales: Sale[] = [
  { region: 'North', country: 'Germany', product: 'Phone', amount: 1200, quantity: 4 },
  { region: 'North', country: 'Germany', product: 'Laptop', amount: 3200, quantity: 2 },
  { region: 'North', country: 'France', product: 'Phone', amount: 900, quantity: 3 },
  { region: 'North', country: 'France', product: 'Tablet', amount: 700, quantity: 2 },
  { region: 'South', country: 'Italy', product: 'Phone', amount: 800, quantity: 3 },
  { region: 'South', country: 'Italy', product: 'Laptop', amount: 2400, quantity: 1 },
  { region: 'South', country: 'Spain', product: 'Tablet', amount: 1500, quantity: 5 },
  { region: 'South', country: 'Spain', product: 'Phone', amount: 600, quantity: 2 },
  { region: 'East', country: 'Poland', product: 'Laptop', amount: 1800, quantity: 1 },
  { region: 'East', country: 'Poland', product: 'Tablet', amount: 450, quantity: 1 }
];

const revenue: PivotMeasure<Sale> = {
  key: 'amount',
  label: 'Revenue',
  aggregate: 'sum',
  formatter: (value) => `$${value.toLocaleString('en-US')}`
};

const units: PivotMeasure<Sale> = {
  key: 'quantity',
  label: 'Units',
  aggregate: 'sum'
};

const orderCount: PivotMeasure<Sale> = {
  key: 'orders',
  label: 'Orders',
  aggregate: 'count'
};

const averageTicket: PivotMeasure<Sale> = {
  key: 'average',
  label: 'Average ticket',
  aggregate: 'avg',
  value: (row) => row.amount,
  formatter: (value) => `$${Number(value.toFixed(2)).toLocaleString('en-US')}`
};

const revenueMeasures: PivotMeasure<Sale>[] = [revenue, orderCount, averageTicket];

export function Showcase() {
  return (
    <PivotTable
      data={sales}
      rows={['region']}
      column="product"
      measure={revenue}
      defaultExpandedKeys={['North', 'South', 'East']}
    />
  );
}

export function MultipleRowLevels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={revenue}
        defaultExpandedKeys={['North', 'South', 'East']}
        ariaLabel="Revenue by region, country and product"
      />

      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={units}
        defaultExpandedKeys={['North']}
        ariaLabel="Units by region and country"
      />
    </div>
  );
}

export function Exportable() {
  const [exported, setExported] = useState<{ csv: string; fileName: string } | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={revenue}
        defaultExpandedKeys={['North', 'South']}
        exportable
        exportFileName="sales-pivot.csv"
        onExport={(csv, fileName) => setExported({ csv, fileName })}
      />

      {exported && (
        <pre>
          {exported.fileName}
          {'\n'}
          {exported.csv}
        </pre>
      )}
    </div>
  );
}

export function MultipleMeasures() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measures={revenueMeasures}
        defaultExpandedKeys={['North', 'South', 'East']}
        ariaLabel="Revenue, orders and average ticket by region and product"
      />

      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measures={[revenue, units]}
        defaultExpandedKeys={['North', 'South']}
        exportable
        exportFileName="sales-measures-pivot.csv"
        ariaLabel="Revenue and units by region, country and product"
      />
    </div>
  );
}

const formatMeasureValue = (value: number, measure: PivotMeasure<Sale>): React.ReactNode =>
  measure.formatter ? measure.formatter(value) : formatPivotNumber(value);

const panelStyle: React.CSSProperties = {
  minHeight: '5rem',
  padding: '0.75rem 1rem',
  border: '1px solid var(--border-basic-color-3, #e4e9f2)',
  borderRadius: '0.5rem',
  background: 'var(--background-basic-color-2, #f7f9fc)',
  fontSize: '0.875rem',
  lineHeight: 1.5
};

const selectedCellStyle: React.CSSProperties = {
  outline: '2px solid var(--color-primary-500, #3366ff)',
  outlineOffset: '2px',
  borderRadius: '0.2rem'
};

export function DrillDown() {
  const [cell, setCell] = useState<PivotTableCellContext<Sale> | null>(null);
  const [row, setRow] = useState<PivotTableRow<Sale> | null>(null);
  const isSelected = (context: PivotTableCellContext<Sale>) =>
    cell !== null &&
    cell.row.key === context.row.key &&
    cell.column.key === context.column.key &&
    cell.measure.key === context.measure.key;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measures={[revenue, units]}
        defaultExpandedKeys={['North', 'South', 'East']}
        onCellClick={(context) => setCell(context)}
        onRowClick={(target) => setRow(target)}
        renderCell={(value, context) => (
          <span style={isSelected(context) ? selectedCellStyle : undefined}>
            {formatMeasureValue(value, context.measure)}
          </span>
        )}
        ariaLabel="Sales pivot with drill-down"
      />

      <aside style={panelStyle} role="status" aria-live="polite">
        <strong>Drill-down</strong>
        <br />
        {cell === null && row === null
          ? 'Click a row header or a value cell to inspect the pivot context.'
          : null}

        {row !== null && (
          <span>
            Row <code>{row.values.join(' / ')}</code> — level {row.depth},{' '}
            {row.isLeaf ? 'leaf row' : `${row.children.length} children`}, revenue{' '}
            {formatMeasureValue(row.measureTotals[revenue.key] ?? 0, revenue)}.
            <br />
          </span>
        )}

        {cell !== null && (
          <span>
            Cell <code>{cell.row.values.join(' / ')}</code> › <code>{cell.column.label}</code> ›{' '}
            <code>{cell.measure.label}</code> ={' '}
            <strong>{formatMeasureValue(cell.value, cell.measure)}</strong>
            <br />
            {cell.row.row !== undefined
              ? `Leaf record: ${cell.row.row.product} in ${cell.row.row.country}`
              : 'Aggregated group value (expand the row for leaf records).'}
          </span>
        )}
      </aside>
    </div>
  );
}
