import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { WaffleChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'Direct', value: 50, color: '#3366ff' },
  { label: 'Organic', value: 30, color: '#00d68f' },
  { label: 'Referral', value: 20, color: '#ffaa00' }
];

function cellsFor(container: HTMLElement, datumIndex: number) {
  return Array.from(container.querySelectorAll(`[data-waffle-cell="${datumIndex}"]`));
}

function signature(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-waffle-cell]'))
    .map((cell) => `${cell.getAttribute('data-waffle-cell')}:${cell.getAttribute('fill')}`)
    .join('|');
}

describe('WaffleChart', () => {
  it('should render one focusable cell per grid slot proportionally to the values', () => {
    const { container } = render(<WaffleChart data={data} ariaLabel="Traffic sources" />);

    expect(screen.getByRole('group', { name: 'Traffic sources' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(100);
    expect(cellsFor(container, 0)).toHaveLength(50);
    expect(cellsFor(container, 1)).toHaveLength(30);
    expect(cellsFor(container, 2)).toHaveLength(20);
    expect(cellsFor(container, 0)[0]).toHaveAttribute('fill', '#3366ff');
    expect(cellsFor(container, 1)[0]).toHaveAttribute('fill', '#00d68f');
    expect(cellsFor(container, 2)[0]).toHaveAttribute('fill', '#ffaa00');
    expect(cellsFor(container, 0)[0]).toHaveAttribute('tabindex', '0');
  });

  it('should respect the rows and columns grid size', () => {
    const { container } = render(
      <WaffleChart data={data} rows={4} columns={5} ariaLabel="Small grid" />
    );

    expect(container.querySelectorAll('rect')).toHaveLength(20);
    expect(cellsFor(container, 0)).toHaveLength(10);
    expect(cellsFor(container, 1)).toHaveLength(6);
    expect(cellsFor(container, 2)).toHaveLength(4);
  });

  it('should distribute the remaining cells deterministically with largest remainders', () => {
    const third = [
      { label: 'A', value: 1 },
      { label: 'B', value: 1 },
      { label: 'C', value: 1 }
    ];
    const { container, rerender } = render(
      <WaffleChart data={third} rows={1} columns={10} ariaLabel="Thirds" />
    );

    expect(cellsFor(container, 0)).toHaveLength(4);
    expect(cellsFor(container, 1)).toHaveLength(3);
    expect(cellsFor(container, 2)).toHaveLength(3);

    const before = signature(container);

    rerender(<WaffleChart data={third} rows={1} columns={10} ariaLabel="Thirds" />);

    expect(signature(container)).toBe(before);
  });

  it('should render the legend for every data item and hide it when showLegend is false', () => {
    const { rerender } = render(<WaffleChart data={data} ariaLabel="Traffic sources" />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Direct')).toBeInTheDocument();
    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Referral')).toBeInTheDocument();

    rerender(<WaffleChart data={data} ariaLabel="Traffic sources" showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
    expect(screen.queryByText('Direct')).not.toBeInTheDocument();
  });

  it('should apply valueFormatter to the cell labels and tooltips', () => {
    render(
      <WaffleChart
        data={[{ label: 'Used', value: 75 }]}
        rows={2}
        columns={2}
        ariaLabel="Disk usage"
        valueFormatter={(value: number) => `${value}%`}
      />
    );

    expect(screen.getAllByRole('img', { name: 'Used: 75%' })).toHaveLength(4);

    fireEvent.mouseEnter(screen.getAllByRole('img', { name: 'Used: 75%' })[0]);

    expect(screen.getByText('Used: 75%')).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a cell', () => {
    render(<WaffleChart data={data} ariaLabel="Traffic sources" />);

    const cell = screen.getAllByRole('img', { name: 'Organic: 30' })[0];

    expect(screen.queryByText('Organic: 30')).not.toBeInTheDocument();

    fireEvent.mouseEnter(cell);
    expect(screen.getByText('Organic: 30')).toBeInTheDocument();

    fireEvent.blur(cell);
    expect(screen.queryByText('Organic: 30')).not.toBeInTheDocument();

    fireEvent.focus(cell);
    expect(screen.getByText('Organic: 30')).toBeInTheDocument();
  });

  it('should call onCellClick with the datum and index on click and keyboard activation', () => {
    const onCellClick = jest.fn();

    render(<WaffleChart data={data} ariaLabel="Traffic sources" onCellClick={onCellClick} />);

    const cell = screen.getAllByRole('button', { name: 'Referral: 20' })[0];

    fireEvent.click(cell);
    expect(onCellClick).toHaveBeenCalledWith(data[2], 2);

    onCellClick.mockClear();
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onCellClick).toHaveBeenCalledWith(data[2], 2);

    onCellClick.mockClear();
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onCellClick).toHaveBeenCalledWith(data[2], 2);
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<WaffleChart data={[]} ariaLabel="Empty waffle" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every value is zero', () => {
    render(
      <WaffleChart
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 }
        ]}
        ariaLabel="Zero waffle"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <WaffleChart data={data} ariaLabel="Waffle" />
        <WaffleChart data={data} ariaLabel="Interactive waffle" onCellClick={() => undefined} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('WaffleChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <WaffleChart
        data={data}
        ariaLabel="Traffic sources"
        showDataTable="visible"
        dataTableCaption="Traffic sources data"
      />
    );

    const table = screen.getByRole('table', { name: 'Traffic sources data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Value']);
    expect(within(table).getByRole('cell', { name: 'Direct' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '50' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <WaffleChart data={data} ariaLabel="Traffic sources" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<WaffleChart data={data} ariaLabel="Traffic sources" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <WaffleChart data={data} ariaLabel="Traffic sources" exportable exportFileName="traffic" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'traffic');
    expect(screen.getByRole('status')).toHaveTextContent('Exported traffic.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported traffic.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'traffic',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <WaffleChart data={data} ariaLabel="Traffic sources" animated />
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

    const reduced = render(<WaffleChart data={data} ariaLabel="Traffic sources" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <WaffleChart
        data={data}
        ariaLabel="Traffic sources"
        showDataTable="visible"
        dataTableCaption="Traffic sources data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
