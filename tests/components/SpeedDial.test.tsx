import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SpeedDial } from '@nebular-react/core';

const createActions = (onShare = jest.fn(), onCopy = jest.fn()) => [
  { key: 'share', label: 'Share', icon: <span>+</span>, onClick: onShare },
  { key: 'copy', label: 'Copy link', icon: <span>c</span>, onClick: onCopy },
  { key: 'archive', label: 'Archive', icon: <span>o</span>, disabled: true }
];

describe('SpeedDial', () => {
  it('SpeedDial_Closed_ShouldRenderTriggerWithCollapsedState', () => {
    render(<SpeedDial actions={createActions()} ariaLabel="Quick actions" />);

    const trigger = screen.getByRole('button', { name: 'Quick actions' });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('SpeedDial_Click_ShouldExpandActions', async () => {
    const user = userEvent.setup();

    render(<SpeedDial actions={createActions()} ariaLabel="Quick actions" />);

    const trigger = screen.getByRole('button', { name: 'Quick actions' });

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: 'Share' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Copy link' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toBeDisabled();
    expect(screen.getByText('Share')).toHaveAttribute('data-speed-dial-label');
  });

  it('SpeedDial_ActionClick_ShouldInvokeHandlerCollapseAndRestoreFocus', async () => {
    const user = userEvent.setup();
    const onShare = jest.fn();

    render(<SpeedDial actions={createActions(onShare)} ariaLabel="Quick actions" />);

    const trigger = screen.getByRole('button', { name: 'Quick actions' });

    await user.click(trigger);
    await user.click(screen.getByRole('menuitem', { name: 'Share' }));

    expect(onShare).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    expect(trigger).toHaveFocus();
  });

  it('SpeedDial_DisabledAction_ShouldNotFireHandlerNorCollapse', async () => {
    const user = userEvent.setup();

    render(<SpeedDial actions={createActions()} ariaLabel="Quick actions" />);

    await user.click(screen.getByRole('button', { name: 'Quick actions' }));

    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quick actions' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('SpeedDial_DefaultOpened_ShouldRenderExpandedOnMount', () => {
    render(<SpeedDial actions={createActions()} ariaLabel="Quick actions" defaultOpened />);

    expect(screen.getByRole('button', { name: 'Quick actions' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('SpeedDial_Uncontrolled_ShouldReportOpenChanges', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    render(
      <SpeedDial actions={createActions()} ariaLabel="Quick actions" onOpenChange={onOpenChange} />
    );

    const trigger = screen.getByRole('button', { name: 'Quick actions' });

    await user.click(trigger);

    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(trigger);

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('SpeedDial_Controlled_ShouldRespectOpenedProp', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();

    render(
      <SpeedDial
        actions={createActions()}
        ariaLabel="Quick actions"
        opened={false}
        onOpenChange={onOpenChange}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Quick actions' });

    await user.click(trigger);

    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('SpeedDial_Keyboard_ShouldOpenNavigateActivateAndEscape', async () => {
    const user = userEvent.setup();
    const onShare = jest.fn();
    const onCopy = jest.fn();

    render(
      <SpeedDial
        actions={createActions(onShare, onCopy)}
        ariaLabel="Quick actions"
        direction="left"
      />
    );

    const trigger = screen.getByRole('button', { name: 'Quick actions' });

    trigger.focus();
    await user.keyboard('{ArrowDown}');

    const items = screen.getAllByRole('menuitem');

    expect(items[0]).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Escape}');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(onShare).not.toHaveBeenCalled();
  });

  it('SpeedDial_DirectionAndPosition_ShouldExposeDataAttributes', () => {
    const { container } = render(
      <SpeedDial
        actions={createActions()}
        ariaLabel="Quick actions"
        direction="left"
        position="top-start"
      />
    );

    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveAttribute('data-direction', 'left');
    expect(root).toHaveAttribute('data-position', 'top-start');
    expect(root).toHaveAttribute('data-opened', 'false');
  });

  it('SpeedDial_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(<SpeedDial actions={createActions()} ariaLabel="Quick actions" />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('SpeedDial_AccessibilityWhenOpen_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();

    const { container } = render(<SpeedDial actions={createActions()} defaultOpened />);

    await user.click(screen.getByRole('button', { name: 'Speed dial' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
