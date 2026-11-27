import { createPolymorphicComponent } from '@nebular-react/styles';
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

_StepHeader.displayName = 'StepHeader';

export const StepHeader = createPolymorphicComponent<
  'span',
  React.ComponentPropsWithoutRef<'span'>
>(_StepHeader);
