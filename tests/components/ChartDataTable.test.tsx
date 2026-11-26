import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ChartDataTable } from '@nebular-react/core';

const columns = ['Month', 'Revenue', 'Costs'];
const rows: React.ReactNode[][] = [
  ['Jan', '12', '8'],
  ['Feb', 19, 11]
];

describe('ChartDataTable', () => {
  it('renders a semantic table with a caption and column headers', () => {
    render(<ChartDataTable caption="Monthly revenue" columns={columns} rows={rows} />);

    const table = screen.getByRole('table', { name: 'Monthly revenue' });

    expect(within(table).getByText('Monthly revenue')).toBeInTheDocument();

    const headers = within(table).getAllByRole('columnheader');

    expect(headers.map((header) => header.textContent)).toEqual(columns);
    headers.forEach((header) => expect(header).toHaveAttribute('scope', 'col'));
    expect(within(table).getAllByRole('row')).toHaveLength(rows.length + 1);
    expect(within(table).getByRole('cell', { name: 'Feb' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '19' })).toBeInTheDocument();
  });

  it('uses a fallback accessible name when no caption is provided', () => {
    render(<ChartDataTable columns={columns} rows={rows} />);

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(document.querySelector('caption')).toBeNull();
  });

  it('renders rich cell content and applies a custom className to the wrapper', () => {
    render(
      <ChartDataTable
        className="custom-table"
        columns={['Label', 'Value']}
        rows={[[<strong key="label">Total</strong>, <span key="value">42</span>]]}
      />
    );

    expect(screen.getByText('Total').tagName).toBe('STRONG');
    expect(screen.getByText('42').tagName).toBe('SPAN');
    expect(screen.getByRole('table').closest('.custom-table')).toBeInTheDocument();
  });

  it('visually hides the table without removing it from the accessibility tree', () => {
    const { container } = render(
      <ChartDataTable visuallyHidden caption="Hidden data" columns={columns} rows={rows} />
    );

    const table = screen.getByRole('table', { name: 'Hidden data' });
    const wrapper = container.querySelector('[data-visually-hidden="true"]');

    expect(wrapper).not.toBeNull();
    expect(wrapper).toContainElement(table);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ChartDataTable caption="Monthly revenue" columns={columns} rows={rows} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
