import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { PinInput } from '@nebular-react/core';

const valuesOf = (inputs: HTMLElement[]) =>
  inputs.map((input) => (input as HTMLInputElement).value);

describe('PinInput', () => {
  it('renders one input per length and types digits moving focus forward', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<PinInput length={4} ariaLabel="Code" onChange={onChange} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);

    await user.type(inputs[0], '1234');

    expect(valuesOf(inputs)).toEqual(['1', '2', '3', '4']);
    expect(onChange).toHaveBeenLastCalledWith('1234');
  });

  it('fills every field when a code is pasted', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<PinInput length={6} onChange={onChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.paste('123456');

    expect(valuesOf(inputs)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(onChange).toHaveBeenLastCalledWith('123456');
  });

  it('clears the previous field and moves focus back on backspace', async () => {
    const user = userEvent.setup();

    render(<PinInput length={4} defaultValue="123" />);

    const inputs = screen.getAllByRole('textbox');
    expect(valuesOf(inputs)).toEqual(['1', '2', '3', '']);

    await user.click(inputs[3]);
    await user.keyboard('{Backspace}');

    expect(valuesOf(inputs)).toEqual(['1', '2', '', '']);
    expect(inputs[2]).toHaveFocus();
  });

  it('keeps the value controlled while reporting changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { rerender } = render(<PinInput length={4} value="12" onChange={onChange} />);

    const inputs = screen.getAllByRole('textbox');
    expect(valuesOf(inputs)).toEqual(['1', '2', '', '']);

    await user.click(inputs[2]);
    await user.type(inputs[2], '3');

    expect(onChange).toHaveBeenLastCalledWith('123');

    rerender(<PinInput length={4} value="123" onChange={onChange} />);
    expect(valuesOf(inputs)).toEqual(['1', '2', '3', '']);
  });

  it('masks characters and renders label and error', () => {
    const { container } = render(
      <PinInput length={4} mask defaultValue="12" label="Verification code" error="Code required" />
    );

    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('input'));
    expect(inputs).toHaveLength(4);
    inputs.forEach((input) => expect(input).toHaveAttribute('type', 'password'));
    expect(screen.getByText('Verification code')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Code required');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PinInput
        length={4}
        ariaLabel="Verification code"
        label="Verification code"
        error="Code required"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
