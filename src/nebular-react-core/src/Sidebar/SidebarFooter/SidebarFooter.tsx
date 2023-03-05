import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './SidebarFooter.style';

export type SidebarFooterStylesNames = Selectors<typeof useStyles>;

export interface SidebarFooterProps
  extends DefaultProps<SidebarFooterStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

const _SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  (props: SidebarFooterProps, ref) => {
    const { children, className, classNames, styles, unstyled, ...others } = props;
    const { classes, cx } = useStyles(null, {
      name: 'sidebar-footer',
      classNames,
      styles,
      unstyled
    });

    return (
      <div className={cx(classes.root, className)} ref={ref} {...others}>
        {children}
      </div>
    );
  }
);

_SidebarFooter.displayName = '@nebular-react/core/SidebarFooter';

export const SidebarFooter = createPolymorphicComponent<'div', SidebarFooterProps>(_SidebarFooter);
