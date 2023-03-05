import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './LayoutColumn.style';

export type LayoutColumnStylesNames = Selectors<typeof useStyles>;

export interface LayoutColumnProps
  extends DefaultProps<LayoutColumnStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  left?: boolean;
  start?: boolean;
  children?: React.ReactNode;
}

const _LayoutColumn = React.forwardRef<HTMLDivElement, LayoutColumnProps>(
  (props: LayoutColumnProps, ref) => {
    const { left, start, children, className, classNames, styles, unstyled, ...others } = props;
    const _start = left ? false : start;
    const _left = start ? false : left;
    const { classes, cx } = useStyles(null, {
      name: 'layout-column',
      classNames,
      styles,
      unstyled
    });

    return (
      <div
        className={cx(classes.root, className, {
          [classes.left]: _left,
          [classes.start]: _start
        })}
        ref={ref}
        {...others}
      >
        {children}
      </div>
    );
  }
);

_LayoutColumn.displayName = '@nebular-react/core/LayoutColumn';

export const LayoutColumn = createPolymorphicComponent<'div', LayoutColumnProps>(_LayoutColumn);
