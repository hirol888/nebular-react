import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { CandlestickChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'Mon', open: 100, high: 110, low: 90, close: 105, volume: 1200 },
  { label: 'Tue', open: 105, high: 115, low: 95, close: 98, volume: 900 },
  { label: 'Wed', open: 98, high: 108, low: 92, close: 98, volume: 1500 }
];

const HEIGHT = 320;
const PADDING = { top: 16, bottom: 32 };
const DOMAIN_MIN = 90;
const DOMAIN_MAX = 115;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

function y(value: number) {
  return (
    PADDING.top + PLOT_HEIGHT - ((value - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * PLOT_HEIGHT
  );
}

const VOLUME_RATIO = 0.22;
const VOLUME_GAP = 8;
const VOLUME_HEIGHT = PLOT_HEIGHT * VOLUME_RATIO;
const PRICE_HEIGHT = PLOT_HEIGHT - VOLUME_HEIGHT - VOLUME_GAP;
const VOLUME_BOTTOM = PADDING.top + PLOT_HEIGHT;

describe('CandlestickChart', () => {
  it('should render a focusable candle per data point with the full OHLC values', () => {
    render(<CandlestickChart data={data} ariaLabel="Daily prices" />);

    expect(screen.getByRole('group', { name: 'Daily prices' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(
      screen.getByRole('img', { name: 'Mon: O 100, H 110, L 90, C 105, V 1200' })
    ).toHaveAttribute('tabindex', '0');
    expect(
      screen.getByRole('img', { name: 'Tue: O 105, H 115, L 95, C 98, V 900' })
    ).toBeInTheDocument();
  });

  it('should place bodies and wicks on the value axis', () => {
    const { container } = render(<CandlestickChart data={data} ariaLabel="Daily prices" />);
    const bodies = Array.from(container.querySelectorAll('[data-candle-body]'));
    const wicks = Array.from(container.querySelectorAll('[data-candle-wick]'));

    expect(bodies).toHaveLength(3);
    expect(wicks).toHaveLength(3);

    // Bullish candle: body top is the close, body bottom is the open.
    expect(Number(bodies[0].getAttribute('y'))).toBeCloseTo(y(105), 6);
    expect(Number(bodies[0].getAttribute('height'))).toBeCloseTo(y(100) - y(105), 6);

    // Bearish candle: body top is the open, body bottom is the close.
    expect(Number(bodies[1].getAttribute('y'))).toBeCloseTo(y(105), 6);
    expect(Number(bodies[1].getAttribute('height'))).toBeCloseTo(y(98) - y(105), 6);

    // Doji (open === close) keeps a one pixel body.
    expect(Number(bodies[2].getAttribute('height'))).toBeCloseTo(1, 6);

    expect(Number(wicks[0].getAttribute('y1'))).toBeCloseTo(y(110), 6);
    expect(Number(wicks[0].getAttribute('y2'))).toBeCloseTo(y(90), 6);
  });

  it('should paint bullish candles green and bearish candles red', () => {
    const { container } = render(<CandlestickChart data={data} ariaLabel="Daily prices" />);
    const bodies = Array.from(container.querySelectorAll('[data-candle-body]'));
    const wicks = Array.from(container.querySelectorAll('[data-candle-wick]'));

    expect(bodies[0]).toHaveAttribute('data-candle-direction', 'up');
    expect(bodies[0]).toHaveAttribute('fill', '#00d68f');
    expect(wicks[0]).toHaveAttribute('stroke', '#00d68f');

    expect(bodies[1]).toHaveAttribute('data-candle-direction', 'down');
    expect(bodies[1]).toHaveAttribute('fill', '#ff3d71');
    expect(wicks[1]).toHaveAttribute('stroke', '#ff3d71');

    // A doji counts as bullish.
    expect(bodies[2]).toHaveAttribute('data-candle-direction', 'up');
  });

  it('should show a tooltip on hover and focus of a candle', () => {
    render(<CandlestickChart data={data} ariaLabel="Daily prices" />);

    const candle = screen.getByRole('img', {
      name: 'Mon: O 100, H 110, L 90, C 105, V 1200'
    });

    expect(screen.queryByText('Mon: O 100, H 110, L 90, C 105, V 1200')).not.toBeInTheDocument();

    fireEvent.mouseEnter(candle);
    expect(screen.getByText('Mon: O 100, H 110, L 90, C 105, V 1200')).toBeInTheDocument();

    fireEvent.blur(candle);
    expect(screen.queryByText('Mon: O 100, H 110, L 90, C 105, V 1200')).not.toBeInTheDocument();

    fireEvent.focus(candle);
    expect(screen.getByText('Mon: O 100, H 110, L 90, C 105, V 1200')).toBeInTheDocument();
  });

  it('should call onCandleClick with the candle and its index on click and keyboard', () => {
    const onCandleClick = jest.fn();

    render(
      <CandlestickChart data={data} ariaLabel="Clickable prices" onCandleClick={onCandleClick} />
    );

    const candle = screen.getByRole('button', {
      name: 'Tue: O 105, H 115, L 95, C 98, V 900'
    });

    fireEvent.click(candle);
    expect(onCandleClick).toHaveBeenLastCalledWith(data[1], 1);

    fireEvent.keyDown(candle, { key: 'Enter' });
    expect(onCandleClick).toHaveBeenLastCalledWith(data[1], 1);

    fireEvent.keyDown(candle, { key: ' ' });
    expect(onCandleClick).toHaveBeenLastCalledWith(data[1], 1);
    expect(onCandleClick).toHaveBeenCalledTimes(3);
  });

  it('should render volume bars only when showVolume is true', () => {
    const { container, rerender } = render(
      <CandlestickChart data={data} ariaLabel="Daily prices" />
    );

    expect(container.querySelectorAll('[data-candle-volume]')).toHaveLength(0);

    rerender(<CandlestickChart data={data} ariaLabel="Daily prices" showVolume />);

    const bars = Array.from(container.querySelectorAll('[data-candle-volume]'));

    expect(bars).toHaveLength(3);
    expect(Number(bars[0].getAttribute('height'))).toBeCloseTo((1200 / 1500) * VOLUME_HEIGHT, 6);
    expect(Number(bars[0].getAttribute('y'))).toBeCloseTo(
      VOLUME_BOTTOM - (1200 / 1500) * VOLUME_HEIGHT,
      6
    );
    expect(Number(bars[2].getAttribute('height'))).toBeCloseTo(VOLUME_HEIGHT, 6);

    // The price area shrinks to leave room for the volume bars.
    const body = container.querySelector('[data-candle-body]');

    expect(Number(body?.getAttribute('height'))).toBeCloseTo((5 / 25) * PRICE_HEIGHT, 6);
  });

  it('should render the value grid and hide it when showGrid is false', () => {
    const { container, rerender } = render(
      <CandlestickChart data={data} ariaLabel="Daily prices" />
    );

    expect(container.querySelectorAll('[data-candle-grid]')).toHaveLength(5);
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('115')).toBeInTheDocument();

    rerender(<CandlestickChart data={data} ariaLabel="Daily prices" showGrid={false} />);

    expect(container.querySelectorAll('[data-candle-grid]')).toHaveLength(0);
    expect(screen.getByRole('group', { name: 'Daily prices' })).toBeInTheDocument();
  });

  it('should apply the value formatter to the candle names', () => {
    render(
      <CandlestickChart
        data={data}
        ariaLabel="Daily prices"
        valueFormatter={(value: number) => `${value} USD`}
      />
    );

    expect(
      screen.getByRole('img', {
        name: 'Mon: O 100 USD, H 110 USD, L 90 USD, C 105 USD, V 1200 USD'
      })
    ).toBeInTheDocument();
  });

  it('should accept a custom height', () => {
    const { container } = render(
      <CandlestickChart data={data} height={360} ariaLabel="Tall candlestick" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<CandlestickChart data={[]} ariaLabel="Empty candlestick" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <CandlestickChart data={data} ariaLabel="Candlestick" />
        <CandlestickChart
          data={data}
          ariaLabel="Candlestick with volume"
          showVolume
          showGrid={false}
          valueFormatter={(value: number) => `${value} USD`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('CandlestickChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <CandlestickChart
        data={data}
        ariaLabel="Daily prices"
        showDataTable="visible"
        dataTableCaption="Daily prices data"
      />
    );

    const table = screen.getByRole('table', { name: 'Daily prices data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Date', 'Open', 'High', 'Low', 'Close']);
    expect(within(table).getByRole('cell', { name: 'Mon' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '90' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <CandlestickChart data={data} ariaLabel="Daily prices" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<CandlestickChart data={data} ariaLabel="Daily prices" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <CandlestickChart data={data} ariaLabel="Daily prices" exportable exportFileName="prices" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'prices');
    expect(screen.getByRole('status')).toHaveTextContent('Exported prices.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported prices.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'prices',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <CandlestickChart data={data} ariaLabel="Daily prices" animated />
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

    const reduced = render(<CandlestickChart data={data} ariaLabel="Daily prices" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <CandlestickChart
        data={data}
        ariaLabel="Daily prices"
        showDataTable="visible"
        dataTableCaption="Daily prices data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
