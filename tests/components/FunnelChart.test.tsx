import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { FunnelChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'Visits', value: 120 },
  { label: 'Signups', value: 60 },
  { label: 'Purchases', value: 20 }
];

describe('FunnelChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render one focusable segment per data item', () => {
    render(<FunnelChart data={data} ariaLabel="Conversion funnel" />);

    expect(screen.getByRole('group', { name: 'Conversion funnel' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Visits: 120 (60%)' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Signups: 60 (30%)' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Purchases: 20 (10%)' })).toBeInTheDocument();
  });

  it('should render the label, value and percentage inside every segment', () => {
    render(<FunnelChart data={data} ariaLabel="Conversion funnel" />);

    expect(screen.getByText('Visits')).toBeInTheDocument();
    expect(screen.getByText('Signups')).toBeInTheDocument();
    expect(screen.getByText('Purchases')).toBeInTheDocument();
    expect(screen.getByText('120 (60%)')).toBeInTheDocument();
    expect(screen.getByText('60 (30%)')).toBeInTheDocument();
    expect(screen.getByText('20 (10%)')).toBeInTheDocument();
  });

  it('should apply the value formatter to the visible values and accessible names', () => {
    render(
      <FunnelChart
        data={[{ label: 'Visits', value: 120 }]}
        ariaLabel="Conversion funnel"
        valueFormatter={(value: number) => `${value} users`}
      />
    );

    expect(screen.getByText('120 users (100%)')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Visits: 120 users (100%)' })).toBeInTheDocument();
  });

  it('should hide the visible values when showValues is false', () => {
    render(<FunnelChart data={data} ariaLabel="Conversion funnel" showValues={false} />);

    expect(screen.getByText('Visits')).toBeInTheDocument();
    expect(screen.queryByText('120 (60%)')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Visits: 120 (60%)' })).toBeInTheDocument();
  });

  it('should show a tooltip when a segment is hovered and hide it when the pointer leaves', async () => {
    const user = userEvent.setup();

    render(<FunnelChart data={data} ariaLabel="Conversion funnel" />);

    const segment = screen.getByRole('img', { name: 'Signups: 60 (30%)' });

    expect(screen.queryByText('Signups: 60 (30%)')).not.toBeInTheDocument();

    await user.hover(segment);
    expect(screen.getByText('Signups: 60 (30%)')).toBeInTheDocument();

    await user.unhover(segment);
    expect(screen.queryByText('Signups: 60 (30%)')).not.toBeInTheDocument();
  });

  it('should show a tooltip when a segment receives focus', async () => {
    const user = userEvent.setup();

    render(<FunnelChart data={data} ariaLabel="Conversion funnel" />);

    await user.tab();

    expect(screen.getByRole('img', { name: 'Visits: 120 (60%)' })).toHaveFocus();
    expect(screen.getByText('Visits: 120 (60%)')).toBeInTheDocument();
  });

  it('should call onSegmentClick with the item and its index', async () => {
    const user = userEvent.setup();
    const onSegmentClick = jest.fn();

    render(
      <FunnelChart data={data} ariaLabel="Conversion funnel" onSegmentClick={onSegmentClick} />
    );

    const segment = screen.getByRole('button', { name: 'Signups: 60 (30%)' });

    await user.click(segment);
    expect(onSegmentClick).toHaveBeenCalledTimes(1);
    expect(onSegmentClick).toHaveBeenCalledWith(data[1], 1);

    onSegmentClick.mockClear();

    screen.getByRole('button', { name: 'Purchases: 20 (10%)' }).focus();
    await user.keyboard('{Enter}');

    expect(onSegmentClick).toHaveBeenCalledWith(data[2], 2);
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<FunnelChart data={[]} ariaLabel="Empty funnel" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every value is zero', () => {
    render(
      <FunnelChart
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 }
        ]}
        ariaLabel="Zero funnel"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should accept a custom height', () => {
    const { container } = render(<FunnelChart data={data} height={320} ariaLabel="Tall funnel" />);

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 480 320');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <FunnelChart data={data} ariaLabel="Funnel" />
        <FunnelChart
          data={data}
          ariaLabel="Interactive funnel"
          onSegmentClick={() => undefined}
          valueFormatter={(value: number) => `${value} users`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <FunnelChart
        data={data}
        ariaLabel="Conversion funnel"
        showDataTable="visible"
        dataTableCaption="Conversion funnel data"
      />
    );

    const table = screen.getByRole('table', { name: 'Conversion funnel data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Stage', 'Value']);

    const rows = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      );

    expect(rows).toEqual([
      ['Visits', '120'],
      ['Signups', '60'],
      ['Purchases', '20']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <FunnelChart
        data={data}
        ariaLabel="Conversion funnel"
        showDataTable="hidden"
        dataTableCaption="Conversion funnel data"
      />
    );

    expect(screen.getByRole('table', { name: 'Conversion funnel data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<FunnelChart data={data} ariaLabel="Conversion funnel" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <FunnelChart
        data={data}
        ariaLabel="Conversion funnel"
        exportable
        exportFileName="conversion-funnel"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'conversion-funnel');
    expect(screen.getByRole('status')).toHaveTextContent('Exported conversion-funnel.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <FunnelChart
        data={data}
        ariaLabel="Conversion funnel"
        exportable
        exportFileName="conversion-funnel"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'conversion-funnel')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported conversion-funnel.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <FunnelChart data={data} ariaLabel="Conversion funnel" animated />
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

    const reduced = render(<FunnelChart data={data} ariaLabel="Conversion funnel" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <FunnelChart
        data={data}
        ariaLabel="Accessible funnel"
        exportable
        exportFileName="funnel"
        showDataTable="visible"
        dataTableCaption="Funnel data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
