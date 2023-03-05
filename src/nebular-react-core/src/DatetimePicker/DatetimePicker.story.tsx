import moment, { Moment } from 'moment';
import React, { useState } from 'react';
import { Card } from '../Card';
import { DatetimePicker } from './DatetimePicker';

export default { title: 'DatetimePicker' };

export function Showcase() {
  const date = moment();
  const [selectedDate, setSelectedDate] = useState<Moment>(date);

  return (
    <Card size="large">
      <Card.Body>
        <DatetimePicker<Moment>
          placeholder="Pick Date"
          timeListProps={{ withSeconds: true }}
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}

export function SingleColumn() {
  const date = moment();
  const [selectedDate, setSelectedDate] = useState<Moment>(date);

  return (
    <Card size="large">
      <Card.Body>
        <DatetimePicker<Moment>
          placeholder="Pick Date"
          timeListProps={{ singleColumn: true, step: 10 }}
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}
