import React, { forwardRef, useMemo } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type MarkdownInline =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: MarkdownInline[] }
  | { type: 'emphasis'; children: MarkdownInline[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; children: MarkdownInline[] };

export type MarkdownNode =
  | { type: 'heading'; level: number; children: MarkdownInline[] }
  | { type: 'paragraph'; children: MarkdownInline[] }
  | { type: 'code'; language?: string; value: string }
  | { type: 'list'; ordered: boolean; items: MarkdownInline[][] }
  | { type: 'blockquote'; children: MarkdownInline[] }
  | { type: 'hr' };

const INLINE_TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`|\[[^\]]+\]\([^)]+\))/;
const LINK_TOKEN = /^\[([^\]]+)\]\(([^)]+)\)$/;
const HEADING_LINE = /^(#{1,6})\s+(.*)$/;
const CODE_FENCE = /^```/;
const BLOCKQUOTE_LINE = /^>\s?/;
const UNORDERED_ITEM = /^[-*+]\s+(.*)$/;
const ORDERED_ITEM = /^\d+[.)]\s+(.*)$/;
const HORIZONTAL_RULE = /^(?:-\s*){3,}$|^(?:\*\s*){3,}$|^(?:_\s*){3,}$/;

function parseInline(source: string): MarkdownInline[] {
  const nodes: MarkdownInline[] = [];
  let rest = source;

  const pushText = (value: string) => {
    if (value === '') {
      return;
    }

    const last = nodes[nodes.length - 1];

    if (last && last.type === 'text') {
      last.value += value;
      return;
    }

    nodes.push({ type: 'text', value });
  };

  while (rest.length > 0) {
    const match = INLINE_TOKEN.exec(rest);

    if (!match) {
      pushText(rest);
      break;
    }

    const [token] = match;
    const { index } = match;

    if (index > 0) {
      pushText(rest.slice(0, index));
    }

    if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push({ type: 'strong', children: parseInline(token.slice(2, -2)) });
    } else if (token.startsWith('`')) {
      nodes.push({ type: 'code', value: token.slice(1, -1) });
    } else if (token.startsWith('[')) {
      const link = LINK_TOKEN.exec(token);

      if (link) {
        nodes.push({ type: 'link', href: link[2].trim(), children: parseInline(link[1]) });
      } else {
        pushText(token);
      }
    } else {
      nodes.push({ type: 'emphasis', children: parseInline(token.slice(1, -1)) });
    }

    rest = rest.slice(index + token.length);
  }

  return nodes;
}

function isBlockStart(line: string): boolean {
  const trimmed = line.trim();

  return (
    CODE_FENCE.test(trimmed) ||
    HEADING_LINE.test(trimmed) ||
    HORIZONTAL_RULE.test(trimmed) ||
    BLOCKQUOTE_LINE.test(trimmed) ||
    UNORDERED_ITEM.test(trimmed) ||
    ORDERED_ITEM.test(trimmed)
  );
}

interface BlockResult {
  node: MarkdownNode;
  next: number;
}

function readCodeBlock(lines: string[], start: number): BlockResult {
  const language = lines[start].trim().slice(3).trim();
  const codeLines: string[] = [];
  let index = start + 1;

  while (index < lines.length && !CODE_FENCE.test(lines[index].trim())) {
    codeLines.push(lines[index]);
    index += 1;
  }

  const code = codeLines.join('\n');

  return {
    node: language === '' ? { type: 'code', value: code } : { type: 'code', language, value: code },
    // Skips the closing fence when present.
    next: index + 1
  };
}

function readBlockquote(lines: string[], start: number): BlockResult {
  const quoteLines: string[] = [];
  let index = start;

  while (index < lines.length && BLOCKQUOTE_LINE.test(lines[index].trim())) {
    quoteLines.push(lines[index].trim().replace(BLOCKQUOTE_LINE, ''));
    index += 1;
  }

  return {
    node: { type: 'blockquote', children: parseInline(quoteLines.join(' ')) },
    next: index
  };
}

