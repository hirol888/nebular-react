import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MatrixField, MatrixFieldColumn, MatrixFieldRow } from '@nebular-react/core';

const columns: MatrixFieldColumn[] = [
  { id: 'name', label: 'Product', type: 'text', required: true },
  { id: 'quantity', label: 'Quantity', type: 'number', min: 0, step: 0.5 },
  {
    id: 'unit',
    label: 'Unit',
    type: 'select',
    options: [
      { value: 'box', label: 'Box' },
      { value: 'pack', label: 'Pack' }
    ]
  },
  { id: 'enabled', label: 'Active', type: 'checkbox' }
];

const first = { id: 'A', values: { name: 'Paper', quantity: 4, unit: 'box', enabled: true } };
const second = { id: 'B', label: 'Spare', values: { name: '', quantity: null, unit: '' } };

describe('MatrixField', () => {
  it('emits typed cell edits and preserves untouched rows', async () => {
    const user = userEvent.setup();
    const changed = jest.fn();

    function Example() {
      const [rows, setRows] = useState<MatrixFieldRow[]>([first, second]);
      return (
        <MatrixField
          value={rows}
          columns={columns}
          onChange={(next) => {
            changed(next);
            setRows(next);
          }}
        />
      );
    }

    render(<Example />);

    await user.type(screen.getByRole('textbox', { name: 'Product, Spare' }), 'Ink');
    await user.type(screen.getByRole('spinbutton', { name: 'Quantity, Spare' }), '2.5');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Unit, Spare' }), 'pack');
    await user.click(screen.getByRole('checkbox', { name: 'Active, Spare' }));

    expect(changed).toHaveBeenLastCalledWith([
      first,
      { ...second, values: { name: 'Ink', quantity: 2.5, unit: 'pack', enabled: true } }
    ]);
    expect(changed.mock.lastCall?.[0][0]).toBe(first);

    await user.clear(screen.getByRole('spinbutton', { name: 'Quantity, Spare' }));
    expect(changed.mock.lastCall?.[0][1].values.quantity).toBeNull();
  });

  it('associates a visible cell error and keeps the input identity after reordering', () => {
    const props = {
      label: 'Order items',
      columns,
      onChange: jest.fn(),
      getCellError: (row: MatrixFieldRow, column: MatrixFieldColumn) =>
        row.id === 'B' && column.id === 'name' ? 'A product is required.' : undefined
    };
    const { rerender } = render(<MatrixField {...props} value={[first, second]} />);
    const element = screen.getByRole('textbox', { name: 'Product, Spare' });

    expect(element).toBeRequired();
    expect(element).toHaveAttribute('aria-invalid', 'true');
    expect(element).toHaveAccessibleDescription('A product is required.');
    rerender(<MatrixField {...props} value={[second, first]} />);
    expect(screen.getByRole('textbox', { name: 'Product, Spare' })).toBe(element);
    expect(screen.getByRole('table', { name: 'Order items' })).toBeInTheDocument();
  });

  it('adds and removes rows with keyboard, focuses a valid destination and respects limits', async () => {
    const user = userEvent.setup();

    function Example() {
      const [rows, setRows] = useState<MatrixFieldRow[]>([first]);
      return (
        <MatrixField
          value={rows}
          columns={columns}
          onChange={setRows}
          createRow={() => second}
          minRows={1}
          maxRows={2}
        />
      );
    }

    render(<Example />);
    expect(screen.getByRole('button', { name: 'Remove Row 1' })).toBeDisabled();
    const add = screen.getByRole('button', { name: 'Add row' });
    add.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox', { name: 'Product, Spare' })).toHaveFocus();
    expect(add).toBeDisabled();

    screen.getByRole('button', { name: 'Remove Spare' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('textbox', { name: 'Product, Spare' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Product, Row 1' })).toHaveFocus();
  });

  it('does not add duplicate IDs or change the matrix when disabled', async () => {
    const user = userEvent.setup();
    const changed = jest.fn();
    const props = { value: [first], columns, onChange: changed, createRow: () => first };
    const { rerender } = render(<MatrixField {...props} />);
    await user.click(screen.getByRole('button', { name: 'Add row' }));
    expect(changed).not.toHaveBeenCalled();

    rerender(<MatrixField {...props} disabled />);
    expect(screen.getByRole('button', { name: 'Remove Row 1' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Product, Row 1' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add row' })).toBeDisabled();
    expect(changed).not.toHaveBeenCalled();
  });

  it('renders a named, keyboard-scrollable table with no axe violations', async () => {
    const { container, rerender } = render(
      <MatrixField
        label="Order items"
        value={[first, second]}
        columns={columns}
        onChange={jest.fn()}
        createRow={() => ({ id: 'C', values: {} })}
      />
    );

    const viewport = screen.getByRole('region', { name: 'Order items' });
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(within(viewport).getByRole('columnheader', { name: 'Quantity' })).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();

    rerender(<MatrixField label="Order items" value={[]} columns={columns} onChange={jest.fn()} />);
    expect(screen.getByText('No rows')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add row' })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
