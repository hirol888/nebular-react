import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { WaterfallChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'Revenue', value: 120 },
  { label: 'Costs', value: -40 },
  { label: 'Profit', value: 0, type: 'total' as const }
];

describe('WaterfallChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render one focusable bar per data item', () => {
    render(<WaterfallChart data={data} ariaLabel="Profit waterfall" />);

    expect(screen.getByRole('group', { name: 'Profit waterfall' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Revenue: +120 (total 120)' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    expect(screen.getByRole('img', { name: 'Costs: -40 (total 80)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Profit: 80 (total 80)' })).toBeInTheDocument();
  });

  it('should accumulate increases and decreases and restart totals from zero', () => {
    const { container } = render(<WaterfallChart data={data} ariaLabel="Profit waterfall" />);

    const revenue = container.querySelector('rect[data-label="Revenue"]');
    const costs = container.querySelector('rect[data-label="Costs"]');
    const profit = container.querySelector('rect[data-label="Profit"]');

    expect(revenue).toHaveAttribute('data-start', '0');
    expect(revenue).toHaveAttribute('data-end', '120');
    expect(costs).toHaveAttribute('data-start', '120');
    expect(costs).toHaveAttribute('data-end', '80');
    expect(profit).toHaveAttribute('data-start', '0');
    expect(profit).toHaveAttribute('data-end', '80');
    expect(profit).toHaveAttribute('data-type', 'total');
  });

  it('should infer the bar type from the sign when it is not provided', () => {
    render(
      <WaterfallChart
        data={[
          { label: 'Start', value: 50 },
          { label: 'Drop', value: -20 }
        ]}
        ariaLabel="Inferred waterfall"
      />
    );

    expect(screen.getByRole('img', { name: 'Start: +50 (total 50)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Drop: -20 (total 30)' })).toBeInTheDocument();
  });

  it('should accept positive values for explicit decreases', () => {
    render(
      <WaterfallChart
        data={[
          { label: 'Start', value: 50 },
          { label: 'Drop', value: 20, type: 'decrease' }
        ]}
        ariaLabel="Explicit decrease"
      />
    );

    expect(screen.getByRole('img', { name: 'Drop: -20 (total 30)' })).toBeInTheDocument();
  });

  it('should apply the value formatter to labels and tooltips', async () => {
    const user = userEvent.setup();

    render(
      <WaterfallChart
        data={data}
        ariaLabel="Profit waterfall"
        valueFormatter={(value: number) => `$${value}`}
      />
    );

    const revenue = screen.getByRole('img', { name: 'Revenue: +$120 (total $120)' });

    expect(revenue).toBeInTheDocument();

    await user.hover(revenue);

    expect(screen.getByText('Revenue · +$120 (total $120)')).toBeInTheDocument();
  });

  it('should show a tooltip when a bar receives focus', async () => {
    const user = userEvent.setup();

    render(<WaterfallChart data={data} ariaLabel="Profit waterfall" />);

    await user.tab();

    expect(screen.getByRole('img', { name: 'Revenue: +120 (total 120)' })).toHaveFocus();
    expect(screen.getByText('Revenue · +120 (total 120)')).toBeInTheDocument();
  });

  it('should render a connector between consecutive bars', () => {
    const { container, rerender } = render(
      <WaterfallChart data={data} ariaLabel="Profit waterfall" />
    );

    expect(container.querySelectorAll('[data-connector="true"]')).toHaveLength(2);

    rerender(<WaterfallChart data={data} ariaLabel="Profit waterfall" showConnectors={false} />);

    expect(container.querySelectorAll('[data-connector="true"]')).toHaveLength(0);
  });

  it('should render the grid lines and tick labels unless showGrid is false', () => {
    const { container, rerender } = render(
      <WaterfallChart data={data} ariaLabel="Profit waterfall" />
    );

    expect(container.querySelectorAll('line')).toHaveLength(9);

    rerender(<WaterfallChart data={data} ariaLabel="Profit waterfall" showGrid={false} />);

    expect(container.querySelectorAll('line')).toHaveLength(4);
  });

  it('should render the label of every bar on the x axis', () => {
    render(<WaterfallChart data={data} ariaLabel="Profit waterfall" />);

    data.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<WaterfallChart data={[]} ariaLabel="Empty waterfall" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should accept a custom height', () => {
    const { container } = render(
      <WaterfallChart data={data} height={360} ariaLabel="Tall waterfall" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <WaterfallChart data={data} ariaLabel="Waterfall" />
        <WaterfallChart
          data={data}
          ariaLabel="Waterfall without grid"
          showGrid={false}
          showConnectors={false}
          valueFormatter={(value: number) => `$${value}`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table with the resolved types when showDataTable is visible', () => {
    render(
      <WaterfallChart
        data={data}
        ariaLabel="Profit waterfall"
        showDataTable="visible"
        dataTableCaption="Profit waterfall data"
      />
    );

    const table = screen.getByRole('table', { name: 'Profit waterfall data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Value', 'Type']);

    const rows = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      );

    expect(rows).toEqual([
      ['Revenue', '+120', 'increase'],
      ['Costs', '-40', 'decrease'],
      ['Profit', '80', 'total']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <WaterfallChart
        data={data}
        ariaLabel="Profit waterfall"
        showDataTable="hidden"
        dataTableCaption="Profit waterfall data"
      />
    );

    expect(screen.getByRole('table', { name: 'Profit waterfall data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<WaterfallChart data={data} ariaLabel="Profit waterfall" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <WaterfallChart
        data={data}
        ariaLabel="Profit waterfall"
        exportable
        exportFileName="profit-waterfall"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'profit-waterfall');
    expect(screen.getByRole('status')).toHaveTextContent('Exported profit-waterfall.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <WaterfallChart
        data={data}
        ariaLabel="Profit waterfall"
        exportable
        exportFileName="profit-waterfall"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'profit-waterfall')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported profit-waterfall.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <WaterfallChart data={data} ariaLabel="Profit waterfall" animated />
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

    const reduced = render(<WaterfallChart data={data} ariaLabel="Profit waterfall" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <WaterfallChart
        data={data}
        ariaLabel="Accessible waterfall"
        exportable
        exportFileName="waterfall"
        showDataTable="visible"
        dataTableCaption="Waterfall data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
