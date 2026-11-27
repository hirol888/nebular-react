import React from 'react';
import { DefaultProps, Selectors, createPolymorphicComponent } from '@nebular-react/styles';
import useStyles from './LayoutHeader.style';

export type LayoutHeaderStylesNames = Selectors<typeof useStyles>;

export interface LayoutHeaderProps
  extends DefaultProps<LayoutHeaderStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  fixed?: boolean;
  subheader?: boolean;
  children?: React.ReactNode;
}

const _LayoutHeader = React.forwardRef<HTMLDivElement, LayoutHeaderProps>(
  (props: LayoutHeaderProps, ref) => {
    const { fixed, subheader, children, className, classNames, styles, unstyled, ...others } =
      props;
    const _fixed = subheader ? false : fixed;
    const { classes, cx } = useStyles(null, {
      name: 'layout-header',
      classNames,
      styles,
      unstyled
    });

    return (
      <div
        className={cx(classes.root, className, {
          [classes.fixed]: _fixed
        })}
        ref={ref}
        {...others}
      >
        <nav className={cx(classes.nav)}>{children}</nav>
      </div>
    );
  }
);

_LayoutHeader.displayName = 'LayoutHeader';

export const LayoutHeader = createPolymorphicComponent<'div', LayoutHeaderProps>(_LayoutHeader);
