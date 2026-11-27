import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { tokenizeCode } from '../CodeBlock';
import { tokenizeJson } from '../JsonEditor';

export type CodeEditorLanguage = 'text' | 'json' | 'javascript' | 'typescript' | 'html' | 'css';

export type CodeEditorTokenType =
  'plain' | 'comment' | 'string' | 'number' | 'keyword' | 'tag' | 'attribute' | 'property';

export interface CodeEditorToken {
  text: string;
  type: CodeEditorTokenType;
}

interface HighlightRule {
  type: CodeEditorTokenType;
  pattern: string;
}

interface SelectionEdit {
  value: string;
  start: number;
  end: number;
}

const STRING_PATTERN = '"(?:\\\\[\\s\\S]|[^"\\\\])*"|\'(?:\\\\[\\s\\S]|[^\'\\\\])*\'';

const HTML_RULES: HighlightRule[] = [
  { type: 'comment', pattern: '<!--[\\s\\S]*?-->' },
  { type: 'tag', pattern: '<\\/?[A-Za-z][\\w:-]*' },
  { type: 'string', pattern: STRING_PATTERN },
  { type: 'attribute', pattern: '[A-Za-z_:][\\w:.-]*(?=\\s*=)' },
  { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?(?!\\w)' }
];

const CSS_RULES: HighlightRule[] = [
  { type: 'comment', pattern: '\\/\\*[\\s\\S]*?\\*\\/' },
  { type: 'string', pattern: STRING_PATTERN },
  { type: 'keyword', pattern: '@[\\w-]+|!important\\b' },
  { type: 'property', pattern: '[-A-Za-z]+(?=\\s*:)' },
  { type: 'number', pattern: '\\b\\d+(?:\\.\\d+)?(?:px|rem|em|vh|vw|ms|s|%)?(?!\\w)' }
];

function tokenizeWithRules(code: string, rules: HighlightRule[]): CodeEditorToken[] {
  const tokenizer = new RegExp(rules.map((rule) => `(${rule.pattern})`).join('|'), 'g');
  const tokens: CodeEditorToken[] = [];
  let lastIndex = 0;
  let match = tokenizer.exec(code);

  while (match) {
    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), type: 'plain' });
    }

    const groupIndex = match.slice(1).findIndex((group) => group !== undefined);
    const rule = rules[groupIndex];

    tokens.push({ text: match[0], type: rule ? rule.type : 'plain' });
    lastIndex = match.index + match[0].length;

    if (match[0].length === 0) {
      tokenizer.lastIndex += 1;
    }

    match = tokenizer.exec(code);
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), type: 'plain' });
  }

  return tokens;
}

function highlightJson(code: string): CodeEditorToken[] {
  const lines = tokenizeJson(code);
  const tokens: CodeEditorToken[] = [];

  lines.forEach((line, lineIndex) => {
    line.forEach((token) => {
      tokens.push({ text: token.value, type: token.type });
    });

    if (lineIndex < lines.length - 1) {
      tokens.push({ text: '\n', type: 'plain' });
    }
  });

  return tokens;
}

/**
 * Splits `code` into typed tokens for the highlight overlay. The tokenizer is
 * deliberately small (regex based, no dependencies) and always reconstructs the
 * original source when the token texts are concatenated. JSON reuses
 * `tokenizeJson`; JavaScript and TypeScript reuse `tokenizeCode`.
 */
export function highlightCode(
  code: string,
  language: CodeEditorLanguage = 'text'
): CodeEditorToken[] {
  if (code.length === 0) {
    return [];
  }

  if (language === 'json') {
    return highlightJson(code);
  }

  if (language === 'javascript' || language === 'typescript') {
    return tokenizeCode(code, language).map((token) => ({ text: token.value, type: token.type }));
  }

  if (language === 'html') {
    return tokenizeWithRules(code, HTML_RULES);
  }

  if (language === 'css') {
    return tokenizeWithRules(code, CSS_RULES);
  }

  return [{ text: code, type: 'plain' }];
}

function lineStartAt(text: string, position: number): number {
  if (position <= 0) {
    return 0;
  }

  return text.lastIndexOf('\n', position - 1) + 1;
}

function selectedLineStarts(text: string, start: number, end: number): number[] {
  const effectiveEnd = end > start && text[end - 1] === '\n' ? end - 1 : end;
  const lastLineStart = lineStartAt(text, effectiveEnd);
  const lineStarts: number[] = [lineStartAt(text, start)];

  while (lineStarts[lineStarts.length - 1] < lastLineStart) {
    lineStarts.push(text.indexOf('\n', lineStarts[lineStarts.length - 1]) + 1);
  }

  return lineStarts;
}

