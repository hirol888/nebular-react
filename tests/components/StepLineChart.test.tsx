import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { StepLineChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const labels = ['Jan', 'Feb', 'Mar'];
const series = [
  { name: 'Revenue', data: [2, 5, 3] },
  { name: 'Costs', data: [1, 2, 4], color: '#ff3d71' }
];

const HEIGHT = 280;
const PADDING = { top: 16, bottom: 32 };
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const PLOT_WIDTH = 480 - 44 - 16;

function y(value: number) {
  return PADDING.top + PLOT_HEIGHT - (value / 5) * PLOT_HEIGHT;
}

function x(index: number) {
  return 44 + (index / (labels.length - 1)) * PLOT_WIDTH;
}

interface PathCommand {
  command: string;
  x: number;
  y: number;
}

function commands(d: string): PathCommand[] {
  return Array.from(d.matchAll(/([ML])\s*(-?[\d.]+)\s*(-?[\d.]+)/g)).map((match) => ({
    command: match[1],
    x: Number(match[2]),
    y: Number(match[3])
  }));
}

describe('StepLineChart', () => {
  it('should render axes, category labels and value ticks', () => {
    render(<StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />);

    expect(screen.getByRole('group', { name: 'Monthly figures' })).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getByText('Mar')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should draw step-after lines that keep the previous value until the next point', () => {
    const { container } = render(
      <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />
    );
    const line = container.querySelector('[data-step-line="Revenue"]');

    expect(line).not.toBeNull();

    const path = commands(line?.getAttribute('d') ?? '');

    expect(path.map((command) => command.command)).toEqual(['M', 'L', 'L', 'L', 'L']);

    // First segment is horizontal: same y as the starting point.
    expect(path[0].x).toBeCloseTo(x(0), 6);
    expect(path[0].y).toBeCloseTo(y(2), 6);
    expect(path[1].x).toBeCloseTo(x(1), 6);
    expect(path[1].y).toBeCloseTo(y(2), 6);

    // Then the vertical jump happens at the next x position.
    expect(path[2].x).toBeCloseTo(x(1), 6);
    expect(path[2].y).toBeCloseTo(y(5), 6);
    expect(path[3].x).toBeCloseTo(x(2), 6);
    expect(path[3].y).toBeCloseTo(y(5), 6);
    expect(path[4].x).toBeCloseTo(x(2), 6);
    expect(path[4].y).toBeCloseTo(y(3), 6);
  });

  it('should render a focusable point per series and label', () => {
    render(<StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />);

    expect(screen.getAllByRole('img')).toHaveLength(6);
    expect(screen.getByRole('img', { name: 'Revenue, Jan: 2' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Costs, Mar: 4' })).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a point', () => {
    render(<StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />);

    const point = screen.getByRole('img', { name: 'Revenue, Feb: 5' });

    expect(screen.queryByText('Revenue · Feb: 5')).not.toBeInTheDocument();

    fireEvent.mouseEnter(point);
    expect(screen.getByText('Revenue · Feb: 5')).toBeInTheDocument();

    fireEvent.blur(point);
    expect(screen.queryByText('Revenue · Feb: 5')).not.toBeInTheDocument();

    fireEvent.focus(point);
    expect(screen.getByText('Revenue · Feb: 5')).toBeInTheDocument();
  });

  it('should render one line per series using the resolved colors', () => {
    const { container } = render(
      <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />
    );
    const lines = Array.from(container.querySelectorAll('[data-step-line]'));

    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveAttribute('stroke', '#3366ff');
    expect(lines[1]).toHaveAttribute('stroke', '#ff3d71');
  });

  it('should render the grid and hide it when showGrid is false', () => {
    const { container, rerender } = render(
      <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />
    );

    expect(container.querySelectorAll('[data-step-grid]')).toHaveLength(5);

    rerender(
      <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" showGrid={false} />
    );

    expect(container.querySelectorAll('[data-step-grid]')).toHaveLength(0);
    expect(screen.getByRole('group', { name: 'Monthly figures' })).toBeInTheDocument();
  });

  it('should render a legend for every series and hide it when showLegend is false', () => {
    const { rerender } = render(
      <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />
    );

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Costs')).toBeInTheDocument();

    rerender(
      <StepLineChart
        labels={labels}
        series={series}
        ariaLabel="Monthly figures"
        showLegend={false}
      />
    );

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should apply the value formatter to names and ticks', () => {
    render(
      <StepLineChart
        labels={labels}
        series={series}
        ariaLabel="Monthly figures"
        valueFormatter={(value: number) => `${value}h`}
      />
    );

    expect(screen.getByRole('img', { name: 'Revenue, Jan: 2h' })).toBeInTheDocument();
    expect(screen.getAllByText('5h').length).toBeGreaterThan(0);
  });

  it('should accept a custom height', () => {
    const { container } = render(
      <StepLineChart labels={labels} series={series} height={360} ariaLabel="Tall steps" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('should render an empty state when there is no data', () => {
    const { container, rerender } = render(
      <StepLineChart labels={[]} series={series} ariaLabel="Empty steps" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();

    rerender(<StepLineChart labels={labels} series={[]} ariaLabel="Empty steps" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <StepLineChart labels={labels} series={series} ariaLabel="Step line" />
        <StepLineChart
          labels={labels}
          series={series}
          ariaLabel="Step line without grid"
          showGrid={false}
          showLegend={false}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('StepLineChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <StepLineChart
        labels={labels}
        series={series}
        ariaLabel="Monthly figures"
        showDataTable="visible"
        dataTableCaption="Monthly figures data"
      />
    );

    const table = screen.getByRole('table', { name: 'Monthly figures data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Revenue', 'Costs']);
    expect(within(table).getByRole('cell', { name: 'Jan' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '5' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '4' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(labels.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <StepLineChart
        labels={labels}
        series={series}
        ariaLabel="Monthly figures"
        showDataTable="hidden"
      />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <StepLineChart
        labels={labels}
        series={series}
        ariaLabel="Monthly figures"
        exportable
        exportFileName="monthly"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'monthly');
    expect(screen.getByRole('status')).toHaveTextContent('Exported monthly.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported monthly.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'monthly',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" animated />
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
      <StepLineChart labels={labels} series={series} ariaLabel="Monthly figures" animated />
    );

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <StepLineChart
        labels={labels}
        series={series}
        ariaLabel="Monthly figures"
        showDataTable="visible"
        dataTableCaption="Monthly figures data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
