import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ChatSources } from '@nebular-react/core';

describe('ChatSources', () => {
  it('maintains ordered citations, expands, and filters unsafe destinations', async () => {
    const user = userEvent.setup();
    const onSourceClick = jest.fn();
    const { container } = render(
      <ChatSources
        defaultExpanded={false}
        items={[
          { id: 'policy', title: 'Reference guide', href: '/guide', excerpt: 'A useful excerpt.' },
          { id: 'unsafe', title: 'External text', href: 'data:text/html,Blocked%20content' }
        ]}
        onSourceClick={onSourceClick}
      />
    );
    const trigger = screen.getByRole('button', { name: 'Sources (2)' });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    await user.click(trigger);
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Reference guide' })).toHaveAttribute('href', '/guide');
    expect(screen.getByText('A useful excerpt.')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'External text' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'External text' }));
    expect(onSourceClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'unsafe' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
