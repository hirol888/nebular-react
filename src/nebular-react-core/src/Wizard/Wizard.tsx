import React, { forwardRef, useEffect, useState } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../Button';
import { Stepper } from '../Stepper';

const useStyles = createStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--wizard-gap, 1rem)',
    width: '100%',
    fontFamily: 'var(--wizard-text-font-family, inherit)'
  },

  stepBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--wizard-step-gap, 0.5rem)'
  },

  description: {
    margin: 0,
    color: 'var(--wizard-description-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--wizard-description-font-size, 0.8125rem)',
    lineHeight: 'var(--wizard-description-line-height, 1.4)'
  },

  error: {
    width: '100%',
    padding: 'var(--wizard-error-padding, 0.5rem 0.75rem)',
    border: '1px solid var(--wizard-error-border-color, var(--color-danger-500, #ff3d71))',
    borderRadius: 'var(--wizard-error-border-radius, 0.25rem)',
    backgroundColor: 'var(--wizard-error-background-color, rgba(255, 61, 113, 0.08))',
    color: 'var(--wizard-error-text-color, var(--color-danger-500, #ff3d71))',
    fontSize: 'var(--wizard-error-text-font-size, 0.8125rem)',
    lineHeight: 'var(--wizard-error-text-line-height, 1.4)'
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--wizard-actions-gap, 0.5rem)',
    marginTop: 'var(--wizard-actions-margin-top, 1rem)'
  },

  actionsSpacer: {
    flex: '1 1 auto'
  },

  status: {
    color: 'var(--wizard-status-text-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--wizard-status-text-font-size, 0.75rem)',
    lineHeight: 'var(--wizard-status-text-line-height, 1.4)'
  }
}));

const INVALID_STEP_MESSAGE = 'Complete this step before continuing.';

const isPromiseLike = <V,>(value: unknown): value is Promise<V> =>
  typeof value === 'object' && value !== null && typeof (value as Promise<V>).then === 'function';

export type WizardOrientation = 'horizontal' | 'vertical';

export interface WizardStep {
  key: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  content: React.ReactNode;
  validate?(): boolean | Promise<boolean>;
  optional?: boolean;
}

export type WizardStylesNames = Selectors<typeof useStyles>;

export interface WizardProps
  extends DefaultProps<WizardStylesNames>, Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  steps: WizardStep[];
  activeStep?: number;
  defaultActiveStep?: number;
  onStepChange?(index: number): void;
  onComplete?(): void;
  onCancel?(): void;
  nextLabel?: React.ReactNode;
  prevLabel?: React.ReactNode;
  finishLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  allowStepClick?: boolean;
  orientation?: WizardOrientation;
  ariaLabel?: string;
}

const defaultProps: Partial<WizardProps> = {
  defaultActiveStep: 0,
  allowStepClick: true,
  orientation: 'horizontal',
  nextLabel: 'Next',
  prevLabel: 'Previous',
  finishLabel: 'Finish',
  cancelLabel: 'Cancel'
};

const _Wizard = forwardRef<HTMLDivElement, WizardProps>((props, ref) => {
  const {
    steps,
    activeStep,
    defaultActiveStep,
    onStepChange,
    onComplete,
    onCancel,
    nextLabel,
    prevLabel,
    finishLabel,
    cancelLabel,
    allowStepClick,
    orientation,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(undefined, {
    name: 'wizard',
    classNames,
    styles,
    unstyled
  });

  const isControlled = typeof activeStep === 'number';
  const [internalStep, setInternalStep] = useState<number>(defaultActiveStep ?? 0);
  const [maxVisited, setMaxVisited] = useState<number>(() =>
    Math.max(defaultActiveStep ?? 0, activeStep ?? 0)
  );
  const [validating, setValidating] = useState(false);
  const [stepError, setStepError] = useState<string | undefined>(undefined);

  const stepCount = steps.length;
  const requestedStep = isControlled ? (activeStep as number) : internalStep;
  const currentStep = stepCount === 0 ? 0 : Math.min(Math.max(requestedStep, 0), stepCount - 1);
  const isLastStep = stepCount > 0 && currentStep === stepCount - 1;

  useEffect(() => {
    setMaxVisited((previous) => Math.max(previous, currentStep));
    setStepError(undefined);
  }, [currentStep]);

  const goToStep = (index: number) => {
    if (index < 0 || index >= stepCount || index === currentStep) {
      return;
    }

    setStepError(undefined);

    if (!isControlled) {
      setInternalStep(index);
    }

    onStepChange?.(index);
  };

  const handleStepperChange = (index: number) => {
    if (validating || !allowStepClick || index > maxVisited) {
      return;
    }

    goToStep(index);
  };

  const completeStep = (valid: boolean, isLast: boolean) => {
    if (!valid) {
      setStepError(INVALID_STEP_MESSAGE);

      return;
    }

    if (isLast) {
      onComplete?.();

      return;
    }

    goToStep(currentStep + 1);
  };

  const handleNext = () => {
    if (validating) {
      return;
    }

    setStepError(undefined);

    const step = steps[currentStep];

    if (!step || step.optional || typeof step.validate !== 'function') {
      completeStep(true, isLastStep);

      return;
    }

    setValidating(true);

    try {
      const outcome = step.validate();

      if (isPromiseLike<boolean>(outcome)) {
        outcome
          .then((valid) => completeStep(valid !== false, isLastStep))
          .catch(() => completeStep(false, isLastStep))
          .finally(() => setValidating(false));

        return;
      }

      setValidating(false);
      completeStep(outcome !== false, isLastStep);
    } catch {
      setValidating(false);
      completeStep(false, isLastStep);
    }
  };

  const handlePrevious = () => {
    if (validating) {
      return;
    }

    setStepError(undefined);
    goToStep(currentStep - 1);
  };

  const actions = (
    <div className={cx(classes.actions)}>
      {stepError && (
        <div role="alert" className={cx(classes.error)}>
          {stepError}
        </div>
      )}

      {onCancel && (
        <Button type="button" appearance="ghost" onClick={() => onCancel()}>
          {cancelLabel}
        </Button>
      )}

      <span className={cx(classes.actionsSpacer)} />

      <Button
        type="button"
        appearance="outline"
        disabled={currentStep === 0 || validating}
        onClick={handlePrevious}
      >
        {prevLabel}
      </Button>

      <Button
        type="button"
        disabled={validating}
        aria-busy={validating || undefined}
        onClick={handleNext}
      >
        {isLastStep ? finishLabel : nextLabel}
      </Button>
    </div>
  );

  return (
    <div
      {...others}
      ref={ref}
      role="region"
      aria-label={ariaLabel}
      aria-busy={validating || undefined}
      className={cx(classes.root, className)}
      data-orientation={orientation}
      data-validating={validating || undefined}
    >
      <Stepper
        activeStepIndex={currentStep}
        orientation={orientation}
        disableStepNavigation={!allowStepClick}
        onStepChange={handleStepperChange}
        buttons={actions}
      >
        {steps.map((step) => (
          <Stepper.Step key={step.key}>
            <Stepper.Header>{step.title}</Stepper.Header>

            <div className={cx(classes.stepBody)}>
              {step.description && <p className={cx(classes.description)}>{step.description}</p>}

              {step.content}
            </div>
          </Stepper.Step>
        ))}
      </Stepper>

      {validating && (
        <span role="status" className={cx(classes.status)}>
          Validating…
        </span>
      )}
    </div>
  );
});

_Wizard.displayName = 'Wizard';

export const Wizard = _Wizard;
