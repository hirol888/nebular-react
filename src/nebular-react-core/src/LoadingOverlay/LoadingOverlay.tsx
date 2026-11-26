import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  keyframes,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface LoadingOverlayProps
  extends DefaultProps<LoadingOverlayStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  visible: boolean;
  message?: React.ReactNode;
  zIndex?: number;
  blur?: number;
  opacity?: number;
  children?: React.ReactNode;
}

const useStyles = createStyles(
  (_theme, { zIndex, blur, opacity }: { zIndex: number; blur: number; opacity: number }) => {
    const spin = keyframes({
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    });

    return {
      root: {
        position: 'relative',
        minHeight: '4rem'
      },

      overlay: {
        position: 'absolute',
        inset: 0,
        zIndex,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1rem',
        backgroundColor: `var(--loading-overlay-background-color, rgba(255, 255, 255, ${opacity}))`,
        backdropFilter: blur ? `blur(${blur}px)` : undefined,
        borderRadius: 'inherit'
      },

      spinner: {
        width: '2rem',
        height: '2rem',
        border:
          '2px solid var(--loading-overlay-spinner-track-color, var(--border-basic-color-3, #e4e9f2))',
        borderTopColor: 'var(--loading-overlay-spinner-color, var(--color-primary-500, #3366ff))',
        borderRadius: '50%',
        animation: `${spin} 0.8s linear infinite`
      },

      message: {
        color: 'var(--loading-overlay-message-color, var(--text-hint-color, #8f9bb3))',
        fontFamily: 'inherit',
        fontSize: 'var(--loading-overlay-message-font-size, 0.8125rem)'
      }
    };
  }
);

export type LoadingOverlayStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<LoadingOverlayProps> = {
  zIndex: 400,
  blur: 2,
  opacity: 0.75
};

const _LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>((props, ref) => {
  const {
    visible,
    message,
    zIndex,
    blur,
    opacity,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { zIndex, blur, opacity },
    { name: 'loading-overlay', classNames, styles, unstyled }
  );

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      aria-busy={visible || undefined}
    >
      {children}
      {visible && (
        <div className={cx(classes.overlay)} role="status" aria-live="polite">
          <span className={cx(classes.spinner)} aria-hidden="true" />
          {message && <span className={cx(classes.message)}>{message}</span>}
        </div>
      )}
    </div>
  );
});

_LoadingOverlay.displayName = 'LoadingOverlay';

export { _LoadingOverlay as LoadingOverlay };
