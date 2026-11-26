import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import moment, { Moment } from 'moment';
import { Calendar, CalendarRange } from '@nebular-react/core';

function getDayCell(day: number): HTMLElement {
  return Array.from(document.querySelectorAll('.day-cell')).find(
    (cell) => cell.textContent === String(day) && !cell.classList.contains('bounding-month')
  ) as HTMLElement;
}

function findRangeCell(kind: 'month' | 'year', text: string) {
  return screen.getByText(text, { selector: `.${kind}-cell > .cell-content` }).parentElement!;
}

describe('CalendarRange month and year views', () => {
  beforeEach(() => jest.useFakeTimers({ now: new Date(2024, 4, 15, 12) }));
  afterEach(() => jest.useRealTimers());

  it('marks months across the range and ignores months outside the bounds', () => {
    const { container } = render(
      <CalendarRange
        startView="month"
        visibleDate={new Date(2024, 4, 15)}
        min={new Date(2024, 2, 15)}
        max={new Date(2024, 6, 15)}
        range={{ start: new Date(2024, 2, 15), end: new Date(2024, 6, 8) }}
      />
    );

    expect(findRangeCell('month', 'Feb')).toHaveClass('disabled');
    expect(findRangeCell('month', 'Mar')).toHaveClass('selected', 'in-range', 'start');
    expect(findRangeCell('month', 'May')).toHaveClass('selected', 'in-range', 'today');
    expect(findRangeCell('month', 'Jul')).toHaveClass('selected', 'in-range', 'end');
    expect(findRangeCell('month', 'Aug')).toHaveClass('disabled');
    fireEvent.click(findRangeCell('month', 'Aug'));
    expect(container.querySelector('.month-cell')).toBeInTheDocument();
    fireEvent.click(findRangeCell('month', 'Jul'));
    expect(container.querySelector('.day-cell')).toBeInTheDocument();
  });

  it('marks years across the range and ignores years outside the bounds', () => {
    const { container } = render(
      <CalendarRange
        startView="year"
        visibleDate={new Date(2024, 4, 15)}
        min={new Date(2023, 3, 10)}
        max={new Date(2025, 1, 1)}
        range={{ start: new Date(2023, 3, 10), end: new Date(2025, 0, 1) }}
      />
    );

    expect(findRangeCell('year', '2022')).toHaveClass('disabled');
    expect(findRangeCell('year', '2023')).toHaveClass('selected', 'in-range', 'start');
    expect(findRangeCell('year', '2024')).toHaveClass('selected', 'in-range', 'today');
    expect(findRangeCell('year', '2025')).toHaveClass('selected', 'in-range', 'end');
    expect(findRangeCell('year', '2026')).toHaveClass('disabled');
    fireEvent.click(findRangeCell('year', '2022'));
    expect(container.querySelector('.year-cell')).toBeInTheDocument();
    fireEvent.click(findRangeCell('year', '2023'));
    expect(container.querySelector('.month-cell')).toBeInTheDocument();
  });

  it.each(['month', 'year'] as const)('marks a partial range in the %s view', (view) => {
    render(
      <CalendarRange
        startView={view}
        visibleDate={new Date(2024, 4, 15)}
        range={{ start: new Date(2024, 4, 15) }}
      />
    );

    const cell = findRangeCell(view, view === 'month' ? 'May' : '2024');
    expect(cell).toHaveClass('selected', 'today');
    expect(cell).not.toHaveClass('in-range');
  });
});

