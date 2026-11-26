import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DesktopLayoutSettings, useDesktopLayoutScope } from '@nebular-react/core';

describe('DesktopLayoutSettings', () => {
  it('switches between device and shared scopes', async () => {
    const user = userEvent.setup();
    const onScopeChange = jest.fn();

    render(
      <DesktopLayoutSettings
        defaultScope="device"
        deviceId="browser-1"
        onScopeChange={onScopeChange}
      />
    );

    const device = screen.getByRole('radio', { name: /This device/ });
    const shared = screen.getByRole('radio', { name: /Share with my devices/ });

    expect(device).toHaveAttribute('aria-checked', 'true');
    expect(shared).toHaveAttribute('aria-checked', 'false');

    await user.click(shared);

    expect(shared).toHaveAttribute('aria-checked', 'true');
    expect(onScopeChange).toHaveBeenCalledWith('shared');
  });

  it('keeps a controlled scope and reports save', async () => {
    const user = userEvent.setup();
    const onScopeChange = jest.fn();
    const onSave = jest.fn();

    render(
      <DesktopLayoutSettings
        scope="shared"
        deviceId="browser-1"
        onScopeChange={onScopeChange}
        onSave={onSave}
        saved
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save layout now' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('radio', { name: /Share with my devices/ })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('status')).toHaveTextContent('Layout saved');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DesktopLayoutSettings defaultScope="device" deviceId="browser-1" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('persists the selected scope', () => {
    window.localStorage.clear();
    const { result } = renderHook(() => useDesktopLayoutScope('desktop-settings-test'));

    expect(result.current[0]).toBe('device');

    act(() => result.current[1]('shared'));

    expect(result.current[0]).toBe('shared');
    expect(window.localStorage.getItem('desktop-settings-test')).toBe('shared');
  });
});
