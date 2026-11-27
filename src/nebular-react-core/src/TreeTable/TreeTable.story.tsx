import React, { useState } from 'react';
import { TreeTable, TreeTableColumn, TreeTableNode } from './TreeTable';

export default { title: 'TreeTable', component: TreeTable };

interface FileRow {
  name: string;
  type: string;
  size: string;
}

const columns: TreeTableColumn<FileRow>[] = [
  { key: 'name', title: 'Name' },
  { key: 'type', title: 'Type', width: 140 },
  { key: 'size', title: 'Size', width: 120, align: 'right' }
];

const data: TreeTableNode<FileRow>[] = [
  {
    id: 'src',
    data: { name: 'src', type: 'Folder', size: '—' },
    children: [
      {
        id: 'components',
        data: { name: 'components', type: 'Folder', size: '—' },
        children: [
          {
            id: 'button',
            data: { name: 'Button.tsx', type: 'File', size: '4.2 KB' }
          },
          {
            id: 'table',
            data: { name: 'Table.tsx', type: 'File', size: '6.8 KB' }
          }
        ]
      },
      {
        id: 'index',
        data: { name: 'index.ts', type: 'File', size: '1.1 KB' }
      }
    ]
  },
  {
    id: 'docs',
    data: { name: 'docs', type: 'Folder', size: '—' },
    children: [
      {
        id: 'readme',
        data: { name: 'README.md', type: 'File', size: '2.4 KB' }
      }
    ]
  }
];

export function Showcase() {
  return (
    <TreeTable
      data={data}
      columns={columns}
      defaultExpandedIds={['src']}
      selectable
      caption="Project files"
    />
  );
}

export function ControlledExpansion() {
  const [expanded, setExpanded] = useState<(string | number)[]>(['src', 'components']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>Expanded: {expanded.join(', ') || 'none'}</div>
      <TreeTable
        data={data}
        columns={columns}
        expandedIds={expanded}
        onExpandedChange={setExpanded}
        defaultSelectedId="components"
        selectable
        caption="Controlled tree table"
      />
    </div>
  );
}

const sortableColumns: TreeTableColumn<FileRow>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'type', title: 'Type', width: 140, sortable: true },
  {
    key: 'size',
    title: 'Size',
    width: 120,
    align: 'right',
    sortable: true,
    sortValue: (node) => Number.parseFloat(node.data.size) || 0
  }
];

export function CheckableAndSortable() {
  const [checked, setChecked] = useState<(string | number)[]>(['components']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <TreeTable
        data={data}
        columns={sortableColumns}
        checkable
        checkStrictly={false}
        checkedIds={checked}
        onCheckedChange={setChecked}
        defaultExpandedIds={['src', 'components']}
        caption="Select files and sort any column"
      />
      <span>Checked: {checked.join(', ') || 'none'}</span>
    </div>
  );
}
