import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { ThemeIcon } from '@nebular-react/core';

describe('ThemeIcon', () => {
  it('ThemeIcon_AriaLabel_ShouldExposeAnImageRole', () => {
    render(
      <ThemeIcon ariaLabel="Completed" status="success">
        <svg data-testid="icon" />
      </ThemeIcon>
    );

    const icon = screen.getByRole('img', { name: 'Completed' });
    expect(icon).toHaveAttribute('data-variant', 'filled');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('ThemeIcon_WithoutLabel_ShouldBeHiddenFromAssistiveTechnology', () => {
    render(
      <ThemeIcon data-testid="theme-icon" variant="outline" status="danger">
        <svg />
      </ThemeIcon>
    );

    expect(screen.getByTestId('theme-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('theme-icon')).toHaveAttribute('data-variant', 'outline');
  });

  it('ThemeIcon_CustomColor_ShouldOverrideStatus', () => {
    render(
      <ThemeIcon ariaLabel="Custom" color="#8a2be2" size={40} radius={20}>
        <svg />
      </ThemeIcon>
    );

    expect(screen.getByRole('img', { name: 'Custom' })).toBeInTheDocument();
  });

  it('ThemeIcon_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <div>
        <ThemeIcon ariaLabel="Completed" status="success">
          <svg />
        </ThemeIcon>
        <ThemeIcon status="warning" variant="light">
          <svg />
        </ThemeIcon>
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
