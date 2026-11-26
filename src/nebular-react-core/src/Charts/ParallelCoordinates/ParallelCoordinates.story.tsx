import React from 'react';
import { ParallelCoordinates } from './ParallelCoordinates';

export default { title: 'Charts/ParallelCoordinates', component: ParallelCoordinates };

const dimensions = [
  { key: 'price', label: 'Price' },
  { key: 'range', label: 'Range' },
  { key: 'comfort', label: 'Comfort' },
  { key: 'safety', label: 'Safety' }
];

const series = [
  { name: 'Model S', values: { price: 90, range: 95, comfort: 88, safety: 92 } },
  { name: 'Model 3', values: { price: 55, range: 70, comfort: 74, safety: 86 } },
  { name: 'Leaf', values: { price: 35, range: 45, comfort: 60, safety: 70 }, color: '#00d68f' }
];

export function Showcase() {
  return (
    <ParallelCoordinates
      dimensions={dimensions}
      series={series}
      ariaLabel="Electric car comparison"
    />
  );
}

export function WithValueFormatter() {
  return (
    <ParallelCoordinates
      dimensions={dimensions}
      series={series}
      height={360}
      valueFormatter={(value: number) => `${value} pts`}
      ariaLabel="Electric car comparison in points"
    />
  );
}

export function Interactive() {
  return (
    <ParallelCoordinates
      dimensions={dimensions}
      series={series}
      ariaLabel="Interactive electric car comparison"
      onSeriesClick={() => undefined}
    />
  );
}
