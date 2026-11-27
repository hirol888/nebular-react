import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DesktopCalendarFlyout } from '@nebular-react/core';

function getDayCell(day: number): HTMLElement {
  return Array.from(document.querySelectorAll('.day-cell')).find(
    (cell) => cell.textContent === String(day) && !cell.classList.contains('bounding-month')
  ) as HTMLElement;
}

function FocusHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open calendar
      </button>
      <DesktopCalendarFlyout open={open} onClose={() => setOpen(false)} />
    </>
  );
}

describe('DesktopCalendarFlyout', () => {
  it('renders only while open', () => {
    const { rerender } = render(<DesktopCalendarFlyout open onClose={jest.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Calendar' })).toBeInTheDocument();

    rerender(<DesktopCalendarFlyout open={false} onClose={jest.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('centers on the viewport by default and focuses the dialog', () => {
    render(<DesktopCalendarFlyout open onClose={jest.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Calendar' });

    expect(dialog).toHaveFocus();
    expect(dialog).toHaveStyle({
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    });
    expect(screen.getByRole('button', { name: 'Close calendar' })).toBeInTheDocument();
  });

  it('positions itself from the anchor rectangle', () => {
    render(
      <DesktopCalendarFlyout
        open
        onClose={jest.fn()}
        anchorRect={{ left: 100, top: 50, width: 40, height: 20 }}
      />
    );

    expect(screen.getByRole('dialog')).toHaveStyle({
      left: '120px',
      top: '78px',
      transform: 'translateX(-50%)'
    });
  });

  it('positions above the anchor when placement is top', () => {
    render(
      <DesktopCalendarFlyout
        open
        onClose={jest.fn()}
        placement="top"
        anchorRect={{ left: 100, top: 50, width: 40, height: 20 }}
      />
    );

    expect(screen.getByRole('dialog')).toHaveStyle({
      left: '120px',
      top: '42px',
      transform: 'translate(-50%, -100%)'
    });
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<DesktopCalendarFlyout open onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <>
        <button type="button">Outside</button>
        <DesktopCalendarFlyout open onClose={onClose} />
      </>
    );

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the flyout', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<DesktopCalendarFlyout open onClose={onClose} />);

    await user.click(screen.getByRole('heading', { name: 'Calendar' }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('restores focus to the previously focused element when closed', async () => {
    const user = userEvent.setup();

    render(<FocusHarness />);

    const trigger = screen.getByRole('button', { name: 'Open calendar' });

    await user.click(trigger);

    expect(screen.getByRole('dialog')).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Close calendar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('emits the selected date', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <DesktopCalendarFlyout
        open
        onClose={jest.fn()}
        date={new Date(2026, 0, 15)}
        onDateChange={onDateChange}
      />
    );

    await waitFor(() => expect(getDayCell(20)).toBeTruthy());
    await user.click(getDayCell(20));

    expect(onDateChange).toHaveBeenCalledTimes(1);

    const selected = onDateChange.mock.calls[0][0] as Date;

    expect(selected.getDate()).toBe(20);
  });

  it('renders through a portal into the provided container', () => {
    const host = document.createElement('div');

    document.body.appendChild(host);

    const { container, unmount } = render(
      <DesktopCalendarFlyout open onClose={jest.fn()} container={host} />
    );
    const dialog = screen.getByRole('dialog', { name: 'Calendar' });

    expect(host).toContainElement(dialog);
    expect(container).not.toContainElement(dialog);

    unmount();
    expect(host).toBeEmptyDOMElement();
    host.remove();
  });

  it('keeps focus, Escape and outside clicks working inside a portal', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const host = document.createElement('div');

    document.body.appendChild(host);

    render(
      <>
        <button type="button">Outside</button>
        <DesktopCalendarFlyout open onClose={onClose} container={host} />
      </>
    );

    expect(screen.getByRole('dialog')).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(onClose).toHaveBeenCalledTimes(2);

    host.remove();
  });

  it('keeps its fixed positioning inside a portal', () => {
    const host = document.createElement('div');

    document.body.appendChild(host);

    render(
      <DesktopCalendarFlyout
        open
        onClose={jest.fn()}
        container={host}
        anchorRect={{ left: 100, top: 50, width: 40, height: 20 }}
      />
    );

    expect(screen.getByRole('dialog')).toHaveStyle({
      position: 'fixed',
      left: '120px',
      top: '78px'
    });

    host.remove();
  });

  it('restores focus after closing when rendered inside a portal', async () => {
    const user = userEvent.setup();
    const host = document.createElement('div');

    document.body.appendChild(host);

    function PortalFocusHarness() {
      const [open, setOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open calendar
          </button>
          <DesktopCalendarFlyout open={open} onClose={() => setOpen(false)} container={host} />
        </>
      );
    }

    render(<PortalFocusHarness />);

    const trigger = screen.getByRole('button', { name: 'Open calendar' });

    await user.click(trigger);
    expect(screen.getByRole('dialog')).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Close calendar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    host.remove();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DesktopCalendarFlyout open onClose={jest.fn()} date={new Date(2026, 0, 15)} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
