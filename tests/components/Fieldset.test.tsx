import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Fieldset } from '@nebular-react/core';

describe('Fieldset', () => {
  it('Fieldset_Render_ShouldExposeLegendAsGroupName', () => {
    render(
      <Fieldset legend="Account">
        <input aria-label="Name" />
      </Fieldset>
    );

    expect(screen.getByRole('group', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('Fieldset_Description_ShouldBeLinkedWithAriaDescribedBy', () => {
    render(
      <Fieldset legend="Account" description="Basic information used across the app">
        <input aria-label="Name" />
      </Fieldset>
    );

    const group = screen.getByRole('group', { name: 'Account' });
    const description = screen.getByText('Basic information used across the app');

    expect(group).toHaveAttribute('aria-describedby', description.id);
  });

  it('Fieldset_Disabled_ShouldDisableDescendants', () => {
    render(
      <Fieldset legend="Account" disabled>
        <input aria-label="Name" />
      </Fieldset>
    );

    expect(screen.getByRole('group', { name: 'Account' })).toBeDisabled();
    expect(screen.getByLabelText('Name')).toBeDisabled();
  });

  it('Fieldset_Variants_ShouldExposeDataAttributes', () => {
    const { rerender } = render(
      <Fieldset legend="Account" variant="filled" withBorder={false}>
        Content
      </Fieldset>
    );

    const group = screen.getByRole('group', { name: 'Account' });
    expect(group).toHaveAttribute('data-variant', 'filled');
    expect(group).not.toHaveAttribute('data-with-border');

    rerender(
      <Fieldset legend="Account" variant="default">
        Content
      </Fieldset>
    );

    expect(screen.getByRole('group', { name: 'Account' })).toHaveAttribute(
      'data-with-border',
      'true'
    );
  });

  it('Fieldset_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Fieldset legend="Account" description="Basic information">
        <input aria-label="Name" />
        <input aria-label="Email" type="email" />
      </Fieldset>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