function readList(lines: string[], start: number): BlockResult {
  const ordered = ORDERED_ITEM.test(lines[start].trim());
  const items: MarkdownInline[][] = [];
  let index = start;

  while (index < lines.length) {
    const current = lines[index].trim();
    const item = ordered ? ORDERED_ITEM.exec(current) : UNORDERED_ITEM.exec(current);

    if (!item) {
      break;
    }

    items.push(parseInline(item[1].trim()));
    index += 1;
  }

  return { node: { type: 'list', ordered, items }, next: index };
}

function readParagraph(lines: string[], start: number): BlockResult {
  const paragraphLines: string[] = [];
  let index = start;

  while (index < lines.length) {
    const current = lines[index];

    if (current.trim() === '') {
      break;
    }

    if (paragraphLines.length > 0 && isBlockStart(current)) {
      break;
    }

    paragraphLines.push(current.trim());
    index += 1;
  }

  return {
    node: { type: 'paragraph', children: parseInline(paragraphLines.join(' ')) },
    next: index
  };
}

/**
 * Parses a small subset of Markdown (headings, paragraphs, inline formatting, fenced
 * code, lists, blockquotes, links and horizontal rules) into a serializable tree.
 */
export function parseMarkdown(value: string): MarkdownNode[] {
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  const nodes: MarkdownNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();
    const heading = HEADING_LINE.exec(trimmed);

    if (trimmed === '') {
      index += 1;
    } else if (CODE_FENCE.test(trimmed)) {
      const block = readCodeBlock(lines, index);

      nodes.push(block.node);
      index = block.next;
    } else if (heading) {
      nodes.push({
        type: 'heading',
        level: heading[1].length,
        children: parseInline(heading[2].trim())
      });
      index += 1;
    } else if (HORIZONTAL_RULE.test(trimmed)) {
      nodes.push({ type: 'hr' });
      index += 1;
    } else if (BLOCKQUOTE_LINE.test(trimmed)) {
      const block = readBlockquote(lines, index);

      nodes.push(block.node);
      index = block.next;
    } else if (ORDERED_ITEM.test(trimmed) || UNORDERED_ITEM.test(trimmed)) {
      const block = readList(lines, index);

      nodes.push(block.node);
      index = block.next;
    } else {
      const block = readParagraph(lines, index);

      nodes.push(block.node);
      index = block.next;
    }
  }

  return nodes;
}

function getProtocol(href: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(href.trim());

  return match ? match[1].toLowerCase() : null;
}

function isAllowedHref(href: string, allowedProtocols: string[]): boolean {
  const protocol = getProtocol(href);

  return protocol === null || allowedProtocols.indexOf(protocol) !== -1;
}

function isExternalHref(href: string): boolean {
  const protocol = getProtocol(href);

  return protocol !== null && protocol !== 'mailto';
}

const useStyles = createStyles((_theme) => ({
  root: {
    color: 'var(--markdown-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--markdown-font-family, inherit)',
    fontSize: 'var(--markdown-font-size, 0.875rem)',
    lineHeight: 1.6,
    overflowWrap: 'anywhere'
  },

  heading: {
    margin: '1rem 0 0.5rem',
    color: 'var(--markdown-heading-color, var(--text-basic-color, #222b45))',
    fontWeight: 700,
    lineHeight: 1.3
  },

  paragraph: {
    margin: '0 0 0.75rem'
  },

  strong: {
    fontWeight: 700
  },

  emphasis: {
    fontStyle: 'italic'
  },

  inlineCode: {
    padding: '0.1rem 0.25rem',
    borderRadius: '0.2rem',
    backgroundColor:
      'var(--markdown-inline-code-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--markdown-inline-code-color, var(--color-danger-800, #94124e))',
    fontFamily: 'var(--markdown-code-font-family, monospace)',
    fontSize: '0.85em'
  },

  pre: {
    margin: '0 0 0.75rem',
    padding: '0.75rem',
    overflowX: 'auto',
    borderRadius: 'var(--markdown-code-border-radius, 0.25rem)',
    backgroundColor:
      'var(--markdown-code-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  codeBlock: {
    color: 'var(--markdown-code-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--markdown-code-font-family, monospace)',
    fontSize: '0.8125rem',
    whiteSpace: 'pre'
  },

  list: {
    margin: '0 0 0.75rem',
    paddingLeft: '1.5rem'
  },

  orderedList: {
    margin: '0 0 0.75rem',
    paddingLeft: '1.5rem'
  },

  listItem: {
    margin: '0.15rem 0'
  },

  blockquote: {
    margin: '0 0 0.75rem',
    padding: '0.25rem 0 0.25rem 0.75rem',
    borderLeft:
      '3px solid var(--markdown-blockquote-border-color, var(--border-basic-color-3, #e4e9f2))',
    color: 'var(--markdown-blockquote-color, var(--color-basic-700, #3d4d6a))'
  },

  link: {
    color: 'var(--markdown-link-color, var(--color-primary-800, #274bdb))',
    textDecoration: 'underline'
  },

  hr: {
    margin: '1rem 0',
    border: 0,
    borderTop: '1px solid var(--markdown-hr-color, var(--border-basic-color-3, #e4e9f2))'
  }
}));

