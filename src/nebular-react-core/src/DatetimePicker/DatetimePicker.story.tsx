import moment, { Moment } from 'moment';
import React, { useState } from 'react';
import { Card } from '../Card';
import { DatetimePicker } from './DatetimePicker';

export default { title: 'DatetimePicker', component: DatetimePicker };

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

export function TimeZone() {
  const [date, setDate] = useState<Date>(new Date('2024-07-15T12:00:00Z'));

  return (
    <Card size="large">
      <Card.Body>
        <div>Valor absoluto: {date.toISOString()} — Nova York 08:00, Tóquio 21:00 no verão.</div>
        <DatetimePicker
          timeZone="America/New_York"
          format="DD/MM/YYYY HH:mm"
          date={date}
          onDateChange={(_date) => setDate(_date)}
          inputProps={{ 'aria-label': 'New York time' }}
        />
        <DatetimePicker
          timeZone="Asia/Tokyo"
          format="DD/MM/YYYY HH:mm"
          date={date}
          onDateChange={(_date) => setDate(_date)}
          inputProps={{ 'aria-label': 'Tokyo time' }}
        />
      </Card.Body>
    </Card>
  );
}

export function InputMaskAndKeyboard() {
  const [date, setDate] = useState<Date>(new Date('2024-07-15T12:00:00Z'));

  return (
    <Card size="large">
      <Card.Body>
        <div style={{ marginBottom: 8 }}>
          Type the date and time or use the arrow keys (↑/↓) to change the day, month, year, hour or
          minute under the caret.
        </div>
        <DatetimePicker
          timeZone="America/New_York"
          format="DD/MM/YYYY HH:mm"
          withInputMask
          withKeyboardEdit
          date={date}
          onDateChange={(_date) => setDate(_date)}
          placeholder="DD/MM/YYYY HH:mm"
          inputProps={{ 'aria-label': 'Datetime with input mask and keyboard edit' }}
        />
        <div style={{ marginTop: 16 }}>Absolute value: {date.toISOString()}</div>
      </Card.Body>
    </Card>
  );
}
