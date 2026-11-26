import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AspectRatio } from '@nebular-react/core';

describe('AspectRatio', () => {
  it('applies the ratio and fills the available width', () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <span>Video</span>
      </AspectRatio>
    );

    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue('aspect-ratio')).toBe(String(16 / 9));
    expect(root.style.getPropertyValue('width')).toBe('100%');
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('defaults to a square ratio', () => {
    const { container } = render(
      <AspectRatio>
        <span>Square</span>
      </AspectRatio>
    );

    const root = container.firstElementChild as HTMLElement;

    expect(root.style.getPropertyValue('aspect-ratio')).toBe('1');
  });

  it('forwards className and style', () => {
    const { container } = render(
      <AspectRatio className="custom-ratio" style={{ maxWidth: 320 }}>
        <span>Box</span>
      </AspectRatio>
    );

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass('custom-ratio');
    expect(root.style.maxWidth).toBe('320px');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AspectRatio ratio={1}>
        <span>Square</span>
      </AspectRatio>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
