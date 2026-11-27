import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  GanttChart,
  GanttResource,
  GanttTask,
  computeCriticalPath,
  exportChartPng,
  exportChartSvg,
  getGanttColumns,
  getGanttRange,
  normalizeGanttTasks
} from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const tasks: GanttTask[] = [
  {
    id: 'design',
    name: 'Design',
    start: new Date(2024, 0, 10),
    end: new Date(2024, 0, 14),
    progress: 40
  },
  {
    id: 'build',
    name: 'Build',
    start: new Date(2024, 0, 15),
    end: new Date(2024, 0, 20),
    progress: 10,
    dependencies: ['design']
  }
];

/**
 * `a -> b -> c` lasts 10 days while the `a -> d` branch lasts 7 days, so the longest dependency
 * chain is always `a -> b -> c`.
 */
const chainTasks: GanttTask[] = [
  { id: 'a', name: 'A', start: new Date(2024, 0, 1), end: new Date(2024, 0, 3) },
  {
    id: 'b',
    name: 'B',
    start: new Date(2024, 0, 4),
    end: new Date(2024, 0, 5),
    dependencies: ['a']
  },
  {
    id: 'c',
    name: 'C',
    start: new Date(2024, 0, 6),
    end: new Date(2024, 0, 10),
    dependencies: ['b']
  },
  {
    id: 'd',
    name: 'D',
    start: new Date(2024, 0, 4),
    end: new Date(2024, 0, 7),
    dependencies: ['a']
  }
];

const resources: GanttResource[] = [
  { id: 'design-team', name: 'Design team', color: '#3366ff' },
  { id: 'dev-team', name: 'Dev team', color: '#00d68f' },
  { id: 'qa-team', name: 'QA team' }
];

const resourceTasks: GanttTask[] = [
  { ...tasks[0], resourceIds: ['design-team'] },
  { ...tasks[1], resourceIds: ['dev-team', 'missing-team'] }
];

/**
 * Lanes fixture: two tasks share `dev-team`, one of them is also assigned to `qa-team`, one task
 * carries only an unknown resource id and two tasks have no resource at all.
 */
const laneTasks: GanttTask[] = [
  {
    id: 'plan',
    name: 'Plan',
    start: new Date(2024, 0, 10),
    end: new Date(2024, 0, 12),
    resourceIds: ['design-team']
  },
  {
    id: 'code',
    name: 'Code',
    start: new Date(2024, 0, 13),
    end: new Date(2024, 0, 16),
    resourceIds: ['dev-team'],
    dependencies: ['plan']
  },
  {
    id: 'review',
    name: 'Review',
    start: new Date(2024, 0, 17),
    end: new Date(2024, 0, 18),
    resourceIds: ['dev-team', 'qa-team']
  },
  {
    id: 'build',
    name: 'Build',
    start: new Date(2024, 0, 14),
    end: new Date(2024, 0, 15),
    resourceIds: ['dev-team', 'missing-team']
  },
  {
    id: 'loose',
    name: 'Loose',
    start: new Date(2024, 0, 19),
    end: new Date(2024, 0, 20)
  },
  {
    id: 'ghost',
    name: 'Ghost',
    start: new Date(2024, 0, 19),
    end: new Date(2024, 0, 20),
    resourceIds: ['missing-team']
  }
];

const DAY_WIDTH = 32;

// jsdom does not implement PointerEvent, so the drag tests fall back to MouseEvent, which exposes
// the same `clientX`/`button` surface used by the component.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: window.MouseEvent
    });
  }
});

