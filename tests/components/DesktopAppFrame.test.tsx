import React, { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { DesktopAppFrame, type DesktopAppFrameHandle } from '@nebular-react/core';

describe('DesktopAppFrame', () => {
  it('renders a locked-down iframe by default', async () => {
    const { container } = render(
      <DesktopAppFrame src="https://apps.example/notes" title="Notes app" appId="notes" />
    );

    const frame = screen.getByTitle('Notes app');

    expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
    expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(frame).toHaveAttribute('data-desktop-app-frame', 'notes');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('only forwards messages from allowed origins and its own frame', () => {
    const onMessage = jest.fn();
    render(
      <DesktopAppFrame
        src="https://apps.example/notes"
        title="Notes app"
        allowedOrigins={['https://apps.example']}
        onMessage={onMessage}
      />
    );
    const frame = screen.getByTitle('Notes app') as HTMLIFrameElement;

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'ready' },
          origin: 'https://evil.example',
          source: frame.contentWindow
        })
      );
    });
    expect(onMessage).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'ready' },
          origin: 'https://apps.example',
          source: frame.contentWindow
        })
      );
    });
    expect(onMessage).toHaveBeenCalledWith({ type: 'ready' }, 'https://apps.example');
  });

  it('posts messages using an allowed origin', () => {
    const handle = createRef<DesktopAppFrameHandle>();
    render(
      <DesktopAppFrame
        ref={handle}
        src="https://apps.example/notes"
        title="Notes app"
        allowedOrigins={['https://apps.example']}
      />
    );
    const frame = screen.getByTitle('Notes app') as HTMLIFrameElement;
    const postMessage = jest.fn();
    Object.defineProperty(frame, 'contentWindow', {
      configurable: true,
      value: { postMessage }
    });

    act(() => {
      handle.current?.postMessage({ type: 'open', path: '/a' });
    });

    expect(postMessage).toHaveBeenCalledWith({ type: 'open', path: '/a' }, 'https://apps.example');
  });
});
