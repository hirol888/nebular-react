import React, { useState } from 'react';
import { DateField } from './DateField';

export default { title: 'DateField', component: DateField };

export function Showcase() {
  const [date, setDate] = useState<string | null>('2024-02-29');

  return (
    <div style={{ display: 'grid', gap: '1.25rem', maxWidth: '28rem' }}>
      <DateField
        label="Check-in"
        description="Use the up and down arrows to change each segment."
        value={date}
        onChange={setDate}
        locale="en-US"
      />
      <DateField
        label="Check-in in Japanese order"
        value={date}
        onChange={setDate}
        locale="ja-JP"
      />
    </div>
  );
}

export function Mobile() {
  return (
    <div style={{ maxWidth: 288 }}>
      <DateField
        label="Data do agendamento"
        description="Selecione uma data de 2026."
        defaultValue="2026-05-31"
        min="2026-01-01"
        max="2026-12-31"
        locale="pt-BR"
        name="scheduledDate"
        required
        segmentLabels={{ day: 'Dia', month: 'Mês', year: 'Ano' }}
        segmentPlaceholders={{ year: 'AAAA' }}
        messages={{
          bounds: 'Selecione uma data de 2026.',
          incomplete: 'Preencha dia, mês e ano.',
          invalid: 'Informe uma data válida.',
          required: 'Informe a data do agendamento.'
        }}
      />
    </div>
  );
}
