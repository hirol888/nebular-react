import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface ScrollAreaProps
  extends DefaultProps<ScrollAreaStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  maxHeight?: number | string;
  maxWidth?: number | string;
  offsetScrollbars?: boolean;
  scrollbarSize?: number | string;
  type?: 'auto' | 'always' | 'hover';
  children?: React.ReactNode;
}

const useStyles = createStyles(
  (
    theme,
    {
      maxHeight,
      maxWidth,
      offsetScrollbars,
      scrollbarSize
    }: {
      maxHeight?: number | string;
      maxWidth?: number | string;
      offsetScrollbars: boolean;
      scrollbarSize: number | string;
    }
  ) => ({
    root: {
      maxHeight,
      maxWidth,
      overflow: 'auto',
      paddingRight: offsetScrollbars ? scrollbarSize : undefined,
      ...theme.fns.scrollbars(
        'var(--scroll-area-thumb-color, var(--border-basic-color-4, #c5cee0))',
        'var(--scroll-area-track-color, transparent)',
        scrollbarSize
      )
    }
  })
);

export type ScrollAreaStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<ScrollAreaProps> = {
  offsetScrollbars: false,
  scrollbarSize: 8,
  type: 'auto'
};

const _ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>((props, ref) => {
  const {
    maxHeight,
    maxWidth,
    offsetScrollbars,
    scrollbarSize,
    type,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { maxHeight, maxWidth, offsetScrollbars: !!offsetScrollbars, scrollbarSize },
    { name: 'scroll-area', classNames, styles, unstyled }
  );

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)} data-scroll-area-type={type}>
      {children}
    </div>
  );
});

_ScrollArea.displayName = 'ScrollArea';

export { _ScrollArea as ScrollArea };
