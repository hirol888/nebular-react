import React, { forwardRef, useId, useRef } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useIsomorphicEffect } from '@nebular-react/hooks';
import { Markdown } from '../Markdown';
import { SegmentedControl } from '../SegmentedControl';
import { MarkdownEditorLabels, useMarkdownEditorLabels } from './MarkdownEditor.labels';

export type MarkdownEditorPreviewMode = 'split' | 'edit' | 'preview';

export type MarkdownEditorToolbarAction =
  'bold' | 'italic' | 'link' | 'inlineCode' | 'codeBlock' | 'list' | 'quote' | 'heading';

interface MarkdownEditorStylesParams {
  height: number;
  disabled: boolean;
}

const BORDER_COLOR = 'var(--markdown-editor-border-color, var(--border-basic-color-3, #e4e9f2))';
const SURFACE_COLOR =
  'var(--markdown-editor-background-color, var(--background-basic-color-1, #ffffff))';

const useStyles = createStyles((_theme, { height, disabled }: MarkdownEditorStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflow: 'hidden',
    border: `1px solid ${BORDER_COLOR}`,
    borderRadius: 'var(--markdown-editor-border-radius, 0.375rem)',
    backgroundColor: SURFACE_COLOR,
    color: 'var(--markdown-editor-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'var(--markdown-editor-font-family, inherit)',
    opacity: disabled ? 0.6 : 1,

    '& *': {
      boxSizing: 'border-box'
    }
  },

  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem',
    borderBottom: `1px solid ${BORDER_COLOR}`,
    backgroundColor:
      'var(--markdown-editor-toolbar-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  toolbarGlyph: {
    whiteSpace: 'pre',

    '&::before': {
      content: 'attr(data-glyph)'
    }
  },

  toolbarGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.15rem'
  },

  toolbarSpacer: {
    flex: 1
  },

  toolbarButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '1.75rem',
    height: '1.75rem',
    padding: '0 0.35rem',
    border: 0,
    borderRadius: '0.2rem',
    background: 'transparent',
    color: 'var(--markdown-editor-toolbar-color, var(--text-basic-color, #222b45))',
    font: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1,
    cursor: 'pointer',

    '&:hover:not(:disabled)': {
      backgroundColor:
        'var(--markdown-editor-toolbar-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    },

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5
    }
  },

  body: {
    display: 'grid',
    height,
    minHeight: 0,
    gap: '1px',
    backgroundColor: BORDER_COLOR
  },

  split: {
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',

    '@media (max-width: 47.99em)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)'
    }
  },

  single: {
    gridTemplateColumns: 'minmax(0, 1fr)'
  },

  editPane: {
    display: 'flex',
    minWidth: 0,
    minHeight: 0,
    backgroundColor: SURFACE_COLOR
  },

  editor: {
    display: 'block',
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 'var(--markdown-editor-padding, 0.75rem)',
    border: 0,
    outline: 'none',
    resize: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily:
      'var(--markdown-editor-code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace)',
    fontSize: 'var(--markdown-editor-font-size, 0.8125rem)',
    lineHeight: 'var(--markdown-editor-line-height, 1.6)',
    tabSize: 2,
    overflow: 'auto',

    '&::placeholder': {
      color: 'var(--markdown-editor-placeholder-color, var(--text-hint-color, #8f9bb3))'
    },

    '&:focus-visible': {
      boxShadow: 'inset 0 0 0 2px var(--color-primary-500, #3366ff)'
    },

    '&:read-only': {
      cursor: 'default'
    },

    '&:disabled': {
      cursor: 'not-allowed'
    }
  },

  preview: {
    height: '100%',
    padding: 'var(--markdown-editor-preview-padding, 0.75rem 1rem)',
    overflow: 'auto',
    backgroundColor: SURFACE_COLOR
  },

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0.25rem 0.5rem',
    borderTop: `1px solid ${BORDER_COLOR}`,
    backgroundColor:
      'var(--markdown-editor-toolbar-background-color, var(--background-basic-color-2, #f7f9fc))'
  },

  counter: {
    color: 'var(--markdown-editor-counter-color, var(--text-hint-color, #8f9bb3))',
    fontSize: '0.75rem',
    fontVariantNumeric: 'tabular-nums'
  }
}));

export type MarkdownEditorStylesNames = Selectors<typeof useStyles>;

export interface MarkdownEditorProps
  extends
    DefaultProps<MarkdownEditorStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?(value: string): void;
  previewMode?: MarkdownEditorPreviewMode;
  defaultPreviewMode?: MarkdownEditorPreviewMode;
  onPreviewModeChange?(mode: MarkdownEditorPreviewMode): void;
  height?: number;
  toolbar?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  placeholder?: string;
  /** Overrides the toolbar, preview mode and accessible labels resolved from the locale catalog. */
  labels?: Partial<MarkdownEditorLabels>;
  maxLength?: number;
  /** Keeps the edit and preview panes scrolled to the same relative position. */
  syncScroll?: boolean;
}

