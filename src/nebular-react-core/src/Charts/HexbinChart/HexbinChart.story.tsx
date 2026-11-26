import React from 'react';
import { HexbinChart } from './HexbinChart';

export default { title: 'Charts/HexbinChart', component: HexbinChart };

const clusters = [
  { cx: 12, cy: 20, count: 42 },
  { cx: 38, cy: 46, count: 28 },
  { cx: 62, cy: 26, count: 54 },
  { cx: 80, cy: 70, count: 18 }
];

const data = clusters.reduce<{ x: number; y: number }[]>((points, cluster) => {
  for (let index = 0; index < cluster.count; index += 1) {
    const angle = (index / cluster.count) * Math.PI * 2;
    const spread = 1 + (index % 5) * 0.9;

    points.push({
      x: cluster.cx + Math.cos(angle) * spread,
      y: cluster.cy + Math.sin(angle) * spread
    });
  }

  return points;
}, []);

export function Showcase() {
  return <HexbinChart data={data} ariaLabel="Customer density" />;
}

export function LabelledAxes() {
  return (
    <HexbinChart
      data={data}
      width={640}
      height={320}
      radius={22}
      xLabel="Spend"
      yLabel="Sessions"
      ariaLabel="Customer density by spend and sessions"
      valueFormatter={(value: number) => String(value)}
    />
  );
}

export function CustomColors() {
  return (
    <HexbinChart
      data={data}
      colors={['#f3e8ff', '#c084fc', '#7e22ce', '#4c1d95']}
      ariaLabel="Customer density with a purple scale"
      onBinClick={(bin) => {
        // eslint-disable-next-line no-console
        console.log(bin.count);
      }}
    />
  );
}
