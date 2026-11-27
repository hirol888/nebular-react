import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { CopyButton } from '../CopyButton';

export type CodeTokenType = 'plain' | 'comment' | 'string' | 'number' | 'keyword';

export interface CodeToken {
  type: CodeTokenType;
  value: string;
}

interface TokenizerConfig {
  lineComments: string[];
  blockComments: boolean;
  quotes: string[];
  keywords: string[];
  caseInsensitive: boolean;
}

const TYPESCRIPT_KEYWORDS = [
  'abstract',
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'declare',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'of',
  'private',
  'protected',
  'public',
  'readonly',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'type',
  'typeof',
  'undefined',
  'var',
  'void',
  'while',
  'yield'
];

const BASH_KEYWORDS = [
  'alias',
  'case',
  'cd',
  'do',
  'done',
  'echo',
  'elif',
  'else',
  'esac',
  'exit',
  'export',
  'fi',
  'for',
  'function',
  'if',
  'in',
  'local',
  'read',
  'return',
  'set',
  'source',
  'then',
  'until',
  'unset',
  'while'
];

const SQL_KEYWORDS = [
  'add',
  'all',
  'alter',
  'and',
  'as',
  'asc',
  'avg',
  'between',
  'by',
  'case',
  'column',
  'count',
  'create',
  'default',
  'delete',
  'desc',
  'distinct',
  'drop',
  'else',
  'end',
  'foreign',
  'from',
  'full',
  'group',
  'having',
  'in',
  'index',
  'inner',
  'insert',
  'into',
  'is',
  'join',
  'key',
  'left',
  'like',
  'limit',
  'max',
  'min',
  'not',
  'null',
  'offset',
  'on',
  'or',
  'order',
  'outer',
  'primary',
  'references',
  'right',
  'select',
  'set',
  'sum',
  'table',
  'then',
  'union',
  'update',
  'values',
  'when',
  'where'
];

const TOKENIZER_CONFIGS: Record<string, TokenizerConfig> = {
  typescript: {
    lineComments: ['//'],
    blockComments: true,
    quotes: ['"', "'", '`'],
    keywords: TYPESCRIPT_KEYWORDS,
    caseInsensitive: false
  },
  json: {
    lineComments: [],
    blockComments: false,
    quotes: ['"'],
    keywords: ['true', 'false', 'null'],
    caseInsensitive: false
  },
  bash: {
    lineComments: ['#'],
    blockComments: false,
    quotes: ['"', "'"],
    keywords: BASH_KEYWORDS,
    caseInsensitive: false
  },
  sql: {
    lineComments: ['--'],
    blockComments: true,
    quotes: ['"', "'"],
    keywords: SQL_KEYWORDS,
    caseInsensitive: true
  }
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'typescript',
  javascript: 'typescript',
  jsx: 'typescript',
  ts: 'typescript',
  tsx: 'typescript',
  typescript: 'typescript',
  json: 'json',
  jsonc: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  sql: 'sql'
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildStringPattern(quotes: string[]): string {
  return quotes.map((quote) => `${quote}(?:\\\\[\\s\\S]|[^\\\\${quote}])*${quote}`).join('|');
}

function buildTokenizer(config: TokenizerConfig): RegExp {
  const commentParts = config.lineComments.map((marker) => `${escapeRegExp(marker)}[^\\n]*`);

  if (config.blockComments) {
    commentParts.push('\\/\\*[\\s\\S]*?\\*\\/');
  }

  const comment = commentParts.length > 0 ? commentParts.join('|') : '(?!)';
  const string = config.quotes.length > 0 ? buildStringPattern(config.quotes) : '(?!)';
  const number = '\\b\\d+(?:\\.\\d+)?\\b';
  const keyword =
    config.keywords.length > 0
      ? `\\b(?:${config.keywords.map(escapeRegExp).join('|')})\\b`
      : '(?!)';
  const flags = config.caseInsensitive ? 'gi' : 'g';

  return new RegExp(`(${comment})|(${string})|(${number})|(${keyword})`, flags);
}

/**
 * Splits `code` into typed tokens so it can be highlighted without
 * `dangerouslySetInnerHTML`. Unknown languages yield a single plain token.
 */
export function tokenizeCode(code: string, language = 'text'): CodeToken[] {
  const normalized = LANGUAGE_ALIASES[(language || 'text').toLowerCase()];
  const config = normalized ? TOKENIZER_CONFIGS[normalized] : undefined;

  if (!config) {
    return [{ type: 'plain', value: code }];
  }

  const tokenizer = buildTokenizer(config);
  const tokens: CodeToken[] = [];
  let lastIndex = 0;
  let match = tokenizer.exec(code);

  while (match) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: code.slice(lastIndex, match.index) });
    }

    let type: CodeTokenType = 'keyword';

    if (match[1]) {
      type = 'comment';
    } else if (match[2]) {
      type = 'string';
    } else if (match[3]) {
      type = 'number';
    }

    tokens.push({ type, value: match[0] });
    lastIndex = match.index + match[0].length;

    if (match[0].length === 0) {
      tokenizer.lastIndex += 1;
    }

    match = tokenizer.exec(code);
  }

  if (lastIndex < code.length) {
    tokens.push({ type: 'plain', value: code.slice(lastIndex) });
  }

  return tokens;
}

