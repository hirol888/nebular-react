import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MultiSelect, MultiSelectGroup } from '@nebular-react/core';

const groupedData: MultiSelectGroup[] = [
  {
    type: 'group',
    label: 'Fruits',
    options: [
      { label: 'Apple', value: 'apple' },
      { label: 'Banana', value: 'banana', disabled: true },
      { label: 'Cherry', value: 'cherry' }
    ]
  },
  {
    type: 'group',
    label: 'Vegetables',
    disabled: true,
    options: [
      { label: 'Carrot', value: 'carrot' },
      { label: 'Cucumber', value: 'cucumber' }
    ]
  },
  {
    type: 'group',
    label: 'Grains',
    options: [{ label: 'Bread', value: 'bread' }]
  }
];

describe('MultiSelect advanced', () => {
  it('MultiSelect_Groups_ShouldRenderGroupHeadersAndSkipDisabledOptions', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<MultiSelect data={groupedData} ariaLabel="Food" onChange={onChange} />);

    const combobox = screen.getByRole('combobox', { name: 'Food' });

    await user.click(combobox);

    expect(screen.getByRole('group', { name: 'Fruits' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Vegetables' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Grains' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(6);
    expect(screen.getByRole('option', { name: 'Carrot' })).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('data-active', 'true');

    // Banana is individually disabled.
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active', 'true');

    // The whole Vegetables group and its options are disabled.
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Bread' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith(['bread']);
  });

  it('MultiSelect_AsyncSearch_ShouldCallHandlerWithoutFilteringLocally', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();
    const data = [{ label: 'Apple', value: 'apple' }];

    const { rerender } = render(
      <MultiSelect
        data={data}
        ariaLabel="Food"
        searchable
        onSearchChange={onSearchChange}
        nothingFoundMessage="Nothing found"
      />
    );

    const combobox = screen.getByRole('combobox', { name: 'Food' });

    await user.click(combobox);
    await user.type(combobox, 'zzz');

    expect(onSearchChange).toHaveBeenCalledTimes(3);
    expect(onSearchChange).toHaveBeenLastCalledWith('zzz');
    // Async mode delegates filtering to the consumer, so the provided data stays visible.
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();

    rerender(
      <MultiSelect
        data={data}
        ariaLabel="Food"
        searchable
        onSearchChange={onSearchChange}
        nothingFoundMessage="Nothing found"
        loading
      />
    );

    expect(combobox).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(/loading options/i);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    rerender(
      <MultiSelect
        data={[]}
        ariaLabel="Food"
        searchable
        onSearchChange={onSearchChange}
        nothingFoundMessage="Nothing found"
      />
    );

    expect(combobox).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('status')).toHaveTextContent('Nothing found');
  });

  it('MultiSelect_Virtualized_ShouldRenderFewRowsAndScrollActiveOptionIntoView', async () => {
    const user = userEvent.setup();
    const data = Array.from({ length: 100 }, (_item, index) => ({
      label: `Option ${index}`,
      value: String(index)
    }));

    render(
      <MultiSelect
        data={data}
        ariaLabel="Options"
        virtualized
        virtualizedMaxHeight={300}
        itemHeight={36}
        overscan={3}
      />
    );

    const combobox = screen.getByRole('combobox', { name: 'Options' });

    await user.click(combobox);

    expect(screen.getAllByRole('option').length).toBeLessThan(20);
    expect(screen.queryByRole('option', { name: 'Option 15' })).not.toBeInTheDocument();

    combobox.focus();

    await user.keyboard('{ArrowDown}'.repeat(16));

    const activeOption = screen.getByRole('option', { name: 'Option 15' });

    expect(activeOption).toHaveAttribute('data-active', 'true');
    expect(activeOption).toHaveAttribute('aria-setsize', '100');
    expect(activeOption).toHaveAttribute('aria-posinset', '16');
    expect(screen.queryByRole('option', { name: 'Option 0' })).not.toBeInTheDocument();
  });

  it('MultiSelect_RenderOption_ShouldRenderCustomContentAndKeepAccessibleName', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MultiSelect
        data={[
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
          { label: 'Cherry', value: 'cherry' }
        ]}
        ariaLabel="Fruits"
        searchable
        onChange={onChange}
        renderOption={(option) => (
          <span data-testid={`rendered-${option.value}`}>{option.label.toUpperCase()}</span>
        )}
      />
    );

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    await user.click(combobox);
    await user.type(combobox, 'ban');

    const option = screen.getByRole('option', { name: 'Banana' });

    expect(option).toHaveTextContent('BANANA');
    expect(screen.getByTestId('rendered-banana')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);

    await user.click(option);

    expect(onChange).toHaveBeenLastCalledWith(['banana']);
    expect(screen.getByRole('button', { name: 'Remove Banana' })).toBeInTheDocument();
    expect(screen.getByText('Banana')).toHaveTextContent('Banana');
  });

  it('MultiSelect_AsyncSearch_ShouldKeepSelectedChipsWhenResultsChange', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();

    const { rerender } = render(
      <MultiSelect
        data={[{ label: 'Apple', value: 'apple' }]}
        ariaLabel="Food"
        searchable
        onSearchChange={onSearchChange}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Food' }));
    await user.click(screen.getByRole('option', { name: 'Apple' }));

    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();
    expect(onSearchChange).toHaveBeenLastCalledWith('');

    rerender(
      <MultiSelect
        data={[{ label: 'Banana', value: 'banana' }]}
        ariaLabel="Food"
        searchable
        onSearchChange={onSearchChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Remove Apple' })).toBeInTheDocument();
  });

  it('MultiSelect_Accessibility_ShouldHaveNoViolationsWithGroupsAndCustomOptions', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MultiSelect
        data={groupedData}
        label="Food"
        description="Pick a few"
        defaultValue={['apple']}
        searchable
        clearable
        renderOption={(option) => <span>{option.label.toUpperCase()}</span>}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Food' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
