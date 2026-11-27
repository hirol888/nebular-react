import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { InfiniteScroll } from '@nebular-react/core';

interface ObserverInstance {
  callback: IntersectionObserverCallback;
  observe: jest.Mock;
  unobserve: jest.Mock;
  disconnect: jest.Mock;
}

const globalWindow = window as unknown as { IntersectionObserver?: unknown };
let observers: ObserverInstance[] = [];

function triggerIntersection(isIntersecting: boolean) {
  act(() => {
    observers.forEach((observer) => {
      observer.callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        observer as unknown as IntersectionObserver
      );
    });
  });
}

describe('InfiniteScroll', () => {
  beforeEach(() => {
    observers = [];
    globalWindow.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      const observer: ObserverInstance = {
        callback,
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
      };

      observers.push(observer);

      return observer;
    });
  });

  afterEach(() => {
    delete globalWindow.IntersectionObserver;
    jest.restoreAllMocks();
  });

  it('InfiniteScroll_Render_ShouldExposeFeedRoleAndRenderChildren', () => {
    render(
      <InfiniteScroll loadMore={jest.fn()} hasMore>
        <div>First item</div>
        <div>Second item</div>
      </InfiniteScroll>
    );

    const feed = screen.getByRole('feed', { name: 'Infinite scroll' });

    expect(feed).toBeInTheDocument();
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(observers).toHaveLength(1);
    expect(observers[0].observe).toHaveBeenCalledTimes(1);
  });

  it('InfiniteScroll_Intersection_ShouldCallLoadMoreOnce', () => {
    const loadMore = jest.fn();

    render(<InfiniteScroll loadMore={loadMore} hasMore />);

    triggerIntersection(true);

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('InfiniteScroll_NotIntersecting_ShouldNotCallLoadMore', () => {
    const loadMore = jest.fn();

    render(<InfiniteScroll loadMore={loadMore} hasMore />);

    triggerIntersection(false);

    expect(loadMore).not.toHaveBeenCalled();
  });

  it('InfiniteScroll_PendingLoad_ShouldRenderLoaderAndBlockConcurrentCalls', async () => {
    let resolveLoad: () => void = () => {};
    const loadMore = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        })
    );

    render(<InfiniteScroll loadMore={loadMore} hasMore loader={<span>Fetching more</span>} />);

    triggerIntersection(true);
    triggerIntersection(true);

    expect(loadMore).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Fetching more')).toBeInTheDocument();
    expect(screen.getByRole('feed')).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveLoad();
      await Promise.resolve();
    });

    await waitFor(() => expect(screen.queryByText('Fetching more')).not.toBeInTheDocument());
    expect(screen.getByRole('feed')).not.toHaveAttribute('aria-busy');

    triggerIntersection(true);
    expect(loadMore).toHaveBeenCalledTimes(2);
  });

  it('InfiniteScroll_DefaultLoader_ShouldRenderSpinnerWhilePending', async () => {
    let resolveLoad: () => void = () => {};
    const loadMore = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        })
    );

    const { container } = render(<InfiniteScroll loadMore={loadMore} hasMore />);

    triggerIntersection(true);

    await waitFor(() =>
      expect(container.querySelector('[class*="nebular-loader-spinCircle"]')).toBeInTheDocument()
    );

    await act(async () => {
      resolveLoad();
      await Promise.resolve();
    });
  });

  it('InfiniteScroll_HasMoreFalse_ShouldRenderEndMessageWithoutObserver', () => {
    const loadMore = jest.fn();

    render(<InfiniteScroll loadMore={loadMore} hasMore={false} />);

    expect(screen.getByText('No more items')).toBeInTheDocument();
    expect(observers).toHaveLength(0);

    triggerIntersection(true);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it('InfiniteScroll_HasMoreFalse_ShouldRenderCustomEndMessage', () => {
    render(<InfiniteScroll loadMore={jest.fn()} hasMore={false} endMessage="That is all" />);

    expect(screen.getByText('That is all')).toBeInTheDocument();
    expect(screen.queryByText('No more items')).not.toBeInTheDocument();
  });

  it('InfiniteScroll_Disabled_ShouldSkipObserverAndLoadMore', () => {
    const loadMore = jest.fn();

    render(<InfiniteScroll loadMore={loadMore} hasMore disabled />);

    expect(observers).toHaveLength(0);

    triggerIntersection(true);
    expect(loadMore).not.toHaveBeenCalled();
  });

  it('InfiniteScroll_FallbackScroll_ShouldLoadOnlyNearTheBottom', () => {
    delete globalWindow.IntersectionObserver;

    const loadMore = jest.fn();

    render(
      <InfiniteScroll loadMore={loadMore} hasMore threshold={200}>
        <div>Item</div>
      </InfiniteScroll>
    );

    const feed = screen.getByRole('feed');

    Object.defineProperty(feed, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(feed, 'clientHeight', { configurable: true, value: 400 });
    Object.defineProperty(feed, 'scrollTop', { configurable: true, value: 100, writable: true });

    fireEvent.scroll(feed);
    expect(loadMore).not.toHaveBeenCalled();

    feed.scrollTop = 500;
    fireEvent.scroll(feed);

    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it('InfiniteScroll_AriaLabel_ShouldBeConfigurable', () => {
    render(
      <InfiniteScroll loadMore={jest.fn()} hasMore ariaLabel="Activity feed">
        <div>Item</div>
      </InfiniteScroll>
    );

    expect(screen.getByRole('feed', { name: 'Activity feed' })).toBeInTheDocument();
  });

  it('InfiniteScroll_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <InfiniteScroll loadMore={jest.fn()} hasMore>
        <article>First item</article>
        <article>Second item</article>
      </InfiniteScroll>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('InfiniteScroll_AccessibilityAtEnd_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <InfiniteScroll loadMore={jest.fn()} hasMore={false}>
        <article>First item</article>
      </InfiniteScroll>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('InfiniteScroll_AccessibilityWhileLoading_ShouldHaveNoViolations', async () => {
    const loadMore = jest.fn(() => new Promise<void>(() => {}));
    const { container } = render(
      <InfiniteScroll loadMore={loadMore} hasMore>
        <article>First item</article>
      </InfiniteScroll>
    );

    triggerIntersection(true);

    await waitFor(() =>
      expect(container.querySelector('[class*="nebular-loader-spinCircle"]')).toBeInTheDocument()
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
