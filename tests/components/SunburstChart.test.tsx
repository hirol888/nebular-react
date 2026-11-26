import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// Internal unit imported directly because the public entry point does not expose it yet.
import { SunburstChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const phonesNode = { label: 'Phones', value: 60 };
const laptopsNode = { label: 'Laptops', value: 40 };
const homeNode = { label: 'Home', value: 100 };
const techNode = { label: 'Tech', children: [phonesNode, laptopsNode] };
const data = [techNode, homeNode];

function numberAttribute(element: Element | null, attribute: string) {
  return Number(element?.getAttribute(attribute));
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-sunburst-label]')).map((element) =>
    [
      element.getAttribute('data-sunburst-depth'),
      element.getAttribute('data-sunburst-label'),
      element.getAttribute('data-start-angle'),
      element.getAttribute('data-end-angle'),
      element.getAttribute('data-inner-radius'),
      element.getAttribute('data-outer-radius'),
      element.getAttribute('d')
    ].join('|')
  );
}

describe('SunburstChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a focusable segment per node and child', () => {
    render(<SunburstChart data={data} ariaLabel="Storage usage" />);

    expect(screen.getByRole('group', { name: 'Storage usage' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getByRole('img', { name: 'Tech: 100' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Tech · Phones: 60' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Tech · Laptops: 40' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Home: 100' })).toBeInTheDocument();
  });

  it('should assign angles from the aggregated values', () => {
    render(<SunburstChart data={data} ariaLabel="Storage usage" />);

    const tech = screen.getByRole('img', { name: 'Tech: 100' });
    const phones = screen.getByRole('img', { name: 'Tech · Phones: 60' });
    const laptops = screen.getByRole('img', { name: 'Tech · Laptops: 40' });
    const home = screen.getByRole('img', { name: 'Home: 100' });

    expect(numberAttribute(tech, 'data-start-angle')).toBeCloseTo(0, 6);
    expect(numberAttribute(tech, 'data-end-angle')).toBeCloseTo(180, 6);
    expect(numberAttribute(home, 'data-start-angle')).toBeCloseTo(180, 6);
    expect(numberAttribute(home, 'data-end-angle')).toBeCloseTo(360, 6);

    expect(numberAttribute(phones, 'data-start-angle')).toBeCloseTo(0, 6);
    expect(numberAttribute(phones, 'data-end-angle')).toBeCloseTo(108, 6);
    expect(numberAttribute(laptops, 'data-start-angle')).toBeCloseTo(108, 6);
    expect(numberAttribute(laptops, 'data-end-angle')).toBeCloseTo(180, 6);

    expect(numberAttribute(phones, 'data-sunburst-value')).toBe(60);
    expect(numberAttribute(laptops, 'data-sunburst-value')).toBe(40);
  });

  it('should nest child segments inside the parent angular range and outer ring', () => {
    render(<SunburstChart data={data} ariaLabel="Storage usage" />);

    const tech = screen.getByRole('img', { name: 'Tech: 100' });
    const phones = screen.getByRole('img', { name: 'Tech · Phones: 60' });

    expect(numberAttribute(phones, 'data-start-angle')).toBeGreaterThanOrEqual(
      numberAttribute(tech, 'data-start-angle')
    );
    expect(numberAttribute(phones, 'data-end-angle')).toBeLessThanOrEqual(
      numberAttribute(tech, 'data-end-angle')
    );
    expect(numberAttribute(phones, 'data-inner-radius')).toBeCloseTo(
      numberAttribute(tech, 'data-outer-radius'),
      6
    );
    expect(numberAttribute(phones, 'data-outer-radius')).toBeGreaterThan(
      numberAttribute(phones, 'data-inner-radius')
    );
  });

  it('should compute ring radii from size and innerRadius', () => {
    const { container, rerender } = render(<SunburstChart data={data} ariaLabel="Storage usage" />);

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 320 320');
    expect(
      numberAttribute(screen.getByRole('img', { name: 'Tech: 100' }), 'data-inner-radius')
    ).toBe(0);
    expect(
      numberAttribute(screen.getByRole('img', { name: 'Tech: 100' }), 'data-outer-radius')
    ).toBeCloseTo(78, 6);
    expect(
      numberAttribute(screen.getByRole('img', { name: 'Home: 100' }), 'data-outer-radius')
    ).toBeCloseTo(78, 6);

    rerender(<SunburstChart data={data} innerRadius={60} ariaLabel="Storage usage" />);

    expect(
      numberAttribute(screen.getByRole('img', { name: 'Tech: 100' }), 'data-inner-radius')
    ).toBeCloseTo(60, 6);
    expect(
      numberAttribute(screen.getByRole('img', { name: 'Tech: 100' }), 'data-outer-radius')
    ).toBeCloseTo(108, 6);
    expect(
      numberAttribute(screen.getByRole('img', { name: 'Tech · Phones: 60' }), 'data-outer-radius')
    ).toBeCloseTo(156, 6);
  });

  it('should aggregate parent values from their children', () => {
    render(
      <SunburstChart
        data={[
          {
            label: 'Parent',
            value: 999,
            children: [{ label: 'Child', value: 5 }]
          }
        ]}
        ariaLabel="Aggregated sunburst"
      />
    );

    expect(screen.getByRole('img', { name: 'Parent: 5' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Parent · Child: 5' })).toBeInTheDocument();
  });

  it('should render labels and hide them when showLabels is false', () => {
    const { rerender } = render(<SunburstChart data={data} ariaLabel="Storage usage" />);

    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Phones')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();

    rerender(<SunburstChart data={data} showLabels={false} ariaLabel="Storage usage" />);

    expect(screen.queryByText('Tech')).not.toBeInTheDocument();
    expect(screen.queryByText('Phones')).not.toBeInTheDocument();
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('should truncate labels that do not fit inside their ring segment', () => {
    const longLabel = 'A very long category label for testing';

    render(
      <SunburstChart
        data={[
          { label: longLabel, value: 10 },
          { label: 'Beta', value: 10 },
          { label: 'Gamma', value: 10 }
        ]}
        ariaLabel="Long labels"
      />
    );

    const rendered = screen.getByText(/^A very long/);

    expect(rendered.textContent).not.toBe(longLabel);
    expect(rendered.textContent?.endsWith('…')).toBe(true);
    expect(screen.getByRole('img', { name: `${longLabel}: 10` })).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a segment', () => {
    render(<SunburstChart data={data} ariaLabel="Storage usage" />);

    const home = screen.getByRole('img', { name: 'Home: 100' });

    expect(screen.queryByText('Home: 100')).not.toBeInTheDocument();

    fireEvent.mouseEnter(home);
    expect(screen.getByText('Home: 100')).toBeInTheDocument();

    fireEvent.blur(home);
    expect(screen.queryByText('Home: 100')).not.toBeInTheDocument();

    fireEvent.focus(home);
    expect(screen.getByText('Home: 100')).toBeInTheDocument();
  });

  it('should call onSegmentClick with the node and its depth', async () => {
    const user = userEvent.setup();
    const onSegmentClick = jest.fn();

    render(<SunburstChart data={data} ariaLabel="Storage usage" onSegmentClick={onSegmentClick} />);

    await user.click(screen.getByRole('button', { name: 'Tech · Phones: 60' }));
    expect(onSegmentClick).toHaveBeenCalledWith(phonesNode, 1);

    onSegmentClick.mockClear();

    await user.click(screen.getByRole('button', { name: 'Home: 100' }));
    expect(onSegmentClick).toHaveBeenCalledWith(homeNode, 0);

    onSegmentClick.mockClear();

    screen.getByRole('button', { name: 'Tech · Laptops: 40' }).focus();
    await user.keyboard('{Enter}');
    expect(onSegmentClick).toHaveBeenCalledWith(laptopsNode, 1);
  });

  it('should apply the value formatter to segment names and tooltips', () => {
    render(
      <SunburstChart
        data={data}
        ariaLabel="Storage usage"
        valueFormatter={(value: number) => `${value} GB`}
      />
    );

    expect(screen.getByRole('img', { name: 'Home: 100 GB' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Tech · Phones: 60 GB' })).toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<SunburstChart data={[]} ariaLabel="Empty sunburst" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every value is zero', () => {
    const { container } = render(
      <SunburstChart
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 }
        ]}
        ariaLabel="Zero sunburst"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(<SunburstChart data={data} ariaLabel="Storage usage" />);
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <SunburstChart data={data} ariaLabel="Storage usage" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <SunburstChart data={data} ariaLabel="Sunburst" />
        <SunburstChart
          data={data}
          innerRadius={60}
          ariaLabel="Interactive sunburst"
          onSegmentClick={() => undefined}
          valueFormatter={(value: number) => `${value} GB`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table with parent labels when showDataTable is visible', () => {
    render(
      <SunburstChart
        data={data}
        ariaLabel="Storage usage"
        showDataTable="visible"
        dataTableCaption="Storage usage data"
      />
    );

    const table = screen.getByRole('table', { name: 'Storage usage data' });

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
      ['Tech', '100', ''],
      ['Phones', '60', 'Tech'],
      ['Laptops', '40', 'Tech'],
      ['Home', '100', '']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <SunburstChart
        data={data}
        ariaLabel="Storage usage"
        showDataTable="hidden"
        dataTableCaption="Storage usage data"
      />
    );

    expect(screen.getByRole('table', { name: 'Storage usage data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<SunburstChart data={data} ariaLabel="Storage usage" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <SunburstChart
        data={data}
        ariaLabel="Storage usage"
        exportable
        exportFileName="storage-usage"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'storage-usage');
    expect(screen.getByRole('status')).toHaveTextContent('Exported storage-usage.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <SunburstChart
        data={data}
        ariaLabel="Storage usage"
        exportable
        exportFileName="storage-usage"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'storage-usage')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported storage-usage.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <SunburstChart data={data} ariaLabel="Storage usage" animated />
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

    const reduced = render(<SunburstChart data={data} ariaLabel="Storage usage" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <SunburstChart
        data={data}
        ariaLabel="Accessible sunburst"
        exportable
        exportFileName="sunburst"
        showDataTable="visible"
        dataTableCaption="Sunburst data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
