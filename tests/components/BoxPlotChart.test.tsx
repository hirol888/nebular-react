import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// Internal unit imported directly because the public entry point does not expose it yet.
import { BoxPlotChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'A', min: 10, q1: 20, median: 30, q3: 40, max: 50 },
  { label: 'B', min: 5, q1: 15, median: 25, q3: 35, max: 45, outliers: [60, 70] }
];

const PADDING = { top: 16, bottom: 32 };
const HEIGHT = 280;
const DOMAIN_MIN = 5;
const DOMAIN_MAX = 70;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

function y(value: number) {
  return (
    PADDING.top + PLOT_HEIGHT - ((value - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * PLOT_HEIGHT
  );
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-boxplot-label]')).map((element) =>
    Array.from(
      element.querySelectorAll(
        '[data-boxplot-box], [data-boxplot-median], [data-boxplot-whisker], [data-boxplot-outlier]'
      )
    )
      .map((child) =>
        [
          child.getAttribute('data-boxplot-box') ??
            child.getAttribute('data-boxplot-median') ??
            child.getAttribute('data-boxplot-whisker') ??
            child.getAttribute('data-boxplot-outlier'),
          child.getAttribute('x'),
          child.getAttribute('y'),
          child.getAttribute('y1'),
          child.getAttribute('y2'),
          child.getAttribute('width'),
          child.getAttribute('height'),
          child.getAttribute('cy')
        ].join(',')
      )
      .join('|')
  );
}

