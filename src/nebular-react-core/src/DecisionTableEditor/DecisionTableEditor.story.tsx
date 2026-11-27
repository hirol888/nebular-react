import React from 'react';
import { DecisionTableEditor } from './DecisionTableEditor';
import type { DecisionTableField, DecisionTableRule } from './decision-table';

export default { title: 'DecisionTableEditor', component: DecisionTableEditor };

const fields: DecisionTableField[] = [
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'partner', label: 'Existing partner', type: 'boolean' }
];

const outcomes: DecisionTableField[] = [
  {
    key: 'action',
    label: 'Action',
    type: 'select',
    options: [
      { value: 'review', label: 'Request review' },
      { value: 'approve', label: 'Approve' }
    ]
  }
];

const rules: DecisionTableRule[] = [
  {
    id: 'review',
    conditions: { amount: { operator: 'gte', value: '500' } },
    outcomes: { action: 'review' }
  },
  {
    id: 'approve',
    conditions: { partner: { operator: 'equals', value: 'true' } },
    outcomes: { action: 'approve' }
  }
];

export function RoutingRules() {
  return <DecisionTableEditor fields={fields} outcomes={outcomes} defaultValue={rules} />;
}
