import React from 'react';
import { LineChart, AreaChart } from './LineChart';

export default { title: 'Charts/LineChart', component: LineChart };

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const series = [
  { name: 'Revenue', data: [12, 19, 14, 25, 22, 30] },
  { name: 'Costs', data: [8, 11, 9, 14, 13, 16] }
];

export function Showcase() {
  return <LineChart labels={labels} series={series} ariaLabel="Revenue and costs over time" />;
}

export function Area() {
  return <AreaChart labels={labels} series={series} ariaLabel="Revenue and costs over time" />;
}

export function InteractiveAndZoomable() {
  return (
    <LineChart
      labels={labels}
      series={series}
      interactiveLegend
      zoomable
      ariaLabel="Interactive revenue and costs"
    />
  );
}
