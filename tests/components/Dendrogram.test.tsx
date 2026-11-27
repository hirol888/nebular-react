import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Dendrogram, layoutDendrogram } from '@nebular-react/core';

const data = {
  id: 'root',
  label: 'All',
  distance: 10,
  children: [
    {
      id: 'a',
      label: 'A',
      distance: 4,
      children: [
        { id: 'a1', label: 'A1' },
        { id: 'a2', label: 'A2' }
      ]
    },
    {
      id: 'b',
      label: 'B',
      distance: 6,
      children: [
        { id: 'b1', label: 'B1' },
        { id: 'b2', label: 'B2' },
        { id: 'b3', label: 'B3' }
      ]
    }
  ]
};

type Layout = ReturnType<typeof layoutDendrogram>;
type LayoutNode = Layout['nodes'][number];

function findNode(layout: Layout, id: string): LayoutNode {
  const node = layout.nodes.find((item) => item.id === id);

  if (!node) {
    throw new Error(`Node ${id} was not laid out`);
  }

  return node;
}

function findLabeled(layout: Layout, label: string): LayoutNode {
  const node = layout.nodes.find((item) => item.label === label);

  if (!node) {
    throw new Error(`Node ${label} was not laid out`);
  }

  return node;
}

describe('layoutDendrogram', () => {
  it('should produce a deterministic layout', () => {
    const options = { width: 480, height: 320 };

    expect(layoutDendrogram(data, options)).toEqual(layoutDendrogram(data, options));
    expect(layoutDendrogram(data).nodes).toEqual(layoutDendrogram(data).nodes);
  });

  it('should lay out one node per entry and one link per non root node', () => {
    const layout = layoutDendrogram(data);

    expect(layout.nodes).toHaveLength(8);
    expect(layout.links).toHaveLength(7);
    expect(layout.nodes.map((node) => node.label)).toEqual([
      'All',
      'A',
      'A1',
      'A2',
      'B',
      'B1',
      'B2',
      'B3'
    ]);
    expect(findNode(layout, 'root').parentId).toBeNull();
    expect(findNode(layout, 'a1').parentId).toBe('a');
    expect(findNode(layout, 'root').isLeaf).toBe(false);
    expect(findNode(layout, 'b3').isLeaf).toBe(true);
  });

  it('should distribute the leaves evenly on the category axis', () => {
    const layout = layoutDendrogram(data, { width: 480, height: 320 });
    const leaves = layout.nodes.filter((node) => node.isLeaf);

    expect(leaves).toHaveLength(5);
    expect(leaves[0].x).toBeCloseTo(70.4, 2);
    expect(leaves[4].x).toBeCloseTo(409.6, 2);

    leaves.slice(1).forEach((leaf, index) => {
      expect(leaf.x - leaves[index].x).toBeCloseTo(84.8, 2);
    });

    leaves.forEach((leaf) => {
      expect(leaf.x).toBeGreaterThan(28);
      expect(leaf.x).toBeLessThan(480 - 28);
    });
  });

  it('should normalize the distance by the largest distance', () => {
    const layout = layoutDendrogram(data, { width: 480, height: 320 });

    expect(layout.maxDistance).toBe(10);
    expect(findNode(layout, 'root').normalizedDistance).toBeCloseTo(1, 6);
    expect(findNode(layout, 'b').normalizedDistance).toBeCloseTo(0.6, 6);
    expect(findNode(layout, 'a').normalizedDistance).toBeCloseTo(0.4, 6);
    expect(findNode(layout, 'a1').normalizedDistance).toBe(0);

    // The root sits at the top edge and the leaves at the bottom edge.
    expect(findNode(layout, 'root').y).toBe(28);
    expect(findNode(layout, 'b').y).toBeCloseTo(133.6, 2);
    expect(findNode(layout, 'a').y).toBeCloseTo(186.4, 2);
    expect(findNode(layout, 'a1').y).toBe(292);
  });

  it('should center internal nodes between their children', () => {
    const layout = layoutDendrogram(data, { width: 480, height: 320 });

    expect(findNode(layout, 'a').x).toBeCloseTo(112.8, 2);
    expect(findNode(layout, 'b').x).toBeCloseTo(324.8, 2);
    expect(findNode(layout, 'root').x).toBeCloseTo(218.8, 2);
  });

  it('should build orthogonal elbow links between parents and children', () => {
    const layout = layoutDendrogram(data, { width: 480, height: 320 });
    const link = layout.links.find((item) => item.childId === 'a1');

    expect(link?.parentId).toBe('a');
    expect(link?.path).toBe('M 112.8 186.4 L 112.8 292 L 70.4 292');
  });

  it('should place the root on the requested side and the leaves on the far side', () => {
    const top = layoutDendrogram(data, { orientation: 'top' });
    const bottom = layoutDendrogram(data, { orientation: 'bottom' });
    const left = layoutDendrogram(data, { orientation: 'left' });
    const right = layoutDendrogram(data, { orientation: 'right' });

    expect(findNode(top, 'root').y).toBe(28);
    expect(findNode(top, 'a1').y).toBe(292);

    expect(findNode(bottom, 'root').y).toBe(292);
    expect(findNode(bottom, 'a1').y).toBe(28);

    expect(findNode(left, 'root').x).toBe(28);
    expect(findNode(left, 'a1').x).toBe(452);

    expect(findNode(right, 'root').x).toBe(452);
    expect(findNode(right, 'a1').x).toBe(28);
  });

  it('should swap the category axis for horizontal orientations', () => {
    const top = layoutDendrogram(data, { width: 480, height: 320 });
    const left = layoutDendrogram(data, { width: 480, height: 320, orientation: 'left' });

    expect(findNode(top, 'a1').x).toBeCloseTo(70.4, 2);
    expect(findNode(left, 'a1').y).toBeCloseTo(54.4, 2);
    expect(findNode(left, 'a1').x).toBe(452);
  });

  it('should fall back to the depth when no distance is provided', () => {
    const layout = layoutDendrogram({
      label: 'root',
      children: [{ label: 'leaf', children: [{ label: 'deep' }] }]
    });

    expect(layout.maxDistance).toBe(0);
    expect(findLabeled(layout, 'root').normalizedDistance).toBeCloseTo(1, 6);
    expect(findLabeled(layout, 'leaf').normalizedDistance).toBeCloseTo(0.5, 6);
    expect(findLabeled(layout, 'deep').normalizedDistance).toBe(0);
  });

  it('should return an empty layout when there is nothing to draw', () => {
    expect(layoutDendrogram(undefined).nodes).toEqual([]);
    expect(layoutDendrogram({}).nodes).toEqual([]);
  });
});

