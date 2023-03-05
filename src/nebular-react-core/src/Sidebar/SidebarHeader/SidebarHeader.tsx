import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './SidebarHeader.style';

export type SidebarHeaderStylesNames = Selectors<typeof useStyles>;

export interface SidebarHeaderProps
  extends DefaultProps<SidebarHeaderStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

const _SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  (props: SidebarHeaderProps, ref) => {
    const { children, className, classNames, styles, unstyled, ...others } = props;
    const { classes, cx } = useStyles(null, {
      name: 'sidebar-header',
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

_SidebarHeader.displayName = '@nebular-react/core/SidebarHeader';

export const SidebarHeader = createPolymorphicComponent<'div', SidebarHeaderProps>(_SidebarHeader);
