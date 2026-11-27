import React from 'react';
import { AuditTrail, AuditTrailGroup, AuditTrailLabels } from './AuditTrail';

export default { title: 'AuditTrail', component: AuditTrail };

const groups: AuditTrailGroup[] = [
  {
    id: '2025-10-06',
    label: '6 de outubro de 2025',
    entries: [
      {
        id: 'approved',
        title: 'Fatura aprovada',
        actor: 'Ana Costa',
        dateTime: '2025-10-06T14:40:00-03:00',
        timeLabel: '14:40 BRT',
        description: 'A conciliação foi concluída.',
        changes: [
          { id: 'status', label: 'Status', before: 'Pendente', after: 'Aprovada' },
          { id: 'account', label: 'Conta', before: 'Operações', after: 'Financeiro' }
        ]
      },
      {
        id: 'reviewed',
        title: 'Fatura revisada',
        actor: 'João Lima',
        dateTime: '2025-10-06T13:31:00-03:00',
        timeLabel: '13:31 BRT'
      }
    ]
  },
  {
    id: '2025-10-03',
    label: '3 de outubro de 2025',
    entries: [
      {
        id: 'created',
        title: 'Fatura cadastrada',
        actor: 'Integração contábil',
        dateTime: '2025-10-03T08:10:00-03:00',
        timeLabel: '08:10 BRT'
      }
    ]
  }
];

const labels: AuditTrailLabels = {
  trail: 'Histórico da fatura',
  empty: 'Nenhum evento para exibir.',
  showChanges: 'Ver alterações',
  hideChanges: 'Fechar alterações',
  before: 'Antes',
  after: 'Depois'
};

export function Showcase() {
  return (
    <div style={{ width: '100%', maxWidth: 800 }}>
      <AuditTrail groups={groups} labels={labels} headingLevel={2} />
    </div>
  );
}

export function Mobile() {
  return (
    <div style={{ width: '100%', maxWidth: 390 }}>
      <AuditTrail groups={groups} labels={labels} headingLevel={2} />
    </div>
  );
}
