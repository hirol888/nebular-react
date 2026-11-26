import React, { useState } from 'react';
import { Card } from '../Card';
import { MonthPicker } from './MonthPicker';

export default { title: 'MonthPicker', component: MonthPicker };

export function Showcase() {
  const [month, setMonth] = useState<Date | null>(new Date(2024, 0, 15));

  return (
    <Card size="large">
      <Card.Body>
        <MonthPicker<Date>
          label="Month"
          description="Pick a month"
          format="MMMM YYYY"
          value={month}
          onChange={(nextMonth) => setMonth(nextMonth)}
        />
        <div style={{ marginTop: 16 }}>{month ? month.toISOString() : 'No month selected'}</div>
      </Card.Body>
    </Card>
  );
}

export function BoundsAndClear() {
  const [month, setMonth] = useState<Date | null>(new Date(2024, 3, 15));

  return (
    <Card size="large">
      <Card.Body>
        <MonthPicker<Date>
          label="Fiscal month"
          format="MMMM YYYY"
          clearable
          value={month}
          onChange={(nextMonth) => setMonth(nextMonth)}
          min={new Date(2024, 2, 1)}
          max={new Date(2024, 8, 30)}
        />
      </Card.Body>
    </Card>
  );
}

export function TimeZone() {
  const [month, setMonth] = useState<Date | null>(new Date('2024-02-01T02:00:00Z'));

  return (
    <Card size="large">
      <Card.Body>
        <MonthPicker<Date>
          label="Month (America/New_York)"
          timeZone="America/New_York"
          format="MMMM YYYY"
          value={month}
          onChange={(nextMonth) => setMonth(nextMonth)}
        />
        <div style={{ marginTop: 16 }}>{month ? month.toISOString() : 'No month selected'}</div>
      </Card.Body>
    </Card>
  );
}
