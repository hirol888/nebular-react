import React, { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CommandPalette, CommandPaletteAction } from '@nebular-react/core';

function createActions(): CommandPaletteAction[] {
  return [
    { id: 'invite', label: 'Invite user', keywords: ['add', 'member'], onSelect: jest.fn() },
    {
      id: 'settings',
      label: 'Open settings',
      description: 'Workspace settings',
      icon: <span aria-hidden="true">⚙</span>,
      keywords: ['preferences', 'config'],
      onSelect: jest.fn()
    },
    { id: 'billing', label: 'Manage billing', keywords: ['invoice'], onSelect: jest.fn() }
  ];
}

function ControlledPalette({ actions }: { actions: CommandPaletteAction[] }) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpened(true)}>
        Open palette
      </button>
      <CommandPalette opened={opened} onClose={() => setOpened(false)} actions={actions} />
    </>
  );
}

describe('CommandPalette', () => {
  it('focuses the query and filters case-insensitively by action label and keyword', async () => {
    const user = userEvent.setup();
    render(<CommandPalette opened onClose={jest.fn()} actions={createActions()} />);
    const dialog = screen.getByRole('dialog', { name: 'Command palette' });
    const query = within(dialog).getByRole('combobox', { name: 'Command palette' });
    await waitFor(() => expect(query).toHaveFocus());

    await user.type(query, '  USER  ');
    expect(
      within(dialog).getByRole('option', { name: 'Invite user', selected: true })
    ).toBeVisible();
    expect(within(dialog).getAllByRole('option')).toHaveLength(1);
    await user.clear(query);
    await user.type(query, 'PREFERENCES');
    const active = within(dialog).getByRole('option', { name: /Open settings/, selected: true });
    expect(within(active).getByText('Workspace settings')).toBeVisible();
    expect(query).toHaveAttribute('aria-activedescendant', active.id);
    expect(within(dialog).getAllByRole('option')).toHaveLength(1);
  });

  it('keeps navigation within the result list and invokes the active command with Enter', async () => {
    const user = userEvent.setup();
    const actions = createActions();
    const onClose = jest.fn();
    render(<CommandPalette opened onClose={onClose} actions={actions} />);
    const query = screen.getByRole('combobox');
    await waitFor(() => expect(query).toHaveFocus());

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { name: 'Invite user', selected: true })).toBeVisible();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Manage billing', selected: true })).toBeVisible();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('option', { name: /Open settings/, selected: true })).toBeVisible();
    await user.keyboard('{Enter}');
    expect(actions[1].onSelect).toHaveBeenCalledTimes(1);
    expect(actions[0].onSelect).not.toHaveBeenCalled();
    expect(actions[2].onSelect).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('highlights a hovered option and closes after selecting it by pointer', async () => {
    const user = userEvent.setup();
    const actions = createActions();
    render(<ControlledPalette actions={actions} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    const billing = screen.getByRole('option', { name: 'Manage billing' });
    await user.hover(billing);
    expect(billing).toHaveAttribute('aria-selected', 'true');
    await user.click(billing);
    expect(actions[2].onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not invoke a command without matches, and resets search on the next open', async () => {
    const user = userEvent.setup();
    const actions = createActions();
    render(<ControlledPalette actions={actions} />);
    const trigger = screen.getByRole('button', { name: 'Open palette' });
    await user.click(trigger);

    const query = screen.getByRole('combobox');
    await user.type(query, 'unknown');
    expect(screen.getByText('No commands found')).toBeVisible();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(query).not.toHaveAttribute('aria-activedescendant');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(actions[0].onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Invite user', selected: true })).toBeVisible();
  });

  it('closes from the backdrop and exposes a named accessible dialog when opened', async () => {
    const user = userEvent.setup();
    render(<ControlledPalette actions={createActions()} />);
    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    const dialog = screen.getByRole('dialog', { name: 'Command palette' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(await axe(dialog)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: 'Close command palette' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with Escape when keyboard focus is on a command', async () => {
    const user = userEvent.setup();
    const actions = createActions();
    render(<ControlledPalette actions={actions} />);
    await user.click(screen.getByRole('button', { name: 'Open palette' }));
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());

    await user.tab();
    expect(screen.getByRole('option', { name: 'Invite user' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(actions[0].onSelect).not.toHaveBeenCalled();
  });
});
