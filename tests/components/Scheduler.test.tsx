import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { expandRecurrence, Scheduler, SchedulerEvent } from '@nebular-react/core';

const events: SchedulerEvent<Date>[] = [
  {
    id: 1,
    title: 'Daily standup',
    start: new Date(2024, 0, 10, 9, 0),
    end: new Date(2024, 0, 10, 9, 30)
  },
  {
    id: 2,
    title: 'Release',
    start: new Date(2024, 0, 11),
    allDay: true
  }
];

// jsdom does not implement PointerEvent, so the drag tests fall back to MouseEvent, which exposes
// the same `clientX`/`clientY`/`button` surface used by the component.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: window.MouseEvent
    });
  }
});

/** The time grid maps the whole day to `height` pixels (1440 px => 1 px per minute). */
function mockRect(
  element: Element,
  rect: { width?: number; height?: number; left?: number; top?: number }
): void {
  const left = rect.left ?? 0;
  const top = rect.top ?? 0;
  const width = rect.width ?? 0;
  const height = rect.height ?? 0;

  element.getBoundingClientRect = () =>
    ({
      left,
      top,
      width,
      height,
      x: left,
      y: top,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({})
    }) as DOMRect;
}

function getDayColumn(day: string): HTMLElement {
  const column = document.querySelector<HTMLElement>(`[data-scheduler-day="${day}"]`);

  if (!column) {
    throw new Error(`Day column for ${day} was not rendered`);
  }

  return column;
}

function prepareTimeGrid(day: string, options: { height?: number; weekWidth?: number } = {}): void {
  const column = getDayColumn(day);
  const height = options.height ?? 1440;
  const weekWidth = options.weekWidth ?? 0;

  mockRect(column, { height, width: weekWidth / 7 });

  const row = column.closest<HTMLElement>('[data-scheduler-time-row]');

  if (row) {
    mockRect(row, { height, width: weekWidth });
  }
}

function isoTimestamp(day: number, hour = 0, minute = 0): string {
  return new Date(2024, 0, day, hour, minute).toISOString();
}

