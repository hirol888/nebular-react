import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { PivotTable, buildPivotTable, normalizePivotMeasures } from '@nebular-react/core';
import type { PivotMeasure } from '@nebular-react/core';

type Sale = {
  region: string;
  country: string;
  product: string;
  amount: number;
  quantity: number;
};

const sales: Sale[] = [
  { region: 'North', country: 'Germany', product: 'Phone', amount: 100, quantity: 2 },
  { region: 'North', country: 'Germany', product: 'Laptop', amount: 300, quantity: 1 },
  { region: 'North', country: 'France', product: 'Phone', amount: 50, quantity: 1 },
  { region: 'South', country: 'Italy', product: 'Tablet', amount: 200, quantity: 4 },
  { region: 'South', country: 'Italy', product: 'Phone', amount: 75, quantity: 3 }
];

const revenue: PivotMeasure<Sale> = {
  key: 'amount',
  label: 'Revenue',
  aggregate: 'sum'
};

const money: PivotMeasure<Sale> = {
  ...revenue,
  formatter: (value) => `$${value}`
};

const orders: PivotMeasure<Sale> = {
  key: 'orders',
  label: 'Orders',
  aggregate: 'count'
};

const averageTicket: PivotMeasure<Sale> = {
  key: 'average',
  label: 'Average ticket',
  aggregate: 'avg',
  value: (row) => row.amount
};

const getFooterRow = (): HTMLElement => {
  const footerHeader = screen.getByRole('rowheader', { name: 'Total' });

  return footerHeader.closest('tr') as HTMLElement;
};

