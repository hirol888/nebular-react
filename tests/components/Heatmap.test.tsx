import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Heatmap, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { x: 'Mon', y: 'Morning', value: 1 },
  { x: 'Tue', y: 'Morning', value: 5 },
  { x: 'Mon', y: 'Evening', value: 3 },
  { x: 'Tue', y: 'Evening', value: 9 }
];

describe('Heatmap', () => {
  it('should render one focusable cell per data entry', () => {
    render(<Heatmap data={data} ariaLabel="Activity" />);

    expect(screen.getByRole('group', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('img', { name: 'Mon, Morning: 1' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Tue, Evening: 9' })).toBeInTheDocument();
  });

  it('should derive the axis labels from the data', () => {
    render(<Heatmap data={data} ariaLabel="Activity" />);

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Evening')).toBeInTheDocument();
  });

  it('should use explicit xLabels and yLabels when provided', () => {
    const { rerender } = render(
      <Heatmap
        data={data}
        xLabels={['Mon', 'Tue', 'Wed']}
        yLabels={['Evening', 'Morning', 'Night']}
        ariaLabel="Activity"
      />
    );

    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Night')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(4);

    rerender(<Heatmap data={data} showLegend={false} ariaLabel="Activity" />);

    expect(screen.queryByText('Wed')).not.toBeInTheDocument();
    expect(screen.queryByText('Night')).not.toBeInTheDocument();
  });

  it('should interpolate the cell color between the lowest and highest values', () => {
    render(
      <Heatmap data={data} colors={['#000000', '#ffffff']} ariaLabel="Scale" showLegend={false} />
    );

    expect(screen.getByRole('img', { name: 'Mon, Morning: 1' })).toHaveAttribute(
      'fill',
      'rgb(0, 0, 0)'
    );
    expect(screen.getByRole('img', { name: 'Tue, Evening: 9' })).toHaveAttribute(
      'fill',
      'rgb(255, 255, 255)'
    );
    expect(screen.getByRole('img', { name: 'Mon, Evening: 3' }).getAttribute('fill')).toBe(
      'rgb(64, 64, 64)'
    );
  });

  it('should respect the min and max bounds for the color scale', () => {
    render(
      <Heatmap
        data={data}
        colors={['#000000', '#ffffff']}
        min={5}
        max={9}
        ariaLabel="Bounds"
        showLegend={false}
      />
    );

    expect(screen.getByRole('img', { name: 'Mon, Morning: 1' })).toHaveAttribute(
      'fill',
      'rgb(0, 0, 0)'
    );
    expect(screen.getByRole('img', { name: 'Tue, Morning: 5' })).toHaveAttribute(
      'fill',
      'rgb(0, 0, 0)'
    );
    expect(screen.getByRole('img', { name: 'Tue, Evening: 9' })).toHaveAttribute(
      'fill',
      'rgb(255, 255, 255)'
    );
  });

  it('should render the values inside the cells only when showValues is set', () => {
    const { rerender } = render(
      <Heatmap
        data={data}
        ariaLabel="Values"
        valueFormatter={(value: number) => `${value} units`}
      />
    );

    expect(screen.queryByText('5 units')).not.toBeInTheDocument();

    rerender(
      <Heatmap
        data={data}
        ariaLabel="Values"
        showValues
        valueFormatter={(value: number) => `${value} units`}
      />
    );

    expect(screen.getByText('5 units')).toBeInTheDocument();
    // Rendered once inside the cell and once as the top of the color scale legend.
    expect(screen.getAllByText('9 units')).toHaveLength(2);
  });

  it('should show a tooltip when a cell is hovered or focused', () => {
    render(<Heatmap data={data} ariaLabel="Activity" showLegend={false} />);

    const cell = screen.getByRole('img', { name: 'Tue, Evening: 9' });

    expect(screen.queryByText('Tue · Evening: 9')).not.toBeInTheDocument();

    fireEvent.mouseEnter(cell);
    expect(screen.getByText('Tue · Evening: 9')).toBeInTheDocument();

    fireEvent.blur(cell);
    expect(screen.queryByText('Tue · Evening: 9')).not.toBeInTheDocument();

    fireEvent.focus(cell);
    expect(screen.getByText('Tue · Evening: 9')).toBeInTheDocument();
  });

  it('should call onCellClick with the clicked cell', () => {
    const onCellClick = jest.fn();

    render(<Heatmap data={data} ariaLabel="Activity" onCellClick={onCellClick} />);

    const cell = screen.getByRole('button', { name: 'Mon, Evening: 3' });

    fireEvent.click(cell);
    expect(onCellClick).toHaveBeenCalledWith({ x: 'Mon', y: 'Evening', value: 3 });

    onCellClick.mockClear();
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onCellClick).toHaveBeenCalledWith({ x: 'Mon', y: 'Evening', value: 3 });
  });

  it('should render the color scale legend and hide it when showLegend is false', () => {
    const { rerender } = render(<Heatmap data={data} ariaLabel="Activity" />);

    expect(screen.getByRole('group', { name: 'Color scale' })).toBeInTheDocument();

    rerender(<Heatmap data={data} ariaLabel="Activity" showLegend={false} />);

    expect(screen.queryByRole('group', { name: 'Color scale' })).not.toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<Heatmap data={[]} ariaLabel="Empty heatmap" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Heatmap data={data} ariaLabel="Heatmap" />
        <Heatmap
          data={data}
          ariaLabel="Heatmap with values"
          showValues
          onCellClick={() => undefined}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Heatmap data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <Heatmap
        data={data}
        ariaLabel="Activity"
        showDataTable="visible"
        dataTableCaption="Activity data"
      />
    );

    const table = screen.getByRole('table', { name: 'Activity data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Row', 'Column', 'Value']);
    expect(within(table).getAllByRole('cell', { name: 'Morning' })).toHaveLength(2);
    expect(within(table).getAllByRole('cell', { name: 'Mon' })).toHaveLength(2);
    expect(within(table).getByRole('cell', { name: '9' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <Heatmap data={data} ariaLabel="Activity" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<Heatmap data={data} ariaLabel="Activity" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(<Heatmap data={data} ariaLabel="Activity" exportable exportFileName="activity" />);

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'activity');
    expect(screen.getByRole('status')).toHaveTextContent('Exported activity.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported activity.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'activity',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(<Heatmap data={data} ariaLabel="Activity" animated />);

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

    const reduced = render(<Heatmap data={data} ariaLabel="Activity" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <Heatmap
        data={data}
        ariaLabel="Activity"
        showDataTable="visible"
        dataTableCaption="Activity data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
