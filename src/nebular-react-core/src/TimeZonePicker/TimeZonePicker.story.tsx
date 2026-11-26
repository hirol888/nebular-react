import React, { useState } from 'react';
import { Card } from '../Card';
import { TimeZonePicker } from './TimeZonePicker';

export default { title: 'TimeZonePicker', component: TimeZonePicker };

export function Showcase() {
  const [timeZone, setTimeZone] = useState<string | null>('Europe/Lisbon');

  return (
    <Card size="large">
      <Card.Body>
        <TimeZonePicker
          label="Time zone"
          description="Search and pick an IANA time zone"
          value={timeZone}
          onChange={(nextTimeZone) => setTimeZone(nextTimeZone)}
        />
        <div style={{ marginTop: 16 }}>{timeZone ?? 'No time zone selected'}</div>
      </Card.Body>
    </Card>
  );
}

export function BoundsAndClear() {
  const [timeZone, setTimeZone] = useState<string | null>(null);

  return (
    <Card size="large">
      <Card.Body>
        <TimeZonePicker
          label="Reporting time zone"
          placeholder="Select a zone"
          clearable
          data={[
            'UTC',
            'America/New_York',
            'America/Sao_Paulo',
            'Europe/London',
            'Europe/Lisbon',
            'Asia/Tokyo'
          ]}
          value={timeZone}
          onChange={(nextTimeZone) => setTimeZone(nextTimeZone)}
        />
      </Card.Body>
    </Card>
  );
}

export function WithoutSearch() {
  const [timeZone, setTimeZone] = useState<string | null>('UTC');

  return (
    <Card size="large">
      <Card.Body>
        <TimeZonePicker
          label="Time zone (no search)"
          searchable={false}
          nothingFoundMessage="No zone here"
          value={timeZone}
          onChange={(nextTimeZone) => setTimeZone(nextTimeZone)}
        />
      </Card.Body>
    </Card>
  );
}
