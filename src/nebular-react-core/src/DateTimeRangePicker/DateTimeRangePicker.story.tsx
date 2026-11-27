import React, { useState } from 'react';
import { Card } from '../Card';
import { DateTimeRange, DateTimeRangePicker } from './DateTimeRangePicker';

export default { title: 'DateTimeRangePicker', component: DateTimeRangePicker };

export function Showcase() {
  const [range, setRange] = useState<DateTimeRange<Date>>({
    start: new Date(2024, 0, 10, 9, 0),
    end: new Date(2024, 0, 15, 17, 0)
  });

  return (
    <Card size="large">
      <Card.Body>
        <DateTimeRangePicker<Date>
          label="Period"
          description="Pick the start and end date and time"
          format="DD/MM/YYYY HH:mm"
          value={range}
          onChange={(nextRange) => setRange(nextRange)}
        />
        <div style={{ marginTop: 16 }}>
          {range.start && range.end
            ? `${range.start.toISOString()} - ${range.end.toISOString()}`
            : 'No range selected'}
        </div>
      </Card.Body>
    </Card>
  );
}

export function Presets() {
  const [range, setRange] = useState<DateTimeRange<Date>>({
    start: null,
    end: null
  });

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59);

  return (
    <Card size="large">
      <Card.Body>
        <DateTimeRangePicker<Date>
          label="Billing period"
          format="DD/MM/YYYY HH:mm"
          value={range}
          onChange={(nextRange) => setRange(nextRange)}
          presets={[
            { label: 'This month', getValue: () => ({ start: monthStart, end: monthEnd }) },
            {
              label: 'Last 7 days',
              getValue: () => ({
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 0, 0),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59)
              })
            }
          ]}
        />
      </Card.Body>
    </Card>
  );
}

export function TimeZone() {
  const [range, setRange] = useState<DateTimeRange<Date>>({
    start: new Date('2024-01-10T14:00:00Z'),
    end: new Date('2024-01-15T22:00:00Z')
  });

  return (
    <Card size="large">
      <Card.Body>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>America/New_York</strong>
            <DateTimeRangePicker<Date>
              timeZone="America/New_York"
              format="DD/MM/YYYY HH:mm"
              value={range}
              onChange={(nextRange) => setRange(nextRange)}
              ariaLabel="New York range"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>Asia/Tokyo</strong>
            <DateTimeRangePicker<Date>
              timeZone="Asia/Tokyo"
              format="DD/MM/YYYY HH:mm"
              value={range}
              onChange={(nextRange) => setRange(nextRange)}
              ariaLabel="Tokyo range"
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          {range.start && range.end
            ? `${range.start.toISOString()} - ${range.end.toISOString()}`
            : 'No range selected'}
        </div>
      </Card.Body>
    </Card>
  );
}
