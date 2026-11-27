import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Popover, PopoverProps, PopoverRef } from '@nebular-react/core';

interface PopoverExampleProps {
  triggerLabel?: string;
  popoverProps?: Omit<PopoverProps, 'triggerRef' | 'children'>;
  children?: React.ReactNode;
}

function PopoverExample({
  triggerLabel = 'Open popover',
  popoverProps = {},
  children = 'Popover content'
}: PopoverExampleProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button type="button" ref={triggerRef}>
        {triggerLabel}
      </button>
      <Popover triggerRef={triggerRef} {...popoverProps}>
        {children}
      </Popover>
    </div>
  );
}

function ImperativePopoverExample({ onPopoverOpen }: { onPopoverOpen?: () => void }) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverRef = React.useRef<PopoverRef>(null);

  return (
    <div>
      <button type="button" ref={triggerRef}>
        Anchor
      </button>
      <button type="button" onClick={() => popoverRef.current?.show()}>
        Show popover
      </button>
      <button type="button" onClick={() => popoverRef.current?.hide()}>
        Hide popover
      </button>
      <Popover
        ref={popoverRef}
        triggerRef={triggerRef}
        trigger="noop"
        onPopoverOpen={onPopoverOpen}
      >
        Manual popover
      </Popover>
    </div>
  );
}

