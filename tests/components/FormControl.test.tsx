import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { FormControl } from '@nebular-react/core';

describe('FormControl', () => {
  it('FormControl_Render_ShouldRenderLabelChildrenDescriptionAndError', () => {
    render(
      <FormControl label="Email" description="We never share it" error="Email is required">
        <input aria-label="Email field" />
      </FormControl>
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email field' })).toBeInTheDocument();
    expect(screen.getByText('We never share it')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('FormControl_Label_ShouldAssociateWithChildControlUsingHtmlFor', () => {
    render(
      <FormControl label="Username" htmlFor="username">
        <input id="username" />
      </FormControl>
    );

    expect(screen.getByLabelText('Username')).toHaveAttribute('id', 'username');
  });

  it('FormControl_Required_ShouldRenderAsteriskOnlyWhenRequiredOrWithAsterisk', () => {
    const { container, rerender } = render(
      <FormControl label="Email">
        <input aria-label="Email" />
      </FormControl>
    );

    expect(container.textContent).not.toContain('*');

    rerender(
      <FormControl label="Email" required>
        <input aria-label="Email" />
      </FormControl>
    );

    expect(container.textContent).toContain('*');

    rerender(
      <FormControl label="Email" withAsterisk>
        <input aria-label="Email" />
      </FormControl>
    );

    expect(container.textContent).toContain('*');
  });

  it('FormControl_Orientation_ShouldExposeOrientationAndSizeOnRoot', () => {
    const { container } = render(
      <FormControl label="Email" orientation="horizontal" size="large">
        <input aria-label="Email" />
      </FormControl>
    );

    const root = container.firstElementChild;

    expect(root).toHaveAttribute('data-orientation', 'horizontal');
    expect(root).toHaveAttribute('data-size', 'large');
  });

  it('FormControl_ClassName_ShouldForwardDivPropsToRoot', () => {
    render(
      <FormControl label="Email" data-testid="form-control" className="custom">
        <input aria-label="Email" />
      </FormControl>
    );

    expect(screen.getByTestId('form-control')).toHaveClass('custom');
  });

  it('FormControl_Error_ShouldOnlyRenderAlertWhenErrorIsProvided', () => {
    const { rerender } = render(
      <FormControl label="Email">
        <input aria-label="Email" />
      </FormControl>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(
      <FormControl label="Email" error="Invalid email">
        <input aria-label="Email" />
      </FormControl>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('FormControl_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <form>
        <FormControl label="Email" htmlFor="a11y-email" description="Use your work email" required>
          <input id="a11y-email" type="email" />
        </FormControl>
        <FormControl label="Password" htmlFor="a11y-password" error="Password is required">
          <input id="a11y-password" type="password" aria-invalid="true" />
        </FormControl>
      </form>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
