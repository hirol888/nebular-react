import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MekkoChart, exportChartPng, exportChartSvg } from '@nebular-react/core';

jest.mock('../../src/nebular-react-core/src/Charts/chart-export', () => ({
  ...jest.requireActual('../../src/nebular-react-core/src/Charts/chart-export'),
  exportChartSvg: jest.fn(),
  exportChartPng: jest.fn()
}));

const data = [
  {
    label: 'Q1',
    segments: [
      { label: 'Direct', value: 30 },
      { label: 'Search', value: 20 },
      { label: 'Social', value: 10 }
    ]
  },
  {
    label: 'Q2',
    segments: [
      { label: 'Direct', value: 10 },
      { label: 'Search', value: 20 },
      { label: 'Social', value: 10 }
    ]
  }
];

const WIDTH = 480;
const HEIGHT = 300;
const PADDING = { top: 16, right: 16, bottom: 44, left: 48 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;
const GAP = 4;
const TOTAL = 100;

function numberAttribute(element: Element | null, attribute: string) {
  return Number(element?.getAttribute(attribute));
}

function signatures(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-mekko-segment]')).map((element) =>
    [
      element.getAttribute('data-mekko-segment'),
      element.getAttribute('x'),
      element.getAttribute('y'),
      element.getAttribute('width'),
      element.getAttribute('height')
    ].join('|')
  );
}

