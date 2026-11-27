import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TreeTable, type TreeTableColumn, type TreeTableNode } from '@nebular-react/core';

interface Row {
  name: string;
  size: number;
}

const data: TreeTableNode<Row>[] = [
  {
    id: 'beta',
    data: { name: 'Beta', size: 2 }
  },
  {
    id: 'alpha',
    data: { name: 'Alpha', size: 3 },
    children: [
      { id: 'alpha-child', data: { name: 'Alpha child', size: 1 } },
      { id: 'beta-child', data: { name: 'Beta child', size: 4 } }
    ]
  }
];

const columns: TreeTableColumn<Row>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'size', title: 'Size', sortable: true }
];

function bodyRows(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('tbody tr')) as HTMLElement[];
}

describe('TreeTable sorting', () => {
  it('sorts siblings ascending and descending with aria-sort', async () => {
    const user = userEvent.setup();
    const onSortChange = jest.fn();
    const { container } = render(
      <TreeTable
        data={data}
        columns={columns}
        defaultExpandedIds={['alpha']}
        onSortChange={onSortChange}
      />
    );

    const header = screen.getByRole('columnheader', { name: /Name/ });
    expect(header).toHaveAttribute('aria-sort', 'none');

    await user.click(within(header).getByRole('button'));

    expect(onSortChange).toHaveBeenLastCalledWith('name', 'asc');
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(bodyRows(container)[0]).toHaveTextContent('Alpha');
    expect(bodyRows(container)[1]).toHaveTextContent('Alpha child');
    expect(bodyRows(container)[2]).toHaveTextContent('Beta child');
    expect(bodyRows(container)[3]).toHaveTextContent('Beta');

    await user.click(within(header).getByRole('button'));

    expect(onSortChange).toHaveBeenLastCalledWith('name', 'desc');
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(bodyRows(container)[0]).toHaveTextContent('Beta');
  });

  it('uses sortValue for derived values', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TreeTable
        data={data}
        columns={[
          { key: 'name', title: 'Name' },
          {
            key: 'size',
            title: 'Size',
            sortable: true,
            sortValue: (node) => node.data.size
          }
        ]}
      />
    );

    await user.click(screen.getByRole('columnheader', { name: /Size/ }));

    expect(bodyRows(container)[0]).toHaveTextContent('Beta');
    expect(bodyRows(container)[1]).toHaveTextContent('Alpha');
  });
});

describe('TreeTable checkboxes', () => {
  it('cascades checks and exposes indeterminate ancestors', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    const { container } = render(
      <TreeTable
        data={data}
        columns={columns}
        checkable
        defaultExpandedIds={['alpha']}
        onCheckedChange={onCheckedChange}
      />
    );

    const parent = screen.getByRole('checkbox', { name: 'Select Alpha' });
    await user.click(parent);

    expect(parent).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Alpha child' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Beta child' })).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(['alpha', 'alpha-child', 'beta-child']);

    const child = screen.getByRole('checkbox', { name: 'Select Beta child' });
    await user.click(child);

    expect(child).not.toBeChecked();
    expect(parent).not.toBeChecked();
    expect((parent as HTMLInputElement).indeterminate).toBe(true);
    expect(
      (container.querySelector('thead input[type="checkbox"]') as HTMLInputElement).indeterminate
    ).toBe(true);
  });

  it('selects and clears all rows from the header checkbox', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <TreeTable data={data} columns={columns} checkable defaultExpandedIds={['alpha']} />
    );

    const all = screen.getByRole('checkbox', { name: 'Select all rows' });
    await user.click(all);

    expect(all).toBeChecked();
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeChecked());

    await user.click(all);

    expect(all).not.toBeChecked();
    expect(bodyRows(container).length).toBeGreaterThan(0);
  });

  it('has no accessibility violations with checkboxes and sorting', async () => {
    const { container } = render(
      <TreeTable
        data={data}
        columns={columns}
        checkable
        defaultExpandedIds={['alpha']}
        defaultSortBy="name"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
