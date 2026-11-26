import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Tabset } from '@nebular-react/core';

describe('Tabset advanced behavior', () => {
  it('closes a tab through the affordance without activating it', async () => {
    const user = userEvent.setup();
    const onTabClose = jest.fn();
    const onTabChange = jest.fn();

    const { container } = render(
      <Tabset onTabClose={onTabClose} onTabChange={onTabChange}>
        <Tabset.Tab title="First" closable>
          First content
        </Tabset.Tab>
        <Tabset.Tab title="Second">Second content</Tabset.Tab>
      </Tabset>
    );

    const close = container.querySelector('[title="Close First"]') as HTMLElement;
    await user.click(close);

    expect(onTabClose).toHaveBeenCalledWith(0);
    expect(onTabChange).not.toHaveBeenCalled();
  });

  it('closes a closable tab with the Delete key', () => {
    const onTabClose = jest.fn();

    render(
      <Tabset onTabClose={onTabClose}>
        <Tabset.Tab title="First" closable>
          First content
        </Tabset.Tab>
        <Tabset.Tab title="Second">Second content</Tabset.Tab>
      </Tabset>
    );

    const tab = screen.getByRole('tab', { name: 'First' });
    expect(tab).toHaveAttribute('aria-keyshortcuts', 'Delete');

    fireEvent.keyDown(tab, { key: 'Delete' });
    expect(onTabClose).toHaveBeenCalledWith(0);
  });

  it('does not render a close affordance for disabled tabs', () => {
    const { container } = render(
      <Tabset onTabClose={jest.fn()}>
        <Tabset.Tab title="Locked" closable disabled>
          Locked content
        </Tabset.Tab>
      </Tabset>
    );

    expect(container.querySelector('[title="Close Locked"]')).not.toBeInTheDocument();
  });

  it('keeps inactive panels mounted with keepMounted', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState('');

      return (
        <Tabset keepMounted lazyLoad>
          <Tabset.Tab title="Draft">
            <input
              aria-label="Draft title"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
          </Tabset.Tab>
          <Tabset.Tab title="Preview">Preview content</Tabset.Tab>
        </Tabset>
      );
    }

    render(<Harness />);

    const input = screen.getByLabelText('Draft title');
    await user.type(input, 'Hello');

    await user.click(screen.getByRole('tab', { name: 'Preview' }));
    expect(screen.getByLabelText('Draft title')).not.toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Draft' }));
    expect(screen.getByLabelText('Draft title')).toHaveValue('Hello');
  });

  it('supports custom close labels', () => {
    const { container } = render(
      <Tabset onTabClose={jest.fn()} closeLabel={(title) => `Fechar ${title}`}>
        <Tabset.Tab title="Conta" closable>
          Conta
        </Tabset.Tab>
      </Tabset>
    );

    expect(container.querySelector('[title="Fechar Conta"]')).toBeInTheDocument();
  });

  it('has no accessibility violations with closable tabs', async () => {
    const { container } = render(
      <Tabset onTabClose={jest.fn()}>
        <Tabset.Tab title="First" closable>
          First content
        </Tabset.Tab>
        <Tabset.Tab title="Second">Second content</Tabset.Tab>
      </Tabset>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
