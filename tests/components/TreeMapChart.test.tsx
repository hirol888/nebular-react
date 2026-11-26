import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TreeMapChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'Electronics', value: 40 },
  {
    label: 'Fashion',
    value: 30,
    children: [
      { label: 'Shoes', value: 10 },
      { label: 'Bags', value: 20 }
    ]
  },
  { label: 'Home', value: 30 }
];

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function readBox(element: Element): Box {
  return {
    x: Number(element.getAttribute('x')),
    y: Number(element.getAttribute('y')),
    width: Number(element.getAttribute('width')),
    height: Number(element.getAttribute('height'))
  };
}

function topLevelBoxes(container: HTMLElement) {
  return Array.from(container.querySelectorAll('rect[data-treemap-depth="0"]')).map(readBox);
}

function overlaps(first: Box, second: Box, tolerance = 1e-6) {
  const horizontal =
    Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x);
  const vertical =
    Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y);

  return horizontal > tolerance && vertical > tolerance;
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('rect')).map((rect) =>
    [
      rect.getAttribute('data-treemap-depth'),
      rect.getAttribute('data-treemap-label'),
      rect.getAttribute('x'),
      rect.getAttribute('y'),
      rect.getAttribute('width'),
      rect.getAttribute('height')
    ].join('|')
  );
}

