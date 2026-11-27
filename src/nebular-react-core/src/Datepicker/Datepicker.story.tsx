import React, { useState } from 'react';
import moment, { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { Datepicker } from './Datepicker';
import { Card } from '../Card';
import { DateRange } from '../Calendar';
import { Rangepicker } from './Rangepicker';

export default { title: 'Datepicker', component: Datepicker };

export function Showcase() {
  const date = moment();
  const [selectedDate, setSelectedDate] = useState<Moment>(date);

  return (
    <Card size="large">
      <Card.Body>
        <Datepicker<Moment>
          placeholder="Pick Date"
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}

export function Filter() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const filterFn = (_date: Date) => _date.getDay() === 0;

  return (
    <Card size="large">
      <Card.Body>
        <Datepicker<Date>
          placeholder="Pick Date"
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          filter={filterFn}
        />
      </Card.Body>
    </Card>
  );
}

export function MinMax() {
  const date = moment();
  const [selectedDate, setSelectedDate] = useState<Moment>(date);
  const dateFns = useDateFns<Moment>();
  const min = dateFns.addMonths(date, -1);
  const max = dateFns.addMonths(date, 1);

  return (
    <Card size="large">
      <Card.Body>
        <Datepicker<Moment>
          placeholder="Pick Date"
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          min={min}
          max={max}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}

export function DisabledDates() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateFns = useDateFns<Date>();
  const disabledDates = [
    dateFns.addDays(dateFns.today('native'), 1),
    dateFns.addDays(dateFns.today('native'), 2)
  ];

  return (
    <Card size="large">
      <Card.Body>
        <Datepicker<Date>
          placeholder="Pick Date"
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          disabledDates={disabledDates}
        />
      </Card.Body>
    </Card>
  );
}

export function DisabledWeekends() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <Card size="large">
      <Card.Body>
        <Datepicker<Date>
          placeholder="Pick Date"
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
        />
      </Card.Body>
    </Card>
  );
}

export function Presets() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <Card size="large">
      <Card.Body>
        <Datepicker<Date>
          placeholder="Pick Date"
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          presets
        />
      </Card.Body>
    </Card>
  );
}

export function Range() {
  const [range, setRange] = useState<DateRange<Moment>>(null);

  return (
    <Card size="large">
      <Card.Body>
        <Rangepicker<Moment>
          placeholder="Pick Date Range"
          range={range}
          onRangeChange={(_range) => setRange(_range)}
          presets
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}

export function RangeCustomPresets() {
  const [range, setRange] = useState<DateRange<Date>>(null);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <Card size="large">
      <Card.Body>
        <Rangepicker<Date>
          placeholder="Pick Date Range"
          range={range}
          onRangeChange={(_range) => setRange(_range)}
          presets={[
            { label: 'This month (full)', getValue: () => ({ start, end }) },
            {
              label: 'Previous month',
              getValue: () => ({
                start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                end: new Date(today.getFullYear(), today.getMonth(), 0)
              })
            }
          ]}
        />
      </Card.Body>
    </Card>
  );
}

export function TimeZone() {
  // A single absolute instant, displayed as the wall clock of each time zone.
  const [date, setDate] = useState<Date>(new Date('2024-01-15T02:00:00Z'));

  return (
    <Card size="large">
      <Card.Body>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>America/New_York</strong>
            <Datepicker<Date>
              timeZone="America/New_York"
              format="YYYY-MM-DD"
              date={date}
              onDateChange={(_date) => setDate(_date)}
              inputProps={{ 'aria-label': 'New York date' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>Asia/Tokyo</strong>
            <Datepicker<Date>
              timeZone="Asia/Tokyo"
              format="YYYY-MM-DD"
              date={date}
              onDateChange={(_date) => setDate(_date)}
              inputProps={{ 'aria-label': 'Tokyo date' }}
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>Absolute value: {date.toISOString()}</div>
      </Card.Body>
    </Card>
  );
}

export function InputMaskAndKeyboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 0, 15));

  return (
    <Card size="large">
      <Card.Body>
        <div style={{ marginBottom: 8 }}>
          Type the date or use the arrow keys (↑/↓) to change the day, month or year under the
          caret.
        </div>
        <Datepicker<Date>
          format="DD/MM/YYYY"
          withInputMask
          withKeyboardEdit
          date={selectedDate}
          onDateChange={(_date) => setSelectedDate(_date)}
          placeholder="DD/MM/YYYY"
          inputProps={{ 'aria-label': 'Date with input mask and keyboard edit' }}
        />
        <div style={{ marginTop: 16 }}>Selected date: {selectedDate.toISOString()}</div>
      </Card.Body>
    </Card>
  );
}

export function RangeInputMaskAndKeyboard() {
  const [range, setRange] = useState<DateRange<Date>>(null);

  return (
    <Card size="large">
      <Card.Body>
        <div style={{ marginBottom: 8 }}>
          Type the range or use the arrow keys (↑/↓) to change the day, month or year under the
          caret — the edited half (start or end) is the one that contains the caret.
        </div>
        <Rangepicker<Date>
          format="DD/MM/YYYY"
          withInputMask
          withKeyboardEdit
          range={range}
          onRangeChange={(_range) => setRange(_range)}
          placeholder="DD/MM/YYYY - DD/MM/YYYY"
          inputProps={{ 'aria-label': 'Range with input mask and keyboard edit' }}
        />
      </Card.Body>
    </Card>
  );
}
