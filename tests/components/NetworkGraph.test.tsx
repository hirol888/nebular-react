import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { NetworkGraph, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const nodes = [
  { id: 'a', label: 'API', group: 'backend' },
  { id: 'b', label: 'Web', group: 'frontend' },
  { id: 'c', label: 'Worker', group: 'backend' },
  { id: 'd', label: 'Cache', group: 'data' }
];

const edges = [
  { source: 'a', target: 'b', label: 'HTTP' },
  { source: 'a', target: 'c', weight: 2 },
  { source: 'c', target: 'd' },
  { source: 'b', target: 'd', label: 'read' }
];

const WIDTH = 480;
const HEIGHT = 320;
const PADDING = 40;
const RING_RADIUS = Math.min(WIDTH, HEIGHT) / 2 - PADDING;

function numberAttribute(element: Element | null, attribute: string) {
  return Number(element?.getAttribute(attribute));
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-network-node], [data-network-edge]')).map(
    (element) =>
      [
        element.getAttribute('data-network-node') ?? element.getAttribute('data-network-edge'),
        element.getAttribute('cx'),
        element.getAttribute('cy'),
        element.getAttribute('x1'),
        element.getAttribute('y1'),
        element.getAttribute('x2'),
        element.getAttribute('y2')
      ].join('|')
  );
}

