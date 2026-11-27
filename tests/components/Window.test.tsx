import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { WindowProvider, showWindow } from '@nebular-react/core';
import type { WindowConfig } from '@nebular-react/core';

function WindowHarness({ config }: { config: Partial<WindowConfig> }) {
  return (
    <WindowProvider>
      <button type="button" onClick={() => showWindow(config)}>
        Open window
      </button>
    </WindowProvider>
  );
}

async function openWindow(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Open window' }));
}

describe('Window', () => {
  // jsdom has no layout, so every element reports zero geometry. The focus trap
  // treats elements without geometry as hidden; stub a non-zero width so the
  // window behaves like it does in a real browser.
  let offsetWidthSpy: jest.SpyInstance;

  beforeAll(() => {
    offsetWidthSpy = jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(1);
  });

  afterAll(() => {
    offsetWidthSpy.mockRestore();
  });

  beforeEach(() => {
    document.querySelectorAll('.overlay-backdrop').forEach((element) => element.remove());
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('opens a window with dialog semantics, title and content', async () => {
    const user = userEvent.setup();

    render(<WindowHarness config={{ title: 'Compose', content: <p>Window body</p> }} />);
    await openWindow(user);

    const dialog = await screen.findByRole('dialog', { name: 'Compose' });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('Window body');
    expect(within(dialog).getByRole('button', { name: 'Minimize window' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Maximize window' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close window' })).toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Full screen window' })
    ).not.toBeInTheDocument();
  });

  it('falls back to a generic accessible name when the title is not a string', async () => {
    const user = userEvent.setup();

    render(
      <WindowHarness config={{ title: <strong>Custom title</strong>, content: 'Window body' }} />
    );
    await openWindow(user);

    expect(await screen.findByRole('dialog', { name: 'Window' })).toBeInTheDocument();
  });

  it('falls back to a generic accessible name when the title is missing', async () => {
    const user = userEvent.setup();

    render(<WindowHarness config={{ content: 'Window body' }} />);
    await openWindow(user);

    expect(await screen.findByRole('dialog', { name: 'Window' })).toBeInTheDocument();
  });

  it('moves focus into the window and restores it when closed', async () => {
    const user = userEvent.setup();
    const trigger = render(
      <WindowHarness config={{ title: 'Compose', content: 'Window body' }} />
    ).getByRole('button', { name: 'Open window' });

    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Compose' });

    expect(dialog.querySelector('[data-focus-initial]')).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: 'Close window' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape and restores focus', async () => {
    const user = userEvent.setup();
    const trigger = render(
      <WindowHarness config={{ title: 'Compose', content: 'Window body' }} />
    ).getByRole('button', { name: 'Open window' });

    await user.click(trigger);
    await screen.findByRole('dialog', { name: 'Compose' });

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('respects closeOnEsc', async () => {
    const user = userEvent.setup();

    render(
      <WindowHarness config={{ title: 'Compose', content: 'Window body', closeOnEsc: false }} />
    );
    await openWindow(user);
    await screen.findByRole('dialog', { name: 'Compose' });

    await user.keyboard('{Escape}');

    expect(screen.getByRole('dialog', { name: 'Compose' })).toBeInTheDocument();
  });

  it('transitions between full screen, maximized and minimized states', async () => {
    const user = userEvent.setup();

    render(<WindowHarness config={{ title: 'Compose', content: 'Window body' }} />);
    await openWindow(user);

    const dialog = await screen.findByRole('dialog', { name: 'Compose' });
    const windowRoot = dialog;

    expect(windowRoot).toHaveClass('nebular-window-fullScreen');
    expect(screen.getByText('Window body')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Maximize window' }));

    expect(windowRoot).toHaveClass('nebular-window-maximized');
    expect(windowRoot).not.toHaveClass('nebular-window-fullScreen');
    expect(screen.getByText('Window body')).toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Maximize window' })
    ).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Full screen window' }));
    expect(windowRoot).toHaveClass('nebular-window-fullScreen');

    await user.click(within(dialog).getByRole('button', { name: 'Minimize window' }));

    expect(screen.queryByText('Window body')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Full screen window' })).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Minimize window' }));

    expect(screen.getByText('Window body')).toBeInTheDocument();
    expect(windowRoot).toHaveClass('nebular-window-fullScreen');

    await user.click(within(dialog).getByRole('button', { name: 'Minimize window' }));
    await user.click(within(dialog).getByRole('button', { name: 'Full screen window' }));
    expect(screen.getByText('Window body')).toBeInTheDocument();
    expect(windowRoot).toHaveClass('nebular-window-maximized');
  });

  it('starts minimized when configured', async () => {
    const user = userEvent.setup();

    render(
      <WindowHarness
        config={{ title: 'Inbox', content: 'Window body', initialState: 'minimized' }}
      />
    );
    await openWindow(user);

    const dialog = await screen.findByRole('dialog', { name: 'Inbox' });
    const windowRoot = dialog;

    expect(windowRoot).not.toHaveClass('nebular-window-fullScreen');
    expect(windowRoot).not.toHaveClass('nebular-window-maximized');
    expect(screen.queryByText('Window body')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Full screen window' })).toBeInTheDocument();
    expect(document.querySelector('.overlay-backdrop')).toBeNull();
  });

  it('hides window controls according to the configuration', async () => {
    const user = userEvent.setup();

    render(
      <WindowHarness
        config={{
          title: 'Plain',
          content: 'Window body',
          hasMinimizeButton: false,
          hasMaximizeButton: false,
          hasFullScreenButton: false,
          hasCloseButton: false
        }}
      />
    );
    await openWindow(user);

    const dialog = await screen.findByRole('dialog', { name: 'Plain' });

    expect(within(dialog).queryAllByRole('button')).toHaveLength(0);
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();

    render(<WindowHarness config={{ title: 'Compose', content: 'Window body' }} />);
    await openWindow(user);
    await screen.findByRole('dialog', { name: 'Compose' });

    const backdrop = document.querySelector('.overlay-backdrop') as HTMLElement;

    expect(backdrop).not.toBeNull();

    fireEvent.click(backdrop);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('respects closeOnBackdropClick and hasBackdrop', async () => {
    const user = userEvent.setup();

    render(
      <WindowHarness
        config={{ title: 'Compose', content: 'Window body', closeOnBackdropClick: false }}
      />
    );
    await openWindow(user);
    await screen.findByRole('dialog', { name: 'Compose' });

    const backdrop = document.querySelector('.overlay-backdrop') as HTMLElement;

    expect(backdrop).not.toBeNull();

    fireEvent.click(backdrop);

    expect(screen.getByRole('dialog', { name: 'Compose' })).toBeInTheDocument();
  });

  it('does not render a backdrop when hasBackdrop is false', async () => {
    const user = userEvent.setup();

    render(
      <WindowHarness config={{ title: 'Compose', content: 'Window body', hasBackdrop: false }} />
    );
    await openWindow(user);
    await screen.findByRole('dialog', { name: 'Compose' });

    expect(document.querySelector('.overlay-backdrop')).toBeNull();
  });

  it('keeps multiple windows independent', async () => {
    const user = userEvent.setup();

    render(
      <WindowProvider>
        <button type="button" onClick={() => showWindow({ title: 'First', content: 'First body' })}>
          Open first
        </button>
        <button
          type="button"
          onClick={() => showWindow({ title: 'Second', content: 'Second body' })}
        >
          Open second
        </button>
      </WindowProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Open first' }));
    await user.click(screen.getByRole('button', { name: 'Open second' }));

    const first = await screen.findByRole('dialog', { name: 'First' });
    const second = screen.getByRole('dialog', { name: 'Second' });

    await user.click(within(second).getByRole('button', { name: 'Close window' }));

    expect(screen.queryByRole('dialog', { name: 'Second' })).not.toBeInTheDocument();
    expect(first).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const user = userEvent.setup();

    render(
      <WindowHarness
        config={{
          title: 'Accessible window',
          content: (
            <>
              <h2>Details</h2>
              <p>Window body</p>
            </>
          )
        }}
      />
    );
    await openWindow(user);

    const dialog = await screen.findByRole('dialog', { name: 'Accessible window' });

    expect(await axe(dialog)).toHaveNoViolations();
  });
});
