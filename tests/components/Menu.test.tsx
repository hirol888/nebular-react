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

it('renders a custom component action without a link and calls both handlers', async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  const onClick = jest.fn();
  render(
    <Menu multiple={false} onSelect={onSelect}>
      <MenuItem component="button" id="logout" title="Logout" onClick={onClick} />
    </Menu>
  );

  const button = screen.getByRole('button', { name: 'Logout' });
  expect(button.tagName).toBe('BUTTON');
  expect(button).not.toHaveAttribute('component');

  await user.click(button);

  expect(onSelect).toHaveBeenCalledWith('logout');
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('calls menu selection and the consumer onClick for linked items', async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();
  const onClick = jest.fn((event: React.MouseEvent<HTMLElement>) => event.preventDefault());
  render(
    <Menu multiple={false} onSelect={onSelect}>
      <MenuItem id="docs" title="Docs" href="/docs" onClick={onClick} />
    </Menu>
  );

  await user.click(screen.getByRole('link', { name: 'Docs' }));

  expect(onSelect).toHaveBeenCalledWith('docs');
  expect(onClick).toHaveBeenCalledTimes(1);
});
