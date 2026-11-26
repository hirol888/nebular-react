import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tour } from '@nebular-react/core';
import type { TourStep } from '@nebular-react/core';

const steps: TourStep[] = [
  { title: 'Welcome', content: 'First step content' },
  { title: 'Navigation', content: 'Second step content' },
  { title: 'Done', content: 'Third step content' }
];

describe('Tour', () => {
  it('does not render anything while closed', () => {
    render(<Tour steps={steps} ariaLabel="Product tour" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the first step when defaultOpened is set', () => {
    render(<Tour steps={steps} defaultOpened ariaLabel="Product tour" />);

    const dialog = screen.getByRole('dialog', { name: 'Product tour' });
    expect(dialog).toHaveTextContent('First step content');
    expect(dialog).toHaveTextContent('Step 1 of 3');
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Finish' })).not.toBeInTheDocument();
  });

  it('navigates through the steps with next and previous', async () => {
    const user = userEvent.setup();

    render(<Tour steps={steps} defaultOpened ariaLabel="Product tour" />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('dialog', { name: 'Product tour' })).toHaveTextContent(
      'Second step content'
    );
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByRole('dialog', { name: 'Product tour' })).toHaveTextContent(
      'First step content'
    );
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('navigates with the arrow keys', () => {
    render(<Tour steps={steps} defaultOpened ariaLabel="Product tour" />);

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('finishes on the last step', async () => {
    const user = userEvent.setup();
    const onFinish = jest.fn();
    const onOpenChange = jest.fn();

    render(
      <Tour
        steps={steps}
        defaultOpened
        defaultActiveStep={2}
        onFinish={onFinish}
        onOpenChange={onOpenChange}
        ariaLabel="Product tour"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when skipping', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<Tour steps={steps} defaultOpened onClose={onClose} ariaLabel="Product tour" />);

    await user.click(screen.getByRole('button', { name: 'Skip' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape and respects closeOnEsc', () => {
    const onClose = jest.fn();
    const { rerender } = render(<Tour steps={steps} defaultOpened ariaLabel="Product tour" />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <Tour steps={steps} opened closeOnEsc={false} onClose={onClose} ariaLabel="Product tour" />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Product tour' })).toBeInTheDocument();
  });

  it('closes on overlay click only when closeOnOverlayClick is enabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    render(
      <Tour steps={steps} defaultOpened onOpenChange={onOpenChange} ariaLabel="Product tour" />
    );

    await user.click(screen.getByRole('button', { name: 'Close tour overlay' }));
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Product tour' })).toBeInTheDocument();
  });

  it('closes on overlay click when closeOnOverlayClick is enabled', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <Tour
        steps={steps}
        defaultOpened
        closeOnOverlayClick
        onClose={onClose}
        ariaLabel="Product tour"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close tour overlay' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('supports a controlled open state and active step', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const onStepChange = jest.fn();

    render(
      <Tour
        steps={steps}
        opened
        activeStep={1}
        onOpenChange={onOpenChange}
        onStepChange={onStepChange}
        ariaLabel="Product tour"
      />
    );

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(onStepChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Skip' }));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('dialog', { name: 'Product tour' })).toBeInTheDocument();
  });

  it('positions the card next to the target and renders a spotlight', () => {
    const target = document.createElement('div');
    target.id = 'tour-target';
    target.getBoundingClientRect = () =>
      ({
        top: 100,
        left: 50,
        width: 200,
        height: 40,
        right: 250,
        bottom: 140,
        x: 50,
        y: 100,
        toJSON: () => ({})
      }) as DOMRect;
    document.body.appendChild(target);

    try {
      const targetSteps: TourStep[] = [
        { target: '#tour-target', content: 'Anchored content', placement: 'bottom' }
      ];

      render(<Tour steps={targetSteps} defaultOpened ariaLabel="Anchored tour" />);

      const dialog = screen.getByRole('dialog', { name: 'Anchored tour' });
      expect(dialog).toHaveStyle({ position: 'fixed', top: '152px', left: '150px' });

      const spotlight = document.querySelector('[data-tour-spotlight]');
      expect(spotlight).not.toBeNull();
      expect(spotlight).toHaveStyle({ top: '100px', left: '50px', width: '200px' });
    } finally {
      target.remove();
    }
  });

  it('renders the card centered when the step has no target', () => {
    render(<Tour steps={steps} defaultOpened ariaLabel="Product tour" />);

    expect(screen.getByRole('dialog', { name: 'Product tour' })).not.toHaveAttribute('style');
  });

  it('moves focus into the card, locks scroll and restores focus on close', () => {
    const { rerender } = render(
      <>
        <button type="button">Start tour</button>
        <Tour steps={steps} opened={false} ariaLabel="Product tour" />
      </>
    );

    const trigger = screen.getByRole('button', { name: 'Start tour' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    rerender(
      <>
        <button type="button">Start tour</button>
        <Tour steps={steps} opened ariaLabel="Product tour" />
      </>
    );

    expect(screen.getByRole('dialog', { name: 'Product tour' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <>
        <button type="button">Start tour</button>
        <Tour steps={steps} opened={false} ariaLabel="Product tour" />
      </>
    );

    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('has no accessibility violations', async () => {
    render(<Tour steps={steps} defaultOpened ariaLabel="Product tour" />);

    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations();
  });
});