interface MarkdownEditorToolbarItem {
  action: MarkdownEditorToolbarAction;
  labelKey: keyof MarkdownEditorLabels;
  content: React.ReactNode;
}

const toolbarItems: MarkdownEditorToolbarItem[] = [
  { action: 'bold', labelKey: 'bold', content: 'B' },
  { action: 'italic', labelKey: 'italic', content: 'I' },
  { action: 'link', labelKey: 'insertLink', content: 'Link' },
  { action: 'inlineCode', labelKey: 'inlineCode', content: '`x`' },
  { action: 'codeBlock', labelKey: 'codeBlock', content: '{ }' },
  { action: 'list', labelKey: 'bulletList', content: '•' },
  { action: 'quote', labelKey: 'quote', content: '>' },
  { action: 'heading', labelKey: 'heading', content: 'H' }
];

const defaultProps: Partial<MarkdownEditorProps> = {
  defaultValue: '',
  height: 320,
  toolbar: true,
  readOnly: false,
  disabled: false,
  ariaLabel: 'Markdown editor',
  syncScroll: false
};

const isPreviewMode = (value: string): value is MarkdownEditorPreviewMode =>
  value === 'split' || value === 'edit' || value === 'preview';

const _MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    previewMode,
    defaultPreviewMode,
    onPreviewModeChange,
    height,
    toolbar,
    readOnly,
    disabled,
    ariaLabel,
    placeholder,
    labels: labelsProp,
    maxLength,
    syncScroll,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { height, disabled },
    { name: 'markdown-editor', classNames, styles, unstyled }
  );
  const labels = useMarkdownEditorLabels(labelsProp);
  const previewModeData = [
    { label: labels.edit, value: 'edit' },
    { label: labels.split, value: 'split' },
    { label: labels.preview, value: 'preview' }
  ];
  const [currentValue, setValue] = useUncontrolled<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange
  });
  const [mode, setMode] = useUncontrolled<MarkdownEditorPreviewMode>({
    value: previewMode,
    defaultValue: defaultPreviewMode,
    finalValue: 'split',
    onChange: onPreviewModeChange
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pendingSelectionRef = useRef<[number, number] | null>(null);
  const counterId = useId();

  useIsomorphicEffect(() => {
    const textarea = textareaRef.current;
    const pendingSelection = pendingSelectionRef.current;

    if (!textarea || !pendingSelection) {
      return;
    }

    pendingSelectionRef.current = null;
    textarea.focus();
    textarea.setSelectionRange(pendingSelection[0], pendingSelection[1]);
  });

  const clampValue = (next: string): string =>
    typeof maxLength === 'number' && maxLength >= 0 && next.length > maxLength
      ? next.slice(0, maxLength)
      : next;

  const commitValue = (next: string, selection?: [number, number]) => {
    const limited = clampValue(next);

    if (selection) {
      pendingSelectionRef.current = [
        Math.min(selection[0], limited.length),
        Math.min(selection[1], limited.length)
      ];
    }

    setValue(limited);
  };

  const getSelection = (): [number, number] | null => {
    const textarea = textareaRef.current;

    return textarea ? [textarea.selectionStart, textarea.selectionEnd] : null;
  };

  const applyWrap = (prefix: string, suffix: string) => {
    const selection = getSelection();

    if (!selection) {
      return;
    }

    const [start, end] = selection;
    const selected = currentValue.slice(start, end);
    const next = `${currentValue.slice(0, start)}${prefix}${selected}${suffix}${currentValue.slice(end)}`;
    const innerStart = start + prefix.length;

    commitValue(next, [innerStart, innerStart + selected.length]);
  };

  const applyLink = () => {
    const selection = getSelection();

    if (!selection) {
      return;
    }

    const [start, end] = selection;
    const selected = currentValue.slice(start, end) || 'text';
    const url = 'https://';
    const next = `${currentValue.slice(0, start)}[${selected}](${url})${currentValue.slice(end)}`;
    const urlStart = start + selected.length + 3;

    commitValue(next, [urlStart, urlStart + url.length]);
  };

  const applyCodeBlock = () => {
    const selection = getSelection();

    if (!selection) {
      return;
    }

    const [start, end] = selection;
    const selected = currentValue.slice(start, end);
    const before = currentValue.slice(0, start);
    const leadingBreak = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
    const block = `${leadingBreak}\`\`\`\n${selected}\n\`\`\`\n`;
    const next = `${before}${block}${currentValue.slice(end)}`;
    const caret = start + block.length;

    commitValue(next, [caret, caret]);
  };

  const applyLinePrefix = (prefix: string) => {
    const selection = getSelection();

    if (!selection) {
      return;
    }

    const [start, end] = selection;
    const lineStart = start === 0 ? 0 : currentValue.lastIndexOf('\n', start - 1) + 1;
    const nextBreak = currentValue.indexOf('\n', end);
    const lineEnd = nextBreak === -1 ? currentValue.length : nextBreak;
    const block = currentValue.slice(lineStart, lineEnd);
    const prefixed =
      block === ''
        ? prefix
        : block
            .split('\n')
            .map((line) => (line === '' ? line : `${prefix}${line}`))
            .join('\n');
    const next = `${currentValue.slice(0, lineStart)}${prefixed}${currentValue.slice(lineEnd)}`;

    commitValue(next, [lineStart, lineStart + prefixed.length]);
  };

  const runToolbarAction = (action: MarkdownEditorToolbarAction) => {
    if (disabled || readOnly || mode === 'preview') {
      return;
    }

    switch (action) {
      case 'bold':
        applyWrap('**', '**');
        break;

      case 'italic':
        applyWrap('*', '*');
        break;

      case 'link':
        applyLink();
        break;

      case 'inlineCode':
        applyWrap('`', '`');
        break;

      case 'codeBlock':
        applyCodeBlock();
        break;

      case 'list':
        applyLinePrefix('- ');
        break;

      case 'quote':
        applyLinePrefix('> ');
        break;

      case 'heading':
        applyLinePrefix('## ');
        break;

      default:
        break;
    }
  };

  const handleModeChange = (nextMode: string) => {
    if (isPreviewMode(nextMode)) {
      setMode(nextMode);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || readOnly) {
      return;
    }

    const textarea = event.currentTarget;
    const limited = clampValue(textarea.value);

    if (limited !== textarea.value) {
      textarea.value = limited;
    }

    setValue(limited);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled || readOnly) {
      return;
    }

    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 'b') {
      event.preventDefault();
      applyWrap('**', '**');
    } else if (key === 'i') {
      event.preventDefault();
      applyWrap('*', '*');
    } else if (key === 'k') {
      event.preventDefault();
      applyLink();
    }
  };

  const syncScrollPosition = (source: HTMLElement | null, target: HTMLElement | null) => {
    if (!syncScroll || !source || !target) {
      return;
    }

    const sourceMax = source.scrollHeight - source.clientHeight;
    const targetMax = target.scrollHeight - target.clientHeight;

    if (sourceMax <= 0 || targetMax <= 0) {
      return;
    }

    target.scrollTop = (source.scrollTop / sourceMax) * targetMax;
  };

  const showEditor = mode !== 'preview';
  const showPreview = mode !== 'edit';
  const formattingDisabled = disabled || readOnly || mode === 'preview';

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      aria-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-preview-mode={mode}
    >
      {toolbar && (
        <div className={cx(classes.toolbar)} role="toolbar" aria-label={labels.formatting}>
          <div className={cx(classes.toolbarGroup)}>
            {toolbarItems.map((item) => (
              <button
                key={item.action}
                type="button"
                className={cx(classes.toolbarButton)}
                aria-label={labels[item.labelKey]}
                title={labels[item.labelKey]}
                disabled={formattingDisabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => runToolbarAction(item.action)}
              >
                <span
                  className={cx(classes.toolbarGlyph)}
                  data-glyph={typeof item.content === 'string' ? item.content : undefined}
                  aria-hidden="true"
                >
                  {typeof item.content === 'string' ? null : item.content}
                </span>
              </button>
            ))}
          </div>
          <span className={cx(classes.toolbarSpacer)} aria-hidden="true" />
          <SegmentedControl
            data={previewModeData}
            value={mode}
            onChange={handleModeChange}
            disabled={disabled}
            size="small"
            ariaLabel={labels.previewMode}
          />
        </div>
      )}

      <div className={cx(classes.body, mode === 'split' ? classes.split : classes.single)}>
        {showEditor && (
          <div className={cx(classes.editPane)}>
            <textarea
              ref={textareaRef}
              className={cx(classes.editor)}
              value={currentValue}
              placeholder={placeholder}
              maxLength={maxLength}
              readOnly={readOnly}
              disabled={disabled}
              aria-label={ariaLabel}
              aria-describedby={maxLength !== undefined ? counterId : undefined}
              spellCheck={false}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onScroll={() => syncScrollPosition(textareaRef.current, previewRef.current)}
            />
          </div>
        )}

        {showPreview && (
          <div
            ref={previewRef}
            className={cx(classes.preview)}
            onScroll={() => syncScrollPosition(previewRef.current, textareaRef.current)}
          >
            <Markdown value={currentValue} ariaLabel={`${ariaLabel} ${labels.preview}`} />
          </div>
        )}
      </div>

      {maxLength !== undefined && (
        <div className={cx(classes.footer)}>
          <span id={counterId} className={cx(classes.counter)}>
            {currentValue.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
});

_MarkdownEditor.displayName = 'MarkdownEditor';

export { _MarkdownEditor as MarkdownEditor };
