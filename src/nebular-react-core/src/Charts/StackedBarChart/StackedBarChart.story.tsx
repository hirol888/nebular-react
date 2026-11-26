import React from 'react';
import { StackedBarChart } from './StackedBarChart';

export default { title: 'Charts/StackedBarChart', component: StackedBarChart };

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = [
  { name: 'Direct', data: [12, 19, 14, 25, 22, 30] },
  { name: 'Organic', data: [8, 11, 9, 14, 13, 16] },
  { name: 'Referral', data: [4, 6, 5, 9, 7, 11] }
];

export function Showcase() {
  return <StackedBarChart labels={labels} series={series} ariaLabel="Traffic by channel" />;
}

export function WithoutGrid() {
  return (
    <StackedBarChart
      labels={labels}
      series={series}
      height={200}
      showGrid={false}
      ariaLabel="Traffic by channel without grid"
    />
  );
}

export function WithFormatter() {
  return (
    <StackedBarChart
      labels={['Q1', 'Q2', 'Q3', 'Q4']}
      series={[
        { name: 'New', data: [120, 160, 140, 200], color: '#3366ff' },
        { name: 'Returning', data: [80, 90, 110, 130], color: '#00d68f' }
      ]}
      valueFormatter={(value: number) => value.toLocaleString('en-US')}
      ariaLabel="Users by quarter"
    />
  );
}
