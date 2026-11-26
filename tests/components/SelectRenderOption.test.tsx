import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Option, Select } from '@nebular-react/core';

const options: Option[] = [
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

describe('Select renderOption', () => {
  it('renders custom option content while keeping the accessible name from the label', async () => {
    const user = userEvent.setup();

    render(<Select options={options} placeholder="Choose" renderOption={renderOption} />);

    await user.click(screen.getByRole('button', { name: 'Choose' }));

    const alpha = await screen.findByRole('option', { name: 'Alpha' });

    expect(alpha).toHaveTextContent('*');
    expect(alpha).toHaveTextContent('Alpha - alpha role');
    expect(screen.queryByRole('option', { name: 'Alpha - alpha role' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
  });

  it('keeps local search, keyboard navigation and selection working', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Select
        options={options}
        searchable
        placeholder="Choose"
        renderOption={renderOption}
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Choose' }));
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'bet');

    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'beta' }));
  });

  it('shows the textual label on the trigger after selecting a custom option', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <Select
        options={options}
        placeholder="Choose"
        renderOption={renderOption}
        onSelect={onSelect}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Choose' });
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: 'Alpha' }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'alpha' }));
    expect(trigger).toHaveTextContent('Alpha');
    expect(trigger).not.toHaveTextContent('role');
    expect(trigger).toHaveAccessibleName('Alpha');
  });

  it('renders custom options inside option groups', async () => {
    const user = userEvent.setup();
    const groupedOptions: (Option | { type: 'group'; label: string; options: Option[] })[] = [
      {
        type: 'group',
        label: 'Group 1',
        options: [
          { type: 'option', label: 'Alpha', value: 'alpha' },
          { type: 'option', label: 'Beta', value: 'beta' }
        ]
      }
    ];

    render(<Select options={groupedOptions} placeholder="Choose" renderOption={renderOption} />);

    await user.click(screen.getByRole('button', { name: 'Choose' }));

    const alpha = await screen.findByRole('option', { name: 'Alpha' });

    expect(alpha).toHaveTextContent('Alpha - alpha role');
    expect(screen.getByRole('group', { name: 'Group 1' })).toContainElement(alpha);
  });

  it('has no accessibility violations with custom options', async () => {
    const user = userEvent.setup();

    render(
      <Select
        options={options}
        defaultSelected={{ type: 'option', label: 'Alpha', value: 'alpha' }}
        searchable
        placeholder="Choose"
        renderOption={renderOption}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Alpha' }));
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
