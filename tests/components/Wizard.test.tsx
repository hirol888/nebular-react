import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Wizard, WizardProps, WizardStep } from '@nebular-react/core';

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
};

const createSteps = (
  overrides: Partial<Record<number, Partial<WizardStep>>> = {}
): WizardStep[] => [
  {
    key: 'account',
    title: 'Account',
    description: 'Account description',
    content: <p>Account step content</p>,
    ...overrides[0]
  },
  {
    key: 'shipping',
    title: 'Shipping',
    description: 'Shipping description',
    content: <p>Shipping step content</p>,
    ...overrides[1]
  },
  {
    key: 'payment',
    title: 'Payment',
    description: 'Payment description',
    content: <p>Payment step content</p>,
    ...overrides[2]
  }
];

const wizardElement = (props: Partial<WizardProps> = {}) => (
  <Wizard ariaLabel="Checkout" steps={createSteps()} {...props} />
);

const renderWizard = (props: Partial<WizardProps> = {}) => render(wizardElement(props));

const getStepHeader = (label: string) =>
  screen.getByText(label).closest('.nebular-stepper-stepHeader') as HTMLElement;

const expectActiveContent = (text: string) => {
  expect(screen.getByText(text).closest('.nebular-stepper-stepContent')).toHaveClass('active');
};

describe('Wizard', () => {
  it('Wizard_Render_ShouldShowFirstStepAndActions', () => {
    renderWizard({ onCancel: jest.fn() });

    expect(screen.getByRole('region', { name: 'Checkout' })).toBeInTheDocument();
    expect(getStepHeader('Account')).toHaveClass('nebular-stepper-active');
    expectActiveContent('Account step content');
    expect(screen.getByText('Account description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finish' })).not.toBeInTheDocument();
  });

  it('Wizard_Next_ShouldAdvanceToTheNextStep', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderWizard({ onStepChange });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onStepChange).toHaveBeenCalledWith(1);
    expect(getStepHeader('Shipping')).toHaveClass('nebular-stepper-active');
    expectActiveContent('Shipping step content');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });

  it('Wizard_Previous_ShouldReturnToThePreviousStep', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderWizard({ defaultActiveStep: 1, onStepChange });

    await user.click(screen.getByRole('button', { name: 'Previous' }));

    expect(onStepChange).toHaveBeenCalledWith(0);
    expect(getStepHeader('Account')).toHaveClass('nebular-stepper-active');
    expectActiveContent('Account step content');
  });

  it('Wizard_Finish_ShouldCompleteOnTheLastStep', async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    renderWizard({ defaultActiveStep: 2, onComplete });

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('Wizard_Cancel_ShouldCallOnCancel', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderWizard({ onCancel, cancelLabel: 'Abort' });

    await user.click(screen.getByRole('button', { name: 'Abort' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Wizard_CustomLabels_ShouldRenderConfiguredActions', () => {
    renderWizard({
      defaultActiveStep: 2,
      nextLabel: 'Continue',
      prevLabel: 'Back',
      finishLabel: 'Submit'
    });

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('Wizard_Next_ShouldBlockNavigationWhenStepValidationFails', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderWizard({ onStepChange, steps: createSteps({ 0: { validate: () => false } }) });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onStepChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Complete this step before continuing.');
    expectActiveContent('Account step content');
  });

  it('Wizard_OptionalStep_ShouldSkipValidation', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderWizard({
      onStepChange,
      steps: createSteps({ 0: { optional: true, validate: () => false } })
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onStepChange).toHaveBeenCalledWith(1);
    expectActiveContent('Shipping step content');
  });

  it('Wizard_Next_ShouldDisableWhileAsyncValidationIsPendingAndAdvanceWhenValid', async () => {
    const user = userEvent.setup();
    const validation = createDeferred<boolean>();
    const onStepChange = jest.fn();
    renderWizard({
      onStepChange,
      steps: createSteps({ 0: { validate: () => validation.promise } })
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/validating/i);
    expect(onStepChange).not.toHaveBeenCalled();

    await act(async () => {
      validation.resolve(true);
    });

    await waitFor(() => expect(onStepChange).toHaveBeenCalledWith(1));
    expectActiveContent('Shipping step content');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('Wizard_Next_ShouldStayWhenAsyncValidationFails', async () => {
    const user = userEvent.setup();
    const validation = createDeferred<boolean>();
    const onStepChange = jest.fn();
    renderWizard({
      onStepChange,
      steps: createSteps({ 0: { validate: () => validation.promise } })
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await act(async () => {
      validation.resolve(false);
    });

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Complete this step before continuing.')
    );
    expect(onStepChange).not.toHaveBeenCalled();
    expectActiveContent('Account step content');
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('Wizard_StepClick_ShouldOnlyAllowVisitedSteps', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderWizard({ onStepChange });

    await user.click(getStepHeader('Payment'));
    expect(onStepChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onStepChange).toHaveBeenCalledWith(1);

    await user.click(getStepHeader('Account'));
    expect(onStepChange).toHaveBeenLastCalledWith(0);
    expectActiveContent('Account step content');
  });

  it('Wizard_Controlled_ShouldRespectActiveStepProp', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    const { rerender } = render(wizardElement({ activeStep: 1, onStepChange }));

    expectActiveContent('Shipping step content');

    await user.click(getStepHeader('Account'));
    expect(onStepChange).toHaveBeenCalledWith(0);
    expectActiveContent('Shipping step content');

    await user.click(getStepHeader('Payment'));
    expect(onStepChange).toHaveBeenCalledTimes(1);

    rerender(wizardElement({ activeStep: 0, onStepChange }));
    expect(getStepHeader('Account')).toHaveClass('nebular-stepper-active');
    expectActiveContent('Account step content');
  });

  it('Wizard_AllowStepClickFalse_ShouldIgnoreStepNavigation', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderWizard({ allowStepClick: false, onStepChange });

    await user.click(getStepHeader('Shipping'));

    expect(onStepChange).not.toHaveBeenCalled();
    expect(getStepHeader('Shipping')).toHaveAttribute('aria-disabled', 'true');
    expectActiveContent('Account step content');
  });

  it('Wizard_Orientation_ShouldRenderVerticalStepper', () => {
    const { container } = renderWizard({ orientation: 'vertical' });

    expect(container.querySelector('.nebular-stepper-vertical')).not.toBeNull();
    expect(container.querySelector('.nebular-stepper-horizontal')).toBeNull();
  });

  it('Wizard_hasNoA11yViolations', async () => {
    const { container } = renderWizard({ onCancel: jest.fn() });

    expect(await axe(container)).toHaveNoViolations();
  });
});
