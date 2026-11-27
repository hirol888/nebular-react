import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SchemaForm } from '@nebular-react/core';
import type { SchemaFormField } from '@nebular-react/core';

const fields: SchemaFormField[] = [
  { name: 'title', type: 'text', label: 'Title', required: true },
  {
    name: 'kind',
    type: 'select',
    label: 'Kind',
    options: [
      { value: 'simple', label: 'Simple' },
      { value: 'advanced', label: 'Advanced' }
    ]
  },
  {
    name: 'limit',
    type: 'number',
    label: 'Limit',
    visibleWhen: (values) => values.kind === 'advanced',
    validate: (value) => (value === 0 ? undefined : 'Enter a zero limit')
  },
  { name: 'start', type: 'date', label: 'Start date' }
];

describe('SchemaForm', () => {
  it('focuses the error summary and links back to the invalid field', async () => {
    const user = userEvent.setup();
    const submit = jest.fn();
    const { container } = render(<SchemaForm fields={fields} onSubmit={submit} />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('region', { name: 'Review the following fields' })).toHaveFocus();
    expect(submit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('link', { name: 'Title is required' }));
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveAccessibleDescription(
      'Title is required'
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('uses typed values, retains hidden drafts, and validates only visible fields', async () => {
    const user = userEvent.setup();
    const submit = jest.fn();
    render(<SchemaForm fields={fields} defaultValue={{ title: 'Reports' }} onSubmit={submit} />);

    expect(screen.queryByRole('spinbutton', { name: 'Limit' })).not.toBeInTheDocument();
    const kind = screen.getByRole('combobox', { name: 'Kind' });
    await user.selectOptions(kind, 'advanced');
    await user.type(screen.getByRole('spinbutton', { name: 'Limit' }), '0');
    await user.selectOptions(kind, 'simple');
    expect(screen.queryByRole('spinbutton', { name: 'Limit' })).not.toBeInTheDocument();
    await user.selectOptions(kind, 'advanced');
    expect(screen.getByRole('spinbutton', { name: 'Limit' })).toHaveValue(0);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(submit).toHaveBeenCalledWith({ title: 'Reports', kind: 'advanced', limit: 0 });
  });

  it('does not take focus from the field during subsequent edits', async () => {
    const user = userEvent.setup();
    render(<SchemaForm fields={fields} />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    const title = screen.getByRole('textbox', { name: 'Title' });
    await user.click(title);
    await user.type(title, 'Reports');
    expect(screen.queryByRole('region', { name: 'Review the following fields' })).toBeNull();
    await user.clear(title);
    expect(title).toHaveFocus();
  });

  it('lets a consumer render a field and control its committed value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <SchemaForm
        fields={[
          {
            name: 'code',
            label: 'Code',
            type: 'custom',
            render: ({ inputProps, value, onChange: setValue }) => (
              <input
                {...inputProps}
                value={String(value ?? '')}
                onChange={(event) => setValue(event.currentTarget.value.toUpperCase())}
              />
            )
          }
        ]}
        value={{ code: 'A' }}
        onChange={onChange}
      />
    );

    await user.type(screen.getByRole('textbox', { name: 'Code' }), 'b');
    expect(onChange).toHaveBeenCalledWith({ code: 'AB' });
    expect(screen.getByRole('textbox', { name: 'Code' })).toHaveValue('A');
  });
});
