import React, { Children, forwardRef, isValidElement } from 'react';
import {
  DefaultProps,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import { TabTitle } from './TabTitle';

export interface TabProps extends DefaultProps, React.ComponentPropsWithoutRef<'div'> {
  title?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  responsive?: boolean;
  /** Shows a close affordance. Provide `onTabClose` on the Tabset to handle it. */
  closable?: boolean;
  children?: React.ReactNode;
}

const defaultProps: Partial<TabProps> = {};

const _Tab = forwardRef<HTMLDivElement, TabProps>((props, ref) => {
  const {
    children,
    closable: _closable,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const tabContent = Children.toArray(children).filter(
    (child) => !(isValidElement(child) && child.type === TabTitle)
  );

  return (
    <div ref={ref} {...others}>
      {tabContent}
    </div>
  );
});

_Tab.displayName = 'Tab';

export const Tab = createPolymorphicComponent<'div', TabProps>(_Tab);