function indentSelection(text: string, start: number, end: number, size: number): SelectionEdit {
  const indentation = ' '.repeat(size);

  if (start === end) {
    return {
      value: `${text.slice(0, start)}${indentation}${text.slice(start)}`,
      start: start + indentation.length,
      end: end + indentation.length
    };
  }

  const lineStarts = selectedLineStarts(text, start, end);
  let value = text;

  for (let index = lineStarts.length - 1; index >= 0; index -= 1) {
    const lineStart = lineStarts[index];

    value = `${value.slice(0, lineStart)}${indentation}${value.slice(lineStart)}`;
  }

  const startShift = start > lineStarts[0] ? indentation.length : 0;

  return {
    value,
    start: start + startShift,
    end: end + indentation.length * lineStarts.length
  };
}

function outdentSelection(text: string, start: number, end: number, size: number): SelectionEdit {
  const lineStarts = selectedLineStarts(text, start, end);
  const removals = lineStarts.map((lineStart) => {
    if (text[lineStart] === '\t') {
      return 1;
    }

    let count = 0;

    while (count < size && text[lineStart + count] === ' ') {
      count += 1;
    }

    return count;
  });

  let value = text;

  for (let index = lineStarts.length - 1; index >= 0; index -= 1) {
    const lineStart = lineStarts[index];
    const removal = removals[index];

    if (removal > 0) {
      value = `${value.slice(0, lineStart)}${value.slice(lineStart + removal)}`;
    }
  }

  const shiftBefore = (position: number): number =>
    lineStarts.reduce(
      (shift, lineStart, index) =>
        lineStart < position ? shift + Math.min(removals[index], position - lineStart) : shift,
      0
    );

  return {
    value,
    start: start - shiftBefore(start),
    end: end - shiftBefore(end)
  };
}

function leadingWhitespace(value: string): string {
  const match = /^[ \t]*/.exec(value);

  return match ? match[0] : '';
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    fontFamily: 'var(--code-editor-font-family, inherit)'
  },

  editor: {
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    border: '1px solid var(--code-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--code-editor-border-radius, 0.375rem)',
    backgroundColor: 'var(--code-editor-background-color, #f7f9fc)',
    color: 'var(--code-editor-text-color, #222b45)',
    fontFamily: 'var(--code-editor-font-family, ui-monospace, SFMono-Regular, monospace)',
    fontSize: 'var(--code-editor-font-size, 0.8125rem)',
    lineHeight: 1.5
  },

  editorDisabled: {
    opacity: 0.6
  },

  gutter: {
    flex: '0 0 auto',
    padding: '0.5rem 0.5rem 0.5rem 0.75rem',
    overflow: 'hidden',
    color: 'var(--code-editor-line-number-color, var(--text-hint-color, #8f9bb3))',
    textAlign: 'right',
    userSelect: 'none',
    backgroundColor: 'var(--code-editor-gutter-background-color, rgba(143, 155, 179, 0.1))'
  },

  gutterLine: {
    display: 'block'
  },

  field: {
    position: 'relative',
    flex: '1 1 auto',
    minWidth: 0
  },

  highlight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    margin: 0,
    padding: '0.5rem',
    overflow: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit'
  },

  code: {
    fontFamily: 'inherit'
  },

  textarea: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: '0.5rem',
    border: 0,
    outline: 'none',
    resize: 'none',
    overflow: 'auto',
    backgroundColor: 'transparent',
    color: 'transparent',
    caretColor: 'var(--code-editor-caret-color, var(--text-basic-color, #222b45))',
    whiteSpace: 'pre',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',

    '&::placeholder': {
      color: 'var(--code-editor-placeholder-color, var(--text-hint-color, #8f9bb3))',
      opacity: 1
    },

    '&:focus-visible': {
      outline: '2px solid var(--code-editor-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  tokenPlain: {},

  tokenComment: {
    color: 'var(--code-editor-comment-color, var(--color-basic-700, #3d4d6a))',
    fontStyle: 'italic'
  },

  tokenString: {
    color: 'var(--code-editor-string-color, var(--color-success-800, #007d6c))'
  },

  tokenNumber: {
    color: 'var(--code-editor-number-color, var(--color-danger-800, #94124e))'
  },

  tokenKeyword: {
    color: 'var(--code-editor-keyword-color, var(--color-primary-800, #274bdb))',
    fontWeight: 600
  },

  tokenTag: {
    color: 'var(--code-editor-tag-color, var(--color-primary-800, #274bdb))'
  },

  tokenAttribute: {
    color: 'var(--code-editor-attribute-color, var(--color-warning-800, #8f5d00))'
  },

  tokenProperty: {
    color: 'var(--code-editor-property-color, var(--color-info-800, #0055a8))'
  }
}));

export type CodeEditorStylesNames = Selectors<typeof useStyles>;

type CodeEditorClasses = ReturnType<typeof useStyles>['classes'];

function tokenClassName(classes: CodeEditorClasses, type: CodeEditorTokenType): string {
  switch (type) {
    case 'comment':
      return classes.tokenComment;
    case 'string':
      return classes.tokenString;
    case 'number':
      return classes.tokenNumber;
    case 'keyword':
      return classes.tokenKeyword;
    case 'tag':
      return classes.tokenTag;
    case 'attribute':
      return classes.tokenAttribute;
    case 'property':
      return classes.tokenProperty;
    default:
      return classes.tokenPlain;
  }
}

