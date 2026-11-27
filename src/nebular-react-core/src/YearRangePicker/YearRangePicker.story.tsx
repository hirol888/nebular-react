import React, { useState } from 'react';
import { Card } from '../Card';
import { YearRange, YearRangePicker } from './YearRangePicker';

export default { title: 'YearRangePicker', component: YearRangePicker };

const INITIAL_RANGE: YearRange = { start: 2020, end: 2024 };

export function Showcase() {
  const [range, setRange] = useState<YearRange>(INITIAL_RANGE);

  return (
    <Card size="large">
      <Card.Body>
        <YearRangePicker
          label="Period"
          description="Pick a start and an end year"
          value={range}
          onChange={(nextRange) => setRange(nextRange)}
        />
        <div style={{ marginTop: 16 }}>
          {range.start !== null && range.end !== null
            ? `${range.start} - ${range.end}`
            : 'No range selected'}
        </div>
      </Card.Body>
    </Card>
  );
}

export function BoundsAndClear() {
  const [range, setRange] = useState<YearRange>(INITIAL_RANGE);

  return (
    <Card size="large">
      <Card.Body>
        <YearRangePicker
          label="Reporting period"
          clearable
          value={range}
          visibleYear={2020}
          onChange={(nextRange) => setRange(nextRange)}
          min={2018}
          max={2026}
        />
      </Card.Body>
    </Card>
  );
}

export function DecadeNavigation() {
  const [range, setRange] = useState<YearRange>({ start: null, end: null });

  return (
    <Card size="large">
      <Card.Body>
        <YearRangePicker
          label="Range (starts at 2030)"
          visibleYear={2030}
          value={range}
          onChange={(nextRange) => setRange(nextRange)}
        />
      </Card.Body>
    </Card>
  );
}