describe('Scheduler', () => {
  it('renders events in the month view', () => {
    render(<Scheduler events={events} defaultDate={new Date(2024, 0, 10)} />);

    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('Daily standup')).toBeInTheDocument();
    expect(screen.getByText('Release')).toBeInTheDocument();
  });

  it('keeps visible content in the cell name and provides full date and resource details', () => {
    const defaultDate = new Date(2024, 0, 10);
    const { rerender } = render(<Scheduler events={events} defaultDate={defaultDate} />);

    expect(
      screen.getByRole('gridcell', { name: /^10.*Daily standup/ })
    ).toHaveAccessibleDescription('10 January 2024');

    rerender(
      <Scheduler
        events={[]}
        defaultDate={defaultDate}
        view="day"
        resourceView
        resources={[{ id: 'alice', name: 'Alice' }]}
      />
    );
    expect(screen.getByRole('gridcell', { name: '10' })).toHaveAccessibleDescription(
      '10 January 2024, Alice'
    );
  });

  it('renders the week and day views', () => {
    const { rerender } = render(
      <Scheduler events={events} defaultDate={new Date(2024, 0, 10)} view="week" />
    );

    expect(screen.getByText('Daily standup')).toBeInTheDocument();

    rerender(<Scheduler events={events} defaultDate={new Date(2024, 0, 10)} view="day" />);

    expect(screen.getByText('Daily standup')).toBeInTheDocument();
    expect(screen.queryByText('Release')).not.toBeInTheDocument();
  });

  it('navigates periods and reports date changes', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Scheduler events={events} defaultDate={new Date(2024, 0, 10)} onDateChange={onDateChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Next period' }));

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).getMonth()).toBe(1);
    expect(screen.getByText('February 2024')).toBeInTheDocument();
  });

  it('switches views and reports the change', async () => {
    const user = userEvent.setup();
    const onViewChange = jest.fn();

    render(
      <Scheduler events={events} defaultDate={new Date(2024, 0, 10)} onViewChange={onViewChange} />
    );

    await user.click(screen.getByRole('radio', { name: 'Week' }));

    expect(onViewChange).toHaveBeenCalledWith('week');
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('invokes onEventClick', async () => {
    const user = userEvent.setup();
    const onEventClick = jest.fn();

    render(
      <Scheduler events={events} defaultDate={new Date(2024, 0, 10)} onEventClick={onEventClick} />
    );

    await user.click(screen.getByRole('button', { name: /Daily standup/ }));

    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('shows an empty state in day view', () => {
    render(
      <Scheduler
        events={events}
        defaultDate={new Date(2024, 0, 12)}
        view="day"
        emptyState="Nothing scheduled"
      />
    );

    expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Scheduler events={events} defaultDate={new Date(2024, 0, 10)} ariaLabel="Team schedule" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('drag and drop', () => {
    const timed: SchedulerEvent<Date>[] = [
      {
        id: 'standup',
        title: 'Standup',
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 30)
      }
    ];

    it('Scheduler_Editable_ShouldPreviewAndEmitMoveOnPointerUp', () => {
      const onEventChange = jest.fn();
      const onEventResize = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventChange={onEventChange}
          onEventResize={onEventResize}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /Standup/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 300 });

      expect(event).toHaveAttribute('aria-grabbed', 'true');

      // 60 px => 60 minutes before snapping.
      fireEvent.pointerMove(document, { clientX: 100, clientY: 360 });

      expect(onEventChange).not.toHaveBeenCalled();
      expect(event).toHaveAttribute('data-scheduler-event-start', isoTimestamp(10, 10, 0));
      expect(event).toHaveAttribute('data-scheduler-event-end', isoTimestamp(10, 10, 30));

      fireEvent.pointerUp(document, { clientX: 100, clientY: 360 });

      expect(onEventChange).toHaveBeenCalledTimes(1);
      expect(onEventChange).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 10, 10, 0),
        end: new Date(2024, 0, 10, 10, 30)
      });
      expect(onEventResize).not.toHaveBeenCalled();
      expect(event).toHaveAttribute('aria-grabbed', 'false');
    });

    it('Scheduler_Editable_ShouldSnapMovesToSnapMinutes', () => {
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          snapMinutes={15}
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /Standup/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 320 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 320 });

      // 20 minutes snap down to 15.
      expect(onEventChange).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 10, 9, 15),
        end: new Date(2024, 0, 10, 9, 45)
      });
    });

    it('Scheduler_Editable_ShouldMoveAcrossDaysInWeekView', () => {
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-10', { weekWidth: 700 });

      const event = screen.getByRole('button', { name: /Standup/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 200, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 300, clientY: 300 });
      fireEvent.pointerUp(document, { clientX: 300, clientY: 300 });

      // 100 px is exactly one column of the 700 px week grid.
      expect(onEventChange).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 11, 9, 0),
        end: new Date(2024, 0, 11, 9, 30)
      });
    });

    it('Scheduler_Editable_ShouldClampHorizontalMoveToTheVisibleWeek', () => {
      const onEventChange = jest.fn();
      const monday: SchedulerEvent<Date>[] = [
        {
          id: 'monday',
          title: 'Monday sync',
          start: new Date(2024, 0, 8, 9, 0),
          end: new Date(2024, 0, 8, 9, 30)
        }
      ];

      render(
        <Scheduler
          events={monday}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-08', { weekWidth: 700 });

      const event = screen.getByRole('button', { name: /Monday sync/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 300, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: -400, clientY: 300 });
      fireEvent.pointerUp(document, { clientX: -400, clientY: 300 });

      // The week starts on Sunday Jan 7 in the default locale, so the move stops there.
      expect(onEventChange).toHaveBeenCalledWith(monday[0], {
        start: new Date(2024, 0, 7, 9, 0),
        end: new Date(2024, 0, 7, 9, 30)
      });
    });

    it('Scheduler_Editable_ShouldResizeFromTheHandleAndSnapTheEnd', () => {
      const onEventChange = jest.fn();
      const onEventResize = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventChange={onEventChange}
          onEventResize={onEventResize}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /Standup/ });
      const handle = event.querySelector<HTMLElement>('[data-scheduler-resize-handle]');

      expect(handle).not.toBeNull();

      fireEvent.pointerDown(handle as HTMLElement, { button: 0, clientX: 100, clientY: 540 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 585 });

      expect(onEventResize).not.toHaveBeenCalled();
      expect(event).toHaveAttribute('data-scheduler-event-end', isoTimestamp(10, 10, 15));

      fireEvent.pointerUp(document, { clientX: 100, clientY: 585 });

      expect(onEventResize).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 10, 15)
      });
      expect(onEventChange).not.toHaveBeenCalled();
    });

    it('Scheduler_Editable_ShouldSnapResizesToSnapMinutes', () => {
      const onEventResize = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          snapMinutes={15}
          onEventResize={onEventResize}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /Standup/ });
      const handle = event.querySelector<HTMLElement>(
        '[data-scheduler-resize-handle]'
      ) as HTMLElement;

      fireEvent.pointerDown(handle, { button: 0, clientX: 100, clientY: 540 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 560 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 560 });

      // 09:30 + 20 min = 09:50, which snaps down to 09:45.
      expect(onEventResize).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 45)
      });
    });

    it('Scheduler_Editable_ShouldNotResizeBelowTheMinimumDuration', () => {
      const onEventResize = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventResize={onEventResize}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /Standup/ });
      const handle = event.querySelector<HTMLElement>(
        '[data-scheduler-resize-handle]'
      ) as HTMLElement;

      fireEvent.pointerDown(handle, { button: 0, clientX: 100, clientY: 570 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 470 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 470 });

      // The event keeps at least one snap step of duration (15 minutes).
      expect(onEventResize).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 15)
      });
    });

    it('Scheduler_Editable_ShouldClampMoveToTheDayBoundaries', () => {
      const onEventChange = jest.fn();
      const early: SchedulerEvent<Date>[] = [
        {
          id: 'early',
          title: 'Early sync',
          start: new Date(2024, 0, 10, 0, 10),
          end: new Date(2024, 0, 10, 0, 40)
        }
      ];

      render(
        <Scheduler
          events={early}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /Early sync/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 200 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 200 });

      expect(onEventChange).toHaveBeenCalledWith(early[0], {
        start: new Date(2024, 0, 10, 0, 0),
        end: new Date(2024, 0, 10, 0, 30)
      });
    });

    it('Scheduler_Editable_ShouldStillInvokeClickWithoutMovement', async () => {
      const user = userEvent.setup();
      const onEventClick = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventClick={onEventClick}
        />
      );

      await user.click(screen.getByRole('button', { name: /Standup/ }));

      expect(onEventClick).toHaveBeenCalledWith(timed[0]);
    });

    it('Scheduler_Editable_ShouldIgnorePointerInteractionWhenNotEditable', () => {
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /Standup/ });

      expect(event).not.toHaveAttribute('aria-grabbed');

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 360 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 360 });

      expect(onEventChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard editing', () => {
    const timed: SchedulerEvent<Date>[] = [
      {
        id: 'standup',
        title: 'Standup',
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 30)
      }
    ];

    it('Scheduler_Editable_ShouldMoveWithArrowKeys', async () => {
      const user = userEvent.setup();
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventChange={onEventChange}
        />
      );

      const event = screen.getByRole('button', { name: /Standup/ });

      event.focus();
      await user.keyboard('{ArrowDown}');

      expect(onEventChange).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 10, 9, 15),
        end: new Date(2024, 0, 10, 9, 45)
      });
    });

    it('Scheduler_Editable_ShouldResizeWithShiftArrowKeys', async () => {
      const user = userEvent.setup();
      const onEventResize = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventResize={onEventResize}
        />
      );

      const event = screen.getByRole('button', { name: /Standup/ });

      event.focus();
      await user.keyboard('{Shift>}{ArrowDown}{/Shift}');

      expect(onEventResize).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 45)
      });
    });

    it('Scheduler_Editable_ShouldMoveAcrossDaysWithArrowKeys', async () => {
      const user = userEvent.setup();
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      const event = screen.getByRole('button', { name: /Standup/ });

      event.focus();
      await user.keyboard('{ArrowRight}');

      expect(onEventChange).toHaveBeenCalledWith(timed[0], {
        start: new Date(2024, 0, 11, 9, 0),
        end: new Date(2024, 0, 11, 9, 30)
      });
    });

    it('Scheduler_Editable_ShouldNotMoveBeforeTheStartOfTheDay', async () => {
      const user = userEvent.setup();
      const onEventChange = jest.fn();
      const early: SchedulerEvent<Date>[] = [
        {
          id: 'early',
          title: 'Early sync',
          start: new Date(2024, 0, 10, 0, 0),
          end: new Date(2024, 0, 10, 0, 30)
        }
      ];

      render(
        <Scheduler
          events={early}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          onEventChange={onEventChange}
        />
      );

      const event = screen.getByRole('button', { name: /Early sync/ });

      event.focus();
      await user.keyboard('{ArrowUp}');

      expect(onEventChange).not.toHaveBeenCalled();
    });

    it('Scheduler_Editable_ShouldExposeGrabStateAndInstructions', () => {
      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          editable
          ariaLabel="Editable schedule"
        />
      );

      const event = screen.getByRole('button', { name: /Standup/ });
      const describedBy = event.getAttribute('aria-describedby');

      expect(event).toHaveAttribute('aria-grabbed', 'false');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent(/shift/i);
    });
  });

  describe('recurrence', () => {
    const range = { start: new Date(2024, 0, 1), end: new Date(2024, 1, 1) };

    const makeEvent = (
      start: Date,
      end: Date,
      recurrence: SchedulerEvent<Date>['recurrence']
    ): SchedulerEvent<Date> => ({
      id: 'rec',
      title: 'Recurring',
      start,
      end,
      recurrence
    });

    it('Scheduler_ExpandRecurrence_ShouldExpandDailyOccurrencesWithCount', () => {
      const event = makeEvent(new Date(2024, 0, 10, 9, 0), new Date(2024, 0, 10, 10, 0), {
        frequency: 'daily',
        count: 3
      });

      const occurrences = expandRecurrence(event, range);

      expect(occurrences).toHaveLength(3);
      expect(occurrences.map((occurrence) => occurrence.start.getDate())).toEqual([10, 11, 12]);
      expect(occurrences.map((occurrence) => occurrence.start.getHours())).toEqual([9, 9, 9]);
      expect(occurrences[2].end).toEqual(new Date(2024, 0, 12, 10, 0));
      expect(occurrences[0].originalEvent).toBe(event);
      expect(occurrences[0].eventId).toBe('rec');
      expect(occurrences[0].occurrenceStart).toEqual(new Date(2024, 0, 10, 9, 0));
      expect(occurrences[0].index).toBe(0);
      expect(occurrences[0].isRecurring).toBe(true);
    });

    it('Scheduler_ExpandRecurrence_ShouldRespectInterval', () => {
      const event = makeEvent(new Date(2024, 0, 10, 9, 0), new Date(2024, 0, 10, 10, 0), {
        frequency: 'daily',
        interval: 2,
        count: 5
      });

      const occurrences = expandRecurrence(event, range);

      expect(occurrences.map((occurrence) => occurrence.start.getDate())).toEqual([
        10, 12, 14, 16, 18
      ]);
    });

    it('Scheduler_ExpandRecurrence_ShouldRespectUntilDatesAndDateOnlyStrings', () => {
      const untilDate = makeEvent(new Date(2024, 0, 10, 9, 0), new Date(2024, 0, 10, 10, 0), {
        frequency: 'daily',
        until: new Date(2024, 0, 12, 9, 0)
      });
      const untilString = makeEvent(new Date(2024, 0, 10, 9, 0), new Date(2024, 0, 10, 10, 0), {
        frequency: 'daily',
        until: '2024-01-12'
      });

      expect(
        expandRecurrence(untilDate, range).map((occurrence) => occurrence.start.getDate())
      ).toEqual([10, 11, 12]);
      // Date-only values include the whole final day.
      expect(
        expandRecurrence(untilString, range).map((occurrence) => occurrence.start.getDate())
      ).toEqual([10, 11, 12]);
    });

    it('Scheduler_ExpandRecurrence_ShouldExpandWeeklyAndMonthlySeries', () => {
      const weekly = makeEvent(new Date(2024, 0, 10, 9, 0), new Date(2024, 0, 10, 10, 0), {
        frequency: 'weekly',
        count: 3
      });
      const monthly = makeEvent(new Date(2024, 0, 31, 9, 0), new Date(2024, 0, 31, 10, 0), {
        frequency: 'monthly',
        count: 3
      });

      expect(
        expandRecurrence(weekly, range).map((occurrence) => occurrence.start.getDate())
      ).toEqual([10, 17, 24]);

      const monthlyOccurrences = expandRecurrence(monthly, {
        start: new Date(2024, 0, 1),
        end: new Date(2024, 3, 1)
      });

      expect(monthlyOccurrences.map((occurrence) => occurrence.start.getMonth())).toEqual([
        0, 1, 2
      ]);
      expect(monthlyOccurrences.map((occurrence) => occurrence.start.getDate())).toEqual([
        31, 29, 31
      ]);
    });

    it('Scheduler_ExpandRecurrence_ShouldFilterByRangeAndHandleEmptySeries', () => {
      const event = makeEvent(new Date(2024, 0, 10, 9, 0), new Date(2024, 0, 10, 10, 0), {
        frequency: 'daily',
        count: 10
      });
      const zero = makeEvent(new Date(2024, 0, 10, 9, 0), new Date(2024, 0, 10, 10, 0), {
        frequency: 'daily',
        count: 0
      });
      const single = makeEvent(
        new Date(2024, 0, 10, 9, 0),
        new Date(2024, 0, 10, 10, 0),
        undefined
      );

      const filtered = expandRecurrence(event, {
        start: new Date(2024, 0, 12),
        end: new Date(2024, 0, 15)
      });

      expect(filtered.map((occurrence) => occurrence.start.getDate())).toEqual([12, 13, 14]);
      expect(expandRecurrence(zero, range)).toHaveLength(0);
      expect(expandRecurrence(single, range)).toHaveLength(1);
      expect(expandRecurrence(single, range)[0].isRecurring).toBe(false);
    });

    it('Scheduler_Recurrence_ShouldRenderOccurrencesInTheMonthView', () => {
      const recurring: SchedulerEvent<Date>[] = [
        {
          id: 'daily',
          title: 'Daily sync',
          start: new Date(2024, 0, 10, 9, 0),
          end: new Date(2024, 0, 10, 9, 30),
          recurrence: { frequency: 'daily', count: 3 }
        }
      ];

      render(<Scheduler events={recurring} defaultDate={new Date(2024, 0, 10)} view="month" />);

      expect(screen.getAllByRole('button', { name: /Daily sync/ })).toHaveLength(3);
    });

    it('Scheduler_Recurrence_ShouldRenderTheOccurrenceOfTheActiveDay', () => {
      const recurring: SchedulerEvent<Date>[] = [
        {
          id: 'weekly',
          title: 'Weekly sync',
          start: new Date(2024, 0, 10, 9, 0),
          end: new Date(2024, 0, 10, 9, 30),
          recurrence: { frequency: 'weekly', count: 3 }
        }
      ];

      render(<Scheduler events={recurring} defaultDate={new Date(2024, 0, 17)} view="day" />);

      expect(screen.getAllByRole('button', { name: /Weekly sync/ })).toHaveLength(1);
      expect(screen.getByText('09:00')).toBeInTheDocument();
    });

    it('Scheduler_Recurrence_ShouldRenderMonthlyOccurrences', () => {
      const recurring: SchedulerEvent<Date>[] = [
        {
          id: 'monthly',
          title: 'Monthly report',
          start: new Date(2024, 0, 31, 9, 0),
          end: new Date(2024, 0, 31, 10, 0),
          recurrence: { frequency: 'monthly', count: 3 }
        }
      ];

      render(<Scheduler events={recurring} defaultDate={new Date(2024, 1, 29)} view="day" />);

      // January 31 + 1 month clamps to February 29 in 2024.
      expect(screen.getAllByRole('button', { name: /Monthly report/ })).toHaveLength(1);
      expect(screen.getByText('09:00')).toBeInTheDocument();
    });

    it('Scheduler_Recurrence_ShouldMoveOnlyTheDisplayedOccurrence', () => {
      const onEventChange = jest.fn();
      const recurringEvent: SchedulerEvent<Date> = {
        id: 'daily',
        title: 'Daily sync',
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 10, 0),
        recurrence: { frequency: 'daily', count: 2 }
      };

      render(
        <Scheduler
          events={[recurringEvent]}
          defaultDate={new Date(2024, 0, 11)}
          view="day"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-11');

      const event = screen.getByRole('button', { name: /Daily sync/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 360 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 360 });

      expect(onEventChange).toHaveBeenCalledWith(recurringEvent, {
        start: new Date(2024, 0, 11, 10, 0),
        end: new Date(2024, 0, 11, 11, 0)
      });

      // The series itself is untouched: consumers decide how to persist the exception.
      expect(recurringEvent.start).toEqual(new Date(2024, 0, 10, 9, 0));
      expect(recurringEvent.recurrence).toEqual({ frequency: 'daily', count: 2 });
    });
  });

  describe('time zones', () => {
    it('Scheduler_TimeZone_ShouldPlaceAndLabelEventsInTheCalendarZone', () => {
      const zoned: SchedulerEvent<Date>[] = [
        {
          id: 'zoned',
          title: 'New York sync',
          start: new Date('2024-01-10T14:00:00.000Z'),
          end: new Date('2024-01-10T14:30:00.000Z')
        }
      ];

      render(
        <Scheduler
          events={zoned}
          timeZone="America/New_York"
          defaultDate={new Date('2024-01-10T14:00:00.000Z')}
          view="day"
        />
      );

      const column = getDayColumn('2024-01-10');

      expect(within(column).getByText('New York sync')).toBeInTheDocument();
      expect(within(column).getByText('09:00')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Time zone/)).not.toBeInTheDocument();
    });

    it('Scheduler_TimeZone_ShouldShowTheEventZoneIndicatorWhenItDiffers', () => {
      const zoned: SchedulerEvent<Date>[] = [
        {
          id: 'tokyo',
          title: 'Tokyo sync',
          start: new Date('2024-01-10T14:00:00.000Z'),
          end: new Date('2024-01-10T14:30:00.000Z'),
          timeZone: 'Asia/Tokyo'
        }
      ];

      render(
        <Scheduler
          events={zoned}
          timeZone="America/New_York"
          defaultDate={new Date('2024-01-10T14:00:00.000Z')}
          view="day"
        />
      );

      const column = getDayColumn('2024-01-10');
      const indicator = screen.getByLabelText('Time zone Asia/Tokyo');

      expect(within(column).getByText('Tokyo sync')).toBeInTheDocument();
      expect(within(column).getByText('23:00')).toBeInTheDocument();
      // Placement follows the calendar zone (09:00 in New York).
      expect(indicator).toHaveTextContent(/GMT\+9/);
    });

    it('Scheduler_TimeZone_ShouldEmitAbsoluteInstantsWhenDragging', () => {
      const onEventChange = jest.fn();
      const zoned: SchedulerEvent<Date>[] = [
        {
          id: 'zoned',
          title: 'New York sync',
          start: new Date('2024-01-10T14:00:00.000Z'),
          end: new Date('2024-01-10T14:30:00.000Z')
        }
      ];

      render(
        <Scheduler
          events={zoned}
          timeZone="America/New_York"
          defaultDate={new Date('2024-01-10T14:00:00.000Z')}
          view="day"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-10');

      const event = screen.getByRole('button', { name: /New York sync/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 360 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 360 });

      expect(onEventChange).toHaveBeenCalledWith(zoned[0], {
        start: new Date('2024-01-10T15:00:00.000Z'),
        end: new Date('2024-01-10T15:30:00.000Z')
      });
    });

    it('Scheduler_TimeZone_ShouldRespectDaylightSavingForRecurringEvents', async () => {
      const user = userEvent.setup();
      const onEventChange = jest.fn();
      const recurring: SchedulerEvent<Date>[] = [
        {
          id: 'dst',
          title: 'Dst sync',
          start: new Date('2024-03-08T14:00:00.000Z'),
          end: new Date('2024-03-08T15:00:00.000Z'),
          recurrence: { frequency: 'daily', count: 3 }
        }
      ];

      render(
        <Scheduler
          events={recurring}
          timeZone="America/New_York"
          defaultDate={new Date('2024-03-10T12:00:00.000Z')}
          view="week"
          editable
          snapMinutes={60}
          onEventChange={onEventChange}
        />
      );

      const event = screen.getByRole('button', { name: /Dst sync/ });

      // The Mar 10 occurrence is already on EDT (UTC-4), so 09:00 is 13:00Z.
      expect(within(getDayColumn('2024-03-10')).getByText('09:00')).toBeInTheDocument();

      event.focus();
      await user.keyboard('{ArrowDown}');

      expect(onEventChange).toHaveBeenCalledWith(recurring[0], {
        start: new Date('2024-03-10T14:00:00.000Z'),
        end: new Date('2024-03-10T15:00:00.000Z')
      });
    });
  });

  describe('range selection', () => {
    function getGrid(): HTMLElement {
      return screen.getByRole('grid');
    }

    it('Scheduler_Selectable_ShouldPreviewAndEmitRangeOnDrag', () => {
      const onRangeSelect = jest.fn();
      const onEventCreate = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          onRangeSelect={onRangeSelect}
          onEventCreate={onEventCreate}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 360 });

      const preview = document.querySelector('[data-scheduler-selection]');

      expect(preview).not.toBeNull();
      expect(preview).toHaveAttribute('data-scheduler-selection-start', isoTimestamp(10, 5, 0));
      expect(preview).toHaveAttribute('data-scheduler-selection-end', isoTimestamp(10, 6, 0));
      expect(onRangeSelect).not.toHaveBeenCalled();

      fireEvent.pointerUp(document, { clientX: 100, clientY: 360 });

      const expectedRange = {
        start: new Date(2024, 0, 10, 5, 0),
        end: new Date(2024, 0, 10, 6, 0)
      };

      expect(onRangeSelect).toHaveBeenCalledTimes(1);
      expect(onRangeSelect).toHaveBeenCalledWith(expectedRange);
      expect(onEventCreate).toHaveBeenCalledTimes(1);
      expect(onEventCreate).toHaveBeenCalledWith(expectedRange);
      expect(document.querySelector('[data-scheduler-selection]')).toBeNull();
    });

    it('Scheduler_Selectable_ShouldSnapTheRangeToSnapMinutes', () => {
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          snapMinutes={15}
          onRangeSelect={onRangeSelect}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      // 05:03 snaps to 05:00 and 05:49 snaps to 05:45.
      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 303 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 349 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 349 });

      expect(onRangeSelect).toHaveBeenCalledWith({
        start: new Date(2024, 0, 10, 5, 0),
        end: new Date(2024, 0, 10, 5, 45)
      });
    });

    it('Scheduler_Selectable_ShouldAlwaysCreateAtLeastOneSnapStep', () => {
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          snapMinutes={15}
          onRangeSelect={onRangeSelect}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      // Dragging upwards by fewer than two steps still yields one full step:
      // 06:00 to 05:52 (snapped to 05:45).
      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 360 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 352 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 352 });

      expect(onRangeSelect).toHaveBeenCalledWith({
        start: new Date(2024, 0, 10, 5, 45),
        end: new Date(2024, 0, 10, 6, 0)
      });
    });

    it('Scheduler_Selectable_ShouldCreateADefaultSlotOnSimpleClick', () => {
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          onRangeSelect={onRangeSelect}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 540 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 540 });

      expect(onRangeSelect).toHaveBeenCalledWith({
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 30)
      });
    });

    it('Scheduler_Selectable_ShouldRespectDefaultDurationMinutes', () => {
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          defaultDurationMinutes={45}
          onRangeSelect={onRangeSelect}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 540 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 540 });

      expect(onRangeSelect).toHaveBeenCalledWith({
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 45)
      });
    });

    it('Scheduler_Selectable_ShouldClampTheRangeToTheEndOfTheDay', () => {
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          onRangeSelect={onRangeSelect}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 1430 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 1500 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 1500 });

      expect(onRangeSelect).toHaveBeenCalledWith({
        start: new Date(2024, 0, 10, 23, 45),
        end: new Date(2024, 0, 11, 0, 0)
      });
    });

    it('Scheduler_Selectable_ShouldCancelTheSelectionOnEscape', () => {
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          onRangeSelect={onRangeSelect}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 360 });

      expect(document.querySelector('[data-scheduler-selection]')).not.toBeNull();

      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 360 });

      expect(onRangeSelect).not.toHaveBeenCalled();
      expect(document.querySelector('[data-scheduler-selection]')).toBeNull();
    });

    it('Scheduler_Selectable_ShouldIgnorePointerInteractionWhenNotSelectable', () => {
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          onRangeSelect={onRangeSelect}
        />
      );

      prepareTimeGrid('2024-01-10');

      const column = getDayColumn('2024-01-10');

      fireEvent.pointerDown(column, { button: 0, clientX: 100, clientY: 300 });
      fireEvent.pointerMove(document, { clientX: 100, clientY: 360 });
      fireEvent.pointerUp(document, { clientX: 100, clientY: 360 });

      expect(onRangeSelect).not.toHaveBeenCalled();
      expect(getGrid()).not.toHaveAttribute('tabindex');
    });

    it('Scheduler_Selectable_ShouldCreateSlotsFromTheKeyboard', async () => {
      const user = userEvent.setup();
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          selectable
          onRangeSelect={onRangeSelect}
        />
      );

      const grid = getGrid();

      grid.focus();
      await user.keyboard('{Enter}');

      expect(onRangeSelect).toHaveBeenLastCalledWith({
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 30)
      });

      await user.keyboard('{ArrowDown}');

      expect(document.querySelector('[data-scheduler-cursor]')).not.toBeNull();

      await user.keyboard('n');

      expect(onRangeSelect).toHaveBeenLastCalledWith({
        start: new Date(2024, 0, 10, 9, 15),
        end: new Date(2024, 0, 10, 9, 45)
      });
      expect(onRangeSelect).toHaveBeenCalledTimes(2);
    });

    it('Scheduler_Selectable_ShouldMoveTheKeyboardCursorAcrossDaysInTheWeekView', async () => {
      const user = userEvent.setup();
      const onRangeSelect = jest.fn();

      render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          selectable
          onRangeSelect={onRangeSelect}
        />
      );

      const grid = getGrid();

      grid.focus();
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{Enter}');

      expect(onRangeSelect).toHaveBeenCalledWith({
        start: new Date(2024, 0, 11, 9, 0),
        end: new Date(2024, 0, 11, 9, 30)
      });
    });

    it('Scheduler_Selectable_ShouldExposeInstructionsAndHaveNoAccessibilityViolations', async () => {
      const { container } = render(
        <Scheduler
          events={events}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          selectable
          ariaLabel="Selectable schedule"
        />
      );

      const grid = getGrid();
      const describedBy = grid.getAttribute('aria-describedby');

      expect(grid).toHaveAttribute('tabindex', '0');
      expect(describedBy).toBeTruthy();
      expect(document.getElementById(describedBy as string)).toHaveTextContent(/N or Enter/);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('resource view', () => {
    const resources = [
      { id: 'alice', name: 'Alice', color: '#3366ff' },
      { id: 'bob', name: 'Bob', color: '#00d68f' }
    ];

    const resourceEvents: SchedulerEvent<Date>[] = [
      {
        id: 'alice-sync',
        title: 'Alice sync',
        start: new Date(2024, 0, 10, 9, 0),
        end: new Date(2024, 0, 10, 9, 30),
        resourceId: 'alice'
      },
      {
        id: 'bob-review',
        title: 'Bob review',
        start: new Date(2024, 0, 10, 10, 0),
        end: new Date(2024, 0, 10, 10, 30),
        resourceId: 'bob'
      },
      {
        id: 'loose',
        title: 'Loose task',
        start: new Date(2024, 0, 10, 11, 0),
        end: new Date(2024, 0, 10, 11, 30)
      }
    ];

    function getLane(id: string): HTMLElement {
      const lane = document.querySelector<HTMLElement>(
        `[data-scheduler-time-row][data-scheduler-lane="${id}"]`
      );

      if (!lane) {
        throw new Error(`Lane ${id} was not rendered`);
      }

      return lane;
    }

    it('Scheduler_ResourceView_ShouldRenderALanePerResourceAndFilterEvents', () => {
      render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          resources={resources}
          resourceView
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Unassigned')).toBeInTheDocument();

      const alice = getLane('alice');
      const bob = getLane('bob');
      const unassigned = getLane('__unassigned__');

      expect(within(alice).getByText('Alice sync')).toBeInTheDocument();
      expect(within(alice).queryByText('Bob review')).not.toBeInTheDocument();
      expect(within(alice).queryByText('Loose task')).not.toBeInTheDocument();

      expect(within(bob).getByText('Bob review')).toBeInTheDocument();
      expect(within(bob).queryByText('Alice sync')).not.toBeInTheDocument();

      expect(within(unassigned).getByText('Loose task')).toBeInTheDocument();
      expect(within(unassigned).queryByText('Alice sync')).not.toBeInTheDocument();
      expect(within(unassigned).queryByText('Bob review')).not.toBeInTheDocument();
    });

    it('Scheduler_ResourceView_ShouldUseTheResourceColorAsTheEventFallback', () => {
      render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          resources={resources}
          resourceView
        />
      );

      const aliceEvent = within(getLane('alice')).getByRole('button', { name: /Alice sync/ });
      const bobEvent = within(getLane('bob')).getByRole('button', { name: /Bob review/ });

      expect(aliceEvent).toHaveStyle({ backgroundColor: '#3366ff' });
      expect(bobEvent).toHaveStyle({ backgroundColor: '#00d68f' });
    });

    it('Scheduler_ResourceView_ShouldInvokeOnResourceClick', async () => {
      const user = userEvent.setup();
      const onResourceClick = jest.fn();

      render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          resources={resources}
          resourceView
          onResourceClick={onResourceClick}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Alice' }));

      expect(onResourceClick).toHaveBeenCalledWith(resources[0]);
    });

    it('Scheduler_ResourceView_ShouldRenderOneColumnPerDayInTheWeekView', () => {
      render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          resources={resources}
          resourceView
        />
      );

      expect(within(getLane('alice')).getAllByRole('gridcell')).toHaveLength(7);
      expect(within(getLane('alice')).getByText('Alice sync')).toBeInTheDocument();
      expect(within(getLane('bob')).queryByText('Alice sync')).not.toBeInTheDocument();
    });

    it('Scheduler_ResourceView_ShouldKeepTheMonthViewLaneFree', () => {
      render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="month"
          resources={resources}
          resourceView
        />
      );

      expect(document.querySelector('[data-scheduler-lane]')).toBeNull();
      expect(screen.queryByText('Unassigned')).not.toBeInTheDocument();
      expect(screen.getByText('Alice sync')).toBeInTheDocument();
    });

    it('Scheduler_ResourceView_ShouldIgnoreLanesWhenResourceViewIsDisabled', () => {
      render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          resources={resources}
        />
      );

      expect(document.querySelector('[data-scheduler-lane]')).toBeNull();
      expect(screen.getByText('Alice sync')).toBeInTheDocument();
      expect(screen.getByText('Bob review')).toBeInTheDocument();
    });

    it('Scheduler_ResourceView_ShouldHideHeadersWhenShowResourcesIsFalse', () => {
      render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="day"
          resources={resources}
          resourceView
          showResources={false}
        />
      );

      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
      expect(
        document.querySelector('[data-scheduler-time-row][data-scheduler-lane="alice"]')
      ).not.toBeNull();
      expect(within(getLane('alice')).getByText('Alice sync')).toBeInTheDocument();
    });

    it('Scheduler_ResourceView_ShouldHaveNoAccessibilityViolations', async () => {
      const { container } = render(
        <Scheduler
          events={resourceEvents}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          resources={resources}
          resourceView
          selectable
          onResourceClick={() => undefined}
          ariaLabel="Resource schedule"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('all-day drag', () => {
    const allDayEvent: SchedulerEvent<Date>[] = [
      {
        id: 'release',
        title: 'Release',
        start: new Date(2024, 0, 11),
        allDay: true
      }
    ];

    const multiDayEvent: SchedulerEvent<Date>[] = [
      {
        id: 'conference',
        title: 'Conference',
        start: new Date(2024, 0, 11),
        end: new Date(2024, 0, 13),
        allDay: true
      }
    ];

    it('Scheduler_AllDayDrag_ShouldMoveTheEventAcrossDays', () => {
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={allDayEvent}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-11', { weekWidth: 700 });

      const event = screen.getByRole('button', { name: /Release/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 10 });
      fireEvent.pointerMove(document, { clientX: 200, clientY: 10 });

      expect(onEventChange).not.toHaveBeenCalled();
      expect(event).toHaveAttribute('data-scheduler-event-start', isoTimestamp(12));

      fireEvent.pointerUp(document, { clientX: 200, clientY: 10 });

      expect(onEventChange).toHaveBeenCalledWith(allDayEvent[0], {
        start: new Date(2024, 0, 12),
        end: new Date(2024, 0, 13)
      });
    });

    it('Scheduler_AllDayDrag_ShouldPreserveTheDurationInDays', () => {
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={multiDayEvent}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-11', { weekWidth: 700 });

      const event = screen.getByRole('button', { name: /Conference/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 10 });
      fireEvent.pointerMove(document, { clientX: 200, clientY: 10 });
      fireEvent.pointerUp(document, { clientX: 200, clientY: 10 });

      expect(onEventChange).toHaveBeenCalledWith(multiDayEvent[0], {
        start: new Date(2024, 0, 12),
        end: new Date(2024, 0, 14)
      });
    });

    it('Scheduler_AllDayDrag_ShouldSnapToWholeDays', () => {
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={allDayEvent}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-11', { weekWidth: 700 });

      const event = screen.getByRole('button', { name: /Release/ });

      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 10 });

      // 40 px = 0.4 day: still the same day, no preview and nothing to emit.
      fireEvent.pointerMove(document, { clientX: 140, clientY: 10 });

      expect(event).toHaveAttribute('data-scheduler-event-start', isoTimestamp(11));

      // 60 px = 0.6 day: snaps to one day.
      fireEvent.pointerMove(document, { clientX: 160, clientY: 10 });

      expect(event).toHaveAttribute('data-scheduler-event-start', isoTimestamp(12));

      fireEvent.pointerUp(document, { clientX: 160, clientY: 10 });

      expect(onEventChange).toHaveBeenCalledTimes(1);
      expect(onEventChange).toHaveBeenCalledWith(allDayEvent[0], {
        start: new Date(2024, 0, 12),
        end: new Date(2024, 0, 13)
      });
    });

    it('Scheduler_AllDayDrag_ShouldClampToTheVisibleWeek', () => {
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={allDayEvent}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      prepareTimeGrid('2024-01-11', { weekWidth: 700 });

      const event = screen.getByRole('button', { name: /Release/ });

      // Dragging far right stops at the last visible day (Saturday Jan 13).
      fireEvent.pointerDown(event, { button: 0, clientX: 100, clientY: 10 });
      fireEvent.pointerMove(document, { clientX: 900, clientY: 10 });
      fireEvent.pointerUp(document, { clientX: 900, clientY: 10 });

      expect(onEventChange).toHaveBeenCalledWith(allDayEvent[0], {
        start: new Date(2024, 0, 13),
        end: new Date(2024, 0, 14)
      });
    });

    it('Scheduler_AllDayDrag_ShouldMoveWithArrowKeys', async () => {
      const user = userEvent.setup();
      const onEventChange = jest.fn();

      render(
        <Scheduler
          events={allDayEvent}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      const event = screen.getByRole('button', { name: /Release/ });

      event.focus();
      await user.keyboard('{ArrowRight}');

      expect(onEventChange).toHaveBeenCalledWith(allDayEvent[0], {
        start: new Date(2024, 0, 12),
        end: new Date(2024, 0, 13)
      });
    });

    it('Scheduler_AllDayDrag_ShouldNotMovePastTheWeekBoundaryWithTheKeyboard', async () => {
      const user = userEvent.setup();
      const onEventChange = jest.fn();
      const saturday: SchedulerEvent<Date>[] = [
        {
          id: 'weekend',
          title: 'Weekend',
          start: new Date(2024, 0, 13),
          allDay: true
        }
      ];

      render(
        <Scheduler
          events={saturday}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          onEventChange={onEventChange}
        />
      );

      const event = screen.getByRole('button', { name: /Weekend/ });

      event.focus();
      await user.keyboard('{ArrowRight}');

      expect(onEventChange).not.toHaveBeenCalled();
    });

    it('Scheduler_AllDayDrag_ShouldNotExposeTimedResizeOrEditHandles', () => {
      const timed: SchedulerEvent<Date>[] = [
        {
          id: 'standup',
          title: 'Standup',
          start: new Date(2024, 0, 11, 9, 0),
          end: new Date(2024, 0, 11, 9, 30)
        },
        ...allDayEvent
      ];

      render(
        <Scheduler
          events={timed}
          defaultDate={new Date(2024, 0, 10)}
          view="week"
          editable
          snapMinutes={15}
        />
      );

      const allDay = screen.getByRole('button', { name: /Release/ });
      const timedEvent = screen.getByRole('button', { name: /Standup/ });

      expect(allDay.querySelector('[data-scheduler-resize-handle]')).toBeNull();
      expect(timedEvent.querySelector('[data-scheduler-resize-handle]')).not.toBeNull();
    });
  });

  describe('accessibility', () => {
    it('Scheduler_Editable_ShouldHaveNoAccessibilityViolations', async () => {
      const editableEvents: SchedulerEvent<Date>[] = [
        {
          id: 'a11y',
          title: 'Zoned sync',
          start: new Date('2024-01-10T14:00:00.000Z'),
          end: new Date('2024-01-10T14:30:00.000Z'),
          timeZone: 'Asia/Tokyo'
        }
      ];
      const { container } = render(
        <Scheduler
          events={editableEvents}
          timeZone="America/New_York"
          defaultDate={new Date('2024-01-10T14:00:00.000Z')}
          view="day"
          editable
          ariaLabel="Editable schedule"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
