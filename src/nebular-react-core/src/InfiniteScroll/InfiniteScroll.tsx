import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { Loader } from '../Loader';
import { VisuallyHidden } from '../VisuallyHidden';

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },

  sentinel: {
    width: '100%',
    height: 1
  },

  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0'
  },

  loaderContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '2rem',
    minHeight: '2rem'
  },

  endMessage: {
    padding: '0.75rem 0',
    textAlign: 'center',
    color: 'var(--infinite-scroll-end-message-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--infinite-scroll-end-message-font-size, 0.8125rem)'
  }
}));

export type InfiniteScrollStylesNames = Selectors<typeof useStyles>;

export interface InfiniteScrollProps extends DefaultProps<InfiniteScrollStylesNames> {
  children?: React.ReactNode;
  loadMore(): void | Promise<void>;
  hasMore: boolean;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const defaultProps: Partial<InfiniteScrollProps> = {
  endMessage: 'No more items',
  threshold: 200,
  rootMargin: '0px',
  disabled: false,
  ariaLabel: 'Infinite scroll'
};

const _InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps>((props, ref) => {
  const {
    children,
    loadMore,
    hasMore,
    loader,
    endMessage,
    threshold,
    rootMargin,
    disabled,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, {
    name: 'infinite-scroll',
    classNames,
    styles,
    unstyled
  });
  const [isLoading, setIsLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loaderContainerRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef(false);
  const stateRef = useRef({ disabled, hasMore, loadMore });
  const mergedRef = useMergedRef(ref, rootRef);

  stateRef.current = { disabled, hasMore, loadMore };

  const stopLoading = useCallback(() => {
    pendingRef.current = false;
    setIsLoading(false);
  }, []);

  const triggerLoadMore = useCallback(() => {
    const state = stateRef.current;

    if (state.disabled || !state.hasMore || pendingRef.current) {
      return;
    }

    pendingRef.current = true;
    setIsLoading(true);

    const result = state.loadMore();

    if (result && typeof (result as Promise<void>).then === 'function') {
      Promise.resolve(result).then(stopLoading, stopLoading);
    } else {
      stopLoading();
    }
  }, [stopLoading]);

  useEffect(() => {
    if (disabled || !hasMore) {
      return undefined;
    }

    const root = rootRef.current;
    const sentinel = sentinelRef.current;

    if (!root || !sentinel) {
      return undefined;
    }

    const Observer = typeof window !== 'undefined' ? window.IntersectionObserver : undefined;

    if (typeof Observer === 'function') {
      const observer = new Observer(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            triggerLoadMore();
          }
        },
        { rootMargin }
      );

      observer.observe(sentinel);

      return () => observer.disconnect();
    }

    // Fallback for environments without IntersectionObserver: watch the scroll
    // position of the component container, or of the window when the container
    // itself is not scrollable.
    const measureDistance = () => {
      if (root.scrollHeight > root.clientHeight) {
        return root.scrollHeight - root.scrollTop - root.clientHeight;
      }

      return (
        (document.documentElement?.scrollHeight ?? 0) -
        (window.scrollY ?? 0) -
        (window.innerHeight ?? 0)
      );
    };

    const handleRootScroll = () => {
      if (root.scrollHeight > root.clientHeight && measureDistance() <= threshold) {
        triggerLoadMore();
      }
    };

    const handleWindowScroll = (event: Event) => {
      const target = event.target as Node | null;

      // Scrolls coming from the component container are handled by its own
      // listener, and nested scrollable children cannot be measured reliably.
      if (target && (target === root || root.contains(target))) {
        return;
      }

      if (measureDistance() <= threshold) {
        triggerLoadMore();
      }
    };

    root.addEventListener('scroll', handleRootScroll, { passive: true });
    window.addEventListener('scroll', handleWindowScroll, true);

    return () => {
      root.removeEventListener('scroll', handleRootScroll);
      window.removeEventListener('scroll', handleWindowScroll, true);
    };
  }, [disabled, hasMore, rootMargin, threshold, triggerLoadMore]);

  const defaultLoader = (
    <div ref={loaderContainerRef} className={cx(classes.loaderContainer)}>
      <Loader
        isLoading
        loaderContainerRef={loaderContainerRef as unknown as React.RefObject<HTMLElement>}
      />
      <VisuallyHidden>Loading more items</VisuallyHidden>
    </div>
  );

  return (
    <div
      ref={mergedRef}
      className={cx(classes.root, className)}
      role="feed"
      aria-label={ariaLabel}
      aria-busy={isLoading || undefined}
    >
      {children}
      <div ref={sentinelRef} className={cx(classes.sentinel)} aria-hidden="true" />
      {isLoading && <div className={cx(classes.loader)}>{loader ?? defaultLoader}</div>}
      {!hasMore && <div className={cx(classes.endMessage)}>{endMessage}</div>}
    </div>
  );
});

_InfiniteScroll.displayName = 'InfiniteScroll';

export { _InfiniteScroll as InfiniteScroll };
