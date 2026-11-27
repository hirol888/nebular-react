import React, { forwardRef, useEffect, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type BackTopPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';

interface BackTopStylesParams {
  position: BackTopPosition;
}

const OFFSET = 24;

const useStyles = createStyles((_theme, { position }: BackTopStylesParams) => {
  const [vertical, horizontal] = position.split('-');

  return {
    root: {
      position: 'fixed',
      zIndex: 1000,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      padding: 0,
      border: 'none',
      borderRadius: 'var(--back-top-border-radius, 999px)',
      cursor: 'pointer',
      font: 'inherit',
      backgroundColor: 'var(--back-top-background-color, #ffffff)',
      color: 'var(--back-top-text-color, #222b45)',
      boxShadow: 'var(--back-top-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.18))',
      ...(vertical === 'top' ? { top: OFFSET } : { bottom: OFFSET }),
      ...(horizontal === 'start' ? { insetInlineStart: OFFSET } : { insetInlineEnd: OFFSET })
    }
  };
});

export type BackTopStylesNames = Selectors<typeof useStyles>;

export interface BackTopProps extends DefaultProps<BackTopStylesNames> {
  /** Scroll distance (in pixels) after which the button becomes visible. */
  visibilityHeight?: number;
  /** Returns the scrollable container. Defaults to the window. */
  target?: () => HTMLElement | Window;
  onClick?(): void;
  ariaLabel?: string;
  position?: BackTopPosition;
  /** Uses smooth scrolling when moving back to the top. */
  smooth?: boolean;
  children?: React.ReactNode;
}

const defaultProps: Partial<BackTopProps> = {
  visibilityHeight: 400,
  ariaLabel: 'Back to top',
  position: 'bottom-end',
  smooth: true
};

function isWindow(value: HTMLElement | Window): value is Window {
  return typeof window !== 'undefined' && value === window;
}

function getScrollTop(target: HTMLElement | Window): number {
  if (isWindow(target)) {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  return target.scrollTop;
}

const _BackTop = forwardRef<HTMLButtonElement, BackTopProps>((props, ref) => {
  const {
    visibilityHeight,
    target,
    onClick,
    ariaLabel,
    position,
    smooth,
    children,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { position },
    { name: 'back-top', classNames, styles, unstyled }
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = target ? target() : window;

    const update = () => {
      setVisible(getScrollTop(element) >= visibilityHeight);
    };

    update();
    element.addEventListener('scroll', update, { passive: true });

    return () => element.removeEventListener('scroll', update);
  }, [target, visibilityHeight]);

  const handleClick = () => {
    onClick?.();

    const element = target ? target() : window;
    const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';

    if (isWindow(element)) {
      window.scrollTo({ top: 0, behavior });
    } else if (typeof element.scrollTo === 'function') {
      element.scrollTo({ top: 0, behavior });
    } else {
      element.scrollTop = 0;
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cx(classes.root, className)}
      onClick={handleClick}
      aria-label={ariaLabel}
      data-position={position}
      data-back-top
    >
      {children ?? <span aria-hidden="true">↑</span>}
    </button>
  );
});

_BackTop.displayName = 'BackTop';

export { _BackTop as BackTop };