describe('buildPivotTable', () => {
  it('groups rows and aggregates column values with sum', () => {
    const model = buildPivotTable(sales, {
      rows: ['region'],
      column: 'product',
      measure: revenue
    });

    expect(model.columns.map((column) => column.key)).toEqual(['Laptop', 'Phone', 'Tablet']);
    expect(model.columns.map((column) => column.label)).toEqual(['Laptop', 'Phone', 'Tablet']);
    expect(model.columns[0].values).toEqual(['Laptop']);

    expect(model.rows.map((row) => row.key)).toEqual(['North', 'South']);
    expect(model.rows[0]).toMatchObject({
      depth: 0,
      isLeaf: true,
      total: 450,
      cells: { Laptop: 300, Phone: 150 }
    });
    expect(model.rows[1].cells).toEqual({ Phone: 75, Tablet: 200 });
    expect(model.rows[0].children).toEqual([]);

    expect(model.columnTotals).toEqual({ Laptop: 300, Phone: 225, Tablet: 200 });
    expect(model.grandTotal).toBe(725);
  });

  it('sorts column values with numeric awareness', () => {
    type Monthly = { group: string; month: string; amount: number };
    const monthly: Monthly[] = [
      { group: 'A', month: '2', amount: 20 },
      { group: 'A', month: '10', amount: 100 },
      { group: 'A', month: '1', amount: 10 }
    ];

    const model = buildPivotTable(monthly, {
      rows: ['group'],
      column: 'month',
      measure: { key: 'amount', label: 'Amount', aggregate: 'sum' }
    });

    expect(model.columns.map((column) => column.key)).toEqual(['1', '2', '10']);
  });

  it('supports avg, min, max and count aggregations', () => {
    const aggregateTotal = (aggregate: PivotMeasure<Sale>['aggregate']) =>
      buildPivotTable(sales, {
        rows: ['region'],
        column: 'product',
        measure: { key: 'amount', label: 'Amount', aggregate }
      });

    const average = aggregateTotal('avg');
    expect(average.rows[0].total).toBe(150);
    expect(average.rows[0].cells.Phone).toBe(75);
    expect(average.grandTotal).toBe(145);

    const minimum = aggregateTotal('min');
    expect(minimum.rows[0].total).toBe(50);
    expect(minimum.columnTotals.Phone).toBe(50);
    expect(minimum.grandTotal).toBe(50);

    const maximum = aggregateTotal('max');
    expect(maximum.rows[0].total).toBe(300);
    expect(maximum.columnTotals.Tablet).toBe(200);
    expect(maximum.grandTotal).toBe(300);

    const count = aggregateTotal('count');
    expect(count.rows[0].total).toBe(3);
    expect(count.rows[0].cells.Phone).toBe(2);
    expect(count.rows[1].cells.Tablet).toBe(1);
    expect(count.columnTotals.Laptop).toBe(1);
    expect(count.grandTotal).toBe(5);
  });

  it('uses the value accessor and ignores non numeric values', () => {
    const model = buildPivotTable(sales, {
      rows: ['region'],
      column: 'product',
      measure: {
        key: 'amount',
        label: 'Phone revenue',
        aggregate: 'sum',
        value: (row) => (row.product === 'Phone' ? row.amount : null)
      }
    });

    expect(model.rows[0].cells.Phone).toBe(150);
    expect(model.rows[0].cells.Laptop).toBeUndefined();
    expect(model.grandTotal).toBe(225);
  });

  it('builds nested row levels with totals', () => {
    const model = buildPivotTable(sales, {
      rows: ['region', 'country'],
      column: 'product',
      measure: revenue
    });

    expect(model.rows.map((row) => row.key)).toEqual(['North', 'South']);
    expect(model.rows[0].isLeaf).toBe(false);
    expect(model.rows[0].depth).toBe(0);
    expect(model.rows[0].values).toEqual(['North']);
    expect(model.rows[0].total).toBe(450);
    expect(model.rows[0].children.map((row) => row.key)).toEqual([
      'North / France',
      'North / Germany'
    ]);
    expect(model.rows[0].children.map((row) => row.depth)).toEqual([1, 1]);
    expect(model.rows[0].children.every((row) => row.isLeaf)).toBe(true);

    const france = model.rows[0].children[0];
    const germany = model.rows[0].children[1];

    expect(france.values).toEqual(['North', 'France']);
    expect(france.total).toBe(50);
    expect(france.cells).toEqual({ Phone: 50 });
    expect(france.row).toBe(sales[2]);

    expect(germany.cells).toEqual({ Laptop: 300, Phone: 100 });
    expect(germany.total).toBe(400);
  });

  it('aggregates without a column dimension', () => {
    const model = buildPivotTable(sales, { rows: ['region'], measure: revenue });

    expect(model.columns).toEqual([]);
    expect(model.columnTotals).toEqual({});
    expect(model.rows[0].cells).toEqual({});
    expect(model.rows[0].total).toBe(450);
    expect(model.grandTotal).toBe(725);
  });

  it('returns an empty model for empty data', () => {
    const model = buildPivotTable([] as Sale[], {
      rows: ['region'],
      column: 'product',
      measure: revenue
    });

    expect(model).toEqual({
      columns: [],
      rows: [],
      columnTotals: {},
      grandTotal: 0,
      measures: [revenue],
      measureCells: { amount: {} },
      measureColumnTotals: { amount: {} },
      measureGrandTotals: { amount: 0 }
    });
  });
});

