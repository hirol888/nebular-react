import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NotificationCenter } from '@nebular-react/core';
import type { NotificationItem } from '@nebular-react/core';

const notifications: NotificationItem[] = [
  {
    id: 'deploy',
    title: 'Deployment finished',
    message: 'Version 1.4.2 is live',
    status: 'success',
    timestamp: '2026-11-18T12:00:00.000Z'
  },
  {
    id: 'comment',
    title: 'New comment',
    message: 'Ana replied to your review',
    status: 'info',
    timestamp: 1763467200000
  },
  {
    id: 'storage',
    title: 'Storage almost full',
    message: 'You are using 92% of the storage',
    status: 'warning',
    read: true
  }
];

describe('NotificationCenter', () => {
  it('renders only the trigger while closed', () => {
    render(<NotificationCenter notifications={notifications} />);

    const trigger = screen.getByRole('button', { name: 'Notifications' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the panel through the bell trigger', async () => {
    const user = userEvent.setup();

    render(<NotificationCenter notifications={notifications} />);

    await user.click(screen.getByRole('button', { name: 'Notifications' }));

    const trigger = screen.getByRole('button', { name: 'Notifications' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const dialog = screen.getByRole('dialog', { name: 'Notifications' });
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Deployment finished');
    expect(dialog).toHaveTextContent('New comment');
    expect(dialog).toHaveTextContent('Storage almost full');
    expect(dialog.querySelector('time')).toHaveAttribute('dateTime', '2026-11-18T12:00:00.000Z');
  });

  it('shows the unread count badge', () => {
    const { rerender } = render(<NotificationCenter notifications={notifications} />);

    expect(screen.getByRole('button', { name: 'Notifications' })).toHaveTextContent('2');

    rerender(
      <NotificationCenter notifications={notifications.map((item) => ({ ...item, read: true }))} />
    );

    expect(screen.getByRole('button', { name: 'Notifications' })).not.toHaveTextContent('2');
  });

  it('calls onMarkAllRead when marking all notifications as read', async () => {
    const user = userEvent.setup();
    const onMarkAllRead = jest.fn();

    render(
      <NotificationCenter
        notifications={notifications}
        defaultOpened
        onMarkAllRead={onMarkAllRead}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Mark all as read' }));

    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when clearing the notifications', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();

    render(<NotificationCenter notifications={notifications} defaultOpened onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('calls onNotificationClick and closes after selecting a notification', async () => {
    const user = userEvent.setup();
    const onNotificationClick = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <NotificationCenter
        notifications={notifications}
        defaultOpened
        onNotificationClick={onNotificationClick}
        onOpenChange={onOpenChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /Deployment finished/ }));

    expect(onNotificationClick).toHaveBeenCalledWith('deploy');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();

    render(<NotificationCenter notifications={notifications} defaultOpened />);

    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onOpenChange = jest.fn();

    render(
      <NotificationCenter notifications={notifications} defaultOpened onOpenChange={onOpenChange} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the empty state and hides the actions when there are no notifications', () => {
    render(
      <NotificationCenter
        notifications={[]}
        defaultOpened
        emptyState="All caught up. You have no notifications."
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Notifications' });
    expect(dialog).toHaveTextContent('All caught up. You have no notifications.');
    expect(screen.queryByRole('button', { name: 'Mark all as read' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notifications' })).not.toHaveTextContent('0');
  });

  it('supports a controlled open state', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    render(<NotificationCenter notifications={notifications} opened onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <NotificationCenter notifications={notifications} defaultOpened />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
