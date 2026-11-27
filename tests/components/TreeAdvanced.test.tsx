import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Tree, type TreeNode } from '@nebular-react/core';

const checkableData: TreeNode[] = [
  {
    value: 'root',
    label: 'Root',
    children: [
      { value: 'alpha', label: 'Alpha' },
      { value: 'beta', label: 'Beta' },
      { value: 'disabled', label: 'Disabled', disabled: true }
    ]
  }
];

function treeItem(name: string): HTMLElement {
  return screen.getByText(name).closest('[role="treeitem"]') as HTMLElement;
}

describe('Tree checkable mode', () => {
  it('cascades checks to enabled descendants and tracks indeterminate state', () => {
    render(
      <Tree
        ariaLabel="Permissions"
        checkable
        defaultExpandedValues={['root']}
        data={checkableData}
      />
    );

    fireEvent.click(treeItem('Root'));

    expect(treeItem('Root')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Alpha')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Beta')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Disabled')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(treeItem('Beta'));
    expect(treeItem('Root')).toHaveAttribute('aria-checked', 'mixed');
    expect(treeItem('Alpha')).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(treeItem('Beta'));
    expect(treeItem('Root')).toHaveAttribute('aria-checked', 'true');
  });

  it('supports strict checking without touching ancestors or siblings', () => {
    render(
      <Tree
        ariaLabel="Strict"
        checkable
        checkStrictly
        defaultExpandedValues={['root']}
        data={checkableData}
      />
    );

    fireEvent.click(treeItem('Root'));

    expect(treeItem('Root')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Alpha')).toHaveAttribute('aria-checked', 'false');
    expect(treeItem('Beta')).toHaveAttribute('aria-checked', 'false');
  });

  it('reports checked values through the callback', () => {
    const onCheckedChange = jest.fn();

    render(
      <Tree
        ariaLabel="Controlled"
        checkable
        defaultExpandedValues={['root']}
        data={checkableData}
        onCheckedChange={onCheckedChange}
      />
    );

    fireEvent.keyDown(treeItem('Alpha'), { key: ' ' });

    expect(onCheckedChange).toHaveBeenLastCalledWith(['alpha']);
  });

  it('has no accessibility violations in checkable mode', async () => {
    const { container } = render(
      <Tree
        ariaLabel="Permissions"
        checkable
        defaultCheckedValues={['alpha']}
        defaultExpandedValues={['root']}
        data={checkableData}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Tree async loading', () => {
  it('loads children when a lazy node is expanded, once', async () => {
    let resolveChildren: (children: TreeNode[]) => void = () => undefined;
    const loadData = jest.fn(
      () =>
        new Promise<TreeNode[]>((resolve) => {
          resolveChildren = resolve;
        })
    );

    render(
      <Tree
        ariaLabel="Remote"
        data={[{ value: 'remote', label: 'Remote', hasChildren: true }]}
        loadData={loadData}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    expect(loadData).toHaveBeenCalledWith(expect.objectContaining({ value: 'remote' }));
    expect(screen.getByRole('button', { name: 'Loading children Remote' })).toBeDisabled();

    resolveChildren([
      { value: 'child-a', label: 'Child A' },
      { value: 'child-b', label: 'Child B' }
    ]);

    expect(await screen.findByText('Child A')).toBeVisible();
    expect(screen.getByText('Child B')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Remote' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    expect(loadData).toHaveBeenCalledTimes(1);
  });

  it('reports load errors and allows a retry', async () => {
    const onLoadError = jest.fn();
    const loadData = jest
      .fn<Promise<TreeNode[]>, [TreeNode]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ value: 'remote-child', label: 'Recovered child' }]);

    render(
      <Tree
        ariaLabel="Remote"
        data={[{ value: 'remote', label: 'Remote', hasChildren: true }]}
        loadData={loadData}
        onLoadError={onLoadError}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    await waitFor(() => expect(onLoadError).toHaveBeenCalledTimes(1));
    expect(onLoadError.mock.calls[0][0]).toEqual(expect.objectContaining({ value: 'remote' }));

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Remote' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    expect(await screen.findByText('Recovered child')).toBeVisible();
    expect(loadData).toHaveBeenCalledTimes(2);
  });
});
