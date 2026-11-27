import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import { WindowBreadcrumb } from '@nebular-react/core';
import type { WindowBreadcrumbItem } from '@nebular-react/core';

function createTrail(overrides?: Partial<WindowBreadcrumbItem>[]): WindowBreadcrumbItem[] {
  return [
    { key: 'one', label: 'One', href: '#one' },
    { key: 'two', label: 'Two' },
    { key: 'three', label: 'Three' },
    { key: 'four', label: 'Four' },
    { key: 'five', label: 'Five' },
    { key: 'six', label: 'Six' },
    { key: 'seven', label: 'Seven' }
  ].map((item, index) => ({ ...item, ...overrides?.[index] }));
}

describe('WindowBreadcrumb', () => {
  it('renders an ordered navigation trail with slots and current page semantics', () => {
    const onItemClick = jest.fn();

    render(
      <WindowBreadcrumb
        items={[
          { key: 'alpha', label: 'Alpha', href: '#alpha' },
          { key: 'beta', label: 'Beta', icon: <span data-testid="beta-icon">◆</span> },
          { key: 'gamma', label: 'Gamma' }
        ]}
        leading={<button type="button">Back</button>}
        trailing={<span>Actions</span>}
        ariaLabel="Location"
        onItemClick={onItemClick}
      />
    );

    const navigation = screen.getByRole('navigation', { name: 'Location' });
    expect(within(navigation).getByRole('list')).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: 'Alpha' })).toHaveAttribute(
      'href',
      '#alpha'
    );
    expect(within(navigation).getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: 'Beta' })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: 'Gamma' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(navigation).getByTestId('beta-icon')).toBeInTheDocument();
    expect(within(navigation).getByText('Actions')).toBeInTheDocument();
  });

  it('honors an explicit current item instead of the last item', () => {
    render(
      <WindowBreadcrumb
        items={[
          { key: 'alpha', label: 'Alpha' },
          { key: 'beta', label: 'Beta', current: true },
          { key: 'gamma', label: 'Gamma' }
        ]}
      />
    );

    expect(screen.getByRole('button', { name: 'Beta' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Gamma' })).not.toHaveAttribute('aria-current');
  });

  it('collapses middle items into an accessible menu and closes after activation', async () => {
    const user = userEvent.setup();
    const onItemClick = jest.fn();
    const onThreeClick = jest.fn();
    const items = createTrail([undefined, undefined, { onClick: onThreeClick }]);

    render(<WindowBreadcrumb items={items} onItemClick={onItemClick} />);

    expect(screen.getByRole('link', { name: 'One' })).toBeInTheDocument();
    expect(screen.queryByText('Two')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seven' })).toHaveAttribute('aria-current', 'page');

    const trigger = screen.getByRole('button', { name: 'Show hidden breadcrumb items' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu', { name: 'Hidden breadcrumb items' });
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent)
    ).toEqual(['Two', 'Three', 'Four']);

    await user.click(within(menu).getByRole('menuitem', { name: 'Three' }));

    expect(onThreeClick).toHaveBeenCalledTimes(1);
    expect(onItemClick).toHaveBeenCalledWith(items[2], 2);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('navigates the hidden menu with the keyboard and closes on Escape', async () => {
    const user = userEvent.setup();

    render(<WindowBreadcrumb items={createTrail()} />);

    const trigger = screen.getByRole('button', { name: 'Show hidden breadcrumb items' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');

    const menu = screen.getByRole('menu', { name: 'Hidden breadcrumb items' });
    const menuItems = within(menu).getAllByRole('menuitem');
    expect(menuItems[0]).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(menuItems[1]).toHaveFocus();

    await user.keyboard('{End}');
    expect(menuItems[2]).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps every item inline when collapse is disabled', () => {
    render(<WindowBreadcrumb items={createTrail()} collapse={false} maxItems={3} />);

    expect(screen.queryByRole('button', { name: 'Show hidden breadcrumb items' })).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
  });

  it('uses the pt-BR catalog for the overflow labels', async () => {
    const user = userEvent.setup();

    render(
      <NebularProvider locale="pt-BR">
        <WindowBreadcrumb items={createTrail()} />
      </NebularProvider>
    );

    expect(screen.getByRole('navigation', { name: 'Navegação estrutural' })).toBeInTheDocument();
    const trigger = screen.getByRole('button', {
      name: 'Mostrar itens ocultos da navegação estrutural'
    });
    await user.click(trigger);

    expect(
      screen.getByRole('menu', { name: 'Itens ocultos da navegação estrutural' })
    ).toBeInTheDocument();
  });

  it('has no accessibility violations with the hidden menu open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <WindowBreadcrumb
        items={createTrail()}
        leading={<button type="button">Back</button>}
        trailing={<input aria-label="Search" />}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Show hidden breadcrumb items' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
