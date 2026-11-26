import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { RadarChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const axes = ['Speed', 'Power', 'Range', 'Comfort', 'Safety'];

const series = [
  { name: 'Model A', values: [80, 60, 70, 90, 50] },
  { name: 'Model B', values: [60, 90, 40, 70, 80], color: '#00d68f' }
];

function distanceFromCenter(element: Element, center: number) {
  const x = Number(element.getAttribute('cx'));
  const y = Number(element.getAttribute('cy'));

  return Math.hypot(x - center, y - center);
}

describe('RadarChart', () => {
  it('should render a focusable vertex for every series and axis', () => {
    render(<RadarChart axes={axes} series={series} ariaLabel="Car comparison" />);

    expect(screen.getByRole('group', { name: 'Car comparison' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(10);
    expect(screen.getByRole('img', { name: 'Model A, Speed: 80' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    expect(screen.getByRole('img', { name: 'Model B, Safety: 80' })).toBeInTheDocument();
  });

  it('should render every axis label', () => {
    render(<RadarChart axes={axes} series={series} ariaLabel="Car comparison" />);

    axes.forEach((axis) => {
      expect(screen.getByText(axis)).toBeInTheDocument();
    });
  });

  it('should render one polygon per level plus one polygon per series', () => {
    const { container } = render(
      <RadarChart axes={axes} series={series} levels={3} ariaLabel="Levels" showLegend={false} />
    );

    expect(container.querySelectorAll('polygon')).toHaveLength(3 + series.length);
  });

  it('should scale vertices by maxValue and clamp values above it', () => {
    render(
      <RadarChart
        axes={['A', 'B', 'C', 'D']}
        series={[{ name: 'S', values: [50, 100, 150, 0] }]}
        size={200}
        maxValue={100}
        ariaLabel="Scaled"
        showLegend={false}
      />
    );

    const full = distanceFromCenter(screen.getByRole('img', { name: 'S, B: 100' }), 100);

    expect(distanceFromCenter(screen.getByRole('img', { name: 'S, A: 50' }), 100)).toBeCloseTo(
      full / 2,
      1
    );
    expect(distanceFromCenter(screen.getByRole('img', { name: 'S, C: 150' }), 100)).toBeCloseTo(
      full,
      1
    );
    expect(distanceFromCenter(screen.getByRole('img', { name: 'S, D: 0' }), 100)).toBeCloseTo(0, 1);
  });

  it('should apply valueFormatter to vertex labels', () => {
    render(
      <RadarChart
        axes={['A', 'B']}
        series={[{ name: 'S', values: [0.5, 1] }]}
        ariaLabel="Formatted"
        showLegend={false}
        valueFormatter={(value: number) => `${Math.round(value * 100)}%`}
      />
    );

    expect(screen.getByRole('img', { name: 'S, A: 50%' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'S, B: 100%' })).toBeInTheDocument();
  });

  it('should show a tooltip when a vertex is hovered or focused', () => {
    render(<RadarChart axes={axes} series={series} ariaLabel="Car comparison" />);

    const vertex = screen.getByRole('img', { name: 'Model A, Speed: 80' });

    expect(screen.queryByText('Model A · Speed: 80')).not.toBeInTheDocument();

    fireEvent.mouseEnter(vertex);
    expect(screen.getByText('Model A · Speed: 80')).toBeInTheDocument();

    fireEvent.blur(vertex);
    expect(screen.queryByText('Model A · Speed: 80')).not.toBeInTheDocument();

    fireEvent.focus(vertex);
    expect(screen.getByText('Model A · Speed: 80')).toBeInTheDocument();
  });

  it('should render a legend for every series and hide it when showLegend is false', () => {
    const { rerender } = render(
      <RadarChart axes={axes} series={series} ariaLabel="Car comparison" />
    );

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Model A')).toBeInTheDocument();
    expect(screen.getByText('Model B')).toBeInTheDocument();

    rerender(
      <RadarChart axes={axes} series={series} ariaLabel="Car comparison" showLegend={false} />
    );

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should render an empty state when there are no axes or no series', () => {
    const { container, rerender } = render(
      <RadarChart axes={[]} series={series} ariaLabel="Empty radar" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();

    rerender(<RadarChart axes={axes} series={[]} ariaLabel="Empty radar" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <RadarChart axes={axes} series={series} ariaLabel="Radar" />
        <RadarChart
          axes={axes}
          series={series}
          levels={2}
          size={200}
          ariaLabel="Radar without legend"
          showLegend={false}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('data table, export and animation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render an accessible data table when showDataTable is visible', () => {
      render(
        <RadarChart
          axes={axes}
          series={series}
          ariaLabel="Car comparison"
          showDataTable="visible"
          dataTableCaption="Car comparison data"
        />
      );

      const table = screen.getByRole('table', { name: 'Car comparison data' });

      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((header) => header.textContent)
      ).toEqual(['Axis', 'Model A', 'Model B']);

      const rows = within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) =>
          within(row)
            .getAllByRole('cell')
            .map((cell) => cell.textContent)
        );

      expect(rows).toEqual([
        ['Speed', '80', '60'],
        ['Power', '60', '90'],
        ['Range', '70', '40'],
        ['Comfort', '90', '70'],
        ['Safety', '50', '80']
      ]);
    });

    it('should visually hide the data table when showDataTable is hidden', () => {
      const { container } = render(
        <RadarChart
          axes={axes}
          series={series}
          ariaLabel="Car comparison"
          showDataTable="hidden"
          dataTableCaption="Car comparison data"
        />
      );

      expect(screen.getByRole('table', { name: 'Car comparison data' })).toBeInTheDocument();
      expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    });

    it('should not render a data table or export controls by default', () => {
      render(<RadarChart axes={axes} series={series} ariaLabel="Car comparison" />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    });

    it('should export the chart as svg and png and announce the file names', async () => {
      render(
        <RadarChart
          axes={axes}
          series={series}
          ariaLabel="Car comparison"
          exportable
          exportFileName="radar"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'radar');
      expect(screen.getByRole('status')).toHaveTextContent('Exported radar.svg');

      fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('Exported radar.png')
      );
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'radar');
    });

    it('should mark the chart as animated and honor reduced motion', () => {
      const { container, unmount } = render(
        <RadarChart axes={axes} series={series} ariaLabel="Car comparison" animated />
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
        <RadarChart axes={axes} series={series} ariaLabel="Car comparison" animated />
      );

      expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

      window.matchMedia = originalMatchMedia;
    });

    it('should have no accessibility violations with data table and export', async () => {
      const { container } = render(
        <RadarChart
          axes={axes}
          series={series}
          ariaLabel="Car comparison"
          showDataTable="visible"
          dataTableCaption="Car comparison data"
          exportable
          exportFileName="radar"
          animated
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
