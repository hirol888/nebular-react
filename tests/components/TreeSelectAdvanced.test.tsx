import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TreeSelect } from '@nebular-react/core';
import type { TreeSelectNode } from '@nebular-react/core';

const data: TreeSelectNode[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry', disabled: true }
    ]
  },
  {
    value: 'vegetables',
    label: 'Vegetables',
    children: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'potato', label: 'Potato' }
    ]
  }
];

const treeItem = (name: string): HTMLElement => screen.getByRole('treeitem', { name });

const openDropdown = async (user: ReturnType<typeof userEvent.setup>) => {
  const trigger = screen.getByRole('combobox', { name: 'Choose' });

  await user.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

  return trigger;
};

describe('TreeSelect checkable mode', () => {
  it('TreeSelect_Checkable_ShouldCascadeChecksAndTrackIndeterminate', async () => {
    const user = userEvent.setup();

    render(
      <TreeSelect data={data} ariaLabel="Choose" checkable defaultExpandedValues={['fruits']} />
    );

    const trigger = await openDropdown(user);

    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    expect(screen.getByRole('checkbox', { name: 'Select Apple' })).not.toBeChecked();

    await user.click(treeItem('Fruits'));

    expect(treeItem('Fruits')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Apple')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Banana')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Cherry')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('checkbox', { name: 'Select Fruits' })).toBeChecked();
    expect(trigger).toHaveValue('3 selected');

    await user.click(screen.getByRole('checkbox', { name: 'Select Banana' }));

    expect(treeItem('Fruits')).toHaveAttribute('aria-checked', 'mixed');
    expect(treeItem('Apple')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Banana')).toHaveAttribute('aria-checked', 'false');
    expect(trigger).toHaveValue('Apple');

    await user.click(screen.getByRole('checkbox', { name: 'Select Apple' }));

    expect(treeItem('Fruits')).toHaveAttribute('aria-checked', 'false');
    expect(treeItem('Apple')).toHaveAttribute('aria-checked', 'false');
    expect(trigger).toHaveValue('');
  });

  it('TreeSelect_CheckStrictly_ShouldOnlyToggleTheClickedNode', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        checkable
        checkStrictly
        defaultExpandedValues={['fruits']}
        onCheckedChange={onCheckedChange}
      />
    );

    await openDropdown(user);

    await user.click(treeItem('Fruits'));

    expect(treeItem('Fruits')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Apple')).toHaveAttribute('aria-checked', 'false');
    expect(treeItem('Banana')).toHaveAttribute('aria-checked', 'false');
    expect(onCheckedChange).toHaveBeenLastCalledWith(['fruits']);

    await user.click(treeItem('Apple'));

    expect(treeItem('Apple')).toHaveAttribute('aria-checked', 'true');
    expect(treeItem('Banana')).toHaveAttribute('aria-checked', 'false');
    expect(onCheckedChange).toHaveBeenLastCalledWith(['fruits', 'apple']);
  });

  it('TreeSelect_CheckableTrigger_ShouldShowLabelsAndClearCheckedValues', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        checkable
        clearable
        defaultCheckedValues={['apple', 'banana']}
        defaultExpandedValues={['fruits']}
        onCheckedChange={onCheckedChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });

    expect(trigger).toHaveValue('Apple, Banana');

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onCheckedChange).toHaveBeenLastCalledWith([]);
    expect(trigger).toHaveValue('');

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    expect(screen.getByRole('checkbox', { name: 'Select Apple' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select Banana' })).not.toBeChecked();
  });

  it('TreeSelect_CheckableKeyboard_ShouldToggleChecksAndKeepExpansion', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();

    render(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        checkable
        defaultExpandedValues={['fruits']}
        onCheckedChange={onCheckedChange}
      />
    );

    const trigger = await openDropdown(user);

    await user.keyboard('{ArrowDown}');

    expect(treeItem('Fruits')).toHaveAttribute('data-active', 'true');

    await user.keyboard(' ');

    expect(treeItem('Fruits')).toHaveAttribute('aria-checked', 'true');
    expect(trigger).toHaveValue('3 selected');

    await user.keyboard('{ArrowDown}');

    expect(treeItem('Apple')).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Enter}');

    expect(treeItem('Apple')).toHaveAttribute('aria-checked', 'false');
    expect(treeItem('Fruits')).toHaveAttribute('aria-checked', 'mixed');
    expect(onCheckedChange).toHaveBeenLastCalledWith(['banana']);

    await user.keyboard('{Home}');
    await user.keyboard('{ArrowLeft}');

    expect(treeItem('Fruits')).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowRight}');

    expect(treeItem('Fruits')).toHaveAttribute('aria-expanded', 'true');
  });

  it('TreeSelect_CheckableA11y_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <TreeSelect
        data={data}
        ariaLabel="Permissions"
        checkable
        clearable
        defaultCheckedValues={['apple']}
        defaultExpandedValues={['fruits']}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    const trigger = screen.getByRole('combobox', { name: 'Permissions' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    const pane = document.querySelector('.overlay-pane') as HTMLElement;
    expect(await axe(pane)).toHaveNoViolations();
  });
});

describe('TreeSelect async loading', () => {
  it('TreeSelect_LoadData_ShouldLoadChildrenOnceAndShowLoadingState', async () => {
    const user = userEvent.setup();
    let resolveChildren: (children: TreeSelectNode[]) => void = () => undefined;
    const loadData = jest.fn(
      () =>
        new Promise<TreeSelectNode[]>((resolve) => {
          resolveChildren = resolve;
        })
    );

    render(
      <TreeSelect
        data={[{ value: 'remote', label: 'Remote', hasChildren: true, children: [] }]}
        ariaLabel="Choose"
        loadData={loadData}
      />
    );

    await openDropdown(user);

    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    expect(loadData).toHaveBeenCalledWith(expect.objectContaining({ value: 'remote' }));
    expect(treeItem('Remote')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Loading children of Remote' })).toBeDisabled();

    await act(async () => {
      resolveChildren([
        { value: 'remote-a', label: 'Child A' },
        { value: 'remote-b', label: 'Child B' }
      ]);
    });

    expect(await screen.findByText('Child A')).toBeVisible();
    expect(screen.getByText('Child B')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Remote' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    expect(loadData).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Child A')).toBeVisible();
  });

  it('TreeSelect_LoadDataError_ShouldNotifyAndAllowRetry', async () => {
    const user = userEvent.setup();
    const onLoadError = jest.fn();
    const loadData = jest
      .fn<Promise<TreeSelectNode[]>, [TreeSelectNode]>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ value: 'remote-child', label: 'Recovered child' }]);

    render(
      <TreeSelect
        data={[{ value: 'remote', label: 'Remote', hasChildren: true }]}
        ariaLabel="Choose"
        loadData={loadData}
        onLoadError={onLoadError}
      />
    );

    await openDropdown(user);

    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    await waitFor(() => expect(onLoadError).toHaveBeenCalledTimes(1));
    expect(onLoadError.mock.calls[0][0]).toEqual(expect.objectContaining({ value: 'remote' }));
    expect(onLoadError.mock.calls[0][1]).toBeInstanceOf(Error);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Remote' }));
    fireEvent.click(screen.getByRole('button', { name: 'Expand Remote' }));

    expect(await screen.findByText('Recovered child')).toBeVisible();
    expect(loadData).toHaveBeenCalledTimes(2);
  });
});
