import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { StackedBarChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const labels = ['Jan', 'Feb', 'Mar'];
const series = [
  { name: 'Direct', data: [10, 20, 30] },
  { name: 'Organic', data: [5, 10, 15] },
  { name: 'Paid', data: [15, 5, 5] }
];

describe('StackedBarChart', () => {
  it('renders one segment per series and label', () => {
    const { container } = render(
      <StackedBarChart labels={labels} series={series} ariaLabel="Traffic stack" />
    );

    expect(screen.getByRole('group', { name: 'Traffic stack' })).toBeInTheDocument();
    expect(container.querySelectorAll('rect[role="img"]')).toHaveLength(9);
  });

  it('labels each segment with its series, value and total', () => {
    render(<StackedBarChart labels={labels} series={series} />);

    expect(screen.getByRole('img', { name: 'Direct, Jan: 10 (total 30)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Organic, Feb: 10 (total 35)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Paid, Mar: 5 (total 50)' })).toBeInTheDocument();
  });

  it('shows a tooltip with the series, value and total', () => {
    render(<StackedBarChart labels={labels} series={series} />);

    fireEvent.mouseEnter(screen.getByRole('img', { name: 'Direct, Jan: 10 (total 30)' }));

    expect(screen.getByText('Direct · Jan: 10 (total 30)')).toBeInTheDocument();
  });

  it('applies the value formatter', () => {
    render(
      <StackedBarChart
        labels={labels}
        series={series}
        valueFormatter={(value: number) => `${value} users`}
      />
    );

    expect(
      screen.getByRole('img', { name: 'Direct, Jan: 10 users (total 30 users)' })
    ).toBeInTheDocument();
  });

  it('renders the legend with every series', () => {
    render(<StackedBarChart labels={labels} series={series} />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    ['Direct', 'Organic', 'Paid'].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it('hides the legend and the grid when requested', () => {
    const { container } = render(
      <StackedBarChart labels={labels} series={series} showLegend={false} showGrid={false} />
    );

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
    expect(container.querySelectorAll('line')).toHaveLength(2);
  });

  it('stacks negative values below the zero baseline', () => {
    render(
      <StackedBarChart
        labels={['Jan']}
        series={[
          { name: 'A', data: [-10] },
          { name: 'B', data: [-5] }
        ]}
      />
    );

    expect(screen.getByText('-15')).toBeInTheDocument();
  });

  it('renders an empty state when there is no data', () => {
    render(<StackedBarChart labels={[]} series={[]} />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <StackedBarChart labels={labels} series={series} ariaLabel="Traffic stack" />
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
        <StackedBarChart
          labels={labels}
          series={series}
          ariaLabel="Traffic stack"
          showDataTable="visible"
          dataTableCaption="Traffic stack data"
        />
      );

      const table = screen.getByRole('table', { name: 'Traffic stack data' });

      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((header) => header.textContent)
      ).toEqual(['Label', 'Direct', 'Organic', 'Paid']);

      const rows = within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) =>
          within(row)
            .getAllByRole('cell')
            .map((cell) => cell.textContent)
        );

      expect(rows).toEqual([
        ['Jan', '10', '5', '15'],
        ['Feb', '20', '10', '5'],
        ['Mar', '30', '15', '5']
      ]);
    });

    it('should visually hide the data table when showDataTable is hidden', () => {
      const { container } = render(
        <StackedBarChart
          labels={labels}
          series={series}
          ariaLabel="Traffic stack"
          showDataTable="hidden"
          dataTableCaption="Traffic stack data"
        />
      );

      expect(screen.getByRole('table', { name: 'Traffic stack data' })).toBeInTheDocument();
      expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    });

    it('should not render a data table or export controls by default', () => {
      render(<StackedBarChart labels={labels} series={series} ariaLabel="Traffic stack" />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    });

    it('should export the chart as svg and png and announce the file names', async () => {
      render(
        <StackedBarChart
          labels={labels}
          series={series}
          ariaLabel="Traffic stack"
          exportable
          exportFileName="stacked"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'stacked');
      expect(screen.getByRole('status')).toHaveTextContent('Exported stacked.svg');

      fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('Exported stacked.png')
      );
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'stacked');
    });

    it('should mark the chart as animated and honor reduced motion', () => {
      const { container, unmount } = render(
        <StackedBarChart labels={labels} series={series} ariaLabel="Traffic stack" animated />
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
        <StackedBarChart labels={labels} series={series} ariaLabel="Traffic stack" animated />
      );

      expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

      window.matchMedia = originalMatchMedia;
    });

    it('should have no accessibility violations with data table and export', async () => {
      const { container } = render(
        <StackedBarChart
          labels={labels}
          series={series}
          ariaLabel="Traffic stack"
          showDataTable="visible"
          dataTableCaption="Traffic stack data"
          exportable
          exportFileName="stacked"
          animated
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
