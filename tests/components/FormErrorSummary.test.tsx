import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { FormErrorSummary } from '@nebular-react/core';

const errors = [
  { fieldId: 'contact:email', message: 'Enter your email' },
  { fieldId: 'contact-method', message: 'Choose a contact method' }
];

describe('FormErrorSummary', () => {
  it('shows and focuses the summary when errors first appear', () => {
    const { rerender } = render(<FormErrorSummary errors={[]} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    rerender(<FormErrorSummary errors={errors} title="Review your contact details" />);
    const summary = screen.getByRole('region', { name: 'Review your contact details' });

    expect(summary).toHaveFocus();
    expect(within(summary).getAllByRole('listitem')).toHaveLength(2);
    expect(within(summary).getByRole('link', { name: 'Enter your email' })).toHaveAttribute(
      'href',
      '#contact%3Aemail'
    );
  });

  it('moves keyboard focus to the relevant field and leaves it there as errors update', async () => {
    const user = userEvent.setup();
    const content = (items: typeof errors) => (
      <form>
        <FormErrorSummary errors={items} />
        <label htmlFor="contact:email">Email</label>
        <input id="contact:email" />
      </form>
    );
    const { rerender } = render(content(errors));

    await user.tab();
    expect(screen.getByRole('link', { name: 'Enter your email' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();

    rerender(content([{ ...errors[0], message: 'Enter a valid email' }]));
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();
  });

  it('focuses the first available control for a group id', async () => {
    const user = userEvent.setup();
    render(
      <>
        <FormErrorSummary errors={[errors[1]]} />
        <fieldset id="contact-method">
          <legend>Contact method</legend>
          <label>
            <input type="radio" name="method" disabled /> Phone
          </label>
          <label>
            <input type="radio" name="method" /> Email
          </label>
        </fieldset>
      </>
    );

    await user.click(screen.getByRole('link', { name: 'Choose a contact method' }));
    expect(screen.getByRole('radio', { name: 'Email' })).toHaveFocus();
  });

  it('lets the consumer retain focus and reports no axe violations', async () => {
    const { container } = render(
      <>
        <FormErrorSummary errors={errors} focusOnMount={false} />
        <label htmlFor="contact:email">Email</label>
        <input id="contact:email" />
        <label htmlFor="contact-method">Contact method</label>
        <input id="contact-method" />
      </>
    );

    expect(screen.getByRole('region')).not.toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();
  });
});
