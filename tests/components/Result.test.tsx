import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Result } from '@nebular-react/core';

const collectEmittedCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => {
      const sheetRules = style.sheet
        ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText)
        : [];

      return [style.textContent || '', ...sheetRules].join('\n');
    })
    .join('\n');

describe('Result', () => {
  it('Result_Default_ShouldRenderInfoStatusPolitely', () => {
    render(<Result title="Heads up" subTitle="Something happened" />);

    const result = screen.getByRole('status');

    expect(result).toHaveAttribute('data-status', 'info');
    expect(result).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Something happened')).toBeInTheDocument();
    expect(screen.getByText('Heads up').tagName).toBe('H3');
    expect(collectEmittedCss()).toMatch(/--color-info-500/);
  });

  it('Result_Error_ShouldUseAlertRoleAndAssertiveLiveRegion', () => {
    render(<Result status="error" title="Failed" />);

    const result = screen.getByRole('alert');

    expect(result).toHaveAttribute('data-status', 'error');
    expect(result).toHaveAttribute('aria-live', 'assertive');
    expect(result).toHaveClass('nebular-result-root');
    expect(collectEmittedCss()).toMatch(/--color-danger-500/);
  });

  it('Result_Success_ShouldRenderSuccessIconAndColor', () => {
    render(<Result status="success" title="Saved" />);

    const result = screen.getByRole('status');
    const icon = result.querySelector('[data-result-icon="success"]');

    expect(result).toHaveAttribute('data-status', 'success');
    expect(icon).toBeInTheDocument();
    expect(icon?.querySelector('svg')).toBeInTheDocument();
    expect(collectEmittedCss()).toMatch(/--color-success-500/);
  });

  it('Result_Warning_ShouldUsePoliteLiveRegion', () => {
    render(<Result status="warning" title="Careful" />);

    const result = screen.getByRole('status');

    expect(result).toHaveAttribute('data-status', 'warning');
    expect(result).toHaveAttribute('aria-live', 'polite');
    expect(collectEmittedCss()).toMatch(/--color-warning-500/);
  });

  it('Result_HttpStatuses_ShouldRenderStatusCodeAsIcon', () => {
    const { rerender } = render(<Result status="404" title="Not found" />);

    expect(screen.getByRole('status')).toHaveAttribute('data-status', '404');
    expect(screen.getByText('404')).toHaveAttribute('aria-hidden', 'true');

    rerender(<Result status="403" title="Forbidden" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-status', '403');
    expect(screen.getByText('403')).toBeInTheDocument();

    rerender(<Result status="500" title="Server error" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-status', '500');
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('Result_Icon_ShouldReplaceDefaultIcon', () => {
    render(<Result status="success" title="Saved" icon={<span>Custom icon</span>} />);

    expect(screen.getByText('Custom icon')).toBeInTheDocument();
    expect(document.querySelector('[data-result-icon="success"]')).toBeInTheDocument();
    expect(screen.getByRole('status').querySelector('svg')).not.toBeInTheDocument();
  });

  it('Result_ContentAndExtra_ShouldRenderChildrenAndActions', () => {
    render(
      <Result
        status="success"
        title="Saved"
        subTitle="Your changes were stored"
        extra={<button type="button">Continue</button>}
      >
        <p>Extra details</p>
      </Result>
    );

    expect(screen.getByText('Extra details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('Result_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Result
        status="error"
        title="Unable to save"
        subTitle="Check your connection and try again"
        extra={<button type="button">Retry</button>}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
