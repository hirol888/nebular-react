import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PictogramChart } from '@nebular-react/core';

const data = [
  { label: 'Direct', value: 50, color: '#3366ff' },
  { label: 'Organic', value: 30, color: '#00d68f' },
  { label: 'Referral', value: 20, color: '#ffaa00' }
];

function glyphs(container: HTMLElement, itemIndex: number) {
  return Array.from(container.querySelectorAll(`[data-pictogram-item="${itemIndex}"]`));
}

function fills(container: HTMLElement, itemIndex: number) {
  return glyphs(container, itemIndex).map((glyph) =>
    Number(glyph.getAttribute('data-pictogram-fill'))
  );
}

function units(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-pictogram-unit]'));
}

function signature(container: HTMLElement) {
  return units(container)
    .map((unit) => {
      const glyphSignature = Array.from(unit.querySelectorAll('[data-pictogram-item]'))
        .map(
          (glyph) =>
            `${glyph.getAttribute('data-pictogram-item')}:${glyph.getAttribute(
              'data-pictogram-fill'
            )}:${glyph.getAttribute('fill')}`
        )
        .join('+');

      return `${unit.getAttribute('data-pictogram-row')}/${unit.getAttribute(
        'data-pictogram-column'
      )}=${glyphSignature}`;
    })
    .join('|');
}

