import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Autocomplete, Option } from '@nebular-react/core';

const data: Option[] = [
  { type: 'option', label: 'Alpha', value: 'alpha' },
  { type: 'option', label: 'Beta', value: 'beta' }
];

const renderOption = (option: Option) => (
  <span>
    <span aria-hidden="true">*</span>
    <strong>{option.label}</strong>
    <span> - {option.value} role</span>
  </span>
);

describe('Autocomplete renderOption', () => {
  it('renders custom option content while keeping the accessible name from the label', async () => {
    const user = userEvent.setup();

    render(<Autocomplete data={data} aria-label="Search" renderOption={renderOption} />);

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    const alpha = screen.getByRole('option', { name: 'Alpha' });

    expect(alpha).toHaveTextContent('*');
    expect(alpha).toHaveTextContent('Alpha - alpha role');
    expect(screen.queryByRole('option', { name: 'Alpha - alpha role' })).not.toBeInTheDocument();
  });

  it('keeps local filtering, keyboard navigation and selection working', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Autocomplete
        data={data}
        aria-label="Search"
        renderOption={renderOption}
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    await user.type(input, 'bet');

    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('beta');
    expect(input).toHaveValue('beta');
  });

  it('shows the label through displayFn after selecting a custom option', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Autocomplete
        data={data}
        aria-label="Search"
        displayFn={(value) => value.toUpperCase()}
        renderOption={renderOption}
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await user.click(screen.getByRole('option', { name: 'Beta' }));

    expect(onChange).toHaveBeenCalledWith('beta');
    expect(input).toHaveValue('BETA');
  });

  it('keeps async search working with custom options', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();

    const { rerender } = render(
      <Autocomplete
        data={data}
        aria-label="Search"
        onSearchChange={onSearchChange}
        renderOption={renderOption}
      />
    );

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    await user.type(input, 'be');

    expect(onSearchChange).toHaveBeenLastCalledWith('be');
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();

    rerender(
      <Autocomplete
        data={[{ type: 'option', label: 'Beta', value: 'beta' }]}
        aria-label="Search"
        onSearchChange={onSearchChange}
        renderOption={renderOption}
      />
    );

    expect(screen.getByRole('option', { name: 'Beta' })).toHaveTextContent('Beta - beta role');
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();
  });

  it('has no accessibility violations with custom options', async () => {
    const user = userEvent.setup();

    render(<Autocomplete data={data} aria-label="Search" renderOption={renderOption} />);

    await user.click(screen.getByLabelText('Search'));
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
