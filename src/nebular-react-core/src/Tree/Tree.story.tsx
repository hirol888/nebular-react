import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Tree, TreeNode } from './Tree';

export default { title: 'Tree', component: Tree };

const data: TreeNode[] = [
  {
    value: 'users',
    label: 'Users',
    icon: <Icon icon="people-outline" pack="nebular-essentials" aria-hidden="true" />,
    children: [
      { value: 'alice', label: 'Alice Johnson' },
      { value: 'bruno', label: 'Bruno Costa' },
      { value: 'carla', label: 'Carla Dias' }
    ]
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: <Icon icon="settings-outline" pack="nebular-essentials" aria-hidden="true" />,
    children: [
      { value: 'security', label: 'Security' },
      { value: 'notifications', label: 'Notifications' }
    ]
  },
  { value: 'reports', label: 'Reports' }
];

export function Showcase() {
  const [selected, setSelected] = useState<string[]>(['alice']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Tree
        ariaLabel="Workspace navigation"
        data={data}
        defaultExpandedValues={['users']}
        selectedValues={selected}
        onSelectionChange={setSelected}
      />
      <span>Selected nodes: {selected.join(', ') || 'none'}</span>
    </div>
  );
}

export function SingleSelect() {
  const [selected, setSelected] = useState<string[]>(['security']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Tree
        ariaLabel="Single selection tree"
        data={data}
        defaultExpandedValues={['users', 'settings']}
        multiSelect={false}
        selectedValues={selected}
        onSelectionChange={setSelected}
      />
      <span>Selected node: {selected[0] ?? 'none'}</span>
    </div>
  );
}

export function DisabledNodes() {
  const [expanded, setExpanded] = useState<string[]>(['users']);

  return (
    <Tree
      ariaLabel="Tree with disabled nodes"
      data={[
        {
          value: 'users',
          label: 'Users',
          children: [
            { value: 'alice', label: 'Alice Johnson' },
            { value: 'bruno', label: 'Bruno Costa', disabled: true },
            { value: 'carla', label: 'Carla Dias' }
          ]
        },
        { value: 'archive', label: 'Archive', disabled: true }
      ]}
      expandedValues={expanded}
      onExpandedChange={setExpanded}
    />
  );
}

export function Checkable() {
  const [checked, setChecked] = useState<string[]>(['alice']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Tree
        ariaLabel="Permissions"
        checkable
        data={[
          {
            value: 'users',
            label: 'Users',
            children: [
              { value: 'alice', label: 'Alice Johnson' },
              { value: 'bruno', label: 'Bruno Costa' },
              { value: 'carla', label: 'Carla Dias', disabled: true }
            ]
          },
          {
            value: 'settings',
            label: 'Settings',
            children: [
              { value: 'security', label: 'Security' },
              { value: 'notifications', label: 'Notifications' }
            ]
          }
        ]}
        defaultExpandedValues={['users', 'settings']}
        checkedValues={checked}
        onCheckedChange={setChecked}
      />
      <span>Checked nodes: {checked.join(', ') || 'none'}</span>
    </div>
  );
}

export function AsyncLoading() {
  return (
    <Tree
      ariaLabel="Remote tree"
      loadData={(node) =>
        new Promise<TreeNode[]>((resolve) => {
          setTimeout(() => {
            resolve([
              { value: `${node.value}-a`, label: `${node.label} A` },
              { value: `${node.value}-b`, label: `${node.label} B` }
            ]);
          }, 600);
        })
      }
      data={[
        { value: 'users', label: 'Users', hasChildren: true },
        { value: 'settings', label: 'Settings', hasChildren: true }
      ]}
    />
  );
}
