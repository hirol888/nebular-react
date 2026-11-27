import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TreeTable, TreeTableColumn, TreeTableNode } from '@nebular-react/core';

interface FileRow {
  name: string;
  type: string;
}

const columns: TreeTableColumn<FileRow>[] = [
  { key: 'name', title: 'Name' },
  { key: 'type', title: 'Type' }
];

const data: TreeTableNode<FileRow>[] = [
  {
    id: 'src',
    data: { name: 'src', type: 'Folder' },
    children: [
      {
        id: 'components',
        data: { name: 'components', type: 'Folder' },
        children: [
          {
            id: 'button',
            data: { name: 'Button.tsx', type: 'File' }
          }
        ]
      }
    ]
  },
  {
    id: 'docs',
    data: { name: 'docs', type: 'Folder' },
    children: [{ id: 'readme', data: { name: 'README.md', type: 'File' } }]
  }
];

describe('TreeTable', () => {
  it('renders roots and expands hierarchical rows', async () => {
    const user = userEvent.setup();

    render(<TreeTable data={data} columns={columns} defaultExpandedIds={['src']} />);

    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('components')).toBeInTheDocument();
    expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand components' }));

    expect(screen.getByText('Button.tsx')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse src' }));

    expect(screen.queryByText('components')).not.toBeInTheDocument();
    expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();
  });

  it('renders configured columns and custom cells', () => {
    const customColumns: TreeTableColumn<FileRow>[] = [
      { key: 'name', title: 'Name' },
      {
        key: 'type',
        title: 'Kind',
        render: (node) => <strong>{node.data.type}</strong>
      }
    ];

    render(<TreeTable data={data} columns={customColumns} />);

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Kind' })).toBeInTheDocument();
    expect(screen.getAllByText('Folder').length).toBeGreaterThan(0);
  });

  it('selects rows when selectable', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(
      <TreeTable
        data={data}
        columns={columns}
        selectable
        onSelectionChange={onSelectionChange}
      />
    );

    await user.click(screen.getByRole('row', { name: /docs/ }));

    expect(onSelectionChange).toHaveBeenLastCalledWith('docs');
    expect(screen.getByRole('row', { name: /docs/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('supports keyboard expansion and selection', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();

    render(
      <TreeTable
        data={data}
        columns={columns}
        selectable
        defaultExpandedIds={['src']}
        onSelectionChange={onSelectionChange}
      />
    );

    const srcRow = screen.getByRole('row', { name: /src/ });
    srcRow.focus();

    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByText('components')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    expect(onSelectionChange).toHaveBeenLastCalledWith('src');
  });

  it('shows an empty state', () => {
    render(<TreeTable data={[]} columns={columns} emptyState="No files" />);

    expect(screen.getByText('No files')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TreeTable
        data={data}
        columns={columns}
        defaultExpandedIds={['src']}
        selectable
        caption="Files"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
