import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DashboardGrid, DashboardLayoutItem, DashboardWidget } from '@nebular-react/core';

const widgets: DashboardWidget[] = [
  { id: 'sales', title: 'Sales', content: <p>Sales content</p>, columnSpan: 6, rowSpan: 2 },
  { id: 'users', title: 'Users', content: <p>Users content</p>, columnSpan: 3 },
  { id: 'alerts', title: 'Alerts', content: <p>Alerts content</p> }
];

const layout: DashboardLayoutItem[] = [
  { id: 'sales', columnSpan: 6, rowSpan: 2 },
  { id: 'users', columnSpan: 3, rowSpan: 1 },
  { id: 'alerts', columnSpan: 3, rowSpan: 1 }
];

const controlledLayout: DashboardLayoutItem[] = [
  { id: 'users', columnSpan: 12, rowSpan: 3 },
  { id: 'sales', columnSpan: 4, rowSpan: 1 },
  { id: 'alerts', columnSpan: 8, rowSpan: 1 }
];

const collectEmittedCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => {
      const sheetRules = style.sheet
        ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText)
        : [];

      return [style.textContent || '', ...sheetRules].join('\n');
    })
    .join('\n');

describe('DashboardGrid', () => {
  it('DashboardGrid_Render_ShouldUseDefaultsAndGridTemplate', () => {
    render(<DashboardGrid widgets={widgets} />);

    const grid = screen.getByRole('region', { name: 'Dashboard grid' });

    expect(grid).toHaveStyle({
      gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      gridAutoRows: '120px',
      gap: '16px'
    });

    expect(screen.getByRole('region', { name: 'Sales' })).toHaveStyle({
      gridColumn: 'span 6',
      gridRow: 'span 2'
    });
    expect(screen.getByRole('region', { name: 'Users' })).toHaveStyle({
      gridColumn: 'span 3',
      gridRow: 'span 1'
    });

    expect(screen.getByRole('heading', { name: 'Sales' })).toBeInTheDocument();
    expect(screen.getByText('Sales content')).toBeInTheDocument();
  });

  it('DashboardGrid_Options_ShouldApplyColumnsRowHeightAndGap', () => {
    render(<DashboardGrid widgets={widgets} columns={6} rowHeight={80} gap={8} />);

    expect(screen.getByRole('region', { name: 'Dashboard grid' })).toHaveStyle({
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
      gridAutoRows: '80px',
      gap: '8px'
    });
    expect(screen.getByRole('region', { name: 'Sales' })).toHaveStyle({
      gridColumn: 'span 6',
      gridRow: 'span 2'
    });
  });

  it('DashboardGrid_Layout_ShouldOverrideWidgetSpans', () => {
    render(<DashboardGrid widgets={widgets} layout={layout} />);

    expect(screen.getByRole('region', { name: 'Sales' })).toHaveStyle({
      gridColumn: 'span 6',
      gridRow: 'span 2'
    });
    expect(screen.getByRole('region', { name: 'Alerts' })).toHaveStyle({
      gridColumn: 'span 3',
      gridRow: 'span 1'
    });
  });

  it('DashboardGrid_Editable_ShouldResizeWidgetAndEmitLayout', async () => {
    const user = userEvent.setup();
    const onLayoutChange = jest.fn();

    render(<DashboardGrid widgets={widgets} editable onLayoutChange={onLayoutChange} />);

    await user.click(screen.getByRole('button', { name: 'Increase width of Sales' }));

    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: 'sales', columnSpan: 7, rowSpan: 2 },
      { id: 'users', columnSpan: 3, rowSpan: 1 },
      { id: 'alerts', columnSpan: 1, rowSpan: 1 }
    ]);
    expect(screen.getByRole('region', { name: 'Sales' })).toHaveStyle({
      gridColumn: 'span 7'
    });

    await user.click(screen.getByRole('button', { name: 'Decrease height of Sales' }));

    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: 'sales', columnSpan: 7, rowSpan: 1 },
      { id: 'users', columnSpan: 3, rowSpan: 1 },
      { id: 'alerts', columnSpan: 1, rowSpan: 1 }
    ]);
    expect(screen.getByRole('region', { name: 'Sales' })).toHaveStyle({ gridRow: 'span 1' });
  });

  it('DashboardGrid_Editable_ShouldReorderWidgetsAndEmitLayout', async () => {
    const user = userEvent.setup();
    const onLayoutChange = jest.fn();

    render(<DashboardGrid widgets={widgets} editable onLayoutChange={onLayoutChange} />);

    await user.click(screen.getByRole('button', { name: 'Move Users left' }));

    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: 'users', columnSpan: 3, rowSpan: 1 },
      { id: 'sales', columnSpan: 6, rowSpan: 2 },
      { id: 'alerts', columnSpan: 1, rowSpan: 1 }
    ]);
    expect(
      screen.getAllByRole('region').map((element) => element.getAttribute('aria-label'))
    ).toEqual(['Dashboard grid', 'Users', 'Sales', 'Alerts']);

    await user.click(screen.getByRole('button', { name: 'Move Users right' }));

    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: 'sales', columnSpan: 6, rowSpan: 2 },
      { id: 'users', columnSpan: 3, rowSpan: 1 },
      { id: 'alerts', columnSpan: 1, rowSpan: 1 }
    ]);
  });

  it('DashboardGrid_Editable_ShouldDisableBoundaryControls', () => {
    const boundaryLayout: DashboardLayoutItem[] = [
      { id: 'sales', columnSpan: 12, rowSpan: 1 },
      { id: 'users', columnSpan: 1, rowSpan: 1 },
      { id: 'alerts', columnSpan: 1, rowSpan: 1 }
    ];

    render(<DashboardGrid widgets={widgets} layout={boundaryLayout} editable />);

    expect(screen.getByRole('button', { name: 'Move Sales left' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Alerts right' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease height of Users' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Decrease width of Alerts' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase width of Sales' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase width of Alerts' })).toBeEnabled();
  });

  it('DashboardGrid_ControlledLayout_ShouldOnlyEmitChanges', async () => {
    const user = userEvent.setup();
    const onLayoutChange = jest.fn();

    render(
      <DashboardGrid
        widgets={widgets}
        layout={controlledLayout}
        editable
        onLayoutChange={onLayoutChange}
      />
    );

    expect(screen.getByRole('region', { name: 'Sales' })).toHaveStyle({
      gridColumn: 'span 4',
      gridRow: 'span 1'
    });

    await user.click(screen.getByRole('button', { name: 'Increase width of Sales' }));

    expect(onLayoutChange).toHaveBeenLastCalledWith([
      { id: 'users', columnSpan: 12, rowSpan: 3 },
      { id: 'sales', columnSpan: 5, rowSpan: 1 },
      { id: 'alerts', columnSpan: 8, rowSpan: 1 }
    ]);
    expect(screen.getByRole('region', { name: 'Sales' })).toHaveStyle({
      gridColumn: 'span 4'
    });
  });

  it('DashboardGrid_NotEditable_ShouldNotRenderControls', () => {
    render(<DashboardGrid widgets={widgets} />);

    expect(
      screen.queryByRole('button', { name: 'Increase width of Sales' })
    ).not.toBeInTheDocument();
  });

  it('DashboardGrid_MobileFallback_ShouldCollapseToSingleColumn', () => {
    const { container } = render(<DashboardGrid widgets={widgets} />);

    expect(container.querySelector('.nebular-dashboard-grid-root')).not.toBeNull();
    expect(container.querySelectorAll('.nebular-dashboard-grid-widget')).toHaveLength(3);

    const css = collectEmittedCss();

    expect(css).toMatch(/@media\s*\(max-width:\s*719px\)/);
    expect(css).toMatch(/grid-template-columns:\s*minmax\(0, 1fr\)\s*!important/);
    expect(css).toMatch(/grid-column:\s*span 1\s*!important/);
  });

  it('DashboardGrid_RenderWidget_ShouldRenderCustomContent', () => {
    render(
      <DashboardGrid widgets={widgets} renderWidget={(widget) => <div>Widget {widget.id}</div>} />
    );

    expect(screen.getByText('Widget sales')).toBeInTheDocument();
    expect(screen.getByText('Widget users')).toBeInTheDocument();
    expect(screen.queryByText('Sales content')).not.toBeInTheDocument();
  });

  it('DashboardGrid_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <DashboardGrid widgets={widgets} layout={layout} editable ariaLabel="Analytics board" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
