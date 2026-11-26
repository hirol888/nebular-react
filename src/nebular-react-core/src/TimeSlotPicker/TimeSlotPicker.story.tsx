import React, { useState } from 'react';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { TimeSlot } from './TimeSlotPicker';

export default { title: 'TimeSlotPicker', component: TimeSlotPicker };

const slots: readonly TimeSlot[] = [
  { id: 'a', start: '2025-09-15T12:00:00Z', end: '2025-09-15T12:30:00Z' },
  { id: 'b', start: '2025-09-15T13:00:00Z', end: '2025-09-15T13:30:00Z', disabled: true },
  { id: 'c', start: '2025-09-16T18:00:00Z', end: '2025-09-16T18:45:00Z' }
];

export function BookAnAppointment() {
  const [slot, select] = useState<TimeSlot>();
  return (
    <TimeSlotPicker
      slots={slots}
      value={slot?.id ?? null}
      onChange={select}
      defaultTimeZone="America/Sao_Paulo"
      timeZones={['UTC', 'America/Sao_Paulo', 'Europe/Lisbon']}
      locale="pt-BR"
      labels={{
        slots: 'Horários disponíveis',
        timeZone: 'Fuso',
        calendar: 'Selecione a data',
        unavailable: 'Nenhum horário disponível para esta data.'
      }}
      style={{ maxWidth: '48rem' }}
    />
  );
}
