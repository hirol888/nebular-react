import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface OverlayStylesParams {
  opacity: number;
  color: string;
  blur: number;
  zIndex: number;
  fixed: boolean;
  center: boolean;
}

const useStyles = createStyles(
  (_theme, { opacity, color, blur, zIndex, fixed, center }: OverlayStylesParams) => ({
    root: {
      position: fixed ? 'fixed' : 'absolute',
      inset: 0,
      zIndex,
      display: center ? 'flex' : 'block',
      alignItems: center ? 'center' : undefined,
      justifyContent: center ? 'center' : undefined,
      backgroundColor: color,
      opacity,
      backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
      WebkitBackdropFilter: blur > 0 ? `blur(${blur}px)` : undefined
    }
  })
);

export type OverlayStylesNames = Selectors<typeof useStyles>;

export interface OverlayProps
  extends
    DefaultProps<OverlayStylesNames, OverlayStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  opacity?: number;
  color?: string;
  blur?: number;
  zIndex?: number;
  fixed?: boolean;
  center?: boolean;
  ariaLabel?: string;
}

const defaultProps: Partial<OverlayProps> = {
  opacity: 0.6,
  color: '#000',
  blur: 0,
  zIndex: 200,
  fixed: true,
  center: false
};

const _Overlay = forwardRef<HTMLDivElement, OverlayProps>((props, ref) => {
  const {
    opacity,
    color,
    blur,
    zIndex,
    fixed,
    center,
    ariaLabel,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { opacity, color, blur, zIndex, fixed, center },
    { name: 'overlay', classNames, styles, unstyled }
  );
  const hideFromAssistiveTech = !children && !ariaLabel;

  return (
    <div
      {...others}
      ref={ref}
      role={ariaLabel ? 'group' : undefined}
      aria-hidden={hideFromAssistiveTech ? 'true' : undefined}
      aria-label={ariaLabel}
      data-fixed={fixed ? 'true' : undefined}
      data-center={center ? 'true' : undefined}
      className={cx(classes.root, className)}
    >
      {children}
    </div>
  );
});

_Overlay.displayName = 'Overlay';

export { _Overlay as Overlay };
