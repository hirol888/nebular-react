import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useMergedRef } from '@nebular-react/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { Button } from '../Button';

export type JsonTokenType = 'plain' | 'string' | 'number' | 'keyword';

export interface JsonToken {
  type: JsonTokenType;
  value: string;
}

export interface JsonValidationError {
  message: string;
  line: number;
  column: number;
}

export interface JsonValidationResult {
  valid: boolean;
  error?: JsonValidationError;
}

interface IndexedPosition {
  line: number;
  column: number;
}

function indexToPosition(text: string, index: number): IndexedPosition {
  const safeIndex = Math.max(0, Math.min(index, text.length));
  const before = text.slice(0, safeIndex);
  const lastBreak = before.lastIndexOf('\n');

  return {
    line: before.split('\n').length,
    column: safeIndex - lastBreak
  };
}

function toFriendlyMessage(raw: string): string {
  return raw
    .replace(
      /^Unexpected non-whitespace character after JSON at position \d+/,
      'Unexpected non-whitespace character after JSON'
    )
    .replace(/\s*\(line \d+ column \d+\)\s*$/, '')
    .replace(/\s+at position \d+/, '')
    .replace(/,\s*["'][\s\S]*["']\s+is not valid JSON$/, '')
    .trim();
}

function resolveErrorPosition(rawMessage: string, text: string): IndexedPosition {
  const lineColumn = /\(line (\d+) column (\d+)\)/.exec(rawMessage);

  if (lineColumn) {
    return { line: Number(lineColumn[1]), column: Number(lineColumn[2]) };
  }

  const position = /at position (\d+)/.exec(rawMessage);

  if (position) {
    return indexToPosition(text, Number(position[1]));
  }

  const token = /Unexpected token '(.+?)'/.exec(rawMessage);

  if (token) {
    const index = text.indexOf(token[1]);

    if (index >= 0) {
      return indexToPosition(text, index);
    }
  }

  return { line: 1, column: 1 };
}

/**
 * Validates a JSON document, reporting a friendly message plus the best known
 * line/column of the first error. Empty or whitespace only input is treated as
 * valid so an editor can start empty without an error state.
 */
export function validateJson(value: string): JsonValidationResult {
  if (typeof value !== 'string' || value.trim() === '') {
    return { valid: true };
  }

  try {
    JSON.parse(value);

    return { valid: true };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);

    return {
      valid: false,
      error: {
        message: toFriendlyMessage(rawMessage),
        ...resolveErrorPosition(rawMessage, value)
      }
    };
  }
}

function tryParse(value: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false };
  }
}

/** Formats a JSON document with `indent` spaces. Returns `null` for invalid input. */
export function formatJson(value: string, indent = 2): string | null {
  const parsed = tryParse(value);

  if (!parsed.ok) {
    return null;
  }

  return JSON.stringify(parsed.value, null, indent) ?? null;
}

/** Removes insignificant whitespace from a JSON document. Returns `null` for invalid input. */
export function minifyJson(value: string): string | null {
  const parsed = tryParse(value);

  if (!parsed.ok) {
    return null;
  }

  return JSON.stringify(parsed.value) ?? null;
}

