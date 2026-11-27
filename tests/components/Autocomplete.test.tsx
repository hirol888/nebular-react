import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Autocomplete } from '@nebular-react/core';

describe('Autocomplete', () => {
  it('opens the list and reports the selected value', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Autocomplete data={['Alpha', 'Beta']} aria-label="Search" onChange={onChange} />
    );

    const input = screen.getByLabelText('Search');
    await user.click(input);

    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await user.click(screen.getByRole('option', { name: 'Alpha' }));

    expect(onChange).toHaveBeenCalledWith('Alpha');
  });

  it('filters options locally by default', async () => {
    const user = userEvent.setup();

    render(<Autocomplete data={['Alpha', 'Beta']} aria-label="Search" />);

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    await user.type(input, 'bet');

    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();
  });

  it('supports async search and loading state', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();

    const { rerender } = render(
      <Autocomplete data={['Alpha', 'Beta']} aria-label="Search" onSearchChange={onSearchChange} />
    );

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    await user.type(input, 'be');

    expect(onSearchChange).toHaveBeenLastCalledWith('be');
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();

    rerender(
      <Autocomplete
        data={['Beta']}
        aria-label="Search"
        loading
        onSearchChange={onSearchChange}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading options');
  });

  it('shows the empty state when there are no matches', async () => {
    const user = userEvent.setup();

    render(
      <Autocomplete data={['Alpha']} aria-label="Search" nothingFoundMessage="Nothing here" />
    );

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    await user.type(input, 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('Nothing here');
  });

  it('navigates only the filtered options with the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Autocomplete data={['Alpha', 'Beta']} aria-label="Search" onChange={onChange} />);

    const input = screen.getByLabelText('Search');
    await user.click(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));

    await user.type(input, 'bet');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute(
      'data-active',
      'true'
    );

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('Beta');
  });

  it('virtualizes long option lists and renders only the visible window', async () => {
    const user = userEvent.setup();
    const longData = Array.from({ length: 1000 }, (_, index) => `Option ${index}`);

    render(
      <Autocomplete
        data={longData}
        aria-label="Search"
        virtualized
        virtualizedMaxHeight={300}
      />
    );

    await user.click(screen.getByLabelText('Search'));
    await screen.findByRole('listbox');

    expect(screen.getAllByRole('option').length).toBeLessThan(50);

    fireEvent.scroll(screen.getByRole('listbox'), { target: { scrollTop: 3600 } });

    expect(await screen.findByRole('option', { name: 'Option 100' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Autocomplete data={['Alpha']} aria-label="Search" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
