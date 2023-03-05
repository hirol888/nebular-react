import React, { Children, forwardRef, isValidElement } from 'react';
import { DefaultProps, useComponentDefaultProps } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { TabTitle } from './TabTitle';

export interface TabProps extends DefaultProps, React.ComponentPropsWithoutRef<'div'> {
  title?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  responsive?: boolean;
  children?: React.ReactNode;
}

const defaultProps: Partial<TabProps> = {};

const _Tab = forwardRef<HTMLDivElement, TabProps>((props, ref) => {
  const { children, ...others } = useComponentDefaultProps(defaultProps, props);
  const tabContent = Children.toArray(children).filter(
    (child) => !(isValidElement(child) && child.type === TabTitle)
  );

  return (
    <div ref={ref} {...others}>
      {tabContent}
    </div>
  );
});

_Tab.displayName = '@nebular-react/core/Tab';

export const Tab = createPolymorphicComponent<'div', TabProps>(_Tab);
