import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ViolinPlot, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'A', values: [10, 11, 12, 14, 18] },
  { label: 'B', values: [5, 20, 20, 20, 35], color: '#ff0000' }
];

const HEIGHT = 300;
const PADDING = { top: 16, bottom: 32 };
const DOMAIN_MIN = 5;
const DOMAIN_MAX = 35;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

function y(value: number) {
  return (
    PADDING.top + PLOT_HEIGHT - ((value - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * PLOT_HEIGHT
  );
}

function shapes(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-violin-shape]')).map(
    (element) => element.getAttribute('d') ?? ''
  );
}

describe('ViolinPlot', () => {
  it('should render one focusable violin per distribution with its statistics', () => {
    const { container } = render(<ViolinPlot data={data} ariaLabel="Latency spread" />);

    expect(screen.getByRole('group', { name: 'Latency spread' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(
      screen.getByRole('img', {
        name: 'A: median 12, Q1 11, Q3 14, min 10, max 18'
      })
    ).toHaveAttribute('tabindex', '0');
    expect(
      screen.getByRole('img', {
        name: 'B: median 20, Q1 20, Q3 20, min 5, max 35'
      })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-violin-shape]')).toHaveLength(2);
  });

  it('should position the median and quartiles on the value axis', () => {
    const { container } = render(<ViolinPlot data={data} ariaLabel="Latency spread" />);
    const group = container.querySelector('[data-violin-label="A"]');

    const median = group?.querySelector('[data-violin-median]');
    const q1 = group?.querySelector('[data-violin-quartile="q1"]');
    const q3 = group?.querySelector('[data-violin-quartile="q3"]');

    expect(Number(median?.getAttribute('y1'))).toBeCloseTo(y(12), 6);
    expect(Number(median?.getAttribute('y2'))).toBeCloseTo(y(12), 6);
    expect(Number(q1?.getAttribute('y1'))).toBeCloseTo(y(11), 6);
    expect(Number(q3?.getAttribute('y1'))).toBeCloseTo(y(14), 6);
    expect(group).toHaveAttribute('data-violin-median-value', '12');
    expect(group).toHaveAttribute('data-violin-q1-value', '11');
    expect(group).toHaveAttribute('data-violin-q3-value', '14');
  });

  it('should use the configured color and fall back to the default palette', () => {
    const { container } = render(<ViolinPlot data={data} ariaLabel="Latency spread" />);

    expect(container.querySelector('[data-violin-label="A"] [data-violin-shape]')).toHaveAttribute(
      'fill',
      '#3366ff'
    );
    expect(container.querySelector('[data-violin-label="B"] [data-violin-shape]')).toHaveAttribute(
      'fill',
      '#ff0000'
    );
  });

  it('should draw a symmetric KDE shape clipped to the category band', () => {
    const { container } = render(
      <ViolinPlot
        data={[{ label: 'Symmetric', values: [1, 2, 3, 4, 5] }]}
        height={240}
        ariaLabel="Symmetric spread"
      />
    );

    const path = container.querySelector('[data-violin-shape]');
    const d = path?.getAttribute('d') ?? '';
    const points = d
      .replace(/^M\s*/, '')
      .replace(/\s*Z$/, '')
      .split('L')
      .map((pair) => pair.trim().split(/\s+/).map(Number))
      .filter(([x, pointY]) => Number.isFinite(x) && Number.isFinite(pointY));

    const centerX = (480 - 44 - 16) / 2 + 44;
    const leftPoints = points.filter(([x]) => x <= centerX);
    const widths = leftPoints.map(([x]) => centerX - x);
    const symmetricY = (value: number) =>
      PADDING.top +
      (240 - PADDING.top - PADDING.bottom) -
      ((value - 1) / 4) * (240 - PADDING.top - PADDING.bottom);

    expect(points.length).toBeGreaterThan(32);
    expect(Math.min(...points.map(([x]) => x))).toBeCloseTo(centerX - 42, 6);
    expect(Math.max(...points.map(([x]) => x))).toBeCloseTo(centerX + 42, 6);
    // KDE of a symmetric sample is symmetric around its median (3).
    widths.forEach((width, index) => {
      expect(width).toBeCloseTo(widths[widths.length - 1 - index], 6);
    });
    expect(points.filter(([, pointY]) => pointY < symmetricY(3)).length).toBe(
      points.filter(([, pointY]) => pointY > symmetricY(3)).length
    );
  });

  it('should hide the median when showMedian is false and keep the quartiles', () => {
    const { container, rerender } = render(<ViolinPlot data={data} ariaLabel="Latency spread" />);

    expect(container.querySelectorAll('[data-violin-median]')).toHaveLength(2);

    rerender(<ViolinPlot data={data} showMedian={false} ariaLabel="Latency spread" />);

    expect(container.querySelectorAll('[data-violin-median]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-violin-quartile]')).toHaveLength(4);
  });

  it('should render and hide the value grid', () => {
    const { container, rerender } = render(<ViolinPlot data={data} ariaLabel="Latency spread" />);

    expect(container.querySelectorAll('[data-violin-grid]')).toHaveLength(5);

    rerender(<ViolinPlot data={data} showGrid={false} ariaLabel="Latency spread" />);

    expect(container.querySelectorAll('[data-violin-grid]')).toHaveLength(0);
    expect(screen.getByRole('group', { name: 'Latency spread' })).toBeInTheDocument();
  });

  it('should render the category labels and formatted value axis', () => {
    render(
      <ViolinPlot
        data={data}
        ariaLabel="Latency spread"
        valueFormatter={(value: number) => `${value} ms`}
      />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('5 ms')).toBeInTheDocument();
    expect(screen.getByText('12.5 ms')).toBeInTheDocument();
    expect(screen.getByText('35 ms')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'A: median 12 ms, Q1 11 ms, Q3 14 ms, min 10 ms, max 18 ms'
      })
    ).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a violin', () => {
    render(<ViolinPlot data={data} ariaLabel="Latency spread" />);

    const violin = screen.getByRole('img', {
      name: 'A: median 12, Q1 11, Q3 14, min 10, max 18'
    });

    expect(
      screen.queryByText('A: median 12, Q1 11, Q3 14, min 10, max 18')
    ).not.toBeInTheDocument();

    fireEvent.mouseEnter(violin);
    expect(screen.getByText('A: median 12, Q1 11, Q3 14, min 10, max 18')).toBeInTheDocument();

    fireEvent.blur(violin);
    expect(
      screen.queryByText('A: median 12, Q1 11, Q3 14, min 10, max 18')
    ).not.toBeInTheDocument();

    fireEvent.focus(violin);
    expect(screen.getByText('A: median 12, Q1 11, Q3 14, min 10, max 18')).toBeInTheDocument();
  });

  it('should accept a custom height', () => {
    const { container } = render(
      <ViolinPlot data={data} height={360} ariaLabel="Tall violin plot" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('should change the density shape when the bandwidth changes', () => {
    const { container, rerender } = render(
      <ViolinPlot data={data} bandwidth={0.1} ariaLabel="Latency spread" />
    );
    const narrow = shapes(container);

    rerender(<ViolinPlot data={data} bandwidth={0.9} ariaLabel="Latency spread" />);
    const wide = shapes(container);

    expect(narrow).toHaveLength(2);
    expect(wide).toHaveLength(2);
    expect(wide[0]).not.toBe(narrow[0]);
    expect(wide[1]).not.toBe(narrow[1]);
  });

  it('should render an empty state when there is no usable data', () => {
    const { container, rerender } = render(<ViolinPlot data={[]} ariaLabel="Empty violin plot" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);

    rerender(
      <ViolinPlot
        data={[{ label: 'A', values: [Number.NaN, Number.POSITIVE_INFINITY] }]}
        ariaLabel="Empty violin plot"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(<ViolinPlot data={data} ariaLabel="Latency spread" />);
    const first = shapes(container);

    unmount();

    const { container: secondContainer } = render(
      <ViolinPlot data={data} ariaLabel="Latency spread" />
    );

    expect(shapes(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ViolinPlot data={data} ariaLabel="Violin plot" />
        <ViolinPlot
          data={data}
          ariaLabel="Violin plot without grid"
          showGrid={false}
          showMedian={false}
          valueFormatter={(value: number) => `${value} ms`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('ViolinPlot data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <ViolinPlot
        data={data}
        ariaLabel="Latency spread"
        showDataTable="visible"
        dataTableCaption="Latency data"
      />
    );

    const table = screen.getByRole('table', { name: 'Latency data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Min', 'Q1', 'Median', 'Q3', 'Max']);
    expect(within(table).getByRole('cell', { name: 'A' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '18' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '35' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <ViolinPlot data={data} ariaLabel="Latency spread" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<ViolinPlot data={data} ariaLabel="Latency spread" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <ViolinPlot data={data} ariaLabel="Latency spread" exportable exportFileName="latency" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'latency');
    expect(screen.getByRole('status')).toHaveTextContent('Exported latency.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported latency.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'latency',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <ViolinPlot data={data} ariaLabel="Latency spread" animated />
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

    const reduced = render(<ViolinPlot data={data} ariaLabel="Latency spread" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <ViolinPlot
        data={data}
        ariaLabel="Latency spread"
        showDataTable="visible"
        dataTableCaption="Latency data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
