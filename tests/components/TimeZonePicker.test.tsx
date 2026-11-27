import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TimeZonePicker } from '@nebular-react/core';

const ZONES = ['America/New_York', 'Europe/Lisbon', 'Asia/Tokyo'];

describe('TimeZonePicker', () => {
  it('TimeZonePicker_Render_ShouldDisplayLabelDescriptionAndValue', () => {
    render(<TimeZonePicker label="Time zone" description="Pick a zone" value="Europe/Lisbon" />);

    expect(screen.getByLabelText('Time zone')).toHaveValue('Europe/Lisbon');
    expect(screen.getByText('Pick a zone')).toBeInTheDocument();
  });

  it('TimeZonePicker_Open_ShouldGroupZonesAndShowUtcOffsets', async () => {
    const user = userEvent.setup();

    render(<TimeZonePicker data={ZONES} ariaLabel="Time zone" />);

    await user.click(screen.getByLabelText('Time zone'));
    await screen.findByRole('dialog');

    expect(screen.getByRole('group', { name: 'America' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Europe' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Asia' })).toBeInTheDocument();

    const newYork = screen.getByRole('option', { name: /America\/New_York/ });
    expect(within(newYork).getByText(/^UTC[+-]\d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it('TimeZonePicker_Select_ShouldEmitTheZoneAndClose', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TimeZonePicker data={ZONES} onChange={onChange} ariaLabel="Time zone" />);

    await user.click(screen.getByLabelText('Time zone'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /Asia\/Tokyo/ }));

    expect(onChange).toHaveBeenCalledWith('Asia/Tokyo');
    expect(screen.getByLabelText('Time zone')).toHaveValue('Asia/Tokyo');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('TimeZonePicker_DefaultValue_ShouldUpdateTheUncontrolledValue', async () => {
    const user = userEvent.setup();

    render(<TimeZonePicker data={ZONES} defaultValue="Europe/Lisbon" ariaLabel="Time zone" />);

    expect(screen.getByLabelText('Time zone')).toHaveValue('Europe/Lisbon');

    await user.click(screen.getByLabelText('Time zone'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /America\/New_York/ }));

    expect(screen.getByLabelText('Time zone')).toHaveValue('America/New_York');
  });

  it('TimeZonePicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TimeZonePicker
        data={ZONES}
        value="Europe/Lisbon"
        onChange={onChange}
        ariaLabel="Time zone"
      />
    );

    await user.click(screen.getByLabelText('Time zone'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('option', { name: /Asia\/Tokyo/ }));

    expect(onChange).toHaveBeenCalledWith('Asia/Tokyo');
    expect(screen.getByLabelText('Time zone')).toHaveValue('Europe/Lisbon');
  });

  it('TimeZonePicker_Search_ShouldFilterZonesAndShowNothingFoundMessage', async () => {
    const user = userEvent.setup();

    render(
      <TimeZonePicker data={ZONES} nothingFoundMessage="No zone here" ariaLabel="Time zone" />
    );

    await user.click(screen.getByLabelText('Time zone'));
    await screen.findByRole('dialog');

    const search = screen.getByLabelText('Search time zones');
    await user.type(search, 'tok');

    expect(screen.getByRole('option', { name: /Asia\/Tokyo/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /America\/New_York/ })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzzz');

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('No zone here')).toBeInTheDocument();
  });

  it('TimeZonePicker_Clear_ShouldEmitNull', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TimeZonePicker
        clearable
        data={ZONES}
        defaultValue="Europe/Lisbon"
        onChange={onChange}
        ariaLabel="Time zone"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Time zone')).toHaveValue('');
  });

  it('TimeZonePicker_Keyboard_ShouldNavigateAndSelectWithTheKeyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TimeZonePicker data={['UTC', 'Europe/Lisbon']} onChange={onChange} ariaLabel="Time zone" />
    );

    const trigger = screen.getByLabelText('Time zone');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');

    expect(screen.getByLabelText('Search time zones')).toHaveFocus();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledWith('UTC');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('TimeZonePicker_DefaultData_ShouldUseTheRuntimeTimeZones', async () => {
    const user = userEvent.setup();

    render(<TimeZonePicker ariaLabel="Time zone" />);

    await user.click(screen.getByLabelText('Time zone'));
    await screen.findByRole('dialog');

    expect(screen.getAllByRole('option').length).toBeGreaterThan(50);
    expect(screen.getByRole('option', { name: /America\/New_York/ })).toBeInTheDocument();
  });

  it('TimeZonePicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TimeZonePicker
        label="Time zone"
        description="Pick a zone"
        data={ZONES}
        value="Europe/Lisbon"
        clearable
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Time zone'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
