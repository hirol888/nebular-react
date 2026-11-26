import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Menu, MenuItem } from '@nebular-react/core';

it('keeps nested menu links mounted and makes them inert when collapsed', async () => {
  const user = userEvent.setup();
  render(
    <Menu<false> multiple={false} initialExpanded="parent">
      <MenuItem id="parent" title="Parent">
        <MenuItem id="child" title="Child" href="/child" />
      </MenuItem>
    </Menu>
  );

  const parent = screen.getByRole('link', { name: 'Parent' });
  const child = screen.getByRole('link', { name: 'Child' });
  const originalSubmenu = child.closest('ul');

  expect(parent).toHaveAttribute('aria-expanded', 'true');
  expect(child.closest('[inert]')).toBeNull();

  await user.click(parent);
  expect(parent).toHaveAttribute('aria-expanded', 'false');
  expect(child.closest('[inert]')).not.toBeNull();
  expect(child).toBeInTheDocument();

  await user.click(parent);
  expect(parent).toHaveAttribute('aria-expanded', 'true');
  expect(child.closest('[inert]')).toBeNull();
  expect(child.closest('ul')).toBe(originalSubmenu);
});
