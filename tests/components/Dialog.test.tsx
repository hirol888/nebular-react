import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button, DialogProvider, showDialog } from '@nebular-react/core';

describe('Dialog', () => {
  it('opens a dialog with an accessible name and content', async () => {
    const user = userEvent.setup();

    render(
      <DialogProvider>
        <Button onClick={() => showDialog({ content: 'Dialog content', ariaLabel: 'Example' })}>
          Open
        </Button>
      </DialogProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));

    const dialog = await screen.findByRole('dialog', { name: 'Example' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('Dialog content');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DialogProvider>
        <div>Page content</div>
      </DialogProvider>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
