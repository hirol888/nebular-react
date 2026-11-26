import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { OnboardingChecklist } from '@nebular-react/core';
import type { OnboardingChecklistTask } from '@nebular-react/core';

const tasks: OnboardingChecklistTask[] = [
  {
    id: 'profile',
    title: 'Set up your profile',
    status: 'completed',
    action: { type: 'link', href: '/profile', label: 'View profile' }
  },
  { id: 'team', title: 'Invite the team', status: 'in-progress' },
  {
    id: 'tour',
    title: 'Explore the workspace',
    action: {
      type: 'tour',
      label: 'Start tour',
      steps: [{ title: 'Welcome', content: 'This is your workspace.' }],
      completeOnFinish: true
    }
  }
];

describe('OnboardingChecklist', () => {
  it('shows progress and invokes the consumer when the status changes', async () => {
    function Example() {
      const [current, setCurrent] = useState(tasks);
      return (
        <OnboardingChecklist
          tasks={current}
          onTaskStatusChange={(id, status) =>
            setCurrent((previous) =>
              previous.map((task) => (task.id === id ? { ...task, status } : task))
            )
          }
        />
      );
    }

    const user = userEvent.setup();
    const { container } = render(<Example />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('link', { name: 'View profile' })).toHaveAttribute('href', '/profile');
    expect(await axe(container)).toHaveNoViolations();

    const team = screen.getByText('Invite the team').closest('li')!;
    await user.click(within(team).getByRole('button', { name: 'Mark complete' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    await user.click(within(team).getByRole('button', { name: 'Mark incomplete' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  it('starts a tour and only requests completion when it finishes', async () => {
    const user = userEvent.setup();
    const change = jest.fn();
    render(<OnboardingChecklist tasks={tasks} onTaskStatusChange={change} />);
    const trigger = screen.getByRole('button', { name: 'Start tour' });

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('This is your workspace.');
    await user.click(within(dialog).getByRole('button', { name: 'Finish' }));
    expect(change).toHaveBeenCalledWith('tour', 'completed');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  it('handles no tasks and disables the actions of a disabled task', () => {
    const { rerender } = render(
      <OnboardingChecklist tasks={[]} labels={{ empty: 'Tudo pronto' }} />
    );
    expect(screen.getByText('Tudo pronto')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    rerender(<OnboardingChecklist tasks={[{ ...tasks[0], disabled: true }]} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View profile' })).toBeDisabled();
  });
});
