import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ParallelCoordinates, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const dimensions = [
  { key: 'speed', label: 'Speed' },
  { key: 'cost', label: 'Cost', min: 0, max: 50 },
  { key: 'quality', label: 'Quality' }
];

const series = [
  { name: 'Alpha', values: { speed: 80, cost: 25, quality: 90 } },
  { name: 'Beta', values: { speed: 40, cost: 10, quality: 60 }, color: '#ff00ff' }
];

const WIDTH = 480;
const HEIGHT = 300;
const PADDING = { top: 24, right: 24, bottom: 44, left: 24 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

function numberAttribute(element: Element | null, attribute: string) {
  return Number(element?.getAttribute(attribute));
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-parallel-point]')).map((element) =>
    [
      element.getAttribute('data-parallel-point'),
      element.getAttribute('data-parallel-key'),
      element.getAttribute('data-parallel-normalized'),
      element.getAttribute('cx'),
      element.getAttribute('cy')
    ].join('|')
  );
}

describe('ParallelCoordinates', () => {
  it('should render a vertical axis per dimension with labels and domain hints', () => {
    const { container } = render(
      <ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />
    );

    expect(screen.getByRole('group', { name: 'Car metrics' })).toBeInTheDocument();

    const speedAxis = container.querySelector('[data-parallel-axis="speed"]');
    const costAxis = container.querySelector('[data-parallel-axis="cost"]');
    const qualityAxis = container.querySelector('[data-parallel-axis="quality"]');

    expect(speedAxis).not.toBeNull();
    expect(numberAttribute(speedAxis, 'x1')).toBe(PADDING.left);
    expect(numberAttribute(speedAxis, 'x2')).toBe(PADDING.left);
    expect(numberAttribute(speedAxis, 'y1')).toBe(PADDING.top);
    expect(numberAttribute(speedAxis, 'y2')).toBe(HEIGHT - PADDING.bottom);

    expect(numberAttribute(costAxis, 'x1')).toBe(PADDING.left + PLOT_WIDTH / 2);
    expect(numberAttribute(qualityAxis, 'x1')).toBe(WIDTH - PADDING.right);

    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Cost')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();

    expect(container.querySelector('[data-parallel-max="speed"]')?.textContent).toBe('80');
    expect(container.querySelector('[data-parallel-min="speed"]')?.textContent).toBe('40');
    expect(container.querySelector('[data-parallel-max="cost"]')?.textContent).toBe('50');
    expect(container.querySelector('[data-parallel-min="cost"]')?.textContent).toBe('0');
    expect(container.querySelector('[data-parallel-max="quality"]')?.textContent).toBe('90');
    expect(container.querySelector('[data-parallel-min="quality"]')?.textContent).toBe('60');
  });

  it('should normalize every series value between the dimension domain', () => {
    render(<ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />);

    const alphaSpeed = screen.getByRole('img', { name: 'Alpha · Speed: 80' });
    const betaSpeed = screen.getByRole('img', { name: 'Beta · Speed: 40' });
    const alphaCost = screen.getByRole('img', { name: 'Alpha · Cost: 25' });
    const betaCost = screen.getByRole('img', { name: 'Beta · Cost: 10' });
    const alphaQuality = screen.getByRole('img', { name: 'Alpha · Quality: 90' });
    const betaQuality = screen.getByRole('img', { name: 'Beta · Quality: 60' });

    expect(numberAttribute(alphaSpeed, 'data-parallel-normalized')).toBeCloseTo(1, 6);
    expect(numberAttribute(betaSpeed, 'data-parallel-normalized')).toBeCloseTo(0, 6);
    expect(numberAttribute(alphaCost, 'data-parallel-normalized')).toBeCloseTo(0.5, 6);
    expect(numberAttribute(betaCost, 'data-parallel-normalized')).toBeCloseTo(0.2, 6);
    expect(numberAttribute(alphaQuality, 'data-parallel-normalized')).toBeCloseTo(1, 6);
    expect(numberAttribute(betaQuality, 'data-parallel-normalized')).toBeCloseTo(0, 6);

    expect(numberAttribute(alphaSpeed, 'cy')).toBeCloseTo(PADDING.top, 6);
    expect(numberAttribute(betaSpeed, 'cy')).toBeCloseTo(PADDING.top + PLOT_HEIGHT, 6);
    expect(numberAttribute(alphaCost, 'cy')).toBeCloseTo(PADDING.top + PLOT_HEIGHT / 2, 6);

    expect(numberAttribute(alphaSpeed, 'cx')).toBeCloseTo(PADDING.left, 6);
    expect(numberAttribute(alphaCost, 'cx')).toBeCloseTo(PADDING.left + PLOT_WIDTH / 2, 6);
    expect(numberAttribute(alphaQuality, 'cx')).toBeCloseTo(WIDTH - PADDING.right, 6);
  });

  it('should center values when a dimension domain has no range', () => {
    render(
      <ParallelCoordinates
        dimensions={[{ key: 'flat', label: 'Flat' }]}
        series={[
          { name: 'One', values: { flat: 5 } },
          { name: 'Two', values: { flat: 5 } }
        ]}
        ariaLabel="Flat metrics"
      />
    );

    const one = screen.getByRole('img', { name: 'One · Flat: 5' });
    const two = screen.getByRole('img', { name: 'Two · Flat: 5' });

    expect(numberAttribute(one, 'data-parallel-normalized')).toBeCloseTo(0.5, 6);
    expect(numberAttribute(two, 'data-parallel-normalized')).toBeCloseTo(0.5, 6);
    expect(numberAttribute(one, 'cy')).toBeCloseTo(PADDING.top + PLOT_HEIGHT / 2, 6);
  });

  it('should highlight the active series on hover and focus and show a tooltip', () => {
    const { container } = render(
      <ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />
    );

    const alphaLine = container.querySelector('[data-parallel-series="Alpha"]');
    const betaLine = container.querySelector('[data-parallel-series="Beta"]');

    expect(alphaLine).toHaveAttribute('data-highlighted', 'false');
    expect(betaLine).toHaveAttribute('data-highlighted', 'false');

    const alphaCost = screen.getByRole('img', { name: 'Alpha · Cost: 25' });

    fireEvent.focus(alphaCost);

    expect(alphaLine).toHaveAttribute('data-highlighted', 'true');
    expect(betaLine).toHaveAttribute('data-highlighted', 'false');
    expect(betaLine).toHaveAttribute('opacity', '0.2');
    expect(alphaLine).toHaveAttribute('opacity', '1');
    expect(screen.getByText('Alpha · Cost: 25')).toBeInTheDocument();

    fireEvent.blur(alphaCost);

    expect(alphaLine).toHaveAttribute('data-highlighted', 'false');
    expect(screen.queryByText('Alpha · Cost: 25')).not.toBeInTheDocument();

    const betaQuality = screen.getByRole('img', { name: 'Beta · Quality: 60' });

    fireEvent.mouseEnter(betaQuality);

    expect(betaLine).toHaveAttribute('data-highlighted', 'true');
    expect(alphaLine).toHaveAttribute('opacity', '0.2');
    expect(screen.getByText('Beta · Quality: 60')).toBeInTheDocument();
  });

  it('should expose a focusable control per point and call onSeriesClick on click and keyboard', () => {
    const onSeriesClick = jest.fn();
    const { unmount } = render(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        onSeriesClick={onSeriesClick}
      />
    );

    expect(screen.getAllByRole('button')).toHaveLength(6);

    const betaCost = screen.getByRole('button', { name: 'Beta · Cost: 10' });

    fireEvent.click(betaCost);
    expect(onSeriesClick).toHaveBeenCalledWith(series[1]);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Alpha · Speed: 80' }), {
      key: 'Enter'
    });
    expect(onSeriesClick).toHaveBeenCalledWith(series[0]);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Alpha · Quality: 90' }), {
      key: ' '
    });
    expect(onSeriesClick).toHaveBeenLastCalledWith(series[0]);
    expect(onSeriesClick).toHaveBeenCalledTimes(3);

    unmount();

    render(<ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Read only" />);

    expect(screen.getAllByRole('img')).toHaveLength(6);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should apply the value formatter to labels and tooltips', () => {
    render(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        valueFormatter={(value: number) => `${value} pts`}
      />
    );

    expect(screen.getByRole('img', { name: 'Alpha · Speed: 80 pts' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Beta · Cost: 10 pts' })).toBeInTheDocument();
    expect(screen.getByText('90 pts')).toBeInTheDocument();

    fireEvent.focus(screen.getByRole('img', { name: 'Beta · Quality: 60 pts' }));

    expect(screen.getByText('Beta · Quality: 60 pts')).toBeInTheDocument();
  });

  it('should render a legend for the series and hide it when showLegend is false', () => {
    const { rerender } = render(
      <ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />
    );

    const legend = screen.getByRole('list', { name: 'Series' });
    const items = within(legend).getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Alpha')).toBeInTheDocument();
    expect(within(items[1]).getByText('Beta')).toBeInTheDocument();

    rerender(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        showLegend={false}
      />
    );

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(
      <ParallelCoordinates dimensions={[]} series={[]} ariaLabel="Empty metrics" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when there are dimensions but no series', () => {
    const { container } = render(
      <ParallelCoordinates dimensions={dimensions} series={[]} ariaLabel="Empty metrics" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(
      <ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />
    );
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />
        <ParallelCoordinates
          dimensions={dimensions}
          series={series}
          ariaLabel="Interactive car metrics"
          valueFormatter={(value: number) => `${value} pts`}
          onSeriesClick={() => undefined}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ParallelCoordinates data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        showDataTable="visible"
        dataTableCaption="Car metrics data"
      />
    );

    const table = screen.getByRole('table', { name: 'Car metrics data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Series', 'Speed', 'Cost', 'Quality']);
    expect(within(table).getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '80' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '90' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(series.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        showDataTable="hidden"
      />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<ParallelCoordinates dimensions={dimensions} series={series} ariaLabel="Car metrics" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        exportable
        exportFileName="car-metrics"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'car-metrics');
    expect(screen.getByRole('status')).toHaveTextContent('Exported car-metrics.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported car-metrics.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'car-metrics',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        animated
      />
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
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        animated
      />
    );

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <ParallelCoordinates
        dimensions={dimensions}
        series={series}
        ariaLabel="Car metrics"
        showDataTable="visible"
        dataTableCaption="Car metrics data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
