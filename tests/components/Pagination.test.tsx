import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Pagination, getPaginationRange } from '@nebular-react/core';

describe('Pagination', () => {
  it('renders the current page and changes page on click', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Pagination total={10} defaultPage={5} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Page 5' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    await user.click(screen.getByRole('button', { name: 'Page 6' }));

    expect(onChange).toHaveBeenCalledWith(6);
    expect(screen.getByRole('button', { name: 'Page 6' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('moves to the previous and next page', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<Pagination total={10} defaultPage={1} onChange={onChange} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('computes ranges with ellipsis', () => {
    expect(getPaginationRange(20, 10, 1, 1)).toEqual([
      1,
      'dots',
      9,
      10,
      11,
      'dots',
      20
    ]);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Pagination total={10} defaultPage={5} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
