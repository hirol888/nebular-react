import React from 'react';
import { Heatmap } from './Heatmap';

export default { title: 'Charts/Heatmap', component: Heatmap };

const data = [
  { x: 'Mon', y: 'Morning', value: 4 },
  { x: 'Tue', y: 'Morning', value: 9 },
  { x: 'Wed', y: 'Morning', value: 6 },
  { x: 'Thu', y: 'Morning', value: 2 },
  { x: 'Mon', y: 'Afternoon', value: 7 },
  { x: 'Tue', y: 'Afternoon', value: 5 },
  { x: 'Wed', y: 'Afternoon', value: 10 },
  { x: 'Thu', y: 'Afternoon', value: 3 },
  { x: 'Mon', y: 'Evening', value: 1 },
  { x: 'Tue', y: 'Evening', value: 8 },
  { x: 'Wed', y: 'Evening', value: 4 },
  { x: 'Thu', y: 'Evening', value: 6 }
];

export function Showcase() {
  return <Heatmap data={data} ariaLabel="Weekly activity" />;
}

export function WithValues() {
  return (
    <Heatmap
      data={data}
      cellSize={44}
      showValues
      min={0}
      max={12}
      colors={['#fff0f3', '#ffb3c1', '#ff3d71', '#8a1538']}
      valueFormatter={(value: number) => `${value} h`}
      ariaLabel="Weekly activity in hours"
    />
  );
}
