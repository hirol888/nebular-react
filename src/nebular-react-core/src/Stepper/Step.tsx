import React, { Children, forwardRef, isValidElement } from 'react';
import { DefaultProps, Selectors, createPolymorphicComponent } from '@nebular-react/styles';
import { StepHeader } from './StepHeader';
import useStyles from './Stepper.style';

export type StepStylesNames = Selectors<typeof useStyles>;

export interface StepProps
  extends DefaultProps<StepStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  hidden?: boolean;
  children?: React.ReactNode;
}

const _Step = forwardRef<HTMLDivElement, StepProps>((props, ref) => {
  const { children, className, classNames, styles, unstyled, ...others } = props;
  const { classes, cx } = useStyles(null, { name: 'stepper', classNames, styles, unstyled });

  const stepContent = Children.toArray(children).filter(
    (child) => !(isValidElement(child) && child.type === StepHeader)
  );

  return (
    <div className={cx(classes.step)} ref={ref} {...others}>
      {stepContent}
    </div>
  );
});

_Step.displayName = 'Step';

export const Step = createPolymorphicComponent<'div', StepProps>(_Step);
