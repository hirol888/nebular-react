import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Accordion } from '@nebular-react/core';

function renderAccordion() {
  return render(
    <Accordion>
      <Accordion.Item
        value="details"
        header={<Accordion.Item.Header>Product details</Accordion.Item.Header>}
        body={<Accordion.Item.Body>Details content</Accordion.Item.Body>}
      />
      <Accordion.Item
        value="reviews"
        header={<Accordion.Item.Header>Reviews</Accordion.Item.Header>}
        body={<Accordion.Item.Body>Reviews content</Accordion.Item.Body>}
      />
    </Accordion>
  );
}

describe('Accordion', () => {
  it('toggles an item by click and keyboard', async () => {
    const user = userEvent.setup();
    renderAccordion();

    const header = screen.getByRole('button', { name: /Product details/ });
    const content = screen.getByText('Details content');

    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(content.closest('[inert]')).not.toBeNull();

    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(content.closest('[inert]')).toBeNull();

    await user.keyboard('{Enter}');
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(content.closest('[inert]')).not.toBeNull();

    header.focus();
    await user.keyboard(' ');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(content.closest('[inert]')).toBeNull();
  });

  it('keeps only one item expanded by default', async () => {
    const user = userEvent.setup();
    renderAccordion();

    const details = screen.getByRole('button', { name: /Product details/ });
    const reviews = screen.getByRole('button', { name: /Reviews/ });

    await user.click(details);
    expect(details).toHaveAttribute('aria-expanded', 'true');

    await user.click(reviews);
    expect(reviews).toHaveAttribute('aria-expanded', 'true');
    expect(details).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderAccordion();

    expect(await axe(container)).toHaveNoViolations();
  });
});
