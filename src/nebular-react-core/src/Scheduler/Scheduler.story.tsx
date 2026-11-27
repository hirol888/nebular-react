import React, { useState } from 'react';
import { useDateFns } from '@nebular-react/hooks';
import { NebularProvider } from '@nebular-react/styles';
import { Scheduler, SchedulerEvent, SchedulerView } from './Scheduler';

export default { title: 'Scheduler', component: Scheduler };

function useEvents() {
  const dateFns = useDateFns<Date>();
  const today = dateFns.today('native');

  const events: SchedulerEvent<Date>[] = [
    {
      id: 1,
      title: 'Daily standup',
      start: dateFns.addHours(today, 9),
      end: dateFns.addHours(today, 9.5)
    },
    {
      id: 2,
      title: 'Design review',
      start: dateFns.addHours(today, 14),
      end: dateFns.addHours(today, 15)
    },
    {
      id: 3,
      title: 'Sprint planning',
      start: dateFns.addDays(today, 1),
      allDay: true
    },
    {
      id: 4,
      title: 'Release',
      start: dateFns.addDays(today, 3),
      color: '#00d68f'
    }
  ];

  return events;
}

export function Showcase() {
  const events = useEvents();

  return <Scheduler events={events} ariaLabel="Team schedule" />;
}

export function DayView() {
  const events = useEvents();

  return <Scheduler events={events} defaultView="day" ariaLabel="Day schedule" />;
}

export function WeekView() {
  const events = useEvents();

  return <Scheduler events={events} defaultView="week" ariaLabel="Week schedule" />;
}

export function Controlled() {
  const events = useEvents();
  const dateFns = useDateFns<Date>();
  const [date, setDate] = useState(dateFns.today('native'));
  const [view, setView] = useState<SchedulerView>('month');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        View: {view} · date: {dateFns.format(date, 'YYYY-MM-DD')}
      </div>
      <Scheduler<Date>
        events={events}
        date={date}
        onDateChange={setDate}
        view={view}
        onViewChange={setView}
        ariaLabel="Controlled schedule"
      />
    </div>
  );
}

export function CustomEvents() {
  const events = useEvents();
  const [selected, setSelected] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Selected: {selected}</div>
      <Scheduler
        events={events}
        onEventClick={(event) => setSelected(String(event.title))}
        renderEvent={(event) => (
          <span>
            <strong>{event.title}</strong>
          </span>
        )}
        ariaLabel="Custom schedule"
      />
    </div>
  );
}

