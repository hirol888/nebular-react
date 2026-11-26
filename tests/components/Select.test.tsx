import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Select } from '@nebular-react/core';

const options = [
  { type: 'option' as const, label: 'Alpha', value: 'alpha' },
  { type: 'option' as const, label: 'Beta', value: 'beta' }
];

describe('Select', () => {
  it('opens the listbox and selects an option', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<Select options={options} placeholder="Choose" onSelect={onSelect} />);

    const trigger = screen.getByRole('button', { name: 'Choose' });
    await user.click(trigger);

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Alpha' }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'alpha' }));
  });

  it('clears the selection when clearable', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Select
        options={options}
        defaultSelected="alpha"
        clearable
        onSelect={onSelect}
        placeholder="Choose"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('shows a loading state', async () => {
    const user = userEvent.setup();

    render(<Select options={options} loading placeholder="Choose" />);

    await user.click(screen.getByRole('button', { name: 'Choose' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Loading options');
  });

  it('shows the empty state when there are no options', async () => {
    const user = userEvent.setup();

    render(<Select options={[]} nothingFoundMessage="Nothing here" placeholder="Choose" />);

    await user.click(screen.getByRole('button', { name: 'Choose' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Nothing here');
  });

  it('filters options locally when searchable', async () => {
    const user = userEvent.setup();

    render(<Select options={options} searchable placeholder="Choose" />);

    await user.click(screen.getByRole('button', { name: 'Choose' }));
    const search = await screen.findByRole('searchbox');

    await user.type(search, 'bet');

    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();
  });

  it('supports async search without local filtering', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();

    const { rerender } = render(
      <Select options={options} searchable onSearchChange={onSearchChange} placeholder="Choose" />
    );

    await user.click(screen.getByRole('button', { name: 'Choose' }));
    const search = await screen.findByRole('searchbox');

    await user.type(search, 'be');

    expect(onSearchChange).toHaveBeenLastCalledWith('be');
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();

    rerender(
      <Select
        options={options}
        searchable
        loading
        onSearchChange={onSearchChange}
        placeholder="Choose"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading options');
  });

  it('accepts a custom filter', async () => {
    const user = userEvent.setup();

    render(
      <Select
        options={options}
        searchable
        filterOption={(option, query) => option.value === query}
        nothingFoundMessage="Nothing here"
        placeholder="Choose"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Choose' }));
    const search = await screen.findByRole('searchbox');

    await user.type(search, 'alpha');

    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Beta' })).not.toBeInTheDocument();
  });

  it('navigates only the filtered options with the keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(<Select options={options} searchable placeholder="Choose" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Choose' }));
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'bet');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute(
      'data-active',
      'true'
    );

    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'beta' }));
  });

  it('virtualizes long option lists and renders only the visible window', async () => {
    const user = userEvent.setup();
    const longOptions = Array.from({ length: 1000 }, (_, index) => ({
      type: 'option' as const,
      label: `Option ${index}`,
      value: String(index)
    }));

    render(
      <Select
        options={longOptions}
        placeholder="Choose"
        virtualized
        virtualizedMaxHeight={300}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Choose' }));
    await screen.findByRole('listbox');

    expect(screen.getAllByRole('option').length).toBeLessThan(50);

    fireEvent.scroll(screen.getByRole('listbox'), { target: { scrollTop: 3600 } });

    expect(await screen.findByRole('option', { name: 'Option 100' })).toBeInTheDocument();
  });

  it('navigates grouped and filtered options by keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const groupedOptions = Array.from({ length: 3 }, (_group, groupIndex) => ({
      type: 'group' as const,
      label: `Group ${groupIndex}`,
      options: Array.from({ length: 10 }, (_option, optionIndex) => ({
        type: 'option' as const,
        label: `Option ${groupIndex * 10 + optionIndex}`,
        value: String(groupIndex * 10 + optionIndex)
      }))
    }));

    render(
      <Select
        options={groupedOptions}
        searchable
        virtualized
        placeholder="Choose"
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Choose' }));
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'Option 25');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Option 25' })).toHaveAttribute(
      'data-active',
      'true'
    );

    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: '25' }));
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Select options={options} defaultSelected="alpha" searchable placeholder="Choose" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
