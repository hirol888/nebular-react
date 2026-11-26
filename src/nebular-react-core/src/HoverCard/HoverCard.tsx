import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface HoverCardProps
  extends
    DefaultProps<HoverCardStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'content'> {
  children: React.ReactNode;
  content: React.ReactNode;
  width?: number | string;
  openDelay?: number;
  closeDelay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  ariaLabel?: string;
}

const useStyles = createStyles(
  (
    _theme,
    { width, position }: { width: number | string; position: 'top' | 'bottom' | 'left' | 'right' }
  ) => {
    const resolvedWidth = typeof width === 'number' ? `${width}px` : width;
    const positionStyles: Record<string, string | number> = {};

    if (position === 'top') {
      positionStyles.bottom = 'calc(100% + 0.5rem)';
      positionStyles.left = '50%';
      positionStyles.transform = 'translateX(-50%)';
    }
    if (position === 'bottom') {
      positionStyles.top = 'calc(100% + 0.5rem)';
      positionStyles.left = '50%';
      positionStyles.transform = 'translateX(-50%)';
    }
    if (position === 'left') {
      positionStyles.right = 'calc(100% + 0.5rem)';
      positionStyles.top = '50%';
      positionStyles.transform = 'translateY(-50%)';
    }
    if (position === 'right') {
      positionStyles.left = 'calc(100% + 0.5rem)';
      positionStyles.top = '50%';
      positionStyles.transform = 'translateY(-50%)';
    }

    return {
      root: {
        position: 'relative',
        display: 'inline-flex'
      },

      card: {
        position: 'absolute',
        zIndex: 1000,
        width: resolvedWidth,
        padding: 'var(--hover-card-padding, 0.75rem)',
        borderRadius: 'var(--hover-card-border-radius, 0.5rem)',
        backgroundColor:
          'var(--hover-card-background-color, var(--background-basic-color-1, #ffffff))',
        color: 'var(--hover-card-text-color, var(--text-basic-color, #222b45))',
        boxShadow: 'var(--hover-card-shadow, 0 8px 24px rgba(0, 0, 0, 0.18))',
        fontSize: 'var(--hover-card-font-size, 0.8125rem)',
        lineHeight: 1.5,
        ...positionStyles
      }
    };
  }
);

export type HoverCardStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<HoverCardProps> = {
  width: 260,
  openDelay: 150,
  closeDelay: 150,
  position: 'bottom',
  ariaLabel: 'Hover card'
};

const _HoverCard = forwardRef<HTMLDivElement, HoverCardProps>((props, ref) => {
  const {
    children,
    content,
    width,
    openDelay,
    closeDelay,
    position,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { width, position },
    { name: 'hover-card', classNames, styles, unstyled }
  );
  const [opened, setOpened] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    []
  );

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const open = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpened(true), openDelay);
  };

  const close = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpened(false), closeDelay);
  };

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {opened && (
        <div
          className={cx(classes.card)}
          role="dialog"
          aria-label={ariaLabel}
          onMouseEnter={clearTimers}
          onMouseLeave={close}
        >
          {content}
        </div>
      )}
    </div>
  );
});

_HoverCard.displayName = 'HoverCard';

export { _HoverCard as HoverCard };
