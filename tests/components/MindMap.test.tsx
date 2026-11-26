import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MindMap, MindMapNode } from '@nebular-react/core';

const tree: MindMapNode = {
  id: 'root',
  label: 'Product',
  children: [
    {
      id: 'design',
      label: 'Design',
      children: [
        { id: 'ux', label: 'UX Research' },
        { id: 'ui', label: 'UI Design' }
      ]
    },
    {
      id: 'eng',
      label: 'Engineering',
      children: [{ id: 'fe', label: 'Frontend' }]
    },
    {
      id: 'ops',
      label: 'Operations',
      children: [{ id: 'support', label: 'Support' }]
    },
    { id: 'sales', label: 'Sales' }
  ]
};

describe('MindMap', () => {
  it('MindMap_Render_ShouldShowCenteredRootAndSplitBranches', () => {
    const { container } = render(<MindMap root={tree} />);

    const treeElement = screen.getByRole('tree', { name: 'Mind map' });
    expect(treeElement).toHaveAttribute('data-orientation', 'horizontal');
    expect(treeElement).toHaveAttribute('aria-orientation', 'horizontal');

    const rootItem = screen.getByRole('treeitem', { name: 'Product' });
    expect(rootItem).toHaveAttribute('aria-level', '1');
    expect(rootItem).toHaveAttribute('aria-expanded', 'true');
    expect(rootItem).toHaveAttribute('data-mind-map-side', 'root');

    // Children are split into a left and a right branch around the center.
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute(
      'data-mind-map-side',
      'left'
    );
    expect(screen.getByRole('treeitem', { name: 'Engineering' })).toHaveAttribute(
      'data-mind-map-side',
      'left'
    );
    expect(screen.getByRole('treeitem', { name: 'Operations' })).toHaveAttribute(
      'data-mind-map-side',
      'right'
    );
    expect(screen.getByRole('treeitem', { name: 'Sales' })).toHaveAttribute(
      'data-mind-map-side',
      'right'
    );
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute('aria-level', '2');
    expect(container.querySelectorAll('[role="group"]')).toHaveLength(2);
  });

  it('MindMap_DefaultExpanded_ShouldOnlyShowDirectChildrenOfRoot', () => {
    render(<MindMap root={tree} />);

    expect(screen.getByRole('treeitem', { name: 'Design' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Sales' })).toBeInTheDocument();
    // Nested branches stay collapsed until their node is expanded.
    expect(screen.queryByRole('treeitem', { name: 'UX Research' })).not.toBeInTheDocument();
  });

  it('MindMap_Toggle_ShouldExpandAndCollapseBranchWithAriaExpanded', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();

    render(<MindMap root={tree} onExpandedChange={onExpandedChange} />);

    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await user.click(screen.getByRole('button', { name: 'Expand Design' }));

    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('treeitem', { name: 'UX Research' })).toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenLastCalledWith(['root', 'design']);

    await user.click(screen.getByRole('button', { name: 'Collapse Design' }));

    expect(screen.queryByRole('treeitem', { name: 'UX Research' })).not.toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenLastCalledWith(['root']);
  });

  it('MindMap_ToggleRoot_ShouldHideEveryBranch', async () => {
    const user = userEvent.setup();

    render(<MindMap root={tree} />);

    await user.click(screen.getByRole('button', { name: 'Collapse Product' }));

    expect(screen.getByRole('treeitem', { name: 'Product' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('treeitem', { name: 'Design' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand Product' }));

    expect(screen.getByRole('treeitem', { name: 'Design' })).toBeInTheDocument();
  });

  it('MindMap_KeyboardArrows_ShouldMoveFocusBetweenVisibleNodes', async () => {
    const user = userEvent.setup();

    render(<MindMap root={tree} />);

    const rootItem = screen.getByRole('treeitem', { name: 'Product' });
    rootItem.focus();
    expect(rootItem).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('treeitem', { name: 'Engineering' })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveFocus();
  });

  it('MindMap_KeyboardEnterAndSpace_ShouldSelectFocusedNode', async () => {
    const user = userEvent.setup();
    const onNodeClick = jest.fn();

    render(<MindMap root={tree} onNodeClick={onNodeClick} />);

    screen.getByRole('treeitem', { name: 'Design' }).focus();

    await user.keyboard('{Enter}');
    expect(onNodeClick).toHaveBeenCalledTimes(1);
    expect(onNodeClick.mock.calls[0][0]).toMatchObject({ id: 'design' });

    await user.keyboard(' ');
    expect(onNodeClick).toHaveBeenCalledTimes(2);
  });

  it('MindMap_KeyboardArrowRightLeft_ShouldExpandAndCollapseNode', async () => {
    const user = userEvent.setup();

    render(<MindMap root={tree} />);

    screen.getByRole('treeitem', { name: 'Design' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('treeitem', { name: 'UX Research' })).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('treeitem', { name: 'UX Research' })).not.toBeInTheDocument();
  });

  it('MindMap_CollapsibleFalse_ShouldAlwaysShowChildrenAndIgnoreArrowCollapse', async () => {
    const user = userEvent.setup();

    render(<MindMap root={tree} collapsible={false} />);

    expect(screen.getByRole('treeitem', { name: 'UX Research' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.queryByRole('button', { name: /^(Expand|Collapse) / })).not.toBeInTheDocument();

    screen.getByRole('treeitem', { name: 'Design' }).focus();
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('treeitem', { name: 'UX Research' })).toBeInTheDocument();
  });

  it('MindMap_NodeClick_ShouldNotifyWithClickedNode', async () => {
    const user = userEvent.setup();
    const onNodeClick = jest.fn();

    render(<MindMap root={tree} onNodeClick={onNodeClick} />);

    await user.click(screen.getByText('Engineering'));

    expect(onNodeClick).toHaveBeenCalledTimes(1);
    expect(onNodeClick.mock.calls[0][0]).toMatchObject({ id: 'eng' });
  });

  it('MindMap_RenderNode_ShouldReplaceDefaultLabel', () => {
    render(<MindMap root={tree} renderNode={(node) => <strong>Node {node.id}</strong>} />);

    expect(screen.getByRole('treeitem', { name: 'Node root' })).toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Node design' })).toBeInTheDocument();
    expect(screen.queryByText('Product')).not.toBeInTheDocument();
  });

  it('MindMap_DisabledNode_ShouldNotBeSelectable', async () => {
    const user = userEvent.setup();
    const onNodeClick = jest.fn();
    const disabledTree: MindMapNode = {
      id: 'root',
      label: 'Product',
      children: [{ id: 'design', label: 'Design', disabled: true }]
    };

    render(<MindMap root={disabledTree} onNodeClick={onNodeClick} />);

    const designNode = screen.getByRole('treeitem', { name: 'Design' });
    expect(designNode).toHaveAttribute('aria-disabled', 'true');
    expect(designNode).toHaveAttribute('tabindex', '-1');

    await user.click(screen.getByText('Design'));

    expect(onNodeClick).not.toHaveBeenCalled();
  });

  it('MindMap_RootWithoutChildren_ShouldRenderRootOnly', () => {
    const { container } = render(<MindMap root={{ id: 'solo', label: 'Solo idea' }} />);

    const rootItem = screen.getByRole('treeitem', { name: 'Solo idea' });
    expect(rootItem).toHaveAttribute('aria-level', '1');
    expect(rootItem).not.toHaveAttribute('aria-expanded');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[role="group"]')).toHaveLength(0);
  });

  it('MindMap_ExpandedIds_ShouldSupportControlledExpansion', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();

    const { rerender } = render(
      <MindMap root={tree} expandedIds={['root']} onExpandedChange={onExpandedChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Expand Design' }));

    expect(onExpandedChange).toHaveBeenLastCalledWith(['root', 'design']);
    // Controlled: still collapsed until the parent updates the prop.
    expect(screen.queryByRole('treeitem', { name: 'UX Research' })).not.toBeInTheDocument();

    rerender(
      <MindMap root={tree} expandedIds={['root', 'design']} onExpandedChange={onExpandedChange} />
    );

    expect(screen.getByRole('treeitem', { name: 'UX Research' })).toBeInTheDocument();
  });

  it('MindMap_OrientationVertical_ShouldExposeTopAndBottomBranches', () => {
    render(<MindMap root={tree} orientation="vertical" ariaLabel="Vertical map" />);

    const treeElement = screen.getByRole('tree', { name: 'Vertical map' });
    expect(treeElement).toHaveAttribute('data-orientation', 'vertical');
    expect(treeElement).toHaveAttribute('aria-orientation', 'vertical');

    expect(screen.getByRole('treeitem', { name: 'Design' })).toHaveAttribute(
      'data-mind-map-side',
      'top'
    );
    expect(screen.getByRole('treeitem', { name: 'Sales' })).toHaveAttribute(
      'data-mind-map-side',
      'bottom'
    );
  });

  it('MindMap_NodeColor_ShouldExposeAccentStyleVariable', () => {
    render(
      <MindMap
        root={{
          id: 'root',
          label: 'Product',
          children: [{ id: 'design', label: 'Design', color: '#ff5c5c' }]
        }}
      />
    );

    expect(
      screen
        .getByRole('treeitem', { name: 'Design' })
        .style.getPropertyValue('--mind-map-node-accent')
    ).toBe('#ff5c5c');
  });

  it('MindMap_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <MindMap
        root={tree}
        defaultExpandedIds={['root', 'design', 'eng']}
        onNodeClick={jest.fn()}
        ariaLabel="Team mind map"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
