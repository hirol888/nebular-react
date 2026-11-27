import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// Internal unit imported directly because the public entry point does not expose it yet.
import { SankeyChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const nodes = [
  { id: 'coal', label: 'Coal' },
  { id: 'gas', label: 'Gas' },
  { id: 'power', label: 'Power' },
  { id: 'heat', label: 'Heat' }
];

const links = [
  { source: 'coal', target: 'power', value: 40 },
  { source: 'gas', target: 'power', value: 20 },
  { source: 'gas', target: 'heat', value: 10 }
];

function numberAttribute(element: Element | null, attribute: string) {
  return Number(element?.getAttribute(attribute));
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-sankey-node], [data-sankey-link]')).map(
    (element) =>
      [
        element.getAttribute('data-sankey-node') ?? element.getAttribute('data-sankey-link'),
        element.getAttribute('x'),
        element.getAttribute('y'),
        element.getAttribute('width'),
        element.getAttribute('height'),
        element.getAttribute('d')
      ].join('|')
  );
}

describe('SankeyChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a focusable node per node and a focusable link per link', () => {
    render(<SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />);

    expect(screen.getByRole('group', { name: 'Energy flow' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(7);
    expect(screen.getByRole('img', { name: 'Coal: 40' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Gas: 30' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Power: 60' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Heat: 10' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Coal → Power: 40' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Gas → Power: 20' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Gas → Heat: 10' })).toBeInTheDocument();
  });

  it('should place nodes in deterministic topological layers', () => {
    render(<SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />);

    expect(screen.getByRole('img', { name: 'Coal: 40' })).toHaveAttribute('data-sankey-layer', '0');
    expect(screen.getByRole('img', { name: 'Gas: 30' })).toHaveAttribute('data-sankey-layer', '0');
    expect(screen.getByRole('img', { name: 'Power: 60' })).toHaveAttribute(
      'data-sankey-layer',
      '1'
    );
    expect(screen.getByRole('img', { name: 'Heat: 10' })).toHaveAttribute('data-sankey-layer', '1');
  });

  it('should size nodes and links proportionally to their values', () => {
    render(<SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />);

    const coal = screen.getByRole('img', { name: 'Coal: 40' });
    const gas = screen.getByRole('img', { name: 'Gas: 30' });
    const coalLink = screen.getByRole('img', { name: 'Coal → Power: 40' });
    const gasLink = screen.getByRole('img', { name: 'Gas → Power: 20' });

    expect(numberAttribute(coal, 'data-sankey-height')).toBeCloseTo(
      numberAttribute(gas, 'data-sankey-height') * (40 / 30),
      6
    );
    expect(numberAttribute(coalLink, 'data-sankey-thickness')).toBeCloseTo(
      numberAttribute(gasLink, 'data-sankey-thickness') * 2,
      6
    );
    expect(numberAttribute(coalLink, 'data-sankey-value')).toBe(40);
    expect(numberAttribute(gasLink, 'data-sankey-value')).toBe(20);
  });

  it('should stack nodes in a column with the configured padding', () => {
    const { rerender } = render(
      <SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />
    );

    const coal = screen.getByRole('img', { name: 'Coal: 40' });
    const gas = screen.getByRole('img', { name: 'Gas: 30' });

    expect(
      numberAttribute(gas, 'y') -
        (numberAttribute(coal, 'y') + numberAttribute(coal, 'data-sankey-height'))
    ).toBeCloseTo(10, 6);

    rerender(<SankeyChart nodes={nodes} links={links} nodePadding={24} ariaLabel="Energy flow" />);

    expect(
      numberAttribute(screen.getByRole('img', { name: 'Gas: 30' }), 'y') -
        (numberAttribute(screen.getByRole('img', { name: 'Coal: 40' }), 'y') +
          numberAttribute(screen.getByRole('img', { name: 'Coal: 40' }), 'data-sankey-height'))
    ).toBeCloseTo(24, 6);
  });

  it('should draw links as curved paths', () => {
    render(<SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />);

    const link = screen.getByRole('img', { name: 'Coal → Power: 40' });

    expect(link.getAttribute('d')).toContain('C');
    expect(link.getAttribute('d')).toContain('Z');
  });

  it('should show a tooltip on hover and focus of a node and of a link', () => {
    render(<SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />);

    const power = screen.getByRole('img', { name: 'Power: 60' });
    const link = screen.getByRole('img', { name: 'Coal → Power: 40' });

    expect(screen.queryByText('Power: 60')).not.toBeInTheDocument();

    fireEvent.mouseEnter(power);
    expect(screen.getByText('Power: 60')).toBeInTheDocument();

    fireEvent.blur(power);
    expect(screen.queryByText('Power: 60')).not.toBeInTheDocument();

    fireEvent.focus(power);
    expect(screen.getByText('Power: 60')).toBeInTheDocument();

    fireEvent.mouseEnter(link);
    expect(screen.getByText('Coal → Power: 40')).toBeInTheDocument();
  });

  it('should call onNodeClick and onLinkClick when nodes and links are activated', async () => {
    const user = userEvent.setup();
    const onNodeClick = jest.fn();
    const onLinkClick = jest.fn();

    render(
      <SankeyChart
        nodes={nodes}
        links={links}
        ariaLabel="Energy flow"
        onNodeClick={onNodeClick}
        onLinkClick={onLinkClick}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Power: 60' }));
    expect(onNodeClick).toHaveBeenCalledWith(nodes[2]);

    onNodeClick.mockClear();

    await user.click(screen.getByRole('button', { name: 'Coal → Power: 40' }));
    expect(onLinkClick).toHaveBeenCalledWith(links[0]);

    onLinkClick.mockClear();

    screen.getByRole('button', { name: 'Gas → Heat: 10' }).focus();
    await user.keyboard('{Enter}');
    expect(onLinkClick).toHaveBeenCalledWith(links[2]);
  });

  it('should apply the value formatter, custom height and node width', () => {
    const { container } = render(
      <SankeyChart
        nodes={nodes}
        links={links}
        height={400}
        nodeWidth={20}
        valueFormatter={(value: number) => `${value} TWh`}
        ariaLabel="Energy flow"
      />
    );

    const coal = screen.getByRole('img', { name: 'Coal: 40 TWh' });

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 400');
    expect(coal).toHaveAttribute('width', '20');
  });

  it('should render an empty state when there are no nodes', () => {
    const { container } = render(<SankeyChart nodes={[]} links={[]} ariaLabel="Empty sankey" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when there are no valid links', () => {
    const { container } = render(
      <SankeyChart nodes={nodes} links={[]} ariaLabel="No links sankey" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should ignore links that reference unknown nodes', () => {
    render(
      <SankeyChart
        nodes={nodes}
        links={[
          ...links,
          { source: 'coal', target: 'unknown', value: 999 },
          { source: 'coal', target: 'power', value: 0 }
        ]}
        ariaLabel="Energy flow"
      />
    );

    expect(screen.getAllByRole('img')).toHaveLength(7);
    expect(screen.queryByRole('img', { name: /unknown/ })).not.toBeInTheDocument();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(
      <SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />
    );
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <SankeyChart nodes={nodes} links={links} ariaLabel="Sankey" />
        <SankeyChart
          nodes={nodes}
          links={links}
          ariaLabel="Interactive sankey"
          onNodeClick={() => undefined}
          onLinkClick={() => undefined}
          valueFormatter={(value: number) => `${value} TWh`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table with node labels when showDataTable is visible', () => {
    render(
      <SankeyChart
        nodes={nodes}
        links={links}
        ariaLabel="Energy flow"
        showDataTable="visible"
        dataTableCaption="Energy flow data"
      />
    );

    const table = screen.getByRole('table', { name: 'Energy flow data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Source', 'Target', 'Value']);

    const rows = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      );

    expect(rows).toEqual([
      ['Coal', 'Power', '40'],
      ['Gas', 'Power', '20'],
      ['Gas', 'Heat', '10']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <SankeyChart
        nodes={nodes}
        links={links}
        ariaLabel="Energy flow"
        showDataTable="hidden"
        dataTableCaption="Energy flow data"
      />
    );

    expect(screen.getByRole('table', { name: 'Energy flow data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <SankeyChart
        nodes={nodes}
        links={links}
        ariaLabel="Energy flow"
        exportable
        exportFileName="energy-flow"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'energy-flow');
    expect(screen.getByRole('status')).toHaveTextContent('Exported energy-flow.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <SankeyChart
        nodes={nodes}
        links={links}
        ariaLabel="Energy flow"
        exportable
        exportFileName="energy-flow"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'energy-flow')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported energy-flow.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" animated />
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
      <SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" animated />
    );

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <SankeyChart
        nodes={nodes}
        links={links}
        ariaLabel="Accessible sankey"
        exportable
        exportFileName="sankey"
        showDataTable="visible"
        dataTableCaption="Sankey data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
