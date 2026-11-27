import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverflowList } from '@nebular-react/core';

describe('OverflowList', () => {
  it('moves focus to the disclosure when a focused item becomes hidden and keeps it usable', async () => {
    const user = userEvent.setup();
    let width = 200;
    const bounds = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const size = this.hasAttribute('data-overflow-row') ? width : 52;
        return { width: size } as DOMRect;
      });

    try {
      render(
        <OverflowList
          items={['Edit', 'Share', 'Archive']}
          getItemKey={(item) => item}
          renderItem={(item) => <button type="button">{item}</button>}
        />
      );
      await user.tab();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Share' })).toHaveFocus();

      act(() => {
        width = 120;
        window.dispatchEvent(new Event('resize'));
      });
      const more = screen.getByRole('button', { name: 'Show 2 more items' });
      expect(more).toHaveFocus();
      expect(screen.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();
      await user.keyboard('{Enter}');
      expect(more).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('button', { name: 'Share' })).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(more).toHaveAttribute('aria-expanded', 'false');
      expect(more).toHaveFocus();
    } finally {
      bounds.mockRestore();
    }
  });
});
