import React from 'react';
import { RadarChart } from './RadarChart';

export default { title: 'Charts/RadarChart', component: RadarChart };

const axes = ['Speed', 'Power', 'Range', 'Comfort', 'Safety'];

const series = [
  { name: 'Model A', values: [80, 60, 70, 90, 50] },
  { name: 'Model B', values: [60, 90, 40, 70, 80], color: '#00d68f' }
];

export function Showcase() {
  return <RadarChart axes={axes} series={series} ariaLabel="Model comparison" />;
}

export function MultiSeries() {
  return (
    <RadarChart
      axes={axes}
      series={[...series, { name: 'Baseline', values: [50, 50, 50, 50, 50], color: '#8f9bb3' }]}
      size={320}
      levels={5}
      maxValue={100}
      valueFormatter={(value: number) => `${value}%`}
      ariaLabel="Model comparison against the baseline"
    />
  );
}
