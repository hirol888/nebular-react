import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SwitchGroup } from '@nebular-react/core';

const notifications = [
  { label: 'Email', value: 'email' },
  { label: 'Push', value: 'push' },
  { label: 'SMS', value: 'sms', disabled: true }
];

describe('SwitchGroup', () => {
  it('SwitchGroup_Data_ShouldRenderSwitches', () => {
    render(<SwitchGroup label="Notifications" data={notifications} defaultValue={['email']} />);

    expect(screen.getByRole('group', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Email' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Push' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'SMS' })).toBeDisabled();
  });

  it('SwitchGroup_Uncontrolled_ShouldAddAndRemoveValues', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SwitchGroup
        label="Notifications"
        data={notifications}
        defaultValue={['email']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('switch', { name: 'Push' }));
    expect(onChange).toHaveBeenLastCalledWith(['email', 'push']);

    await user.click(screen.getByRole('switch', { name: 'Email' }));
    expect(onChange).toHaveBeenLastCalledWith(['push']);
  });

  it('SwitchGroup_Controlled_ShouldRespectValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SwitchGroup
        label="Notifications"
        data={notifications}
        value={['email']}
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('switch', { name: 'Push' }));

    expect(onChange).toHaveBeenLastCalledWith(['email', 'push']);
    expect(screen.getByRole('switch', { name: 'Push' })).not.toBeChecked();
  });

  it('SwitchGroup_Disabled_ShouldDisableEverySwitch', () => {
    render(<SwitchGroup label="Notifications" data={notifications} disabled />);

    expect(screen.getByRole('switch', { name: 'Email' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Push' })).toBeDisabled();
  });

  it('SwitchGroup_LabelDescriptionAndError_ShouldDescribeTheGroup', () => {
    render(
      <SwitchGroup
        label="Notifications"
        data={notifications}
        description="Choose every channel"
        error="At least one channel is required"
        orientation="horizontal"
        required
      />
    );

    const group = screen.getByRole('group', { name: 'Notifications' });
    expect(group).toHaveAttribute('data-invalid', 'true');
    expect(group).toHaveAttribute('data-required', 'true');
    expect(group).toHaveAttribute('data-orientation', 'horizontal');
    expect(screen.getByText('Choose every channel')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('At least one channel is required');
  });

  it('SwitchGroup_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <SwitchGroup
        label="Notifications"
        description="Choose every channel"
        data={notifications}
        required
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
