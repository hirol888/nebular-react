import React, { useState } from 'react';
import { Button } from '../Button';
import { NotificationCenter } from './NotificationCenter';
import type { NotificationItem } from './NotificationCenter';

export default { title: 'NotificationCenter', component: NotificationCenter };

const initialNotifications: NotificationItem[] = [
  {
    id: 'deploy',
    title: 'Deployment finished',
    message: 'Version 1.4.2 is live in production.',
    status: 'success',
    timestamp: '2026-11-18T12:00:00.000Z'
  },
  {
    id: 'comment',
    title: 'New comment',
    message: 'Ana replied to your review request.',
    status: 'info',
    timestamp: '2026-11-18T11:45:00.000Z'
  },
  {
    id: 'storage',
    title: 'Storage almost full',
    message: 'You are using 92% of the available storage.',
    status: 'warning',
    timestamp: '2026-11-17T18:30:00.000Z'
  },
  {
    id: 'billing',
    title: 'Payment failed',
    message: 'Update the payment method to avoid service interruption.',
    status: 'danger',
    timestamp: '2026-11-16T09:15:00.000Z',
    read: true
  }
];

export function Showcase() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [opened, setOpened] = useState<boolean>(false);

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <NotificationCenter
        notifications={notifications}
        opened={opened}
        onOpenChange={setOpened}
        onMarkAllRead={() =>
          setNotifications((current) => current.map((item) => ({ ...item, read: true })))
        }
        onClear={() => setNotifications([])}
        onNotificationClick={(id) =>
          setNotifications((current) =>
            current.map((item) => (item.id === id ? { ...item, read: true } : item))
          )
        }
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem' }}>{unreadCount} unread</span>
        <Button appearance="ghost" onClick={() => setNotifications(initialNotifications)}>
          Reset notifications
        </Button>
      </div>
    </div>
  );
}

export function Empty() {
  return (
    <NotificationCenter
      defaultOpened
      notifications={[]}
      emptyState="All caught up. You have no notifications."
    />
  );
}
