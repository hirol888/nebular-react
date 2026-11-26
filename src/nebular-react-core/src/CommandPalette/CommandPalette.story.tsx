import React, { useState } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { CommandPalette, CommandPaletteAction } from './CommandPalette';

export default { title: 'CommandPalette', component: CommandPalette };

const createActions = (onSelect: (id: string) => void): CommandPaletteAction[] => [
  {
    id: 'create-user',
    label: 'Create user',
    description: 'Open the user creation form',
    icon: <Icon icon="person-add-outline" pack="nebular-essentials" aria-hidden="true" />,
    keywords: ['new', 'invite'],
    onSelect: () => onSelect('create-user')
  },
  {
    id: 'settings',
    label: 'Open settings',
    description: 'Navigate to workspace settings',
    icon: <Icon icon="settings-outline" pack="nebular-essentials" aria-hidden="true" />,
    keywords: ['preferences', 'config'],
    onSelect: () => onSelect('settings')
  },
  {
    id: 'billing',
    label: 'Manage billing',
    description: 'Review invoices and payment methods',
    icon: <Icon icon="credit-card-outline" pack="nebular-essentials" aria-hidden="true" />,
    keywords: ['invoice', 'payment'],
    onSelect: () => onSelect('billing')
  }
];

export function Showcase() {
  const [opened, setOpened] = useState(false);
  const [lastAction, setLastAction] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setOpened(true)}>Open command palette</Button>
      <span>Last action: {lastAction}</span>
      <CommandPalette
        opened={opened}
        onClose={() => setOpened(false)}
        actions={createActions(setLastAction)}
      />
    </div>
  );
}

export function CustomMessages() {
  const [opened, setOpened] = useState(false);
  const [lastAction, setLastAction] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setOpened(true)}>Open search palette</Button>
      <span>Last action: {lastAction}</span>
      <CommandPalette
        opened={opened}
        onClose={() => setOpened(false)}
        actions={createActions(setLastAction)}
        placeholder="Search commands or keywords"
        nothingFoundMessage="Nothing matches your search"
        ariaLabel="Workspace command search"
      />
    </div>
  );
}

export function GroupedAndRecent() {
  const [opened, setOpened] = useState(false);
  const [lastAction, setLastAction] = useState('none');
  const allActions = createActions(setLastAction).map((action, index) => ({
    ...action,
    group: index === 0 ? 'People' : 'Workspace'
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setOpened(true)}>Open grouped palette</Button>
      <span>Last action: {lastAction}</span>
      <CommandPalette
        opened={opened}
        onClose={() => setOpened(false)}
        actions={allActions}
        recentActions={[allActions[1]]}
      />
    </div>
  );
}

export function AsyncSearch() {
  const [opened, setOpened] = useState(false);
  const [lastAction, setLastAction] = useState('none');
  const [actions, setActions] = useState<CommandPaletteAction[]>([]);
  const [loading, setLoading] = useState(false);

  const search = (query: string) => {
    if (!query.trim()) {
      setActions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setActions(
        createActions(setLastAction).filter((action) =>
          action.label.toLowerCase().includes(query.trim().toLowerCase())
        )
      );
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setOpened(true)}>Open async palette</Button>
      <span>Last action: {lastAction}</span>
      <CommandPalette
        opened={opened}
        onClose={() => setOpened(false)}
        actions={actions}
        onSearch={search}
        loading={loading}
        loadingMessage="Searching the workspace…"
        nothingFoundMessage="Type to search the workspace"
      />
    </div>
  );
}
