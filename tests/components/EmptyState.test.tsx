import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button, EmptyState } from '@nebular-react/core';

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(
      <EmptyState
        title="Nothing here"
        description="Create your first item."
        action={<Button>Create</Button>}
      />
    );

    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument();
    expect(screen.getByText('Create your first item.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmptyState title="Nothing here" description="Create your first item." />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
