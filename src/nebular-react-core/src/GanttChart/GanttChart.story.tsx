import React, { useState } from 'react';
import { NebularProvider } from '@nebular-react/styles';
import { GanttChart, GanttExportFormat, GanttResource, GanttTask } from './GanttChart';

export default { title: 'GanttChart', component: GanttChart };

const day = (offset: number): Date => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);

  return date;
};

const projectTasks: GanttTask[] = [
  {
    id: 'discovery',
    name: 'Product discovery',
    start: day(-6),
    end: day(-3),
    progress: 100,
    color: '#00d68f'
  },
  {
    id: 'design',
    name: 'UX design',
    start: day(-4),
    end: day(1),
    progress: 70,
    color: '#3366ff',
    dependencies: ['discovery']
  },
  {
    id: 'frontend',
    name: 'Frontend development',
    start: day(-1),
    end: day(8),
    progress: 35,
    color: '#7b61ff',
    dependencies: ['design']
  },
  {
    id: 'backend',
    name: 'Backend development',
    start: day(0),
    end: day(10),
    progress: 25,
    color: '#ffaa00',
    dependencies: ['design']
  },
  {
    id: 'qa',
    name: 'QA and release',
    start: day(8),
    end: day(13),
    progress: 0,
    color: '#ff3d71',
    dependencies: ['frontend', 'backend']
  }
];

export function Showcase() {
  return <GanttChart tasks={projectTasks} ariaLabel="Project plan" />;
}

export function Weekly() {
  return (
    <GanttChart tasks={projectTasks} view="week" ariaLabel="Project plan by week" maxHeight={320} />
  );
}

export function WithDependencies() {
  return (
    <GanttChart
      tasks={projectTasks}
      view="month"
      labelWidth={260}
      rowHeight={44}
      showDependencies
      ariaLabel="Project plan with dependencies"
    />
  );
}

/**
 * The `discovery → design → backend → qa` chain is the longest one (27 days), so it is
 * highlighted while the shorter `design → frontend → qa` branch keeps its own colors.
 */
export function CriticalPath() {
  return (
    <GanttChart
      tasks={projectTasks}
      showCriticalPath
      criticalPathColor="#ff3d71"
      ariaLabel="Project plan with critical path"
      maxHeight={320}
    />
  );
}

const shiftDays = (value: GanttTask['start'], amount: number): Date => {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

  date.setDate(date.getDate() + amount);

  return date;
};

/** Compares the planned dates with a baseline shifted two days earlier. */
const baselineProjectTasks: GanttTask[] = projectTasks.map((task) => ({
  ...task,
  baselineStart: shiftDays(task.start, -2),
  baselineEnd: shiftDays(task.end, -2)
}));

export function Baseline() {
  return (
    <GanttChart
      tasks={baselineProjectTasks}
      showBaseline
      baselineColor="#8f9bb3"
      labelWidth={240}
      ariaLabel="Planned schedule against the baseline"
      maxHeight={320}
    />
  );
}

const teamResources: GanttResource[] = [
  { id: 'product', name: 'Product', color: '#00d68f' },
  { id: 'engineering', name: 'Engineering', color: '#3366ff' },
  { id: 'quality', name: 'Quality', color: '#ffaa00' }
];

const teamResourcesByTask: Record<string, string[]> = {
  discovery: ['product'],
  design: ['product', 'engineering'],
  frontend: ['engineering'],
  backend: ['engineering'],
  qa: ['quality', 'engineering']
};

const teamProjectTasks: GanttTask[] = projectTasks.map((task) => ({
  ...task,
  resourceIds: teamResourcesByTask[task.id] ?? []
}));

export function Resources() {
  return (
    <GanttChart
      tasks={teamProjectTasks}
      resources={teamResources}
      resourceLabel="Teams"
      showCriticalPath
      ariaLabel="Project plan by team"
      labelWidth={240}
      maxHeight={320}
    />
  );
}

/**
 * One lane per team: every lane has its own header, the tasks assigned to it and the timeline
 * stays shared. Multi-team tasks (design and QA) are repeated in each lane, and tasks without a
 * known team fall back to the "Unassigned" lane at the bottom.
 */
