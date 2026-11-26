import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PieChart } from '@nebular-react/core';

const data = [
  { label: 'Direct', value: 60 },
  { label: 'Organic', value: 30 },
  { label: 'Referral', value: 10 }
];

describe('PieChart', () => {
  it('should render one sector per data item', () => {
    render(<PieChart data={data} ariaLabel="Traffic sources" />);

    expect(screen.getByRole('group', { name: 'Traffic sources' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Direct: 60 (60%)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Organic: 30 (30%)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Referral: 10 (10%)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Direct: 60 (60%)' })).toHaveAttribute('tabindex', '0');
  });

  it('should render the legend for every data item and hide it when showLegend is false', () => {
    const { rerender } = render(<PieChart data={data} ariaLabel="Traffic sources" showLegend />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Direct')).toBeInTheDocument();
    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Referral')).toBeInTheDocument();

    rerender(<PieChart data={data} ariaLabel="Traffic sources" showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
    expect(screen.queryByText('Direct')).not.toBeInTheDocument();
  });

  it('should apply valueFormatter to sector labels and tooltips', () => {
    render(
      <PieChart
        data={[{ label: 'Used', value: 0.5 }]}
        ariaLabel="Disk usage"
        valueFormatter={(value: number) => `${Math.round(value * 100)}%`}
      />
    );

    expect(screen.getByRole('img', { name: 'Used: 50% (100%)' })).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a sector', () => {
    render(<PieChart data={data} ariaLabel="Traffic sources" />);

    const sector = screen.getByRole('img', { name: 'Organic: 30 (30%)' });

    expect(screen.queryByText('Organic: 30 (30%)')).not.toBeInTheDocument();

    fireEvent.mouseEnter(sector);
    expect(screen.getByText('Organic: 30 (30%)')).toBeInTheDocument();

    fireEvent.blur(sector);
    expect(screen.queryByText('Organic: 30 (30%)')).not.toBeInTheDocument();

    fireEvent.focus(sector);
    expect(screen.getByText('Organic: 30 (30%)')).toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<PieChart data={[]} ariaLabel="Empty pie" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every value is zero', () => {
    render(
      <PieChart
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 }
        ]}
        ariaLabel="Zero pie"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should skip zero-value sectors without breaking the other sectors', () => {
    render(
      <PieChart
        data={[...data, { label: 'Zero', value: 0 }]}
        ariaLabel="Pie with zero"
        showLegend={false}
      />
    );

    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.queryByRole('img', { name: /^Zero/ })).not.toBeInTheDocument();
  });

  it('should render a single sector as a full circle', () => {
    render(<PieChart data={[{ label: 'All', value: 5 }]} ariaLabel="Single sector" />);

    const sector = screen.getByRole('img', { name: 'All: 5 (100%)' });

    expect(sector).toBeInTheDocument();
    expect(sector.getAttribute('d')).toContain('A');
  });

  it('should render donut style sectors when innerRadius is set', () => {
    const { container } = render(
      <PieChart data={data} innerRadius={60} ariaLabel="Donut style pie" />
    );

    expect(screen.getByRole('group', { name: 'Donut style pie' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    container.querySelectorAll('path').forEach((path) => {
      expect(path.getAttribute('d')).toContain('Z');
    });
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <PieChart data={data} ariaLabel="Pie" />
        <PieChart data={data} innerRadius={60} ariaLabel="Donut" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <PieChart
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
    expect(within(table).getByRole('cell', { name: '60' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <PieChart
        data={data}
        ariaLabel="Traffic sources"
        showDataTable="hidden"
        dataTableCaption="Traffic sources data"
      />
    );

    expect(screen.getByRole('table', { name: 'Traffic sources data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should mark animated pie charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <PieChart data={data} ariaLabel="Traffic sources" animated />
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

    const reduced = render(<PieChart data={data} ariaLabel="Traffic sources" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should not render a data table by default', () => {
    render(<PieChart data={data} ariaLabel="Traffic sources" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
