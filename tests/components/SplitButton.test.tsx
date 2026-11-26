import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SplitButton } from '@nebular-react/core';

const createItems = (onEdit = jest.fn(), onDuplicate = jest.fn()) => [
  { key: 'edit', label: 'Edit', onClick: onEdit },
  { key: 'duplicate', label: 'Duplicate', icon: <span>c</span>, onClick: onDuplicate },
  { key: 'delete', label: 'Delete', disabled: true }
];

describe('SplitButton', () => {
  it('SplitButton_Render_ShouldRenderMainActionAndMenuTrigger', () => {
    render(<SplitButton label="Save" onClick={() => undefined} items={createItems()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'More actions' });

    expect(toggle).toHaveAttribute('aria-haspopup', 'menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('SplitButton_MainClick_ShouldInvokeOnClick', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<SplitButton label="Save" onClick={onClick} items={createItems()} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('SplitButton_MenuTrigger_ShouldOpenMenuWithAllItems', async () => {
    const user = userEvent.setup();

    render(<SplitButton label="Save" items={createItems()} />);

    const toggle = screen.getByRole('button', { name: 'More actions' });

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDisabled();
  });

  it('SplitButton_ItemClick_ShouldInvokeItemHandlerCloseMenuAndRestoreFocus', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(<SplitButton label="Save" items={createItems(onEdit)} />);

    const toggle = screen.getByRole('button', { name: 'More actions' });

    await user.click(toggle);
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('SplitButton_KeyboardArrowDown_ShouldOpenMenuAndFocusFirstItem', async () => {
    const user = userEvent.setup();
    const onDuplicate = jest.fn();

    render(<SplitButton label="Save" items={createItems(jest.fn(), onDuplicate)} />);

    const toggle = screen.getByRole('button', { name: 'More actions' });

    toggle.focus();
    await user.keyboard('{ArrowDown}');

    const items = screen.getAllByRole('menuitem');

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(items[1]).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onDuplicate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('SplitButton_KeyboardEscape_ShouldCloseMenuAndRestoreFocus', async () => {
    const user = userEvent.setup();

    render(<SplitButton label="Save" items={createItems()} />);

    const toggle = screen.getByRole('button', { name: 'More actions' });

    toggle.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('SplitButton_ClickOutside_ShouldCloseMenu', async () => {
    const user = userEvent.setup();

    render(<SplitButton label="Save" items={createItems()} />);

    await user.click(screen.getByRole('button', { name: 'More actions' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('SplitButton_Disabled_ShouldDisableBothButtons', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const onEdit = jest.fn();

    render(<SplitButton label="Save" onClick={onClick} items={createItems(onEdit)} disabled />);

    const main = screen.getByRole('button', { name: 'Save' });
    const toggle = screen.getByRole('button', { name: 'More actions' });

    expect(main).toBeDisabled();
    expect(toggle).toBeDisabled();

    fireEvent.click(toggle);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('SplitButton_AriaLabels_ShouldNameGroupAndMenu', async () => {
    const user = userEvent.setup();

    render(
      <SplitButton
        label="Publish"
        ariaLabel="Publishing actions"
        menuAriaLabel="More publishing actions"
        items={createItems()}
      />
    );

    expect(screen.getByRole('group', { name: 'Publishing actions' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'More publishing actions' }));

    expect(screen.getByRole('menu', { name: 'More publishing actions' })).toBeInTheDocument();
  });

  it('SplitButton_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(<SplitButton label="Save" items={createItems()} />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('SplitButton_AccessibilityWhenOpen_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <SplitButton label="Save" ariaLabel="Document actions" items={createItems()} />
    );

    await user.click(screen.getByRole('button', { name: 'More actions' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
