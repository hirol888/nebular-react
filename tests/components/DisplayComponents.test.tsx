import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Breadcrumbs,
  Descriptions,
  Divider,
  LoadingOverlay,
  ScrollArea,
  Spoiler,
  Stat,
  Timeline
} from '@nebular-react/core';

describe('new display components', () => {
  it('Divider exposes separator semantics and label', () => {
    render(<Divider label="Section" labelPosition="left" />);

    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('Breadcrumbs renders navigation with current page', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '#' },
          { label: 'Users', href: '#' },
          { label: 'Details' }
        ]}
      />
    );

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Details')).toHaveAttribute('aria-current', 'page');
  });

  it('Stat renders label, value and trend', () => {
    render(
      <Stat
        label="Active users"
        value="12,430"
        trend={{ value: '+12%', direction: 'up' }}
        hint="vs last month"
      />
    );

    expect(screen.getByLabelText('Active users')).toBeInTheDocument();
    expect(screen.getByText('12,430')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('Timeline renders ordered items', () => {
    render(
      <Timeline
        items={[
          { title: 'Created', time: '09:00' },
          { title: 'Verified', time: '09:15' }
        ]}
      />
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('09:15')).toBeInTheDocument();
  });

  it('Descriptions renders term/value pairs', () => {
    render(
      <Descriptions
        columns={2}
        items={[
          { label: 'Name', value: 'Alice' },
          { label: 'E-mail', value: 'alice@example.com' }
        ]}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('LoadingOverlay toggles the status region', () => {
    const { rerender } = render(<LoadingOverlay visible>Content</LoadingOverlay>);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();

    rerender(<LoadingOverlay visible={false}>Content</LoadingOverlay>);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('Spoiler expands and collapses', async () => {
    const user = userEvent.setup();

    render(
      <Spoiler maxHeight={20} showLabel="Show more" hideLabel="Show less">
        Long content
      </Spoiler>
    );

    const button = screen.getByRole('button', { name: 'Show more' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);

    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('ScrollArea renders children and applies max height', () => {
    render(
      <ScrollArea maxHeight={120} aria-label="Scrollable">
        <div>Content</div>
      </ScrollArea>
    );

    expect(screen.getByLabelText('Scrollable')).toHaveStyle({ maxHeight: '120px' });
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has no accessibility violations in representative display components', async () => {
    const { container } = render(
      <div>
        <Divider label="Section" />
        <Breadcrumbs
          items={[{ label: 'Home', href: '#' }, { label: 'Users' }]}
        />
        <Stat label="Users" value="10" />
        <Timeline items={[{ title: 'Created' }]} />
        <Descriptions items={[{ label: 'Name', value: 'Alice' }]} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
