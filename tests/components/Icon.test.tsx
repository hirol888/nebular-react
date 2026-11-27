import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Icon, NebularProvider } from '@nebular-react/core';

const expectSvg = async (icon: HTMLElement) => {
  await waitFor(() => expect(icon.querySelector('svg')).not.toBeNull());
};

describe('Icon', () => {
  it('renders an svg icon from the default pack with the status class', async () => {
    render(<Icon data-testid="icon" icon="heart-outline" status="danger" />);

    const icon = screen.getByTestId('icon');

    expect(icon).toHaveClass('nebular-icon-root', 'danger');
    await expectSvg(icon);
    expect(icon.innerHTML).toContain('<svg');
  });

  it('renders icons from the nebular-essentials pack', async () => {
    render(<Icon data-testid="icon" icon="checkmark-outline" pack="nebular-essentials" />);

    const icon = screen.getByTestId('icon');

    await expectSvg(icon);
    expect(icon.innerHTML).toContain('data-name="checkmark"');
  });

  it('renders icons from a custom svg pack provided by the provider', async () => {
    const svgIconPacks = new Map<string, Map<string, any>>([
      ['custom', new Map<string, any>([['logo', '<svg data-testid="custom-svg"></svg>']])]
    ]);

    render(
      <NebularProvider svgIconPacks={svgIconPacks} defaultIconPack="custom">
        <Icon data-testid="icon" icon="logo" />
      </NebularProvider>
    );

    const icon = screen.getByTestId('icon');

    await waitFor(() => expect(icon.querySelector('[data-testid="custom-svg"]')).not.toBeNull());
  });

  it('renders font icons using the configured pack class and prefix', async () => {
    const fontIconPacks = new Map([['font', { packClass: 'fa', iconClassPrefix: 'fa' }]]);

    render(
      <NebularProvider fontIconPacks={fontIconPacks} defaultIconPack="font">
        <Icon data-testid="icon" icon="user" />
      </NebularProvider>
    );

    const icon = screen.getByTestId('icon');

    await waitFor(() => expect(icon).toHaveClass('fa', 'fa-user'));
    expect(icon.querySelector('svg')).toBeNull();
  });

  it('supports font packs without an icon prefix', async () => {
    const fontIconPacks = new Map([['plain', { packClass: 'glyph' }]]);

    render(
      <NebularProvider fontIconPacks={fontIconPacks} defaultIconPack="plain">
        <Icon data-testid="icon" icon="home" />
      </NebularProvider>
    );

    const icon = screen.getByTestId('icon');

    await waitFor(() => expect(icon).toHaveClass('glyph', 'home'));
  });

  it('does not add an empty font icon class when no icon is provided', async () => {
    const fontIconPacks = new Map([['plain', { packClass: 'glyph', iconClassPrefix: 'glyph' }]]);

    render(
      <NebularProvider fontIconPacks={fontIconPacks} defaultIconPack="plain">
        <Icon data-testid="icon" />
      </NebularProvider>
    );

    const icon = screen.getByTestId('icon');

    await waitFor(() => expect(icon).toHaveClass('glyph'));
    expect(icon.className).not.toContain('glyph-');
  });

  it('passes options to the svg renderer', async () => {
    render(<Icon data-testid="icon" icon="heart-outline" options={{ fill: '#ff0000' }} />);

    const icon = screen.getByTestId('icon');

    await expectSvg(icon);
    expect(icon.innerHTML).toContain('fill="#ff0000"');
  });

  it('loads icons from a file url', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<svg data-testid="remote-svg"></svg>')
    });
    const originalFetch = global.fetch;
    global.fetch = fetchMock as unknown as typeof fetch;

    try {
      const svgIconPacks = new Map<string, Map<string, any>>([
        ['remote', new Map<string, any>([['logo', { file: '/icons/logo.svg' }]])]
      ]);

      render(
        <NebularProvider svgIconPacks={svgIconPacks} defaultIconPack="remote">
          <Icon data-testid="icon" icon="logo" />
        </NebularProvider>
      );

      const icon = screen.getByTestId('icon');

      await waitFor(() => expect(icon.querySelector('[data-testid="remote-svg"]')).not.toBeNull());
      expect(fetchMock).toHaveBeenCalledWith('/icons/logo.svg');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('replaces the rendered svg when the pack changes', async () => {
    const { rerender } = render(
      <Icon data-testid="icon" icon="checkmark-outline" pack="nebular-essentials" />
    );

    const icon = screen.getByTestId('icon');
    await expectSvg(icon);
    const essentialMarkup = icon.innerHTML;

    rerender(<Icon data-testid="icon" icon="checkmark-outline" pack="eva" />);

    await waitFor(() => expect(icon.innerHTML).not.toBe(essentialMarkup));
    expect(icon.querySelector('svg')).not.toBeNull();
  });

  it('replaces the font icon class when the icon changes', async () => {
    const fontIconPacks = new Map([['font', { packClass: 'fa', iconClassPrefix: 'fa' }]]);

    const { rerender } = render(
      <NebularProvider fontIconPacks={fontIconPacks} defaultIconPack="font">
        <Icon data-testid="icon" icon="user" />
      </NebularProvider>
    );

    const icon = screen.getByTestId('icon');
    await waitFor(() => expect(icon).toHaveClass('fa-user'));

    rerender(
      <NebularProvider fontIconPacks={fontIconPacks} defaultIconPack="font">
        <Icon data-testid="icon" icon="home" />
      </NebularProvider>
    );

    await waitFor(() => expect(icon).toHaveClass('fa-home'));
    expect(icon).not.toHaveClass('fa-user');
  });

  it('hides decorative icons from assistive technologies by default', () => {
    render(<Icon data-testid="icon" icon="heart-outline" />);

    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps labelled icons accessible', () => {
    render(<Icon data-testid="icon" icon="heart-outline" aria-label="Favorites" />);

    const icon = screen.getByTestId('icon');

    expect(icon).toHaveAttribute('aria-label', 'Favorites');
    expect(icon).toHaveAttribute('role', 'img');
    expect(icon).not.toHaveAttribute('aria-hidden');
  });

  it('respects an explicit aria-hidden value', () => {
    render(<Icon data-testid="icon" icon="heart-outline" aria-hidden={false} />);

    expect(screen.getByTestId('icon')).toHaveAttribute('aria-hidden', 'false');
  });

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>();

    render(<Icon ref={ref} data-testid="icon" icon="heart-outline" />);

    expect(ref.current).toBe(screen.getByTestId('icon'));
  });

  it('renders an empty element when no icon is provided', () => {
    render(<Icon data-testid="icon" />);

    const icon = screen.getByTestId('icon');

    expect(icon).toBeInTheDocument();
    expect(icon.querySelector('svg')).toBeNull();
  });

  it('renders nothing when the icon does not exist in the pack', async () => {
    render(<Icon data-testid="icon" icon="does-not-exist" />);

    const icon = screen.getByTestId('icon');

    await waitFor(() => expect(icon.querySelector('svg')).toBeNull());
    expect(icon.innerHTML).toBe('');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <button type="button" aria-label="Favorites">
          <Icon icon="heart-outline" />
        </button>
        <Icon icon="heart-outline" aria-label="Favorites" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