describe('GanttChart', () => {
  describe('normalizeGanttTasks', () => {
    it('GanttChart_NormalizeTasks_ShouldClampEndAndProgress', () => {
      const normalized = normalizeGanttTasks([
        {
          id: 'reversed',
          name: 'Reversed',
          start: new Date(2024, 0, 10),
          end: new Date(2024, 0, 5),
          progress: 150
        },
        {
          id: 'negative',
          name: 'Negative',
          start: new Date(2024, 0, 1),
          end: new Date(2024, 0, 2),
          progress: -20
        },
        {
          id: 'empty',
          name: 'Empty',
          start: new Date(2024, 0, 3),
          end: new Date(2024, 0, 4)
        }
      ]);

      expect(normalized).toHaveLength(3);
      expect(normalized[0].task.id).toBe('reversed');
      expect(normalized[0].end.getTime()).toBe(normalized[0].start.getTime());
      expect(normalized[0].progress).toBe(100);
      expect(normalized[1].progress).toBe(0);
      expect(normalized[2].progress).toBe(0);
    });

    it('GanttChart_NormalizeTasks_ShouldAcceptStringAndNumberDates', () => {
      const stringTask: GanttTask = {
        id: 'string',
        name: 'String',
        start: '2024-01-10T00:00:00',
        end: '2024-01-12T00:00:00'
      };
      const numberTask: GanttTask = {
        id: 'number',
        name: 'Number',
        start: new Date(2024, 0, 1).getTime(),
        end: new Date(2024, 0, 3).getTime()
      };

      const normalized = normalizeGanttTasks([stringTask, numberTask]);

      expect(normalized[0].start).toEqual(new Date(2024, 0, 10));
      expect(normalized[0].end).toEqual(new Date(2024, 0, 12));
      expect(normalized[1].start).toEqual(new Date(2024, 0, 1));
      expect(normalized[1].end).toEqual(new Date(2024, 0, 3));
      expect(normalized[0].task).toBe(stringTask);
    });

    it('GanttChart_NormalizeTasks_ShouldTreatDateOnlyStringsAsLocalDates', () => {
      const normalized = normalizeGanttTasks([
        {
          id: 'date-only',
          name: 'Date only',
          start: '2024-01-10',
          end: '2024-01-12'
        }
      ]);

      expect(normalized[0].start).toEqual(new Date(2024, 0, 10, 0, 0, 0, 0));
      expect(normalized[0].end).toEqual(new Date(2024, 0, 12, 0, 0, 0, 0));
    });
  });

  describe('getGanttRange', () => {
    it('GanttChart_GetRange_ShouldCoverAllTasksInDayView', () => {
      const range = getGanttRange(tasks);

      expect(range.start).toEqual(new Date(2024, 0, 10));
      expect(range.end).toEqual(new Date(2024, 0, 20));
      expect(range.days).toBe(11);
    });

    it('GanttChart_GetRange_ShouldAlignWeekViewToFullWeeks', () => {
      const range = getGanttRange(tasks, undefined, undefined, 'week');

      expect(range.start).toEqual(new Date(2024, 0, 8));
      expect(range.end).toEqual(new Date(2024, 0, 21));
      expect(range.days).toBe(14);
    });

    it('GanttChart_GetRange_ShouldAlignMonthViewToFullMonths', () => {
      const range = getGanttRange(tasks, undefined, undefined, 'month');

      expect(range.start).toEqual(new Date(2024, 0, 1));
      expect(range.end).toEqual(new Date(2024, 0, 31));
      expect(range.days).toBe(31);
    });

    it('GanttChart_GetRange_ShouldPreferExplicitDates', () => {
      const range = getGanttRange(tasks, new Date(2024, 1, 1), new Date(2024, 1, 10), 'day');

      expect(range.start).toEqual(new Date(2024, 1, 1));
      expect(range.end).toEqual(new Date(2024, 1, 10));
      expect(range.days).toBe(10);
    });

    it('GanttChart_GetRange_ShouldFallbackToTodayWithoutTasks', () => {
      const range = getGanttRange([], undefined, undefined, 'day');

      expect(range.days).toBe(1);
      expect(range.start.getHours()).toBe(0);
      expect(range.end.getTime()).toBe(range.start.getTime());
    });
  });

  describe('getGanttColumns', () => {
    it('GanttChart_GetColumns_ShouldCreateDayColumns', () => {
      const range = getGanttRange(tasks);
      const columns = getGanttColumns(range, 'day');

      expect(columns).toHaveLength(11);
      expect(columns[0]).toMatchObject({ label: '10/01', days: 1 });
      expect(columns[0].start).toEqual(new Date(2024, 0, 10));
      expect(new Set(columns.map((column) => column.key)).size).toBe(11);
    });

    it('GanttChart_GetColumns_ShouldCreateWeekColumns', () => {
      const range = getGanttRange(tasks, undefined, undefined, 'week');
      const columns = getGanttColumns(range, 'week');

      expect(columns).toHaveLength(2);
      expect(columns[0]).toMatchObject({ label: '08/01 – 14/01', days: 7 });
      expect(columns.map((column) => column.days).reduce((total, days) => total + days, 0)).toBe(
        range.days
      );
    });

    it('GanttChart_GetColumns_ShouldCreateMonthColumns', () => {
      const range = getGanttRange(tasks, undefined, undefined, 'month');
      const columns = getGanttColumns(range, 'month');

      expect(columns).toHaveLength(1);
      expect(columns[0]).toMatchObject({ key: 'month-2024-01', days: 31 });
      expect(columns[0].label).toMatch(/jan/i);
    });

    it('GanttChart_GetColumns_ShouldCoverMultipleMonths', () => {
      const range = getGanttRange(tasks, new Date(2024, 0, 15), new Date(2024, 2, 10), 'month');
      const columns = getGanttColumns(range, 'month');

      expect(columns).toHaveLength(3);
      expect(columns.map((column) => column.days)).toEqual([31, 29, 31]);
    });
  });

  describe('rendering', () => {
    it('GanttChart_Render_ShouldShowLabelsAndBars', () => {
      render(<GanttChart tasks={tasks} />);

      expect(screen.getByRole('region', { name: 'Gantt chart' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Design/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Build/ })).toBeInTheDocument();
      expect(screen.getAllByText('Design').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Build').length).toBeGreaterThan(0);
    });

    it('GanttChart_Render_ShouldDescribeTaskInAccessibleName', () => {
      render(<GanttChart tasks={tasks} />);

      expect(
        screen.getByRole('button', {
          name: 'Design, 10/01/2024 – 14/01/2024, 40% complete'
        })
      ).toBeInTheDocument();
    });

    it('GanttChart_Render_ShouldUseCustomAriaLabel', () => {
      render(<GanttChart tasks={tasks} ariaLabel="Product roadmap" />);

      expect(screen.getByRole('region', { name: 'Product roadmap' })).toBeInTheDocument();
    });

    it('GanttChart_Render_ShouldPositionBarsByDay', () => {
      render(<GanttChart tasks={tasks} />);

      const design = screen.getByRole('button', { name: /Design/ });
      const build = screen.getByRole('button', { name: /Build/ });

      expect(design).toHaveStyle({ left: '0px', width: `${5 * DAY_WIDTH}px` });
      expect(build).toHaveStyle({
        left: `${5 * DAY_WIDTH}px`,
        width: `${6 * DAY_WIDTH}px`
      });
    });

    it('GanttChart_Render_ShouldRenderProgressFill', () => {
      render(<GanttChart tasks={tasks} />);

      const design = screen.getByRole('button', { name: /Design/ });
      const fill = design.querySelector('span');

      expect(design).toHaveAttribute('data-progress', '40');
      expect(fill).toHaveStyle({ width: '40%' });
    });

    it('GanttChart_Render_ShouldApplyTaskColor', () => {
      render(<GanttChart tasks={[{ ...tasks[0], color: 'rgb(255, 0, 0)' }]} />);

      expect(screen.getByRole('button', { name: /Design/ })).toHaveStyle({
        backgroundColor: 'rgb(255, 0, 0)'
      });
    });

    it('GanttChart_Render_ShouldRenderDayColumnsByDefault', () => {
      render(<GanttChart tasks={tasks} />);

      const range = getGanttRange(tasks);
      const columns = getGanttColumns(range, 'day');

      columns.forEach((column) => {
        expect(screen.getByText(column.label)).toBeInTheDocument();
      });
    });

    it('GanttChart_Render_ShouldRenderWeekColumns', () => {
      render(<GanttChart tasks={tasks} view="week" />);

      const range = getGanttRange(tasks, undefined, undefined, 'week');
      const columns = getGanttColumns(range, 'week');

      columns.forEach((column) => {
        expect(screen.getByText(column.label)).toBeInTheDocument();
      });
    });

    it('GanttChart_Render_ShouldRenderMonthColumns', () => {
      render(<GanttChart tasks={tasks} view="month" />);

      const range = getGanttRange(tasks, undefined, undefined, 'month');
      const columns = getGanttColumns(range, 'month');

      columns.forEach((column) => {
        expect(screen.getByText(column.label)).toBeInTheDocument();
      });
    });

    it('GanttChart_Render_ShouldFormatDatesWithLocale', () => {
      render(<GanttChart tasks={tasks} locale="en-US" />);

      expect(
        screen.getByRole('button', {
          name: 'Design, 01/10/2024 – 01/14/2024, 40% complete'
        })
      ).toBeInTheDocument();
    });
  });

  describe('dependencies', () => {
    it('GanttChart_Dependencies_ShouldRenderConnectorLines', () => {
      const { container } = render(<GanttChart tasks={tasks} />);
      const paths = container.querySelectorAll('[data-dependency]');

      expect(paths).toHaveLength(1);
      expect(paths[0]).toHaveAttribute('data-dependency', 'design->build');
    });

    it('GanttChart_Dependencies_ShouldBeHiddenWhenDisabled', () => {
      const { container } = render(<GanttChart tasks={tasks} showDependencies={false} />);

      expect(container.querySelectorAll('[data-dependency]')).toHaveLength(0);
    });

    it('GanttChart_Dependencies_ShouldIgnoreUnknownTaskIds', () => {
      const { container } = render(
        <GanttChart tasks={[{ ...tasks[1], dependencies: ['missing'] }]} />
      );

      expect(container.querySelectorAll('[data-dependency]')).toHaveLength(0);
    });
  });

  describe('today marker', () => {
    it('GanttChart_Today_ShouldRenderWhenInRange', () => {
      const today = new Date();

      render(
        <GanttChart
          tasks={[
            {
              id: 'today',
              name: 'Today task',
              start: today,
              end: today,
              progress: 0
            }
          ]}
        />
      );

      expect(screen.getByRole('separator', { name: 'Today' })).toBeInTheDocument();
    });

    it('GanttChart_Today_ShouldNotRenderWhenOutOfRange', () => {
      render(
        <GanttChart
          tasks={tasks}
          startDate={new Date(2020, 0, 1)}
          endDate={new Date(2020, 0, 31)}
        />
      );

      expect(screen.queryByRole('separator', { name: 'Today' })).not.toBeInTheDocument();
    });

    it('GanttChart_Today_ShouldRespectShowTodayProp', () => {
      const today = new Date();

      render(
        <GanttChart
          tasks={[
            {
              id: 'today',
              name: 'Today task',
              start: today,
              end: today
            }
          ]}
          showToday={false}
        />
      );

      expect(screen.queryByRole('separator', { name: 'Today' })).not.toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('GanttChart_Click_ShouldInvokeOnTaskClick', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      render(<GanttChart tasks={tasks} onTaskClick={onTaskClick} />);
      await user.click(screen.getByRole('button', { name: /Build/ }));

      expect(onTaskClick).toHaveBeenCalledTimes(1);
      expect(onTaskClick).toHaveBeenCalledWith(tasks[1]);
    });

    it('GanttChart_Keyboard_ShouldInvokeOnTaskClickWithEnterAndSpace', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      render(<GanttChart tasks={tasks} onTaskClick={onTaskClick} />);

      const bar = screen.getByRole('button', { name: /Design/ });
      bar.focus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onTaskClick).toHaveBeenCalledTimes(2);
      expect(onTaskClick).toHaveBeenNthCalledWith(1, tasks[0]);
      expect(onTaskClick).toHaveBeenNthCalledWith(2, tasks[0]);
    });

    it('GanttChart_Keyboard_ShouldIgnoreOtherKeys', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      render(<GanttChart tasks={tasks} onTaskClick={onTaskClick} />);

      const bar = screen.getByRole('button', { name: /Design/ });
      bar.focus();
      await user.keyboard('{ArrowRight}');

      expect(onTaskClick).not.toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('GanttChart_Empty_ShouldRenderEmptyState', () => {
      render(<GanttChart tasks={[]} emptyState="Nothing scheduled" />);

      expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('GanttChart_Empty_ShouldStillExposeRegion', () => {
      render(<GanttChart tasks={[]} emptyState="Nothing scheduled" ariaLabel="Empty chart" />);

      expect(screen.getByRole('region', { name: 'Empty chart' })).toBeInTheDocument();
    });
  });

  describe('editing', () => {
    const linkTasks: GanttTask[] = [
      { id: 'alpha', name: 'Alpha', start: new Date(2024, 0, 10), end: new Date(2024, 0, 12) },
      { id: 'beta', name: 'Beta', start: new Date(2024, 0, 15), end: new Date(2024, 0, 17) }
    ];

    it('GanttChart_Editable_ShouldHideEditingAffordancesWhenDisabled', async () => {
      const user = userEvent.setup();
      const onTaskChange = jest.fn();

      render(<GanttChart tasks={tasks} onTaskChange={onTaskChange} />);

      expect(screen.queryByRole('button', { name: /Resize/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Link to next task/ })).not.toBeInTheDocument();

      const bar = screen.getByRole('button', { name: /^Design/ });

      bar.focus();
      await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

      expect(onTaskChange).not.toHaveBeenCalled();
      expect(bar).toHaveStyle({ left: '0px' });
    });

    it('GanttChart_Editable_ShouldMoveTaskWithAltArrowRight', async () => {
      const user = userEvent.setup();
      const onTaskChange = jest.fn();

      render(<GanttChart tasks={tasks} editable onTaskChange={onTaskChange} />);

      const bar = screen.getByRole('button', { name: /^Design/ });

      bar.focus();
      await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

      expect(onTaskChange).toHaveBeenCalledTimes(1);
      expect(onTaskChange).toHaveBeenCalledWith(tasks[0], {
        start: new Date(2024, 0, 11),
        end: new Date(2024, 0, 15)
      });

      expect(bar).toHaveStyle({ left: `${DAY_WIDTH}px`, width: `${5 * DAY_WIDTH}px` });
      expect(bar).toHaveAttribute('aria-label', 'Design, 11/01/2024 – 15/01/2024, 40% complete');
    });

    it('GanttChart_Editable_ShouldMoveTaskWithAltArrowLeft', async () => {
      const user = userEvent.setup();
      const onTaskChange = jest.fn();

      render(<GanttChart tasks={tasks} editable onTaskChange={onTaskChange} />);

      const bar = screen.getByRole('button', { name: /^Design/ });

      bar.focus();
      await user.keyboard('{Alt>}{ArrowLeft}{/Alt}');

      expect(onTaskChange).toHaveBeenCalledWith(tasks[0], {
        start: new Date(2024, 0, 9),
        end: new Date(2024, 0, 13)
      });
      expect(bar).toHaveAttribute('aria-label', 'Design, 09/01/2024 – 13/01/2024, 40% complete');
    });

    it('GanttChart_Editable_ShouldResizeTaskWithAltShiftArrowRight', async () => {
      const user = userEvent.setup();
      const onTaskChange = jest.fn();

      render(<GanttChart tasks={tasks} editable onTaskChange={onTaskChange} />);

      const bar = screen.getByRole('button', { name: /^Design/ });

      bar.focus();
      await user.keyboard('{Alt>}{Shift>}{ArrowRight}{/Shift}{/Alt}');

      expect(onTaskChange).toHaveBeenCalledWith(tasks[0], {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 15)
      });
      expect(bar).toHaveStyle({ left: '0px', width: `${6 * DAY_WIDTH}px` });
    });

    it('GanttChart_Editable_ShouldClampResizeToMinimumOneDay', async () => {
      const user = userEvent.setup();
      const onTaskChange = jest.fn();
      const shortTasks: GanttTask[] = [
        { id: 'short', name: 'Short', start: new Date(2024, 0, 10), end: new Date(2024, 0, 11) }
      ];

      render(<GanttChart tasks={shortTasks} editable onTaskChange={onTaskChange} />);

      const bar = screen.getByRole('button', { name: /^Short/ });

      bar.focus();
      await user.keyboard('{Alt>}{Shift>}{ArrowLeft}{/Shift}{/Alt}');
      await user.keyboard('{Alt>}{Shift>}{ArrowLeft}{/Shift}{/Alt}');

      expect(onTaskChange).toHaveBeenLastCalledWith(shortTasks[0], {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 10)
      });
      expect(bar).toHaveStyle({ width: `${DAY_WIDTH}px` });
    });

    it('GanttChart_Editable_ShouldMoveTaskByDraggingTheBar', () => {
      const onTaskChange = jest.fn();

      render(<GanttChart tasks={tasks} editable onTaskChange={onTaskChange} />);

      const bar = screen.getByRole('button', { name: /^Design/ });

      fireEvent.pointerDown(bar, { clientX: 0, button: 0 });
      fireEvent.pointerMove(bar, { clientX: 2 * DAY_WIDTH });
      fireEvent.pointerUp(bar, { clientX: 2 * DAY_WIDTH });

      expect(onTaskChange).toHaveBeenCalledWith(tasks[0], {
        start: new Date(2024, 0, 12),
        end: new Date(2024, 0, 16)
      });
      expect(bar).toHaveStyle({ left: `${2 * DAY_WIDTH}px`, width: `${5 * DAY_WIDTH}px` });
    });

    it('GanttChart_Editable_ShouldResizeTaskByDraggingTheHandle', async () => {
      const user = userEvent.setup();
      const onTaskChange = jest.fn();

      render(<GanttChart tasks={tasks} editable onTaskChange={onTaskChange} />);

      const handle = screen.getByRole('button', { name: 'Resize Design' });

      fireEvent.pointerDown(handle, { clientX: 0, button: 0 });
      fireEvent.pointerMove(handle, { clientX: DAY_WIDTH });
      fireEvent.pointerUp(handle, { clientX: DAY_WIDTH });

      expect(onTaskChange).toHaveBeenCalledWith(tasks[0], {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 15)
      });

      // Arrow keys on the handle resize the task without the Alt modifier.
      handle.focus();
      await user.keyboard('{ArrowLeft}{ArrowLeft}');

      expect(onTaskChange).toHaveBeenLastCalledWith(tasks[0], {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 13)
      });
    });

    it('GanttChart_Editable_ShouldPreferControlledTaskDates', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<GanttChart tasks={tasks} editable />);
      const bar = screen.getByRole('button', { name: /^Design/ });

      bar.focus();
      await user.keyboard('{Alt>}{ArrowRight}{/Alt}');

      expect(bar).toHaveStyle({ left: `${DAY_WIDTH}px` });

      // The parent rejects the change by sending the original tasks again.
      rerender(<GanttChart tasks={[...tasks]} editable />);

      expect(bar).toHaveStyle({ left: '0px' });
    });

    it('GanttChart_Editable_ShouldStillNotifyPlainClicks', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      render(<GanttChart tasks={tasks} editable onTaskClick={onTaskClick} />);

      await user.click(screen.getByRole('button', { name: /^Design/ }));

      expect(onTaskClick).toHaveBeenCalledTimes(1);
      expect(onTaskClick).toHaveBeenCalledWith(tasks[0]);
    });

    it('GanttChart_Editable_ShouldCreateDependencyToNextTask', async () => {
      const user = userEvent.setup();
      const onDependencyCreate = jest.fn();
      const { container } = render(
        <GanttChart tasks={linkTasks} editable onDependencyCreate={onDependencyCreate} />
      );

      expect(container.querySelectorAll('[data-dependency]')).toHaveLength(0);

      await user.click(screen.getByRole('button', { name: 'Link to next task: Alpha' }));

      expect(onDependencyCreate).toHaveBeenCalledTimes(1);
      expect(onDependencyCreate).toHaveBeenCalledWith('alpha', 'beta');
      expect(container.querySelector('[data-dependency="alpha->beta"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Link to next task: Beta' })).toBeDisabled();
    });

    it('GanttChart_Editable_ShouldHaveNoAccessibilityViolations', async () => {
      const { container } = render(
        <GanttChart tasks={linkTasks} editable onTaskChange={jest.fn()} ariaLabel="Editable plan" />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('critical path', () => {
    it('GanttChart_ComputeCriticalPath_ShouldReturnLongestDependencyChain', () => {
      const result = computeCriticalPath(chainTasks);

      expect(result.taskIds).toEqual(['a', 'b', 'c']);
      expect(result.links).toEqual([
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' }
      ]);
      expect(result.hasCycle).toBe(false);
    });

    it('GanttChart_ComputeCriticalPath_ShouldIgnoreMissingAndSelfDependencies', () => {
      const result = computeCriticalPath([
        {
          id: 'solo',
          name: 'Solo',
          start: new Date(2024, 0, 1),
          end: new Date(2024, 0, 3),
          dependencies: ['ghost', 'solo']
        }
      ]);

      expect(result.taskIds).toEqual(['solo']);
      expect(result.links).toEqual([]);
      expect(result.hasCycle).toBe(false);
    });

    it('GanttChart_ComputeCriticalPath_ShouldBreakCyclesWithoutThrowing', () => {
      const result = computeCriticalPath([
        {
          id: 'loop-a',
          name: 'Loop A',
          start: new Date(2024, 0, 1),
          end: new Date(2024, 0, 2),
          dependencies: ['loop-b']
        },
        {
          id: 'loop-b',
          name: 'Loop B',
          start: new Date(2024, 0, 3),
          end: new Date(2024, 0, 4),
          dependencies: ['loop-a']
        }
      ]);

      expect(result.hasCycle).toBe(true);
      expect(result.taskIds).toEqual(['loop-b', 'loop-a']);
      expect(result.links).toEqual([{ from: 'loop-b', to: 'loop-a' }]);
    });

    it('GanttChart_ComputeCriticalPath_ShouldReturnEmptyResultWithoutTasks', () => {
      expect(computeCriticalPath([])).toEqual({ taskIds: [], links: [], hasCycle: false });
    });

    it('GanttChart_CriticalPath_ShouldMarkCriticalTasksAndLinks', () => {
      const { container } = render(
        <GanttChart tasks={chainTasks} showCriticalPath criticalPathColor="#ff3d71" />
      );

      expect(
        screen.getByRole('button', {
          name: 'A, 01/01/2024 – 03/01/2024, 0% complete, critical path'
        })
      ).toHaveAttribute('data-critical', 'true');
      expect(screen.getByRole('button', { name: /^C,/ })).toHaveAttribute('data-critical', 'true');
      expect(screen.getByRole('button', { name: /^D,/ })).not.toHaveAttribute('data-critical');
      expect(screen.getByRole('button', { name: /^A,/ })).toHaveStyle({
        backgroundColor: 'rgb(255, 61, 113)'
      });

      const criticalLink = container.querySelector('[data-dependency="a->b"]');
      const regularLink = container.querySelector('[data-dependency="a->d"]');

      expect(criticalLink).toHaveAttribute('data-critical', 'true');
      expect(criticalLink).toHaveAttribute('stroke', '#ff3d71');
      expect(regularLink).not.toHaveAttribute('data-critical');
    });

    it('GanttChart_CriticalPath_ShouldBeHiddenByDefault', () => {
      const { container } = render(<GanttChart tasks={chainTasks} />);

      expect(container.querySelectorAll('[data-critical]')).toHaveLength(0);
      expect(
        screen.getByRole('button', { name: 'A, 01/01/2024 – 03/01/2024, 0% complete' })
      ).toBeInTheDocument();
    });

    it('GanttChart_CriticalPath_ShouldKeepKeyboardActivation', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      render(<GanttChart tasks={chainTasks} showCriticalPath onTaskClick={onTaskClick} />);

      const bar = screen.getByRole('button', { name: /^B,/ });

      bar.focus();
      await user.keyboard('{Enter}');

      expect(onTaskClick).toHaveBeenCalledTimes(1);
      expect(onTaskClick).toHaveBeenCalledWith(chainTasks[1]);
    });
  });

  describe('baselines', () => {
    const baselineTasks: GanttTask[] = [
      {
        ...tasks[0],
        baselineStart: new Date(2024, 0, 10),
        baselineEnd: new Date(2024, 0, 12)
      },
      {
        ...tasks[1],
        baselineStart: '2024-01-15',
        baselineEnd: '2024-01-21'
      }
    ];

    it('GanttChart_NormalizeTasks_ShouldValidateBaselineDates', () => {
      const normalized = normalizeGanttTasks([
        {
          id: 'valid',
          name: 'Valid',
          start: new Date(2024, 0, 10),
          end: new Date(2024, 0, 14),
          baselineStart: '2024-01-09',
          baselineEnd: '2024-01-12'
        },
        {
          id: 'reversed',
          name: 'Reversed',
          start: new Date(2024, 0, 10),
          end: new Date(2024, 0, 14),
          baselineStart: new Date(2024, 0, 14),
          baselineEnd: new Date(2024, 0, 12)
        },
        {
          id: 'incomplete',
          name: 'Incomplete',
          start: new Date(2024, 0, 10),
          end: new Date(2024, 0, 14),
          baselineStart: new Date(2024, 0, 10)
        }
      ]);

      expect(normalized[0].baseline).toEqual({
        start: new Date(2024, 0, 9),
        end: new Date(2024, 0, 12)
      });
      expect(normalized[1].baseline).toBeNull();
      expect(normalized[2].baseline).toBeNull();
    });

    it('GanttChart_Baseline_ShouldRenderBarsBehindTasks', () => {
      const { container } = render(<GanttChart tasks={baselineTasks} showBaseline />);
      const designBaseline = container.querySelector('[data-baseline-task="design"]');

      expect(designBaseline).toBeInTheDocument();
      expect(designBaseline).toHaveStyle({
        left: '0px',
        width: `${3 * DAY_WIDTH}px`,
        zIndex: 1
      });
      expect(
        screen.getByRole('img', { name: 'Baseline for Design: 10/01/2024 – 12/01/2024' })
      ).toBe(designBaseline);
      expect(designBaseline).toHaveAttribute(
        'title',
        'Baseline for Design: 10/01/2024 – 12/01/2024'
      );
      expect(container.querySelector('[data-baseline-task="build"]')).toBeInTheDocument();
    });

    it('GanttChart_Baseline_ShouldApplyCustomColor', () => {
      const { container } = render(
        <GanttChart tasks={baselineTasks} showBaseline baselineColor="#8f9bb3" />
      );

      expect(container.querySelector('[data-baseline-task="design"]')).toHaveStyle({
        backgroundColor: 'rgb(143, 155, 179)'
      });
    });

    it('GanttChart_Baseline_ShouldBeHiddenByDefault', () => {
      const { container } = render(<GanttChart tasks={baselineTasks} />);

      expect(container.querySelectorAll('[data-baseline-task]')).toHaveLength(0);
      expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    it('GanttChart_Baseline_ShouldSkipInvalidOrIncompleteRanges', () => {
      const invalidTasks: GanttTask[] = [
        {
          ...tasks[0],
          baselineStart: new Date(2024, 0, 14),
          baselineEnd: new Date(2024, 0, 12)
        },
        {
          ...tasks[1],
          baselineStart: new Date(2024, 0, 15)
        }
      ];

      const { container } = render(<GanttChart tasks={invalidTasks} showBaseline />);

      expect(container.querySelectorAll('[data-baseline-task]')).toHaveLength(0);
    });
  });

  describe('resources', () => {
    it('GanttChart_Resources_ShouldRenderLegend', () => {
      render(<GanttChart tasks={resourceTasks} resources={resources} />);

      const legend = screen.getByRole('list', { name: 'Resources' });

      expect(legend).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
      expect(screen.getByText('Design team')).toBeInTheDocument();
      expect(screen.getByText('Dev team')).toBeInTheDocument();
      expect(screen.getByText('QA team')).toBeInTheDocument();
      expect(legend.querySelector('[data-resource-swatch="design-team"]')).toHaveStyle({
        backgroundColor: 'rgb(51, 102, 255)'
      });
      expect(legend.querySelector('[data-resource-swatch="qa-team"]')).toBeInTheDocument();
    });

    it('GanttChart_Resources_ShouldRespectResourceLabel', () => {
      render(<GanttChart tasks={resourceTasks} resources={resources} resourceLabel="Teams" />);

      expect(screen.getByRole('list', { name: 'Teams' })).toBeInTheDocument();
    });

    it('GanttChart_Resources_ShouldMarkTasksAndDescribeThem', () => {
      render(<GanttChart tasks={resourceTasks} resources={resources} />);

      const design = screen.getByRole('button', { name: /^Design,/ });
      const build = screen.getByRole('button', { name: /^Build,/ });

      expect(design).toHaveAttribute('data-resource-ids', 'design-team');
      expect(design.getAttribute('aria-label')).toContain('resources: Design team');
      expect(build).toHaveAttribute('data-resource-ids', 'dev-team');
      expect(build.getAttribute('aria-label')).toContain('resources: Dev team');
      expect(build.getAttribute('aria-label')).not.toContain('missing-team');
    });

    it('GanttChart_Resources_ShouldBeHiddenWhenDisabled', () => {
      render(<GanttChart tasks={resourceTasks} resources={resources} showResources={false} />);

      expect(screen.queryByRole('list', { name: 'Resources' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Design,/ })).not.toHaveAttribute(
        'data-resource-ids'
      );
      expect(
        screen.getByRole('button', {
          name: 'Design, 10/01/2024 – 14/01/2024, 40% complete'
        })
      ).toBeInTheDocument();
    });

    it('GanttChart_Resources_ShouldNotRenderLegendWithoutResources', () => {
      render(<GanttChart tasks={tasks} />);

      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('resource lanes', () => {
    it('GanttChart_ResourceView_ShouldRenderOneLanePerResource', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView />
      );

      const laneIds = Array.from(container.querySelectorAll('[data-resource-lane]')).map((lane) =>
        lane.getAttribute('data-resource-lane')
      );

      expect(laneIds).toEqual(['design-team', 'dev-team', 'qa-team', 'unassigned']);
      expect(screen.getByRole('grid', { name: 'Resource lanes' })).toBeInTheDocument();
      expect(container.querySelector('[data-resource-lane-swatch="dev-team"]')).toHaveStyle({
        backgroundColor: 'rgb(0, 214, 143)'
      });
      expect(container.querySelector('[data-resource-lane="dev-team"]')).toHaveTextContent(
        'Dev team'
      );
    });

    it('GanttChart_ResourceView_ShouldAssignTasksToTheirLanes', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView />
      );

      expect(container.querySelectorAll('[data-task-lane="design-team"]')).toHaveLength(1);
      expect(container.querySelectorAll('[data-task-lane="dev-team"]')).toHaveLength(3);
      expect(container.querySelectorAll('[data-task-lane="qa-team"]')).toHaveLength(1);
      expect(
        container.querySelector('[data-task-lane="dev-team"] [data-task-id="code"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-task-lane="design-team"] [data-task-id="plan"]')
      ).toBeInTheDocument();
    });

    it('GanttChart_ResourceView_ShouldRepeatMultiResourceTasksAndDescribeTheLane', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView />
      );

      const reviewBars = screen.getAllByRole('button', { name: /^Review,/ });

      expect(reviewBars).toHaveLength(2);
      expect(
        reviewBars
          .map((bar) => bar.closest('[data-task-lane]')?.getAttribute('data-task-lane'))
          .sort()
      ).toEqual(['dev-team', 'qa-team']);
      reviewBars.forEach((bar) => {
        expect(bar.getAttribute('aria-label')).toContain('lane:');
      });
      expect(container.querySelectorAll('[data-task-id="review"]')).toHaveLength(2);
    });

    it('GanttChart_ResourceView_ShouldSendUnassignedTasksToTheUnassignedLane', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView />
      );

      expect(container.querySelectorAll('[data-task-lane="unassigned"]')).toHaveLength(2);
      expect(
        container.querySelector('[data-task-lane="unassigned"] [data-task-id="loose"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-task-lane="unassigned"] [data-task-id="ghost"]')
      ).toBeInTheDocument();
      expect(container.querySelector('[data-resource-lane="unassigned"]')).toHaveTextContent(
        'Unassigned'
      );
    });

    it('GanttChart_ResourceView_ShouldIgnoreUnknownResourceIdsAndKeepKnownOnes', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView />
      );

      expect(
        container.querySelector('[data-task-lane="dev-team"] [data-task-id="build"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-task-lane="unassigned"] [data-task-id="build"]')
      ).not.toBeInTheDocument();
    });

    it('GanttChart_ResourceView_ShouldOmitUnassignedLaneWhenEveryTaskHasResource', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks.slice(0, 2)} resources={resources} resourceView />
      );

      expect(container.querySelector('[data-resource-lane="unassigned"]')).not.toBeInTheDocument();
      expect(container.querySelectorAll('[data-resource-lane]')).toHaveLength(resources.length);
      expect(container.querySelector('[data-resource-lane="qa-team"]')).toHaveTextContent(
        '0 tasks'
      );
    });

    it('GanttChart_ResourceView_ShouldKeepDependencyLinks', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView />
      );

      expect(container.querySelector('[data-dependency="plan->code"]')).toBeInTheDocument();
    });

    it('GanttChart_ResourceView_ShouldBeDisabledByDefault', () => {
      const { container } = render(<GanttChart tasks={laneTasks} resources={resources} />);

      expect(container.querySelector('[data-resource-lane]')).not.toBeInTheDocument();
      expect(container.querySelectorAll('[data-task-row]')).toHaveLength(laneTasks.length);
      expect(screen.queryByRole('grid', { name: 'Resource lanes' })).not.toBeInTheDocument();
    });

    it('GanttChart_ResourceView_ShouldKeepLanesWithoutTheResourceLegend', () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView showResources={false} />
      );

      expect(screen.queryByRole('list', { name: 'Resources' })).not.toBeInTheDocument();
      expect(container.querySelectorAll('[data-resource-lane]')).toHaveLength(4);
    });
  });

  describe('progress editing', () => {
    it('GanttChart_Progress_ShouldRenderASliderWhenEnabled', () => {
      render(<GanttChart tasks={tasks} editableProgress onProgressChange={jest.fn()} />);

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });

      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-valuenow', '40');
      expect(slider).toHaveAttribute('aria-valuetext', '40% complete');
    });

    it('GanttChart_Progress_ShouldBeHiddenByDefault', () => {
      render(<GanttChart tasks={tasks} />);

      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    it('GanttChart_Progress_ShouldPreviewWhileDraggingAndEmitOnPointerUp', () => {
      const onProgressChange = jest.fn();

      render(<GanttChart tasks={tasks} editableProgress onProgressChange={onProgressChange} />);

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });
      const bar = screen.getByRole('button', { name: /^Design,/ });

      // The design bar spans 5 days * 32px = 160px, so +80px is +50%.
      fireEvent.pointerDown(slider, { clientX: 0, button: 0 });
      fireEvent.pointerMove(slider, { clientX: 80 });

      expect(onProgressChange).not.toHaveBeenCalled();
      expect(slider).toHaveAttribute('aria-valuenow', '90');
      expect(slider).toHaveAttribute('aria-valuetext', '90% complete');
      expect(bar).toHaveAttribute('data-progress', '90');

      fireEvent.pointerUp(slider, { clientX: 80 });

      expect(onProgressChange).toHaveBeenCalledTimes(1);
      expect(onProgressChange).toHaveBeenCalledWith(tasks[0], 90);
      expect(slider).toHaveAttribute('aria-valuenow', '90');
    });

    it('GanttChart_Progress_ShouldSnapToFivePercentSteps', () => {
      const onProgressChange = jest.fn();

      render(<GanttChart tasks={tasks} editableProgress onProgressChange={onProgressChange} />);

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });

      // +18px is +11.25% on top of 40%, which snaps to 50%.
      fireEvent.pointerDown(slider, { clientX: 0, button: 0 });
      fireEvent.pointerMove(slider, { clientX: 18 });
      fireEvent.pointerUp(slider, { clientX: 18 });

      expect(onProgressChange).toHaveBeenCalledWith(tasks[0], 50);
    });

    it('GanttChart_Progress_ShouldClampToZeroAndOneHundred', () => {
      const onProgressChange = jest.fn();

      render(<GanttChart tasks={tasks} editableProgress onProgressChange={onProgressChange} />);

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });

      fireEvent.pointerDown(slider, { clientX: 0, button: 0 });
      fireEvent.pointerMove(slider, { clientX: -500 });
      fireEvent.pointerUp(slider, { clientX: -500 });

      expect(onProgressChange).toHaveBeenLastCalledWith(tasks[0], 0);
      expect(slider).toHaveAttribute('aria-valuenow', '0');

      fireEvent.pointerDown(slider, { clientX: 0, button: 0 });
      fireEvent.pointerMove(slider, { clientX: 500 });
      fireEvent.pointerUp(slider, { clientX: 500 });

      expect(onProgressChange).toHaveBeenLastCalledWith(tasks[0], 100);
      expect(slider).toHaveAttribute('aria-valuenow', '100');
    });

    it('GanttChart_Progress_ShouldNotEmitWithoutChanges', () => {
      const onProgressChange = jest.fn();

      render(<GanttChart tasks={tasks} editableProgress onProgressChange={onProgressChange} />);

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });

      fireEvent.pointerDown(slider, { clientX: 0, button: 0 });
      fireEvent.pointerUp(slider, { clientX: 0 });

      expect(onProgressChange).not.toHaveBeenCalled();
    });

    it('GanttChart_Progress_ShouldRevertThePreviewOnPointerCancel', () => {
      const onProgressChange = jest.fn();

      render(<GanttChart tasks={tasks} editableProgress onProgressChange={onProgressChange} />);

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });

      fireEvent.pointerDown(slider, { clientX: 0, button: 0 });
      fireEvent.pointerMove(slider, { clientX: 80 });
      expect(slider).toHaveAttribute('aria-valuenow', '90');

      fireEvent.pointerCancel(slider, { clientX: 80 });

      expect(onProgressChange).not.toHaveBeenCalled();
      expect(slider).toHaveAttribute('aria-valuenow', '40');
    });

    it('GanttChart_Progress_ShouldAdjustWithKeyboardSteps', () => {
      const onProgressChange = jest.fn();

      render(<GanttChart tasks={tasks} editableProgress onProgressChange={onProgressChange} />);

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });

      fireEvent.keyDown(slider, { key: '+' });
      expect(onProgressChange).toHaveBeenLastCalledWith(tasks[0], 45);
      expect(slider).toHaveAttribute('aria-valuenow', '45');

      fireEvent.keyDown(slider, { key: '+', shiftKey: true });
      expect(onProgressChange).toHaveBeenLastCalledWith(tasks[0], 55);

      fireEvent.keyDown(slider, { key: '-' });
      expect(onProgressChange).toHaveBeenLastCalledWith(tasks[0], 50);
    });

    it('GanttChart_Progress_ShouldClampKeyboardSteps', () => {
      const onProgressChange = jest.fn();
      const almostDone: GanttTask[] = [{ ...tasks[0], progress: 95 }];

      render(
        <GanttChart tasks={almostDone} editableProgress onProgressChange={onProgressChange} />
      );

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });

      fireEvent.keyDown(slider, { key: '+' });
      expect(onProgressChange).toHaveBeenLastCalledWith(almostDone[0], 100);

      fireEvent.keyDown(slider, { key: '+' });
      expect(onProgressChange).toHaveBeenCalledTimes(1);
      expect(slider).toHaveAttribute('aria-valuenow', '100');
    });

    it('GanttChart_Progress_ShouldNotConflictWithTaskDragOrClick', () => {
      const onProgressChange = jest.fn();
      const onTaskChange = jest.fn();
      const onTaskClick = jest.fn();

      render(
        <GanttChart
          tasks={tasks}
          editable
          editableProgress
          onProgressChange={onProgressChange}
          onTaskChange={onTaskChange}
          onTaskClick={onTaskClick}
        />
      );

      const slider = screen.getByRole('slider', { name: 'Progress for Design' });
      const bar = screen.getByRole('button', { name: /^Design,/ });

      fireEvent.pointerDown(slider, { clientX: 0, button: 0 });
      fireEvent.pointerMove(slider, { clientX: 64 });
      fireEvent.pointerUp(slider, { clientX: 64 });
      fireEvent.click(slider);

      expect(onTaskChange).not.toHaveBeenCalled();
      expect(onTaskClick).not.toHaveBeenCalled();
      expect(bar).toHaveStyle({ left: '0px' });
      expect(onProgressChange).toHaveBeenCalledWith(tasks[0], 80);
    });
  });

  describe('export', () => {
    const exportSvgMock = jest.mocked(exportChartSvg);
    const exportPngMock = jest.mocked(exportChartPng);

    beforeEach(() => {
      exportSvgMock.mockReset();
      exportPngMock.mockReset();
    });

    it('GanttChart_Export_ShouldBeHiddenByDefault', () => {
      render(<GanttChart tasks={tasks} />);

      expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
    });

    it('GanttChart_Export_ShouldExportSvgWithTheDefaultFileName', async () => {
      const user = userEvent.setup();
      const onExport = jest.fn();

      render(<GanttChart tasks={tasks} exportable onExport={onExport} />);

      await user.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(exportSvgMock).toHaveBeenCalledTimes(1);
      expect(exportSvgMock.mock.calls[0][1]).toBe('gantt');
      expect(onExport).toHaveBeenCalledWith('svg');
      expect(screen.getByRole('status')).toHaveTextContent('Exported gantt.svg');
    });

    it('GanttChart_Export_ShouldSerializeTimelineAndBarsWithoutTooltips', async () => {
      const user = userEvent.setup();

      render(<GanttChart tasks={tasks} exportable />);

      await user.click(screen.getByRole('button', { name: 'Export SVG' }));

      const element = exportSvgMock.mock.calls[0][0] as unknown as SVGSVGElement;

      expect(element.tagName.toLowerCase()).toBe('svg');
      expect(element.getAttribute('width')).toBe(String(220 + 11 * DAY_WIDTH));
      expect(element.getAttribute('height')).toBe(String(36 + 2 * 36));
      expect(element.querySelectorAll('[data-export-task]')).toHaveLength(2);
      expect(element.querySelector('[data-export-timeline]')).not.toBeNull();
      expect(element.querySelectorAll('title')).toHaveLength(0);
      expect(element.textContent).toContain('Design');
      expect(element.textContent).toContain('10/01');
    });

    it('GanttChart_Export_ShouldExportPngWithACustomFileName', async () => {
      const user = userEvent.setup();
      const onExport = jest.fn();

      exportPngMock.mockResolvedValue(undefined);

      render(<GanttChart tasks={tasks} exportable exportFileName="roadmap" onExport={onExport} />);

      await user.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Exported roadmap.png');
      });

      expect(exportPngMock).toHaveBeenCalledTimes(1);
      expect(exportPngMock.mock.calls[0][1]).toBe('roadmap');
      expect(onExport).toHaveBeenCalledWith('png');
    });

    it('GanttChart_Export_ShouldReportSvgFailures', async () => {
      const user = userEvent.setup();
      const onExport = jest.fn();

      exportSvgMock.mockImplementationOnce(() => {
        throw new Error('serializer exploded');
      });

      render(<GanttChart tasks={tasks} exportable onExport={onExport} />);

      await user.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(screen.getByRole('status')).toHaveTextContent('Unable to export chart');
      expect(onExport).not.toHaveBeenCalled();
    });

    it('GanttChart_Export_ShouldReportPngFailures', async () => {
      const user = userEvent.setup();
      const onExport = jest.fn();

      exportPngMock.mockRejectedValueOnce(new Error('canvas exploded'));

      render(<GanttChart tasks={tasks} exportable onExport={onExport} />);

      await user.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Unable to export chart');
      });
      expect(onExport).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('GanttChart_A11y_ShouldHaveNoViolations', async () => {
      const { container } = render(<GanttChart tasks={tasks} ariaLabel="Sprint plan" />);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('GanttChart_A11y_ShouldSupportCriticalPathBaselineAndResources', async () => {
      const enrichedTasks: GanttTask[] = chainTasks.map((task, index) => ({
        ...task,
        baselineStart: new Date(2024, 0, index + 1),
        baselineEnd: new Date(2024, 0, index + 2),
        resourceIds: [resources[index % resources.length].id]
      }));

      const { container } = render(
        <GanttChart
          tasks={enrichedTasks}
          resources={resources}
          showCriticalPath
          showBaseline
          ariaLabel="Release plan"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('GanttChart_A11y_ShouldExposeTaskBarsAsButtons', () => {
      render(<GanttChart tasks={tasks} />);

      const buttons = screen.getAllByRole('button');

      expect(buttons).toHaveLength(2);
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });

    it('GanttChart_A11y_ShouldSupportResourceLanes', async () => {
      const { container } = render(
        <GanttChart tasks={laneTasks} resources={resources} resourceView ariaLabel="Team plan" />
      );

      expect(screen.getByRole('grid', { name: 'Resource lanes' })).toBeInTheDocument();
      expect(screen.getAllByRole('rowheader').length).toBeGreaterThan(0);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('GanttChart_A11y_ShouldSupportProgressEditing', async () => {
      const { container } = render(
        <GanttChart
          tasks={tasks}
          editableProgress
          onProgressChange={jest.fn()}
          ariaLabel="Progress plan"
        />
      );

      expect(screen.getAllByRole('slider')).toHaveLength(2);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('GanttChart_A11y_ShouldSupportExportControls', async () => {
      const { container } = render(<GanttChart tasks={tasks} exportable ariaLabel="Export plan" />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
