import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

const useStyles = createStyles(() => ({
  root: {
    position: 'relative',
    overflow: 'hidden'
  }
}));

export type AspectRatioStylesNames = Selectors<typeof useStyles>;

export interface AspectRatioProps
  extends
    DefaultProps<AspectRatioStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  children: React.ReactNode;
  ratio?: number;
}

const defaultProps: Partial<AspectRatioProps> = {
  ratio: 1
};

const _AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>((props, ref) => {
  const { children, ratio, className, classNames, styles, unstyled, style, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'aspect-ratio',
    classNames,
    styles,
    unstyled
  });

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      style={{ aspectRatio: ratio, width: '100%', ...style }}
    >
      {children}
    </div>
  );
});

_AspectRatio.displayName = 'AspectRatio';

export { _AspectRatio as AspectRatio };
