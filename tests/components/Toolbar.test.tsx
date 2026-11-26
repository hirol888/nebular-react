import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button, Toolbar } from '@nebular-react/core';

describe('Toolbar', () => {
  it('uses one tab stop, skips disabled items and returns via the last focused item', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <Toolbar aria-label="Formatting">
          <Toolbar.Item>
            <Button>Bold</Button>
          </Toolbar.Item>
          <Toolbar.Item>
            <Button disabled>Underline</Button>
          </Toolbar.Item>
          <Toolbar.Item>
            <a href="#link">Help</a>
          </Toolbar.Item>
        </Toolbar>
        <button type="button">Next</button>
      </>
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('link', { name: 'Help' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('link', { name: 'Help' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('recovers its tab stop when the active item is removed', async () => {
    const user = userEvent.setup();
    function Example({ show }: { show: boolean }) {
      return (
        <Toolbar aria-label="View" orientation="vertical" loop={false}>
          {show && (
            <Toolbar.Item key="first">
              <Button>First</Button>
            </Toolbar.Item>
          )}
          <Toolbar.Item key="last">
            <Button>Last</Button>
          </Toolbar.Item>
        </Toolbar>
      );
    }
    const { rerender } = render(<Example show />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    rerender(<Example show={false} />);
    expect(screen.getByRole('button', { name: 'Last' })).toHaveAttribute('tabindex', '0');
  });
});
