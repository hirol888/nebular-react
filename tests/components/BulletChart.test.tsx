import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { BulletChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'Revenue', value: 80, target: 90, max: 100, ranges: [50, 75, 100] },
  { label: 'Profit', value: 55, target: 65, max: 100, ranges: [50, 75, 100] }
];

function ratio(element: Element | null) {
  if (!element) {
    return Number.NaN;
  }

  const parent = element.parentElement?.querySelector('[data-bullet-track]');

  if (!parent) {
    return Number.NaN;
  }

  return Number(element.getAttribute('width')) / Number(parent.getAttribute('width'));
}

describe('BulletChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render one focusable row per data item', () => {
    render(<BulletChart data={data} ariaLabel="Performance" />);

    expect(screen.getByRole('group', { name: 'Performance' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Revenue: 80 (target 90)' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    expect(screen.getByRole('img', { name: 'Profit: 55 (target 65)' })).toBeInTheDocument();
  });

  it('should render the label and the value of every row', () => {
    render(<BulletChart data={data} ariaLabel="Performance" />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Profit')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  it('should hide the values when showValues is false', () => {
    render(<BulletChart data={data} ariaLabel="Performance" showValues={false} />);

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.queryByText('80')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Revenue: 80 (target 90)' })).toBeInTheDocument();
  });

  it('should apply the value formatter to values, accessible names and tooltips', async () => {
    const user = userEvent.setup();

    render(
      <BulletChart
        data={data}
        ariaLabel="Performance"
        valueFormatter={(value: number) => `${value}%`}
      />
    );

    expect(screen.getByText('80%')).toBeInTheDocument();

    const row = screen.getByRole('img', { name: 'Revenue: 80% (target 90%)' });

    expect(row).toBeInTheDocument();

    await user.hover(row);

    expect(screen.getByText('Revenue: 80% (target 90%)')).toBeInTheDocument();
  });

  it('should scale the value bar in relation to the max of each row', () => {
    const { container } = render(<BulletChart data={data} ariaLabel="Performance" />);

    const bars = Array.from(container.querySelectorAll('[data-bullet-value]'));

    expect(bars).toHaveLength(2);
    expect(ratio(bars[0])).toBeCloseTo(0.8, 5);
    expect(ratio(bars[1])).toBeCloseTo(0.55, 5);
  });

  it('should derive the max from the value, target and ranges when it is not provided', () => {
    const { container } = render(
      <BulletChart
        data={[{ label: 'Coverage', value: 40, target: 60, ranges: [50, 100] }]}
        ariaLabel="Coverage"
      />
    );

    const bar = container.querySelector('[data-bullet-value]');

    expect(ratio(bar)).toBeCloseTo(0.4, 5);
    expect(bar).toHaveAttribute('data-max', '100');
  });

  it('should render one performance band per range and hide the target line when requested', () => {
    const { container, rerender } = render(<BulletChart data={data} ariaLabel="Performance" />);

    expect(container.querySelectorAll('[data-bullet-range]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-bullet-target]')).toHaveLength(2);

    rerender(<BulletChart data={data} ariaLabel="Performance" showTarget={false} />);

    expect(container.querySelectorAll('[data-bullet-target]')).toHaveLength(0);
  });

  it('should clamp the value, target and ranges to the max of the row', () => {
    const { container } = render(
      <BulletChart
        data={[{ label: 'Overflow', value: 150, target: 250, max: 100, ranges: [60, 200] }]}
        ariaLabel="Overflow"
      />
    );

    const bar = container.querySelector('[data-bullet-value]');

    expect(ratio(bar)).toBeCloseTo(1, 5);
    expect(container.querySelector('[data-bullet-target]')).toHaveAttribute('data-ratio', '1');
    expect(container.querySelectorAll('[data-bullet-range]')).toHaveLength(2);
  });

  it('should show a tooltip when a row receives focus', async () => {
    const user = userEvent.setup();

    render(<BulletChart data={data} ariaLabel="Performance" />);

    await user.tab();

    expect(screen.getByRole('img', { name: 'Revenue: 80 (target 90)' })).toHaveFocus();
    expect(screen.getByText('Revenue: 80 (target 90)')).toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<BulletChart data={[]} ariaLabel="Empty bullet" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should accept a custom height', () => {
    const { container } = render(<BulletChart data={data} height={240} ariaLabel="Tall bullet" />);

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 240');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <BulletChart data={data} ariaLabel="Bullet" />
        <BulletChart
          data={data}
          ariaLabel="Bullet without target"
          showTarget={false}
          valueFormatter={(value: number) => `${value}%`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <BulletChart
        data={data}
        ariaLabel="Performance"
        showDataTable="visible"
        dataTableCaption="Performance data"
      />
    );

    const table = screen.getByRole('table', { name: 'Performance data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Value', 'Target', 'Max']);

    const rows = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      );

    expect(rows).toEqual([
      ['Revenue', '80', '90', '100'],
      ['Profit', '55', '65', '100']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <BulletChart
        data={data}
        ariaLabel="Performance"
        showDataTable="hidden"
        dataTableCaption="Performance data"
      />
    );

    expect(screen.getByRole('table', { name: 'Performance data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<BulletChart data={data} ariaLabel="Performance" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <BulletChart data={data} ariaLabel="Performance" exportable exportFileName="performance" />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'performance');
    expect(screen.getByRole('status')).toHaveTextContent('Exported performance.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <BulletChart data={data} ariaLabel="Performance" exportable exportFileName="performance" />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'performance')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported performance.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <BulletChart data={data} ariaLabel="Performance" animated />
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

    const reduced = render(<BulletChart data={data} ariaLabel="Performance" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <BulletChart
        data={data}
        ariaLabel="Accessible bullet"
        exportable
        exportFileName="bullet"
        showDataTable="visible"
        dataTableCaption="Bullet data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