describe('PictogramChart', () => {
  it('should render one focusable glyph per unit proportionally to the values', () => {
    const { container } = render(<PictogramChart data={data} ariaLabel="Traffic sources" />);

    expect(screen.getByRole('group', { name: 'Traffic sources' })).toBeInTheDocument();
    expect(units(container)).toHaveLength(10);
    expect(glyphs(container, 0)).toHaveLength(5);
    expect(glyphs(container, 1)).toHaveLength(3);
    expect(glyphs(container, 2)).toHaveLength(2);
    expect(glyphs(container, 0)[0]).toHaveAttribute('fill', '#3366ff');
    expect(glyphs(container, 1)[0]).toHaveAttribute('fill', '#00d68f');
    expect(glyphs(container, 2)[0]).toHaveAttribute('fill', '#ffaa00');
    expect(glyphs(container, 0)[0]).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByRole('img')).toHaveLength(10);
  });

  it('should fill the last unit partially when a share is fractional', () => {
    const { container } = render(
      <PictogramChart
        data={[
          { label: 'A', value: 25, color: '#111111' },
          { label: 'B', value: 75, color: '#222222' }
        ]}
        ariaLabel="Split"
      />
    );

    expect(fills(container, 0)).toEqual([1, 1, 0.5]);
    expect(fills(container, 1)).toEqual([0.5, 1, 1, 1, 1, 1, 1, 1]);
    expect(glyphs(container, 0)[2]).toHaveAttribute('clip-path');
    expect(glyphs(container, 0)[0]).not.toHaveAttribute('clip-path');

    // The partial glyph must reference a clip path that actually exists.
    const clipId = glyphs(container, 0)[2]
      .getAttribute('clip-path')
      ?.match(/#(.+)\)/)?.[1];

    expect(clipId).toBeTruthy();
    expect(
      Array.from(container.querySelectorAll('[id]')).map((node) => node.getAttribute('id'))
    ).toContain(clipId);
  });

  it('should keep the total fill of every item equal to its share of the units', () => {
    const { container } = render(
      <PictogramChart
        data={[
          { label: 'A', value: 1 },
          { label: 'B', value: 1 },
          { label: 'C', value: 1 }
        ]}
        ariaLabel="Thirds"
      />
    );

    const sums = [0, 1, 2].map((itemIndex) =>
      fills(container, itemIndex).reduce((sum, value) => sum + value, 0)
    );

    expect(sums[0]).toBeCloseTo(10 / 3, 3);
    expect(sums[1]).toBeCloseTo(10 / 3, 3);
    expect(sums[2]).toBeCloseTo(10 / 3, 3);
    expect(sums.reduce((sum, value) => sum + value, 0)).toBeCloseTo(10, 3);
  });

  it('should respect the maxUnits and columns grid', () => {
    const { container } = render(
      <PictogramChart data={data} maxUnits={12} columns={4} ariaLabel="Grid" />
    );

    const columns = new Set(
      units(container).map((unit) => unit.getAttribute('data-pictogram-column'))
    );
    const rows = new Set(units(container).map((unit) => unit.getAttribute('data-pictogram-row')));

    expect(units(container)).toHaveLength(12);
    expect(columns.size).toBe(4);
    expect(rows.size).toBe(3);
    expect(container.querySelector('svg')).toHaveAttribute('viewBox');
    expect(glyphs(container, 0)).toHaveLength(6);
  });

  it('should render a custom icon instead of the default glyph', () => {
    const { container } = render(
      <PictogramChart
        data={[
          {
            label: 'A',
            value: 60,
            icon: <rect data-testid="custom-icon" width={32} height={32} />
          },
          { label: 'B', value: 40 }
        ]}
        ariaLabel="Custom icons"
      />
    );

    expect(screen.getAllByTestId('custom-icon')).toHaveLength(6);
    expect(container.querySelectorAll('[data-pictogram-glyph="default"]')).toHaveLength(4);
  });

  it('should render the legend for every data item and hide it when showLegend is false', () => {
    const { rerender } = render(<PictogramChart data={data} ariaLabel="Traffic sources" />);

    expect(screen.getByRole('list', { name: 'Series' })).toBeInTheDocument();
    expect(screen.getByText('Direct')).toBeInTheDocument();
    expect(screen.getByText('Organic')).toBeInTheDocument();
    expect(screen.getByText('Referral')).toBeInTheDocument();

    rerender(<PictogramChart data={data} ariaLabel="Traffic sources" showLegend={false} />);

    expect(screen.queryByRole('list', { name: 'Series' })).not.toBeInTheDocument();
    expect(screen.queryByText('Direct')).not.toBeInTheDocument();
  });

  it('should apply valueFormatter to the glyph labels and tooltips', () => {
    render(
      <PictogramChart
        data={[{ label: 'Used', value: 100 }]}
        maxUnits={4}
        ariaLabel="Disk usage"
        valueFormatter={(value: number) => `${value}%`}
      />
    );

    expect(screen.getAllByRole('img', { name: 'Used: 100%' })).toHaveLength(4);

    fireEvent.mouseEnter(screen.getAllByRole('img', { name: 'Used: 100%' })[0]);

    expect(screen.getByText('Used: 100%')).toBeInTheDocument();
  });

  it('should show a tooltip on hover and focus of a glyph', () => {
    render(<PictogramChart data={data} ariaLabel="Traffic sources" />);

    const glyph = screen.getAllByRole('img', { name: 'Organic: 30' })[0];

    expect(screen.queryByText('Organic: 30')).not.toBeInTheDocument();

    fireEvent.mouseEnter(glyph);
    expect(screen.getByText('Organic: 30')).toBeInTheDocument();

    fireEvent.blur(glyph);
    expect(screen.queryByText('Organic: 30')).not.toBeInTheDocument();

    fireEvent.focus(glyph);
    expect(screen.getByText('Organic: 30')).toBeInTheDocument();
  });

  it('should call onItemClick with the datum and index on click and keyboard activation', () => {
    const onItemClick = jest.fn();

    render(<PictogramChart data={data} ariaLabel="Traffic sources" onItemClick={onItemClick} />);

    const glyph = screen.getAllByRole('button', { name: 'Referral: 20' })[0];

    fireEvent.click(glyph);
    expect(onItemClick).toHaveBeenCalledWith(data[2], 2);

    onItemClick.mockClear();
    fireEvent.keyDown(glyph, { key: 'Enter' });
    expect(onItemClick).toHaveBeenCalledWith(data[2], 2);

    onItemClick.mockClear();
    fireEvent.keyDown(glyph, { key: ' ' });
    expect(onItemClick).toHaveBeenCalledWith(data[2], 2);
  });

  it('should render an empty state when there is no data or every value is zero', () => {
    const { container, rerender } = render(
      <PictogramChart data={[]} ariaLabel="Empty pictogram" />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);

    rerender(
      <PictogramChart
        data={[
          { label: 'A', value: 0 },
          { label: 'B', value: 0 }
        ]}
        ariaLabel="Zero pictogram"
      />
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should render deterministically for the same input', () => {
    const { container, rerender } = render(<PictogramChart data={data} ariaLabel="Traffic" />);

    const before = signature(container);

    rerender(<PictogramChart data={data} ariaLabel="Traffic" />);

    expect(signature(container)).toBe(before);
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <PictogramChart data={data} ariaLabel="Pictogram" />
        <PictogramChart
          data={data}
          ariaLabel="Interactive pictogram"
          onItemClick={() => undefined}
        />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