export type MarkdownStylesNames = Selectors<typeof useStyles>;

export interface MarkdownProps
  extends
    DefaultProps<MarkdownStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  value: string;
  allowedProtocols?: string[];
  headingOffset?: number;
  ariaLabel?: string;
}

const defaultProps: Partial<MarkdownProps> = {
  allowedProtocols: ['http', 'https', 'mailto'],
  headingOffset: 0
};

interface RenderContext {
  classes: Record<MarkdownStylesNames, string>;
  allowedProtocols: string[];
}

function renderInline(
  nodes: MarkdownInline[],
  keyPrefix: string,
  context: RenderContext
): React.ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (node.type) {
      case 'strong':
        return (
          <strong key={key} className={context.classes.strong}>
            {renderInline(node.children, key, context)}
          </strong>
        );
      case 'emphasis':
        return (
          <em key={key} className={context.classes.emphasis}>
            {renderInline(node.children, key, context)}
          </em>
        );
      case 'code':
        return (
          <code key={key} className={context.classes.inlineCode}>
            {node.value}
          </code>
        );
      case 'link': {
        if (!isAllowedHref(node.href, context.allowedProtocols)) {
          return <span key={key}>{renderInline(node.children, key, context)}</span>;
        }

        const external = isExternalHref(node.href);

        return (
          <a
            key={key}
            className={context.classes.link}
            href={node.href}
            rel={external ? 'noreferrer noopener' : undefined}
            target={external ? '_blank' : undefined}
          >
            {renderInline(node.children, key, context)}
          </a>
        );
      }
      case 'text':
      default:
        return node.value;
    }
  });
}

const _Markdown = forwardRef<HTMLDivElement, MarkdownProps>((props, ref) => {
  const {
    value,
    allowedProtocols,
    headingOffset,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'markdown', classNames, styles, unstyled });
  const nodes = useMemo(() => parseMarkdown(value), [value]);
  const context: RenderContext = { classes, allowedProtocols };

  const blocks = nodes.map((node, index) => {
    const key = `block-${index}`;

    switch (node.type) {
      case 'heading': {
        const level = Math.min(6, Math.max(1, node.level + headingOffset));

        return React.createElement(
          `h${level}`,
          { key, className: classes.heading },
          renderInline(node.children, key, context)
        );
      }
      case 'paragraph':
        return (
          <p key={key} className={classes.paragraph}>
            {renderInline(node.children, key, context)}
          </p>
        );
      case 'code':
        return (
          <pre key={key} className={classes.pre}>
            <code className={classes.codeBlock}>{node.value}</code>
          </pre>
        );
      case 'list': {
        const ListTag = node.ordered ? 'ol' : 'ul';

        return React.createElement(
          ListTag,
          { key, className: node.ordered ? classes.orderedList : classes.list },
          node.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} className={classes.listItem}>
              {renderInline(item, `${key}-${itemIndex}`, context)}
            </li>
          ))
        );
      }
      case 'blockquote':
        return (
          <blockquote key={key} className={classes.blockquote}>
            {renderInline(node.children, key, context)}
          </blockquote>
        );
      case 'hr':
        return <hr key={key} className={classes.hr} />;
      default:
        return null;
    }
  });

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      role="article"
      aria-label={ariaLabel}
    >
      {blocks}
    </div>
  );
});

_Markdown.displayName = 'Markdown';

export { _Markdown as Markdown };
