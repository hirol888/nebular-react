import React, { useState } from 'react';
import { NebularProvider } from '@nebular-react/styles';
import { CalendarHeatmap } from './CalendarHeatmap';

export default { title: 'Components/CalendarHeatmap', component: CalendarHeatmap };

function formatDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

function buildRecentData(days: number) {
  return Array.from({ length: days }, (_item, index) => {
    const date = new Date(2026, 0, 31 - (days - 1 - index));

    return {
      date: formatDate(date),
      value: (index * 7 + 3) % 13
    };
  });
}

function buildYearData(year: number) {
  return Array.from({ length: 365 }, (_item, index) => {
    const date = new Date(year, 0, 1 + index);

    return {
      date: formatDate(date),
      value: (index * 13) % 9
    };
  });
}

export function Showcase() {
  return <CalendarHeatmap data={buildRecentData(84)} weeks={14} ariaLabel="Recent activity" />;
}

export function FullYear() {
  return (
    <CalendarHeatmap
      data={buildYearData(2025)}
      startDate="2025-01-01"
      endDate="2025-12-31"
      cellSize={10}
      gap={2}
      colors={['#ebedf0', '#b2f2bb', '#40c057', '#2b8a3e', '#1b5e20']}
      valueFormatter={(value: number) => `${value} commits`}
      ariaLabel="Commits in 2025"
    />
  );
}

export function Interactive() {
  const [selected, setSelected] = useState<string>('None');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <CalendarHeatmap
        data={buildRecentData(120)}
        weeks={20}
        cellSize={13}
        gap={3}
        ariaLabel="Interactive activity"
        valueFormatter={(value: number) => `${value} events`}
        onDayClick={(day) => setSelected(`${formatDate(day.date)}: ${day.value} events`)}
      />
      <span>Selected day: {selected}</span>
    </div>
  );
}

export function Localized() {
  return (
    <NebularProvider locale="pt-BR" withNormalizeCSS={false} withGlobalStyles={false}>
      <CalendarHeatmap
        data={buildRecentData(84)}
        weeks={14}
        locale="pt-BR"
        ariaLabel="Atividade recente"
      />
    </NebularProvider>
  );
}
