import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
// Internal unit imported directly because the public entry point does not expose it yet.
import { CalendarHeatmap } from '@nebular-react/core';

const data = [
  { date: '2026-01-05', value: 0 },
  { date: '2026-01-06', value: 5 },
  { date: '2026-01-12', value: 7 },
  { date: '2026-01-31', value: 10 },
  { date: '2025-12-01', value: 99 },
  { date: 'not-a-date', value: 3 }
];

const startDate = '2026-01-01';
const endDate = '2026-01-31';

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-calendar-day]')).map((element) =>
    [
      element.getAttribute('data-calendar-day'),
      element.getAttribute('x'),
      element.getAttribute('y'),
      element.getAttribute('width'),
      element.getAttribute('height'),
      element.getAttribute('fill')
    ].join(',')
  );
}

describe('CalendarHeatmap', () => {
  it('should render a contributions-style grid with one slot per day in the range', () => {
    const { container } = render(
      <CalendarHeatmap data={data} startDate={startDate} endDate={endDate} ariaLabel="Commits" />
    );

    expect(screen.getByRole('group', { name: 'Commits' })).toBeInTheDocument();
    // 2026-01-01 is a Thursday, so the grid starts on Sunday 2025-12-28 (5 weeks).
    expect(container.querySelectorAll('[data-calendar-day]')).toHaveLength(35);
    expect(container.querySelectorAll('[data-calendar-empty]')).toHaveLength(31);
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('img', { name: '2026-01-06: 5' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: '2026-01-31: 10' })).toBeInTheDocument();
  });

  it('should ignore entries outside the range and entries with invalid dates', () => {
    const { container } = render(
      <CalendarHeatmap data={data} startDate={startDate} endDate={endDate} ariaLabel="Commits" />
    );

    expect(container.querySelector('[data-calendar-day="2025-12-01"]')).toBeNull();
    expect(screen.queryByRole('img', { name: '2025-12-01: 99' })).not.toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(4);
  });

  it('should place consecutive weeks on the horizontal axis with the configured cell size and gap', () => {
    render(
      <CalendarHeatmap
        data={data}
        startDate={startDate}
        endDate={endDate}
        cellSize={16}
        gap={4}
        ariaLabel="Commits"
      />
    );

    const first = screen.getByRole('img', { name: '2026-01-05: 0' });
    const second = screen.getByRole('img', { name: '2026-01-12: 7' });

    expect(Number(second.getAttribute('x')) - Number(first.getAttribute('x'))).toBe(20);
    expect(second.getAttribute('y')).toBe(first.getAttribute('y'));
    expect(first).toHaveAttribute('width', '16');
    expect(first).toHaveAttribute('height', '16');
  });

  it('should interpolate the cell color across the configured palette', () => {
    render(
      <CalendarHeatmap
        data={data}
        startDate={startDate}
        endDate={endDate}
        colors={['#000000', '#ffffff']}
        showLegend={false}
        ariaLabel="Commits"
      />
    );

    expect(screen.getByRole('img', { name: '2026-01-05: 0' })).toHaveAttribute(
      'fill',
      'rgb(0, 0, 0)'
    );
    expect(screen.getByRole('img', { name: '2026-01-06: 5' })).toHaveAttribute(
      'fill',
      'rgb(128, 128, 128)'
    );
    expect(screen.getByRole('img', { name: '2026-01-31: 10' })).toHaveAttribute(
      'fill',
      'rgb(255, 255, 255)'
    );
  });

  it('should render the month and weekday labels and hide them when disabled', () => {
    const { container, rerender } = render(
      <CalendarHeatmap data={data} startDate={startDate} endDate={endDate} ariaLabel="Commits" />
    );

    expect(screen.getByText('Dec')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    rerender(
      <CalendarHeatmap
        data={data}
        startDate={startDate}
        endDate={endDate}
        showMonthLabels={false}
        showWeekdayLabels={false}
        ariaLabel="Commits"
      />
    );

    expect(screen.queryByText('Dec')).not.toBeInTheDocument();
    expect(screen.queryByText('Jan')).not.toBeInTheDocument();
    expect(screen.queryByText('Mon')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-calendar-day]')).toHaveLength(35);
  });

  it('should render the color scale legend and hide it when showLegend is false', () => {
    const { rerender } = render(
      <CalendarHeatmap
        data={data}
        startDate={startDate}
        endDate={endDate}
        valueFormatter={(value: number) => `${value} commits`}
        ariaLabel="Commits"
      />
    );

    expect(screen.getByRole('group', { name: 'Color scale' })).toBeInTheDocument();
    expect(screen.getByText('0 commits')).toBeInTheDocument();
    expect(screen.getByText('10 commits')).toBeInTheDocument();

    rerender(
      <CalendarHeatmap
        data={data}
        startDate={startDate}
        endDate={endDate}
        showLegend={false}
        ariaLabel="Commits"
      />
    );

    expect(screen.queryByRole('group', { name: 'Color scale' })).not.toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a day', () => {
    render(
      <CalendarHeatmap data={data} startDate={startDate} endDate={endDate} ariaLabel="Commits" />
    );

    const cell = screen.getByRole('img', { name: '2026-01-06: 5' });

    expect(screen.queryByText('2026-01-06: 5')).not.toBeInTheDocument();

    fireEvent.mouseEnter(cell);
    expect(screen.getByText('2026-01-06: 5')).toBeInTheDocument();

    fireEvent.blur(cell);
    expect(screen.queryByText('2026-01-06: 5')).not.toBeInTheDocument();

    fireEvent.focus(cell);
    expect(screen.getByText('2026-01-06: 5')).toBeInTheDocument();
  });

  it('should call onDayClick with the normalized datum on click and keyboard activation', () => {
    const onDayClick = jest.fn();

    render(
      <CalendarHeatmap
        data={data}
        startDate={startDate}
        endDate={endDate}
        ariaLabel="Commits"
        onDayClick={onDayClick}
      />
    );

    const cell = screen.getByRole('button', { name: '2026-01-06: 5' });

    fireEvent.click(cell);
    expect(onDayClick).toHaveBeenCalledTimes(1);
    expect(onDayClick.mock.calls[0][0].value).toBe(5);
    const clickedDate = onDayClick.mock.calls[0][0].date;
    expect([clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate()]).toEqual([
      2026, 0, 6
    ]);

    onDayClick.mockClear();
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onDayClick).toHaveBeenCalledTimes(1);
    expect(onDayClick.mock.calls[0][0].value).toBe(5);
  });

  it('should render an empty state when there is no usable data', () => {
    const { container, rerender } = render(
      <CalendarHeatmap data={[]} ariaLabel="Empty calendar heatmap" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(container.querySelectorAll('[data-calendar-day]')).toHaveLength(0);

    rerender(
      <CalendarHeatmap
        data={[{ date: 'not-a-date', value: 1 }]}
        ariaLabel="Empty calendar heatmap"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should produce a deterministic grid layout', () => {
    const { container, unmount } = render(
      <CalendarHeatmap data={data} startDate={startDate} endDate={endDate} ariaLabel="Commits" />
    );
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <CalendarHeatmap data={data} startDate={startDate} endDate={endDate} ariaLabel="Commits" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <CalendarHeatmap data={data} startDate={startDate} endDate={endDate} ariaLabel="Commits" />
        <CalendarHeatmap
          data={data}
          startDate={startDate}
          endDate={endDate}
          ariaLabel="Clickable commits"
          onDayClick={() => undefined}
          valueFormatter={(value: number) => `${value} commits`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
