import React from 'react';
import { DefaultProps, Selectors, createPolymorphicComponent } from '@nebular-react/styles';
import useStyles from './LayoutFooter.style';

export type LayoutFooterStylesNames = Selectors<typeof useStyles>;

export interface LayoutFooterProps
  extends DefaultProps<LayoutFooterStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  fixed?: boolean;
  children?: React.ReactNode;
}

const _LayoutFooter = React.forwardRef<HTMLDivElement, LayoutFooterProps>(
  (props: LayoutFooterProps, ref) => {
    const { fixed, children, className, classNames, styles, unstyled, ...others } = props;
    const { classes, cx } = useStyles(null, {
      name: 'layout-footer',
      classNames,
      styles,
      unstyled
    });

    return (
      <div
        className={cx(classes.root, { [classes.fixed]: fixed }, className)}
        ref={ref}
        {...others}
      >
        <nav className={cx(classes.nav)}>{children}</nav>
      </div>
    );
  }
);

_LayoutFooter.displayName = 'LayoutFooter';

export const LayoutFooter = createPolymorphicComponent<'div', LayoutFooterProps>(_LayoutFooter);