describe('Calendar', () => {
  it('renders the selected date as the wall clock of the timezone', () => {
    render(
      <Calendar
        timeZone="America/New_York"
        date={new Date('2024-01-15T02:00:00Z')}
        visibleDate={new Date('2024-01-15T02:00:00Z')}
      />
    );

    // 2024-01-15T02:00Z is 2024-01-14 21:00 in New York.
    expect(document.querySelector('.day-cell.selected')?.textContent).toBe('14');
  });

  it('emits the absolute instant of the selected wall clock date', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Calendar
        timeZone="America/New_York"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        onDateChange={onDateChange}
      />
    );

    await waitFor(() => expect(getDayCell(15)).toBeTruthy());
    await user.click(getDayCell(15));

    // 2024-01-15 00:00 in New York (EST, UTC-5) is 05:00Z.
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T05:00:00.000Z');
  });

  it('converts the selected date back with the daylight saving offset', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Calendar
        timeZone="America/New_York"
        visibleDate={new Date('2024-07-05T12:00:00Z')}
        onDateChange={onDateChange}
      />
    );

    await waitFor(() => expect(getDayCell(15)).toBeTruthy());
    await user.click(getDayCell(15));

    // 2024-07-15 00:00 in New York (EDT, UTC-4) is 04:00Z.
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-07-15T04:00:00.000Z');
  });

  it('resolves min and max from absolute instants to the timezone wall clock', async () => {
    render(
      <Calendar
        timeZone="Asia/Tokyo"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        min={new Date('2024-01-10T16:00:00Z')}
        max={new Date('2024-01-20T04:00:00Z')}
      />
    );

    // 2024-01-10T16:00Z is 2024-01-11 01:00 in Tokyo.
    await waitFor(() => expect(getDayCell(10)).toBeTruthy());

    expect(getDayCell(10)).toHaveClass('disabled');
    expect(getDayCell(11)).not.toHaveClass('disabled');
    expect(getDayCell(20)).not.toHaveClass('disabled');
    expect(getDayCell(21)).toHaveClass('disabled');
  });

  it('keeps filter and disabledDates on the timezone wall clock', async () => {
    render(
      <Calendar
        timeZone="Asia/Tokyo"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        disabledDates={[new Date(2024, 0, 15, 20, 0)]}
        filter={(date) => date.getDate() !== 16}
      />
    );

    await waitFor(() => expect(getDayCell(15)).toBeTruthy());

    expect(getDayCell(15)).toHaveClass('disabled');
    expect(getDayCell(16)).toHaveClass('disabled');
    expect(getDayCell(17)).not.toHaveClass('disabled');
  });

  it('highlights today using the timezone wall clock', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T02:00:00Z'));

    try {
      render(<Calendar timeZone="Asia/Tokyo" />);

      // 2024-01-15T02:00Z is 2024-01-15 11:00 in Tokyo.
      expect(document.querySelector('.day-cell.today')?.textContent).toBe('15');
    } finally {
      jest.useRealTimers();
    }
  });

  it('emits the absolute instant on the DST spring forward day', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Calendar
        timeZone="America/New_York"
        visibleDate={new Date('2024-03-05T12:00:00Z')}
        onDateChange={onDateChange}
      />
    );

    await waitFor(() => expect(getDayCell(10)).toBeTruthy());
    await user.click(getDayCell(10));

    // 2024-03-10 00:00 in New York is still EST (UTC-5).
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-03-10T05:00:00.000Z');
  });

  it('emits the absolute instant on the DST fall back day', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Calendar
        timeZone="America/New_York"
        visibleDate={new Date('2024-11-05T12:00:00Z')}
        onDateChange={onDateChange}
      />
    );

    await waitFor(() => expect(getDayCell(3)).toBeTruthy());
    await user.click(getDayCell(3));

    // 2024-11-03 00:00 in New York is still EDT (UTC-4).
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-11-03T04:00:00.000Z');
  });

  it('keeps the local behavior for an invalid timezone', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Calendar
        timeZone="Not/AZone"
        visibleDate={new Date(2024, 0, 10)}
        onDateChange={onDateChange}
      />
    );

    await waitFor(() => expect(getDayCell(15)).toBeTruthy());
    await user.click(getDayCell(15));

    const value = onDateChange.mock.calls[0][0] as Date;
    expect(value.getDate()).toBe(15);
    expect(value.getHours()).toBe(0);
  });

  it('preserves Moment values while converting the selection', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Calendar<Moment>
        timeZone="America/New_York"
        dateType="moment"
        visibleDate={moment('2024-01-05T12:00:00Z')}
        onDateChange={onDateChange}
      />
    );

    await waitFor(() => expect(getDayCell(15)).toBeTruthy());
    await user.click(getDayCell(15));

    const value = onDateChange.mock.calls[0][0] as Moment;
    expect(moment.isMoment(value)).toBe(true);
    expect(value.toISOString()).toBe('2024-01-15T05:00:00.000Z');
  });

  it('exposes accessible navigation labels', async () => {
    const user = userEvent.setup();

    render(
      <Calendar
        date={new Date('2024-01-15T12:00:00Z')}
        visibleDate={new Date('2024-01-15T12:00:00Z')}
      />
    );

    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /2024/ }));

    expect(screen.getByRole('button', { name: 'Previous years' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next years' })).toBeInTheDocument();
  });

  it('has no accessibility violations with a timezone', async () => {
    const { container } = render(
      <Calendar
        timeZone="America/New_York"
        date={new Date('2024-01-15T02:00:00Z')}
        visibleDate={new Date('2024-01-15T02:00:00Z')}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('CalendarRange timezone', () => {
  it('emits the absolute instants of the selected range', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <CalendarRange
        timeZone="America/New_York"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        onRangeChange={onRangeChange}
      />
    );

    await waitFor(() => expect(getDayCell(10)).toBeTruthy());
    await user.click(getDayCell(10));
    await user.click(getDayCell(15));

    const lastRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((lastRange.start as Date).toISOString()).toBe('2024-01-10T05:00:00.000Z');
    expect((lastRange.end as Date).toISOString()).toBe('2024-01-15T05:00:00.000Z');
  });

  it('renders the range as the wall clock of the timezone', async () => {
    render(
      <CalendarRange
        timeZone="America/New_York"
        range={{
          start: new Date('2024-01-10T05:00:00Z'),
          end: new Date('2024-01-12T05:00:00Z')
        }}
        visibleDate={new Date('2024-01-05T12:00:00Z')}
      />
    );

    await waitFor(() => expect(getDayCell(10)).toBeTruthy());

    expect(getDayCell(10)).toHaveClass('start');
    expect(getDayCell(11)).toHaveClass('in-range');
    expect(getDayCell(12)).toHaveClass('end');
  });

  it('keeps the range on the timezone wall clock across the DST transition', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <CalendarRange
        timeZone="America/New_York"
        visibleDate={new Date('2024-03-05T12:00:00Z')}
        onRangeChange={onRangeChange}
      />
    );

    await waitFor(() => expect(getDayCell(9)).toBeTruthy());
    await user.click(getDayCell(9));
    await user.click(getDayCell(11));

    const lastRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((lastRange.start as Date).toISOString()).toBe('2024-03-09T05:00:00.000Z');
    expect((lastRange.end as Date).toISOString()).toBe('2024-03-11T04:00:00.000Z');
  });
});
