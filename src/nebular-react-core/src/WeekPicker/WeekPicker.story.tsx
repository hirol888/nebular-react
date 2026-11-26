import React, { useState } from 'react';
import { Card } from '../Card';
import { WeekPicker, WeekRange } from './WeekPicker';

export default { title: 'WeekPicker', component: WeekPicker };

const INITIAL_WEEK: WeekRange = {
  start: new Date(2024, 2, 18),
  end: new Date(2024, 2, 24, 23, 59, 59, 999),
  weekNumber: 12,
  year: 2024
};

export function Showcase() {
  const [week, setWeek] = useState<WeekRange | null>(INITIAL_WEEK);

  return (
    <Card size="large">
      <Card.Body>
        <WeekPicker
          label="Week"
          description="Select any day to pick its ISO week"
          value={week}
          onChange={(nextWeek) => setWeek(nextWeek)}
        />
        <div style={{ marginTop: 16 }}>
          {week
            ? `W${week.weekNumber} ${week.year} — ${week.start.toISOString()} / ${week.end.toISOString()}`
            : 'No week selected'}
        </div>
      </Card.Body>
    </Card>
  );
}

export function BoundsAndClear() {
  const [week, setWeek] = useState<WeekRange | null>(INITIAL_WEEK);

  return (
    <Card size="large">
      <Card.Body>
        <WeekPicker
          label="Sprint week"
          clearable
          value={week}
          onChange={(nextWeek) => setWeek(nextWeek)}
          min={new Date(2024, 2, 4)}
          max={new Date(2024, 2, 24)}
          visibleDate={new Date(2024, 2, 15)}
        />
      </Card.Body>
    </Card>
  );
}

export function TimeZone() {
  const [week, setWeek] = useState<WeekRange | null>({
    start: new Date('2024-03-18T04:00:00.000Z'),
    end: new Date('2024-03-25T03:59:59.999Z'),
    weekNumber: 12,
    year: 2024
  });

  return (
    <Card size="large">
      <Card.Body>
        <WeekPicker
          label="Week (America/New_York)"
          timeZone="America/New_York"
          value={week}
          onChange={(nextWeek) => setWeek(nextWeek)}
        />
        <div style={{ marginTop: 16 }}>
          {week ? `${week.start.toISOString()} / ${week.end.toISOString()}` : 'No week selected'}
        </div>
      </Card.Body>
    </Card>
  );
}