function tokenizeJsonLine(line: string): JsonToken[] {
  const tokenizer =
    /("(?:\\[\s\S]|[^"\\])*"?)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)/g;
  const tokens: JsonToken[] = [];
  let lastIndex = 0;
  let match = tokenizer.exec(line);

  while (match) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: line.slice(lastIndex, match.index) });
    }

    let type: JsonTokenType = 'keyword';

    if (match[1]) {
      type = 'string';
    } else if (match[2]) {
      type = 'number';
    }

    tokens.push({ type, value: match[0] });
    lastIndex = match.index + match[0].length;
    match = tokenizer.exec(line);
  }

  if (lastIndex < line.length) {
    tokens.push({ type: 'plain', value: line.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Splits JSON source into lines of typed tokens. This is a deliberately small
 * tokenizer (no parser, no dependencies) used only to paint an overlay.
 */
export function tokenizeJson(code: string): JsonToken[][] {
  return code.split('\n').map(tokenizeJsonLine);
}

const useStyles = createStyles((_theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    fontFamily: 'var(--json-editor-font-family, inherit)'
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.4rem'
  },

  editor: {
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    border: '1px solid var(--json-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderRadius: 'var(--json-editor-border-radius, 0.375rem)',
    backgroundColor: 'var(--json-editor-background-color, #f7f9fc)',
    color: 'var(--json-editor-text-color, #222b45)',
    fontFamily: 'var(--json-editor-font-family, ui-monospace, SFMono-Regular, monospace)',
    fontSize: 'var(--json-editor-font-size, 0.8125rem)',
    lineHeight: 1.5
  },

  editorDisabled: {
    opacity: 0.6
  },

  gutter: {
    flex: '0 0 auto',
    padding: '0.5rem 0.5rem 0.5rem 0.75rem',
    overflow: 'hidden',
    color: 'var(--json-editor-line-number-color, var(--text-hint-color, #8f9bb3))',
    textAlign: 'right',
    userSelect: 'none',
    backgroundColor: 'var(--json-editor-gutter-background-color, rgba(143, 155, 179, 0.1))'
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
    caretColor: 'var(--json-editor-caret-color, var(--text-basic-color, #222b45))',
    whiteSpace: 'pre',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    tabSize: 2,

    '&::placeholder': {
      color: 'var(--json-editor-placeholder-color, var(--text-hint-color, #8f9bb3))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--json-editor-focus-color, var(--color-primary-500, #3366ff))',
      outlineOffset: '-2px'
    }
  },

  tokenPlain: {},

  tokenString: {
    color: 'var(--json-editor-string-color, var(--color-success-800, #007d6c))'
  },

  tokenNumber: {
    color: 'var(--json-editor-number-color, var(--color-danger-800, #94124e))'
  },

  tokenKeyword: {
    color: 'var(--json-editor-keyword-color, var(--color-primary-800, #274bdb))',
    fontWeight: 600
  },

  error: {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    backgroundColor: 'var(--json-editor-error-background-color, #ffe7e7)',
    color: 'var(--json-editor-error-color, var(--color-danger-800, #94124e))',
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.4
  }
}));

export type JsonEditorStylesNames = Selectors<typeof useStyles>;

type JsonEditorClasses = ReturnType<typeof useStyles>['classes'];

function tokenClassName(classes: JsonEditorClasses, type: JsonTokenType): string {
  if (type === 'string') {
    return classes.tokenString;
  }

  if (type === 'number') {
    return classes.tokenNumber;
  }

  if (type === 'keyword') {
    return classes.tokenKeyword;
  }

  return classes.tokenPlain;
}

export interface JsonEditorProps extends DefaultProps<JsonEditorStylesNames> {
  /** Controlled JSON source. Leave empty to let the editor manage its own value. */
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  onValidate?(result: JsonValidationResult): void;
  readOnly?: boolean;
  disabled?: boolean;
  /** Editor viewport height. Numbers are treated as pixels. */
  height?: number | string;
  showToolbar?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  /** Spaces inserted by the format button and the Tab key. */
  indent?: number;
}

const defaultProps: Partial<JsonEditorProps> = {
  defaultValue: '',
  readOnly: false,
  disabled: false,
  height: 240,
  showToolbar: true,
  ariaLabel: 'JSON editor',
  placeholder: 'Paste or write JSON here',
  indent: 2
};

const _JsonEditor = forwardRef<HTMLTextAreaElement, JsonEditorProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    onValidate,
    readOnly,
    disabled,
    height,
    showToolbar,
    ariaLabel,
    placeholder,
    indent,
    className,
    classNames,
    styles,
    unstyled
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(null, { name: 'json-editor', classNames, styles, unstyled });
  const [internalValue, setInternalValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mergedRef = useMergedRef(textareaRef, ref);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null);
  const reportedValueRef = useRef<string | null>(null);
  const errorId = useId();
  const isControlled = value !== undefined;
  const text = isControlled ? value : internalValue;
  const indentSize = Math.max(0, Math.min(8, Math.round(indent)));
  const validation = useMemo(() => validateJson(text), [text]);
  const lines = useMemo(() => tokenizeJson(text), [text]);
  const canTransform = !disabled && !readOnly && text.trim() !== '' && validation.valid;

  useEffect(() => {
    if (reportedValueRef.current === text) {
      return;
    }

    reportedValueRef.current = text;
    onValidate?.(validation);
  }, [onValidate, text, validation]);

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

  const handleFormat = () => {
    const formatted = formatJson(text, indentSize);

    if (formatted !== null) {
      commit(formatted);
    }
  };

  const handleMinify = () => {
    const minified = minifyJson(text);

    if (minified !== null) {
      commit(minified);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab' || event.shiftKey || readOnly || disabled) {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const { selectionStart, selectionEnd } = textarea;
    const indentation = ' '.repeat(indentSize);
    const next = `${text.slice(0, selectionStart)}${indentation}${text.slice(selectionEnd)}`;
    const caret = selectionStart + indentation.length;

    pendingSelectionRef.current = { start: caret, end: caret };
    commit(next);
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
    >
      {showToolbar && (
        <div className={cx(classes.toolbar)}>
          <Button size="tiny" appearance="outline" disabled={!canTransform} onClick={handleFormat}>
            Formatar
          </Button>
          <Button size="tiny" appearance="outline" disabled={!canTransform} onClick={handleMinify}>
            Minificar
          </Button>
        </div>
      )}
      <div
        className={cx(classes.editor, { [classes.editorDisabled]: disabled })}
        style={{ height }}
      >
        <div ref={gutterRef} className={cx(classes.gutter)} aria-hidden="true">
          {lines.map((_line, index) => (
            <span key={index} className={cx(classes.gutterLine)}>
              {index + 1}
            </span>
          ))}
        </div>
        <div className={cx(classes.field)}>
          <pre ref={highlightRef} className={cx(classes.highlight)} aria-hidden="true">
            <code className={cx(classes.code)}>
              {lines.map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={tokenClassName(classes, token.type)}>
                      {token.value}
                    </span>
                  ))}
                  {lineIndex < lines.length - 1 ? '\n' : null}
                </React.Fragment>
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
            aria-invalid={validation.valid ? undefined : true}
            aria-describedby={validation.valid ? undefined : errorId}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </div>
      {!validation.valid && validation.error && (
        <div id={errorId} role="alert" className={cx(classes.error)}>
          {`${validation.error.message} (line ${validation.error.line}, column ${validation.error.column})`}
        </div>
      )}
    </div>
  );
});

_JsonEditor.displayName = 'JsonEditor';

export { _JsonEditor as JsonEditor };
