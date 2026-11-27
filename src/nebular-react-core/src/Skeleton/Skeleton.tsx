import React, { forwardRef } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import useStyles, { SkeletonStylesParams } from './Skeleton.style';

export type SkeletonStylesNames = Selectors<typeof useStyles>;

export interface SkeletonProps
  extends
    DefaultProps<SkeletonStylesNames, SkeletonStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  circle?: boolean;
  radius?: React.CSSProperties['borderRadius'];
  animate?: boolean;
  visible?: boolean;
  children?: React.ReactNode;
}

const defaultProps: Partial<SkeletonProps> = {
  circle: false,
  animate: true,
  visible: false
};

const _Skeleton = forwardRef<HTMLDivElement, SkeletonProps>((props, ref) => {
  const {
    width,
    height,
    circle,
    radius,
    animate,
    visible,
    children,
    className,
    classNames,
    styles,
    unstyled,
    style,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { circle, animate, radius },
    { name: 'skeleton', classNames, styles, unstyled }
  );

  if (children && !visible) {
    return <>{children}</>;
  }

  return (
    <div
      {...others}
      ref={ref}
      aria-hidden="true"
      className={cx(classes.root, className)}
      style={{ width, height, ...style }}
    />
  );
});

_Skeleton.displayName = 'Skeleton';

export { _Skeleton as Skeleton };
