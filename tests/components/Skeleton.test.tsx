import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Skeleton } from '@nebular-react/core';

describe('Skeleton', () => {
  it('renders a hidden placeholder', () => {
    const { container } = render(<Skeleton height={20} width="50%" />);

    const skeleton = container.firstElementChild as HTMLElement;
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveStyle({ height: '20px', width: '50%' });
  });

  it('renders children when not visible', () => {
    render(
      <Skeleton visible={false}>
        <span>Loaded content</span>
      </Skeleton>
    );

    expect(screen.getByText('Loaded content')).toBeInTheDocument();
  });

  it('keeps the skeleton when visible even with children', () => {
    const { container } = render(
      <Skeleton visible>
        <span>Hidden content</span>
      </Skeleton>
    );

    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Skeleton height={20} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
