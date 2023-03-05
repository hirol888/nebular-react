import React, { useState } from 'react';
import moment, { Moment } from 'moment';
import { useDateFns } from '@nebular-react/hooks';
import { Card } from '../Card';
import { Calendar } from './Calendar';
import { CalendarCustomDayCell } from './calendar-kit/CalendarCustomDayCell/CalendarCustomDayCell';
import { CalendarRange } from './CalendarRange';
import { DateRange } from './calendar-kit';

export default { title: 'Calendar' };

export function Showcase() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate?.toLocaleDateString()}</Card.Header>
      <Card.Body>
        <Calendar<Date>
          date={selectedDate}
          onDateChange={(_date: Date) => setSelectedDate(_date)}
        />
      </Card.Body>
    </Card>
  );
}

export function BoundingMonth() {
  const date = moment();
  const [selectedDate, setSelectedDate] = useState<Moment>(date);

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate.format('MMMM DD, YYYY')}</Card.Header>
      <Card.Body>
        <Calendar<Moment>
          date={selectedDate}
          boundingMonth={false}
          dateType="moment"
          onDateChange={(_date: Moment) => setSelectedDate(_date)}
        />
      </Card.Body>
    </Card>
  );
}

export function CustomDayCell() {
  const date = moment();
  const [selectedDate, setSelectedDate] = useState<Moment>(date);

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate.format('MMMM DD, YYYY')}</Card.Header>
      <Card.Body>
        <Calendar<Moment>
          date={selectedDate}
          onDateChange={(_date: Moment) => setSelectedDate(_date)}
          dayCellComponent={CalendarCustomDayCell}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}

export function Filter() {
  const date = moment();
  const [selectedDate, setSelectedDate] = useState<Moment>(date);
  const dateFns = useDateFns<Moment>();

  const filter = (_date: Moment) =>
    dateFns.getDayOfWeek(_date) !== 0 && dateFns.getDayOfWeek(_date) !== 6;

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate.format('MMMM DD, YYYY')}</Card.Header>
      <Card.Body>
        <Calendar<Moment>
          date={selectedDate}
          onDateChange={(_date: Moment) => setSelectedDate(_date)}
          filter={filter}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}

export function MinMax() {
  const dateFns = useDateFns<Moment>();
  const date = moment();
  const min = dateFns.addDays(date, -7);
  const max = dateFns.addDays(date, 7);
  const [selectedDate, setSelectedDate] = useState<Moment>(date);

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate.format('MMMM DD, YYYY')}</Card.Header>
      <Card.Body>
        <Calendar<Moment>
          date={selectedDate}
          min={min}
          max={max}
          onDateChange={(_date: Moment) => setSelectedDate(_date)}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}

export function Size() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate?.toLocaleDateString()}</Card.Header>
      <Card.Body>
        <Calendar<Date>
          date={selectedDate}
          size="large"
          onDateChange={(_date: Date) => setSelectedDate(_date)}
        />
      </Card.Body>
    </Card>
  );
}

export function StartView() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate?.toLocaleDateString()}</Card.Header>
      <Card.Body>
        <Calendar<Date>
          date={selectedDate}
          startView="month"
          onDateChange={(_date: Date) => setSelectedDate(_date)}
        />
      </Card.Body>
    </Card>
  );
}

export function WithoutNavigation() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(date);

  return (
    <Card>
      <Card.Header>Selected date: {selectedDate?.toLocaleDateString()}</Card.Header>
      <Card.Body>
        <Calendar<Date>
          date={selectedDate}
          showWeekNumber
          onDateChange={(_date: Date) => setSelectedDate(_date)}
        />
      </Card.Body>
    </Card>
  );
}

export function Range() {
  const dateFns = useDateFns<Moment>();
  const date = moment();
  const start = dateFns.addDays(dateFns.getMonthStart(date), 3);
  const end = dateFns.addDays(dateFns.getMonthEnd(date), -3);
  const [selectedRange, setSelectedRange] = useState<DateRange<Moment>>({ start, end });

  return (
    <Card>
      <Card.Header>
        {' '}
        Selected range: {selectedRange.start?.format('MMMM DD, YYYY')} -{' '}
        {selectedRange.end?.format('MMMM DD, YYYY')}
      </Card.Header>
      <Card.Body>
        <CalendarRange<Moment>
          range={selectedRange}
          onRangeChange={(range) => setSelectedRange(range)}
          dateType="moment"
        />
      </Card.Body>
    </Card>
  );
}
