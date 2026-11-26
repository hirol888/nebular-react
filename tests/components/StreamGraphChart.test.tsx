import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { StreamGraphChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const labels = ['Q1', 'Q2'];
const series = [
  { name: 'Direct', data: [10, 20] },
  { name: 'Organic', data: [30, 10] }
];

const HEIGHT = 280;
const PADDING = { top: 16, bottom: 32 };
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const HALF_MAX = 20;

function y(value: number) {
  return PADDING.top + PLOT_HEIGHT - ((value + HALF_MAX) / (HALF_MAX * 2)) * PLOT_HEIGHT;
}

describe('StreamGraphChart', () => {
  it('should render a focusable point per series and label', () => {
    render(<StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />);

    expect(screen.getByRole('group', { name: 'Traffic sources' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('img', { name: 'Direct, Q1: 10' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Organic, Q2: 10' })).toBeInTheDocument();
  });

  it('should stack the layers around a centered baseline', () => {
    render(<StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />);

    // Q1 has a total of 40, so Direct spans -20..-10 and Organic spans -10..20.
    expect(
      Number(screen.getByRole('img', { name: 'Direct, Q1: 10' }).getAttribute('cy'))
    ).toBeCloseTo(y(-15), 6);
    expect(
      Number(screen.getByRole('img', { name: 'Organic, Q1: 30' }).getAttribute('cy'))
    ).toBeCloseTo(y(5), 6);

    // Q2 has a total of 30, so Direct spans -15..5 and Organic spans 5..15.
    expect(
      Number(screen.getByRole('img', { name: 'Direct, Q2: 20' }).getAttribute('cy'))
    ).toBeCloseTo(y(-5), 6);
    expect(
      Number(screen.getByRole('img', { name: 'Organic, Q2: 10' }).getAttribute('cy'))
    ).toBeCloseTo(y(10), 6);

    // The first series sits below the second one.
    expect(
      Number(screen.getByRole('img', { name: 'Direct, Q1: 10' }).getAttribute('cy'))
    ).toBeGreaterThan(
      Number(screen.getByRole('img', { name: 'Organic, Q1: 30' }).getAttribute('cy'))
    );
  });

  it('should draw a smooth closed area per series', () => {
    const { container } = render(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />
    );
    const layers = Array.from(container.querySelectorAll('[data-stream-layer]'));

    expect(layers).toHaveLength(2);
    expect(layers[0]).toHaveAttribute('data-stream-layer', 'Direct');
    expect(layers[1]).toHaveAttribute('data-stream-layer', 'Organic');

    layers.forEach((layer) => {
      const path = layer.getAttribute('d') ?? '';

      expect(path.startsWith('M ')).toBe(true);
      expect(path).toContain(' C ');
      expect(path.endsWith(' Z')).toBe(true);
    });
  });

  it('should render the centered baseline', () => {
    const { container } = render(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />
    );
    const baseline = container.querySelector('[data-stream-baseline]');

    expect(baseline).not.toBeNull();
    expect(Number(baseline?.getAttribute('y1'))).toBeCloseTo(y(0), 6);
    expect(Number(baseline?.getAttribute('y2'))).toBeCloseTo(y(0), 6);
  });

  it('should show a tooltip on hover and focus of a point', () => {
    render(<StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />);

    const point = screen.getByRole('img', { name: 'Direct, Q1: 10' });

    expect(screen.queryByText('Direct · Q1: 10')).not.toBeInTheDocument();

    fireEvent.mouseEnter(point);
    expect(screen.getByText('Direct · Q1: 10')).toBeInTheDocument();

    fireEvent.blur(point);
    expect(screen.queryByText('Direct · Q1: 10')).not.toBeInTheDocument();

    fireEvent.focus(point);
    expect(screen.getByText('Direct · Q1: 10')).toBeInTheDocument();
  });

  it('should render the horizontal grid only when showGrid is true', () => {
    const { container, rerender } = render(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />
    );

    expect(container.querySelectorAll('[data-stream-grid]')).toHaveLength(0);
    expect(screen.getByText('-20')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    rerender(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" showGrid />
    );

    expect(container.querySelectorAll('[data-stream-grid]')).toHaveLength(5);
  });

  it('should render a legend for every series and hide it when showLegend is false', () => {
    const { rerender } = render(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />
    );

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Direct')).toBeInTheDocument();
    expect(screen.getByText('Organic')).toBeInTheDocument();

    rerender(
      <StreamGraphChart
        labels={labels}
        series={series}
        ariaLabel="Traffic sources"
        showLegend={false}
      />
    );

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should apply the value formatter to names and tooltips', () => {
    render(
      <StreamGraphChart
        labels={labels}
        series={series}
        ariaLabel="Traffic sources"
        valueFormatter={(value: number) => `${value}k`}
      />
    );

    expect(screen.getByRole('img', { name: 'Direct, Q1: 10k' })).toBeInTheDocument();

    fireEvent.focus(screen.getByRole('img', { name: 'Organic, Q2: 10k' }));
    expect(screen.getByText('Organic · Q2: 10k')).toBeInTheDocument();
  });

  it('should treat missing values as zero', () => {
    render(
      <StreamGraphChart
        labels={['A', 'B']}
        series={[{ name: 'Partial', data: [5] }]}
        ariaLabel="Partial series"
      />
    );

    expect(screen.getByRole('img', { name: 'Partial, B: 0' })).toBeInTheDocument();
  });

  it('should accept a custom height', () => {
    const { container } = render(
      <StreamGraphChart labels={labels} series={series} height={360} ariaLabel="Tall stream" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('should render an empty state when there is no data', () => {
    const { container, rerender } = render(
      <StreamGraphChart labels={[]} series={series} ariaLabel="Empty stream" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();

    rerender(<StreamGraphChart labels={labels} series={[]} ariaLabel="Empty stream" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />
    );
    const first = Array.from(container.querySelectorAll('[data-stream-layer]')).map((layer) =>
      layer.getAttribute('d')
    );

    unmount();

    const { container: secondContainer } = render(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />
    );

    expect(
      Array.from(secondContainer.querySelectorAll('[data-stream-layer]')).map((layer) =>
        layer.getAttribute('d')
      )
    ).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <StreamGraphChart labels={labels} series={series} ariaLabel="Stream" />
        <StreamGraphChart
          labels={labels}
          series={series}
          ariaLabel="Stream with grid"
          showGrid
          showLegend={false}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('StreamGraphChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <StreamGraphChart
        labels={labels}
        series={series}
        ariaLabel="Traffic sources"
        showDataTable="visible"
        dataTableCaption="Traffic sources data"
      />
    );

    const table = screen.getByRole('table', { name: 'Traffic sources data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Direct', 'Organic']);
    expect(within(table).getByRole('cell', { name: 'Q1' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '30' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(labels.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <StreamGraphChart
        labels={labels}
        series={series}
        ariaLabel="Traffic sources"
        showDataTable="hidden"
      />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <StreamGraphChart
        labels={labels}
        series={series}
        ariaLabel="Traffic sources"
        exportable
        exportFileName="traffic"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'traffic');
    expect(screen.getByRole('status')).toHaveTextContent('Exported traffic.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported traffic.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'traffic',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" animated />
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
      <StreamGraphChart labels={labels} series={series} ariaLabel="Traffic sources" animated />
    );

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <StreamGraphChart
        labels={labels}
        series={series}
        ariaLabel="Traffic sources"
        showDataTable="visible"
        dataTableCaption="Traffic sources data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
