import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  Sparkline,
  exportChartPng,
  exportChartSvg
} from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const labels = ['Jan', 'Feb', 'Mar'];
const series = [
  { name: 'Revenue', data: [12, 19, 14] },
  { name: 'Costs', data: [8, 11, 9] }
];

describe('charts', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders LineChart, shows tooltip and handles point clicks', async () => {
    const user = userEvent.setup();
    const onPointClick = jest.fn();

    render(
      <LineChart
        labels={labels}
        series={series}
        ariaLabel="Revenue and costs"
        onPointClick={onPointClick}
      />
    );

    expect(screen.getByRole('group', { name: 'Revenue and costs' })).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Costs')).toBeInTheDocument();

    const point = screen.getByRole('button', { name: 'Revenue, Jan: 12' });
    fireEvent.mouseEnter(point);

    expect(screen.getByText('Revenue · Jan: 12')).toBeInTheDocument();

    await user.click(point);

    expect(onPointClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Revenue' }), 0, 12);
  });

  it('renders BarChart, shows tooltip and handles bar clicks', async () => {
    const user = userEvent.setup();
    const onBarClick = jest.fn();

    render(
      <BarChart labels={labels} series={series} ariaLabel="Revenue bars" onBarClick={onBarClick} />
    );

    const bar = screen.getByRole('button', { name: 'Revenue, Feb: 19' });
    fireEvent.mouseEnter(bar);

    expect(screen.getByText('Revenue · Feb: 19')).toBeInTheDocument();

    await user.click(bar);

    expect(onBarClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Revenue' }),
      'Feb',
      19
    );
  });

  it('renders DonutChart, updates the center and handles segment clicks', async () => {
    const user = userEvent.setup();
    const onSegmentClick = jest.fn();

    render(
      <DonutChart
        data={[
          { label: 'Direct', value: 60 },
          { label: 'Organic', value: 40 }
        ]}
        ariaLabel="Traffic"
        centerLabel="Total"
        onSegmentClick={onSegmentClick}
      />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    const segment = screen.getByRole('button', { name: 'Direct: 60 (60%)' });
    fireEvent.mouseEnter(segment);

    expect(screen.getAllByText('Direct').length).toBeGreaterThan(1);

    await user.click(segment);

    expect(onSegmentClick).toHaveBeenCalledWith(expect.objectContaining({ label: 'Direct' }), 0);
  });

  it('renders AreaChart and Sparkline', () => {
    const { container } = render(
      <div>
        <AreaChart labels={labels} series={series} ariaLabel="Area chart" />
        <Sparkline data={[4, 8, 6, 12]} ariaLabel="Weekly users" />
      </div>
    );

    expect(screen.getByRole('group', { name: 'Area chart' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Weekly users: last value 12/ })).toBeInTheDocument();
    expect(container.querySelectorAll('path').length).toBeGreaterThan(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <LineChart labels={labels} series={series} ariaLabel="Line" />
        <BarChart labels={labels} series={series} ariaLabel="Bar" />
        <DonutChart
          data={[
            { label: 'Direct', value: 60 },
            { label: 'Organic', value: 40 }
          ]}
          ariaLabel="Donut"
        />
        <Sparkline data={[4, 8, 6, 12]} ariaLabel="Spark" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders an accessible data table for the LineChart when requested', () => {
    render(
      <LineChart
        labels={labels}
        series={series}
        ariaLabel="Revenue and costs"
        showDataTable="visible"
        dataTableCaption="Revenue and costs data"
      />
    );

    const table = screen.getByRole('table', { name: 'Revenue and costs data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Revenue', 'Costs']);
    expect(within(table).getByRole('cell', { name: 'Jan' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '19' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(labels.length + 1);
  });

  it('visually hides the BarChart data table when showDataTable is hidden', () => {
    const { container } = render(
      <BarChart
        labels={labels}
        series={series}
        ariaLabel="Revenue bars"
        showDataTable="hidden"
        dataTableCaption="Revenue bars data"
      />
    );

    expect(screen.getByRole('table', { name: 'Revenue bars data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('does not render a data table by default and marks animated charts', () => {
    const { container } = render(
      <LineChart labels={labels} series={series} ariaLabel="Revenue and costs" animated />
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('data-animated', 'true');
  });

  it('disables the chart entry animation when reduced motion is requested', () => {
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

    const { container } = render(
      <BarChart labels={labels} series={series} ariaLabel="Revenue bars" animated />
    );

    expect(container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('has no accessibility violations with data tables', async () => {
    const { container } = render(
      <div>
        <LineChart
          labels={labels}
          series={series}
          ariaLabel="Line with data"
          showDataTable="visible"
          dataTableCaption="Line data"
        />
        <BarChart
          labels={labels}
          series={series}
          ariaLabel="Bar with data"
          showDataTable="hidden"
          dataTableCaption="Bar data"
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('DonutChart data table, export and animation', () => {
    const donutData = [
      { label: 'Direct', value: 60 },
      { label: 'Organic', value: 40 }
    ];

    function reducedMotion(query: string) {
      return {
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      } as unknown as MediaQueryList;
    }

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render an accessible data table when showDataTable is visible', () => {
      render(
        <DonutChart
          data={donutData}
          ariaLabel="Traffic"
          showDataTable="visible"
          dataTableCaption="Traffic data"
        />
      );

      const table = screen.getByRole('table', { name: 'Traffic data' });

      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((header) => header.textContent)
      ).toEqual(['Label', 'Value']);
      expect(within(table).getByRole('cell', { name: 'Direct' })).toBeInTheDocument();
      expect(within(table).getByRole('cell', { name: '60' })).toBeInTheDocument();
      expect(within(table).getAllByRole('row')).toHaveLength(donutData.length + 1);
    });

    it('should visually hide the data table when showDataTable is hidden', () => {
      const { container } = render(
        <DonutChart
          data={donutData}
          ariaLabel="Traffic"
          showDataTable="hidden"
          dataTableCaption="Traffic data"
        />
      );

      expect(screen.getByRole('table', { name: 'Traffic data' })).toBeInTheDocument();
      expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    });

    it('should not render a data table or export controls by default', () => {
      render(<DonutChart data={donutData} ariaLabel="Traffic" />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
    });

    it('should export the chart as svg and png and announce the file names', async () => {
      render(
        <DonutChart data={donutData} ariaLabel="Traffic" exportable exportFileName="traffic" />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'traffic');
      expect(screen.getByRole('status')).toHaveTextContent('Exported traffic.svg');

      fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('Exported traffic.png')
      );
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'traffic');
    });

    it('should mark the chart as animated and honor reduced motion', () => {
      const { container, unmount } = render(
        <DonutChart data={donutData} ariaLabel="Traffic" animated />
      );

      expect(container.firstChild).toHaveAttribute('data-animated', 'true');

      unmount();

      const originalMatchMedia = window.matchMedia;

      window.matchMedia = jest.fn().mockImplementation(reducedMotion);

      const reduced = render(<DonutChart data={donutData} ariaLabel="Traffic" animated />);

      expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

      window.matchMedia = originalMatchMedia;
    });

    it('should have no accessibility violations with data table and export', async () => {
      const { container } = render(
        <DonutChart
          data={donutData}
          ariaLabel="Traffic"
          showDataTable="visible"
          dataTableCaption="Traffic data"
          exportable
          exportFileName="traffic"
          animated
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Sparkline data table, export and animation', () => {
    const sparkData = [4, 8, 6, 12];

    function reducedMotion(query: string) {
      return {
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      } as unknown as MediaQueryList;
    }

    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render an accessible data table when showDataTable is visible', () => {
      render(
        <Sparkline
          data={sparkData}
          ariaLabel="Weekly users"
          showDataTable="visible"
          dataTableCaption="Weekly users data"
        />
      );

      const table = screen.getByRole('table', { name: 'Weekly users data' });

      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((header) => header.textContent)
      ).toEqual(['Index', 'Value']);

      const rows = within(table)
        .getAllByRole('row')
        .slice(1)
        .map((row) =>
          within(row)
            .getAllByRole('cell')
            .map((cell) => cell.textContent)
        );

      expect(rows).toEqual([
        ['1', '4'],
        ['2', '8'],
        ['3', '6'],
        ['4', '12']
      ]);
    });

    it('should visually hide the data table when showDataTable is hidden', () => {
      const { container } = render(
        <Sparkline
          data={sparkData}
          ariaLabel="Weekly users"
          showDataTable="hidden"
          dataTableCaption="Weekly users data"
        />
      );

      expect(screen.getByRole('table', { name: 'Weekly users data' })).toBeInTheDocument();
      expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    });

    it('should not render a data table or export controls by default', () => {
      render(<Sparkline data={sparkData} ariaLabel="Weekly users" />);

      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    });

    it('should export the sparkline as svg and png', async () => {
      render(
        <Sparkline data={sparkData} ariaLabel="Weekly users" exportable exportFileName="weekly" />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

      expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'weekly');
      expect(screen.getByRole('status')).toHaveTextContent('Exported weekly.svg');

      fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

      await waitFor(() =>
        expect(screen.getByRole('status')).toHaveTextContent('Exported weekly.png')
      );
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'weekly');
    });

    it('should mark the sparkline as animated and honor reduced motion', () => {
      const { container, unmount } = render(
        <Sparkline data={sparkData} ariaLabel="Weekly users" animated />
      );

      expect(container.firstChild).toHaveAttribute('data-animated', 'true');

      unmount();

      const originalMatchMedia = window.matchMedia;

      window.matchMedia = jest.fn().mockImplementation(reducedMotion);

      const reduced = render(<Sparkline data={sparkData} ariaLabel="Weekly users" animated />);

      expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

      window.matchMedia = originalMatchMedia;
    });

    it('should have no accessibility violations with data table and export', async () => {
      const { container } = render(
        <Sparkline
          data={sparkData}
          ariaLabel="Weekly users"
          showDataTable="visible"
          dataTableCaption="Weekly users data"
          exportable
          exportFileName="weekly"
          animated
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
