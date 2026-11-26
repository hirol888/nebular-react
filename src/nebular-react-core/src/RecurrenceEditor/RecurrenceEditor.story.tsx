import React, { useState } from 'react';
import type { SchedulerRecurrence } from '../Scheduler';
import { RecurrenceEditor } from './RecurrenceEditor';

export default { title: 'RecurrenceEditor', component: RecurrenceEditor };

export function TeamMeeting() {
  const [rule, setRule] = useState<SchedulerRecurrence | null>({ frequency: 'weekly', count: 4 });
  return (
    <RecurrenceEditor
      value={rule}
      onChange={setRule}
      start={new Date('2027-03-10T15:00:00Z')}
      timeZone="America/New_York"
      locale="en-US"
      labels={{ legend: 'Repeating team meeting' }}
    />
  );
}

export function BillingReminder() {
  const [rule, setRule] = useState<SchedulerRecurrence | null>({
    frequency: 'monthly',
    until: '2027-12-31'
  });
  return (
    <RecurrenceEditor
      value={rule}
      onChange={setRule}
      start={new Date('2027-01-31T12:00:00Z')}
      timeZone="America/Sao_Paulo"
      locale="pt-BR"
      previewCount={3}
      labels={{
        legend: 'Lembrete de cobrança',
        frequency: 'Frequência',
        frequencies: {
          none: 'Sem repetição',
          daily: 'Diária',
          weekly: 'Semanal',
          monthly: 'Mensal'
        },
        interval: 'Intervalo',
        ends: 'Término',
        endModes: { never: 'Nunca', count: 'Após um número de ocorrências', until: 'Em uma data' },
        count: 'Número de ocorrências',
        until: 'Data final',
        preview: 'Próximas ocorrências',
        emptyPreview: 'Nenhuma ocorrência'
      }}
    />
  );
}
