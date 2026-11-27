import React from 'react';
import { StreamGraphChart } from './StreamGraphChart';

export default { title: 'Charts/StreamGraphChart', component: StreamGraphChart };

const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
const series = [
  { name: 'Direct', data: [10, 20, 14, 26] },
  { name: 'Organic', data: [30, 10, 22, 18] },
  { name: 'Referral', data: [12, 18, 9, 15] }
];

export function Showcase() {
  return <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />;
}

export function WithGrid() {
  return (
    <StreamGraphChart
      labels={labels}
      series={series}
      showGrid
      height={320}
      ariaLabel="Traffic sources with grid"
    />
  );
}

export function WithValueFormatter() {
  return (
    <StreamGraphChart
      labels={labels}
      series={series}
      valueFormatter={(value: number) => `${value}k`}
      ariaLabel="Traffic sources in thousands"
    />
  );
}
