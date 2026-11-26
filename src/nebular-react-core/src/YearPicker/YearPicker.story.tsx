import React, { useState } from 'react';
import { Card } from '../Card';
import { YearPicker } from './YearPicker';

export default { title: 'YearPicker', component: YearPicker };

export function Showcase() {
  const [year, setYear] = useState<Date | null>(new Date(2024, 5, 15));

  return (
    <Card size="large">
      <Card.Body>
        <YearPicker<Date>
          label="Year"
          description="Pick a year"
          value={year}
          onChange={(nextYear) => setYear(nextYear)}
        />
        <div style={{ marginTop: 16 }}>{year ? year.toISOString() : 'No year selected'}</div>
      </Card.Body>
    </Card>
  );
}

export function BoundsAndClear() {
  const [year, setYear] = useState<Date | null>(new Date(2024, 5, 15));

  return (
    <Card size="large">
      <Card.Body>
        <YearPicker<Date>
          label="Fiscal year"
          clearable
          value={year}
          onChange={(nextYear) => setYear(nextYear)}
          min={new Date(2020, 0, 1)}
          max={new Date(2024, 11, 31)}
        />
      </Card.Body>
    </Card>
  );
}

export function TimeZone() {
  const [year, setYear] = useState<Date | null>(new Date('2024-01-01T02:00:00Z'));

  return (
    <Card size="large">
      <Card.Body>
        <YearPicker<Date>
          label="Year (America/New_York)"
          timeZone="America/New_York"
          value={year}
          onChange={(nextYear) => setYear(nextYear)}
        />
        <div style={{ marginTop: 16 }}>{year ? year.toISOString() : 'No year selected'}</div>
      </Card.Body>
    </Card>
  );
}