export function ResourceLanes() {
  return (
    <GanttChart
      tasks={teamProjectTasks}
      resources={teamResources}
      resourceView
      resourceLabel="Teams"
      labelWidth={240}
      ariaLabel="Project plan by resource lane"
      maxHeight={380}
    />
  );
}

/**
 * The progress knob follows the fill edge: drag it along the bar (snapping to 5%) or focus it and
 * press +/-, Shift for 10% steps. The callback only fires when the interaction ends.
 */
export function ProgressDrag() {
  const [tasks, setTasks] = useState<GanttTask[]>(projectTasks);

  const handleProgressChange = (task: GanttTask, progress: number) => {
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, progress } : item))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <GanttChart
        tasks={tasks}
        editableProgress
        onProgressChange={handleProgressChange}
        ariaLabel="Project plan with draggable progress"
        maxHeight={340}
      />

      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', lineHeight: 1.6 }}>
        <li>Drag the knob on a bar to preview a new progress; it is committed on release.</li>
        <li>
          Focus the knob and use <kbd>+</kbd>/<kbd>-</kbd> (or <kbd>Shift</kbd> for 10% steps).
        </li>
      </ul>

      <p role="status" style={{ margin: 0, fontSize: '0.8125rem' }}>
        {tasks.map((task) => `${task.id}: ${task.progress ?? 0}%`).join(' · ')}
      </p>
    </div>
  );
}

export function Export() {
  const [lastExport, setLastExport] = useState<GanttExportFormat | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <GanttChart
        tasks={teamProjectTasks}
        resources={teamResources}
        exportable
        exportFileName="project-plan"
        onExport={setLastExport}
        ariaLabel="Exportable project plan"
        maxHeight={340}
      />

      <p role="status" style={{ margin: 0, fontSize: '0.8125rem' }}>
        {lastExport === null
          ? 'Use the toolbar to export the visible timeline and bars.'
          : `Exported project-plan.${lastExport}`}
      </p>
    </div>
  );
}

const formatChangeDate = (value: GanttTask['start']): string => {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export function Editable() {
  const [tasks, setTasks] = useState<GanttTask[]>(projectTasks);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const handleTaskChange = (task: GanttTask, changes: Partial<GanttTask>) => {
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, ...changes } : item))
    );
    setLastEvent(
      `${task.id}: ${formatChangeDate(changes.start ?? task.start)} – ${formatChangeDate(
        changes.end ?? task.end
      )}`
    );
  };

  const handleDependencyCreate = (fromId: string, toId: string) => {
    setTasks((current) =>
      current.map((item) =>
        item.id === toId ? { ...item, dependencies: [...(item.dependencies ?? []), fromId] } : item
      )
    );
    setLastEvent(`dependency ${fromId} → ${toId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <GanttChart
        tasks={tasks}
        editable
        onTaskChange={handleTaskChange}
        onDependencyCreate={handleDependencyCreate}
        ariaLabel="Editable project plan"
        maxHeight={340}
      />

      <div style={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
        <strong>How to edit</strong>
        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Drag a bar to move it; the duration is preserved.</li>
          <li>
            Drag the narrow handle on the right edge (or focus it and use ←/→) to resize. The
            minimum duration is one day.
          </li>
          <li>
            With a bar focused: <kbd>Alt</kbd> + <kbd>←</kbd>/<kbd>→</kbd> moves one day,{' '}
            <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>→</kbd> grows one day.
          </li>
          <li>
            The <strong>↗</strong> handle links the task to the next task in the list and draws the
            dependency line.
          </li>
        </ul>
        <p role="status" style={{ margin: '0.5rem 0 0' }}>
          {lastEvent === null ? 'No edits yet.' : `Last change: ${lastEvent}`}
        </p>
      </div>
    </div>
  );
}

export function Localized() {
  return (
    <NebularProvider locale="pt-BR" withNormalizeCSS={false} withGlobalStyles={false}>
      <GanttChart
        tasks={projectTasks}
        resources={teamResources}
        showResources
        labels={{ today: 'Hoje (local)' }}
        ariaLabel="Plano do projeto"
      />
    </NebularProvider>
  );
}
