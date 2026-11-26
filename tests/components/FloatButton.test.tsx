import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// Internal unit is imported directly because the public entry point does not expose it yet.
import { FloatButton } from '@nebular-react/core';

describe('FloatButton', () => {
  it('FloatButton_Render_ShouldRenderIconAndVisibleLabel', () => {
    render(<FloatButton icon={<span>+</span>} label="Compose" />);

    const button = screen.getByRole('button', { name: 'Compose' });

    expect(button).toBeInTheDocument();
    expect(screen.getByText('Compose')).toBeVisible();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('FloatButton_AriaLabel_ShouldOverrideTheVisibleLabel', () => {
    render(<FloatButton icon={<span>+</span>} label="Compose" ariaLabel="Create new item" />);

    expect(screen.getByRole('button', { name: 'Create new item' })).toBeInTheDocument();
  });

  it('FloatButton_IconOnly_ShouldExposeADefaultAccessibleName', () => {
    render(<FloatButton icon={<span>+</span>} />);

    expect(screen.getByRole('button', { name: 'Floating action' })).toBeInTheDocument();
  });

  it('FloatButton_Href_ShouldRenderALinkWithTargetAndRel', () => {
    render(<FloatButton href="https://example.com" target="_blank" label="Docs" />);

    const link = screen.getByRole('link', { name: 'Docs' });

    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('FloatButton_Click_ShouldInvokeOnClick', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<FloatButton label="Add" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('FloatButton_Badge_ShouldRenderTheBadgeValue', () => {
    render(<FloatButton label="Cart" badge={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('FloatButton_StringBadge_ShouldRenderTheBadgeValue', () => {
    render(<FloatButton label="Messages" badge="99+" />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('FloatButton_PositionShapeAndSize_ShouldExposeTheSelectedOptions', () => {
    render(<FloatButton label="Add" position="top-start" shape="square" size="lg" />);

    const button = screen.getByRole('button', { name: 'Add' });

    expect(button).toHaveAttribute('data-position', 'top-start');
    expect(button).toHaveAttribute('data-shape', 'square');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(getComputedStyle(button).position).toBe('fixed');
    expect(getComputedStyle(button).getPropertyValue('top')).toBe('24px');
  });

  it('FloatButton_Children_ShouldRenderCustomContent', () => {
    render(
      <FloatButton ariaLabel="Favorite">
        <span>★</span>
      </FloatButton>
    );

    expect(screen.getByRole('button', { name: 'Favorite' })).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });

  it('FloatButton_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(<FloatButton icon={<span>+</span>} label="Compose" badge={2} />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('FloatButton_IconOnlyAccessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(<FloatButton icon={<span>+</span>} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