describe('BoxPlotChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a focusable hit area per box with the full statistics', () => {
    render(<BoxPlotChart data={data} ariaLabel="Latency distribution" />);

    expect(screen.getByRole('group', { name: 'Latency distribution' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(
      screen.getByRole('img', {
        name: 'A: min 10, Q1 20, median 30, Q3 40, max 50'
      })
    ).toHaveAttribute('tabindex', '0');
    expect(
      screen.getByRole('img', {
        name: 'B: min 5, Q1 15, median 25, Q3 35, max 45, outliers 60, 70'
      })
    ).toBeInTheDocument();
  });

  it('should position the box, median and whiskers on the value axis', () => {
    const { container } = render(<BoxPlotChart data={data} ariaLabel="Latency distribution" />);
    const group = container.querySelector('[data-boxplot-label="A"]');

    const box = group?.querySelector('[data-boxplot-box]');
    const median = group?.querySelector('[data-boxplot-median]');
    const whisker = group?.querySelector('[data-boxplot-whisker]');

    expect(Number(box?.getAttribute('y'))).toBeCloseTo(y(40), 6);
    expect(Number(box?.getAttribute('height'))).toBeCloseTo(y(20) - y(40), 6);
    expect(Number(median?.getAttribute('y1'))).toBeCloseTo(y(30), 6);
    expect(Number(median?.getAttribute('y2'))).toBeCloseTo(y(30), 6);
    expect(Number(whisker?.getAttribute('y1'))).toBeCloseTo(y(50), 6);
    expect(Number(whisker?.getAttribute('y2'))).toBeCloseTo(y(10), 6);
    expect(group?.querySelectorAll('[data-boxplot-cap]')).toHaveLength(2);
  });

  it('should render outliers at their value positions', () => {
    const { container } = render(<BoxPlotChart data={data} ariaLabel="Latency distribution" />);
    const group = container.querySelector('[data-boxplot-label="B"]');
    const outliers = group?.querySelectorAll('[data-boxplot-outlier]') ?? [];

    expect(outliers).toHaveLength(2);
    expect(Number(outliers[0].getAttribute('cy'))).toBeCloseTo(y(60), 6);
    expect(Number(outliers[1].getAttribute('cy'))).toBeCloseTo(y(70), 6);
  });

  it('should render the value grid and hide it when showGrid is false', () => {
    const { container, rerender } = render(
      <BoxPlotChart data={data} ariaLabel="Latency distribution" />
    );

    expect(container.querySelectorAll('[data-boxplot-grid]')).toHaveLength(5);

    rerender(<BoxPlotChart data={data} showGrid={false} ariaLabel="Latency distribution" />);

    expect(container.querySelectorAll('[data-boxplot-grid]')).toHaveLength(0);
    expect(screen.getByRole('group', { name: 'Latency distribution' })).toBeInTheDocument();
  });

  it('should render the category labels', () => {
    render(<BoxPlotChart data={data} ariaLabel="Latency distribution" />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a box', () => {
    render(<BoxPlotChart data={data} ariaLabel="Latency distribution" />);

    const boxA = screen.getByRole('img', {
      name: 'A: min 10, Q1 20, median 30, Q3 40, max 50'
    });

    expect(
      screen.queryByText('A: min 10, Q1 20, median 30, Q3 40, max 50')
    ).not.toBeInTheDocument();

    fireEvent.mouseEnter(boxA);
    expect(screen.getByText('A: min 10, Q1 20, median 30, Q3 40, max 50')).toBeInTheDocument();

    fireEvent.blur(boxA);
    expect(
      screen.queryByText('A: min 10, Q1 20, median 30, Q3 40, max 50')
    ).not.toBeInTheDocument();

    fireEvent.focus(boxA);
    expect(screen.getByText('A: min 10, Q1 20, median 30, Q3 40, max 50')).toBeInTheDocument();
  });

  it('should apply the value formatter to names and tooltips', () => {
    render(
      <BoxPlotChart
        data={data}
        ariaLabel="Latency distribution"
        valueFormatter={(value: number) => `${value} ms`}
      />
    );

    expect(
      screen.getByRole('img', {
        name: 'A: min 10 ms, Q1 20 ms, median 30 ms, Q3 40 ms, max 50 ms'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'B: min 5 ms, Q1 15 ms, median 25 ms, Q3 35 ms, max 45 ms, outliers 60 ms, 70 ms'
      })
    ).toBeInTheDocument();
  });

  it('should accept a custom height', () => {
    const { container } = render(
      <BoxPlotChart data={data} height={360} ariaLabel="Tall box plot" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<BoxPlotChart data={[]} ariaLabel="Empty box plot" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(
      <BoxPlotChart data={data} ariaLabel="Latency distribution" />
    );
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <BoxPlotChart data={data} ariaLabel="Latency distribution" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <BoxPlotChart data={data} ariaLabel="Box plot" />
        <BoxPlotChart
          data={data}
          ariaLabel="Box plot without grid"
          showGrid={false}
          valueFormatter={(value: number) => `${value} ms`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table with the statistics when showDataTable is visible', () => {
    render(
      <BoxPlotChart
        data={data}
        ariaLabel="Latency distribution"
        showDataTable="visible"
        dataTableCaption="Latency distribution data"
      />
    );

    const table = screen.getByRole('table', { name: 'Latency distribution data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Min', 'Q1', 'Median', 'Q3', 'Max']);

    const rows = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      );

    expect(rows).toEqual([
      ['A', '10', '20', '30', '40', '50'],
      ['B', '5', '15', '25', '35', '45']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <BoxPlotChart
        data={data}
        ariaLabel="Latency distribution"
        showDataTable="hidden"
        dataTableCaption="Latency distribution data"
      />
    );

    expect(screen.getByRole('table', { name: 'Latency distribution data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<BoxPlotChart data={data} ariaLabel="Latency distribution" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <BoxPlotChart
        data={data}
        ariaLabel="Latency distribution"
        exportable
        exportFileName="latency"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'latency');
    expect(screen.getByRole('status')).toHaveTextContent('Exported latency.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <BoxPlotChart
        data={data}
        ariaLabel="Latency distribution"
        exportable
        exportFileName="latency"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'latency')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported latency.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <BoxPlotChart data={data} ariaLabel="Latency distribution" animated />
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

    const reduced = render(<BoxPlotChart data={data} ariaLabel="Latency distribution" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <BoxPlotChart
        data={data}
        ariaLabel="Accessible box plot"
        exportable
        exportFileName="box-plot"
        showDataTable="visible"
        dataTableCaption="Box plot data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
