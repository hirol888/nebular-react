import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChoiceCardGroup } from '@nebular-react/core';

const options = [
  { value: 'basic', label: 'Basic', description: 'One workspace' },
  { value: 'pro', label: 'Pro', description: 'Multiple workspaces' },
  { value: 'team', label: 'Team', disabled: true }
];

it('selects radio cards by keyboard and keeps a disabled card unavailable', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <ChoiceCardGroup label="Plan" options={options} defaultValue="basic" onChange={onChange} />
  );

  const first = screen.getByRole('radio', { name: 'Basic' });
  expect(screen.getByRole('group', { name: 'Plan' })).toBeInTheDocument();
  expect(first).toHaveAccessibleDescription('One workspace');
  expect(first).toBeChecked();
  await user.tab();
  expect(first).toHaveFocus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
  expect(screen.getByRole('radio', { name: 'Team' })).toBeDisabled();
  expect(onChange).toHaveBeenLastCalledWith('pro');
});

it('reports multiple selections while respecting the controlled value', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const { rerender } = render(
    <ChoiceCardGroup multiple options={options} value={['basic']} onChange={onChange} />
  );

  await user.click(screen.getByText('Multiple workspaces'));
  expect(onChange).toHaveBeenLastCalledWith(['basic', 'pro']);
  expect(screen.getByRole('checkbox', { name: 'Pro' })).not.toBeChecked();
  rerender(
    <ChoiceCardGroup multiple options={options} value={['basic', 'pro']} onChange={onChange} />
  );
  await user.click(screen.getByRole('checkbox', { name: 'Basic' }));
  expect(onChange).toHaveBeenLastCalledWith(['pro']);
});
