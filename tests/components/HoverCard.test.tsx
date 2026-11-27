import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { HoverCard } from '@nebular-react/core';

describe('HoverCard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('honors hover delays and cancels a pending close on reentry', () => {
    render(
      <HoverCard content="Account details" ariaLabel="Account" openDelay={200} closeDelay={100}>
        <button type="button">Profile</button>
      </HoverCard>
    );
    const trigger = screen.getByRole('button', { name: 'Profile' });
    fireEvent.mouseEnter(trigger);
    act(() => jest.advanceTimersByTime(199));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByRole('dialog', { name: 'Account' })).toBeVisible();

    fireEvent.mouseLeave(trigger);
    act(() => jest.advanceTimersByTime(99));
    fireEvent.mouseEnter(screen.getByRole('dialog'));
    act(() => jest.advanceTimersByTime(100));
    expect(screen.getByRole('dialog')).toBeVisible();

    fireEvent.mouseLeave(screen.getByRole('dialog'));
    act(() => jest.advanceTimersByTime(100));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['top', { bottom: 'calc(100% + 0.5rem)' }],
    ['bottom', { top: 'calc(100% + 0.5rem)' }],
    ['left', { right: 'calc(100% + 0.5rem)' }],
    ['right', { left: 'calc(100% + 0.5rem)' }]
  ] as const)('opens with focus at the configured %s position', (position, style) => {
    render(
      <HoverCard content="Details" openDelay={10} closeDelay={20} width="18rem" position={position}>
        <button type="button">Profile</button>
      </HoverCard>
    );
    const trigger = screen.getByRole('button', { name: 'Profile' });
    fireEvent.focus(trigger);
    act(() => jest.advanceTimersByTime(10));
    expect(screen.getByRole('dialog')).toHaveStyle({ ...style, width: '18rem' });

    fireEvent.blur(trigger);
    act(() => jest.advanceTimersByTime(20));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('cancels a pending open when unmounted', () => {
    const timerCount = jest.getTimerCount();
    const { unmount } = render(
      <HoverCard content="Account details">
        <button type="button">Profile</button>
      </HoverCard>
    );
    fireEvent.focus(screen.getByRole('button', { name: 'Profile' }));
    expect(jest.getTimerCount()).toBe(timerCount + 1);

    unmount();
    expect(jest.getTimerCount()).toBe(timerCount);
  });
});