describe('MekkoChart', () => {
  it('should render one focusable segment per stacked segment with column and segment names', () => {
    render(<MekkoChart data={data} ariaLabel="Channel mix" />);

    expect(screen.getByRole('group', { name: 'Channel mix' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(6);

    expect(screen.getByRole('img', { name: 'Q1 · Direct: 30' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('img', { name: 'Q1 · Search: 20' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Q1 · Social: 10' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Q2 · Direct: 10' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Q2 · Search: 20' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Q2 · Social: 10' })).toBeInTheDocument();

    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Q2')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should size each column width proportionally to its total', () => {
    const { container } = render(<MekkoChart data={data} ariaLabel="Channel mix" />);

    const q1 = container.querySelector('[data-mekko-column="Q1"]');
    const q2 = container.querySelector('[data-mekko-column="Q2"]');

    const q1Width = numberAttribute(q1, 'data-mekko-width');
    const q2Width = numberAttribute(q2, 'data-mekko-width');

    expect(q1Width / q2Width).toBeCloseTo(60 / 40, 6);
    expect(q1Width + q2Width + GAP).toBeCloseTo(PLOT_WIDTH, 6);
    expect(q1Width).toBeCloseTo(((PLOT_WIDTH - GAP) * 60) / TOTAL, 6);

    expect(numberAttribute(q1, 'data-mekko-x')).toBeCloseTo(PADDING.left, 6);
    expect(numberAttribute(q2, 'data-mekko-x')).toBeCloseTo(PADDING.left + q1Width + GAP, 6);
    expect(numberAttribute(q1, 'data-mekko-total')).toBe(60);
    expect(numberAttribute(q2, 'data-mekko-total')).toBe(40);
  });

  it('should stack segments and normalize their heights inside each column', () => {
    const { container } = render(<MekkoChart data={data} ariaLabel="Channel mix" />);

    const q1Direct = container.querySelector('[data-mekko-segment="Q1/Direct"]');
    const q1Search = container.querySelector('[data-mekko-segment="Q1/Search"]');
    const q1Social = container.querySelector('[data-mekko-segment="Q1/Social"]');
    const q2Direct = container.querySelector('[data-mekko-segment="Q2/Direct"]');

    expect(numberAttribute(q1Direct, 'height')).toBeCloseTo(PLOT_HEIGHT * 0.5, 6);
    expect(numberAttribute(q1Search, 'height')).toBeCloseTo(PLOT_HEIGHT * (20 / 60), 6);
    expect(numberAttribute(q1Social, 'height')).toBeCloseTo(PLOT_HEIGHT * (10 / 60), 6);
    expect(numberAttribute(q2Direct, 'height')).toBeCloseTo(PLOT_HEIGHT * 0.25, 6);

    expect(numberAttribute(q1Direct, 'height') / numberAttribute(q2Direct, 'height')).toBeCloseTo(
      2,
      6
    );

    expect(numberAttribute(q1Direct, 'data-mekko-share')).toBeCloseTo(0.5, 6);
    expect(numberAttribute(q2Direct, 'data-mekko-share')).toBeCloseTo(0.25, 6);

    expect(numberAttribute(q1Direct, 'y')).toBeCloseTo(PADDING.top, 6);
    expect(numberAttribute(q1Search, 'y')).toBeCloseTo(
      PADDING.top + numberAttribute(q1Direct, 'height'),
      6
    );
    expect(numberAttribute(q1Social, 'y')).toBeCloseTo(
      PADDING.top + numberAttribute(q1Direct, 'height') + numberAttribute(q1Search, 'height'),
      6
    );

    const stackedHeight = ['Q1/Direct', 'Q1/Search', 'Q1/Social'].reduce(
      (total, key) =>
        total + numberAttribute(container.querySelector(`[data-mekko-segment="${key}"]`), 'height'),
      0
    );

    expect(stackedHeight).toBeCloseTo(PLOT_HEIGHT, 6);
    expect(numberAttribute(q1Social, 'y') + numberAttribute(q1Social, 'height')).toBeCloseTo(
      PADDING.top + PLOT_HEIGHT,
      6
    );

    const q1SegmentWidth = numberAttribute(q1Direct, 'width');
    const q2SegmentWidth = numberAttribute(q2Direct, 'width');

    expect(q1SegmentWidth).toBeCloseTo(
      numberAttribute(container.querySelector('[data-mekko-column="Q1"]'), 'data-mekko-width'),
      6
    );
    expect(q2SegmentWidth).toBeCloseTo(
      numberAttribute(container.querySelector('[data-mekko-column="Q2"]'), 'data-mekko-width'),
      6
    );
  });

  it('should show a tooltip on hover and focus and hide it on blur', () => {
    render(<MekkoChart data={data} ariaLabel="Channel mix" />);

    const direct = screen.getByRole('img', { name: 'Q1 · Direct: 30' });

    expect(screen.queryByText('Q1 · Direct: 30')).not.toBeInTheDocument();

    fireEvent.mouseEnter(direct);
    expect(screen.getByText('Q1 · Direct: 30')).toBeInTheDocument();

    fireEvent.blur(direct);
    expect(screen.queryByText('Q1 · Direct: 30')).not.toBeInTheDocument();

    fireEvent.focus(direct);
    expect(screen.getByText('Q1 · Direct: 30')).toBeInTheDocument();
  });

  it('should call onSegmentClick on click and keyboard activation', () => {
    const onSegmentClick = jest.fn();
    const { unmount } = render(
      <MekkoChart data={data} ariaLabel="Channel mix" onSegmentClick={onSegmentClick} />
    );

    expect(screen.getAllByRole('button')).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: 'Q2 · Search: 20' }));
    expect(onSegmentClick).toHaveBeenCalledWith(data[1], data[1].segments[1]);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Q1 · Social: 10' }), { key: 'Enter' });
    expect(onSegmentClick).toHaveBeenLastCalledWith(data[0], data[0].segments[2]);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Q2 · Direct: 10' }), { key: ' ' });
    expect(onSegmentClick).toHaveBeenLastCalledWith(data[1], data[1].segments[0]);
    expect(onSegmentClick).toHaveBeenCalledTimes(3);

    unmount();

    render(<MekkoChart data={data} ariaLabel="Read only channel mix" />);

    expect(screen.getAllByRole('img')).toHaveLength(6);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should apply the value formatter to the accessible segment names', () => {
    render(
      <MekkoChart
        data={data}
        ariaLabel="Channel mix"
        valueFormatter={(value: number) => `${value}k`}
      />
    );

    expect(screen.getByRole('img', { name: 'Q1 · Direct: 30k' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Q2 · Social: 10k' })).toBeInTheDocument();

    fireEvent.focus(screen.getByRole('img', { name: 'Q2 · Social: 10k' }));
    expect(screen.getByText('Q2 · Social: 10k')).toBeInTheDocument();
  });

  it('should render a unique legend entry per segment label with stable colors', () => {
    const { container, rerender } = render(<MekkoChart data={data} ariaLabel="Channel mix" />);

    const legend = screen.getByRole('list', { name: 'Series' });
    const items = within(legend).getAllByRole('listitem');

    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText('Direct')).toBeInTheDocument();
    expect(within(items[1]).getByText('Search')).toBeInTheDocument();
    expect(within(items[2]).getByText('Social')).toBeInTheDocument();

    expect(container.querySelector('[data-mekko-segment="Q1/Direct"]')).toHaveAttribute(
      'fill',
      '#3366ff'
    );
    expect(container.querySelector('[data-mekko-segment="Q2/Direct"]')).toHaveAttribute(
      'fill',
      '#3366ff'
    );
    expect(container.querySelector('[data-mekko-segment="Q1/Search"]')).toHaveAttribute(
      'fill',
      '#00d68f'
    );

    rerender(<MekkoChart data={data} ariaLabel="Channel mix" showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
  });

  it('should render an empty state for empty data', () => {
    const { container } = render(<MekkoChart data={[]} ariaLabel="Empty channel mix" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render an empty state when every segment value is zero', () => {
    const { container } = render(
      <MekkoChart
        data={[
          { label: 'Q1', segments: [{ label: 'Direct', value: 0 }] },
          { label: 'Q2', segments: [{ label: 'Direct', value: 0 }] }
        ]}
        ariaLabel="Zero channel mix"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('should produce a deterministic layout', () => {
    const { container, unmount } = render(<MekkoChart data={data} ariaLabel="Channel mix" />);
    const first = signatures(container);

    unmount();

    const { container: secondContainer } = render(
      <MekkoChart data={data} ariaLabel="Channel mix" />
    );

    expect(signatures(secondContainer)).toEqual(first);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <MekkoChart data={data} ariaLabel="Channel mix" />
        <MekkoChart
          data={data}
          ariaLabel="Interactive channel mix"
          valueFormatter={(value: number) => `${value}k`}
          onSegmentClick={() => undefined}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('MekkoChart data table, export and motion', () => {
  beforeEach(() => {
    jest.mocked(exportChartSvg).mockImplementation(() => undefined);
    jest.mocked(exportChartPng).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render an accessible data table when showDataTable is visible', () => {
    render(
      <MekkoChart
        data={data}
        ariaLabel="Channel mix"
        showDataTable="visible"
        dataTableCaption="Channel mix data"
      />
    );

    const table = screen.getByRole('table', { name: 'Channel mix data' });

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Column', 'Segment', 'Value']);
    expect(within(table).getAllByRole('cell', { name: 'Q1' })).toHaveLength(3);
    expect(within(table).getAllByRole('cell', { name: 'Direct' })).toHaveLength(2);
    expect(within(table).getByRole('cell', { name: '30' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(7);
  });

  it('should visually hide the data table when showDataTable is hidden', () => {
    const { container } = render(
      <MekkoChart data={data} ariaLabel="Channel mix" showDataTable="hidden" />
    );

    expect(screen.getByRole('table', { name: 'Chart data' })).toBeInTheDocument();
    expect(container.querySelector('[data-visually-hidden="true"]')).not.toBeNull();
  });

  it('should not render a data table or export controls by default', () => {
    render(<MekkoChart data={data} ariaLabel="Channel mix" />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export SVG' })).not.toBeInTheDocument();
  });

  it('should export the chart as svg and png', async () => {
    render(<MekkoChart data={data} ariaLabel="Channel mix" exportable exportFileName="channels" />);

    fireEvent.click(screen.getByRole('button', { name: 'Export SVG' }));

    expect(exportChartSvg).toHaveBeenCalledWith(expect.any(SVGElement), 'channels');
    expect(screen.getByRole('status')).toHaveTextContent('Exported channels.svg');

    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Exported channels.png')
    );
    expect(exportChartPng).toHaveBeenCalledWith(
      expect.any(SVGElement),
      'channels',
      expect.objectContaining({ scale: 2 })
    );
  });

  it('should mark animated charts and honor reduced motion', () => {
    const { container, unmount } = render(
      <MekkoChart data={data} ariaLabel="Channel mix" animated />
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

    const reduced = render(<MekkoChart data={data} ariaLabel="Channel mix" animated />);

    expect(reduced.container.firstChild).not.toHaveAttribute('data-animated');

    window.matchMedia = originalMatchMedia;
  });

  it('should have no accessibility violations with the data table and export controls', async () => {
    const { container } = render(
      <MekkoChart
        data={data}
        ariaLabel="Channel mix"
        showDataTable="visible"
        dataTableCaption="Channel mix data"
        exportable
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
