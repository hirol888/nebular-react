import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MultiSelect } from '@nebular-react/core';

const data = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
  { label: 'Gamma', value: 'gamma', disabled: true }
];

describe('MultiSelect', () => {
  it('MultiSelect_Render_ShouldExposeComboboxWithLabelAndDescription', () => {
    render(
      <MultiSelect data={data} label="Fruits" description="Pick a few" placeholder="Choose" />
    );

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    expect(screen.getByText('Pick a few')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Choose')).toBe(combobox);
  });

  it('MultiSelect_Click_ShouldOpenListboxWithAllOptions', async () => {
    const user = userEvent.setup();

    render(<MultiSelect data={data} ariaLabel="Fruits" placeholder="Choose" />);

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    await user.click(combobox);

    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gamma' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('MultiSelect_SelectValues_ShouldRenderChipsAndReportSelectedValues', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<MultiSelect data={data} ariaLabel="Fruits" onChange={onChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Fruits' }));
    await user.click(screen.getByRole('option', { name: 'Alpha' }));
    await user.click(screen.getByRole('option', { name: 'Beta' }));

    expect(onChange).toHaveBeenLastCalledWith(['alpha', 'beta']);
    expect(screen.getByRole('button', { name: 'Remove Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Beta' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    // Multiple selections keep the dropdown open.
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('MultiSelect_RemoveChip_ShouldRemoveOnlyThatValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MultiSelect
        data={data}
        ariaLabel="Fruits"
        defaultValue={['alpha', 'beta']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Remove Alpha' }));

    expect(onChange).toHaveBeenLastCalledWith(['beta']);
    expect(screen.queryByRole('button', { name: 'Remove Alpha' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Beta' })).toBeInTheDocument();
  });

  it('MultiSelect_Clearable_ShouldClearAllValues', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MultiSelect
        data={data}
        ariaLabel="Fruits"
        defaultValue={['alpha']}
        clearable
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole('button', { name: 'Remove Alpha' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
  });

  it('MultiSelect_MaxValues_ShouldBlockExtraSelections', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MultiSelect
        data={data}
        ariaLabel="Fruits"
        defaultValue={['alpha']}
        maxValues={1}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Fruits' }));

    const beta = screen.getByRole('option', { name: 'Beta' });

    expect(beta).toHaveAttribute('aria-disabled', 'true');

    await user.click(beta);

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Remove Beta' })).not.toBeInTheDocument();
  });

  it('MultiSelect_Searchable_ShouldFilterOptionsAndShowEmptyState', async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect
        data={data}
        ariaLabel="Fruits"
        placeholder="Choose"
        searchable
        nothingFoundMessage="Nothing found"
      />
    );

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    await user.click(combobox);
    await user.type(combobox, 'bet');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();

    await user.clear(combobox);
    await user.type(combobox, 'zzz');

    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Nothing found');
  });

  it('MultiSelect_Keyboard_ShouldOpenNavigateSelectAndClose', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<MultiSelect data={data} ariaLabel="Fruits" onChange={onChange} />);

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    combobox.focus();
    await user.keyboard('{ArrowDown}');

    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute('data-active', 'true');
    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: 'Alpha' }).id
    );

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith(['alpha']);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith(['alpha', 'beta']);

    await user.keyboard('{Escape}');

    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('MultiSelect_KeyboardBackspace_ShouldRemoveLastValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MultiSelect
        data={data}
        ariaLabel="Fruits"
        defaultValue={['alpha', 'beta']}
        onChange={onChange}
      />
    );

    screen.getByRole('combobox', { name: 'Fruits' }).focus();

    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenLastCalledWith(['alpha']);
  });

  it('MultiSelect_Disabled_ShouldNotOpenNorRespondToKeydown', async () => {
    const user = userEvent.setup();

    render(
      <MultiSelect data={data} ariaLabel="Fruits" defaultValue={['alpha']} disabled clearable />
    );

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    expect(combobox).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Alpha' })).toBeDisabled();

    fireEvent.click(combobox);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('MultiSelect_Controlled_ShouldRespectValueWithoutMutatingInternally', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { rerender } = render(
      <MultiSelect data={data} ariaLabel="Fruits" value={['alpha']} onChange={onChange} />
    );

    await user.click(screen.getByRole('combobox', { name: 'Fruits' }));
    await user.click(screen.getByRole('option', { name: 'Beta' }));

    expect(onChange).toHaveBeenLastCalledWith(['alpha', 'beta']);
    expect(screen.queryByRole('button', { name: 'Remove Beta' })).not.toBeInTheDocument();

    rerender(
      <MultiSelect data={data} ariaLabel="Fruits" value={['alpha', 'beta']} onChange={onChange} />
    );

    expect(screen.getByRole('button', { name: 'Remove Beta' })).toBeInTheDocument();
  });

  it('MultiSelect_ClickOutside_ShouldCloseTheListbox', async () => {
    const user = userEvent.setup();

    render(<MultiSelect data={data} ariaLabel="Fruits" />);

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    await user.click(combobox);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(document.body);

    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('MultiSelect_Error_ShouldRenderAlertAndMarkFieldInvalid', () => {
    render(<MultiSelect data={data} ariaLabel="Fruits" error="Pick at least one" required />);

    const combobox = screen.getByRole('combobox', { name: 'Fruits' });

    expect(screen.getByRole('alert')).toHaveTextContent('Pick at least one');
    expect(combobox).toHaveAttribute('aria-required', 'true');
    expect(combobox).toHaveAttribute('aria-invalid', 'true');
  });

  it('MultiSelect_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <MultiSelect
        data={data}
        label="Fruits"
        description="Pick a few"
        defaultValue={['alpha']}
        searchable
        clearable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('MultiSelect_AccessibilityWhenOpen_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MultiSelect data={data} label="Fruits" defaultValue={['alpha']} searchable />
    );

    await user.click(screen.getByRole('combobox', { name: 'Fruits' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
