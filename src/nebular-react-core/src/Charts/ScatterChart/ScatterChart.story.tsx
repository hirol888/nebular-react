import React from 'react';
import { ScatterChart } from './ScatterChart';

export default { title: 'Charts/ScatterChart', component: ScatterChart };

const series = [
  {
    name: 'Experiment A',
    data: [
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 4, y: 4 },
      { x: 6, y: 8 },
      { x: 8, y: 7 }
    ]
  },
  {
    name: 'Experiment B',
    data: [
      { x: 1, y: 6 },
      { x: 3, y: 4 },
      { x: 5, y: 9 },
      { x: 7, y: 5 },
      { x: 9, y: 10 }
    ],
    color: '#00d68f'
  }
];

export function Showcase() {
  return (
    <ScatterChart
      series={series}
      xLabel="Time"
      yLabel="Score"
      ariaLabel="Experiment scores over time"
    />
  );
}

export function MultiSeries() {
  return (
    <ScatterChart
      series={[
        ...series,
        {
          name: 'Baseline',
          color: '#8f9bb3',
          data: [
            { x: -3, y: -2 },
            { x: 0, y: 0 },
            { x: 4, y: 3 }
          ]
        }
      ]}
      width={560}
      height={280}
      xLabel="Delta X"
      yLabel="Delta Y"
      ariaLabel="Experiment deltas against the baseline"
    />
  );
}

export function WithLabels() {
  return (
    <ScatterChart
      series={[
        {
          name: 'Services',
          data: [
            { x: 2, y: 8, label: 'API' },
            { x: 5, y: 6, label: 'Web' },
            { x: 7, y: 9, label: 'Workers' },
            { x: 3, y: 3, label: 'Batch' }
          ]
        }
      ]}
      pointRadius={6}
      showGrid={false}
      valueFormatter={(value: number) => value.toFixed(1)}
      xLabel="Latency (ms)"
      yLabel="Uptime"
      ariaLabel="Service latency and uptime"
    />
  );
}