export function DragAndDrop() {
  const dateFns = useDateFns<Date>();
  const today = dateFns.today('native');
  const [events, setEvents] = useState<SchedulerEvent<Date>[]>([
    {
      id: 1,
      title: 'Daily standup',
      start: dateFns.addHours(today, 9),
      end: dateFns.addHours(today, 9.5)
    },
    {
      id: 2,
      title: 'Design review',
      start: dateFns.addHours(today, 14),
      end: dateFns.addHours(today, 15)
    },
    {
      id: 3,
      title: 'Sprint planning',
      start: dateFns.addDays(today, 1),
      allDay: true
    }
  ]);
  const [lastChange, setLastChange] = useState('none');

  const describe = (next: { start: Date; end: Date }) =>
    `${dateFns.format(next.start, 'MMM D, HH:mm')} – ${dateFns.format(next.end, 'HH:mm')}`;

  const applyChange = (event: SchedulerEvent<Date>, next: { start: Date; end: Date }) => {
    setEvents((current) =>
      current.map((item) =>
        item.id === event.id ? { ...item, start: next.start, end: next.end } : item
      )
    );
    setLastChange(`${String(event.title)}: ${describe(next)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Last change: <strong>{lastChange}</strong>
      </div>
      <Scheduler
        events={events}
        defaultView="week"
        editable
        snapMinutes={15}
        onEventChange={applyChange}
        onEventResize={applyChange}
        ariaLabel="Editable week schedule"
      />
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
        <strong>How to edit</strong>
        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Drag an event to move it; its duration is preserved and moves snap to 15 minutes.</li>
          <li>Drag the bottom edge of an event to resize it. The end never goes past the start.</li>
          <li>
            With an event focused, the arrow keys move it and <kbd>Shift</kbd> + ↑/↓ resizes it.
          </li>
          <li>Changes are committed on pointer release, not while dragging.</li>
        </ul>
      </div>
    </div>
  );
}

export function Recurrence() {
  const dateFns = useDateFns<Date>();
  const today = dateFns.today('native');

  const events: SchedulerEvent<Date>[] = [
    {
      id: 'daily',
      title: 'Daily standup',
      start: dateFns.addHours(today, 9),
      end: dateFns.addHours(today, 9.25),
      recurrence: { frequency: 'daily', interval: 1, count: 10 }
    },
    {
      id: 'weekly',
      title: 'Weekly review',
      start: dateFns.addHours(today, 14),
      end: dateFns.addHours(today, 15),
      color: '#00d68f',
      recurrence: { frequency: 'weekly', count: 8 }
    },
    {
      id: 'monthly',
      title: 'Monthly report',
      start: dateFns.addHours(dateFns.addDays(today, 2), 10),
      end: dateFns.addHours(dateFns.addDays(today, 2), 11),
      color: '#ffaa00',
      recurrence: { frequency: 'monthly', count: 6 }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Scheduler events={events} defaultView="month" ariaLabel="Recurring schedule" />
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
        Each series expands with its own <code>frequency</code>, <code>interval</code>,{' '}
        <code>count</code> and <code>until</code> (date-only values include the final day).
      </div>
    </div>
  );
}

export function EventTimeZones() {
  const instant = '2024-01-15T14:00:00.000Z';
  const events: SchedulerEvent<Date>[] = [
    {
      id: 'new-york',
      title: 'New York sync',
      start: new Date(instant),
      end: new Date('2024-01-15T14:30:00.000Z'),
      timeZone: 'America/New_York'
    },
    {
      id: 'london',
      title: 'London sync',
      start: new Date(instant),
      end: new Date('2024-01-15T14:30:00.000Z'),
      timeZone: 'Europe/London'
    },
    {
      id: 'tokyo',
      title: 'Tokyo sync',
      start: new Date(instant),
      end: new Date('2024-01-15T14:30:00.000Z'),
      timeZone: 'Asia/Tokyo'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Scheduler
        events={events}
        defaultDate={new Date(instant)}
        timeZone="America/New_York"
        defaultView="day"
        ariaLabel="Events across time zones"
      />
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
        The calendar is rendered in <code>America/New_York</code>. Every event keeps its absolute
        instant, shows its own wall clock and displays a zone indicator when it differs from the
        calendar zone. Daylight saving time is handled by the shared time-zone helpers.
      </div>
    </div>
  );
}

export function RangeSelection() {
  const dateFns = useDateFns<Date>();
  const today = dateFns.today('native');
  const baseEvents = useEvents();
  const [created, setCreated] = useState<SchedulerEvent<Date>[]>([]);
  const [lastRange, setLastRange] = useState('none');

  const createFromRange = (range: { start: Date; end: Date }) => {
    setLastRange(
      `${dateFns.format(range.start, 'MMM D, HH:mm')} – ${dateFns.format(range.end, 'HH:mm')}`
    );
    setCreated((current) => [
      ...current,
      {
        id: `created-${current.length + 1}`,
        title: `New event ${current.length + 1}`,
        start: range.start,
        end: range.end,
        color: '#ffaa00'
      }
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Last selection: <strong>{lastRange}</strong>
      </div>
      <Scheduler
        events={[...baseEvents, ...created]}
        defaultDate={today}
        defaultView="week"
        selectable
        snapMinutes={15}
        defaultDurationMinutes={30}
        onRangeSelect={createFromRange}
        ariaLabel="Selectable week schedule"
      />
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
        <strong>How to create</strong>
        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Drag over an empty area of the day/week grid to preview a range.</li>
          <li>
            Ranges snap to 15 minutes, always span at least one step and stop at the end of the day.
          </li>
          <li>A simple click creates a 30-minute slot at the clicked time.</li>
          <li>
            Focus the grid and press <kbd>N</kbd> or <kbd>Enter</kbd> to create a slot at the
            cursor; the arrow keys move it.
          </li>
          <li>
            Press <kbd>Escape</kbd> while dragging to cancel.
          </li>
        </ul>
      </div>
    </div>
  );
}

export function ResourceView() {
  const dateFns = useDateFns<Date>();
  const today = dateFns.today('native');
  const [selected, setSelected] = useState('none');

  const resources = [
    { id: 'alice', name: 'Alice', color: '#3366ff' },
    { id: 'bob', name: 'Bob', color: '#00d68f' },
    { id: 'carol', name: 'Carol', color: '#ffaa00' }
  ];

  const events: SchedulerEvent<Date>[] = [
    {
      id: 1,
      title: 'Kickoff',
      start: dateFns.addHours(today, 9),
      end: dateFns.addHours(today, 9.5),
      resourceId: 'alice'
    },
    {
      id: 2,
      title: 'Design review',
      start: dateFns.addHours(today, 10),
      end: dateFns.addHours(today, 11),
      resourceId: 'bob'
    },
    {
      id: 3,
      title: 'Sprint planning',
      start: dateFns.addDays(today, 1),
      allDay: true,
      resourceId: 'carol'
    },
    {
      id: 4,
      title: 'Unassigned follow-up',
      start: dateFns.addHours(today, 14),
      end: dateFns.addHours(today, 15)
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Selected resource: <strong>{selected}</strong>
      </div>
      <Scheduler
        events={events}
        defaultView="week"
        resources={resources}
        resourceView
        onResourceClick={(resource) => setSelected(resource.name)}
        ariaLabel="Resource week schedule"
      />
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
        The day/week views render one lane per resource, filter the events by{' '}
        <code>resourceId</code>, use the resource color as the event fallback and collect events
        without a resource in the <strong>Unassigned</strong> lane. The month view stays lane-free.
      </div>
    </div>
  );
}

export function AllDayDrag() {
  const dateFns = useDateFns<Date>();
  const today = dateFns.today('native');
  const [events, setEvents] = useState<SchedulerEvent<Date>[]>([
    {
      id: 1,
      title: 'Daily standup',
      start: dateFns.addHours(today, 9),
      end: dateFns.addHours(today, 9.5)
    },
    {
      id: 2,
      title: 'Release',
      start: dateFns.addDays(today, 1),
      allDay: true
    },
    {
      id: 3,
      title: 'Conference',
      start: dateFns.addDays(today, 2),
      end: dateFns.addDays(today, 4),
      allDay: true
    }
  ]);
  const [lastChange, setLastChange] = useState('none');

  const applyChange = (event: SchedulerEvent<Date>, next: { start: Date; end: Date }) => {
    setEvents((current) =>
      current.map((item) =>
        item.id === event.id ? { ...item, start: next.start, end: next.end } : item
      )
    );
    setLastChange(
      `${String(event.title)}: ${dateFns.format(next.start, 'MMM D')} – ${dateFns.format(
        next.end,
        'MMM D'
      )}`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        Last change: <strong>{lastChange}</strong>
      </div>
      <Scheduler
        events={events}
        defaultView="week"
        editable
        onEventChange={applyChange}
        ariaLabel="All-day drag schedule"
      />
      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
        Drag an all-day event horizontally to move it by whole days: the duration in days is
        preserved, the range is clamped to the visible week and the new start/end is emitted by{' '}
        <code>onEventChange</code> on pointer release. Timed events keep their vertical move and
        bottom-edge resize behavior, and <code>ArrowLeft</code>/<code>ArrowRight</code> move a
        focused all-day event as well.
      </div>
    </div>
  );
}

export function Localized() {
  const events = useEvents();

  return (
    <NebularProvider locale="pt-BR" withNormalizeCSS={false} withGlobalStyles={false}>
      <Scheduler events={events} defaultView="week" ariaLabel="Agenda da equipe" />
    </NebularProvider>
  );
}
