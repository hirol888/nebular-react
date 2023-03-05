import { createPolymorphicComponent } from '@mantine/utils';
import React from 'react';

const _StepHeader = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  (props, ref) => {
    const { children, ...others } = props;
    return (
      <span ref={ref} {...others}>
        {children}
      </span>
    );
  }
);

_StepHeader.displayName = '@nebular-react/core/StepHeader';

export const StepHeader = createPolymorphicComponent<
  'span',
  React.ComponentPropsWithoutRef<'span'>
>(_StepHeader);
