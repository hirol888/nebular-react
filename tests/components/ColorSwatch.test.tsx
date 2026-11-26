import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ColorSwatch } from '@nebular-react/core';

describe('ColorSwatch', () => {
  it('ColorSwatch_Color_ShouldUseTheColorAsDefaultLabel', () => {
    render(<ColorSwatch color="#3366ff" />);

    expect(screen.getByRole('button', { name: '#3366ff' })).toBeInTheDocument();
  });

  it('ColorSwatch_AriaLabel_ShouldOverrideTheDefaultName', () => {
    render(<ColorSwatch color="#3366ff" ariaLabel="Primary color" />);

    expect(screen.getByRole('button', { name: 'Primary color' })).toBeInTheDocument();
  });

  it('ColorSwatch_Checked_ShouldExposePressedStateAndIndicator', () => {
    render(<ColorSwatch color="#3366ff" checked ariaLabel="Primary" />);

    const swatch = screen.getByRole('button', { name: 'Primary' });
    expect(swatch).toHaveAttribute('aria-pressed', 'true');
    expect(swatch).toHaveAttribute('data-checked', 'true');
    expect(screen.getByText('✓')).toHaveAttribute('aria-hidden', 'true');
  });

  it('ColorSwatch_Click_ShouldCallOnClick', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<ColorSwatch color="#3366ff" ariaLabel="Primary" onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: 'Primary' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ColorSwatch_Transparent_ShouldRenderTheCheckerboardVariant', () => {
    render(<ColorSwatch color="transparent" />);

    expect(screen.getByRole('button', { name: 'transparent' })).toHaveAttribute(
      'data-transparent',
      'true'
    );
  });

  it('ColorSwatch_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <div>
        <ColorSwatch color="#3366ff" checked ariaLabel="Primary" />
        <ColorSwatch color="#00d68f" ariaLabel="Success" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
