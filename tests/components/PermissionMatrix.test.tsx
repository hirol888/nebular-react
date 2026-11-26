import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { PermissionMatrix, PermissionMatrixValue } from '@nebular-react/core';

const resources = [
  { id: 'orders', label: 'Orders' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'reports', label: 'Reports', disabled: true }
];
const actions = [
  { id: 'view', label: 'View' },
  { id: 'approve', label: 'Approve' },
  { id: 'archive', label: 'Archive', disabled: true }
];
const value: PermissionMatrixValue = {
  orders: {
    view: { source: 'inherited', allowed: true },
    approve: { source: 'partial' },
    archive: { source: 'explicit', allowed: true }
  },
  invoices: {
    view: { source: 'explicit', allowed: false, disabled: true },
    archive: { source: 'inherited', allowed: false }
  }
};

describe('PermissionMatrix', () => {
  it('renders resource and action headers and names each permission', () => {
    render(<PermissionMatrix resources={resources} actions={actions} value={value} />);

    const table = screen.getByRole('table', { name: 'Permissions' });
    expect(within(table).getByRole('rowheader', { name: 'Orders' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'View — Orders' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'View — Orders' })).toHaveAccessibleDescription(
      'Inherited: allowed'
    );
    expect(screen.getByRole('checkbox', { name: 'Approve — Orders' })).toBePartiallyChecked();
    expect(screen.getByRole('checkbox', { name: 'Approve — Orders' })).toHaveAccessibleDescription(
      'Partial'
    );
    expect(
      screen.getByRole('checkbox', { name: 'Approve — Invoices' })
    ).toHaveAccessibleDescription('Not set');
    expect(
      screen.getByRole('checkbox', { name: 'Archive — Invoices' })
    ).toHaveAccessibleDescription('Inherited: denied');
  });

  it('requests an explicit change by keyboard and renders the value supplied by the caller', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const matrix = (nextValue: PermissionMatrixValue) => (
      <PermissionMatrix
        resources={resources}
        actions={actions}
        value={nextValue}
        onChange={onChange}
      />
    );
    const { rerender } = render(matrix(value));
    const permission = screen.getByRole('checkbox', { name: 'Approve — Orders' });

    permission.focus();
    await user.keyboard(' ');

    expect(onChange).toHaveBeenCalledWith({
      resourceId: 'orders',
      actionId: 'approve',
      allowed: true
    });
    expect(permission).toBePartiallyChecked();
    rerender(
      matrix({
        ...value,
        orders: { ...value.orders, approve: { source: 'explicit', allowed: true } }
      })
    );
    expect(permission).toBeChecked();
    expect(permission).toHaveAccessibleDescription('Allowed');
    expect(permission).toHaveFocus();
  });

  it('disables individual, resource, action and read-only permissions', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(
      <PermissionMatrix resources={resources} actions={actions} value={value} onChange={onChange} />
    );

    for (const name of ['View — Invoices', 'View — Reports', 'Archive — Orders']) {
      expect(screen.getByRole('checkbox', { name })).toBeDisabled();
    }
    await user.click(screen.getByRole('checkbox', { name: 'View — Invoices' }));
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <PermissionMatrix
        resources={resources}
        actions={actions}
        value={value}
        readOnly
        onChange={onChange}
      />
    );
    expect(screen.getByRole('checkbox', { name: 'View — Orders' })).toBeDisabled();
  });

  it('keeps the viewport in the keyboard order in read-only mode', async () => {
    const user = userEvent.setup();
    render(<PermissionMatrix resources={resources} actions={actions} value={value} readOnly />);

    await user.tab();
    expect(screen.getByRole('region', { name: 'Permissions' })).toHaveFocus();
  });

  it('supports localized labels and an empty state', () => {
    render(
      <PermissionMatrix
        resources={[]}
        actions={actions}
        value={{}}
        labels={{ empty: 'Nenhum recurso' }}
      />
    );

    expect(screen.getByText('Nenhum recurso')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('has no accessibility violations with an editable matrix', async () => {
    const { container } = render(
      <PermissionMatrix
        resources={resources}
        actions={actions}
        value={value}
        onChange={jest.fn()}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