describe('Dendrogram', () => {
  it('should render an accessible svg with a focusable node per entry', () => {
    const { container } = render(<Dendrogram data={data} ariaLabel="Clusters" />);

    expect(screen.getByRole('group', { name: 'Clusters' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 320');
    expect(screen.getAllByRole('img')).toHaveLength(8);
    expect(screen.getByRole('img', { name: 'All · 10' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'A · 4' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'B · 6' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'A1' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'B3' })).toBeInTheDocument();
  });

  it('should use the default aria label and accept custom dimensions', () => {
    const { container, unmount } = render(<Dendrogram data={data} />);

    expect(screen.getByRole('group', { name: 'Dendrogram' })).toBeInTheDocument();

    unmount();

    const { container: custom } = render(
      <Dendrogram data={data} width={600} height={360} ariaLabel="Wide clusters" />
    );

    expect(custom.querySelector('svg')).toHaveAttribute('viewBox', '0 0 600 360');
    expect(container.querySelector('svg')).not.toBe(custom.querySelector('svg'));
  });

  it('should position the nodes according to the layout', () => {
    render(<Dendrogram data={data} />);

    const root = screen.getByRole('img', { name: 'All · 10' });

    expect(root).toHaveAttribute('cx', '218.8');
    expect(root).toHaveAttribute('cy', '28');
    expect(screen.getByRole('img', { name: 'A1' })).toHaveAttribute('cx', '70.4');
    expect(screen.getByRole('img', { name: 'A1' })).toHaveAttribute('cy', '292');
  });

  it('should render the node labels and hide them when showLabels is false', () => {
    const { rerender } = render(<Dendrogram data={data} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('B3')).toBeInTheDocument();

    rerender(<Dendrogram data={data} showLabels={false} />);

    expect(screen.queryByText('All')).not.toBeInTheDocument();
    expect(screen.queryByText('A1')).not.toBeInTheDocument();
    expect(screen.queryByText('B3')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'A1' })).toBeInTheDocument();
  });

  it('should reflect the orientation on the container and the node positions', () => {
    const { container, rerender } = render(<Dendrogram data={data} />);

    expect(container.firstChild).toHaveAttribute('data-orientation', 'top');

    rerender(<Dendrogram data={data} orientation="right" />);

    expect(container.firstChild).toHaveAttribute('data-orientation', 'right');
    expect(screen.getByRole('img', { name: 'All · 10' })).toHaveAttribute('cx', '452');
    expect(screen.getByRole('img', { name: 'B3' })).toHaveAttribute('cx', '28');
  });

  it('should show a tooltip on hover and focus', () => {
    render(<Dendrogram data={data} />);

    const node = screen.getByRole('img', { name: 'B · 6' });

    expect(screen.queryByText('B · 6')).not.toBeInTheDocument();

    fireEvent.mouseEnter(node);
    expect(screen.getByText('B · 6')).toBeInTheDocument();

    fireEvent.mouseLeave(node);
    expect(screen.queryByText('B · 6')).not.toBeInTheDocument();

    fireEvent.focus(node);
    expect(screen.getByText('B · 6')).toBeInTheDocument();

    fireEvent.blur(node);
    expect(screen.queryByText('B · 6')).not.toBeInTheDocument();
  });

  it('should call onNodeClick with the original node on click and keyboard', () => {
    const onNodeClick = jest.fn();

    render(<Dendrogram data={data} onNodeClick={onNodeClick} />);

    const internal = screen.getByRole('button', { name: 'A · 4' });

    fireEvent.click(internal);
    expect(onNodeClick).toHaveBeenCalledTimes(1);
    expect(onNodeClick.mock.calls[0][0]).toBe(data.children[0]);

    fireEvent.keyDown(internal, { key: 'Enter' });
    fireEvent.keyDown(internal, { key: ' ' });
    expect(onNodeClick).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole('button', { name: 'B3' }));
    expect(onNodeClick).toHaveBeenCalledTimes(4);
    expect(onNodeClick.mock.calls[3][0]).toBe(data.children[1].children[2]);
  });

  it('should move the focus between nodes with the arrow keys', () => {
    render(<Dendrogram data={data} />);

    const nodes = screen.getAllByRole('img');

    act(() => nodes[0].focus());
    fireEvent.keyDown(nodes[0], { key: 'ArrowRight' });
    expect(nodes[1]).toHaveFocus();

    fireEvent.keyDown(nodes[1], { key: 'ArrowDown' });
    expect(nodes[2]).toHaveFocus();

    fireEvent.keyDown(nodes[2], { key: 'ArrowLeft' });
    expect(nodes[1]).toHaveFocus();

    fireEvent.keyDown(nodes[1], { key: 'ArrowUp' });
    expect(nodes[0]).toHaveFocus();

    fireEvent.keyDown(nodes[0], { key: 'ArrowUp' });
    expect(nodes[0]).toHaveFocus();
  });

  it('should apply the custom color to the links and nodes', () => {
    const { container } = render(<Dendrogram data={data} color="#abcdef" />);

    expect(container.querySelector('[data-dendrogram-link]')).toHaveAttribute('stroke', '#abcdef');
    expect(screen.getByRole('img', { name: 'All · 10' })).toHaveAttribute('fill', '#abcdef');
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<Dendrogram />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state for a node without content', () => {
    render(<Dendrogram data={{}} />);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Dendrogram data={data} ariaLabel="Clusters" />
        <Dendrogram
          data={data}
          orientation="left"
          ariaLabel="Interactive clusters"
          onNodeClick={() => undefined}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
