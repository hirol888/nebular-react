import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { AppShell } from '@nebular-react/core';

describe('AppShell', () => {
  it('AppShell_Render_ShouldRenderAllShellRegions', () => {
    render(
      <AppShell
        header={<span>Header content</span>}
        navbar={<span>Navbar content</span>}
        aside={<span>Aside content</span>}
        footer={<span>Footer content</span>}
      >
        <p>Main content</p>
      </AppShell>
    );

    expect(screen.getByText('Header content')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveTextContent(
      'Navbar content'
    );
    expect(screen.getByRole('complementary', { name: 'Aside' })).toHaveTextContent('Aside content');
    expect(screen.getByRole('main')).toHaveTextContent('Main content');
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('AppShell_Render_ShouldRenderChildrenWithoutOptionalRegions', () => {
    render(<AppShell>Only content</AppShell>);

    expect(screen.getByRole('main')).toHaveTextContent('Only content');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Toggle navigation' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Toggle aside' })).not.toBeInTheDocument();
  });

  it('AppShell_ToggleNavigation_ShouldCollapseAndEmitChange', async () => {
    const user = userEvent.setup();
    const onNavbarCollapseChange = jest.fn();

    render(
      <AppShell
        navbar={<span>Navbar content</span>}
        onNavbarCollapseChange={onNavbarCollapseChange}
      >
        <p>Main content</p>
      </AppShell>
    );

    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toHaveAttribute(
      'data-collapsed',
      'true'
    );
    expect(onNavbarCollapseChange).toHaveBeenCalledTimes(1);
    expect(onNavbarCollapseChange).toHaveBeenCalledWith(true);

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(onNavbarCollapseChange).toHaveBeenLastCalledWith(false);
  });

  it('AppShell_ToggleAside_ShouldCollapseAndEmitChange', async () => {
    const user = userEvent.setup();
    const onAsideCollapseChange = jest.fn();

    render(
      <AppShell aside={<span>Aside content</span>} onAsideCollapseChange={onAsideCollapseChange}>
        <p>Main content</p>
      </AppShell>
    );

    const toggle = screen.getByRole('button', { name: 'Toggle aside' });

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('complementary', { name: 'Aside' })).toHaveAttribute(
      'data-collapsed',
      'true'
    );
    expect(onAsideCollapseChange).toHaveBeenCalledWith(true);
  });

  it('AppShell_ControlledCollapse_ShouldOnlyEmitChanges', async () => {
    const user = userEvent.setup();
    const onNavbarCollapseChange = jest.fn();
    const onAsideCollapseChange = jest.fn();

    const { rerender } = render(
      <AppShell
        navbar={<span>Navbar content</span>}
        aside={<span>Aside content</span>}
        navbarCollapsed
        asideCollapsed={false}
        onNavbarCollapseChange={onNavbarCollapseChange}
        onAsideCollapseChange={onAsideCollapseChange}
      >
        <p>Main content</p>
      </AppShell>
    );

    const navbarToggle = screen.getByRole('button', { name: 'Toggle navigation' });
    const asideToggle = screen.getByRole('button', { name: 'Toggle aside' });

    expect(navbarToggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(navbarToggle);

    expect(onNavbarCollapseChange).toHaveBeenCalledWith(false);
    expect(navbarToggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(asideToggle);

    expect(onAsideCollapseChange).toHaveBeenCalledWith(true);
    expect(asideToggle).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <AppShell
        navbar={<span>Navbar content</span>}
        aside={<span>Aside content</span>}
        navbarCollapsed={false}
        asideCollapsed
        onNavbarCollapseChange={onNavbarCollapseChange}
        onAsideCollapseChange={onAsideCollapseChange}
      >
        <p>Main content</p>
      </AppShell>
    );

    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Toggle aside' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('AppShell_WithoutNavbarToggle_ShouldNotRenderNavigationToggle', () => {
    render(
      <AppShell navbar={<span>Navbar content</span>} withNavbarToggle={false}>
        <p>Main content</p>
      </AppShell>
    );

    expect(screen.queryByRole('button', { name: 'Toggle navigation' })).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('AppShell_DefaultCollapsed_ShouldStartCollapsed', () => {
    render(
      <AppShell
        navbar={<span>Navbar content</span>}
        aside={<span>Aside content</span>}
        defaultNavbarCollapsed
        defaultAsideCollapsed
      >
        <p>Main content</p>
      </AppShell>
    );

    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Toggle aside' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('AppShell_AccessibleName_ShouldLabelTheShell', async () => {
    const { container } = render(
      <AppShell
        ariaLabel="Application shell"
        header={<span>Header content</span>}
        navbar={<nav aria-label="Sections">Navbar content</nav>}
        aside={<span>Aside content</span>}
        footer={<span>Footer content</span>}
      >
        <p>Main content</p>
      </AppShell>
    );

    expect(screen.getByLabelText('Application shell')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
