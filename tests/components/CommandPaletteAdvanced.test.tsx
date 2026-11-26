import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CommandPalette, type CommandPaletteAction } from '@nebular-react/core';

const actions: CommandPaletteAction[] = [
  { id: 'create', label: 'Create user', group: 'People', onSelect: jest.fn() },
  { id: 'invite', label: 'Invite member', group: 'People', onSelect: jest.fn() },
  { id: 'settings', label: 'Open settings', group: 'Workspace', onSelect: jest.fn() },
  { id: 'billing', label: 'Manage billing', group: 'Workspace', onSelect: jest.fn() }
];

describe('CommandPalette advanced behavior', () => {
  it('delegates filtering to onSearch and skips local filtering', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    const serverActions = [{ id: 'server', label: 'Server result', onSelect: jest.fn() }];

    render(
      <CommandPalette opened onClose={jest.fn()} actions={serverActions} onSearch={onSearch} />
    );

    const query = screen.getByRole('combobox', { name: 'Command palette' });
    await user.type(query, 'zzz');

    expect(onSearch).toHaveBeenCalledWith('z');
    expect(onSearch).toHaveBeenLastCalledWith('zzz');
    expect(screen.getByRole('option', { name: 'Server result' })).toBeInTheDocument();
  });

  it('shows a loading status and marks the list as busy', () => {
    render(
      <CommandPalette
        opened
        onClose={jest.fn()}
        actions={[]}
        loading
        loadingMessage="Searching the workspace…"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Searching the workspace…');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('No commands found')).not.toBeInTheDocument();
  });

  it('renders grouped results with group headings', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<CommandPalette opened onClose={onClose} actions={actions} />);

    expect(screen.getByRole('group', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Workspace' })).toBeInTheDocument();

    const query = screen.getByRole('combobox', { name: 'Command palette' });
    await user.type(query, '{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');

    const firstWorkspaceAction = within(
      screen.getByRole('group', { name: 'Workspace' })
    ).getAllByRole('option')[1];
    expect(firstWorkspaceAction).toHaveAccessibleName(/Manage billing/);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows recent actions only while the query is empty and deduplicates them', async () => {
    const user = userEvent.setup();

    render(
      <CommandPalette
        opened
        onClose={jest.fn()}
        actions={actions}
        recentActions={[actions[1]]}
        recentLabel="Recent"
      />
    );

    expect(screen.getByRole('group', { name: 'Recent' })).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: /Invite member/ })).toHaveLength(1);

    const query = screen.getByRole('combobox', { name: 'Command palette' });
    await user.type(query, 'settings');

    expect(screen.queryByRole('group', { name: 'Recent' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Open settings/ })).toBeInTheDocument();
  });

  it('runs an action from the recent group', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSelect = jest.fn();

    render(
      <CommandPalette
        opened
        onClose={onClose}
        actions={[{ id: 'recent', label: 'Recent action', onSelect }]}
        recentActions={[{ id: 'recent', label: 'Recent action', onSelect }]}
      />
    );

    await user.click(screen.getByRole('option', { name: 'Recent action' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations with groups and recent items', async () => {
    const { container } = render(
      <CommandPalette opened onClose={jest.fn()} actions={actions} recentActions={[actions[0]]} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
