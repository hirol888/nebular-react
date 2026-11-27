import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Button,
  CommandPalette,
  ConfirmDialog,
  Drawer,
  HoverCard,
  Transfer,
  Tree
} from '@nebular-react/core';

describe('new overlay and data components', () => {
  it('Drawer opens, closes and handles Escape', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const { rerender } = render(
      <Drawer opened onClose={onClose} title="Filters">
        Drawer body
      </Drawer>
    );

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Drawer body')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close drawer' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);

    rerender(
      <Drawer opened={false} onClose={onClose} title="Filters">
        Drawer body
      </Drawer>
    );
    expect(screen.queryByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument();
  });

  it('ConfirmDialog calls cancel and confirm handlers', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    const { rerender } = render(
      <ConfirmDialog
        opened
        title="Delete record?"
        message="This action cannot be undone."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('alertdialog', { name: 'Delete record?' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <ConfirmDialog
        opened
        title="Delete record?"
        message="This action cannot be undone."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('CommandPalette filters actions and runs the selected action', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSettings = jest.fn();

    render(
      <CommandPalette
        opened
        onClose={onClose}
        actions={[
          { id: 'new', label: 'Create user', onSelect: jest.fn() },
          {
            id: 'settings',
            label: 'Open settings',
            keywords: ['preferences'],
            onSelect: onSettings
          }
        ]}
      />
    );

    const search = screen.getByRole('combobox');
    await user.type(search, 'pref');

    expect(screen.getByRole('option', { name: /Open settings/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Create user/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: /Open settings/ }));

    expect(onSettings).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('HoverCard opens on hover', async () => {
    const { container } = render(
      <HoverCard content="Profile details" ariaLabel="Profile card">
        <Button>Hover me</Button>
      </HoverCard>
    );

    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);

    expect(await screen.findByRole('dialog', { name: 'Profile card' })).toHaveTextContent(
      'Profile details'
    );
  });

  it('Transfer moves checked items to the other panel', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Transfer
        defaultValue={['write']}
        onChange={onChange}
        data={[
          { value: 'read', label: 'Read' },
          { value: 'write', label: 'Write' }
        ]}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Read' }));
    await user.click(screen.getByRole('button', { name: 'Move selected to the right' }));

    expect(onChange).toHaveBeenLastCalledWith(['write', 'read']);
    expect(screen.getByRole('checkbox', { name: 'Read' })).toBeInTheDocument();
  });

  it('Tree expands, collapses and selects nodes', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(
      <Tree
        ariaLabel="Permissions"
        defaultExpandedValues={['users']}
        onSelectionChange={onSelectionChange}
        data={[
          {
            value: 'users',
            label: 'Users',
            children: [{ value: 'alice', label: 'Alice Johnson' }]
          }
        ]}
      />
    );

    expect(screen.getByRole('treeitem', { name: 'Alice Johnson' })).toBeInTheDocument();

    await user.click(screen.getByRole('treeitem', { name: 'Alice Johnson' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['alice']);
    expect(screen.getByRole('treeitem', { name: 'Alice Johnson' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await user.click(screen.getByRole('button', { name: 'Collapse Users' }));
    expect(screen.queryByRole('treeitem', { name: 'Alice Johnson' })).not.toBeInTheDocument();
  });

  it('has no accessibility violations with Drawer and Tree', async () => {
    render(
      <div>
        <Drawer opened onClose={jest.fn()} title="Filters">
          Drawer body
        </Drawer>
        <Tree
          ariaLabel="Permissions"
          defaultExpandedValues={['users']}
          data={[{ value: 'users', label: 'Users', children: [] }]}
        />
      </div>
    );

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations();
    expect(await axe(screen.getByRole('tree'))).toHaveNoViolations();
  });
});
