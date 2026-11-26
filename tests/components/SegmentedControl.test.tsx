import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SegmentedControl } from '@nebular-react/core';

describe('SegmentedControl', () => {
  it('supports controlled and uncontrolled values', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { rerender } = render(
      <SegmentedControl ariaLabel="View" data={['List', 'Grid']} value="List" onChange={onChange} />
    );

    await user.click(screen.getByRole('radio', { name: 'Grid' }));

    expect(onChange).toHaveBeenCalledWith('Grid');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');

    rerender(
      <SegmentedControl ariaLabel="View" data={['List', 'Grid']} value="Grid" onChange={onChange} />
    );
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveAttribute('aria-checked', 'true');
  });

  it('uses the first item as default and supports object items', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SegmentedControl
        ariaLabel="Density"
        data={[
          { label: <span>Compact</span>, value: 'compact' },
          { label: 'Comfortable', value: 'comfortable' },
          { label: 'Disabled', value: 'disabled', disabled: true }
        ]}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('radio', { name: 'Compact' })).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('radio', { name: 'Disabled' }));
    expect(onChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('radio', { name: 'Comfortable' }));
    expect(onChange).toHaveBeenCalledWith('comfortable');
  });

  it('moves selection with the arrow keys, wrapping and skipping disabled items', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SegmentedControl
        ariaLabel="Alignment"
        data={[
          { label: 'Left', value: 'left', disabled: true },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' }
        ]}
        defaultValue="right"
        onChange={onChange}
      />
    );

    const right = screen.getByRole('radio', { name: 'Right' });
    right.focus();

    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('center');
    expect(screen.getByRole('radio', { name: 'Center' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('right');
    expect(screen.getByRole('radio', { name: 'Right' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('center');
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('right');
  });

  it('ignores unrelated keys and does nothing when every item is disabled', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <SegmentedControl
        ariaLabel="Status"
        data={[
          { label: 'On', value: 'on', disabled: true },
          { label: 'Off', value: 'off', disabled: true }
        ]}
        onChange={onChange}
      />
    );

    screen.getByRole('radio', { name: 'On' }).focus();
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{Enter}');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders layout and disabled variants accessibly', async () => {
    const { container } = render(
      <SegmentedControl
        ariaLabel="Layout"
        data={['One', 'Two']}
        size="small"
        fullWidth
        disabled
        className="custom"
      />
    );

    expect(container.firstElementChild).toHaveClass('custom');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders an empty group without items', () => {
    render(<SegmentedControl data={[]} />);

    expect(screen.getByRole('radiogroup', { name: 'Segmented control' })).toBeEmptyDOMElement();
  });
});
