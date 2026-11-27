import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tree, TreeNode } from '@nebular-react/core';

const nodes: TreeNode[] = [
  {
    value: 'users',
    label: 'Users',
    icon: <span aria-hidden="true">●</span>,
    children: [
      { value: 'alice', label: 'Alice' },
      { value: 'archived', label: 'Archived user', disabled: true }
    ]
  },
  { value: 'reports', label: 'Reports' },
  {
    value: 'workspace',
    label: <span>Workspace</span>,
    children: [{ value: 'security', label: 'Security' }]
  }
];

describe('Tree', () => {
  it('expands and collapses branches without changing selection', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();
    const onSelectionChange = jest.fn();
    render(
      <Tree
        ariaLabel="Workspace navigation"
        data={nodes}
        onExpandedChange={onExpandedChange}
        onSelectionChange={onSelectionChange}
      />
    );
    const tree = screen.getByRole('tree', { name: 'Workspace navigation' });

    expect(within(tree).queryByRole('treeitem', { name: 'Alice' })).not.toBeInTheDocument();
    await user.click(within(tree).getByRole('button', { name: 'Expand Users' }));
    expect(within(tree).getByRole('treeitem', { name: 'Alice' })).toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenLastCalledWith(['users']);

    await user.click(within(tree).getByRole('button', { name: 'Collapse Users' }));
    expect(within(tree).queryByRole('treeitem', { name: 'Alice' })).not.toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('requests expansion when controlled and waits for the caller to update it', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();
    const { rerender } = render(
      <Tree data={nodes} expandedValues={[]} onExpandedChange={onExpandedChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Expand workspace' }));
    expect(onExpandedChange).toHaveBeenCalledWith(['workspace']);
    expect(screen.queryByRole('treeitem', { name: 'Security' })).not.toBeInTheDocument();

    rerender(
      <Tree data={nodes} expandedValues={['workspace']} onExpandedChange={onExpandedChange} />
    );
    expect(screen.getByRole('treeitem', { name: 'Security' })).toBeInTheDocument();
  });

  it('adds and removes a selection while leaving other selected nodes intact', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <Tree
        data={nodes}
        defaultExpandedValues={['users']}
        defaultSelectedValues={['reports']}
        onSelectionChange={onSelectionChange}
      />
    );
    const alice = screen.getByRole('treeitem', { name: 'Alice' });
    const reports = screen.getByRole('treeitem', { name: 'Reports' });

    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    await user.click(alice);
    expect(alice).toHaveAttribute('aria-selected', 'true');
    expect(reports).toHaveAttribute('aria-selected', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(['reports', 'alice']);

    await user.click(alice);
    expect(alice).toHaveAttribute('aria-selected', 'false');
    expect(onSelectionChange).toHaveBeenLastCalledWith(['reports']);
  });

  it('replaces selection in single-select mode and respects allowDeselect', async () => {
    const user = userEvent.setup();
    render(
      <Tree
        data={nodes}
        defaultExpandedValues={['users']}
        defaultSelectedValues={['reports']}
        multiSelect={false}
        allowDeselect={false}
      />
    );
    const alice = screen.getByRole('treeitem', { name: 'Alice' });
    const reports = screen.getByRole('treeitem', { name: 'Reports' });

    await user.click(alice);
    expect(alice).toHaveAttribute('aria-selected', 'true');
    expect(reports).toHaveAttribute('aria-selected', 'false');
    await user.click(alice);
    expect(alice).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tree')).not.toHaveAttribute('aria-multiselectable');
  });

  it('ignores pointer selection on disabled nodes', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <Tree data={nodes} defaultExpandedValues={['users']} onSelectionChange={onSelectionChange} />
    );
    const unavailable = screen.getByRole('treeitem', { name: 'Archived user' });

    expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await user.click(unavailable);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('selects a focused child without selecting its parent', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <Tree data={nodes} defaultExpandedValues={['users']} onSelectionChange={onSelectionChange} />
    );
    const alice = screen.getByRole('treeitem', { name: 'Alice' });

    alice.focus();
    await user.keyboard('{Enter}');

    expect(onSelectionChange.mock.calls).toEqual([[['alice']]]);
    expect(alice).toHaveAttribute('aria-selected', 'true');
  });

  it('lets Enter activate the expander without selecting the branch', async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(<Tree data={nodes} onSelectionChange={onSelectionChange} />);
    const expandUsers = screen.getByRole('button', { name: 'Expand Users' });

    expandUsers.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('treeitem', { name: 'Alice' })).toBeVisible();
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('expands and collapses a focused branch with arrow keys and selects with Enter and Space', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();
    const onSelectionChange = jest.fn();
    render(
      <Tree
        data={nodes}
        onExpandedChange={onExpandedChange}
        onSelectionChange={onSelectionChange}
      />
    );

    const users = screen.getByRole('treeitem', { name: /Users$/ });
    await user.tab();
    expect(users).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(users).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: 'Alice' })).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(users).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: 'Alice' })).not.toBeInTheDocument();
    expect(onExpandedChange.mock.calls).toEqual([[['users']], [[]]]);

    await user.keyboard('{Enter}');
    expect(users).toHaveAttribute('aria-selected', 'true');
    await user.keyboard(' ');
    expect(users).toHaveAttribute('aria-selected', 'false');
    expect(onSelectionChange.mock.calls).toEqual([[['users']], [[]]]);
  });
});
