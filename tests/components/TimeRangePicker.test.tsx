import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TimeRangePicker } from '@nebular-react/core';

const NEW_YORK = 'America/New_York';

const VALUE = {
  start: new Date('2024-01-15T14:00:00Z'),
  end: new Date('2024-01-15T22:00:00Z')
};

describe('TimeRangePicker', () => {
  it('TimeRangePicker_Render_ShouldDisplayLabelDescriptionAndFormattedRange', () => {
    render(
      <TimeRangePicker
        label="Shift"
        description="Working shift"
        timeZone={NEW_YORK}
        value={VALUE}
        ariaLabel="Shift"
      />
    );

    expect(screen.getByLabelText('Shift')).toHaveValue('09:00 - 17:00');
    expect(screen.getByText('Working shift')).toBeInTheDocument();
  });

  it('TimeRangePicker_Apply_ShouldEmitAbsoluteInstants', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TimeRangePicker timeZone={NEW_YORK} value={VALUE} onChange={onChange} ariaLabel="Shift" />
    );

    await user.click(screen.getByLabelText('Shift'));
    const startGroup = await screen.findByRole('group', { name: 'Start time' });
    const endGroup = await screen.findByRole('group', { name: 'End time' });

    await user.click(await within(startGroup).findByText('10:00'));
    await user.click(await within(endGroup).findByText('18:00'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledTimes(1);

    const range = onChange.mock.calls[0][0];
    expect((range.start as Date).toISOString()).toBe('2024-01-15T15:00:00.000Z');
    expect((range.end as Date).toISOString()).toBe('2024-01-15T23:00:00.000Z');
    expect(screen.getByLabelText('Shift')).toHaveValue('09:00 - 17:00');
  });

  it('TimeRangePicker_DefaultValue_ShouldUpdateTheUncontrolledValue', async () => {
    const user = userEvent.setup();

    render(<TimeRangePicker timeZone={NEW_YORK} defaultValue={VALUE} ariaLabel="Shift" />);

    await user.click(screen.getByLabelText('Shift'));
    const startGroup = await screen.findByRole('group', { name: 'Start time' });
    const endGroup = await screen.findByRole('group', { name: 'End time' });

    await user.click(await within(startGroup).findByText('10:00'));
    await user.click(await within(endGroup).findByText('18:00'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByLabelText('Shift')).toHaveValue('10:00 - 18:00');
  });

  it('TimeRangePicker_MinuteStep_ShouldRenderOnlySteppedOptions', async () => {
    const user = userEvent.setup();

    render(<TimeRangePicker minuteStep={30} ariaLabel="Shift" />);

    await user.click(screen.getByLabelText('Shift'));

    const startGroup = await screen.findByRole('group', { name: 'Start time' });
    expect(await within(startGroup).findByText('00:30')).toBeInTheDocument();
    expect(within(startGroup).queryByText('00:10')).not.toBeInTheDocument();
  });

  it('TimeRangePicker_Validation_ShouldBlockApplyWhenStartIsAfterEnd', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TimeRangePicker timeZone={NEW_YORK} value={VALUE} onChange={onChange} ariaLabel="Shift" />
    );

    await user.click(screen.getByLabelText('Shift'));

    const startGroup = await screen.findByRole('group', { name: 'Start time' });
    const endGroup = await screen.findByRole('group', { name: 'End time' });

    await user.click(await within(startGroup).findByText('18:00'));
    await user.click(await within(endGroup).findByText('09:00'));

    expect(screen.getByRole('alert')).toHaveTextContent(/end time/i);
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('TimeRangePicker_Clear_ShouldEmitNullTimes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TimeRangePicker
        timeZone={NEW_YORK}
        defaultValue={VALUE}
        onChange={onChange}
        ariaLabel="Shift"
      />
    );

    await user.click(screen.getByLabelText('Shift'));
    await user.click(await screen.findByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
    expect(screen.getByLabelText('Shift')).toHaveValue('');
  });

  it('TimeRangePicker_Keyboard_ShouldOpenAndCloseWithTheKeyboard', async () => {
    const user = userEvent.setup();

    render(<TimeRangePicker defaultValue={VALUE} ariaLabel="Shift" />);

    const trigger = screen.getByLabelText('Shift');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');

    await screen.findByRole('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.tab();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('TimeRangePicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TimeRangePicker
        label="Shift"
        description="Working shift"
        value={VALUE}
        timeZone={NEW_YORK}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Shift'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
