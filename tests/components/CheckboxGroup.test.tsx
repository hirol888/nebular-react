import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CheckboxGroup } from '@nebular-react/core';

describe('CheckboxGroup', () => {
  it('CheckboxGroup_Render_ShouldRenderGroupWithStringAndObjectOptions', () => {
    render(
      <CheckboxGroup ariaLabel="Fruits" data={['Apple', { label: 'Banana', value: 'banana' }]} />
    );

    expect(screen.getByRole('group', { name: 'Fruits' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeInTheDocument();
  });

  it('CheckboxGroup_AriaLabel_ShouldFallbackToLabelText', () => {
    render(<CheckboxGroup label="Fruits" data={['Apple']} />);

    expect(screen.getByRole('group', { name: 'Fruits' })).toBeInTheDocument();
  });

  it('CheckboxGroup_Uncontrolled_ShouldToggleValuesAndReportChanges', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CheckboxGroup
        ariaLabel="Fruits"
        data={['Apple', 'Banana']}
        defaultValue={['Apple']}
        onChange={onChange}
      />
    );

    const apple = screen.getByRole('checkbox', { name: 'Apple' });
    const banana = screen.getByRole('checkbox', { name: 'Banana' });

    expect(apple).toBeChecked();
    expect(banana).not.toBeChecked();

    await user.click(banana);

    expect(onChange).toHaveBeenLastCalledWith(['Apple', 'Banana']);
    expect(banana).toBeChecked();

    await user.click(apple);

    expect(onChange).toHaveBeenLastCalledWith(['Banana']);
    expect(apple).not.toBeChecked();
  });

  it('CheckboxGroup_Controlled_ShouldRespectValueWithoutMutatingInternally', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CheckboxGroup
        ariaLabel="Fruits"
        data={['Apple', 'Banana']}
        value={['Apple']}
        onChange={onChange}
      />
    );

    const apple = screen.getByRole('checkbox', { name: 'Apple' });
    const banana = screen.getByRole('checkbox', { name: 'Banana' });

    expect(apple).toBeChecked();
    expect(banana).not.toBeChecked();

    await user.click(banana);

    expect(onChange).toHaveBeenLastCalledWith(['Apple', 'Banana']);
    expect(banana).not.toBeChecked();
  });

  it('CheckboxGroup_Disabled_ShouldDisableAllOptionsWhenGroupIsDisabled', () => {
    render(
      <CheckboxGroup
        ariaLabel="Fruits"
        data={['Apple', { label: 'Banana', value: 'banana' }]}
        disabled
      />
    );

    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeDisabled();
  });

  it('CheckboxGroup_DisabledItem_ShouldOnlyDisableTheMarkedOption', () => {
    render(
      <CheckboxGroup
        ariaLabel="Fruits"
        data={[{ label: 'Apple', value: 'apple', disabled: true }, 'Banana']}
      />
    );

    expect(screen.getByRole('checkbox', { name: 'Apple' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toBeEnabled();
  });

  it('CheckboxGroup_LabelAndDescription_ShouldRenderDescriptionErrorAndRequiredMark', () => {
    render(
      <CheckboxGroup
        label="Fruits"
        data={['Apple']}
        description="Pick at least one fruit"
        error="Selection is required"
        required
      />
    );

    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Pick at least one fruit')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Selection is required');
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('CheckboxGroup_Orientation_ShouldExposeOrientationOnRoot', () => {
    const { container } = render(
      <CheckboxGroup ariaLabel="Fruits" data={['Apple']} orientation="horizontal" />
    );

    expect(container.firstElementChild).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('CheckboxGroup_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <CheckboxGroup
        label="Notifications"
        data={[
          { label: 'Email', value: 'email' },
          { label: 'SMS', value: 'sms', disabled: true }
        ]}
        description="Choose how we can reach you"
        required
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
