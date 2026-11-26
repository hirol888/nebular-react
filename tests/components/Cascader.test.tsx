import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Cascader } from '@nebular-react/core';
import type { CascaderOption } from '@nebular-react/core';

const options: CascaderOption[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' }
    ]
  },
  {
    value: 'vegetables',
    label: 'Vegetables',
    children: [
      {
        value: 'carrot',
        label: 'Carrot',
        children: [{ value: 'orange-carrot', label: 'Orange Carrot' }]
      },
      { value: 'potato', label: 'Potato', disabled: true }
    ]
  },
  { value: 'other', label: 'Other' }
];

describe('Cascader', () => {
  it('Cascader_Render_ShouldRenderLabelDescriptionAndPlaceholder', () => {
    render(
      <Cascader
        options={options}
        label="Location"
        description="Pick a location"
        placeholder="Select a location"
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Location' });

    expect(trigger).toHaveAttribute('placeholder', 'Select a location');
    expect(screen.getByText('Pick a location')).toBeInTheDocument();
  });

  it('Cascader_Select_ShouldDrillDownAndCloseOnLeaf', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    expect(screen.getByRole('listbox', { name: 'Level 1' })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Fruits' }));

    expect(screen.getByRole('listbox', { name: 'Level 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('option', { name: 'Apple' }));

    expect(onChange).toHaveBeenCalledWith(['fruits', 'apple']);
    expect(trigger).toHaveValue('Fruits / Apple');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
  });

  it('Cascader_MultipleLevels_ShouldDisplayCustomSeparator', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        separator=" > "
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.click(screen.getByRole('option', { name: 'Vegetables' }));
    await user.click(screen.getByRole('option', { name: 'Carrot' }));

    expect(screen.getByRole('listbox', { name: 'Level 3' })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Orange Carrot' }));

    expect(onChange).toHaveBeenCalledWith(['vegetables', 'carrot', 'orange-carrot']);
    expect(trigger).toHaveValue('Vegetables > Carrot > Orange Carrot');
  });

  it('Cascader_ChangeOnSelect_ShouldEmitPartialPaths', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        changeOnSelect
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.click(screen.getByRole('option', { name: 'Fruits' }));

    expect(onChange).toHaveBeenCalledWith(['fruits']);
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('option', { name: 'Apple' }));

    expect(onChange).toHaveBeenLastCalledWith(['fruits', 'apple']);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.click(screen.getByRole('option', { name: 'Other' }));

    expect(onChange).toHaveBeenLastCalledWith(['other']);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  });

  it('Cascader_ControlledValue_ShouldFollowProps', () => {
    const { rerender } = render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        value={['fruits', 'banana']}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    expect(trigger).toHaveValue('Fruits / Banana');

    rerender(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        value={['vegetables', 'carrot', 'orange-carrot']}
      />
    );

    expect(trigger).toHaveValue('Vegetables / Carrot / Orange Carrot');
  });

  it('Cascader_UncontrolledDefaultValue_ShouldDisplayPath', () => {
    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        defaultValue={['other']}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Choose' })).toHaveValue('Other');
  });

  it('Cascader_Clearable_ShouldClearSelection', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        defaultValue={['fruits', 'apple']}
        clearable
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    expect(trigger).toHaveValue('Fruits / Apple');

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith([]);
    expect(trigger).toHaveValue('');
  });

  it('Cascader_Keyboard_ShouldNavigateColumnsSelectAndClose', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Fruits' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('option', { name: 'Fruits' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('{ArrowRight}{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith(['fruits', 'apple']);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(trigger).toHaveFocus();
  });

  it('Cascader_DisabledOption_ShouldNotBeSelectable', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <Cascader
        options={options}
        ariaLabel="Choose"
        placeholder="Select a location"
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.click(screen.getByRole('option', { name: 'Vegetables' }));

    const potato = screen.getByRole('option', { name: 'Potato' });
    expect(potato).toHaveAttribute('aria-disabled', 'true');

    await user.click(potato);

    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('Cascader_Disabled_ShouldNotOpenDropdown', () => {
    render(
      <Cascader options={options} ariaLabel="Choose" placeholder="Select a location" disabled />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });

    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Cascader_ClickOutside_ShouldClosePanel', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Cascader options={options} ariaLabel="Choose" placeholder="Select a location" />
        <button type="button">Outside</button>
      </>
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Cascader_A11y_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Cascader
        options={options}
        label="Location"
        description="Pick a location"
        placeholder="Select a location"
        required
        defaultValue={['fruits', 'apple']}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    const trigger = screen.getByRole('combobox', { name: 'Location' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    const pane = document.querySelector('.overlay-pane') as HTMLElement;
    expect(await axe(pane)).toHaveNoViolations();
  });
});
