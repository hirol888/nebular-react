import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CronInput } from '@nebular-react/core';

function renderVisual(
  defaultValue: string,
  props: Partial<React.ComponentProps<typeof CronInput>> = {}
) {
  const onChange = jest.fn();

  render(
    <CronInput
      label="Schedule"
      locale="en-US"
      defaultValue={defaultValue}
      withVisualEditor
      presets={false}
      onChange={onChange}
      {...props}
    />
  );

  return onChange;
}

describe('CronInput visual editor', () => {
  it('parses and edits a minute interval', () => {
    const onChange = renderVisual('*/5 * * * *');

    const frequency = screen.getByRole('combobox', { name: 'Frequency' });
    expect(frequency).toHaveValue('minutely');
    expect(screen.queryByRole('option', { name: 'Custom expression' })).not.toBeInTheDocument();

    const interval = screen.getByRole('spinbutton', { name: 'Minute interval' });
    expect(interval).toHaveValue(5);

    fireEvent.change(interval, { target: { value: '0' } });
    fireEvent.change(interval, { target: { value: '60' } });
    fireEvent.change(interval, { target: { value: '2.5' } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(interval, { target: { value: '7' } });
    expect(onChange).toHaveBeenLastCalledWith('*/7 * * * *');
  });

  it('parses an hourly expression and edits the minute', () => {
    const onChange = renderVisual('15 * * * *');

    expect(screen.getByRole('combobox', { name: 'Frequency' })).toHaveValue('hourly');

    const minute = screen.getByRole('spinbutton', { name: 'Minute of the hour' });
    expect(minute).toHaveValue(15);

    fireEvent.change(minute, { target: { value: '30' } });
    expect(onChange).toHaveBeenLastCalledWith('30 * * * *');
  });

  it('parses a daily expression and edits the time', () => {
    const onChange = renderVisual('30 8 * * *');

    expect(screen.getByRole('combobox', { name: 'Frequency' })).toHaveValue('daily');

    const time = screen.getByLabelText('Time');
    expect(time).toHaveValue('08:30');

    fireEvent.change(time, { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(time, { target: { value: '09:45' } });
    expect(onChange).toHaveBeenLastCalledWith('45 9 * * *');
  });

  it('parses a weekly expression and toggles the days', async () => {
    const user = userEvent.setup();
    const onChange = renderVisual('30 8 * * 1,2,3');

    expect(screen.getByRole('combobox', { name: 'Frequency' })).toHaveValue('weekly');

    const monday = screen.getByRole('checkbox', { name: 'Monday' });
    const tuesday = screen.getByRole('checkbox', { name: 'Tuesday' });
    const wednesday = screen.getByRole('checkbox', { name: 'Wednesday' });
    const friday = screen.getByRole('checkbox', { name: 'Friday' });

    expect(monday).toBeChecked();
    expect(tuesday).toBeChecked();
    expect(wednesday).toBeChecked();
    expect(friday).not.toBeChecked();

    await user.click(tuesday);
    expect(onChange).toHaveBeenLastCalledWith('30 8 * * 1,3');

    await user.click(friday);
    expect(onChange).toHaveBeenLastCalledWith('30 8 * * 1,3,5');

    await user.click(monday);
    await user.click(wednesday);

    expect(friday).toBeChecked();
    expect(friday).toBeDisabled();
  });

  it('parses a monthly expression and edits the day of the month', () => {
    const onChange = renderVisual('0 8 15 * *');

    expect(screen.getByRole('combobox', { name: 'Frequency' })).toHaveValue('monthly');

    const day = screen.getByRole('spinbutton', { name: 'Day of the month' });
    expect(day).toHaveValue(15);

    fireEvent.change(day, { target: { value: '20' } });
    expect(onChange).toHaveBeenLastCalledWith('0 8 20 * *');
  });

  it('switches between frequencies and formats the expression', async () => {
    const user = userEvent.setup();
    const onChange = renderVisual('');

    const frequency = screen.getByRole('combobox', { name: 'Frequency' });
    expect(frequency).toHaveValue('none');
    expect(screen.queryByRole('option', { name: 'Custom expression' })).not.toBeInTheDocument();

    await user.selectOptions(frequency, 'minutely');
    expect(onChange).toHaveBeenLastCalledWith('* * * * *');

    await user.selectOptions(frequency, 'hourly');
    expect(onChange).toHaveBeenLastCalledWith('0 * * * *');

    await user.selectOptions(frequency, 'daily');
    expect(onChange).toHaveBeenLastCalledWith('0 9 * * *');

    await user.selectOptions(frequency, 'weekly');
    expect(onChange).toHaveBeenLastCalledWith('0 9 * * 1');

    await user.selectOptions(frequency, 'monthly');
    expect(onChange).toHaveBeenLastCalledWith('0 9 1 * *');
  });

  it('keeps unsupported expressions in custom mode', () => {
    render(
      <CronInput
        label="Schedule"
        locale="en-US"
        defaultValue="0 9 1 * 1"
        withVisualEditor
        presets={false}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Frequency' })).toHaveValue('custom');
    expect(screen.getByRole('option', { name: 'Custom expression' })).toBeDisabled();
    expect(screen.getByText(/Edit the expression/)).toBeVisible();
  });

  it('shows the custom hint for an invalid expression', () => {
    render(
      <CronInput
        label="Schedule"
        locale="en-US"
        defaultValue="@hourly"
        withVisualEditor
        presets={false}
      />
    );

    expect(screen.getByRole('combobox', { name: 'Frequency' })).toHaveValue('custom');
    expect(screen.getByText(/Edit the expression/)).toBeVisible();
  });

  it('uses the Portuguese labels and honors the disabled state', () => {
    render(
      <CronInput
        label="Agendamento"
        locale="pt-BR"
        defaultValue="*/5 * * * *"
        withVisualEditor
        disabled
      />
    );

    expect(screen.getByText('Agendamento visual')).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Frequência' })).toBeDisabled();
    expect(screen.getByRole('spinbutton', { name: 'Intervalo em minutos' })).toBeDisabled();
  });
});
