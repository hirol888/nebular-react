import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// Internal unit imported directly because the public entry point does not expose it yet.
import { ChordChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const labels = ['A', 'B', 'C'];

const matrix = [
  [0, 10, 20],
  [10, 0, 5],
  [20, 5, 0]
];

const TOTAL = 70;

function angleAttribute(element: Element | null, attribute: string) {
  return Number(element?.getAttribute(attribute));
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-chord-label], [data-chord-link]')).map(
    (element) =>
      [
        element.getAttribute('data-chord-label') ?? element.getAttribute('data-chord-link'),
        element.getAttribute('data-start-angle'),
        element.getAttribute('data-end-angle'),
        element.getAttribute('d')
      ].join('|')
  );
}

describe('ChordChart', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render a focusable arc per label and a focusable ribbon per directed pair', () => {
    render(<ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />);

    expect(screen.getByRole('group', { name: 'Traffic chords' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(9);
    expect(screen.getByRole('img', { name: 'A: 30' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'B: 15' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'C: 25' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'A → B: 10' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'B → A: 10' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'C → A: 20' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'B → C: 5' })).toBeInTheDocument();
  });

  it('should size the arcs proportionally to the row totals', () => {
    render(<ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />);

    const arcA = screen.getByRole('img', { name: 'A: 30' });
    const arcB = screen.getByRole('img', { name: 'B: 15' });
    const arcC = screen.getByRole('img', { name: 'C: 25' });

    expect(angleAttribute(arcA, 'data-start-angle')).toBeCloseTo(0, 6);
    expect(angleAttribute(arcA, 'data-end-angle')).toBeCloseTo((30 / TOTAL) * 360, 6);
    expect(angleAttribute(arcB, 'data-start-angle')).toBeCloseTo((30 / TOTAL) * 360, 6);
    expect(angleAttribute(arcB, 'data-end-angle')).toBeCloseTo((45 / TOTAL) * 360, 6);
    expect(angleAttribute(arcC, 'data-start-angle')).toBeCloseTo((45 / TOTAL) * 360, 6);
    expect(angleAttribute(arcC, 'data-end-angle')).toBeCloseTo(360, 6);

    const sweepA =
      angleAttribute(arcA, 'data-end-angle') - angleAttribute(arcA, 'data-start-angle');
    const sweepB =
      angleAttribute(arcB, 'data-end-angle') - angleAttribute(arcB, 'data-start-angle');

    expect(sweepA / sweepB).toBeCloseTo(2, 6);
  });

  it('should allocate ribbon widths proportionally and deterministically', () => {
    render(<ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />);

    const ac = screen.getByRole('img', { name: 'A → C: 20' });
    const bc = screen.getByRole('img', { name: 'B → C: 5' });
    const ab = screen.getByRole('img', { name: 'A → B: 10' });

    const acWidth =
      angleAttribute(ac, 'data-source-end-angle') - angleAttribute(ac, 'data-source-start-angle');
    const bcWidth =
      angleAttribute(bc, 'data-source-end-angle') - angleAttribute(bc, 'data-source-start-angle');

    expect(acWidth / bcWidth).toBeCloseTo(4, 6);
    expect(angleAttribute(ab, 'data-source-start-angle')).toBeCloseTo(0, 6);
    expect(angleAttribute(ac, 'data-source-start-angle')).toBeCloseTo((10 / TOTAL) * 360, 6);
    expect(angleAttribute(ac, 'data-target-start-angle')).toBeCloseTo((45 / TOTAL) * 360, 6);
    expect(angleAttribute(bc, 'data-target-start-angle')).toBeCloseTo(
      (45 / TOTAL) * 360 + (20 / TOTAL) * 360,
      6
    );
    expect(ac.getAttribute('d')).toContain('Q');
    expect(ac.getAttribute('d')).toContain('A');
  });

  it('should render the labels and hide them when showLabels is false', () => {
    const { rerender } = render(
      <ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();

    rerender(
      <ChordChart matrix={matrix} labels={labels} showLabels={false} ariaLabel="Traffic chords" />
    );

    expect(screen.queryByText('A')).not.toBeInTheDocument();
    expect(screen.queryByText('B')).not.toBeInTheDocument();
    expect(screen.queryByText('C')).not.toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of an arc and of a ribbon', () => {
    render(<ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />);

    const arc = screen.getByRole('img', { name: 'A: 30' });
    const ribbon = screen.getByRole('img', { name: 'A → C: 20' });

    expect(screen.queryByText('A: 30')).not.toBeInTheDocument();

    fireEvent.mouseEnter(arc);
    expect(screen.getByText('A: 30')).toBeInTheDocument();

    fireEvent.blur(arc);
    expect(screen.queryByText('A: 30')).not.toBeInTheDocument();

    fireEvent.focus(arc);
    expect(screen.getByText('A: 30')).toBeInTheDocument();

    fireEvent.mouseEnter(ribbon);
    expect(screen.getByText('A → C: 20')).toBeInTheDocument();
  });

  it('should apply the value formatter to arcs, ribbons and tooltips', () => {
    render(
      <ChordChart
        matrix={matrix}
        labels={labels}
        ariaLabel="Traffic chords"
        valueFormatter={(value: number) => `${value}k`}
      />
    );

    expect(screen.getByRole('img', { name: 'A: 30k' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'C → A: 20k' })).toBeInTheDocument();
  });

  it('should accept a custom size and palette', () => {
    const { container } = render(
      <ChordChart
        matrix={matrix}
        labels={labels}
        size={400}
        colors={['#111111', '#222222', '#333333']}
        ariaLabel="Traffic chords"
      />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 400 400');
    expect(screen.getByRole('img', { name: 'A: 30' })).toHaveAttribute('fill', '#111111');
    expect(screen.getByRole('img', { name: 'B: 15' })).toHaveAttribute('fill', '#222222');
  });

  it('should render an empty state when the matrix is empty', () => {
    const { container } = render(<ChordChart matrix={[]} labels={[]} ariaLabel="Empty chords" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every value is zero', () => {
    const { container } = render(
      <ChordChart
        matrix={[
          [0, 0],
          [0, 0]
        ]}
        labels={['A', 'B']}
        ariaLabel="Zero chords"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(
      <ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />
    );
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ChordChart matrix={matrix} labels={labels} ariaLabel="Chords" />
        <ChordChart
          matrix={matrix}
          labels={labels}
          ariaLabel="Chords with labels hidden"
          showLabels={false}
          valueFormatter={(value: number) => `${value}k`}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render an accessible data table with directed pairs when showDataTable is visible', () => {
    render(
      <ChordChart
        matrix={matrix}
        labels={labels}
        ariaLabel="Traffic chords"
        showDataTable="visible"
        dataTableCaption="Traffic chord data"
      />
    );

    const table = screen.getByRole('table', { name: 'Traffic chord data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Source', 'Target', 'Value']);

    const rows = within(table)
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent)
      );

    expect(rows).toEqual([
      ['A', 'B', '10'],
      ['A', 'C', '20'],
      ['B', 'A', '10'],
      ['B', 'C', '5'],
      ['C', 'A', '20'],
      ['C', 'B', '5']
    ]);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <ChordChart
        matrix={matrix}
        labels={labels}
        ariaLabel="Traffic chords"
        showDataTable="hidden"
        dataTableCaption="Traffic chord data"
      />
    );

    expect(screen.getByRole('table', { name: 'Traffic chord data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should not render a data table or export controls by default', () => {
    render(<ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export PNG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <ChordChart
        matrix={matrix}
        labels={labels}
        ariaLabel="Traffic chords"
        exportable
        exportFileName="traffic-chords"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'traffic-chords');
    expect(screen.getByRole('status')).toHaveTextContent('Exported traffic-chords.svg');
  });

  it('should export the chart as png and announce the file name', async () => {
    const user = userEvent.setup();

    render(
      <ChordChart
        matrix={matrix}
        labels={labels}
        ariaLabel="Traffic chords"
        exportable
        exportFileName="traffic-chords"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(exportChartPng).toHaveBeenCalledWith(expect.any(SVGElement), 'traffic-chords')
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Exported traffic-chords.png');
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" animated />
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

    const reduced = render(
      <ChordChart matrix={matrix} labels={labels} ariaLabel="Traffic chords" animated />
    );

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with export and data table', async () => {
    const { container } = render(
      <ChordChart
        matrix={matrix}
        labels={labels}
        ariaLabel="Accessible chords"
        exportable
        exportFileName="chords"
        showDataTable="visible"
        dataTableCaption="Chord data"
        animated
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
