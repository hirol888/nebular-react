import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DesktopWidgets, type DesktopWidget } from '@nebular-react/core';

const widgets: DesktopWidget[] = [
  {
    id: 'clock',
    title: 'Clock',
    description: 'Local time',
    icon: <span>c</span>,
    content: <p>09:41</p>
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Scratchpad',
    defaultCollapsed: true,
    content: <p>Draft notes</p>
  }
];

describe('DesktopWidgets', () => {
  it('renders the panel header, count and widget cards', () => {
    render(<DesktopWidgets widgets={widgets} onClose={jest.fn()} />);

    const region = screen.getByRole('region', { name: 'Widgets' });

    expect(within(region).getByRole('heading', { name: 'Widgets' })).toBeInTheDocument();
    expect(within(region).getByText('2')).toBeInTheDocument();
    expect(within(region).getByRole('heading', { name: 'Clock' })).toBeInTheDocument();
    expect(within(region).getByText('Local time')).toBeInTheDocument();
    expect(within(region).getByText('09:41')).toBeVisible();
    expect(within(region).getByText('Draft notes')).not.toBeVisible();
    expect(within(region).getByRole('button', { name: 'Toggle widgets: Notes' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('collapses and expands the panel in uncontrolled mode', async () => {
    const user = userEvent.setup();

    render(<DesktopWidgets widgets={widgets} />);

    const toggle = screen.getByRole('button', { name: 'Toggle widgets' });

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('09:41')).toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('09:41')).not.toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('09:41')).toBeVisible();
  });

  it('follows a controlled collapsed state and reports toggle requests', async () => {
    const user = userEvent.setup();
    const onCollapsedChange = jest.fn();
    const { rerender } = render(
      <DesktopWidgets widgets={widgets} collapsed={false} onCollapsedChange={onCollapsedChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Toggle widgets' }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Toggle widgets' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    rerender(<DesktopWidgets widgets={widgets} collapsed onCollapsedChange={onCollapsedChange} />);

    expect(screen.getByRole('button', { name: 'Toggle widgets' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('expands a widget card that starts collapsed', async () => {
    const user = userEvent.setup();

    render(<DesktopWidgets widgets={widgets} />);

    const cardToggle = screen.getByRole('button', { name: 'Toggle widgets: Notes' });

    expect(screen.getByText('Draft notes')).not.toBeVisible();

    await user.click(cardToggle);

    expect(cardToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Draft notes')).toBeVisible();
  });

  it('calls onClose from the close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<DesktopWidgets widgets={widgets} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state and has no accessibility violations', async () => {
    const { container } = render(<DesktopWidgets widgets={[]} />);

    expect(screen.getByText('No widgets')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
