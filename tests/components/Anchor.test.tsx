import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Anchor } from '@nebular-react/core';

const items = [
  { key: 'intro', label: 'Introdução', href: '#intro' },
  { key: 'usage', label: 'Uso', href: '#usage' },
  { key: 'api', label: 'API' }
];

describe('Anchor', () => {
  const scrollTo = jest.fn();

  beforeEach(() => {
    scrollTo.mockReset();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a labelled navigation with every item', () => {
    render(<Anchor items={items} ariaLabel="Seções da página" />);

    const nav = screen.getByRole('navigation', { name: 'Seções da página' });

    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Introdução' })).toHaveAttribute('href', '#intro');
    expect(screen.getByRole('link', { name: 'Uso' })).toHaveAttribute('href', '#usage');
    expect(screen.getByRole('link', { name: 'API' })).toBeInTheDocument();
  });

  it('marks the active item with aria-current', () => {
    render(<Anchor items={items} activeKey="usage" />);

    expect(screen.getByRole('link', { name: 'Uso' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'Introdução' })).not.toHaveAttribute('aria-current');
  });

  it('scrolls smoothly to the target section and updates the active item', async () => {
    const user = userEvent.setup();
    const section = document.createElement('section');
    section.id = 'usage';
    document.body.appendChild(section);
    const onActiveChange = jest.fn();

    render(<Anchor items={items} offset={64} onActiveChange={onActiveChange} />);

    await user.click(screen.getByRole('link', { name: 'Uso' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: -64, behavior: 'smooth' });
    expect(onActiveChange).toHaveBeenCalledWith('usage');
    expect(screen.getByRole('link', { name: 'Uso' })).toHaveAttribute('aria-current', 'location');
  });

  it('scrolls instantly when smooth is false', async () => {
    const user = userEvent.setup();
    const section = document.createElement('section');
    section.id = 'intro';
    document.body.appendChild(section);

    render(<Anchor items={items} smooth={false} />);

    await user.click(screen.getByRole('link', { name: 'Introdução' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: -80, behavior: 'auto' });
    expect(screen.getByRole('link', { name: 'Introdução' })).toHaveAttribute(
      'aria-current',
      'location'
    );
  });

  it('activates items without href without scrolling', async () => {
    const user = userEvent.setup();
    const onActiveChange = jest.fn();

    render(<Anchor items={items} onActiveChange={onActiveChange} />);

    await user.click(screen.getByRole('link', { name: 'API' }));

    expect(onActiveChange).toHaveBeenCalledWith('api');
    expect(scrollTo).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'API' })).toHaveAttribute('aria-current', 'location');
  });

  it('keeps the controlled active item when activeKey does not change', async () => {
    const user = userEvent.setup();
    const onActiveChange = jest.fn();

    render(<Anchor items={items} activeKey="intro" onActiveChange={onActiveChange} />);

    await user.click(screen.getByRole('link', { name: 'API' }));

    expect(onActiveChange).toHaveBeenCalledWith('api');
    expect(screen.getByRole('link', { name: 'Introdução' })).toHaveAttribute(
      'aria-current',
      'location'
    );
    expect(screen.getByRole('link', { name: 'API' })).not.toHaveAttribute('aria-current');
  });

  it('ignores anchors whose target does not exist', async () => {
    const user = userEvent.setup();
    const onActiveChange = jest.fn();

    render(<Anchor items={items} onActiveChange={onActiveChange} />);

    await user.click(screen.getByRole('link', { name: 'Uso' }));

    expect(scrollTo).not.toHaveBeenCalled();
    expect(onActiveChange).toHaveBeenCalledWith('usage');
  });

  it('exposes the orientation and item depth', () => {
    const { container } = render(
      <Anchor
        items={[...items, { key: 'deep', label: 'Detalhe', href: '#deep', depth: 1 }]}
        orientation="horizontal"
      />
    );

    expect(screen.getByRole('navigation')).toHaveAttribute('data-orientation', 'horizontal');
    expect(screen.getByRole('link', { name: 'Detalhe' }).parentElement).toHaveStyle({
      paddingInlineStart: '12px'
    });
    expect(container.querySelectorAll('li')).toHaveLength(4);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Anchor items={items} ariaLabel="Seções da página" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
