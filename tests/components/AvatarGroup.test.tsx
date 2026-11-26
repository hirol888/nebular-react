import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { AvatarGroup } from '@nebular-react/core';

const avatars = ['AL', 'BK', 'CM', 'DR', 'ES', 'FT'];

function renderAvatars(count: number) {
  return avatars.slice(0, count).map((initials) => <span key={initials}>{initials}</span>);
}

describe('AvatarGroup', () => {
  it('renders every avatar when the count fits the default max', () => {
    render(<AvatarGroup>{renderAvatars(3)}</AvatarGroup>);

    expect(screen.getByText('AL')).toBeInTheDocument();
    expect(screen.getByText('BK')).toBeInTheDocument();
    expect(screen.getByText('CM')).toBeInTheDocument();
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('limits the visible avatars to max and shows the remaining count', () => {
    render(<AvatarGroup>{renderAvatars(6)}</AvatarGroup>);

    expect(screen.getByText('DR')).toBeInTheDocument();
    expect(screen.queryByText('ES')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('respects a custom max', () => {
    render(<AvatarGroup max={2}>{renderAvatars(5)}</AvatarGroup>);

    expect(screen.getByText('BK')).toBeInTheDocument();
    expect(screen.queryByText('CM')).not.toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('uses total to compute the hidden count', () => {
    render(
      <AvatarGroup max={2} total={10}>
        {renderAvatars(3)}
      </AvatarGroup>
    );

    expect(screen.getByText('+8')).toBeInTheDocument();
  });

  it('renders every avatar and no counter when showMore is false', () => {
    render(
      <AvatarGroup max={2} showMore={false}>
        {renderAvatars(4)}
      </AvatarGroup>
    );

    expect(screen.getByText('DR')).toBeInTheDocument();
    expect(screen.queryByText('+2')).not.toBeInTheDocument();
  });

  it('renders a custom more indicator with the hidden count', () => {
    render(
      <AvatarGroup
        max={2}
        total={6}
        renderMore={(count) => <span>more {count}</span>}
        data-testid="avatar-group"
      >
        {renderAvatars(3)}
      </AvatarGroup>
    );

    expect(screen.getByText('more 4')).toBeInTheDocument();
  });

  it('exposes group semantics with a default label', () => {
    render(<AvatarGroup>{renderAvatars(2)}</AvatarGroup>);

    expect(screen.getByRole('group', { name: 'Avatar group' })).toBeInTheDocument();
  });

  it('allows overriding the group label', () => {
    render(<AvatarGroup aria-label="Project members">{renderAvatars(2)}</AvatarGroup>);

    expect(screen.getByRole('group', { name: 'Project members' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AvatarGroup total={12}>{renderAvatars(3)}</AvatarGroup>);

    expect(await axe(container)).toHaveNoViolations();
  });
});
