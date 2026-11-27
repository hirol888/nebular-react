import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Stepper, StepperProps } from '@nebular-react/core';

function renderStepper(props: Partial<StepperProps> = {}) {
  return render(
    <Stepper aria-label="Checkout" {...props}>
      <Stepper.Step>
        <Stepper.Header>Account</Stepper.Header>
        <p>Account content</p>
      </Stepper.Step>
      <Stepper.Step>
        <Stepper.Header>Shipping</Stepper.Header>
        <p>Shipping content</p>
      </Stepper.Step>
      <Stepper.Step>
        <Stepper.Header>Payment</Stepper.Header>
        <p>Payment content</p>
      </Stepper.Step>
    </Stepper>
  );
}

const getHeader = (label: string) =>
  screen.getByText(label).closest('.nebular-stepper-stepHeader') as HTMLElement;

describe('Stepper', () => {
  it('renders every step header, connector and the first active step', () => {
    const { container } = renderStepper();

    expect(container.firstElementChild).toHaveClass('nebular-stepper-horizontal');
    expect(container.querySelectorAll('.nebular-stepper-stepHeader')).toHaveLength(3);
    expect(container.querySelectorAll('.nebular-stepper-connector')).toHaveLength(2);
    expect(getHeader('Account')).toHaveClass('nebular-stepper-active');
    expect(getHeader('Shipping')).not.toHaveClass('nebular-stepper-active');
    expect(screen.getByText('Account content').closest('.nebular-stepper-stepContent')).toHaveClass(
      'active'
    );
  });

  it('moves to the clicked step and reports the new index', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderStepper({ onStepChange });

    await user.click(screen.getByText('Shipping'));

    expect(onStepChange).toHaveBeenCalledWith(1);
    expect(getHeader('Shipping')).toHaveClass('nebular-stepper-active');
    expect(getHeader('Account')).toHaveClass('nebular-stepper-completed');
    expect(
      screen.getByText('Shipping content').closest('.nebular-stepper-stepContent')
    ).toHaveClass('active');
  });

  it('supports keyboard navigation on step headers', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderStepper({ onStepChange });

    const shipping = getHeader('Shipping');
    expect(shipping).toHaveAttribute('role', 'button');
    expect(shipping).toHaveAttribute('tabindex', '0');

    shipping.focus();
    await user.keyboard('a');
    expect(onStepChange).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(onStepChange).toHaveBeenLastCalledWith(1);

    getHeader('Payment').focus();
    await user.keyboard(' ');
    expect(onStepChange).toHaveBeenLastCalledWith(2);
  });

  it('supports a controlled active step', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderStepper({ activeStepIndex: 2, onStepChange });

    expect(getHeader('Payment')).toHaveClass('nebular-stepper-active');

    await user.click(screen.getByText('Account'));

    expect(onStepChange).toHaveBeenCalledWith(0);
    expect(getHeader('Payment')).toHaveClass('nebular-stepper-active');
  });

  it('does not navigate when step navigation is disabled', async () => {
    const user = userEvent.setup();
    const onStepChange = jest.fn();
    renderStepper({ disableStepNavigation: true, onStepChange });

    const shipping = getHeader('Shipping');
    expect(shipping).toHaveClass('nebular-stepper-notInteractive');
    expect(shipping).toHaveAttribute('tabindex', '-1');

    await user.click(shipping);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('renders vertically when requested', () => {
    const { container } = renderStepper({ orientation: 'vertical' });

    expect(container.firstElementChild).toHaveClass('nebular-stepper-vertical');
    expect(container.firstElementChild).not.toHaveClass('nebular-stepper-horizontal');
  });

  it('renders buttons only for the active step', async () => {
    const user = userEvent.setup();
    renderStepper({ buttons: <button type="button">Next</button> });

    expect(screen.getAllByText('Next')).toHaveLength(1);
    expect(screen.getByText('Next').closest('.nebular-stepper-stepContent')).toHaveClass('active');

    await user.click(screen.getByText('Shipping'));

    expect(screen.getAllByText('Next')).toHaveLength(1);
    expect(screen.getByText('Next').closest('.nebular-stepper-stepContent')).toHaveClass('active');
  });

  it('renders completed content when all steps are done', () => {
    renderStepper({ activeStepIndex: 3, completedContent: <div>All steps completed</div> });

    expect(screen.getByText('All steps completed')).toBeInTheDocument();
  });

  it('does not render completed content when there are no steps', () => {
    render(<Stepper aria-label="Empty" completedContent={<div>All steps completed</div>} />);

    expect(screen.queryByText('All steps completed')).not.toBeInTheDocument();
  });

  it('does not render the header of a hidden step', () => {
    render(
      <Stepper aria-label="Hidden step">
        <Stepper.Step>
          <Stepper.Header>Visible</Stepper.Header>
          <p>Visible content</p>
        </Stepper.Step>
        <Stepper.Step hidden>
          <Stepper.Header>Hidden</Stepper.Header>
          <p>Hidden content</p>
        </Stepper.Step>
      </Stepper>
    );

    expect(screen.getByText('Visible')).toBeInTheDocument();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('ignores non-Step children', () => {
    const { container } = render(
      <Stepper aria-label="Mixed content">
        <div>Ignored content</div>
        <Stepper.Step>
          <Stepper.Header>Only step</Stepper.Header>
          <p>Only step content</p>
        </Stepper.Step>
      </Stepper>
    );

    expect(container.querySelectorAll('.nebular-stepper-stepHeader')).toHaveLength(1);
    expect(screen.queryByText('Ignored content')).not.toBeInTheDocument();
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <Stepper ref={ref} aria-label="Checkout">
        <Stepper.Step>
          <Stepper.Header>Account</Stepper.Header>
          <p>Account content</p>
        </Stepper.Step>
      </Stepper>
    );

    expect(ref.current).toBe(container.firstElementChild);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderStepper();

    expect(await axe(container)).toHaveNoViolations();
  });
});
