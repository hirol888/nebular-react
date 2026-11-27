import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { RadialBarChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  { label: 'Alpha', value: 80, color: '#3366ff' },
  { label: 'Beta', value: 40, color: '#00d68f' }
];

describe('RadialBarChart', () => {
  it('should render one proportional concentric bar per data item', () => {
    render(<RadialBarChart data={data} ariaLabel="Coverage" />);

    expect(screen.getByRole('group', { name: 'Coverage' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Alpha: 80 (100%)' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Beta: 40 (50%)' })).toBeInTheDocument();
  });

  it('should compute the sweep from the maximum value', () => {
    render(<RadialBarChart data={data} ariaLabel="Coverage" showLegend={false} />);

    const alpha = screen.getByRole('img', { name: 'Alpha: 80 (100%)' });
    const beta = screen.getByRole('img', { name: 'Beta: 40 (50%)' });
    const alphaStart = Number(alpha.getAttribute('data-radial-start'));
    const betaStart = Number(beta.getAttribute('data-radial-start'));

    expect(alphaStart).toBe(-90);
    expect(Number(alpha.getAttribute('data-radial-end')) - alphaStart).toBeCloseTo(360, 5);
    expect(Number(beta.getAttribute('data-radial-end')) - betaStart).toBeCloseTo(180, 5);
    expect(alpha.getAttribute('d')).not.toBe(beta.getAttribute('d'));
  });

  it('should stack the bars from the inner radius outwards', () => {
    render(<RadialBarChart data={data} ariaLabel="Coverage" showLegend={false} />);

    const alpha = screen.getByRole('img', { name: 'Alpha: 80 (100%)' });
    const beta = screen.getByRole('img', { name: 'Beta: 40 (50%)' });

    expect(Number(alpha.getAttribute('data-radial-outer'))).toBeCloseTo(145, 2);
    expect(Number(alpha.getAttribute('data-radial-inner'))).toBeCloseTo(99.55, 2);
    expect(Number(beta.getAttribute('data-radial-outer'))).toBeCloseTo(97.55, 2);
    expect(Number(beta.getAttribute('data-radial-inner'))).toBeCloseTo(52.1, 2);
  });

  it('should start the bars at the top and honour startAngle', () => {
    const { rerender } = render(
      <RadialBarChart data={data} ariaLabel="Coverage" showLegend={false} />
    );

    expect(
      screen
        .getByRole('img', { name: 'Alpha: 80 (100%)' })
        .getAttribute('d')
        ?.startsWith('M 150 5 ')
    ).toBe(true);

    rerender(<RadialBarChart data={data} ariaLabel="Coverage" showLegend={false} startAngle={0} />);

    expect(
      screen
        .getByRole('img', { name: 'Alpha: 80 (100%)' })
        .getAttribute('d')
        ?.startsWith('M 295 150 ')
    ).toBe(true);
  });

  it('should render the label of every bar and the legend', () => {
    const { rerender } = render(<RadialBarChart data={data} ariaLabel="Coverage" />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getAllByText('Alpha')).toHaveLength(2);
    expect(screen.getAllByText('Beta')).toHaveLength(2);

    rerender(<RadialBarChart data={data} ariaLabel="Coverage" showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should apply valueFormatter to the bar labels and tooltips', () => {
    render(
      <RadialBarChart
        data={[{ label: 'Used', value: 0.5 }]}
        ariaLabel="Disk usage"
        valueFormatter={(value: number) => `${Math.round(value * 100)}%`}
      />
    );

    expect(screen.getByRole('img', { name: 'Used: 50% (100%)' })).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByRole('img', { name: 'Used: 50% (100%)' }));

    expect(screen.getByText('Used: 50% (100%)')).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a bar', () => {
    render(<RadialBarChart data={data} ariaLabel="Coverage" />);

    const bar = screen.getByRole('img', { name: 'Beta: 40 (50%)' });

    expect(screen.queryByText('Beta: 40 (50%)')).not.toBeInTheDocument();

    fireEvent.mouseEnter(bar);
    expect(screen.getByText('Beta: 40 (50%)')).toBeInTheDocument();

    fireEvent.blur(bar);
    expect(screen.queryByText('Beta: 40 (50%)')).not.toBeInTheDocument();

    fireEvent.focus(bar);
    expect(screen.getByText('Beta: 40 (50%)')).toBeInTheDocument();
  });

  it('should call onBarClick with the datum and index on click and keyboard activation', () => {
    const onBarClick = jest.fn();

    render(<RadialBarChart data={data} ariaLabel="Coverage" onBarClick={onBarClick} />);

    const bar = screen.getByRole('button', { name: 'Beta: 40 (50%)' });

    fireEvent.click(bar);
    expect(onBarClick).toHaveBeenCalledWith(data[1], 1);

    onBarClick.mockClear();
    fireEvent.keyDown(bar, { key: 'Enter' });
    expect(onBarClick).toHaveBeenCalledWith(data[1], 1);

    onBarClick.mockClear();
    fireEvent.keyDown(bar, { key: ' ' });
    expect(onBarClick).toHaveBeenCalledWith(data[1], 1);
  });

  it('should skip zero-value bars without breaking the other bars', () => {
    render(
      <RadialBarChart
        data={[...data, { label: 'Zero', value: 0 }]}
        ariaLabel="Coverage"
        showLegend={false}
      />
    );

    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.queryByRole('img', { name: /^Zero/ })).not.toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<RadialBarChart data={[]} ariaLabel="Empty radial" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every value is zero', () => {
    render(
      <RadialBarChart
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 }
        ]}
        ariaLabel="Zero radial"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <RadialBarChart data={data} ariaLabel="Radial" />
        <RadialBarChart data={data} ariaLabel="Interactive radial" onBarClick={() => undefined} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('RadialBarChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <RadialBarChart
        data={data}
        ariaLabel="Coverage"
        showDataTable="visible"
        dataTableCaption="Coverage data"
      />
    );

    const table = screen.getByRole('table', { name: 'Coverage data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Label', 'Value']);
    expect(within(table).getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: '80' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(data.length + 1);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <RadialBarChart data={data} ariaLabel="Coverage" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<RadialBarChart data={data} ariaLabel="Coverage" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(
      <RadialBarChart data={data} ariaLabel="Coverage" exportable exportFileName="coverage" />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'coverage');
    expect(screen.getByRole('status')).toHaveTextContent('Exported coverage.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported coverage.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'coverage',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <RadialBarChart data={data} ariaLabel="Coverage" animated />
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

    const reduced = render(<RadialBarChart data={data} ariaLabel="Coverage" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <RadialBarChart
        data={data}
        ariaLabel="Coverage"
        showDataTable="visible"
        dataTableCaption="Coverage data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
