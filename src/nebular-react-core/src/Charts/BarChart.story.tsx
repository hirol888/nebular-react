import React from 'react';
import { BarChart } from './BarChart';

export default { title: 'Charts/BarChart', component: BarChart };

export function Showcase() {
  return (
    <BarChart
      labels={['Q1', 'Q2', 'Q3', 'Q4']}
      series={[
        { name: 'Revenue', data: [32, 48, 41, 58] },
        { name: 'Costs', data: [18, 26, 24, 31] }
      ]}
      ariaLabel="Quarterly revenue and costs"
    />
  );
}

export function SingleSeries() {
  return (
    <BarChart
      labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
      series={[{ name: 'Tickets', data: [12, 18, 9, 22, 15], color: '#00d68f' }]}
      showLegend={false}
      ariaLabel="Tickets per day"
    />
  );
}

export function InteractiveLegend() {
  return (
    <BarChart
      labels={['Q1', 'Q2', 'Q3', 'Q4']}
      series={[
        { name: 'Revenue', data: [32, 48, 41, 58] },
        { name: 'Costs', data: [18, 26, 24, 31] }
      ]}
      interactiveLegend
      ariaLabel="Quarterly revenue and costs"
    />
  );
}
