import React from 'react';
import { ChartDataTable } from './ChartDataTable';

export default { title: 'Charts/ChartDataTable', component: ChartDataTable };

const columns = ['Month', 'Revenue', 'Costs'];
const rows = [
  ['Jan', '12', '8'],
  ['Feb', '19', '11'],
  ['Mar', '14', '9']
];

export function Showcase() {
  return <ChartDataTable caption="Monthly revenue and costs" columns={columns} rows={rows} />;
}

export function Hidden() {
  return (
    <div>
      <p>
        The table below is visually hidden but remains available to screen readers, which keeps the
        chart accessible without changing its visual layout.
      </p>
      <ChartDataTable
        caption="Monthly revenue and costs"
        columns={columns}
        rows={rows}
        visuallyHidden
      />
    </div>
  );
}

export function WideContent() {
  return (
    <div style={{ maxWidth: 360 }}>
      <ChartDataTable
        caption="Quarterly results with a horizontally scrollable table"
        columns={['Region', 'Q1', 'Q2', 'Q3', 'Q4', 'Total']}
        rows={[
          ['North America', '120', '135', '150', '165', '570'],
          ['South America', '80', '92', '101', '110', '383'],
          ['Europe', '150', '162', '174', '188', '674']
        ]}
      />
    </div>
  );
}
