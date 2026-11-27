import React, { useState } from 'react';
import { Card } from '../Card';
import { QuarterPicker, QuarterValue } from './QuarterPicker';

export default { title: 'QuarterPicker', component: QuarterPicker };

export function Showcase() {
  const [quarter, setQuarter] = useState<QuarterValue | null>({ year: 2024, quarter: 2 });

  return (
    <Card size="large">
      <Card.Body>
        <QuarterPicker
          label="Quarter"
          description="Pick a fiscal quarter"
          value={quarter}
          onChange={(nextQuarter) => setQuarter(nextQuarter)}
        />
        <div style={{ marginTop: 16 }}>
          {quarter ? `Q${quarter.quarter} ${quarter.year}` : 'No quarter selected'}
        </div>
      </Card.Body>
    </Card>
  );
}

export function BoundsAndClear() {
  const [quarter, setQuarter] = useState<QuarterValue | null>({ year: 2024, quarter: 2 });

  return (
    <Card size="large">
      <Card.Body>
        <QuarterPicker
          label="Reporting quarter"
          clearable
          value={quarter}
          onChange={(nextQuarter) => setQuarter(nextQuarter)}
          min={{ year: 2024, quarter: 2 }}
          max={{ year: 2025, quarter: 3 }}
        />
      </Card.Body>
    </Card>
  );
}

export function YearNavigation() {
  const [quarter, setQuarter] = useState<QuarterValue | null>(null);

  return (
    <Card size="large">
      <Card.Body>
        <QuarterPicker
          label="Quarter (start at 2020)"
          visibleYear={2020}
          value={quarter}
          onChange={(nextQuarter) => setQuarter(nextQuarter)}
        />
      </Card.Body>
    </Card>
  );
}
