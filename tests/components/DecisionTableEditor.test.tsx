import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DecisionTableEditor, evaluateDecisionTable } from '@nebular-react/core';
import type { DecisionTableRule } from '@nebular-react/core';

const fields = [{ key: 'amount', label: 'Amount', type: 'number' as const }];
const outcomes = [{ key: 'action', label: 'Action' }];
const rules: DecisionTableRule[] = [
  {
    id: 'review',
    conditions: { amount: { operator: 'gte', value: '100' } },
    outcomes: { action: 'Review' }
  },
  { id: 'allow', conditions: {}, outcomes: { action: 'Allow' } }
];

it('uses the configured hit policy and ignores incomplete rules in its local evaluator', () => {
  const incomplete: DecisionTableRule = {
    id: 'draft',
    conditions: { amount: { operator: 'gt' } },
    outcomes: { action: 'Other' }
  };
  const context = { fields, outcomes, rules: [incomplete, ...rules] };
  expect(
    evaluateDecisionTable({ amount: 110 }, { ...context, hitPolicy: 'first' }).matches
  ).toEqual([rules[0]]);
  expect(evaluateDecisionTable({ amount: 110 }, { ...context, hitPolicy: 'unique' }).status).toBe(
    'multiple-matches'
  );
  expect(
    evaluateDecisionTable({ amount: 80 }, { ...context, hitPolicy: 'collect' }).matches
  ).toEqual([rules[1]]);
});

it('compares select conditions by their exact option identity', () => {
  const context = {
    fields: [
      {
        key: 'department',
        label: 'Department',
        type: 'select' as const,
        options: [
          { value: '1', label: 'First' },
          { value: '01', label: 'Special' }
        ]
      }
    ],
    outcomes,
    rules: [
      {
        id: 'one',
        conditions: { department: { operator: 'equals' as const, value: '1' } },
        outcomes: { action: 'Review' }
      }
    ],
    hitPolicy: 'first' as const
  };
  expect(evaluateDecisionTable({ department: '01' }, context).status).toBe('no-match');
  expect(evaluateDecisionTable({ department: '1' }, context).status).toBe('matched');
});

it('edits an outcome, reorders rules, and displays the first matching outcome', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <DecisionTableEditor
      fields={fields}
      outcomes={outcomes}
      defaultValue={rules}
      onChange={onChange}
    />
  );
  const firstOutcome = screen.getByRole('textbox', { name: 'Rule 1: Action' });
  await user.clear(firstOutcome);
  await user.type(firstOutcome, 'Escalate');
  expect(onChange).toHaveBeenLastCalledWith([
    { ...rules[0], outcomes: { action: 'Escalate' } },
    rules[1]
  ]);
  await user.type(screen.getByRole('spinbutton', { name: 'Example: Amount' }), '110');
  await user.click(screen.getByRole('button', { name: 'Test rules' }));
  expect(await screen.findByText('Escalate', { selector: 'dd' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Move rule 2 up' }));
  await user.click(screen.getByRole('button', { name: 'Test rules' }));
  expect(await screen.findByText('Allow', { selector: 'dd' })).toBeInTheDocument();
});
