import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ConflictResolutionDialog } from '@nebular-react/core';
import type { ConflictResolutionChoices, ConflictResolutionField } from '@nebular-react/core';

const fields: ConflictResolutionField[] = [
  { id: 'notes', label: 'Notes', localValue: 'My draft', savedValue: 'Saved note' },
  { id: 'status', label: 'Status', localValue: 'Pending', savedValue: 'Approved' }
];

describe('ConflictResolutionDialog', () => {
  it('shows a comparison and allows submission only after all fields are resolved', async () => {
    const user = userEvent.setup();
    const resolve = jest.fn();

    function Example() {
      const [choices, setChoices] = useState<ConflictResolutionChoices>({});
      return (
        <ConflictResolutionDialog
          opened
          fields={fields}
          choices={choices}
          onChoiceChange={(id, choice) => setChoices((current) => ({ ...current, [id]: choice }))}
          onResolve={resolve}
          onClose={() => {}}
        />
      );
    }
    render(<Example />);

    const dialog = screen.getByRole('dialog', { name: 'Resolve conflicts' });
    const notes = within(dialog).getByRole('group', { name: 'Notes' });
    const status = within(dialog).getByRole('group', { name: 'Status' });
    expect(within(notes).getByText('My draft')).toBeVisible();
    expect(within(notes).getByText('Saved note')).toBeVisible();
    const submit = within(dialog).getByRole('button', { name: 'Apply choices' });
    expect(submit).toBeDisabled();
    await user.click(within(notes).getByRole('radio', { name: 'Keep my edit' }));
    expect(submit).toBeDisabled();
    await user.click(within(status).getByRole('radio', { name: 'Keep saved value' }));
    await user.click(submit);

    expect(resolve).toHaveBeenCalledWith([
      { id: 'notes', choice: 'local', value: 'My draft' },
      { id: 'status', choice: 'saved', value: 'Approved' }
    ]);
  });

  it('keeps decisions controlled by field ID and does not apply stale fields', async () => {
    const user = userEvent.setup();
    const change = jest.fn();
    const resolve = jest.fn();
    render(
      <ConflictResolutionDialog
        opened
        fields={[fields[1]]}
        choices={{ status: 'saved', removed: 'local' }}
        onChoiceChange={change}
        onResolve={resolve}
        onClose={() => {}}
      />
    );
    const local = screen.getByRole('radio', { name: 'Keep my edit' });
    await user.click(local);
    expect(change).toHaveBeenCalledWith('status', 'local');
    expect(local).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Apply choices' }));
    expect(resolve).toHaveBeenCalledWith([{ id: 'status', choice: 'saved', value: 'Approved' }]);
  });

  it('restores focus to the opener when dismissed using the keyboard', async () => {
    const user = userEvent.setup();
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Review
          </button>
          <ConflictResolutionDialog
            opened={open}
            fields={fields}
            choices={{}}
            onChoiceChange={() => {}}
            onResolve={() => {}}
            onClose={() => setOpen(false)}
          />
        </>
      );
    }
    render(<Example />);
    const access = screen.getByRole('button', { name: 'Review' });
    await user.click(access);
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(access).toHaveFocus();
  });

  it('prevents duplicate submissions and closing while saving', async () => {
    const user = userEvent.setup();
    const close = jest.fn();
    const change = jest.fn();
    const resolve = jest.fn();
    render(
      <ConflictResolutionDialog
        opened
        fields={[fields[0]]}
        choices={{ notes: 'local' }}
        onChoiceChange={change}
        onResolve={resolve}
        onClose={close}
        submitting
      />
    );
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Apply choices' }));
    await user.click(screen.getByRole('radio', { name: 'Keep saved value' }));
    expect(close).not.toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('localizes the dialog controls and passes axe', async () => {
    render(
      <ConflictResolutionDialog
        opened
        fields={fields}
        choices={{}}
        onChoiceChange={() => {}}
        onResolve={() => {}}
        onClose={() => {}}
        labels={{ title: 'Resolver conflito', chooseLocal: 'Manter minha edição' }}
      />
    );
    const dialog = screen.getByRole('dialog', { name: 'Resolver conflito' });
    expect(within(dialog).getAllByRole('radio', { name: 'Manter minha edição' })).toHaveLength(2);
    expect(await axe(dialog)).toHaveNoViolations();
  });
});
