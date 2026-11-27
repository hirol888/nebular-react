import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Markdown, parseMarkdown } from '@nebular-react/core';

const document = [
  '## Features',
  '',
  'Supports **bold**, *italic* and `code`.',
  '',
  '- first',
  '- second',
  '',
  '1. one',
  '2. two',
  '',
  '> A quote',
  '',
  '```js',
  'const answer = 42;',
  '```',
  '',
  '[Docs](https://example.com/docs)',
  '',
  '---'
].join('\n');

describe('parseMarkdown', () => {
  it('Markdown_ParseMarkdown_ShouldParseHeadings', () => {
    expect(parseMarkdown('## Setup')).toEqual([
      { type: 'heading', level: 2, children: [{ type: 'text', value: 'Setup' }] }
    ]);
  });

  it('Markdown_ParseMarkdown_ShouldParseParagraphsAndInlineFormatting', () => {
    expect(parseMarkdown('Hello **world** and *friends* with `code`')).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Hello ' },
          { type: 'strong', children: [{ type: 'text', value: 'world' }] },
          { type: 'text', value: ' and ' },
          { type: 'emphasis', children: [{ type: 'text', value: 'friends' }] },
          { type: 'text', value: ' with ' },
          { type: 'code', value: 'code' }
        ]
      }
    ]);
  });

  it('Markdown_ParseMarkdown_ShouldParseLinks', () => {
    expect(parseMarkdown('[Nebular](https://example.com)')).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            href: 'https://example.com',
            children: [{ type: 'text', value: 'Nebular' }]
          }
        ]
      }
    ]);
  });

  it('Markdown_ParseMarkdown_ShouldParseCodeBlocks', () => {
    expect(parseMarkdown(['```ts', 'const a = 1;', '```'].join('\n'))).toEqual([
      { type: 'code', language: 'ts', value: 'const a = 1;' }
    ]);
  });

  it('Markdown_ParseMarkdown_ShouldParseOrderedAndUnorderedLists', () => {
    expect(parseMarkdown('- one\n- two')).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [[{ type: 'text', value: 'one' }], [{ type: 'text', value: 'two' }]]
      }
    ]);

    expect(parseMarkdown('1. one\n2. two')).toEqual([
      {
        type: 'list',
        ordered: true,
        items: [[{ type: 'text', value: 'one' }], [{ type: 'text', value: 'two' }]]
      }
    ]);
  });

  it('Markdown_ParseMarkdown_ShouldParseBlockquotesAndRules', () => {
    expect(parseMarkdown('> quoted')).toEqual([
      { type: 'blockquote', children: [{ type: 'text', value: 'quoted' }] }
    ]);
    expect(parseMarkdown('---')).toEqual([{ type: 'hr' }]);
  });

  it('Markdown_ParseMarkdown_ShouldSplitConsecutiveBlocks', () => {
    expect(parseMarkdown('# Title\n\nFirst.\n\nSecond.').map((node) => node.type)).toEqual([
      'heading',
      'paragraph',
      'paragraph'
    ]);
  });
});

describe('Markdown', () => {
  it('Markdown_Render_ShouldRenderEveryBlockType', () => {
    const { container } = render(<Markdown value={document} ariaLabel="Readme" />);

    expect(screen.getByRole('article', { name: 'Readme' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Features' })).toBeInTheDocument();

    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByText('italic').tagName).toBe('EM');
    expect(screen.getByText('code').tagName).toBe('CODE');

    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();

    expect(container.querySelector('blockquote')).toHaveTextContent('A quote');
    expect(screen.getByText('const answer = 42;').tagName).toBe('CODE');
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('Markdown_HeadingOffset_ShouldShiftAndClampHeadingLevels', () => {
    const { rerender } = render(<Markdown value="# Title" headingOffset={2} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Title' })).toBeInTheDocument();

    rerender(<Markdown value="# Title" headingOffset={10} />);

    expect(screen.getByRole('heading', { level: 6, name: 'Title' })).toBeInTheDocument();
  });

  it('Markdown_Links_ShouldMarkExternalLinksAsSafe', () => {
    render(<Markdown value="[Docs](https://example.com/docs)" />);

    const link = screen.getByRole('link', { name: 'Docs' });

    expect(link).toHaveAttribute('href', 'https://example.com/docs');
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('Markdown_Links_ShouldAllowMailtoWithoutExternalAttributes', () => {
    render(<Markdown value="[Mail](mailto:hi@example.com)" />);

    const link = screen.getByRole('link', { name: 'Mail' });

    expect(link).toHaveAttribute('href', 'mailto:hi@example.com');
    expect(link).not.toHaveAttribute('rel');
  });

  it('Markdown_Links_ShouldDropUnsafeProtocols', () => {
    render(<Markdown value="[Click](javascript:alert)" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('Markdown_Links_ShouldHonorCustomAllowedProtocols', () => {
    const { rerender } = render(<Markdown value="[File](ftp://example.com/a)" />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    rerender(<Markdown value="[File](ftp://example.com/a)" allowedProtocols={['ftp']} />);

    expect(screen.getByRole('link', { name: 'File' })).toHaveAttribute(
      'href',
      'ftp://example.com/a'
    );
  });

  it('Markdown_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(<Markdown value={document} ariaLabel="Readme" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