describe('Popover', () => {
  it('opens on trigger click and closes on a second click', async () => {
    const user = userEvent.setup();
    const onPopoverOpen = jest.fn();
    const onPopoverClose = jest.fn();

    render(<PopoverExample popoverProps={{ onPopoverOpen, onPopoverClose }} />);

    expect(screen.queryByText('Popover content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open popover' }));

    expect(await screen.findByText('Popover content')).toBeInTheDocument();
    await waitFor(() => expect(onPopoverOpen).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'Open popover' }));

    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
    await waitFor(() => expect(onPopoverClose).toHaveBeenCalledTimes(1));
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    render(<PopoverExample />);

    await user.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(await screen.findByText('Popover content')).toBeInTheDocument();

    await user.click(document.body);

    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onPopoverOpen = jest.fn();
    const onPopoverClose = jest.fn();

    render(<PopoverExample popoverProps={{ onPopoverOpen, onPopoverClose }} />);

    await user.click(screen.getByRole('button', { name: 'Open popover' }));
    expect(await screen.findByText('Popover content')).toBeInTheDocument();
    await waitFor(() => expect(onPopoverOpen).toHaveBeenCalled());

    fireEvent.keyDown(document.body, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
    await waitFor(() => expect(onPopoverClose).toHaveBeenCalledTimes(1));
  });

  it('opens on hover and closes on mouse leave when trigger is hover', async () => {
    const onPopoverOpen = jest.fn();
    render(
      <PopoverExample triggerLabel="Hover me" popoverProps={{ trigger: 'hover', onPopoverOpen }} />
    );

    const trigger = screen.getByRole('button', { name: 'Hover me' });

    fireEvent.mouseEnter(trigger);
    expect(await screen.findByText('Popover content')).toBeInTheDocument();
    await waitFor(() => expect(onPopoverOpen).toHaveBeenCalled());

    fireEvent.mouseLeave(trigger);

    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('opens on focus and closes on blur when trigger is focus', async () => {
    const onPopoverOpen = jest.fn();
    render(
      <PopoverExample triggerLabel="Focus me" popoverProps={{ trigger: 'focus', onPopoverOpen }} />
    );

    const trigger = screen.getByRole('button', { name: 'Focus me' });

    fireEvent.focusIn(trigger);
    expect(await screen.findByText('Popover content')).toBeInTheDocument();
    await waitFor(() => expect(onPopoverOpen).toHaveBeenCalled());

    fireEvent.focusOut(trigger, { relatedTarget: document.body });

    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('can be opened and closed through its imperative handle', async () => {
    const user = userEvent.setup();
    const onPopoverOpen = jest.fn();
    render(<ImperativePopoverExample onPopoverOpen={onPopoverOpen} />);

    await user.click(screen.getByRole('button', { name: 'Show popover' }));
    expect(await screen.findByText('Manual popover')).toBeInTheDocument();
    await waitFor(() => expect(onPopoverOpen).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Hide popover' }));

    await waitFor(() => expect(screen.queryByText('Manual popover')).not.toBeInTheDocument());
  });

  it('forwards className and renders custom content', async () => {
    const user = userEvent.setup();
    render(
      <PopoverExample popoverProps={{ className: 'custom-popover' }}>
        <strong>Rich content</strong>
      </PopoverExample>
    );

    const trigger = screen.getByRole('button', { name: 'Open popover' });
    await user.click(trigger);
    expect(await screen.findByText('Rich content')).toBeInTheDocument();

    expect(document.querySelector('.custom-popover')).toHaveTextContent('Rich content');

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByText('Rich content')).not.toBeInTheDocument());
  });

  it('repositions when its content changes while open', async () => {
    const user = userEvent.setup();
    const onPopoverOpen = jest.fn();
    const { rerender } = render(
      <PopoverExample popoverProps={{ onPopoverOpen }}>Initial content</PopoverExample>
    );

    const trigger = screen.getByRole('button', { name: 'Open popover' });
    await user.click(trigger);
    expect(await screen.findByText('Initial content')).toBeInTheDocument();
    await waitFor(() => expect(onPopoverOpen).toHaveBeenCalled());

    rerender(<PopoverExample popoverProps={{ onPopoverOpen }}>Updated content</PopoverExample>);

    expect(await screen.findByText('Updated content')).toBeInTheDocument();
    expect(screen.queryByText('Initial content')).not.toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByText('Updated content')).not.toBeInTheDocument());
  });

  const positionCases: Array<[PopoverProps['position'], string]> = [
    ['top', 'nebular-popover-overlayTop'],
    ['top-start', 'nebular-popover-overlayTopStart'],
    ['top-end', 'nebular-popover-overlayTopEnd'],
    ['right', 'nebular-popover-overlayRight'],
    ['end', 'nebular-popover-overlayRight'],
    ['end-top', 'nebular-popover-overlayEndTop'],
    ['end-bottom', 'nebular-popover-overlayEndBottom'],
    ['bottom', 'nebular-popover-overlayBottom'],
    ['bottom-start', 'nebular-popover-overlayBottomStart'],
    ['bottom-end', 'nebular-popover-overlayBottomEnd'],
    ['left', 'nebular-popover-overlayLeft'],
    ['start', 'nebular-popover-overlayLeft'],
    ['start-top', 'nebular-popover-overlayStartTop'],
    ['start-bottom', 'nebular-popover-overlayStartBottom']
  ];

  it.each(positionCases)('positions the arrow for %s', async (position, expectedClass) => {
    const user = userEvent.setup();
    const onPopoverOpen = jest.fn();
    const triggerLabel = `Open ${position}`;
    const arrowClass = `arrow-${position}`;

    render(
      <PopoverExample
        triggerLabel={triggerLabel}
        popoverProps={{
          position,
          classNames: { arrow: arrowClass },
          onPopoverOpen
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: triggerLabel });
    await user.click(trigger);
    await screen.findByText('Popover content');
    await waitFor(() => expect(onPopoverOpen).toHaveBeenCalled());

    const arrow = document.querySelector(`.${arrowClass}`) as HTMLElement;

    expect(arrow).not.toBeNull();
    await waitFor(() => expect(arrow).toHaveClass(expectedClass));

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('applies custom padding to the content container', async () => {
    const user = userEvent.setup();
    render(
      <PopoverExample
        popoverProps={{
          padding: '1rem 2rem',
          classNames: { textContainer: 'popover-text-container' }
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Open popover' });
    await user.click(trigger);
    await screen.findByText('Popover content');

    const textContainer = document.querySelector('.popover-text-container') as HTMLElement;

    expect(getComputedStyle(textContainer).padding).toBe('1rem 2rem');

    await user.click(trigger);
    await waitFor(() => expect(screen.queryByText('Popover content')).not.toBeInTheDocument());
  });

  it('has no accessibility violations', async () => {
    const user = userEvent.setup();
    render(
      <PopoverExample
        popoverProps={{
          role: 'dialog',
          'aria-label': 'Account details',
          transitionDuration: 0
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Open popover' });
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Account details' });
    expect(await axe(dialog)).toHaveNoViolations();

    await user.click(trigger);
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Account details' })).not.toBeInTheDocument()
    );
  });
});
