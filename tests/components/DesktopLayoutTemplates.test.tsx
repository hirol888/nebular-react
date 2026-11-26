import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DesktopLayoutTemplates, type DesktopLayoutTemplate } from '@nebular-react/core';

const templates: DesktopLayoutTemplate[] = [
  {
    id: 'focus',
    name: 'Focus',
    description: 'Single editor window.',
    snapshot: {
      version: 2,
      windows: [
        {
          id: 'notes',
          x: 0,
          y: 0,
          width: 400,
          height: 300,
          minimized: false,
          maximized: false,
          zIndex: 1
        }
      ]
    }
  },
  {
    id: 'support',
    name: 'Support',
    snapshot: {
      version: 2,
      windows: [
        {
          id: 'tickets',
          x: 0,
          y: 0,
          width: 400,
          height: 300,
          minimized: false,
          maximized: false,
          zIndex: 1
        },
        {
          id: 'chat',
          x: 400,
          y: 0,
          width: 400,
          height: 300,
          minimized: false,
          maximized: false,
          zIndex: 2
        }
      ]
    }
  }
];

describe('DesktopLayoutTemplates', () => {
  it('lists templates, marks the active one and applies a template', async () => {
    const user = userEvent.setup();
    const onApply = jest.fn();

    render(
      <DesktopLayoutTemplates templates={templates} activeTemplateId="focus" onApply={onApply} />
    );

    expect(screen.getByRole('heading', { name: 'Focus' })).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('2 windows')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Apply template: Support' }));

    expect(onApply).toHaveBeenCalledWith(templates[1]);
  });

  it('deletes templates and creates a new one when handlers exist', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    const onCreate = jest.fn();

    render(
      <DesktopLayoutTemplates
        templates={templates}
        onApply={() => undefined}
        onDelete={onDelete}
        onCreate={onCreate}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Delete template: Focus' }));
    await user.click(screen.getByRole('button', { name: 'Save current layout as template' }));

    expect(onDelete).toHaveBeenCalledWith(templates[0]);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state and stays accessible', async () => {
    const { container } = render(<DesktopLayoutTemplates templates={[]} />);

    expect(screen.getByText('No templates yet.')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
