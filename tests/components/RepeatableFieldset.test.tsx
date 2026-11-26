import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { RepeatableFieldset } from '@nebular-react/core';

interface Contact {
  id: string;
  name: string;
}

const contact = { id: 'one', name: 'Alice' };

function Contacts({ minItems = 0 }: { minItems?: number }) {
  const [items, setItems] = useState<Contact[]>([contact]);

  return (
    <RepeatableFieldset
      legend="Contacts"
      items={items}
      getItemKey={(item) => item.id}
      createItem={() => ({ id: 'two', name: '' })}
      onChange={setItems}
      minItems={minItems}
      maxItems={2}
      renderItem={({ item, onChange, inputId }) => (
        <label htmlFor={inputId}>
          Name
          <input
            id={inputId}
            value={item.name}
            onChange={(event) => onChange({ ...item, name: event.target.value })}
          />
        </label>
      )}
    />
  );
}

describe('RepeatableFieldset', () => {
  it('adds, edits, reorders and removes items while keeping the focus and field identity', async () => {
    const user = userEvent.setup();
    render(<Contacts />);

    const original = screen.getByRole('textbox', { name: 'Name' });
    const add = screen.getByRole('button', { name: 'Add item' });
    await user.click(add);
    expect(add).toBeDisabled();

    const added = within(screen.getByRole('group', { name: 'Item 2' })).getByRole('textbox');
    expect(added).toHaveFocus();
    await user.type(added, 'Bob');

    screen.getByRole('button', { name: 'Move up, item 2' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('textbox')).toEqual([added, original]);
    expect(added).toHaveValue('Bob');
    expect(screen.getByRole('button', { name: 'Move down, item 1' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    expect(original).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    expect(add).toHaveFocus();
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('enforces the minimum number of items and has no accessibility violations', async () => {
    const { container } = render(<Contacts minItems={1} />);
    expect(screen.getByRole('group', { name: 'Contacts' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('emits a proposed change without moving focus when the controlled items are unchanged', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <RepeatableFieldset
        legend="Contacts"
        items={[contact]}
        getItemKey={(item) => item.id}
        createItem={() => ({ id: 'two', name: 'Bob' })}
        onChange={onChange}
        renderItem={({ item }) => <span>{item.name}</span>}
      />
    );

    const add = screen.getByRole('button', { name: 'Add item' });
    await user.click(add);
    expect(onChange).toHaveBeenCalledWith([contact, { id: 'two', name: 'Bob' }]);
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(add).toHaveFocus();
  });
});
