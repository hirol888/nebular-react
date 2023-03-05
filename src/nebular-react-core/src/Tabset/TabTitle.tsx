import { createPolymorphicComponent } from '@mantine/utils';
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

_TabTitle.displayName = '@nebular-react/core/TabTitle';

export const TabTitle = createPolymorphicComponent<'div', React.ComponentPropsWithoutRef<'div'>>(
  _TabTitle
);
