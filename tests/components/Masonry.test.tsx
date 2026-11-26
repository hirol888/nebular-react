import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { axe } from 'jest-axe';
import { Masonry, computeMasonryLayout } from '@nebular-react/core';

describe('computeMasonryLayout', () => {
  it('Masonry_ComputeLayout_ShouldFillTheShortestColumn', () => {
    expect(computeMasonryLayout([80, 40, 60], 2, 10)).toEqual({
      positions: [
        { column: 0, top: 0 },
        { column: 1, top: 0 },
        { column: 1, top: 50 }
      ],
      height: 110
    });
  });

  it('Masonry_ComputeLayout_ShouldFollowRowMajorOrderForEqualHeights', () => {
    expect(computeMasonryLayout([100, 100, 100], 2, 10)).toEqual({
      positions: [
        { column: 0, top: 0 },
        { column: 1, top: 0 },
        { column: 0, top: 110 }
      ],
      height: 210
    });
  });

  it('Masonry_ComputeLayout_ShouldHandleEmptyAndInvalidInput', () => {
    expect(computeMasonryLayout([], 3, 5)).toEqual({ positions: [], height: 0 });
    expect(computeMasonryLayout([10], 0, 0)).toEqual({
      positions: [{ column: 0, top: 0 }],
      height: 10
    });
  });
});

describe('Masonry', () => {
  it('Masonry_Render_ShouldUseTheColumnFallbackWithColumnsAndGap', () => {
    const { container } = render(
      <Masonry columns={3} gap={12} ariaLabel="Gallery">
        <div>One</div>
        <div>Two</div>
        <div>Three</div>
      </Masonry>
    );

    const root = screen.getByRole('group', { name: 'Gallery' });

    expect(root).toHaveAttribute('data-masonry-layout', 'columns');
    expect(root).toHaveAttribute('data-masonry-columns', '3');
    expect(root).toHaveAttribute('data-masonry-gap', '12');
    expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(3);
    expect(screen.getByText('Two')).toBeInTheDocument();

    const columns = container.querySelector('[class*="nebular-masonry-columns"]');

    expect(columns).toHaveStyle({ columnCount: 3, columnGap: '12px' });
  });

  it('Masonry_Responsive_ShouldResolveColumnsFromMediaQueries', () => {
    const original = window.matchMedia;

    window.matchMedia = jest.fn(
      (query: string) =>
        ({
          matches: query === '(min-width: 576px)' || query === '(min-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn()
        }) as unknown as MediaQueryList
    ) as unknown as typeof window.matchMedia;

    try {
      render(
        <Masonry columns={{ base: 1, sm: 2, md: 3 }} gap={8} ariaLabel="Gallery">
          <div>One</div>
        </Masonry>
      );

      expect(screen.getByRole('group', { name: 'Gallery' })).toHaveAttribute(
        'data-masonry-columns',
        '3'
      );
    } finally {
      window.matchMedia = original;
    }
  });

  it('Masonry_Measure_ShouldSwitchToAnAbsoluteLayout', () => {
    const OriginalResizeObserver = window.ResizeObserver;
    const observers: Array<{ callback: ResizeObserverCallback }> = [];

    class FakeResizeObserver {
      callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        observers.push(this);
      }

      observe() {}

      unobserve() {}

      disconnect() {}
    }

    window.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;

    try {
      const { container } = render(
        <Masonry columns={2} gap={10} ariaLabel="Gallery">
          <div>One</div>
          <div>Two</div>
          <div>Three</div>
        </Masonry>
      );

      const items = Array.from(container.querySelectorAll<HTMLElement>('[data-masonry-item]'));

      [80, 40, 60].forEach((height, index) => {
        Object.defineProperty(items[index], 'offsetHeight', { configurable: true, value: height });
      });

      act(() => {
        observers.forEach((observer) =>
          observer.callback([], observer as unknown as ResizeObserver)
        );
      });

      expect(screen.getByRole('group', { name: 'Gallery' })).toHaveAttribute(
        'data-masonry-layout',
        'absolute'
      );
      expect(items[2]).toHaveAttribute('data-masonry-column', '1');
      expect(items[2]).toHaveStyle({ top: '50px' });
      expect(container.querySelector('[class*="nebular-masonry-canvas"]')).toHaveStyle({
        height: '110px'
      });
    } finally {
      window.ResizeObserver = OriginalResizeObserver;
    }
  });

  it('Masonry_SSR_ShouldRenderTheColumnFallbackWithoutWindow', () => {
    const originalWindow = globalThis.window;

    delete (globalThis as unknown as Record<string, unknown>).window;

    try {
      const html = renderToStaticMarkup(
        <Masonry columns={2} gap={8} ariaLabel="Gallery">
          <span>One</span>
          <span>Two</span>
        </Masonry>
      );

      expect(html).toContain('data-masonry-layout="columns"');
      expect(html).toContain('data-masonry-columns="2"');
      expect(html).toContain('One');
      expect(html).toContain('Two');
    } finally {
      (globalThis as unknown as Record<string, unknown>).window = originalWindow;
    }
  });

  it('Masonry_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Masonry columns={2} gap={8} ariaLabel="Gallery">
        <div>One</div>
        <div>Two</div>
      </Masonry>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
