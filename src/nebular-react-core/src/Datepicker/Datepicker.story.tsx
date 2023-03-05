import React, { useState } from 'react';
import moment, { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { Datepicker } from './Datepicker';
import { Card } from '../Card';
import { DateRange } from '../Calendar';
import { Rangepicker } from './Rangepicker';

export default { title: 'Datepicker' };

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

export function Range() {
  const [range, setRange] = useState<DateRange<Moment>>(null);

  return (
    <Card size="large">
      <Card.Body>
        <Rangepicker<Moment>
          placeholder="Pick Date Range"
          range={range}
          onRangeChange={(_range) => setRange(_range)}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}
