import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Overlay } from '@nebular-react/core';

describe('Overlay', () => {
  it('Overlay_Defaults_ShouldRenderAFixedDecorativeLayer', () => {
    render(<Overlay data-testid="overlay" />);

    const overlay = screen.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-fixed', 'true');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });

  it('Overlay_AriaLabel_ShouldExposeAGroup', () => {
    render(<Overlay ariaLabel="Blocking overlay" />);

    expect(screen.getByRole('group', { name: 'Blocking overlay' })).toBeInTheDocument();
  });

  it('Overlay_Children_ShouldRemainAccessible', () => {
    render(
      <Overlay fixed={false} center>
        <button type="button">Continue</button>
      </Overlay>
    );

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' }).parentElement).not.toHaveAttribute(
      'aria-hidden'
    );
  });

  it('Overlay_Options_ShouldExposeDataAttributes', () => {
    render(<Overlay data-testid="overlay" fixed={false} center />);

    const overlay = screen.getByTestId('overlay');
    expect(overlay).not.toHaveAttribute('data-fixed');
    expect(overlay).toHaveAttribute('data-center', 'true');
  });

  it('Overlay_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Overlay fixed={false} ariaLabel="Loading">
        <span>Loading content</span>
      </Overlay>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
