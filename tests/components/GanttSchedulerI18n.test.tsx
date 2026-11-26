import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
  CalendarHeatmap,
  GanttChart,
  GanttResource,
  GanttTask,
  Scheduler,
  SchedulerEvent,
  SchedulerResource
} from '@nebular-react/core';
import { NebularProvider } from '@nebular-react/styles';

const today = new Date();
const day = (offset: number): Date => {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  date.setDate(date.getDate() + offset);

  return date;
};

const resources: GanttResource[] = [{ id: 'design', name: 'Design team' }];

const tasks: GanttTask[] = [
  {
    id: 'design',
    name: 'Design',
    start: day(0),
    end: day(2),
    progress: 40,
    resourceIds: ['design']
  },
  {
    id: 'build',
    name: 'Build',
    start: day(1),
    end: day(3),
    dependencies: ['design'],
    resourceIds: ['design']
  }
];

const schedulerResources: SchedulerResource[] = [{ id: 'alice', name: 'Alice' }];

const schedulerEvents: SchedulerEvent<Date>[] = [
  {
    id: 'standup',
    title: 'Standup',
    start: day(0),
    end: day(0),
    resourceId: 'alice'
  },
  {
    id: 'follow-up',
    title: 'Follow-up',
    start: day(0),
    end: day(0)
  }
];

const heatmapData = Array.from({ length: 28 }, (_item, index) => ({
  date: `2026-02-${String(index + 1).padStart(2, '0')}`,
  value: index % 5
}));

describe('GanttChart i18n', () => {
  it('renders the English labels by default', () => {
    render(
      <GanttChart
        tasks={tasks}
        resources={resources}
        resourceView
        editable
        editableProgress
        ariaLabel="Project plan"
      />
    );

    expect(screen.getByText('Resource')).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'Resource lanes' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'Design team lane' })).toBeInTheDocument();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Progress for Design' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resize Design' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Link to next task: Design' })).toBeInTheDocument();
  });

  it('uses the pt-BR catalog when the provider sets the locale', () => {
    render(
      <NebularProvider locale="pt-BR">
        <GanttChart
          tasks={tasks}
          resources={resources}
          resourceView
          editable
          editableProgress
          ariaLabel="Plano do projeto"
        />
      </NebularProvider>
    );

    expect(screen.getByText('Recurso')).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('grid', { name: 'Faixas de recursos' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: 'Faixa Design team' })).toBeInTheDocument();
    expect(screen.getByText('2 tarefas')).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Progresso de Design' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redimensionar Design' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Vincular à próxima tarefa: Design' })
    ).toBeInTheDocument();
  });

  it('lets the labels prop override the catalog', () => {
    render(
      <NebularProvider locale="pt-BR">
        <GanttChart
          tasks={tasks}
          labels={{
            task: 'Atividade',
            resource: 'Equipe',
            today: 'Agora',
            progress: (name) => `Andamento: ${name}`,
            unassigned: 'Sem responsável'
          }}
          editableProgress
        />
      </NebularProvider>
    );

    expect(screen.getByText('Atividade')).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: 'Agora' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Andamento: Design' })).toBeInTheDocument();
    expect(screen.queryByText('Tarefa')).not.toBeInTheDocument();
  });
});

describe('Scheduler i18n', () => {
  it('renders the English labels by default', () => {
    render(<Scheduler events={[]} defaultView="day" ariaLabel="Team schedule" />);

    expect(screen.getByRole('button', { name: 'Previous period' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next period' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Day' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Week' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByText('No events')).toBeInTheDocument();
  });

  it('uses the pt-BR catalog and keeps emptyState precedence', () => {
    const { rerender } = render(
      <NebularProvider locale="pt-BR">
        <Scheduler
          events={schedulerEvents}
          resources={schedulerResources}
          resourceView
          defaultView="week"
          ariaLabel="Agenda da equipe"
        />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Hoje' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dia' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Semana' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Mês' })).toBeInTheDocument();
    expect(screen.getByText('Não atribuído')).toBeInTheDocument();

    rerender(
      <NebularProvider locale="pt-BR">
        <Scheduler
          events={[]}
          defaultView="day"
          emptyState="Agenda livre"
          ariaLabel="Agenda da equipe"
        />
      </NebularProvider>
    );

    expect(screen.getAllByText('Agenda livre').length).toBeGreaterThan(0);
    expect(screen.queryByText('Nenhum evento')).not.toBeInTheDocument();
  });

  it('lets the labels prop override the catalog', () => {
    render(
      <NebularProvider locale="pt-BR">
        <Scheduler
          events={[]}
          defaultView="day"
          labels={{
            today: 'Agora',
            noEvents: 'Vazio',
            previousPeriod: 'Anterior',
            nextPeriod: 'Próximo',
            view: 'Modo de visualização',
            day: 'Dia',
            week: 'Semana',
            month: 'Mês'
          }}
          ariaLabel="Agenda da equipe"
        />
      </NebularProvider>
    );

    expect(screen.getByRole('button', { name: 'Agora' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dia' })).toBeInTheDocument();
    expect(screen.getByText('Vazio')).toBeInTheDocument();
    expect(screen.queryByText('Hoje')).not.toBeInTheDocument();
  });
});

describe('CalendarHeatmap i18n', () => {
  it('renders English month and weekday labels by default', () => {
    render(
      <CalendarHeatmap
        data={heatmapData}
        startDate="2026-02-01"
        endDate="2026-02-28"
        ariaLabel="Activity"
      />
    );

    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
  });

  it('uses the provider locale for the month and weekday labels', () => {
    const { container } = render(
      <NebularProvider locale="pt-BR">
        <CalendarHeatmap
          data={heatmapData}
          startDate="2026-02-01"
          endDate="2026-02-28"
          ariaLabel="Atividade"
        />
      </NebularProvider>
    );

    expect(screen.getByText('fev.')).toBeInTheDocument();
    expect(screen.getByText('seg.')).toBeInTheDocument();
    expect(screen.getByText('sáb.')).toBeInTheDocument();
    expect(screen.queryByText('Feb')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-calendar-day]')).toHaveLength(28);
  });

  it('prefers the locale prop over the provider', () => {
    render(
      <NebularProvider locale="pt-BR">
        <CalendarHeatmap
          data={heatmapData}
          startDate="2026-02-01"
          endDate="2026-02-28"
          locale="en-US"
          ariaLabel="Activity"
        />
      </NebularProvider>
    );

    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.queryByText('fev.')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CalendarHeatmap
        data={heatmapData}
        startDate="2026-02-01"
        endDate="2026-02-28"
        ariaLabel="Activity"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