describe('NetworkGraph', () => {
  it('should render a focusable node per node and a focusable edge per edge', () => {
    render(<NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />);

    expect(screen.getByRole('group', { name: 'Service topology' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(8);

    expect(screen.getByRole('img', { name: 'API (backend)' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Web (frontend)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Worker (backend)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Cache (data)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'API → Web: HTTP' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'API → Worker' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Worker → Cache' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Web → Cache: read' })).toBeInTheDocument();
  });

  it('should place nodes on a circular layout by default', () => {
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 320');
    expect(container.querySelector('svg')).toHaveAttribute('data-network-layout', 'circular');

    const api = screen.getByRole('img', { name: 'API (backend)' });
    const web = screen.getByRole('img', { name: 'Web (frontend)' });
    const worker = screen.getByRole('img', { name: 'Worker (backend)' });
    const cache = screen.getByRole('img', { name: 'Cache (data)' });

    expect(api).toHaveAttribute('data-network-node', 'a');
    expect(numberAttribute(api, 'cx')).toBeCloseTo(WIDTH / 2, 6);
    expect(numberAttribute(api, 'cy')).toBeCloseTo(HEIGHT / 2 - RING_RADIUS, 6);

    expect(numberAttribute(web, 'cx')).toBeCloseTo(WIDTH / 2 + RING_RADIUS, 6);
    expect(numberAttribute(web, 'cy')).toBeCloseTo(HEIGHT / 2, 6);

    expect(numberAttribute(worker, 'cx')).toBeCloseTo(WIDTH / 2, 6);
    expect(numberAttribute(worker, 'cy')).toBeCloseTo(HEIGHT / 2 + RING_RADIUS, 6);

    expect(numberAttribute(cache, 'cx')).toBeCloseTo(WIDTH / 2 - RING_RADIUS, 6);
    expect(numberAttribute(cache, 'cy')).toBeCloseTo(HEIGHT / 2, 6);
  });

  it('should draw the edges behind the nodes', () => {
    const { container } = render(
      <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />
    );

    const elements = Array.from(
      container.querySelectorAll('[data-network-edge], [data-network-node]')
    ).map((element) => (element.hasAttribute('data-network-edge') ? 'edge' : 'node'));

    expect(elements).toEqual(['edge', 'edge', 'edge', 'edge', 'node', 'node', 'node', 'node']);

    const edge = screen.getByRole('img', { name: 'API → Web: HTTP' });

    expect(numberAttribute(edge, 'x1')).toBeCloseTo(WIDTH / 2, 6);
    expect(numberAttribute(edge, 'y1')).toBeCloseTo(HEIGHT / 2 - RING_RADIUS, 6);
    expect(numberAttribute(edge, 'x2')).toBeCloseTo(WIDTH / 2 + RING_RADIUS, 6);
    expect(numberAttribute(edge, 'y2')).toBeCloseTo(HEIGHT / 2, 6);
  });

  it('should keep the edge labels and the node labels visible', () => {
    render(<NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />);

    expect(screen.getByText('HTTP')).toBeInTheDocument();
    expect(screen.getByText('read')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Web')).toBeInTheDocument();
    expect(screen.getByText('Worker')).toBeInTheDocument();
    expect(screen.getByText('Cache')).toBeInTheDocument();
  });

  it('should produce a deterministic force layout inside the chart bounds', () => {
    const renderGraph = () => (
      <NetworkGraph nodes={nodes} edges={edges} layout="force" ariaLabel="Forced topology" />
    );

    const { container, unmount } = render(renderGraph());
    const first = signatures(container);

    expect(container.querySelector('svg')).toHaveAttribute('data-network-layout', 'force');

    const forcePositions = Array.from(container.querySelectorAll('[data-network-node]')).map(
      (element) => [numberAttribute(element, 'cx'), numberAttribute(element, 'cy')]
    );

    forcePositions.forEach(([cx, cy]) => {
      expect(cx).toBeGreaterThanOrEqual(PADDING);
      expect(cx).toBeLessThanOrEqual(WIDTH - PADDING);
      expect(cy).toBeGreaterThanOrEqual(PADDING);
      expect(cy).toBeLessThanOrEqual(HEIGHT - PADDING);
    });

    unmount();

    const { container: secondContainer } = render(renderGraph());

    expect(signatures(secondContainer)).toEqual(first);
    expect(
      Array.from(secondContainer.querySelectorAll('[data-network-node]')).map((element) =>
        numberAttribute(element, 'cx')
      )
    ).not.toEqual([WIDTH / 2, WIDTH / 2 + RING_RADIUS, WIDTH / 2, WIDTH / 2 - RING_RADIUS]);
  });

  it('should show a tooltip on hover and focus of a node and of an edge', () => {
    render(<NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />);

    const node = screen.getByRole('img', { name: 'API (backend)' });
    const edge = screen.getByRole('img', { name: 'Web → Cache: read' });

    expect(screen.queryByText('API (backend)')).not.toBeInTheDocument();

    fireEvent.mouseEnter(node);
    expect(screen.getByText('API (backend)')).toBeInTheDocument();

    fireEvent.blur(node);
    expect(screen.queryByText('API (backend)')).not.toBeInTheDocument();

    fireEvent.focus(node);
    expect(screen.getByText('API (backend)')).toBeInTheDocument();

    fireEvent.mouseEnter(edge);
    expect(screen.getByText('Web → Cache: read')).toBeInTheDocument();
  });

  it('should call onNodeClick on click and keyboard activation', () => {
    const onNodeClick = jest.fn();
    const { unmount } = render(
      <NetworkGraph
        nodes={nodes}
        edges={edges}
        ariaLabel="Service topology"
        onNodeClick={onNodeClick}
      />
    );

    expect(screen.getAllByRole('button')).toHaveLength(4);

    fireEvent.click(screen.getByRole('button', { name: 'Web (frontend)' }));
    expect(onNodeClick).toHaveBeenCalledWith(nodes[1]);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Worker (backend)' }), {
      key: 'Enter'
    });
    expect(onNodeClick).toHaveBeenLastCalledWith(nodes[2]);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Cache (data)' }), { key: ' ' });
    expect(onNodeClick).toHaveBeenLastCalledWith(nodes[3]);
    expect(onNodeClick).toHaveBeenCalledTimes(3);

    unmount();

    render(<NetworkGraph nodes={nodes} edges={edges} ariaLabel="Read only topology" />);

    expect(screen.getAllByRole('img')).toHaveLength(8);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should ignore edges that reference unknown nodes and self loops', () => {
    render(
      <NetworkGraph
        nodes={nodes}
        edges={[...edges, { source: 'a', target: 'missing' }, { source: 'b', target: 'b' }]}
        ariaLabel="Service topology"
      />
    );

    expect(screen.getAllByRole('img')).toHaveLength(8);
  });

  it('should render a legend for the node groups and hide it when showLegend is false', () => {
    const { rerender } = render(
      <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />
    );

    const legend = screen.getByRole('list', { name: 'Series' });
    const items = within(legend).getAllByRole('listitem');

    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText('backend')).toBeInTheDocument();
    expect(within(items[1]).getByText('frontend')).toBeInTheDocument();
    expect(within(items[2]).getByText('data')).toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'API (backend)' })).toHaveAttribute('fill', '#3366ff');
    expect(screen.getByRole('img', { name: 'Worker (backend)' })).toHaveAttribute(
      'fill',
      '#3366ff'
    );
    expect(screen.getByRole('img', { name: 'Web (frontend)' })).toHaveAttribute('fill', '#00d68f');

    rerender(
      <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" showLegend={false} />
    );

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should not render a legend when the nodes have no groups', () => {
    render(
      <NetworkGraph
        nodes={[
          { id: 'a', label: 'API' },
          { id: 'b', label: 'Web' }
        ]}
        edges={[{ source: 'a', target: 'b' }]}
        ariaLabel="Plain topology"
      />
    );

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should honor custom node radius and color', () => {
    render(
      <NetworkGraph
        nodes={[
          { id: 'a', label: 'API', radius: 18, color: '#123456' },
          { id: 'b', label: 'Web' }
        ]}
        edges={[{ source: 'a', target: 'b' }]}
        ariaLabel="Custom topology"
      />
    );

    const api = screen.getByRole('img', { name: 'API' });

    expect(api).toHaveAttribute('r', '18');
    expect(api).toHaveAttribute('fill', '#123456');
  });

  it('should render an empty state when there are no nodes', () => {
    const { container } = render(<NetworkGraph nodes={[]} edges={[]} ariaLabel="Empty topology" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Topology" />
        <NetworkGraph
          nodes={nodes}
          edges={edges}
          layout="force"
          ariaLabel="Interactive forced topology"
          onNodeClick={() => undefined}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('NetworkGraph data tables, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render accessible data tables when showDataTable is visible', () => {
    render(
      <NetworkGraph
        nodes={nodes}
        edges={edges}
        ariaLabel="Service topology"
        showDataTable="visible"
        dataTableCaption="Topology data"
      />
    );

    const edgeTable = screen.getByRole('table', { name: 'Topology data' });
    const nodeTable = screen.getByRole('table', { name: 'Topology data (nodes)' });

    expect(
      within(edgeTable)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Source', 'Target', 'Weight']);
    expect(within(edgeTable).getAllByRole('cell', { name: 'API' })).toHaveLength(2);
    expect(within(edgeTable).getAllByRole('cell', { name: 'Web' })).toHaveLength(2);
    expect(within(edgeTable).getByRole('cell', { name: '2' })).toBeInTheDocument();
    expect(within(edgeTable).getAllByRole('row')).toHaveLength(edges.length + 1);

    expect(
      within(nodeTable)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Node', 'Group']);
    expect(within(nodeTable).getAllByRole('cell', { name: 'backend' })).toHaveLength(2);
    expect(within(nodeTable).getAllByRole('row')).toHaveLength(nodes.length + 1);
  });

  it('should visually hide the data tables when showDataTable is hidden', () => {
    const { container } = render(
      <NetworkGraph
        nodes={nodes}
        edges={edges}
        ariaLabel="Service topology"
        showDataTable="hidden"
      />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Nodes' })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-visually-hidden="true"]')).toHaveLength(2);
  });

  it('should not render data tables or export controls by default', () => {
    render(<NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <NetworkGraph
        nodes={nodes}
        edges={edges}
        ariaLabel="Service topology"
        exportable
        exportFileName="topology"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'topology');
    expect(screen.getByRole('status')).toHaveTextContent('Exported topology.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported topology.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'topology',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" animated />
    );

    expect(container.firstChild).toHaveAttribute('data-animated', 'true');

    unmount();

    const originalMatchMedia = window.matchMedia;

    window.matchMedia = jest.fn().mockImplementation(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn()
        }) as unknown as MediaQueryList
    );

    const reduced = render(
      <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" animated />
    );

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data tables and export controls', async () => {
    const { container } = render(
      <NetworkGraph
        nodes={nodes}
        edges={edges}
        ariaLabel="Service topology"
        showDataTable="visible"
        dataTableCaption="Topology data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
