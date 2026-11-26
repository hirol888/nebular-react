import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Kbd } from '@nebular-react/core';

describe('Kbd', () => {
  it('renders its children inside a kbd element', () => {
    render(<Kbd>Ctrl</Kbd>);

    const kbd = screen.getByText('Ctrl');
    expect(kbd.tagName).toBe('KBD');
  });

  it('renders both sizes', () => {
    render(
      <>
        <Kbd size="small">Esc</Kbd>
        <Kbd size="medium">Enter</Kbd>
      </>
    );

    expect(screen.getByText('Esc')).toBeInTheDocument();
    expect(screen.getByText('Enter')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Kbd>Ctrl + K</Kbd>);

    expect(await axe(container)).toHaveNoViolations();
  });
});
