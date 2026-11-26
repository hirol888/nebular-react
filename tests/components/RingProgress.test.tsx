import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { RingProgress } from '@nebular-react/core';

describe('RingProgress', () => {
  it('exposes single progress as a progressbar', () => {
    render(<RingProgress value={65} ariaLabel="Storage used" label="65%" />);

    const progress = screen.getByRole('progressbar', { name: 'Storage used' });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '65');
    expect(screen.getByText('65%')).toHaveAttribute('aria-hidden', 'true');
  });

  it('clamps values to the 0-100 range and handles invalid numbers', () => {
    const { rerender } = render(<RingProgress value={140} ariaLabel="High" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<RingProgress value={-10} ariaLabel="Low" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    rerender(<RingProgress value={Number.NaN} ariaLabel="Invalid" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders weighted sections without exposing a progressbar role', () => {
    const { container } = render(
      <RingProgress
        ariaLabel="Workspace usage"
        sections={[
          { value: 40, color: 'red' },
          { value: 35, color: 'green' },
          { value: 25, color: 'blue' }
        ]}
      />
    );

    expect(screen.getByRole('img', { name: 'Workspace usage' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    const circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(4);
    expect(circles[1]).toHaveAttribute('stroke', 'red');
    expect(circles[2]).toHaveAttribute('stroke', 'green');
    expect(circles[3]).toHaveAttribute('stroke', 'blue');
  });

  it('skips zero-weight sections and supports round caps', () => {
    const { container } = render(
      <RingProgress
        ariaLabel="Sections"
        roundCaps
        sections={[
          { value: 0, color: 'red' },
          { value: 10, color: 'green' },
          { value: 0, color: 'blue' }
        ]}
      />
    );

    const sections = container.querySelectorAll('circle');
    expect(sections).toHaveLength(2);
    expect(sections[1]).toHaveAttribute('stroke-linecap', 'round');
  });

  it('applies size and thickness to the generated svg', () => {
    const { container } = render(
      <RingProgress value={50} size={80} thickness={8} ariaLabel="Sized" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '80');

    const circles = container.querySelectorAll('circle');
    expect(circles[0]).toHaveAttribute('stroke-width', '8');
  });

  it('renders with no value as an empty track', () => {
    const { container } = render(<RingProgress ariaLabel="Empty" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RingProgress value={72} label="72%" ariaLabel="Storage used" status="success" roundCaps />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