export interface CodeEditorProps extends DefaultProps<CodeEditorStylesNames> {
  /** Controlled source. Leave undefined to let the editor manage its own value. */
  value?: string;
  defaultValue?: string;
  /** Called with the full source after every edit. */
  onChange?(value: string): void;
  /** Language used by the lightweight syntax highlighter. */
  language?: CodeEditorLanguage;
  readOnly?: boolean;
  disabled?: boolean;
  /** Editor viewport height. Numbers are treated as pixels. */
  height?: number | string;
  lineNumbers?: boolean;
  /** Spaces inserted by Tab and used when removing indentation. */
  tabSize?: number;
  ariaLabel?: string;
  placeholder?: string;
  /** Soft wraps long lines instead of scrolling horizontally. */
  wrap?: boolean;
}

const defaultProps: Partial<CodeEditorProps> = {
  defaultValue: '',
  language: 'text',
  readOnly: false,
  disabled: false,
  height: 240,
  lineNumbers: true,
  tabSize: 2,
  ariaLabel: 'Code editor',
  wrap: false
};

const _CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    language,
    readOnly,
    disabled,
    height,
    lineNumbers,
    tabSize,
    ariaLabel,
    placeholder,
    wrap,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'code-editor', classNames, styles, unstyled });
  const [internalValue, setInternalValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mergedRef = useMergedRef(textareaRef, ref);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const isControlled = value !== undefined;
  const text = isControlled ? value : internalValue;
  const resolvedTabSize = Math.max(0, Math.min(8, Math.round(tabSize)));
  const lines = useMemo(() => text.split('\n'), [text]);
  const tokens = useMemo(() => highlightCode(text, language), [language, text]);
  const wrapStyle = wrap
    ? { whiteSpace: 'pre-wrap' as const, overflowWrap: 'break-word' as const }
    : { whiteSpace: 'pre' as const };

  useEffect(() => {
    const pending = pendingSelectionRef.current;
    const textarea = textareaRef.current;

    if (!pending || !textarea) {
      return;
    }

    pendingSelectionRef.current = null;
    textarea.setSelectionRange(pending.start, pending.end);
  }, [text]);

  const commit = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }

    onChange?.(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly || disabled) {
      return;
    }

    const textarea = event.currentTarget;

    if (event.key === 'Tab') {
      event.preventDefault();

      const edit = event.shiftKey
        ? outdentSelection(text, textarea.selectionStart, textarea.selectionEnd, resolvedTabSize)
        : indentSelection(text, textarea.selectionStart, textarea.selectionEnd, resolvedTabSize);

      pendingSelectionRef.current = { start: edit.start, end: edit.end };
      commit(edit.value);

      return;
    }

    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();

      const { selectionStart, selectionEnd } = textarea;
      const indentation = leadingWhitespace(
        text.slice(lineStartAt(text, selectionStart), selectionStart)
      );
      const insertion = `\n${indentation}`;
      const next = `${text.slice(0, selectionStart)}${insertion}${text.slice(selectionEnd)}`;
      const caret = selectionStart + insertion.length;

      pendingSelectionRef.current = { start: caret, end: caret };
      commit(next);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = event.currentTarget;

    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }

    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  return (
    <div
      className={cx(classes.root, className)}
      role="group"
      aria-label={ariaLabel}
      data-disabled={disabled || undefined}
      data-language={language}
      data-readonly={readOnly || undefined}
    >
      <div
        className={cx(classes.editor, { [classes.editorDisabled]: disabled })}
        style={{ height }}
      >
        {lineNumbers && (
          <div ref={gutterRef} className={cx(classes.gutter)} aria-hidden="true">
            {lines.map((_line, index) => (
              <span key={index} className={cx(classes.gutterLine)}>
                {index + 1}
              </span>
            ))}
          </div>
        )}
        <div className={cx(classes.field)}>
          <pre
            ref={highlightRef}
            className={cx(classes.highlight)}
            aria-hidden="true"
            style={{ tabSize: resolvedTabSize, ...wrapStyle }}
          >
            <code className={cx(classes.code)}>
              {tokens.map((token, index) => (
                <span key={index} className={cx(tokenClassName(classes, token.type))}>
                  {token.text}
                </span>
              ))}
            </code>
          </pre>
          <textarea
            ref={mergedRef}
            className={cx(classes.textarea)}
            value={text}
            onChange={(event) => commit(event.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            readOnly={readOnly}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-multiline="true"
            wrap={wrap ? 'soft' : 'off'}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            style={{ tabSize: resolvedTabSize, ...wrapStyle }}
          />
        </div>
      </div>
    </div>
  );
});

_CodeEditor.displayName = 'CodeEditor';

export { _CodeEditor as CodeEditor };
