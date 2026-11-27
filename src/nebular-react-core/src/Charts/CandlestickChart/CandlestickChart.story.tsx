import React from 'react';
import { CandlestickChart } from './CandlestickChart';

export default { title: 'Charts/CandlestickChart', component: CandlestickChart };

const data = [
  { label: 'Mon', open: 100, high: 110, low: 90, close: 105, volume: 1200 },
  { label: 'Tue', open: 105, high: 115, low: 95, close: 98, volume: 900 },
  { label: 'Wed', open: 98, high: 108, low: 92, close: 98, volume: 1500 },
  { label: 'Thu', open: 98, high: 112, low: 96, close: 110, volume: 1800 },
  { label: 'Fri', open: 110, high: 118, low: 104, close: 106, volume: 1100 }
];

export function Showcase() {
  return <CandlestickChart data={data} ariaLabel="Daily share prices" />;
}

export function WithVolume() {
  return (
    <CandlestickChart
      data={data}
      showVolume
      height={360}
      ariaLabel="Daily share prices with volume"
    />
  );
}

export function WithValueFormatter() {
  return (
    <CandlestickChart
      data={data}
      showGrid={false}
      valueFormatter={(value: number) => `$${value}`}
      ariaLabel="Daily share prices in dollars"
    />
  );
}
