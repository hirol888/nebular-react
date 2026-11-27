import React from 'react';
import { PieChart } from './PieChart';

export default { title: 'Charts/PieChart', component: PieChart };

const data = [
  { label: 'Direct', value: 420 },
  { label: 'Organic', value: 310 },
  { label: 'Referral', value: 160 },
  { label: 'Social', value: 110 }
];

export function Showcase() {
  return <PieChart data={data} ariaLabel="Traffic sources" />;
}

export function WithLegend() {
  return (
    <PieChart
      data={[
        { label: 'Active', value: 78, color: '#00d68f' },
        { label: 'Pending', value: 14, color: '#ffaa00' },
        { label: 'Inactive', value: 8, color: '#ff3d71' }
      ]}
      showLegend
      valueFormatter={(value: number) => `${value} users`}
      ariaLabel="User status"
    />
  );
}

export function DonutLike() {
  return (
    <PieChart
      data={data}
      size={260}
      innerRadius={70}
      showLegend
      valueFormatter={(value: number) => value.toLocaleString('en-US')}
      ariaLabel="Traffic sources as a ring"
    />
  );
}

export function DataTable() {
  return (
    <PieChart
      data={data}
      showDataTable="visible"
      dataTableCaption="Traffic sources data"
      ariaLabel="Traffic sources with a data table"
    />
  );
}

export function Animated() {
  return <PieChart data={data} animated ariaLabel="Animated traffic sources" />;
}
