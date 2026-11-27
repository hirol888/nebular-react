import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { OrgChart, OrgNode } from '@nebular-react/core';

const nodes: OrgNode[] = [
  {
    id: 'ceo',
    title: 'Ada Lovelace',
    subtitle: 'Chief Executive Officer',
    avatar: <span data-testid="avatar-ceo">AL</span>,
    children: [
      {
        id: 'cto',
        title: 'Grace Hopper',
        subtitle: 'Chief Technology Officer',
        children: [
          { id: 'dev', title: 'Linus Torvalds', subtitle: 'Principal Engineer' },
          { id: 'qa', title: 'Margaret Hamilton', subtitle: 'QA Lead' }
        ]
      },
      { id: 'cfo', title: 'Katherine Johnson', subtitle: 'Chief Financial Officer' }
    ]
  }
];

describe('OrgChart', () => {
  it('OrgChart_Render_ShouldShowNodesDetailsAndExpandedBranches', () => {
    render(<OrgChart nodes={nodes} defaultExpandedIds={['ceo']} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Chief Executive Officer')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-ceo')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Katherine Johnson')).toBeInTheDocument();

    // Grandchildren stay hidden until their branch is expanded.
    expect(screen.queryByText('Linus Torvalds')).not.toBeInTheDocument();
  });

  it('OrgChart_Toggle_ShouldExpandAndCollapseBranchWithAriaExpanded', async () => {
    const user = userEvent.setup();

    render(<OrgChart nodes={nodes} defaultExpandedIds={['ceo']} />);

    const expand = screen.getByRole('button', { name: 'Expand Grace Hopper' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');

    await user.click(expand);

    expect(screen.getByText('Linus Torvalds')).toBeInTheDocument();
    expect(screen.getByText('Margaret Hamilton')).toBeInTheDocument();

    const collapse = screen.getByRole('button', { name: 'Collapse Grace Hopper' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');

    await user.click(collapse);

    expect(screen.queryByText('Linus Torvalds')).not.toBeInTheDocument();
  });

  it('OrgChart_NodeClick_ShouldNotifyWithClickedNode', async () => {
    const user = userEvent.setup();
    const onNodeClick = jest.fn();

    render(<OrgChart nodes={nodes} onNodeClick={onNodeClick} defaultExpandedIds={['ceo']} />);

    await user.click(screen.getByRole('button', { name: /^Ada Lovelace/ }));

    expect(onNodeClick).toHaveBeenCalledTimes(1);
    expect(onNodeClick.mock.calls[0][0]).toMatchObject({ id: 'ceo' });
  });

  it('OrgChart_Keyboard_ShouldExpandCollapseAndMoveFocus', async () => {
    const user = userEvent.setup();
    const onNodeClick = jest.fn();

    render(<OrgChart nodes={nodes} onNodeClick={onNodeClick} defaultExpandedIds={['ceo']} />);

    const ceoCard = screen.getByRole('button', { name: /^Ada Lovelace/ });
    ceoCard.focus();

    await user.keyboard('{ArrowDown}');

    const ctoCard = screen.getByRole('button', { name: /^Grace Hopper/ });
    expect(ctoCard).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Linus Torvalds')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByText('Linus Torvalds')).not.toBeInTheDocument();
  });

  it('OrgChart_RenderNode_ShouldReplaceDefaultCardContent', () => {
    render(
      <OrgChart
        nodes={nodes}
        defaultExpandedIds={['ceo']}
        renderNode={(node) => <span>Custom {node.id}</span>}
      />
    );

    expect(screen.getByText('Custom ceo')).toBeInTheDocument();
    expect(screen.getByText('Custom cto')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });

  it('OrgChart_ExpandedIds_ShouldSupportControlledExpansion', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();

    const { rerender } = render(
      <OrgChart nodes={nodes} expandedIds={['ceo']} onExpandedChange={onExpandedChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Expand Grace Hopper' }));

    expect(onExpandedChange).toHaveBeenCalledWith(['ceo', 'cto']);
    // Controlled: still collapsed until the parent updates the prop.
    expect(screen.queryByText('Linus Torvalds')).not.toBeInTheDocument();

    rerender(
      <OrgChart nodes={nodes} expandedIds={['ceo', 'cto']} onExpandedChange={onExpandedChange} />
    );

    expect(screen.getByText('Linus Torvalds')).toBeInTheDocument();
  });

  it('OrgChart_CollapsibleFalse_ShouldAlwaysShowChildren', () => {
    render(<OrgChart nodes={nodes} collapsible={false} />);

    expect(screen.getByText('Linus Torvalds')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(Expand|Collapse) / })).not.toBeInTheDocument();
  });

  it('OrgChart_DisabledNode_ShouldNotFireNodeClick', async () => {
    const user = userEvent.setup();
    const onNodeClick = jest.fn();

    render(
      <OrgChart
        nodes={[{ id: 'solo', title: 'Solo Contributor', disabled: true }]}
        onNodeClick={onNodeClick}
      />
    );

    const card = screen.getByRole('button', { name: 'Solo Contributor' });
    expect(card).toBeDisabled();

    await user.click(card);

    expect(onNodeClick).not.toHaveBeenCalled();
  });

  it('OrgChart_Empty_ShouldRenderDefaultAndCustomEmptyState', () => {
    const { rerender } = render(<OrgChart nodes={[]} />);

    expect(screen.getByText('No people to display')).toBeInTheDocument();

    rerender(<OrgChart nodes={[]} emptyState={<span>Nothing to show</span>} />);

    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  it('OrgChart_Orientation_ShouldExposeLayoutDirection', () => {
    render(<OrgChart nodes={nodes} orientation="horizontal" ariaLabel="Company chart" />);

    expect(screen.getByRole('group', { name: 'Company chart' })).toHaveAttribute(
      'data-orientation',
      'horizontal'
    );
  });

  it('OrgChart_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <OrgChart
        nodes={nodes}
        defaultExpandedIds={['ceo', 'cto']}
        onNodeClick={jest.fn()}
        ariaLabel="Company chart"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
