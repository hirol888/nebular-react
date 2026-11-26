import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
  Blockquote,
  Code,
  Link,
  Paragraph,
  Text,
  Title
} from '@nebular-react/core';

const collectEmittedCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => {
      const sheetRules = style.sheet
        ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText)
        : [];

      return [style.textContent || '', ...sheetRules].join('\n');
    })
    .join('\n');

describe('Typography', () => {
  it('Typography_Title_ShouldRenderSemanticHeadingForOrder', () => {
    render(
      <>
        <Title>Default</Title>
        <Title order={2}>Second</Title>
        <Title order={6}>Sixth</Title>
      </>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Default' }).tagName).toBe('H1');
    expect(screen.getByRole('heading', { level: 2, name: 'Second' }).tagName).toBe('H2');
    expect(screen.getByRole('heading', { level: 6, name: 'Sixth' }).tagName).toBe('H6');
  });

  it('Typography_Title_ShouldUseHeadingCssVariables', () => {
    render(<Title order={3}>Section</Title>);

    const css = collectEmittedCss();

    expect(css).toMatch(/--typography-title-font-size/);
    expect(css).toMatch(/--text-heading-3-font-size/);
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('nebular-typography-title-root');
  });

  it('Typography_Text_ShouldRenderSpanWithSizeWeightAndColorTokens', () => {
    render(
      <Text size="xs" weight="bold" color="danger">
        Danger
      </Text>
    );

    const text = screen.getByText('Danger');
    const css = collectEmittedCss();

    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveStyle({ fontWeight: 700 });
    expect(css).toMatch(/--typography-text-font-size,\s*0\.75rem/);
    expect(css).toMatch(/--color-danger-500/);
  });

  it('Typography_Text_ShouldApplyAlignmentAndTruncation', () => {
    render(
      <Text align="center" truncate>
        Truncated text
      </Text>
    );

    expect(screen.getByText('Truncated text')).toHaveStyle({
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  it('Typography_Text_ShouldClampLinesWhenLineClampIsProvided', () => {
    render(<Text lineClamp={2}>Clamped text</Text>);

    expect(collectEmittedCss()).toMatch(/-webkit-line-clamp:\s*2/);
  });

  it('Typography_Paragraph_ShouldRenderParagraphElement', () => {
    render(<Paragraph>Body copy</Paragraph>);

    expect(screen.getByText('Body copy').tagName).toBe('P');
  });

  it('Typography_Link_ShouldRenderAnchorWithUnderlineByDefault', () => {
    render(<Link href="#section">Section</Link>);

    const link = screen.getByRole('link', { name: 'Section' });

    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#section');
    expect(link).toHaveStyle({ textDecoration: 'underline' });
  });

  it('Typography_Link_ShouldApplyExternalAttributes', () => {
    render(
      <Link href="https://example.com" external>
        Docs
      </Link>
    );

    const link = screen.getByRole('link', { name: 'Docs' });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('Typography_Link_ShouldRespectTargetAndUnderlineFalse', () => {
    render(
      <Link href="#usage" target="_self" underline={false}>
        Usage
      </Link>
    );

    const link = screen.getByRole('link', { name: 'Usage' });

    expect(link).toHaveAttribute('target', '_self');
    expect(link).toHaveStyle({ textDecoration: 'none' });
  });

  it('Typography_Code_ShouldRenderCodeElement', () => {
    render(<Code>npm test</Code>);

    expect(screen.getByText('npm test').tagName).toBe('CODE');
  });

  it('Typography_Blockquote_ShouldRenderBlockquoteElement', () => {
    render(<Blockquote>Stay hungry, stay foolish.</Blockquote>);

    expect(screen.getByText('Stay hungry, stay foolish.').tagName).toBe('BLOCKQUOTE');
  });

  it('Typography_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <div>
        <Title order={1}>Accessible typography</Title>
        <Paragraph>
          Read the <Code>README</Code> before starting.
        </Paragraph>
        <Blockquote>A short quote.</Blockquote>
        <Text size="sm" color="hint">
          <Link href="#main">Jump to content</Link>
        </Text>
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
