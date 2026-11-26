import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CodeBlock, tokenizeCode } from '@nebular-react/core';

const sample = `const answer = 42; // the answer
function greet(name) {
  return \`Hello \${name}\`;
}`;

describe('tokenizeCode', () => {
  it('reconstructs the original source from its tokens', () => {
    expect(
      tokenizeCode(sample, 'ts')
        .map((token) => token.value)
        .join('')
    ).toBe(sample);
  });

  it('classifies comments, strings, numbers and keywords', () => {
    const tokens = tokenizeCode('const answer = 42; // the answer', 'ts');

    expect(tokens).toEqual([
      { type: 'keyword', value: 'const' },
      { type: 'plain', value: ' answer = ' },
      { type: 'number', value: '42' },
      { type: 'plain', value: '; ' },
      { type: 'comment', value: '// the answer' }
    ]);
  });

  it('handles single, double and template strings', () => {
    const tokens = tokenizeCode('const a = \'x\'; const b = "y"; const c = `z`;', 'ts');

    expect(tokens.filter((token) => token.type === 'string').map((token) => token.value)).toEqual([
      "'x'",
      '"y"',
      '`z`'
    ]);
  });

  it('highlights json literals', () => {
    const tokens = tokenizeCode('{"a": 1, "b": true, "c": null}', 'json');

    expect(tokens.filter((token) => token.type === 'keyword').map((token) => token.value)).toEqual([
      'true',
      'null'
    ]);
    expect(tokens.find((token) => token.type === 'string')?.value).toBe('"a"');
    expect(tokens.find((token) => token.type === 'number')?.value).toBe('1');
  });

  it('highlights sql keywords case insensitively', () => {
    const tokens = tokenizeCode('SELECT id FROM users', 'sql');

    expect(tokens.filter((token) => token.type === 'keyword').map((token) => token.value)).toEqual([
      'SELECT',
      'FROM'
    ]);
  });

  it('highlights bash comments and strings', () => {
    const tokens = tokenizeCode('echo "hi" # greet', 'bash');

    expect(tokens.filter((token) => token.type === 'keyword').map((token) => token.value)).toEqual([
      'echo'
    ]);
    expect(tokens.find((token) => token.type === 'string')?.value).toBe('"hi"');
    expect(tokens.find((token) => token.type === 'comment')?.value).toBe('# greet');
  });

  it('returns a single plain token for unknown languages', () => {
    expect(tokenizeCode('const x = 1', 'cobol')).toEqual([{ type: 'plain', value: 'const x = 1' }]);
  });

  it('does not treat keywords inside identifiers as keywords', () => {
    const tokens = tokenizeCode('constant = 1;', 'ts');

    expect(tokens.some((token) => token.type === 'keyword')).toBe(false);
  });
});

describe('CodeBlock', () => {
  it('renders the code inside pre/code and keeps line breaks', () => {
    const { container } = render(<CodeBlock code={sample} language="ts" />);

    expect(container.querySelector('pre code')?.textContent).toBe(sample);
  });

  it('highlights tokens by default', () => {
    const { container } = render(<CodeBlock code="const answer = 42;" language="ts" />);

    expect(
      container.querySelectorAll('[class*="nebular-code-block-tokenKeyword"]').length
    ).toBeGreaterThan(0);
    expect(
      container.querySelectorAll('[class*="nebular-code-block-tokenNumber"]').length
    ).toBeGreaterThan(0);
  });

  it('renders plain code when highlight is false', () => {
    const { container } = render(
      <CodeBlock code="const answer = 42;" language="ts" highlight={false} />
    );

    expect(container.querySelectorAll('[class*="nebular-code-block-token"]')).toHaveLength(0);
    expect(container.querySelector('code')?.textContent).toBe('const answer = 42;');
  });

  it('renders one line number per line when showLineNumbers is set', () => {
    const { container } = render(<CodeBlock code={'const a = 1;\nconst b = 2;'} showLineNumbers />);
    const lineNumbers = container.querySelectorAll('[class*="nebular-code-block-lineNumber"]');

    expect(lineNumbers).toHaveLength(2);
    expect(lineNumbers[0]).toHaveTextContent('1');
    expect(lineNumbers[1]).toHaveTextContent('2');
  });

  it('does not render line numbers by default', () => {
    const { container } = render(<CodeBlock code="const a = 1;" />);

    expect(container.querySelectorAll('[class*="nebular-code-block-lineNumber"]')).toHaveLength(0);
  });

  it('renders a title, applies maxHeight and exposes an accessible label', () => {
    const { container } = render(
      <CodeBlock
        code={sample}
        title="config.ts"
        maxHeight={120}
        ariaLabel="Configuration snippet"
      />
    );

    expect(screen.getByText('config.ts')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Configuration snippet' })).toBeInTheDocument();
    expect(container.querySelector('pre')).toHaveStyle({ maxHeight: '120px' });
  });

  it('copies the raw code through the copy button', async () => {
    const user = userEvent.setup();
    const writeText = jest.fn<Promise<void>, [string]>();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    const { unmount } = render(<CodeBlock code="const a = 1;" />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    expect(writeText).toHaveBeenCalledWith('const a = 1;');
    unmount();
  });

  it('hides the copy button when copyable is false', () => {
    render(<CodeBlock code="const a = 1;" copyable={false} />);

    expect(screen.queryByRole('button', { name: 'Copiar' })).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CodeBlock code={sample} language="ts" title="config.ts" showLineNumbers ariaLabel="Code" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