describe('TreeMapChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render one focusable item per top level entry and per child', () => {
    render(<TreeMapChart data={data} ariaLabel="Sales by category" />);

    expect(screen.getByRole('group', { name: 'Sales by category' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.getByRole('img', { name: 'Electronics: 40' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Fashion: 30' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Home: 30' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Fashion · Shoes: 10' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Fashion · Bags: 20' })).toBeInTheDocument();
  });

  it('should place every child inside its parent item', () => {
    render(<TreeMapChart data={data} ariaLabel="Sales by category" />);

    const parent = readBox(screen.getByRole('img', { name: 'Fashion: 30' }));

    ['Fashion · Shoes: 10', 'Fashion · Bags: 20'].forEach((name) => {
      const child = readBox(screen.getByRole('img', { name }));

      expect(child.x).toBeGreaterThanOrEqual(parent.x);
      expect(child.y).toBeGreaterThanOrEqual(parent.y);
      expect(child.x + child.width).toBeLessThanOrEqual(parent.x + parent.width + 1e-6);
      expect(child.y + child.height).toBeLessThanOrEqual(parent.y + parent.height + 1e-6);
    });
  });

  it('should lay out the top level rectangles without overlapping', () => {
    const { container } = render(<TreeMapChart data={data} ariaLabel="Sales by category" />);

    const boxes = topLevelBoxes(container);

    expect(boxes).toHaveLength(3);

    for (let first = 0; first < boxes.length; first += 1) {
      for (let second = first + 1; second < boxes.length; second += 1) {
        expect(overlaps(boxes[first], boxes[second])).toBe(false);
      }
    }

    const area = boxes.reduce((total, box) => total + box.width * box.height, 0);

    expect(area).toBeCloseTo(472 * 272, 3);
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(
      <TreeMapChart data={data} ariaLabel="Sales by category" />
    );
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <TreeMapChart data={data} ariaLabel="Sales by category" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should render the item labels and values and hide the values when showValues is false', () => {
    const { rerender } = render(<TreeMapChart data={data} ariaLabel="Sales by category" />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Fashion')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('Bags')).toBeInTheDocument();

    rerender(<TreeMapChart data={data} ariaLabel="Sales by category" showValues={false} />);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.queryByText('40')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Electronics: 40' })).toBeInTheDocument();
  });

  it('should truncate labels that do not fit inside their rectangle', () => {
    const longLabel =
      'A very long category name that cannot possibly fit inside this rectangle at all, no matter how wide it is';

    render(
      <TreeMapChart
        data={[
          { label: longLabel, value: 25 },
          { label: 'Short', value: 25 },
          { label: 'Another', value: 25 },
          { label: 'Last', value: 25 }
        ]}
        ariaLabel="Long labels"
        showValues={false}
      />
    );

    expect(screen.getByText(/A very long category name/)).toBeInTheDocument();
    expect(screen.queryByText(longLabel)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: `${longLabel}: 25` })).toBeInTheDocument();
  });

  it('should apply the value formatter to the accessible names and tooltips', async () => {
    const user = userEvent.setup();

    render(
      <TreeMapChart
        data={data}
        ariaLabel="Sales by category"
        valueFormatter={(value: number) => `${value}k`}
      />
    );

    const home = screen.getByRole('img', { name: 'Home: 30k' });

    expect(home).toBeInTheDocument();

    await user.hover(home);
    expect(screen.getByText('Home: 30k')).toBeInTheDocument();

    await user.unhover(home);
    expect(screen.queryByText('Home: 30k')).not.toBeInTheDocument();
  });

  it('should show a tooltip when an item receives focus', async () => {
    const user = userEvent.setup();

    render(<TreeMapChart data={data} ariaLabel="Sales by category" />);

    await user.tab();

    expect(screen.getByRole('img', { name: 'Electronics: 40' })).toHaveFocus();
    expect(screen.getByText('Electronics: 40')).toBeInTheDocument();
  });

  it('should call onItemClick with the top level item for parents and children', async () => {
    const user = userEvent.setup();
    const onItemClick = jest.fn();

    render(<TreeMapChart data={data} ariaLabel="Sales by category" onItemClick={onItemClick} />);

    await user.click(screen.getByRole('button', { name: 'Home: 30' }));
    expect(onItemClick).toHaveBeenCalledWith(data[2]);

    onItemClick.mockClear();

    await user.click(screen.getByRole('button', { name: 'Fashion · Bags: 20' }));
    expect(onItemClick).toHaveBeenCalledWith(data[1]);

    onItemClick.mockClear();

    screen.getByRole('button', { name: 'Electronics: 40' }).focus();
    await user.keyboard('{Enter}');
    expect(onItemClick).toHaveBeenCalledWith(data[0]);
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<TreeMapChart data={[]} ariaLabel="Empty treemap" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every value is zero', () => {
    render(
      <TreeMapChart
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 }
        ]}
        ariaLabel="Zero treemap"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should accept a custom height', () => {
    const { container } = render(
      <TreeMapChart data={data} height={360} ariaLabel="Tall treemap" />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 360');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <TreeMapChart data={data} ariaLabel="Treemap" />
        <TreeMapChart
          data={data}
          ariaLabel="Interactive treemap"
          onItemClick={() => undefined}
          valueFormatter={(value: number) => `${value}k`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table with parent references when showDataTable is visible', () => {
    render(
      <TreeMapChart
        data={data}
        ariaLabel="Sales by category"
        showDataTable="visible"
        dataTableCaption="Sales by category data"
      />
    );

    const table = screen.getByRole('table', { name: 'Sales by category data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Value', 'Parent']);

    const rows = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      );

    expect(rows).toEqual([
      ['Electronics', '40', ''],
      ['Fashion', '30', ''],
      ['Shoes', '10', 'Fashion'],
      ['Bags', '20', 'Fashion'],
      ['Home', '30', '']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <TreeMapChart
        data={data}
        ariaLabel="Sales by category"
        showDataTable="hidden"
        dataTableCaption="Sales by category data"
      />
    );

    expect(screen.getByRole('table', { name: 'Sales by category data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<TreeMapChart data={data} ariaLabel="Sales by category" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <TreeMapChart data={data} ariaLabel="Sales by category" exportable exportFileName="sales" />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'sales');
    expect(screen.getByRole('status')).toHaveTextContent('Exported sales.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <TreeMapChart data={data} ariaLabel="Sales by category" exportable exportFileName="sales" />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'sales')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported sales.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <TreeMapChart data={data} ariaLabel="Sales by category" animated />
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

    const reduced = render(<TreeMapChart data={data} ariaLabel="Sales by category" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <TreeMapChart
        data={data}
        ariaLabel="Accessible treemap"
        exportable
        exportFileName="treemap"
        showDataTable="visible"
        dataTableCaption="Treemap data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
