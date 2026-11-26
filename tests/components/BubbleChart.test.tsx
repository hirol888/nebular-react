import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { BubbleChart } from '@nebular-react/core';

const data = [
  { x: 10, y: 20, size: 100, label: 'Alpha' },
  { x: 30, y: 40, size: 400, label: 'Beta' },
  { x: 50, y: 10, size: 25, label: 'Gamma' }
];

function bubbles(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-bubble-index]'));
}

function radiusOf(name: string) {
  return Number(screen.getByRole('img', { name }).getAttribute('r'));
}

function signature(container: HTMLElement) {
  return bubbles(container)
    .map((bubble) =>
      [
        bubble.getAttribute('data-bubble-index'),
        bubble.getAttribute('cx'),
        bubble.getAttribute('cy'),
        bubble.getAttribute('r'),
        bubble.getAttribute('fill')
      ].join(',')
    )
    .join('|');
}

describe('BubbleChart', () => {
  it('should render a focusable bubble for every data entry', () => {
    const { container } = render(<BubbleChart data={data} ariaLabel="Bubbles" />);

    expect(screen.getByRole('group', { name: 'Bubbles' })).toBeInTheDocument();
    expect(bubbles(container)).toHaveLength(3);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Alpha: (10, 20), size 100' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    expect(screen.getByRole('img', { name: 'Beta: (30, 40), size 400' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Gamma: (50, 10), size 25' })).toBeInTheDocument();
  });

  it('should scale the radius by the square root of the size', () => {
    render(<BubbleChart data={data} ariaLabel="Bubbles" />);

    const beta = radiusOf('Beta: (30, 40), size 400');
    const gamma = radiusOf('Gamma: (50, 10), size 25');
    const alpha = radiusOf('Alpha: (10, 20), size 100');

    expect(beta / gamma).toBeCloseTo(4, 1);
    expect(beta / alpha).toBeCloseTo(2, 1);
    expect(beta).toBeGreaterThan(alpha);
    expect(alpha).toBeGreaterThan(gamma);
  });

  it('should place the bubbles with the requested size, axes and labels', () => {
    const { container } = render(
      <BubbleChart
        data={data}
        width={320}
        height={200}
        xLabel="Revenue"
        yLabel="Users"
        ariaLabel="Sized bubbles"
      />
    );

    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 320 200');
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();

    // Five grid lines per axis plus the two axis lines.
    expect(container.querySelectorAll('line')).toHaveLength(12);
  });

  it('should format the axis ticks and bubble labels with valueFormatter', () => {
    render(
      <BubbleChart
        data={[{ x: 1, y: 2, size: 4, label: 'P' }]}
        ariaLabel="Formatted bubbles"
        valueFormatter={(value: number) => value.toFixed(1)}
      />
    );

    expect(screen.getByRole('img', { name: 'P: (1.0, 2.0), size 4.0' })).toBeInTheDocument();
  });

  it('should show a tooltip when a bubble is hovered or focused', () => {
    render(<BubbleChart data={data} ariaLabel="Bubbles" />);

    const bubble = screen.getByRole('img', { name: 'Beta: (30, 40), size 400' });

    expect(screen.queryByText('Beta: (30, 40), size 400')).not.toBeInTheDocument();

    fireEvent.mouseEnter(bubble);
    expect(screen.getByText('Beta: (30, 40), size 400')).toBeInTheDocument();

    fireEvent.blur(bubble);
    expect(screen.queryByText('Beta: (30, 40), size 400')).not.toBeInTheDocument();

    fireEvent.focus(bubble);
    expect(screen.getByText('Beta: (30, 40), size 400')).toBeInTheDocument();
  });

  it('should call onBubbleClick with the datum and index on click and keyboard activation', () => {
    const onBubbleClick = jest.fn();

    render(<BubbleChart data={data} ariaLabel="Bubbles" onBubbleClick={onBubbleClick} />);

    const bubble = screen.getByRole('button', { name: 'Gamma: (50, 10), size 25' });

    fireEvent.click(bubble);
    expect(onBubbleClick).toHaveBeenCalledWith(data[2], 2);

    onBubbleClick.mockClear();
    fireEvent.keyDown(bubble, { key: 'Enter' });
    expect(onBubbleClick).toHaveBeenCalledWith(data[2], 2);

    onBubbleClick.mockClear();
    fireEvent.keyDown(bubble, { key: ' ' });
    expect(onBubbleClick).toHaveBeenCalledWith(data[2], 2);
  });

  it('should render the legend for every labelled bubble and hide it when showLegend is false', () => {
    const { rerender } = render(<BubbleChart data={data} ariaLabel="Bubbles" />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();

    rerender(<BubbleChart data={data} ariaLabel="Bubbles" showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('should render an empty state when there is no data', () => {
    const { container } = render(<BubbleChart data={[]} ariaLabel="Empty bubbles" />);

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('should render deterministically for the same input', () => {
    const { container, rerender } = render(<BubbleChart data={data} ariaLabel="Bubbles" />);

    const before = signature(container);

    rerender(<BubbleChart data={[...data]} ariaLabel="Bubbles" />);

    expect(signature(container)).toBe(before);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <BubbleChart data={data} ariaLabel="Bubbles" xLabel="X" yLabel="Y" />
        <BubbleChart data={data} ariaLabel="Interactive bubbles" onBubbleClick={() => undefined} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