describe('buildPivotTable with multiple measures', () => {
  const buildModel = () =>
    buildPivotTable(sales, {
      rows: ['region'],
      column: 'product',
      measures: [revenue, orders, averageTicket]
    });

  it('returns every measure with its own cells, column totals and grand totals', () => {
    const model = buildModel();

    expect(model.measures).toEqual([revenue, orders, averageTicket]);
    expect(model.measureCells).toEqual({
      amount: { Laptop: 300, Phone: 225, Tablet: 200 },
      orders: { Laptop: 1, Phone: 3, Tablet: 1 },
      average: { Laptop: 300, Phone: 75, Tablet: 200 }
    });
    expect(model.measureColumnTotals).toEqual({
      amount: { Laptop: 300, Phone: 225, Tablet: 200 },
      orders: { Laptop: 1, Phone: 3, Tablet: 1 },
      average: { Laptop: 300, Phone: 75, Tablet: 200 }
    });
    expect(model.measureGrandTotals).toEqual({ amount: 725, orders: 5, average: 145 });
  });

  it('keeps the legacy fields as the first measure', () => {
    const model = buildModel();

    expect(model.columns.map((column) => column.key)).toEqual(['Laptop', 'Phone', 'Tablet']);
    expect(model.columnTotals).toEqual({ Laptop: 300, Phone: 225, Tablet: 200 });
    expect(model.grandTotal).toBe(725);

    expect(model.rows[0].cells).toEqual({ Laptop: 300, Phone: 150 });
    expect(model.rows[0].total).toBe(450);
    expect(model.rows[1].cells).toEqual({ Phone: 75, Tablet: 200 });
    expect(model.rows[1].total).toBe(275);
  });

  it('exposes per measure values on every row', () => {
    const model = buildModel();

    expect(model.rows[0].measureCells).toEqual({
      amount: { Laptop: 300, Phone: 150 },
      orders: { Laptop: 1, Phone: 2 },
      average: { Laptop: 300, Phone: 75 }
    });
    expect(model.rows[0].measureTotals).toEqual({ amount: 450, orders: 3, average: 150 });
    expect(model.rows[1].measureCells).toEqual({
      amount: { Phone: 75, Tablet: 200 },
      orders: { Phone: 1, Tablet: 1 },
      average: { Phone: 75, Tablet: 200 }
    });
    expect(model.rows[1].measureTotals).toEqual({ amount: 275, orders: 2, average: 137.5 });
  });

  it('aggregates every measure without a column dimension', () => {
    const model = buildPivotTable(sales, { rows: ['region'], measures: [revenue, orders] });

    expect(model.columns).toEqual([]);
    expect(model.measureCells).toEqual({ amount: {}, orders: {} });
    expect(model.measureColumnTotals).toEqual({ amount: {}, orders: {} });
    expect(model.measureGrandTotals).toEqual({ amount: 725, orders: 5 });
    expect(model.rows[0].measureTotals).toEqual({ amount: 450, orders: 3 });
    expect(model.rows[1].measureTotals).toEqual({ amount: 275, orders: 2 });
  });

  it('prefers measures over a single measure', () => {
    const model = buildPivotTable(sales, {
      rows: ['region'],
      column: 'product',
      measure: { key: 'amount', label: 'Max revenue', aggregate: 'max' },
      measures: [revenue, orders]
    });

    expect(model.measures.map((item) => item.key)).toEqual(['amount', 'orders']);
    expect(model.grandTotal).toBe(725);
    expect(model.measureGrandTotals).toEqual({ amount: 725, orders: 5 });
  });

  it('throws when no measure is provided', () => {
    expect(() => buildPivotTable(sales, { rows: ['region'] })).toThrow(/at least one measure/i);
    expect(() => buildPivotTable(sales, { rows: ['region'], measures: [] })).toThrow(
      /at least one measure/i
    );
  });
});

describe('normalizePivotMeasures', () => {
  it('prefers the measures list', () => {
    expect(normalizePivotMeasures(revenue, [orders, averageTicket])).toEqual([
      orders,
      averageTicket
    ]);
  });

  it('falls back to a single measure', () => {
    expect(normalizePivotMeasures(revenue, undefined)).toEqual([revenue]);
    expect(normalizePivotMeasures(revenue, [])).toEqual([revenue]);
  });

  it('returns an empty list when nothing is provided', () => {
    expect(normalizePivotMeasures(undefined, undefined)).toEqual([]);
    expect(normalizePivotMeasures(undefined, [])).toEqual([]);
  });
});

