import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarWithTime } from '@nebular-react/core';

function getDayCell(day: number): HTMLElement {
  return Array.from(document.querySelectorAll('.day-cell')).find(
    (cell) => cell.textContent === String(day) && !cell.classList.contains('bounding-month')
  ) as HTMLElement;
}

function getHourCell(container: HTMLElement, hour: string): HTMLElement {
  const hourList = container.querySelectorAll('.nebular-time-list-valuesList')[0] as HTMLElement;
  return within(hourList).getByText(hour);
}

describe('CalendarWithTime', () => {
  const date = new Date(2024, 4, 15, 10, 30);

  it('keeps the time when a new day is selected and emits the change', () => {
    const onDateChange = jest.fn();

    render(<CalendarWithTime date={date} timeListTitle="Time" onDateChange={onDateChange} />);

    expect(screen.getByText('Time')).toBeInTheDocument();

    fireEvent.click(getDayCell(20));

    expect(onDateChange).toHaveBeenCalledTimes(1);
    const [nextDate, close] = onDateChange.mock.calls[0] as [Date, boolean];
    expect(close).toBe(false);
    expect(nextDate.getDate()).toBe(20);
    expect(nextDate.getHours()).toBe(10);
    expect(nextDate.getMinutes()).toBe(30);
  });

  it('updates the time and commits when the apply button is clicked', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();
    const { container } = render(<CalendarWithTime date={date} onDateChange={onDateChange} />);

    fireEvent.click(getHourCell(container as HTMLElement, '14'));

    const [timeDate, close] = onDateChange.mock.calls[0] as [Date, boolean];
    expect(timeDate.getHours()).toBe(14);
    expect(timeDate.getMinutes()).toBe(30);
    expect(close).toBe(false);

    await user.click(screen.getByRole('button', { name: 'ok' }));

    const [committedDate, committedClose] = onDateChange.mock.calls.at(-1) as [Date, boolean];
    expect(committedDate.getHours()).toBe(14);
    expect(committedClose).toBe(true);
  });

  it('supports a single time column', () => {
    const onDateChange = jest.fn();
    const { container } = render(
      <CalendarWithTime
        date={date}
        timeListProps={{ singleColumn: true }}
        onDateChange={onDateChange}
      />
    );

    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.queryByText('Hr')).not.toBeInTheDocument();

    const list = container.querySelector('.nebular-time-list-valuesList') as HTMLElement;
    const cell = list.querySelector('[class*="timepickerCell"]') as HTMLElement;
    fireEvent.click(cell);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0] as [Date, boolean])[1]).toBe(false);
  });

  it('supports custom action labels', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();
    const { container } = render(
      <CalendarWithTime
        date={date}
        onDateChange={onDateChange}
        timeListProps={{ calendarActionsProps: { applyButtonText: 'Save' } }}
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(container.querySelector('.nebular-time-list-listItem')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    const [committed, close] = onDateChange.mock.calls.at(-1) as [Date, boolean];
    expect(committed).toBeInstanceOf(Date);
    expect(close).toBe(true);
  });
});
