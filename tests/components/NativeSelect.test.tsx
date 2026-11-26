import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NativeSelect } from '@nebular-react/core';

describe('NativeSelect', () => {
  it('NativeSelect_Data_ShouldRenderStringAndObjectOptions', () => {
    render(
      <NativeSelect
        label="Favorite fruit"
        data={['Apple', { value: 'banana', label: 'Banana', disabled: true }]}
        defaultValue="Apple"
      />
    );

    const select = screen.getByLabelText('Favorite fruit');
    expect(select).toHaveValue('Apple');
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeDisabled();
  });

  it('NativeSelect_Uncontrolled_ShouldReportValueAndEvent', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <NativeSelect
        label="Favorite fruit"
        data={['Apple', 'Banana']}
        defaultValue="Apple"
        onChange={onChange}
      />
    );

    await user.selectOptions(screen.getByLabelText('Favorite fruit'), 'Banana');

    expect(onChange).toHaveBeenCalledWith('Banana', expect.anything());
    expect(screen.getByLabelText('Favorite fruit')).toHaveValue('Banana');
  });

  it('NativeSelect_Controlled_ShouldKeepTheProvidedValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <NativeSelect
        label="Favorite fruit"
        data={['Apple', 'Banana']}
        value="Apple"
        onChange={onChange}
      />
    );

    await user.selectOptions(screen.getByLabelText('Favorite fruit'), 'Banana');

    expect(onChange).toHaveBeenCalledWith('Banana', expect.anything());
    expect(screen.getByLabelText('Favorite fruit')).toHaveValue('Apple');
  });

  it('NativeSelect_PlaceholderAndRequired_ShouldRenderDisabledHiddenOption', () => {
    render(
      <NativeSelect
        label="Favorite fruit"
        data={['Apple']}
        placeholder="Pick one"
        required
      />
    );

    const select = screen.getByLabelText(/Favorite fruit/);
    expect(select).toBeRequired();

    const placeholder = screen.getByText('Pick one');
    expect(placeholder).toHaveAttribute('disabled');
    expect(placeholder).toHaveAttribute('hidden');
  });

  it('NativeSelect_ErrorAndDescription_ShouldBeAccessible', () => {
    render(
      <NativeSelect
        label="Favorite fruit"
        data={['Apple']}
        description="Choose your favorite"
        error="Selection is required"
      />
    );

    const select = screen.getByLabelText('Favorite fruit');
    const description = screen.getByText('Choose your favorite');

    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby', expect.stringContaining(description.id));
    expect(screen.getByRole('alert')).toHaveTextContent('Selection is required');
  });

  it('NativeSelect_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <NativeSelect
        label="Favorite fruit"
        description="Choose your favorite"
        data={['Apple', 'Banana']}
        required
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
