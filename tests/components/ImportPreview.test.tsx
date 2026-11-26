import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ImportPreview } from '@nebular-react/core';
import type {
  ImportPreviewColumn,
  ImportPreviewField,
  ImportPreviewProps,
  ImportPreviewRow
} from '@nebular-react/core';

const columns: ImportPreviewColumn[] = [
  { id: 'name_col', label: 'Customer name' },
  { id: 'email_col', label: 'E-mail address' },
  { id: 'subscribed_col', label: 'Subscribed' },
  { id: 'count_col', label: 'Order count' }
];
const fields: ImportPreviewField[] = [
  { id: 'name', label: 'Name', required: true },
  { id: 'email', label: 'E-mail' },
  { id: 'subscribed', label: 'Subscription' }
];
const rows: ImportPreviewRow[] = [
  { id: 'a16', cells: { name_col: 'Ana', email_col: 'ana@example.test', subscribed_col: false } },
  { id: 'c2', cells: { name_col: 'Beatriz', count_col: 0 } }
];

function preview(props: Partial<ImportPreviewProps> = {}) {
  return (
    <ImportPreview
      columns={columns}
      fields={fields}
      rows={rows}
      mapping={{ name: 'name_col', email: 'email_col' }}
      onMappingChange={jest.fn()}
      onConfirm={jest.fn()}
      {...props}
    />
  );
}

describe('ImportPreview', () => {
  it('shows source headers and values in their original order, including false and zero', () => {
    render(preview());

    const grid = screen.getByRole('region', { name: 'Import preview' });
    expect(within(grid).getByRole('columnheader', { name: 'Customer name' })).toBeVisible();
    expect(within(grid).getByRole('cell', { name: 'false' })).toBeVisible();
    expect(within(grid).getByRole('cell', { name: '0' })).toBeVisible();
    const recordRows = within(grid).getAllByRole('row').slice(1);
    expect(recordRows[0]).toHaveTextContent('Ana');
    expect(recordRows[1]).toHaveTextContent('Beatriz');
  });

  it('requests controlled mapping changes and can clear an optional mapping', async () => {
    const user = userEvent.setup();
    const onMappingChange = jest.fn();
    const { rerender } = render(preview({ onMappingChange }));
    const field = screen.getByRole('combobox', { name: 'E-mail' });

    await user.selectOptions(field, 'count_col');
    expect(onMappingChange).toHaveBeenLastCalledWith({ name: 'name_col', email: 'count_col' });
    expect(field).toHaveValue('email_col');

    rerender(preview({ onMappingChange, mapping: { name: 'name_col', email: 'count_col' } }));
    expect(field).toHaveValue('count_col');
    await user.selectOptions(field, '');
    expect(onMappingChange).toHaveBeenLastCalledWith({ name: 'name_col' });
  });

  it('explains required, unknown and duplicate mappings and prevents confirmation', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const { rerender } = render(preview({ mapping: {}, onConfirm }));
    const button = screen.getByRole('button', { name: 'Confirm import' });
    const name = screen.getByRole('combobox', { name: 'Name' });

    expect(name).toHaveAccessibleDescription('Map a source column for this required field.');
    expect(button).toBeDisabled();

    rerender(preview({ mapping: { name: 'missing' }, onConfirm }));
    expect(name).toHaveAccessibleDescription('The mapped source column is unavailable.');
    expect(button).toBeDisabled();

    rerender(preview({ mapping: { name: 'name_col', email: 'name_col' }, onConfirm }));
    expect(name).toHaveAccessibleDescription('This source column is mapped more than once.');
    await user.click(button);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('blocks confirmation for errors outside the currently visible page', () => {
    render(
      preview({
        rows: [rows[0], { ...rows[1], errors: ['Duplicate account'] }],
        pageSize: 1
      })
    );

    expect(screen.getByText('1 row has validation errors.')).toBeVisible();
    expect(screen.queryByText('Duplicate account')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm import' })).toBeDisabled();
  });

  it('shows supplied row errors and can proceed after the application resolves them', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const mapping = { name: 'name_col', email: 'email_col' };
    const { rerender } = render(
      preview({ rows: [{ ...rows[0], errors: ['Invalid e-mail address'] }], mapping, onConfirm })
    );

    const grid = screen.getByRole('region', { name: 'Import preview' });
    expect(within(grid).getByText('Invalid e-mail address')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Confirm import' })).toBeDisabled();

    rerender(preview({ rows, mapping, onConfirm }));
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Confirm import' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const [payload] = onConfirm.mock.calls[0];
    expect(payload.mapping).toBe(mapping);
    expect(payload.rows).toBe(rows);
  });

  it('marks the progress state and disables mapping and submission until it finishes', () => {
    const { rerender } = render(preview({ confirming: true }));

    expect(screen.getByRole('button', { name: 'Confirming…' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Name' })).toBeDisabled();
    rerender(preview({ disabled: true }));
    expect(screen.getByRole('button', { name: 'Confirm import' })).toBeDisabled();
  });

  it('prevents submitting an empty batch and localizes its controls', async () => {
    const { container } = render(
      preview({ rows: [], labels: { noRows: 'Nenhum registro', confirm: 'Importar registros' } })
    );

    expect(screen.getByText('Nenhum registro')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Importar registros' })).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes the accessibility audit with its mapping errors and populated grid', async () => {
    const { container } = render(preview({ mapping: {} }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
