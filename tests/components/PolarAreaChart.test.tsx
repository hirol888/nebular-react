import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PolarAreaChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'A', value: 10 },
  { label: 'B', value: 5 },
  { label: 'C', value: 2.5 }
];

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-polar-segment]')).map((element) =>
    [
      element.getAttribute('data-polar-start'),
      element.getAttribute('data-polar-end'),
      element.getAttribute('data-polar-radius'),
      element.getAttribute('d'),
      element.getAttribute('fill')
    ].join(',')
  );
}

describe('PolarAreaChart', () => {
  it('should render one focusable sector per data entry', () => {
    const { container } = render(<PolarAreaChart data={data} ariaLabel="Revenue by channel" />);

    expect(screen.getByRole('group', { name: 'Revenue by channel' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'A: 10' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'C: 2.5' })).toBeInTheDocument();
    expect(container.querySelectorAll('[data-polar-segment]')).toHaveLength(3);
  });

  it('should size every sector radius proportionally to its value', () => {
    const { container } = render(
      <PolarAreaChart data={data} size={300} ariaLabel="Revenue by channel" />
    );

    const segments = Array.from(container.querySelectorAll('[data-polar-segment]'));
    const radius = (index: number) => Number(segments[index].getAttribute('data-polar-radius'));

    expect(radius(0)).toBeCloseTo(124, 6);
    expect(radius(1)).toBeCloseTo(62, 6);
    expect(radius(2)).toBeCloseTo(31, 6);
    expect(radius(1) / radius(0)).toBeCloseTo(0.5, 6);
  });

  it('should split the circle evenly and honor the startAngle', () => {
    const { container, rerender } = render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" />
    );

    let segments = Array.from(container.querySelectorAll('[data-polar-segment]'));

    expect(segments.map((item) => Number(item.getAttribute('data-polar-start')))).toEqual([
      -90, 30, 150
    ]);
    expect(segments.map((item) => Number(item.getAttribute('data-polar-end')))).toEqual([
      30, 150, 270
    ]);

    rerender(<PolarAreaChart data={data} startAngle={0} ariaLabel="Revenue by channel" />);
    segments = Array.from(container.querySelectorAll('[data-polar-segment]'));

    expect(segments.map((item) => Number(item.getAttribute('data-polar-start')))).toEqual([
      0, 120, 240
    ]);
  });

  it('should use the default palette and allow per-entry colors', () => {
    const { container, rerender } = render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" />
    );
    let segments = Array.from(container.querySelectorAll('[data-polar-segment]'));

    expect(segments[0]).toHaveAttribute('fill', '#3366ff');
    expect(segments[1]).toHaveAttribute('fill', '#00d68f');
    expect(segments[2]).toHaveAttribute('fill', '#ffaa00');

    rerender(
      <PolarAreaChart
        data={[
          { label: 'A', value: 10, color: '#111111' },
          { label: 'B', value: 5, color: '#222222' },
          { label: 'C', value: 2.5 }
        ]}
        ariaLabel="Revenue by channel"
      />
    );
    segments = Array.from(container.querySelectorAll('[data-polar-segment]'));

    expect(segments[0]).toHaveAttribute('fill', '#111111');
    expect(segments[1]).toHaveAttribute('fill', '#222222');
    expect(segments[2]).toHaveAttribute('fill', '#ffaa00');
  });

  it('should render labels around the chart and the legend, hiding the legend on demand', () => {
    const { container, rerender } = render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" />
    );

    const labels = Array.from(container.querySelectorAll('[data-polar-label]'));

    expect(labels.map((label) => label.textContent)).toEqual(['A', 'B', 'C']);
    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);

    rerender(<PolarAreaChart data={data} showLegend={false} ariaLabel="Revenue by channel" />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should apply the value formatter to the accessible names and tooltips', () => {
    render(
      <PolarAreaChart
        data={data}
        ariaLabel="Revenue by channel"
        valueFormatter={(value: number) => `${value} tickets`}
      />
    );

    expect(screen.getByRole('img', { name: 'A: 10 tickets' })).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole('img', { name: 'B: 5 tickets' }));
    expect(screen.getByText('B: 5 tickets')).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a sector', () => {
    render(<PolarAreaChart data={data} ariaLabel="Revenue by channel" />);

    const segment = screen.getByRole('img', { name: 'A: 10' });

    expect(screen.queryByText('A: 10')).not.toBeInTheDocument();

    fireEvent.mouseEnter(segment);
    expect(screen.getByText('A: 10')).toBeInTheDocument();

    fireEvent.blur(segment);
    expect(screen.queryByText('A: 10')).not.toBeInTheDocument();

    fireEvent.focus(segment);
    expect(screen.getByText('A: 10')).toBeInTheDocument();
  });

  it('should call onSegmentClick with the segment and index on click and keyboard activation', () => {
    const onSegmentClick = jest.fn();

    render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" onSegmentClick={onSegmentClick} />
    );

    const segment = screen.getByRole('button', { name: 'B: 5' });

    fireEvent.click(segment);
    expect(onSegmentClick).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'B', value: 5, color: '#00d68f' }),
      1
    );

    onSegmentClick.mockClear();
    fireEvent.keyDown(segment, { key: ' ' });
    expect(onSegmentClick).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'B', value: 5 }),
      1
    );
  });

  it('should render the polar grid', () => {
    const { container } = render(<PolarAreaChart data={data} ariaLabel="Revenue by channel" />);

    expect(container.querySelectorAll('[data-polar-grid]')).toHaveLength(4);
  });

  it('should render an empty state when there is no usable data', () => {
    const { container, rerender } = render(
      <PolarAreaChart data={[]} ariaLabel="Empty polar area" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);

    rerender(<PolarAreaChart data={[{ label: 'A', value: 0 }]} ariaLabel="Empty polar area" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" />
    );
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <PolarAreaChart data={data} ariaLabel="Polar area" />
        <PolarAreaChart
          data={data}
          ariaLabel="Interactive polar area"
          onSegmentClick={() => undefined}
          valueFormatter={(value: number) => `${value} tickets`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('PolarAreaChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <PolarAreaChart
        data={data}
        ariaLabel="Revenue by channel"
        showDataTable="visible"
        dataTableCaption="Revenue data"
      />
    );

    const table = screen.getByRole('table', { name: 'Revenue data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Value']);
    expect(within(table).getByRole('cell', { name: 'A' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '10' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<PolarAreaChart data={data} ariaLabel="Revenue by channel" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <PolarAreaChart
        data={data}
        ariaLabel="Revenue by channel"
        exportable
        exportFileName="revenue"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'revenue');
    expect(screen.getByRole('status')).toHaveTextContent('Exported revenue.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported revenue.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'revenue',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <PolarAreaChart data={data} ariaLabel="Revenue by channel" animated />
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

    const reduced = render(<PolarAreaChart data={data} ariaLabel="Revenue by channel" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <PolarAreaChart
        data={data}
        ariaLabel="Revenue by channel"
        showDataTable="visible"
        dataTableCaption="Revenue data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
