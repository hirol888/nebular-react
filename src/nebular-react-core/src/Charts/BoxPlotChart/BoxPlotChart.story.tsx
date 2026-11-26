import React from 'react';
import { BoxPlotChart } from './BoxPlotChart';

export default { title: 'Charts/BoxPlotChart', component: BoxPlotChart };

const data = [
  { label: 'Mon', min: 12, q1: 18, median: 24, q3: 31, max: 38 },
  { label: 'Tue', min: 10, q1: 16, median: 22, q3: 29, max: 44, outliers: [52, 58] },
  { label: 'Wed', min: 14, q1: 20, median: 27, q3: 33, max: 41 },
  { label: 'Thu', min: 8, q1: 15, median: 21, q3: 28, max: 36, outliers: [4] },
  { label: 'Fri', min: 16, q1: 22, median: 29, q3: 35, max: 47 }
];

export function Showcase() {
  return <BoxPlotChart data={data} ariaLabel="Latency by weekday" />;
}

export function WithValueFormatter() {
  return (
    <BoxPlotChart
      data={data}
      height={320}
      valueFormatter={(value: number) => `${value} ms`}
      ariaLabel="Latency by weekday in milliseconds"
    />
  );
}

export function WithoutGrid() {
  return <BoxPlotChart data={data} showGrid={false} ariaLabel="Latency without grid" />;
}
