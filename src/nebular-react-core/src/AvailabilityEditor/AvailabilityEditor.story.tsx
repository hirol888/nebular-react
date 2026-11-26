import React, { useState } from 'react';
import { AvailabilityEditor } from './AvailabilityEditor';
import type { AvailabilitySchedule } from './availability';

export default { title: 'AvailabilityEditor', component: AvailabilityEditor };

export function WeeklyTeamAvailability() {
  const [value, setValue] = useState<AvailabilitySchedule>({
    timeZone: 'America/Sao_Paulo',
    week: {
      monday: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '18:00' }
      ],
      friday: [{ start: '09:00', end: '16:00' }]
    },
    overrides: [{ date: '2026-12-25', intervals: [] }]
  });

  return (
    <AvailabilityEditor
      value={value}
      onChange={setValue}
      timeZones={['UTC', 'America/Sao_Paulo', 'Europe/Lisbon']}
      locale="pt-BR"
      labels={{
        timeZone: 'Fuso horário',
        week: 'Disponibilidade semanal',
        overrides: 'Exceções por data',
        overrideDate: 'Data da exceção',
        addOverride: 'Adicionar exceção',
        removeOverride: (date) => `Remover exceção de ${date}`,
        addInterval: 'Adicionar intervalo',
        removeInterval: (position) => `Remover intervalo ${position}`,
        start: (position) => `Início ${position}`,
        end: (position) => `Fim ${position}`,
        unavailable: 'Indisponível',
        midnightHint: 'Use 00:00 para terminar o intervalo à meia-noite do mesmo dia.',
        errors: {
          timeZone: 'Escolha um fuso horário válido.',
          time: 'Preencha os horários de início e fim.',
          order: 'O início deve vir antes do fim.',
          overlap: 'Há intervalos sobrepostos.',
          date: 'Escolha uma data válida.',
          duplicateDate: 'Já existe uma exceção para essa data.'
        }
      }}
      style={{ maxWidth: '38rem' }}
    />
  );
}
