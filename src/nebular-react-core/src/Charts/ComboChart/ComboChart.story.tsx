import React from 'react';
import { ComboChart } from './ComboChart';

export default { title: 'Charts/ComboChart', component: ComboChart };

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = [
  { name: 'Revenue', type: 'bar' as const, data: [12, 19, 14, 25, 22, 30] },
  { name: 'Margin', type: 'line' as const, data: [8, 12, 10, 16, 15, 19] },
  { name: 'Forecast', type: 'area' as const, data: [10, 14, 13, 18, 20, 24] }
];

export function Showcase() {
  return <ComboChart labels={labels} series={series} ariaLabel="Revenue, margin and forecast" />;
}

export function Percentages() {
  return (
    <ComboChart
      labels={['Q1', 'Q2', 'Q3', 'Q4']}
      series={[
        { name: 'Sales', type: 'bar', data: [120, 180, 150, 210], color: '#3366ff' },
        { name: 'Conversion', type: 'line', data: [12, 18, 16, 24], color: '#00d68f' }
      ]}
      valueFormatter={(value: number) => value.toLocaleString('en-US')}
      ariaLabel="Sales and conversion"
    />
  );
}

export function Compact() {
  return (
    <ComboChart
      labels={['Mon', 'Tue', 'Wed']}
      series={[
        { name: 'Orders', type: 'bar', data: [4, 9, 6] },
        { name: 'Refunds', type: 'line', data: [1, 2, 1] }
      ]}
      height={180}
      showGrid={false}
      ariaLabel="Orders and refunds"
    />
  );
}
