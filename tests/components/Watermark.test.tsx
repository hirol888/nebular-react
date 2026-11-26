import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
// Internal unit is imported directly because the public entry point does not expose it yet.
import { Watermark } from '@nebular-react/core';

const getDecodedBackground = (overlay: HTMLElement) => {
  const image = getComputedStyle(overlay).backgroundImage;
  const match = /url\("?(data:image\/svg\+xml[^")]*)"?\)/.exec(image);

  return {
    image,
    svg: match ? decodeURIComponent(match[1]) : ''
  };
};

describe('Watermark', () => {
  it('Watermark_Render_ShouldRenderChildrenInsideTheWrapper', () => {
    const { container } = render(
      <Watermark text="Confidential">
        <p>Secret content</p>
      </Watermark>
    );

    expect(screen.getByText('Secret content')).toBeInTheDocument();

    const content = container.querySelector('[data-watermark-content]') as HTMLElement;

    expect(content).toBeInTheDocument();
    expect(getComputedStyle(content).position).toBe('relative');
  });

  it('Watermark_DefaultOptions_ShouldRenderANonInteractiveRepeatedOverlay', () => {
    const { container } = render(
      <Watermark text="Confidential">
        <p>Secret content</p>
      </Watermark>
    );

    const overlay = container.querySelector('[data-watermark-overlay]') as HTMLElement;
    const style = getComputedStyle(overlay);
    const { image, svg } = getDecodedBackground(overlay);

    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(style.position).toBe('absolute');
    expect(style.pointerEvents).toBe('none');
    expect(style.zIndex).toBe('9');
    expect(style.backgroundRepeat).toBe('repeat');
    expect(style.backgroundSize).toBe('100px 100px');
    expect(image).toContain('data:image/svg+xml');
    expect(svg).toContain('Confidential');
    expect(svg).toContain('font-size="14"');
    expect(svg).toContain('rotate(-22');
    expect(svg).toContain('rgba(0,0,0,0.15)');
  });

  it('Watermark_CustomOptions_ShouldBeAppliedToTheOverlay', () => {
    const { container } = render(
      <Watermark
        text="Draft"
        fontSize={20}
        color="#ff0000"
        opacity={0.3}
        rotate={45}
        gapX={50}
        gapY={60}
        zIndex={3}
        className="custom-watermark"
      >
        <span>Body</span>
      </Watermark>
    );

    const root = container.firstElementChild as HTMLElement;
    const overlay = container.querySelector('[data-watermark-overlay]') as HTMLElement;
    const style = getComputedStyle(overlay);
    const { svg } = getDecodedBackground(overlay);

    expect(root).toHaveClass('custom-watermark');
    expect(style.zIndex).toBe('3');
    expect(style.backgroundSize).toBe('50px 60px');
    expect(svg).toContain('font-size="20"');
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('opacity="0.3"');
    expect(svg).toContain('rotate(45');
  });

  it('Watermark_SpecialCharacters_ShouldBeEscapedInTheSvg', () => {
    const { container } = render(
      <Watermark text="A&B <C>">
        <span>Body</span>
      </Watermark>
    );

    const overlay = container.querySelector('[data-watermark-overlay]') as HTMLElement;
    const { image, svg } = getDecodedBackground(overlay);

    expect(svg).toContain('A&amp;B &lt;C&gt;');
    expect(svg).not.toContain('<C>');
    expect(image).not.toContain('<C>');
  });

  it('Watermark_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Watermark text="Confidential">
        <button type="button">Open document</button>
      </Watermark>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