describe('PivotTable', () => {
  it('renders headers, row groups and aggregated cells', () => {
    render(<PivotTable data={sales} rows={['region']} column="product" measure={revenue} />);

    expect(screen.getByRole('table', { name: 'Pivot table' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'region' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Revenue' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Laptop' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Phone' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Tablet' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Total' })).toBeInTheDocument();

    const northRow = screen.getByRole('row', { name: /North/ });

    expect(within(northRow).getByText('300')).toBeInTheDocument();
    expect(within(northRow).getByText('150')).toBeInTheDocument();
    expect(within(northRow).getByText('450')).toBeInTheDocument();

    const footerRow = getFooterRow();

    expect(within(footerRow).getByText('300')).toBeInTheDocument();
    expect(within(footerRow).getByText('225')).toBeInTheDocument();
    expect(within(footerRow).getByText('200')).toBeInTheDocument();
    expect(within(footerRow).getByText('725')).toBeInTheDocument();
  });

  it('uses a custom aria label', () => {
    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        ariaLabel="Sales pivot"
      />
    );

    expect(screen.getByRole('table', { name: 'Sales pivot' })).toBeInTheDocument();
  });

  it('applies the measure formatter to cells and totals', () => {
    render(<PivotTable data={sales} rows={['region']} column="product" measure={money} />);

    const northRow = screen.getByRole('row', { name: /North/ });

    expect(within(northRow).getByText('$300')).toBeInTheDocument();
    expect(within(northRow).getByText('$450')).toBeInTheDocument();
    expect(within(getFooterRow()).getByText('$725')).toBeInTheDocument();
  });

  it('expands and collapses groups', async () => {
    const user = userEvent.setup();

    render(
      <PivotTable data={sales} rows={['region', 'country']} column="product" measure={revenue} />
    );

    expect(screen.queryByRole('rowheader', { name: 'Germany' })).not.toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: 'Expand group North' });

    expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(expandButton);

    expect(screen.getByRole('rowheader', { name: 'France' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Germany' })).toBeInTheDocument();

    const collapseButton = screen.getByRole('button', { name: 'Collapse group North' });

    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(collapseButton);

    expect(screen.queryByRole('rowheader', { name: 'Germany' })).not.toBeInTheDocument();
  });

  it('honours default expanded keys and notifies changes', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={revenue}
        defaultExpandedKeys={['North']}
        onExpandedChange={onExpandedChange}
      />
    );

    expect(screen.getByRole('rowheader', { name: 'Germany' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse group North' }));
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);

    await user.click(screen.getByRole('button', { name: 'Expand group South' }));
    expect(onExpandedChange).toHaveBeenLastCalledWith(['South']);
  });

  it('keeps expanded keys controlled', async () => {
    const user = userEvent.setup();
    const onExpandedChange = jest.fn();
    const props = {
      data: sales,
      rows: ['region', 'country'],
      column: 'product',
      measure: revenue,
      onExpandedChange
    };

    const { rerender } = render(<PivotTable {...props} expandedKeys={[]} />);

    await user.click(screen.getByRole('button', { name: 'Expand group North' }));

    expect(onExpandedChange).toHaveBeenLastCalledWith(['North']);
    expect(screen.queryByRole('rowheader', { name: 'Germany' })).not.toBeInTheDocument();

    rerender(<PivotTable {...props} expandedKeys={['North']} />);

    expect(screen.getByRole('rowheader', { name: 'Germany' })).toBeInTheDocument();
  });

  it('expands and collapses with arrow keys', async () => {
    const user = userEvent.setup();

    render(
      <PivotTable data={sales} rows={['region', 'country']} column="product" measure={revenue} />
    );

    screen.getByRole('button', { name: 'Expand group North' }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('rowheader', { name: 'Germany' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse group North' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');

    expect(screen.queryByRole('rowheader', { name: 'Germany' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand group North' })).toHaveFocus();
  });

  it('exports the pivot model as CSV', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        exportable
        exportFileName="sales.csv"
        onExport={onExport}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(onExport).toHaveBeenCalledTimes(1);

    const [csv, fileName] = onExport.mock.calls[0] as [string, string];

    expect(fileName).toBe('sales.csv');
    expect(csv).toBe(
      ['region,Laptop,Phone,Tablet,Total', 'North,300,150,,450', 'South,,75,200,275'].join('\r\n')
    );
  });

  it('uses the default export file name', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        exportable
        onExport={onExport}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(onExport.mock.calls[0][1]).toBe('pivot.csv');
  });

  it('hides the export action by default', () => {
    render(<PivotTable data={sales} rows={['region']} column="product" measure={revenue} />);

    expect(screen.queryByRole('button', { name: 'Export CSV' })).not.toBeInTheDocument();
  });

  it('hides totals when disabled', () => {
    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        showRowTotals={false}
        showColumnTotals={false}
        showGrandTotal={false}
      />
    );

    expect(screen.queryByRole('columnheader', { name: 'Total' })).not.toBeInTheDocument();
    expect(screen.queryByRole('rowheader', { name: 'Total' })).not.toBeInTheDocument();
    expect(screen.queryByText('725')).not.toBeInTheDocument();
  });

  it('shows a grand total row when column totals are hidden', () => {
    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        showColumnTotals={false}
      />
    );

    expect(screen.getByRole('rowheader', { name: 'Grand total' })).toBeInTheDocument();
    expect(screen.getByText('725')).toBeInTheDocument();
  });

  it('renders an empty state', () => {
    render(
      <PivotTable
        data={[] as Sale[]}
        rows={['region']}
        column="product"
        measure={revenue}
        emptyState="No sales"
      />
    );

    expect(screen.getByText('No sales')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders a custom empty state node', () => {
    render(
      <PivotTable
        data={[] as Sale[]}
        rows={['region']}
        measure={revenue}
        emptyState={<span>Nothing to pivot</span>}
      />
    );

    expect(screen.getByText('Nothing to pivot')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={money}
        defaultExpandedKeys={['North', 'South']}
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('PivotTable with multiple measures', () => {
  const moneyRevenue: PivotMeasure<Sale> = {
    ...revenue,
    formatter: (value) => `$${value}`
  };

  const orderCount: PivotMeasure<Sale> = {
    ...orders,
    formatter: (value) => `${value} orders`
  };

  it('renders grouped column headers with one measure row', () => {
    render(
      <PivotTable data={sales} rows={['region']} column="product" measures={[revenue, orders]} />
    );

    const laptopGroup = screen.getByRole('columnheader', { name: 'Laptop (Revenue, Orders)' });

    expect(laptopGroup).toHaveAttribute('scope', 'colgroup');
    expect(laptopGroup).toHaveAttribute('colspan', '2');
    expect(laptopGroup).toHaveTextContent('Laptop');
    expect(screen.getByRole('columnheader', { name: 'Phone (Revenue, Orders)' })).toHaveAttribute(
      'colspan',
      '2'
    );
    expect(screen.getByRole('columnheader', { name: 'Tablet (Revenue, Orders)' })).toHaveAttribute(
      'colspan',
      '2'
    );

    const groupRow = laptopGroup.closest('tr') as HTMLElement;
    const measureRow = groupRow.nextElementSibling as HTMLElement;

    expect(within(groupRow).getAllByRole('columnheader')).toHaveLength(5);
    expect(within(measureRow).getAllByRole('columnheader')).toHaveLength(6);
    expect(screen.getAllByRole('columnheader', { name: 'Revenue' })).toHaveLength(3);
    expect(screen.getAllByRole('columnheader', { name: 'Orders' })).toHaveLength(3);
    expect(screen.getByRole('columnheader', { name: 'Total' })).toHaveAttribute('rowspan', '2');
  });

  it('renders one value per measure for each column', () => {
    render(
      <PivotTable data={sales} rows={['region']} column="product" measures={[revenue, orders]} />
    );

    const northRow = screen.getByRole('row', { name: /North/ });

    expect(
      within(northRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['300', '1', '150', '2', '', '', '450', '3']);

    const southRow = screen.getByRole('row', { name: /South/ });

    expect(
      within(southRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['', '', '75', '1', '200', '1', '275', '2']);

    const footerRow = getFooterRow();

    expect(
      within(footerRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['300', '1', '225', '3', '200', '1', '725', '5']);
  });

  it('applies a different formatter per measure', () => {
    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measures={[moneyRevenue, orderCount]}
      />
    );

    const northRow = screen.getByRole('row', { name: /North/ });

    expect(within(northRow).getByText('$300')).toBeInTheDocument();
    expect(within(northRow).getByText('1 orders')).toBeInTheDocument();
    expect(within(northRow).getByText('$450')).toBeInTheDocument();
    expect(within(northRow).getByText('3 orders')).toBeInTheDocument();

    const footerRow = getFooterRow();

    expect(within(footerRow).getByText('$725')).toBeInTheDocument();
    expect(within(footerRow).getByText('5 orders')).toBeInTheDocument();
  });

  it('renders a single measure passed through measures like the legacy layout', () => {
    render(<PivotTable data={sales} rows={['region']} column="product" measures={[revenue]} />);

    const measureHeader = screen.getByRole('columnheader', { name: 'Revenue' });

    expect(measureHeader).toHaveAttribute('scope', 'colgroup');
    expect(measureHeader).toHaveAttribute('colspan', '3');
    expect(screen.getAllByRole('columnheader', { name: 'Revenue' })).toHaveLength(1);
    expect(screen.getByRole('columnheader', { name: 'Laptop' })).toBeInTheDocument();
    expect(within(screen.getByRole('row', { name: /North/ })).getByText('450')).toBeInTheDocument();
  });

  it('prefers measures over measure in the component', () => {
    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={{ key: 'amount', label: 'Max revenue', aggregate: 'max' }}
        measures={[revenue, orders]}
      />
    );

    expect(screen.queryByRole('columnheader', { name: 'Max revenue' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('columnheader', { name: 'Revenue' })).toHaveLength(3);
    expect(within(screen.getByRole('row', { name: /North/ })).getByText('450')).toBeInTheDocument();
  });

  it('renders every measure when there is no column dimension', () => {
    render(<PivotTable data={sales} rows={['region']} measures={[revenue, orders]} />);

    expect(screen.getByRole('columnheader', { name: 'Revenue' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Orders' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('row', { name: /North/ }))
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['450', '3']);
    expect(
      within(getFooterRow())
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['725', '5']);
  });

  it('repeats the grand total per measure when column totals are hidden', () => {
    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measures={[revenue, orders]}
        showColumnTotals={false}
      />
    );

    const grandTotalRow = screen
      .getByRole('rowheader', { name: 'Grand total' })
      .closest('tr') as HTMLElement;

    expect(screen.getByRole('rowheader', { name: 'Grand total' })).toHaveAttribute('colspan', '7');
    expect(
      within(grandTotalRow)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['725', '5']);
  });

  it('exports one CSV column per column value and measure', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measures={[revenue, orders]}
        exportable
        onExport={onExport}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    const [csv] = onExport.mock.calls[0] as [string, string];

    expect(csv).toBe(
      [
        'region,Laptop / Revenue,Laptop / Orders,Phone / Revenue,Phone / Orders,Tablet / Revenue,Tablet / Orders,Total / Revenue,Total / Orders',
        'North,300,1,150,2,,,450,3',
        'South,,,75,1,200,1,275,2'
      ].join('\r\n')
    );
  });

  it('exports every measure without a column dimension', async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region']}
        measures={[revenue, orders]}
        exportable
        onExport={onExport}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(onExport.mock.calls[0][0]).toBe(
      ['region,Revenue,Orders', 'North,450,3', 'South,275,2'].join('\r\n')
    );
  });

  it('falls back to the empty state when no measure is provided', () => {
    render(<PivotTable data={sales} rows={['region']} emptyState="Pick a measure" />);

    expect(screen.getByText('Pick a measure')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('has no accessibility violations with multiple measures', async () => {
    const { container } = render(
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measures={[moneyRevenue, orderCount]}
        defaultExpandedKeys={['North', 'South']}
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('PivotTable drill-down', () => {
  it('PivotTable_DrillDown_ShouldNotifyCellClickWithContext', async () => {
    const user = userEvent.setup();
    const onCellClick = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        onCellClick={onCellClick}
      />
    );

    const cell = screen.getByRole('button', { name: 'North, Phone, Revenue: 150' });

    await user.click(cell);

    expect(onCellClick).toHaveBeenCalledTimes(1);

    const context = onCellClick.mock.calls[0][0];

    expect(context.row.values).toEqual(['North']);
    expect(context.column).toMatchObject({ key: 'Phone', label: 'Phone', values: ['Phone'] });
    expect(context.measure).toBe(revenue);
    expect(context.value).toBe(150);
  });

  it('PivotTable_DrillDown_ShouldNotifyCellClickWithEnterAndSpace', async () => {
    const user = userEvent.setup();
    const onCellClick = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        onCellClick={onCellClick}
      />
    );

    const cell = screen.getByRole('button', { name: 'South, Tablet, Revenue: 200' });

    cell.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onCellClick).toHaveBeenCalledTimes(2);
    expect(onCellClick).toHaveBeenNthCalledWith(1, expect.objectContaining({ value: 200 }));
    expect(onCellClick).toHaveBeenNthCalledWith(2, expect.objectContaining({ value: 200 }));
  });

  it('PivotTable_DrillDown_ShouldNotCreateButtonsForEmptyCells', () => {
    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        onCellClick={jest.fn()}
      />
    );

    // North has no "Tablet" value and South has no "Laptop" value, so only 4 cells become buttons.
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(
      screen.queryByRole('button', { name: 'North, Tablet, Revenue: 0' })
    ).not.toBeInTheDocument();
  });

  it('PivotTable_DrillDown_ShouldRenderCustomCellContent', async () => {
    const user = userEvent.setup();
    const onCellClick = jest.fn();
    const renderCell = jest.fn((value: number, context: { measure: { label: string } }) => (
      <strong>{`${context.measure.label}: ${value}`}</strong>
    ));

    render(
      <PivotTable
        data={sales}
        rows={['region']}
        column="product"
        measure={revenue}
        onCellClick={onCellClick}
        renderCell={renderCell}
      />
    );

    const northRow = screen.getByRole('row', { name: /North/ });

    expect(within(northRow).getByText('Revenue: 300')).toBeInTheDocument();
    expect(within(northRow).getByText('Revenue: 150')).toBeInTheDocument();
    expect(renderCell).toHaveBeenCalledWith(300, expect.objectContaining({ value: 300 }));

    await user.click(screen.getByRole('button', { name: 'North, Laptop, Revenue: 300' }));

    expect(onCellClick).toHaveBeenCalledWith(expect.objectContaining({ value: 300 }));
  });

  it('PivotTable_DrillDown_ShouldNotifyRowClick', async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={revenue}
        defaultExpandedKeys={['North']}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByRole('button', { name: 'North / Germany' }));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'North / Germany', depth: 1, isLeaf: true })
    );
  });

  it('PivotTable_DrillDown_ShouldKeepExpandCollapseWorkingWithRowClick', async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();

    render(
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={revenue}
        onRowClick={onRowClick}
      />
    );

    expect(screen.queryByRole('button', { name: 'North / Germany' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand group North' }));

    expect(screen.getByRole('button', { name: 'North / Germany' })).toBeInTheDocument();
    expect(onRowClick).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Collapse group North' }));

    expect(screen.queryByRole('button', { name: 'North / Germany' })).not.toBeInTheDocument();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('PivotTable_DrillDown_ShouldStayStaticWithoutHandlers', () => {
    render(<PivotTable data={sales} rows={['region']} column="product" measure={revenue} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('PivotTable_DrillDown_ShouldHaveNoAccessibilityViolations', async () => {
    const { container } = render(
      <PivotTable
        data={sales}
        rows={['region', 'country']}
        column="product"
        measure={revenue}
        defaultExpandedKeys={['North', 'South']}
        onCellClick={jest.fn()}
        onRowClick={jest.fn()}
        renderCell={(value) => <span>{value}</span>}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
