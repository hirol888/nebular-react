import { createPolymorphicComponent } from '@nebular-react/styles';
import React from 'react';

const _TabTitle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  (props, ref) => {
    const { children, ...others } = props;
    return (
      <div ref={ref} {...others}>
        {children}
      </div>
    );
  }
);

_TabTitle.displayName = 'TabTitle';

export const TabTitle = createPolymorphicComponent<'div', React.ComponentPropsWithoutRef<'div'>>(
  _TabTitle
);
