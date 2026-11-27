import React from 'react';
import { ChordChart } from './ChordChart';

export default { title: 'Charts/ChordChart', component: ChordChart };

const labels = ['Direct', 'Organic', 'Referral', 'Social'];

const matrix = [
  [0, 12, 6, 4],
  [12, 0, 8, 3],
  [6, 8, 0, 5],
  [4, 3, 5, 0]
];

export function Showcase() {
  return <ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic overlap" />;
}

export function WithPalette() {
  return (
    <ChordChart
      matrix={matrix}
      labels={labels}
      size={400}
      colors={['#3366ff', '#00d68f', '#ffaa00', '#ff3d71']}
      valueFormatter={(value: number) => `${value}k`}
      ariaLabel="Traffic overlap in thousands"
    />
  );
}

export function WithoutLabels() {
  return (
    <ChordChart
      matrix={matrix}
      labels={labels}
      showLabels={false}
      size={280}
      ariaLabel="Traffic overlap without labels"
    />
  );
}
