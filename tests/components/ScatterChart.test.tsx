import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ScatterChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const series = [
  {
    name: 'Series A',
    data: [
      { x: 0, y: 0, label: 'A1' },
      { x: 5, y: 5, label: 'A2' }
    ]
  },
  {
    name: 'Series B',
    data: [{ x: 10, y: 10, label: 'B1' }]
  }
];

describe('ScatterChart', () => {
  it('should render axes with ticks and axis labels', () => {
    const { container } = render(
      <ScatterChart series={series} ariaLabel="Scatter" xLabel="Weight" yLabel="Score" />
    );

    expect(screen.getByRole('group', { name: 'Scatter' })).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();

    // Domain 0..10 is padded by 10%, so both axes show -1, 2, 5, 8 and 11.
    expect(screen.getAllByText('-1')).toHaveLength(2);
    expect(screen.getAllByText('11')).toHaveLength(2);

    // Five grid lines per axis plus the two axis lines.
    expect(container.querySelectorAll('line')).toHaveLength(12);
  });

  it('should hide the grid but keep the axes when showGrid is false', () => {
    const { container } = render(
      <ScatterChart series={series} ariaLabel="No grid" showGrid={false} />
    );

    expect(container.querySelectorAll('line')).toHaveLength(2);
    expect(screen.getByRole('group', { name: 'No grid' })).toBeInTheDocument();
  });

  it('should render a focusable point for each series entry', () => {
    render(<ScatterChart series={series} ariaLabel="Scatter" />);

    expect(screen.getAllByRole('img')).toHaveLength(3);

    const point = screen.getByRole('img', { name: 'Series A, A1: (0, 0)' });

    expect(point).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Series A, A2: (5, 5)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Series B, B1: (10, 10)' })).toBeInTheDocument();
  });

  it('should show a tooltip when a point is hovered or focused', () => {
    render(<ScatterChart series={series} ariaLabel="Scatter" />);

    const point = screen.getByRole('img', { name: 'Series A, A2: (5, 5)' });

    expect(screen.queryByText('Series A · A2: (5, 5)')).not.toBeInTheDocument();

    fireEvent.mouseEnter(point);
    expect(screen.getByText('Series A · A2: (5, 5)')).toBeInTheDocument();

    fireEvent.blur(point);
    expect(screen.queryByText('Series A · A2: (5, 5)')).not.toBeInTheDocument();

    fireEvent.focus(point);
    expect(screen.getByText('Series A · A2: (5, 5)')).toBeInTheDocument();
  });

  it('should position negative values below and to the left of positive ones', () => {
    render(
      <ScatterChart
        series={[
          {
            name: 'Mixed',
            data: [
              { x: -5, y: -5, label: 'neg' },
              { x: 5, y: 5, label: 'pos' }
            ]
          }
        ]}
        ariaLabel="Negatives"
      />
    );

    const negative = screen.getByRole('img', { name: 'Mixed, neg: (-5, -5)' });
    const positive = screen.getByRole('img', { name: 'Mixed, pos: (5, 5)' });

    expect(Number(negative.getAttribute('cy'))).toBeGreaterThan(
      Number(positive.getAttribute('cy'))
    );
    expect(Number(negative.getAttribute('cx'))).toBeLessThan(Number(positive.getAttribute('cx')));
  });

  it('should apply valueFormatter to point labels', () => {
    render(
      <ScatterChart
        series={[{ name: 'S', data: [{ x: 1.5, y: 2.25, label: 'p' }] }]}
        ariaLabel="Formatted"
        valueFormatter={(value: number) => value.toFixed(2)}
      />
    );

    expect(screen.getByRole('img', { name: 'S, p: (1.50, 2.25)' })).toBeInTheDocument();
  });

  it('should render a legend for every series and hide it when showLegend is false', () => {
    const { rerender } = render(<ScatterChart series={series} ariaLabel="Legend" />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Series A')).toBeInTheDocument();
    expect(screen.getByText('Series B')).toBeInTheDocument();

    rerender(<ScatterChart series={series} ariaLabel="Legend" showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should render an empty state when there are no points', () => {
    const { container } = render(<ScatterChart series={[]} ariaLabel="Empty scatter" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ScatterChart series={series} ariaLabel="Scatter" xLabel="X" yLabel="Y" />
        <ScatterChart series={series} ariaLabel="Scatter without grid" showGrid={false} />
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
        <ScatterChart
          series={series}
          ariaLabel="Scatter"
          showDataTable="visible"
          dataTableCaption="Scatter data"
        />
      );

      const table = screen.getByRole('table', { name: 'Scatter data' });

      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((header) => header.textContent)
      ).toEqual(['Series', 'X', 'Y']);

      const rows = within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) =>
          within(row)
            .getAllByRole('cell')
            .map((cell) => cell.textContent)
        );

      expect(rows).toEqual([
        ['Series A', '0', '0'],
        ['Series A', '5', '5'],
        ['Series B', '10', '10']
      ]);
    });

    it('should visually hide the data table when showDataTable is hidden', () => {
      const { container } = render(
        <ScatterChart
          series={series}
          ariaLabel="Scatter"
          showDataTable="hidden"
          dataTableCaption="Scatter data"
        />
      );

      expect(screen.getByRole('table', { name: 'Scatter data' })).toBeInTheDocument();
      expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    });

    it('should not render a data table or export controls by default', () => {
      render(<ScatterChart series={series} ariaLabel="Scatter" />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    });

    it('should export the chart as svg and png and announce the file names', async () => {
      render(
        <ScatterChart series={series} ariaLabel="Scatter" exportable exportFileName="scatter" />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'scatter');
      expect(screen.getByRole('status')).toHaveTextContent('Exported scatter.svg');

      fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('Exported scatter.png')
      );
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'scatter');
    });

    it('should mark the chart as animated and honor reduced motion', () => {
      const { container, unmount } = render(
        <ScatterChart series={series} ariaLabel="Scatter" animated />
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

      const reduced = render(<ScatterChart series={series} ariaLabel="Scatter" animated />);

      expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

      window.matchMedia = originalMatchMedia;
    });

    it('should have no accessibility violations with data table and export', async () => {
      const { container } = render(
        <ScatterChart
          series={series}
          ariaLabel="Scatter"
          showDataTable="visible"
          dataTableCaption="Scatter data"
          exportable
          exportFileName="scatter"
          animated
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
