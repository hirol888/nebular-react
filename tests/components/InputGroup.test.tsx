import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { InputGroup } from '@nebular-react/core';

describe('InputGroup', () => {
  it('renders before and after addons around the content', () => {
    render(
      <InputGroup before="https://" after=".com">
        <input aria-label="Domain" />
      </InputGroup>
    );

    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByLabelText('Domain')).toBeInTheDocument();
  });

  it('reflects orientation and disabled state', () => {
    const { container } = render(
      <InputGroup orientation="vertical" disabled before="A" after="B">
        <input aria-label="Field" />
      </InputGroup>
    );

    const group = container.firstElementChild as HTMLElement;
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(group).toHaveAttribute('data-disabled', 'true');
  });

  it('applies custom class names', () => {
    const { container } = render(
      <InputGroup className="custom" before="A">
        <input aria-label="Field" />
      </InputGroup>
    );

    expect(container.firstElementChild).toHaveClass('custom');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <InputGroup before={<span>$</span>} after={<span>USD</span>}>
        <input aria-label="Amount" />
      </InputGroup>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
