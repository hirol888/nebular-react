import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ComboChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const labels = ['Jan', 'Feb', 'Mar'];
const series = [
  { name: 'Revenue', type: 'bar' as const, data: [10, 20, 30] },
  { name: 'Margin', type: 'line' as const, data: [5, 15, 25] },
  { name: 'Growth', type: 'area' as const, data: [2, 8, 12] }
];

describe('ComboChart', () => {
  it('renders an accessible group with bars, lines and areas', () => {
    const { container } = render(
      <ComboChart labels={labels} series={series} ariaLabel="Revenue combo" />
    );

    expect(screen.getByRole('group', { name: 'Revenue combo' })).toBeInTheDocument();

    const bars = Array.from(container.querySelectorAll('rect')).filter(
      (rect) => rect.getAttribute('role') === 'img'
    );

    expect(bars).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Revenue, Jan: 10' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Margin, Feb: 15' })).toBeInTheDocument();
    expect(container.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
  });

  it('shows a tooltip when a bar receives focus', () => {
    render(<ComboChart labels={labels} series={series} />);

    fireEvent.mouseEnter(screen.getByRole('img', { name: 'Revenue, Feb: 20' }));

    expect(screen.getByText('Revenue · Feb: 20')).toBeInTheDocument();
  });

  it('shows a tooltip when a line point receives focus', () => {
    render(<ComboChart labels={labels} series={series} />);

    fireEvent.focus(screen.getByRole('img', { name: 'Margin, Mar: 25' }));

    expect(screen.getByText('Margin · Mar: 25')).toBeInTheDocument();
  });

  it('renders the legend for every series by default', () => {
    render(<ComboChart labels={labels} series={series} />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    ['Revenue', 'Margin', 'Growth'].forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it('hides the legend when showLegend is false', () => {
    render(<ComboChart labels={labels} series={series} showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('applies the value formatter to labels and tooltips', () => {
    render(
      <ComboChart labels={labels} series={series} valueFormatter={(value: number) => `${value}%`} />
    );

    expect(screen.getByRole('img', { name: 'Revenue, Jan: 10%' })).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole('img', { name: 'Revenue, Jan: 10%' }));

    expect(screen.getByText('Revenue · Jan: 10%')).toBeInTheDocument();
  });

  it('includes negative values in the shared scale', () => {
    render(
      <ComboChart
        labels={['Jan', 'Feb']}
        series={[
          { name: 'Profit', type: 'bar', data: [-10, 20] },
          { name: 'Trend', type: 'line', data: [0, 10] }
        ]}
      />
    );

    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders an empty state when there is no data', () => {
    render(<ComboChart labels={[]} series={[]} />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('accepts a custom height', () => {
    const { container } = render(
      <ComboChart labels={labels} series={series} height={360} ariaLabel="Tall chart" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ComboChart labels={labels} series={series} ariaLabel="Revenue combo" />
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
        <ComboChart
          labels={labels}
          series={series}
          ariaLabel="Revenue combo"
          showDataTable="visible"
          dataTableCaption="Revenue combo data"
        />
      );

      const table = screen.getByRole('table', { name: 'Revenue combo data' });

      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((header) => header.textContent)
      ).toEqual(['Label', 'Revenue', 'Margin', 'Growth']);

      const rows = within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) =>
          within(row)
            .getAllByRole('cell')
            .map((cell) => cell.textContent)
        );

      expect(rows).toEqual([
        ['Jan', '10', '5', '2'],
        ['Feb', '20', '15', '8'],
        ['Mar', '30', '25', '12']
      ]);
    });

    it('should visually hide the data table when showDataTable is hidden', () => {
      const { container } = render(
        <ComboChart
          labels={labels}
          series={series}
          ariaLabel="Revenue combo"
          showDataTable="hidden"
          dataTableCaption="Revenue combo data"
        />
      );

      expect(screen.getByRole('table', { name: 'Revenue combo data' })).toBeInTheDocument();
      expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    });

    it('should not render a data table or export controls by default', () => {
      render(<ComboChart labels={labels} series={series} ariaLabel="Revenue combo" />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    });

    it('should export the chart as svg and png and announce the file names', async () => {
      render(
        <ComboChart
          labels={labels}
          series={series}
          ariaLabel="Revenue combo"
          exportable
          exportFileName="combo"
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'combo');
      expect(screen.getByRole('status')).toHaveTextContent('Exported combo.svg');

      fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('Exported combo.png')
      );
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'combo');
    });

    it('should mark the chart as animated and honor reduced motion', () => {
      const { container, unmount } = render(
        <ComboChart labels={labels} series={series} ariaLabel="Revenue combo" animated />
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
        <ComboChart labels={labels} series={series} ariaLabel="Revenue combo" animated />
      );

      expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

      window.matchMedia = originalMatchMedia;
    });

    it('should have no accessibility violations with data table and export', async () => {
      const { container } = render(
        <ComboChart
          labels={labels}
          series={series}
          ariaLabel="Revenue combo"
          showDataTable="visible"
          dataTableCaption="Revenue combo data"
          exportable
          exportFileName="combo"
          animated
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
