import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { JsonViewer, parseJsonSafely } from '@nebular-react/core';

const data = {
  name: 'Nebular',
  version: 4,
  meta: { stable: true, tags: ['ui', 'react'] },
  missing: null
};

describe('parseJsonSafely', () => {
  it('returns non string values untouched', () => {
    const result = parseJsonSafely(data);

    expect(result).toEqual({ ok: true, value: data });
  });

  it('parses valid json strings', () => {
    expect(parseJsonSafely('{"a": 1}')).toEqual({ ok: true, value: { a: 1 } });
    expect(parseJsonSafely('null')).toEqual({ ok: true, value: null });
  });

  it('returns a friendly error for invalid json', () => {
    const result = parseJsonSafely('{ oops }');

    expect(result.ok).toBe(false);
    expect(result.ok ? '' : result.error).toMatch(/invalid json/i);
    expect(parseJsonSafely('')).toMatchObject({ ok: false });
  });
});

describe('JsonViewer', () => {
  it('renders the root label and the first level of keys', () => {
    render(<JsonViewer data={data} />);

    expect(screen.getByText('root')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('"Nebular"')).toBeInTheDocument();
    expect(screen.getByText('version')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('shows the item count and type for container nodes', () => {
    render(<JsonViewer data={data} />);

    expect(screen.getByText('4 items')).toBeInTheDocument();
    expect(screen.getAllByText('object').length).toBe(2);
  });

  it('collapses nested containers by default', () => {
    render(<JsonViewer data={data} expandDepth={1} />);

    expect(screen.queryByText('stable')).not.toBeInTheDocument();
  });

  it('expands nested containers up to expandDepth', () => {
    render(<JsonViewer data={data} expandDepth={2} />);

    expect(screen.getByText('stable')).toBeInTheDocument();
    expect(screen.queryByText('"ui"')).not.toBeInTheDocument();
  });

  it('toggles a nested node when clicking its button', async () => {
    const user = userEvent.setup();

    render(<JsonViewer data={data} />);

    await user.click(screen.getByRole('button', { name: 'Expand meta' }));

    expect(screen.getByText('stable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse meta' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse meta' }));

    expect(screen.queryByText('stable')).not.toBeInTheDocument();
  });

  it('supports keyboard expansion and collapse', async () => {
    const user = userEvent.setup();

    render(<JsonViewer data={data} />);

    const toggle = screen.getByRole('button', { name: 'Expand meta' });

    toggle.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText('stable')).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByText('stable')).not.toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('stable')).toBeInTheDocument();
  });

  it('filters and highlights keys when searchable', async () => {
    const user = userEvent.setup();
    const { container } = render(<JsonViewer data={data} searchable />);

    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'stable');

    expect(screen.getByText('stable')).toBeInTheDocument();
    expect(screen.queryByText('name')).not.toBeInTheDocument();
    expect(container.querySelector('mark')?.textContent).toBe('stable');
  });

  it('does not render the search field by default', () => {
    render(<JsonViewer data={data} />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('copies the formatted json', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn<Promise<void>, [string]>();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    const { unmount } = render(<JsonViewer data={data} />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    expect(writeText).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    unmount();
  });
  it('hides the copy button when copyable is false', () => {
    render(<JsonViewer data={data} copyable={false} />);

    expect(screen.queryByRole('button', { name: 'Copiar' })).not.toBeInTheDocument();
  });

  it('parses json strings and renders them', () => {
    render(<JsonViewer data={JSON.stringify({ answer: 42 })} />);

    expect(screen.getByText('answer')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders a friendly alert for invalid json', () => {
    render(<JsonViewer data="{ oops }" />);

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid json/i);
    expect(screen.queryByText('root')).not.toBeInTheDocument();
  });

  it('supports a custom root label, max height and aria label', () => {
    const { container } = render(
      <JsonViewer data={data} rootLabel="payload" maxHeight={200} ariaLabel="API payload" />
    );

    expect(screen.getByText('payload')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'API payload' })).toBeInTheDocument();
    expect(container.querySelector('[class*="nebular-json-viewer-tree"]')).toHaveStyle({
      maxHeight: '200px'
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<JsonViewer data={data} searchable ariaLabel="API payload" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
