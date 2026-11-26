import React from 'react';
import { BarChart } from '../BarChart';
import { LineChart } from '../LineChart';
import { ChartContainer } from './ChartContainer';

export default { title: 'Charts/ChartContainer', component: ChartContainer };

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = [
  { name: 'Revenue', data: [12, 19, 14, 25, 22, 30] },
  { name: 'Costs', data: [8, 11, 9, 14, 13, 16] }
];

export function Showcase() {
  return (
    <ChartContainer
      title="Revenue over time"
      description="Monthly revenue and costs"
      actions={<button type="button">Refresh</button>}
      ariaLabel="Revenue over time"
    >
      {({ width }) => (
        <LineChart labels={labels} series={series} width={width} height={240} ariaLabel="Revenue" />
      )}
    </ChartContainer>
  );
}

export function EmptyAndLoading() {
  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(2, 1fr)' }}>
      <ChartContainer title="No data" empty ariaLabel="Empty chart">
        {null}
      </ChartContainer>
      <ChartContainer title="Loading" loading ariaLabel="Loading chart">
        <BarChart labels={labels} series={series} height={240} ariaLabel="Loading bars" />
      </ChartContainer>
    </div>
  );
}

export function Exportable() {
  return (
    <ChartContainer
      title="Exportable chart"
      description="Use the buttons above the chart to download it"
      exportable
      exportFileName="revenue"
      ariaLabel="Exportable chart"
      onExport={() => undefined}
    >
      {({ width }) => (
        <BarChart labels={labels} series={series} width={width} height={240} ariaLabel="Revenue" />
      )}
    </ChartContainer>
  );
}

const dataTable = {
  caption: 'Revenue and costs data',
  columns: ['Month', 'Revenue', 'Costs'],
  rows: labels.map((label, index) => [label, series[0].data[index], series[1].data[index]])
};

export function DataTable() {
  return (
    <ChartContainer
      title="Chart with an accessible data table"
      description="Toggle the table to inspect the underlying values"
      showDataTable="visible"
      dataTable={dataTable}
      ariaLabel="Revenue chart with data table"
    >
      {({ width }) => (
        <LineChart labels={labels} series={series} width={width} height={240} ariaLabel="Revenue" />
      )}
    </ChartContainer>
  );
}

export function HiddenDataTable() {
  return (
    <ChartContainer
      title="Screen-reader data table"
      description="The table is always available to assistive technology"
      showDataTable="hidden"
      dataTable={dataTable}
      ariaLabel="Revenue chart with hidden data table"
    >
      {({ width }) => (
        <LineChart labels={labels} series={series} width={width} height={240} ariaLabel="Revenue" />
      )}
    </ChartContainer>
  );
}

export function Animated() {
  return (
    <ChartContainer
      title="Animated chart"
      description="Fades and translates in unless prefers-reduced-motion is set"
      animated
      exportable
      exportFileName="animated-revenue"
      ariaLabel="Animated chart"
    >
      {({ width }) => (
        <BarChart labels={labels} series={series} width={width} height={240} ariaLabel="Revenue" />
      )}
    </ChartContainer>
  );
}
