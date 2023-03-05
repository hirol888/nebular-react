import React, { forwardRef, Children, isValidElement, ReactElement } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { useUncontrolled } from '@mantine/hooks';
import { useId } from '@nebular-react/hooks';
import { Step } from './Step';
import { StepHeader } from './StepHeader';
import useStyles from './Stepper.style';
import { Icon } from '../Icon';

export type StepperOrientation = 'vertical' | 'horizontal';

export type StepperStylesNames = Selectors<typeof useStyles>;

export interface StepperProps
  extends DefaultProps<StepperStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  activeStepIndex?: number;
  disableStepNavigation?: boolean;
  orientation?: StepperOrientation;
  onStepChange?: (stepIndex: number) => void;
  buttons?: React.ReactNode;
  completedContent?: React.ReactNode;
  children?: React.ReactNode;
}

const defaultProps: Partial<StepperProps> = {
  disableStepNavigation: false,
  orientation: 'horizontal'
};

const _Stepper = forwardRef<HTMLDivElement, StepperProps>((props, ref) => {
  const {
    activeStepIndex,
    disableStepNavigation,
    orientation,
    onStepChange,
    buttons,
    completedContent,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'stepper', classNames, styles, unstyled });

  const [_activeStepIndex, setActiveStepIndex] = useUncontrolled({
    value: activeStepIndex,
    defaultValue: 0,
    finalValue: undefined,
    onChange: onStepChange
  });

  const steps = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === Step
  );

  const handleStepClick = (index: number) => {
    !disableStepNavigation && setActiveStepIndex(index);
  };

  const uuid = useId();

  const stepHeader = (step: ReactElement, index: number) => {
    const header = Children.toArray(step.props.children).find(
      (child) => isValidElement(child) && child.type === StepHeader
    );

    return (
      <React.Fragment key={`${uuid}-step-header-${index}`}>
        {index !== 0 && !step.props.hidden && (
          <div
            className={cx(classes.connector, {
              [classes.connectorPast]: index <= _activeStepIndex
            })}
          />
        )}
        {!step.props.hidden && (
          <div
            className={cx(classes.stepHeader, {
              [classes.active]: _activeStepIndex === index,
              [classes.completed]: _activeStepIndex > index,
              [classes.notInteractive]: disableStepNavigation
            })}
            onClick={() => handleStepClick(index)}
          >
            <div className={cx(classes.labelIndex)}>
              {_activeStepIndex <= index && <span>{index + 1}</span>}
              {_activeStepIndex > index && (
                <Icon icon="checkmark-outline" pack="nebular-essentials" />
              )}
            </div>
            <div className="label">{header}</div>
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div
      className={cx(classes.root, className, {
        [classes.vertical]: orientation === 'vertical',
        [classes.horizontal]: orientation === 'horizontal'
      })}
      ref={ref}
      {...others}
    >
      <div className={cx(classes.header)}>
        {steps?.map((step, index) => stepHeader(step as ReactElement, index))}
      </div>
      {steps &&
        steps.map((step, index) => (
          <div
            key={`${uuid}-step-${index}`}
            className={cx(classes.stepContent, {
              active: index === _activeStepIndex
            })}
          >
            {step}
            {buttons && index === _activeStepIndex && <>{buttons}</>}
          </div>
        ))}
      {_activeStepIndex === steps.length && <>{completedContent}</>}
    </div>
  );
}) as any;

_Stepper.displayName = '@nebular-react/core/Stepper';
_Stepper.Step = Step;
_Stepper.Header = StepHeader;

export const Stepper = createPolymorphicComponent<
  'div',
  StepperProps,
  { Header: typeof StepHeader; Step: typeof Step }
>(_Stepper);
