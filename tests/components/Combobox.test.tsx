import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Combobox } from '@nebular-react/core';

const options = [
  { value: 'ignored', label: 'Apricot', disabled: true },
  { value: 'selected', label: 'Apple' },
  { value: 'other', label: 'Blueberry' }
];

describe('Combobox', () => {
  it('links the popup and active option, skips disabled options and selects by keyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Combobox aria-label="Fruit" options={options} onChange={onChange} />);
    const field = screen.getByRole('combobox', { name: 'Fruit' });

    await user.click(field);
    await user.keyboard('{ArrowDown}');
    const list = screen.getByRole('listbox');
    const apple = screen.getByRole('option', { name: 'Apple' });
    expect(field).toHaveAttribute('aria-controls', list.id);
    expect(field).toHaveAttribute('aria-activedescendant', apple.id);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('selected');
    expect(field).toHaveValue('Apple');
    expect(field).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders option content, keeps disabled options inactive and supports a controlled query', async () => {
    const user = userEvent.setup();
    const onInputChange = jest.fn();
    const onChange = jest.fn();
    const { container } = render(
      <Combobox
        aria-label="Fruit"
        options={options}
        inputValue="Ap"
        onInputChange={onInputChange}
        onChange={onChange}
        renderOption={(option) => <strong>{option.label} detail</strong>}
      />
    );
    const field = screen.getByRole('combobox');
    await user.click(field);
    expect(screen.queryByRole('option', { name: 'Blueberry' })).not.toBeInTheDocument();
    expect(screen.getByText('Apple detail')).toBeVisible();
    expect(screen.getByRole('option', { name: 'Apricot' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    fireEvent.click(screen.getByRole('option', { name: 'Apricot' }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(field, { target: { value: 'Blu' } });
    expect(onInputChange).toHaveBeenCalledWith('Blu');
    expect(field).toHaveValue('Ap');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('announces loading and links the refreshed list without accepting outdated options', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(
      <Combobox
        aria-label="Fruit"
        options={options}
        loading
        filterOption={false}
        onChange={onChange}
      />
    );
    const field = screen.getByRole('combobox');
    await user.click(field);
    expect(screen.getByRole('status')).toHaveTextContent('Loading options');
    expect(field).toHaveAttribute('aria-busy', 'true');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <Combobox aria-label="Fruit" options={options} filterOption={false} onChange={onChange} />
    );
    expect(field).toHaveAttribute('aria-controls', screen.getByRole('listbox').id);
    await user.click(screen.getByRole('option', { name: 'Blueberry' }));
    expect(onChange).toHaveBeenCalledWith('other');
    expect(field).toHaveFocus();
  });
});
