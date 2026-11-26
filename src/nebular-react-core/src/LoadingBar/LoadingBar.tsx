import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type LoadingBarPosition = 'top' | 'inline';

interface LoadingBarStylesParams {
  height: number;
  color?: string;
  position: LoadingBarPosition;
  indeterminate: boolean;
}

const useStyles = createStyles(
  (_theme, { height, color, position, indeterminate }: LoadingBarStylesParams) => {
    const slide = keyframes({
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(350%)' }
    });

    return {
      root: {
        position: position === 'top' ? 'fixed' : 'relative',
        top: position === 'top' ? 0 : undefined,
        left: position === 'top' ? 0 : undefined,
        right: position === 'top' ? 0 : undefined,
        zIndex: position === 'top' ? 9999 : undefined,
        width: '100%',
        height: `${height}px`,
        overflow: 'hidden',
        backgroundColor: 'var(--loading-bar-track-color, transparent)',
        pointerEvents: 'none'
      },

      fill: {
        height: '100%',
        width: indeterminate ? '40%' : '100%',
        backgroundColor: color ?? 'var(--loading-bar-color, var(--color-primary-500, #3366ff))',
        borderRadius: 'var(--loading-bar-border-radius, 0 999px 999px 0)',
        transition: indeterminate ? undefined : 'width 0.2s ease',
        animation: indeterminate ? `${slide} 1.4s ease-in-out infinite` : undefined,

        '@media (prefers-reduced-motion: reduce)': {
          animationDuration: '4s'
        }
      }
    };
  }
);

export type LoadingBarStylesNames = Selectors<typeof useStyles>;

export interface LoadingBarProps
  extends DefaultProps<LoadingBarStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  loading?: boolean;
  value?: number;
  height?: number;
  color?: string;
  position?: LoadingBarPosition;
  ariaLabel?: string;
}

const defaultProps: Partial<LoadingBarProps> = {
  loading: true,
  height: 3,
  position: 'top'
};

const _LoadingBar = forwardRef<HTMLDivElement, LoadingBarProps>((props, ref) => {
  const {
    loading,
    value,
    height,
    color,
    position,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const determined = typeof value === 'number';
  const clampedValue = determined ? Math.min(100, Math.max(0, value)) : undefined;
  const { classes, cx } = useStyles(
    { height, color, position, indeterminate: !determined },
    {
      name: 'loading-bar',
      classNames,
      styles,
      unstyled
    }
  );

  if (!loading) {
    return null;
  }

  return (
    <div
      {...others}
      ref={ref}
      role="progressbar"
      aria-label={ariaLabel ?? 'Loading'}
      aria-busy="true"
      aria-valuemin={determined ? 0 : undefined}
      aria-valuemax={determined ? 100 : undefined}
      aria-valuenow={clampedValue}
      data-position={position}
      data-indeterminate={determined ? undefined : 'true'}
      className={cx(classes.root, className)}
    >
      <div
        className={cx(classes.fill)}
        style={determined ? { width: `${clampedValue}%` } : undefined}
        data-loading-bar-fill
      />
    </div>
  );
});

_LoadingBar.displayName = 'LoadingBar';

export { _LoadingBar as LoadingBar };
