import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tabset } from '@nebular-react/core';

function renderTabset() {
  return render(
    <Tabset ariaLabel="Sections">
      <Tabset.Tab title="One">Content one</Tabset.Tab>
      <Tabset.Tab title="Two">Content two</Tabset.Tab>
    </Tabset>
  );
}

describe('Tabset', () => {
  it('exposes tabs and switches the active panel', async () => {
    const user = userEvent.setup();
    renderTabset();

    const one = screen.getByRole('tab', { name: 'One' });
    const two = screen.getByRole('tab', { name: 'Two' });

    expect(one).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Content one');

    await user.click(two);

    expect(two).toHaveAttribute('aria-selected', 'true');
    expect(one).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Content two');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderTabset();

    expect(await axe(container)).toHaveNoViolations();
  });
});
