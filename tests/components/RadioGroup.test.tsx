import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Radio, RadioGroup } from '@nebular-react/core';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Unavailable', value: 'unavailable', disabled: true }
];

describe('RadioGroup', () => {
  it('RadioGroup_Data_ShouldRenderStringAndObjectOptions', () => {
    render(
      <RadioGroup label="Favorite fruit" data={['Apple', { label: 'Banana', value: 'banana' }]} />
    );

    expect(screen.getByRole('radiogroup', { name: 'Favorite fruit' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeInTheDocument();
  });

  it('RadioGroup_Uncontrolled_ShouldSelectOneOptionAtATime', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <RadioGroup label="Favorite fruit" data={fruits} defaultValue="apple" onChange={onChange} />
    );

    expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Banana' }));

    expect(onChange).toHaveBeenLastCalledWith('banana');
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Apple' })).not.toBeChecked();
  });

  it('RadioGroup_Controlled_ShouldRespectTheProvidedValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<RadioGroup label="Favorite fruit" data={fruits} value="apple" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: 'Banana' }));

    expect(onChange).toHaveBeenLastCalledWith('banana');
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Banana' })).not.toBeChecked();
  });

  it('RadioGroup_Children_ShouldStillWorkWithTheLegacyApi', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <RadioGroup label="Favorite fruit" onChange={onChange}>
        <Radio label="Apple" value="apple" />
        <Radio label="Banana" value="banana" />
      </RadioGroup>
    );

    await user.click(screen.getByRole('radio', { name: 'Banana' }));

    expect(onChange).toHaveBeenLastCalledWith('banana');
  });

  it('RadioGroup_Name_ShouldBeForwardedToEveryInput', () => {
    render(<RadioGroup label="Favorite fruit" data={fruits} name="fruit" />);

    expect(screen.getByRole('radio', { name: 'Apple' })).toHaveAttribute('name', 'fruit');
    expect(screen.getByRole('radio', { name: 'Banana' })).toHaveAttribute('name', 'fruit');
  });

  it('groups data options for native keyboard navigation without an explicit name', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <>
        <RadioGroup label="Favorite fruit" data={fruits} defaultValue="apple" onChange={onChange} />
        <RadioGroup label="Another fruit" data={['Pear', 'Lemon']} defaultValue="Pear" />
      </>
    );

    const first = screen.getByRole('radio', { name: 'Apple' });
    const second = screen.getByRole('radio', { name: 'Banana' });
    const independent = screen.getByRole('radio', { name: 'Pear' });

    expect(first).toHaveAttribute('name', expect.stringMatching(/\S/));
    expect(second).toHaveAttribute('name', first.getAttribute('name'));
    expect(independent).not.toHaveAttribute('name', first.getAttribute('name'));
    await user.tab();
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(second).toBeChecked();
    expect(second).toHaveFocus();
    expect(independent).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('banana');
  });

  it('applies the CSS selector classes for selection and focus to data options', () => {
    render(<RadioGroup label="Favorite fruit" data={fruits} defaultValue="apple" />);

    const selected = screen.getByRole('radio', { name: 'Apple' });
    expect(selected).toHaveClass('nebular-radio-nativeInput');
    expect(selected.nextElementSibling).toHaveClass('nebular-radio-outerCircle');
    expect(selected.nextElementSibling?.nextElementSibling).toHaveClass(
      'nebular-radio-innerCircle'
    );
  });

  it('RadioGroup_Disabled_ShouldDisableEveryInput', () => {
    render(<RadioGroup label="Favorite fruit" data={fruits} disabled />);

    expect(screen.getByRole('radio', { name: 'Apple' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Banana' })).toBeDisabled();
  });

  it('RadioGroup_DisabledItem_ShouldOnlyDisableTheMarkedOption', () => {
    render(<RadioGroup label="Favorite fruit" data={fruits} />);

    expect(screen.getByRole('radio', { name: 'Unavailable' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeEnabled();
  });

  it('RadioGroup_LabelDescriptionAndError_ShouldDescribeTheGroup', () => {
    render(
      <RadioGroup
        label={<strong>Favorite fruit</strong>}
        data={fruits}
        description="Pick exactly one fruit"
        error="Selection is required"
        orientation="horizontal"
        required
      />
    );

    const group = screen.getByRole('radiogroup', { name: 'Favorite fruit' });
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(group).toHaveAccessibleDescription('Pick exactly one fruit Selection is required');
    expect(screen.getByRole('radio', { name: 'Apple' })).toBeRequired();
    expect(screen.getByRole('alert')).toHaveTextContent('Selection is required');
  });

  it('RadioGroup_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <RadioGroup
        label="Favorite fruit"
        description="Pick exactly one fruit"
        data={fruits}
        defaultValue="apple"
        required
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
