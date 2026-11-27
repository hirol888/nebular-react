import React, { useState } from 'react';
import { Card } from '../Card';
import { MonthRange, MonthRangePicker } from './MonthRangePicker';

export default { title: 'MonthRangePicker', component: MonthRangePicker };

const INITIAL_RANGE: MonthRange<Date> = {
  start: new Date(2024, 2, 1),
  end: new Date(2024, 5, 1)
};

export function Showcase() {
  const [range, setRange] = useState<MonthRange<Date>>(INITIAL_RANGE);

  return (
    <Card size="large">
      <Card.Body>
        <MonthRangePicker
          label="Period"
          description="Pick a start and an end month"
          value={range}
          visibleDate={new Date(2024, 2, 15)}
          onChange={(nextRange) => setRange(nextRange)}
        />
        <div style={{ marginTop: 16 }}>
          {range.start && range.end
            ? `${range.start.toDateString()} - ${range.end.toDateString()}`
            : 'No range selected'}
        </div>
      </Card.Body>
    </Card>
  );
}

export function BoundsAndClear() {
  const [range, setRange] = useState<MonthRange<Date>>(INITIAL_RANGE);

  return (
    <Card size="large">
      <Card.Body>
        <MonthRangePicker
          label="Reporting period"
          clearable
          value={range}
          visibleDate={new Date(2024, 2, 15)}
          onChange={(nextRange) => setRange(nextRange)}
          min={new Date(2024, 2, 1)}
          max={new Date(2024, 8, 30)}
        />
      </Card.Body>
    </Card>
  );
}

export function TimeZone() {
  const [range, setRange] = useState<MonthRange<Date>>({
    start: new Date('2024-03-01T05:00:00.000Z'),
    end: new Date('2024-06-01T04:00:00.000Z')
  });

  return (
    <Card size="large">
      <Card.Body>
        <MonthRangePicker<Date>
          label="Period (America/New_York)"
          timeZone="America/New_York"
          value={range}
          visibleDate={new Date('2024-03-15T12:00:00.000Z')}
          onChange={(nextRange) => setRange(nextRange)}
        />
      </Card.Body>
    </Card>
  );
}
