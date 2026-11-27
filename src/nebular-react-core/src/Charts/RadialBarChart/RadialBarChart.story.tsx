import React from 'react';
import { RadialBarChart } from './RadialBarChart';

export default { title: 'Charts/RadialBarChart', component: RadialBarChart };

const data = [
  { label: 'Alpha', value: 82, color: '#3366ff' },
  { label: 'Beta', value: 64, color: '#00d68f' },
  { label: 'Gamma', value: 47, color: '#ffaa00' },
  { label: 'Delta', value: 25, color: '#ff3d71' }
];

export function Showcase() {
  return <RadialBarChart data={data} ariaLabel="Team coverage" />;
}

export function StartAngle() {
  return (
    <RadialBarChart
      data={data}
      size={360}
      innerRadius={0.5}
      startAngle={-135}
      ariaLabel="Team coverage starting at the top left"
      valueFormatter={(value: number) => `${value}%`}
    />
  );
}

export function Empty() {
  return <RadialBarChart data={[]} ariaLabel="Empty radial bar chart" />;
}
