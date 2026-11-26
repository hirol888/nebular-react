import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { VisuallyHidden } from '@nebular-react/core';

const collectEmittedCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => {
      const sheetRules = style.sheet
        ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText)
        : [];

      return [style.textContent || '', ...sheetRules].join('\n');
    })
    .join('\n');

describe('VisuallyHidden', () => {
  it('VisuallyHidden_Render_ShouldRenderChildrenInASpanByDefault', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);

    const element = screen.getByText('Screen reader text');

    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveClass('nebular-visually-hidden-root');
  });

  it('VisuallyHidden_AsDiv_ShouldRenderADiv', () => {
    render(<VisuallyHidden as="div">Grouped text</VisuallyHidden>);

    expect(screen.getByText('Grouped text').tagName).toBe('DIV');
  });

  it('VisuallyHidden_Render_ShouldUseClippingInsteadOfDisplayNone', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);

    const css = collectEmittedCss();

    expect(css).toMatch(/clip-path:\s*inset\(50%\)/i);
    expect(css).not.toMatch(/display:\s*none/i);
  });

  it('VisuallyHidden_Focusable_ShouldRevealContentOnFocus', () => {
    render(
      <VisuallyHidden focusable>
        <button type="button">Skip to content</button>
      </VisuallyHidden>
    );

    const wrapper = screen.getByText('Skip to content').parentElement as HTMLElement;
    const css = collectEmittedCss();

    expect(wrapper).toHaveAttribute('data-focusable', 'true');
    expect(css).toMatch(/clip-path:\s*none/i);
    expect(css).toMatch(/white-space:\s*normal/i);
  });

  it('VisuallyHidden_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <div>
        <VisuallyHidden>Extra context for assistive technologies</VisuallyHidden>
        <VisuallyHidden as="div" focusable>
          <a href="#main">Skip navigation</a>
        </VisuallyHidden>
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
