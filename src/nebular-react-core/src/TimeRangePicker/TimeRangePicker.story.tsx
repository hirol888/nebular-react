import React, { useState } from 'react';
import { Card } from '../Card';
import { TimeRange, TimeRangePicker } from './TimeRangePicker';

export default { title: 'TimeRangePicker', component: TimeRangePicker };

export function Showcase() {
  const [range, setRange] = useState<TimeRange<Date>>({
    start: new Date(2024, 0, 15, 9, 0),
    end: new Date(2024, 0, 15, 17, 0)
  });

  return (
    <Card size="large">
      <Card.Body>
        <TimeRangePicker<Date>
          label="Shift"
          description="Pick the start and end of the shift"
          value={range}
          onChange={(nextRange) => setRange(nextRange)}
        />
        <div style={{ marginTop: 16 }}>
          {range.start && range.end
            ? `${range.start.toISOString()} - ${range.end.toISOString()}`
            : 'No shift selected'}
        </div>
      </Card.Body>
    </Card>
  );
}

export function MinuteStep() {
  const [range, setRange] = useState<TimeRange<Date>>({
    start: null,
    end: null
  });

  return (
    <Card size="large">
      <Card.Body>
        <TimeRangePicker<Date>
          label="Quarter hour"
          minuteStep={30}
          value={range}
          onChange={(nextRange) => setRange(nextRange)}
        />
      </Card.Body>
    </Card>
  );
}

export function TimeZone() {
  const [range, setRange] = useState<TimeRange<Date>>({
    start: new Date('2024-01-15T14:00:00Z'),
    end: new Date('2024-01-15T22:00:00Z')
  });

  return (
    <Card size="large">
      <Card.Body>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>America/New_York</strong>
            <TimeRangePicker<Date>
              timeZone="America/New_York"
              value={range}
              onChange={(nextRange) => setRange(nextRange)}
              ariaLabel="New York shift"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>Asia/Tokyo</strong>
            <TimeRangePicker<Date>
              timeZone="Asia/Tokyo"
              value={range}
              onChange={(nextRange) => setRange(nextRange)}
              ariaLabel="Tokyo shift"
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          {range.start && range.end
            ? `${range.start.toISOString()} - ${range.end.toISOString()}`
            : 'No shift selected'}
        </div>
      </Card.Body>
    </Card>
  );
}
