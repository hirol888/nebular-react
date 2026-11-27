import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderToString } from 'react-dom/server';
import { DateField } from '@nebular-react/core';

const segment = (name: string) => screen.getByRole<HTMLInputElement>('spinbutton', { name });

describe('DateField', () => {
  it('orders the segments by locale and names the group and each input', () => {
    const { rerender } = render(<DateField label="Start date" locale="pt-BR" />);
    const group = screen.getByRole('group', { name: 'Start date' });
    expect(within(group).getAllByRole('spinbutton')).toEqual([
      segment('Day'),
      segment('Month'),
      segment('Year')
    ]);

    rerender(<DateField label="Start date" locale="en-US" />);
    expect(within(group).getAllByRole('spinbutton')).toEqual([
      segment('Month'),
      segment('Day'),
      segment('Year')
    ]);
  });

  it('advances through complete segments and commits one valid civil date', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<DateField locale="en-GB" onChange={onChange} />);

    await user.type(segment('Day'), '29022024');

    expect(segment('Year')).toHaveFocus();
    expect(segment('Day')).toHaveValue('29');
    expect(onChange.mock.calls).toEqual([['2024-02-29']]);
  });

  it('moves horizontally with the keyboard and clamps the day on month changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<DateField defaultValue="2024-01-31" onChange={onChange} />);

    await user.tab();
    expect(segment('Month')).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowRight}');

    expect(segment('Day')).toHaveFocus();
    expect(segment('Day')).toHaveValue('29');
    expect(onChange).toHaveBeenLastCalledWith('2024-02-29');
  });

  it('rejects invalid calendar dates and bounds without emitting changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<DateField defaultValue="2024-02-28" max="2024-02-28" onChange={onChange} />);
    await user.type(segment('Day'), '31', { initialSelectionStart: 0, initialSelectionEnd: 2 });
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid date');
    expect(segment('Day')).toHaveAttribute('aria-invalid', 'true');
    await user.type(segment('Day'), '29', { initialSelectionStart: 0, initialSelectionEnd: 2 });
    expect(screen.getByRole('alert')).toHaveTextContent('Date is outside the allowed range');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the controlled value and updates its native form value from the parent', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const view = (value: string) => (
      <form data-testid="form">
        <DateField name="start" value={value} onChange={onChange} />
      </form>
    );
    const { rerender } = render(view('2024-01-31'));
    await user.click(segment('Month'));
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('2024-02-29');
    expect(segment('Month')).toHaveValue('01');

    rerender(view('2024-02-29'));
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect(new FormData(form).get('start')).toBe('2024-02-29');
  });

  it('accepts localized numerals and ISO paste', () => {
    const onChange = jest.fn();
    render(<DateField locale="ar-EG" defaultValue="2024-01-01" onChange={onChange} />);
    expect(segment('Day')).toHaveValue('٠١');
    fireEvent.change(segment('Day'), { target: { value: '١٥' } });
    expect(onChange).toHaveBeenLastCalledWith('2024-01-15');
    fireEvent.paste(segment('Day'), { clipboardData: { getData: () => '2025-06-20' } });
    expect(onChange).toHaveBeenLastCalledWith('2025-06-20');
  });

  it('clears the date only once every segment is empty', () => {
    const onChange = jest.fn();
    render(<DateField defaultValue="2024-01-01" onChange={onChange} />);
    fireEvent.change(segment('Day'), { target: { value: '' } });
    fireEvent.change(segment('Month'), { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(segment('Year'), { target: { value: '' } });
    expect(onChange.mock.calls).toEqual([[null]]);
  });

  it('prevents form submission on a partial date and keeps error accessible', async () => {
    const { container } = render(
      <form data-testid="form">
        <DateField label="Date of birth" name="birthday" description="Date in local order" />
      </form>
    );
    fireEvent.change(segment('Day'), { target: { value: '12' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    const form = screen.getByTestId<HTMLFormElement>('form');
    act(() => expect(form.checkValidity()).toBe(false));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a complete date');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('reports clearing a required date while retaining the validation error', () => {
    const onChange = jest.fn();
    render(<DateField required defaultValue="2024-01-01" onChange={onChange} />);
    fireEvent.change(segment('Day'), { target: { value: '' } });
    fireEvent.change(segment('Month'), { target: { value: '' } });
    fireEvent.change(segment('Year'), { target: { value: '' } });
    expect(onChange.mock.calls).toEqual([[null]]);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a date');
  });

  it('serializes a complete date even if focus has not left a one-digit segment', () => {
    render(
      <form data-testid="form">
        <DateField name="date" defaultValue="2024-01-01" />
      </form>
    );
    fireEvent.change(segment('Day'), { target: { value: '7' } });
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).get('date')).toBe(
      '2024-01-07'
    );
  });

  it('retains the same date and segment ordering in server markup', () => {
    const markup = renderToString(<DateField locale="en-GB" value="2024-02-29" />);
    expect(markup).toMatch(/value="29".*value="02".*value="2024"/);
  });
});
