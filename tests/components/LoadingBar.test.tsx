import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { LoadingBar } from '@nebular-react/core';

const collectEmittedCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => {
      const sheetRules = style.sheet
        ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText)
        : [];

      return [style.textContent || '', ...sheetRules].join('\n');
    })
    .join('\n');

describe('LoadingBar', () => {
  it('LoadingBar_Render_ShouldBeIndeterminateByDefault', () => {
    render(<LoadingBar />);

    const progressbar = screen.getByRole('progressbar', { name: 'Loading' });

    expect(progressbar).toHaveAttribute('aria-busy', 'true');
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(progressbar).toHaveAttribute('data-indeterminate', 'true');
  });

  it('LoadingBar_Value_ShouldRenderDeterminateProgress', () => {
    render(<LoadingBar value={40} ariaLabel="Upload progress" />);

    const progressbar = screen.getByRole('progressbar', { name: 'Upload progress' });
    const fill = document.querySelector('[data-loading-bar-fill]') as HTMLElement;

    expect(progressbar).toHaveAttribute('aria-busy', 'true');
    expect(progressbar).toHaveAttribute('aria-valuenow', '40');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(fill).toHaveStyle({ width: '40%' });
  });

  it('LoadingBar_ValueOutOfRange_ShouldClampToBounds', () => {
    const { rerender } = render(<LoadingBar value={140} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    rerender(<LoadingBar value={-20} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    rerender(<LoadingBar value={0} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('LoadingBar_LoadingFalse_ShouldRenderNothing', () => {
    const { container } = render(<LoadingBar loading={false} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('LoadingBar_PositionTop_ShouldRenderFixedAtTop', () => {
    render(<LoadingBar />);

    const css = collectEmittedCss();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(css).toMatch(/position:\s*fixed/i);
    expect(css).toMatch(/z-index:\s*\d+/i);
  });

  it('LoadingBar_PositionInline_ShouldRenderInFlow', () => {
    render(<LoadingBar position="inline" height={6} />);

    const progressbar = screen.getByRole('progressbar');

    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('data-position', 'inline');
  });

  it('LoadingBar_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <div>
        <LoadingBar value={60} ariaLabel="Saving document" />
        <LoadingBar ariaLabel="Loading data" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
