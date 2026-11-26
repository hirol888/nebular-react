import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('TreeSelect', () => {
  it('TreeSelect_Render_ShouldRenderLabelDescriptionAndPlaceholder', () => {
    render(
      <TreeSelect
        data={data}
        label="Category"
        description="Pick a category"
        placeholder="Select a node"
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Category' });

    expect(trigger).toHaveAttribute('placeholder', 'Select a node');
    expect(screen.getByText('Pick a category')).toBeInTheDocument();
  });

  it('TreeSelect_Open_ShouldExpandParentAndSelectLeaf', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TreeSelect data={data} ariaLabel="Choose" placeholder="Select a node" onChange={onChange} />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    const fruits = screen.getByRole('treeitem', { name: 'Fruits' });

    expect(fruits).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('treeitem', { name: 'Apple' })).not.toBeInTheDocument();

    await user.click(fruits);

    expect(fruits).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('treeitem', { name: 'Apple' }));

    expect(onChange).toHaveBeenCalledWith('apple');
    expect(trigger).toHaveValue('Apple');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    expect(screen.getByRole('treeitem', { name: 'Cherry' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    await user.click(screen.getByRole('treeitem', { name: 'Cherry' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('TreeSelect_Search_ShouldFilterNodesAndKeepAncestors', async () => {
    const user = userEvent.setup();

    render(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        placeholder="Select a node"
        searchable
        defaultExpandedValues={['fruits']}
        nothingFoundMessage="Nothing here"
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    const search = screen.getByRole('searchbox', { name: 'Search options' });
    await user.type(search, 'carrot');

    expect(screen.getByRole('treeitem', { name: 'Carrot' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Vegetables' })).toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: 'Fruits' })).not.toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: 'Banana' })).not.toBeInTheDocument();

    await user.clear(search);

    expect(screen.getByRole('treeitem', { name: 'Fruits' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Banana' })).toBeInTheDocument();

    await user.type(search, 'zzz');

    expect(screen.getByRole('status')).toHaveTextContent('Nothing here');
  });

  it('TreeSelect_Clearable_ShouldClearSelection', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        placeholder="Select a node"
        defaultValue="apple"
        clearable
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    expect(trigger).toHaveValue('Apple');

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(trigger).toHaveValue('');
  });

  it('TreeSelect_ControlledValueAndExpanded_ShouldFollowProps', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();

    const { rerender } = render(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        placeholder="Select a node"
        value="apple"
        expandedValues={['fruits']}
        onExpandedChange={onExpandedChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    expect(trigger).toHaveValue('Apple');

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    expect(screen.getByRole('treeitem', { name: 'Banana' })).toBeInTheDocument();

    await user.click(screen.getByRole('treeitem', { name: 'Fruits' }));

    expect(onExpandedChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole('treeitem', { name: 'Banana' })).toBeInTheDocument();

    rerender(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        placeholder="Select a node"
        value="carrot"
        expandedValues={['vegetables']}
        onExpandedChange={onExpandedChange}
      />
    );

    expect(trigger).toHaveValue('Carrot');
    expect(screen.getByRole('treeitem', { name: 'Carrot' })).toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: 'Banana' })).not.toBeInTheDocument();
  });

  it('TreeSelect_Keyboard_ShouldNavigateExpandSelectAndClose', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TreeSelect
        data={data}
        ariaLabel="Choose"
        placeholder="Select a node"
        defaultExpandedValues={['fruits']}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.keyboard('{ArrowDown}');

    const fruits = screen.getByRole('treeitem', { name: 'Fruits' });
    expect(fruits).toHaveAttribute('data-active', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(fruits).toHaveAttribute('aria-expanded', 'false');

    await user.keyboard('{ArrowRight}');
    expect(fruits).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('treeitem', { name: 'Apple' })).toHaveAttribute('data-active', 'true');

    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('apple');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');

    expect(screen.getByRole('treeitem', { name: 'Vegetables' })).toHaveAttribute(
      'data-active',
      'true'
    );

    await user.keyboard('{Escape}');

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(trigger).toHaveFocus();
  });

  it('TreeSelect_ClickOutside_ShouldCloseDropdown', async () => {
    const user = userEvent.setup();

    render(
      <>
        <TreeSelect data={data} ariaLabel="Choose" placeholder="Select a node" />
        <button type="button">Outside</button>
      </>
    );

    const trigger = screen.getByRole('combobox', { name: 'Choose' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
  });

  it('TreeSelect_Disabled_ShouldNotOpenDropdown', async () => {
    render(<TreeSelect data={data} ariaLabel="Choose" placeholder="Select a node" disabled />);

    const trigger = screen.getByRole('combobox', { name: 'Choose' });

    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('tree')).not.toBeInTheDocument();
  });

  it('TreeSelect_A11y_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <TreeSelect
        data={data}
        label="Category"
        description="Pick a category"
        placeholder="Select a node"
        searchable
        required
        defaultValue="apple"
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    const trigger = screen.getByRole('combobox', { name: 'Category' });
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    const pane = document.querySelector('.overlay-pane') as HTMLElement;
    expect(await axe(pane)).toHaveNoViolations();
  });
});
