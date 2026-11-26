import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Gauge, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

describe('Gauge', () => {
  it('should render the track and the value arc', () => {
    const { container } = render(<Gauge value={72} ariaLabel="CPU" />);

    expect(screen.getByRole('img', { name: 'CPU: 72' })).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('should render only the track when the value is at the minimum', () => {
    const { container } = render(<Gauge value={0} ariaLabel="Empty gauge" />);

    expect(screen.getByRole('img', { name: 'Empty gauge: 0' })).toBeInTheDocument();
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('should clamp values to the min and max bounds', () => {
    const { rerender } = render(<Gauge value={150} ariaLabel="Clamped" />);

    expect(screen.getByRole('img', { name: 'Clamped: 100' })).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    rerender(<Gauge value={-20} ariaLabel="Clamped" />);

    expect(screen.getByRole('img', { name: 'Clamped: 0' })).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(<Gauge value={5} min={10} max={20} ariaLabel="Clamped" />);

    expect(screen.getByRole('img', { name: 'Clamped: 10' })).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should grow the value arc with the ratio and close it at the maximum', () => {
    const { container: half } = render(<Gauge value={50} ariaLabel="Half" />);

    expect(half.querySelectorAll('path')).toHaveLength(2);
    expect(half.querySelectorAll('path')[1].getAttribute('d')).not.toContain('0 1 1');

    const { container: full } = render(<Gauge value={100} ariaLabel="Full" />);

    expect(full.querySelectorAll('path')[1].getAttribute('d')).toContain('0 1 1');
  });

  it('should apply valueFormatter to the visible value and the accessible name', () => {
    render(<Gauge value={72} ariaLabel="CPU" valueFormatter={(value: number) => `${value}%`} />);

    expect(screen.getByRole('img', { name: 'CPU: 72%' })).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('should render the label next to the value', () => {
    render(<Gauge value={40} ariaLabel="Requests" label={<span>Requests per second</span>} />);

    expect(screen.getByText('Requests per second')).toBeInTheDocument();
  });

  it('should apply size, thickness, color and trackColor', () => {
    const { container } = render(
      <Gauge
        value={60}
        ariaLabel="Styled"
        size={240}
        thickness={20}
        color="#ff3d71"
        trackColor="#e4e9f2"
      />
    );

    const svg = container.querySelector('svg');
    const [track, value] = Array.from(container.querySelectorAll('path'));

    expect(svg).toHaveAttribute('width', '240');
    expect(svg).toHaveAttribute('height', '240');
    expect(track).toHaveAttribute('stroke', '#e4e9f2');
    expect(track).toHaveAttribute('stroke-width', '20');
    expect(value).toHaveAttribute('stroke', '#ff3d71');
    expect(value).toHaveAttribute('stroke-width', '20');
  });

  it('should render only the track when min and max are equal', () => {
    const { container } = render(<Gauge value={5} min={5} max={5} ariaLabel="Flat range" />);

    expect(screen.getByRole('img', { name: 'Flat range: 5' })).toBeInTheDocument();
    expect(container.querySelectorAll('path')).toHaveLength(1);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Gauge value={72} ariaLabel="CPU" />
        <Gauge value={30} ariaLabel="Memory" label="Memory" color="#00d68f" />
        <Gauge value={0} ariaLabel="Idle" size={120} thickness={8} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Gauge data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <Gauge
        value={72}
        ariaLabel="CPU"
        label="CPU load"
        showDataTable="visible"
        dataTableCaption="CPU data"
      />
    );

    const table = screen.getByRole('table', { name: 'CPU data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Value', 'Min', 'Max']);
    expect(within(table).getByRole('cell', { name: 'CPU load' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '72' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '0' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '100' })).toBeInTheDocument();
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(<Gauge value={72} ariaLabel="CPU" showDataTable="hidden" />);

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<Gauge value={72} ariaLabel="CPU" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(<Gauge value={72} ariaLabel="CPU" exportable exportFileName="cpu" />);

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'cpu');
    expect(screen.getByRole('status')).toHaveTextContent('Exported cpu.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Exported cpu.png'));
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'cpu',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(<Gauge value={72} ariaLabel="CPU" animated />);

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

    const reduced = render(<Gauge value={72} ariaLabel="CPU" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <Gauge
        value={72}
        ariaLabel="CPU"
        label="CPU load"
        showDataTable="visible"
        dataTableCaption="CPU data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
