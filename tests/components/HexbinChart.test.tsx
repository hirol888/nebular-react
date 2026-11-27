import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { HexbinChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { x: 10, y: 10 },
  { x: 10, y: 10 },
  { x: 10, y: 10 },
  { x: 50, y: 50 }
];

function signature(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-hexbin-bin]'))
    .map((bin) =>
      [
        bin.getAttribute('data-hexbin-q'),
        bin.getAttribute('data-hexbin-r'),
        bin.getAttribute('data-hexbin-count'),
        bin.getAttribute('points'),
        bin.getAttribute('fill')
      ].join(',')
    )
    .join('|');
}

describe('HexbinChart', () => {
  it('should bin the points into deterministic focusable hexagons', () => {
    const { container } = render(<HexbinChart data={data} ariaLabel="Density" />);

    expect(screen.getByRole('group', { name: 'Density' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Bin 1: 3 points' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Bin 2: 1 point' })).toBeInTheDocument();
    container.querySelectorAll('[data-hexbin-bin]').forEach((bin) => {
      const vertices = bin.getAttribute('points')?.trim().split(/\s+/);

      expect(vertices).toHaveLength(6);
    });
  });

  it('should produce the same bins regardless of the input order', () => {
    const { container, rerender } = render(<HexbinChart data={data} ariaLabel="Density" />);

    const before = signature(container);

    rerender(<HexbinChart data={[...data].reverse()} ariaLabel="Density" />);

    expect(signature(container)).toBe(before);
  });

  it('should scale the hexagon color between the lowest and highest bin count', () => {
    render(
      <HexbinChart
        data={data}
        colors={['#000000', '#ffffff']}
        ariaLabel="Scale"
        showLegend={false}
      />
    );

    expect(screen.getByRole('img', { name: 'Bin 1: 3 points' })).toHaveAttribute(
      'fill',
      'rgb(255, 255, 255)'
    );
    expect(screen.getByRole('img', { name: 'Bin 2: 1 point' })).toHaveAttribute(
      'fill',
      'rgb(0, 0, 0)'
    );
  });

  it('should render the axes, grid and labels with the requested size', () => {
    const { container } = render(
      <HexbinChart
        data={data}
        width={320}
        height={200}
        xLabel="Usage"
        yLabel="Revenue"
        ariaLabel="Axis"
      />
    );

    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('viewBox', '0 0 320 200');
    expect(screen.getByText('Usage')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(container.querySelectorAll('line').length).toBeGreaterThan(0);
  });

  it('should apply valueFormatter to the tooltip and bin label', () => {
    render(
      <HexbinChart
        data={data}
        ariaLabel="Density"
        showLegend={false}
        valueFormatter={(value: number) => value.toFixed(1)}
      />
    );

    const bin = screen.getByRole('img', { name: 'Bin 1: 3.0 points' });

    fireEvent.mouseEnter(bin);

    expect(screen.getByText('3.0 points')).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a bin', () => {
    render(<HexbinChart data={data} ariaLabel="Density" showLegend={false} />);

    const bin = screen.getByRole('img', { name: 'Bin 1: 3 points' });

    expect(screen.queryByText('3 points')).not.toBeInTheDocument();

    fireEvent.mouseEnter(bin);
    expect(screen.getByText('3 points')).toBeInTheDocument();

    fireEvent.blur(bin);
    expect(screen.queryByText('3 points')).not.toBeInTheDocument();

    fireEvent.focus(bin);
    expect(screen.getByText('3 points')).toBeInTheDocument();
  });

  it('should call onBinClick with the aggregated bin on click and keyboard activation', () => {
    const onBinClick = jest.fn();

    render(<HexbinChart data={data} ariaLabel="Density" onBinClick={onBinClick} />);

    const bin = screen.getByRole('button', { name: 'Bin 1: 3 points' });

    fireEvent.click(bin);

    expect(onBinClick).toHaveBeenCalledWith(expect.objectContaining({ count: 3 }));
    expect(Math.abs(onBinClick.mock.calls[0][0].x - 10)).toBeLessThan(4);
    expect(Math.abs(onBinClick.mock.calls[0][0].y - 10)).toBeLessThan(4);

    onBinClick.mockClear();
    fireEvent.keyDown(bin, { key: 'Enter' });
    expect(onBinClick).toHaveBeenCalledWith(expect.objectContaining({ count: 3 }));

    onBinClick.mockClear();
    fireEvent.keyDown(bin, { key: ' ' });
    expect(onBinClick).toHaveBeenCalledWith(expect.objectContaining({ count: 3 }));
  });

  it('should render the color scale legend and hide it when showLegend is false', () => {
    const { rerender } = render(<HexbinChart data={data} ariaLabel="Density" />);

    expect(screen.getByRole('group', { name: 'Color scale' })).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    rerender(<HexbinChart data={data} ariaLabel="Density" showLegend={false} />);

    expect(screen.queryByRole('group', { name: 'Color scale' })).not.toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<HexbinChart data={[]} ariaLabel="Empty hexbin" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <HexbinChart data={data} ariaLabel="Hexbin" />
        <HexbinChart data={data} ariaLabel="Interactive hexbin" onBinClick={() => undefined} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('HexbinChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <HexbinChart
        data={data}
        ariaLabel="Density"
        showDataTable="visible"
        dataTableCaption="Density data"
      />
    );

    const table = screen.getByRole('table', { name: 'Density data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['X', 'Y', 'Count']);
    expect(within(table).getByRole('cell', { name: '3' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '1' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(3);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <HexbinChart data={data} ariaLabel="Density" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<HexbinChart data={data} ariaLabel="Density" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(<HexbinChart data={data} ariaLabel="Density" exportable exportFileName="density" />);

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'density');
    expect(screen.getByRole('status')).toHaveTextContent('Exported density.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported density.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'density',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(<HexbinChart data={data} ariaLabel="Density" animated />);

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

    const reduced = render(<HexbinChart data={data} ariaLabel="Density" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <HexbinChart
        data={data}
        ariaLabel="Density"
        showDataTable="visible"
        dataTableCaption="Density data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