function splitTokensIntoLines(tokens: CodeToken[]): CodeToken[][] {
  const lines: CodeToken[][] = [[]];

  tokens.forEach((token) => {
    const parts = token.value.split('\n');

    parts.forEach((part, index) => {
      if (index > 0) {
        lines.push([]);
      }

      if (part.length > 0) {
        lines[lines.length - 1].push({ type: token.type, value: part });
      }
    });
  });

  return lines;
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    fontFamily: 'var(--code-block-font-family, inherit)'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },

  title: {
    color: 'var(--code-block-title-color, var(--text-basic-color, #222b45))',
    fontSize: '0.8125rem',
    fontWeight: 600
  },

  pre: {
    margin: 0,
    padding: '0.75rem',
    overflow: 'auto',
    borderRadius: '0.375rem',
    backgroundColor: 'var(--code-block-background-color, #f7f9fc)',
    color: 'var(--code-block-text-color, #222b45)',
    fontFamily: 'var(--code-block-font-family, ui-monospace, SFMono-Regular, monospace)',
    fontSize: 'var(--code-block-font-size, 0.8125rem)',
    lineHeight: 1.6,
    tabSize: 2
  },

  code: {
    fontFamily: 'inherit'
  },

  line: {
    display: 'block',
    whiteSpace: 'pre'
  },

  lineNumber: {
    display: 'inline-block',
    minWidth: '1.75rem',
    marginRight: '0.75rem',
    color: 'var(--code-block-line-number-color, var(--color-basic-700, #3d4d6a))',
    textAlign: 'right',
    userSelect: 'none'
  },

  tokenPlain: {},

  tokenComment: {
    color: 'var(--code-block-comment-color, var(--color-basic-700, #3d4d6a))',
    fontStyle: 'italic'
  },

  tokenString: {
    color: 'var(--code-block-string-color, var(--color-success-800, #007d6c))'
  },

  tokenNumber: {
    color: 'var(--code-block-number-color, var(--color-danger-800, #94124e))'
  },

  tokenKeyword: {
    color: 'var(--code-block-keyword-color, var(--color-primary-800, #274bdb))',
    fontWeight: 600
  }
}));

export type CodeBlockStylesNames = Selectors<typeof useStyles>;

export interface CodeBlockProps extends DefaultProps<CodeBlockStylesNames> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlight?: boolean;
  copyable?: boolean;
  maxHeight?: number;
  title?: React.ReactNode;
  ariaLabel?: string;
}

const defaultProps: Partial<CodeBlockProps> = {
  language: 'text',
  showLineNumbers: false,
  highlight: true,
  copyable: true
};

const _CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>((props, ref) => {
  const {
    code,
    language,
    showLineNumbers,
    highlight,
    copyable,
    maxHeight,
    title,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'code-block', classNames, styles, unstyled });
  const lines = highlight
    ? splitTokensIntoLines(tokenizeCode(code, language))
    : code.split('\n').map((line) => [{ type: 'plain' as CodeTokenType, value: line }]);
  const hasHeader = Boolean(title || copyable);

  return (
    <div
      ref={ref}
      className={cx(classes.root, className)}
      role={ariaLabel ? 'group' : undefined}
      aria-label={ariaLabel}
    >
      {hasHeader && (
        <div className={cx(classes.header)}>
          {title && <div className={cx(classes.title)}>{title}</div>}
          {copyable && <CopyButton value={code} size="tiny" />}
        </div>
      )}
      <pre className={cx(classes.pre)} style={{ maxHeight }}>
        <code className={cx(classes.code)}>
          {lines.map((line, lineIndex) => (
            <span key={lineIndex} className={cx(classes.line)}>
              {showLineNumbers && (
                <span className={cx(classes.lineNumber)} aria-hidden="true">
                  {lineIndex + 1}
                </span>
              )}
              {line.map((token, tokenIndex) =>
                highlight ? (
                  <span
                    key={tokenIndex}
                    className={cx(
                      token.type === 'comment' && classes.tokenComment,
                      token.type === 'string' && classes.tokenString,
                      token.type === 'number' && classes.tokenNumber,
                      token.type === 'keyword' && classes.tokenKeyword,
                      token.type === 'plain' && classes.tokenPlain
                    )}
                  >
                    {token.value}
                  </span>
                ) : (
                  <React.Fragment key={tokenIndex}>{token.value}</React.Fragment>
                )
              )}
              {lineIndex < lines.length - 1 ? '\n' : null}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
});

_CodeBlock.displayName = 'CodeBlock';

export { _CodeBlock as CodeBlock };
