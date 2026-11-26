import React from 'react';
import { StepLineChart } from './StepLineChart';

export default { title: 'Charts/StepLineChart', component: StepLineChart };

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
const series = [
  { name: 'Revenue', data: [2, 5, 3, 6, 4] },
  { name: 'Costs', data: [1, 2, 4, 3, 5], color: '#ff3d71' }
];

export function Showcase() {
  return <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />;
}

export function WithoutGrid() {
  return (
    <StepLineChart
      labels={labels}
      series={series}
      showGrid={false}
      height={320}
      ariaLabel="Monthly figures without grid"
    />
  );
}

export function WithValueFormatter() {
  return (
    <StepLineChart
      labels={labels}
      series={series}
      valueFormatter={(value: number) => `${value}k`}
      ariaLabel="Monthly figures in thousands"
    />
  );
}
