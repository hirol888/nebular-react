import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '@nebular-react/core';

describe('Button loading state', () => {
  it('disables interactions and exposes aria-busy', () => {
    const onClick = jest.fn();

    render(
      <Button status="primary" loading onClick={onClick}>
        Save
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('tabindex', '-1');

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('replaces the label with loadingText and hides icons', () => {
    const { container } = render(
      <Button
        status="primary"
        loading
        loadingText="Saving…"
        prefixIcon={<span>prefix</span>}
        suffixIcon={<span>suffix</span>}
      >
        Save
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('prefix')).not.toBeInTheDocument();
    expect(screen.queryByText('suffix')).not.toBeInTheDocument();
    expect(container.querySelector('.nebular-button-loader')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('keeps the label when loadingText is omitted', () => {
    render(
      <Button status="primary" loading>
        Save
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('supports icon-only loading buttons', () => {
    const { container } = render(
      <Button aria-label="Refresh" loading prefixIcon={<span>icon</span>} />
    );

    expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(screen.queryByText('icon')).not.toBeInTheDocument();
    expect(container.querySelector('.nebular-button-loader')).toBeInTheDocument();
  });

  it('has no accessibility violations while loading', async () => {
    const { container } = render(
      <Button status="primary" loading loadingText="Saving…">
        Save
      </Button>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
