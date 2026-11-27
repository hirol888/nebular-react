import React, { useState } from 'react';
import { Drawer } from '../Drawer';
import { ConfirmDialog } from '../ConfirmDialog';
import { CommandPalette } from '../CommandPalette';
import { HoverCard } from '../HoverCard';
import { Transfer } from '../Transfer';
import { Tree } from '../Tree';
import { Button } from '../Button';
import { Icon } from '../Icon';

export default { title: 'Catalog/Overlay and data components' };

export function DrawerShowcase() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open drawer</Button>
      <Drawer opened={opened} onClose={() => setOpened(false)} title="Filters">
        <p>Drawer content with filters and actions.</p>
      </Drawer>
    </>
  );
}

export function ConfirmDialogShowcase() {
  const [opened, setOpened] = useState(false);
  const [result, setResult] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button status="danger" onClick={() => setOpened(true)}>
        Delete record
      </Button>
      <div>Result: {result}</div>
      <ConfirmDialog
        opened={opened}
        title="Delete record?"
        message="This action cannot be undone."
        danger
        confirmLabel="Delete"
        onCancel={() => {
          setResult('cancelled');
          setOpened(false);
        }}
        onConfirm={() => {
          setResult('confirmed');
          setOpened(false);
        }}
      />
    </div>
  );
}

export function CommandPaletteShowcase() {
  const [opened, setOpened] = useState(false);
  const [lastAction, setLastAction] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setOpened(true)}>Open command palette</Button>
      <div>Last action: {lastAction}</div>
      <CommandPalette
        opened={opened}
        onClose={() => setOpened(false)}
        actions={[
          {
            id: 'new-user',
            label: 'Create user',
            description: 'Open the user creation form',
            icon: <Icon icon="person-add-outline" pack="nebular-essentials" />,
            onSelect: () => setLastAction('create-user')
          },
          {
            id: 'settings',
            label: 'Open settings',
            description: 'Navigate to workspace settings',
            icon: <Icon icon="settings-outline" pack="nebular-essentials" />,
            keywords: ['preferences', 'config'],
            onSelect: () => setLastAction('settings')
          }
        ]}
      />
    </div>
  );
}

export function HoverCardShowcase() {
  return (
    <HoverCard
      content={
        <div>
          <strong>Alice Johnson</strong>
          <div>Administrator · alice@example.com</div>
        </div>
      }
    >
      <Button appearance="ghost">Hover for profile</Button>
    </HoverCard>
  );
}

export function TransferShowcase() {
  const [value, setValue] = useState<string[]>(['write']);

  return (
    <Transfer
      value={value}
      onChange={setValue}
      data={[
        { value: 'read', label: 'Read' },
        { value: 'write', label: 'Write' },
        { value: 'delete', label: 'Delete' },
        { value: 'admin', label: 'Admin' }
      ]}
    />
  );
}

export function TreeShowcase() {
  return (
    <Tree
      defaultExpandedValues={['users']}
      data={[
        {
          value: 'users',
          label: 'Users',
          children: [
            { value: 'alice', label: 'Alice Johnson' },
            { value: 'bruno', label: 'Bruno Costa' }
          ]
        },
        {
          value: 'settings',
          label: 'Settings',
          children: [{ value: 'security', label: 'Security' }]
        }
      ]}
    />
  );
}
