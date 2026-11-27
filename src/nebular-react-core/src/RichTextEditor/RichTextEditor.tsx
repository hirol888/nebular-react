import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useUncontrolled } from '@mantine/hooks';
import {
  DefaultProps,
  Selectors,
  createStyles,
  formatNebularMessage,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { useMergedRef } from '@nebular-react/hooks';
import { RichTextEditorLabels, useRichTextEditorLabels } from './RichTextEditor.labels';
import { findText, replaceText } from './findReplace';
import { sanitizeHtml } from './sanitizeHtml';
import {
  addTableColumn,
  addTableRow,
  insertTable,
  removeTableColumn,
  removeTableRow
} from './tableHelpers';

export type RichTextCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'undo'
  | 'redo'
  | 'removeFormat';

export type RichTextToolbarAction =
  | 'insertTable'
  | 'addTableRow'
  | 'removeTableRow'
  | 'addTableColumn'
  | 'removeTableColumn'
  | 'deleteTable'
  | 'insertImage'
  | 'insertLink'
  | 'removeLink'
  | 'inlineCode'
  | 'codeBlock'
  | 'findReplace';

export interface RichTextMention {
  id: string;
  label: string;
  /** Optional avatar URL displayed in the suggestion list. */
  avatar?: string;
}

export interface RichTextEditorProps
  extends
    DefaultProps<RichTextEditorStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?(html: string): void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  toolbar?: boolean;
  minHeight?: number;
  maxHeight?: number;
  ariaLabel?: string;
  toolbarAriaLabel?: string;
  /** Overrides the toolbar, dialog and accessible labels resolved from the locale catalog. */
  labels?: Partial<RichTextEditorLabels>;
  /**
   * Uploads an image selected from the device. Resolve with a public URL (or a
   * `data:image/...` / `blob:` URL) that will be used as the `<img src>`.
   */
  onImageUpload?(file: File): Promise<string>;
  /** Called when a link inside the editor content is clicked. */
  onLinkClick?(href: string): void;
  /** People that can be mentioned by typing the trigger character. */
  mentions?: RichTextMention[];
  /** Trigger character that opens the mention suggestions. Defaults to `@`. */
  mentionTrigger?: string;
  /** Called with the picked mention after its chip is inserted. */
  onMention?(mention: RichTextMention): void;
  /** Shows the “Find and replace” toolbar action. Defaults to true. */
  findable?: boolean;
}

interface MentionPopupState {
  query: string;
  /** Range covering the trigger and the typed query, replaced by the chip. */
  range: Range;
}

interface FindReplaceState {
  find: string;
  replace: string;
  caseSensitive: boolean;
  activeIndex: number;
  total: number;
}

interface TextMatch {
  node: Text;
  index: number;
  length: number;
}

interface TableDialogState {
  rows: string;
  columns: string;
  error: string | null;
}

interface ImageDialogState {
  loading: boolean;
  url: string;
  alt: string;
  error: string | null;
}

interface LinkDialogState {
  url: string;
  text: string;
  error: string | null;
}

interface ToolbarItem {
  command?: RichTextCommand | 'formatBlock';
  action?: RichTextToolbarAction;
  value?: string;
  labelKey: keyof RichTextEditorLabels;
  content: React.ReactNode;
  separator?: boolean;
}

const useStyles = createStyles(
  (
    _theme,
    {
      disabled,
      readOnly,
      minHeight,
      maxHeight
    }: { disabled: boolean; readOnly: boolean; minHeight: number; maxHeight?: number }
  ) => ({
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      border:
        '1px solid var(--rich-text-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
      borderRadius: 'var(--rich-text-editor-border-radius, 0.375rem)',
      backgroundColor:
        'var(--rich-text-editor-background-color, var(--background-basic-color-1, #ffffff))',
      overflow: 'hidden',
      opacity: disabled ? 0.6 : 1
    },

    toolbar: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.15rem',
      padding: '0.35rem',
      borderBottom:
        '1px solid var(--rich-text-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
      backgroundColor:
        'var(--rich-text-editor-toolbar-background-color, var(--background-basic-color-2, #f7f9fc))'
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
      color: 'var(--rich-text-editor-toolbar-color, var(--text-basic-color, #222b45))',
      font: 'inherit',
      fontSize: '0.75rem',
      fontWeight: 600,
      cursor: 'pointer',

      '&:hover': {
        backgroundColor:
          'var(--rich-text-editor-toolbar-hover-background-color, var(--background-basic-color-3, #edf1f7))'
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

    toolbarGlyph: {
      whiteSpace: 'pre',

      '&::before': {
        content: 'attr(data-glyph)'
      }
    },

    separator: {
      width: 1,
      height: '1.25rem',
      margin: '0 0.2rem',
      backgroundColor: 'var(--rich-text-editor-border-color, var(--border-basic-color-3, #e4e9f2))'
    },

    editor: {
      minHeight,
      maxHeight,
      padding: 'var(--rich-text-editor-padding, 0.75rem)',
      overflowY: maxHeight ? 'auto' : undefined,
      outline: 'none',
      color: 'var(--rich-text-editor-text-color, var(--text-basic-color, #222b45))',
      fontFamily: 'var(--rich-text-editor-font-family, inherit)',
      fontSize: 'var(--rich-text-editor-font-size, 0.875rem)',
      lineHeight: 'var(--rich-text-editor-line-height, 1.6)',
      cursor: readOnly ? 'default' : 'text',

      '&:empty::before': {
        content: 'attr(data-placeholder)',
        color: 'var(--rich-text-editor-placeholder-color, var(--text-hint-color, #8f9bb3))',
        pointerEvents: 'none'
      },

      '&:focus-visible': {
        boxShadow: 'inset 0 0 0 2px var(--color-primary-500, #3366ff)'
      },

      '& p': {
        margin: '0 0 0.5rem'
      },

      '& h1': {
        margin: '0 0 0.5rem',
        fontSize: '1.5rem'
      },

      '& h2': {
        margin: '0 0 0.5rem',
        fontSize: '1.25rem'
      },

      '& ul, & ol': {
        margin: '0 0 0.5rem',
        paddingLeft: '1.5rem'
      },

      '& a': {
        color: 'var(--rich-text-editor-link-color, var(--color-primary-500, #3366ff))',
        textDecoration: 'underline'
      },

      '& code': {
        padding: '0.1rem 0.25rem',
        borderRadius: '0.25rem',
        backgroundColor:
          'var(--rich-text-editor-code-background-color, var(--background-basic-color-3, #edf1f7))',
        fontFamily:
          'var(--rich-text-editor-code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace)',
        fontSize: '0.85em'
      },

      '& pre': {
        margin: '0 0 0.5rem',
        padding: '0.75rem',
        overflowX: 'auto',
        borderRadius: '0.375rem',
        backgroundColor:
          'var(--rich-text-editor-code-block-background-color, var(--background-basic-color-2, #f7f9fc))',
        fontFamily:
          'var(--rich-text-editor-code-font-family, ui-monospace, SFMono-Regular, Menlo, monospace)',
        fontSize: '0.85rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap'
      },

      '& pre code': {
        padding: 0,
        backgroundColor: 'transparent',
        fontSize: 'inherit'
      },

      '& [data-mention-id]': {
        display: 'inline-block',
        padding: '0 0.35rem',
        borderRadius: '999px',
        backgroundColor:
          'var(--rich-text-editor-mention-background-color, var(--color-primary-100, #e5efff))',
        color: 'var(--rich-text-editor-mention-color, var(--color-primary-700, #1a44b8))',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      },

      '& img': {
        maxWidth: '100%',
        height: 'auto'
      },

      '& table': {
        width: '100%',
        margin: '0 0 0.5rem',
        borderCollapse: 'collapse'
      },

      '& th, & td': {
        padding: '0.25rem 0.5rem',
        border:
          '1px solid var(--rich-text-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
        textAlign: 'left',
        verticalAlign: 'top'
      },

      '& th': {
        backgroundColor:
          'var(--rich-text-editor-table-header-background-color, var(--background-basic-color-2, #f7f9fc))'
      }
    },

    fileInput: {
      display: 'none'
    },

    mentionPopup: {
      padding: '0.35rem 0.5rem',
      borderBottom:
        '1px solid var(--rich-text-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
      backgroundColor:
        'var(--rich-text-editor-mention-popup-background-color, var(--background-basic-color-1, #ffffff))'
    },

    mentionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem',
      maxHeight: '12rem',
      margin: 0,
      padding: 0,
      overflowY: 'auto',
      listStyle: 'none'
    },

    mentionOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.3rem 0.45rem',
      borderRadius: '0.25rem',
      color: 'var(--rich-text-editor-text-color, var(--text-basic-color, #222b45))',
      fontSize: '0.8125rem',
      cursor: 'pointer'
    },

    mentionOptionActive: {
      backgroundColor:
        'var(--rich-text-editor-toolbar-hover-background-color, var(--background-basic-color-3, #edf1f7))'
    },

    mentionAvatar: {
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: '50%',
      objectFit: 'cover'
    },

    checkboxField: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      margin: '0 0 0.5rem',
      fontSize: '0.8125rem',
      fontWeight: 600,
      cursor: 'pointer'
    },

    dialogRoot: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    },

    dialogBackdrop: {
      position: 'absolute',
      inset: 0,
      padding: 0,
      border: 0,
      backgroundColor: 'var(--rich-text-editor-dialog-backdrop-color, rgba(0, 0, 0, 0.35))'
    },

    dialog: {
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: 'var(--rich-text-editor-dialog-max-width, 22rem)',
      padding: '1rem',
      borderRadius: 'var(--rich-text-editor-dialog-border-radius, 0.5rem)',
      backgroundColor:
        'var(--rich-text-editor-dialog-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--rich-text-editor-dialog-text-color, var(--text-basic-color, #222b45))',
      boxShadow: 'var(--rich-text-editor-dialog-shadow, 0 12px 40px rgba(0, 0, 0, 0.25))'
    },

    dialogTitle: {
      margin: '0 0 0.75rem',
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.4
    },

    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      marginBottom: '0.75rem'
    },

    label: {
      fontSize: '0.75rem',
      fontWeight: 600
    },

    input: {
      padding: '0.4rem 0.5rem',
      border:
        '1px solid var(--rich-text-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
      borderRadius: '0.25rem',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      fontSize: '0.875rem',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '1px'
      }
    },

    dialogActions: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      marginTop: '0.75rem'
    },

    dialogButton: {
      padding: '0.35rem 0.75rem',
      border:
        '1px solid var(--rich-text-editor-border-color, var(--border-basic-color-3, #e4e9f2))',
      borderRadius: '0.25rem',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      fontSize: '0.75rem',
      fontWeight: 600,
      cursor: 'pointer',

      '&:focus-visible': {
        outline: '2px solid var(--color-primary-500, #3366ff)',
        outlineOffset: '2px'
      },

      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5
      }
    },

    dialogPrimaryButton: {
      borderColor: 'var(--color-primary-500, #3366ff)',
      backgroundColor: 'var(--color-primary-500, #3366ff)',
      color: '#ffffff'
    },

    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      margin: '0 0 0.75rem',
      color: 'var(--text-hint-color, #8f9bb3)',
      fontSize: '0.875rem'
    },

    error: {
      margin: '0.25rem 0 0',
      color: 'var(--rich-text-editor-error-color, #d14343)',
      fontSize: '0.75rem'
    }
  })
);

export type RichTextEditorStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<RichTextEditorProps> = {
  defaultValue: '',
  placeholder: 'Write something…',
  disabled: false,
  readOnly: false,
  toolbar: true,
  minHeight: 120,
  mentionTrigger: '@',
  findable: true
};

const EMPTY_MENTIONS: RichTextMention[] = [];

const CONVERTIBLE_BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BLOCKQUOTE'
]);

const toolbarItems: ToolbarItem[] = [
  { command: 'bold', labelKey: 'bold', content: 'B' },
  { command: 'italic', labelKey: 'italic', content: 'I' },
  { command: 'underline', labelKey: 'underline', content: 'U' },
  { command: 'strikeThrough', labelKey: 'strikeThrough', content: 'S' },
  { command: 'formatBlock', value: '<h1>', labelKey: 'heading1', content: 'H1', separator: true },
  { command: 'formatBlock', value: '<h2>', labelKey: 'heading2', content: 'H2' },
  { command: 'insertUnorderedList', labelKey: 'bulletList', content: '•', separator: true },
  { command: 'insertOrderedList', labelKey: 'numberedList', content: '1.' },
  { command: 'justifyLeft', labelKey: 'alignLeft', content: 'L', separator: true },
  { command: 'justifyCenter', labelKey: 'alignCenter', content: 'C' },
  { command: 'justifyRight', labelKey: 'alignRight', content: 'R' },
  { command: 'undo', labelKey: 'undo', content: '↶', separator: true },
  { command: 'redo', labelKey: 'redo', content: '↷' },
  { command: 'removeFormat', labelKey: 'clearFormatting', content: 'Tx', separator: true },
  { action: 'inlineCode', labelKey: 'inlineCode', content: '</>' },
  { action: 'codeBlock', labelKey: 'codeBlock', content: '{ }' },
  { action: 'findReplace', labelKey: 'find', content: 'Find', separator: true },
  { action: 'insertTable', labelKey: 'table', content: '▦', separator: true },
  { action: 'addTableRow', labelKey: 'addRow', content: 'R+' },
  { action: 'removeTableRow', labelKey: 'removeRow', content: 'R−' },
  { action: 'addTableColumn', labelKey: 'addColumn', content: 'C+' },
  { action: 'removeTableColumn', labelKey: 'removeColumn', content: 'C−' },
  { action: 'deleteTable', labelKey: 'deleteTable', content: '⊟' },
  { action: 'insertImage', labelKey: 'image', content: 'Img', separator: true },
  { action: 'insertLink', labelKey: 'link', content: 'Link', separator: true },
  { action: 'removeLink', labelKey: 'removeLink', content: 'Unlink' }
];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = (value: string): string => escapeHtml(value);

const isExternalUrl = (value: string): boolean => /^(?:https?:)?\/\//i.test(value.trim());

/** Removes whitespace/control characters used to disguise URL schemes. */
const compactUrl = (value: string): string => {
  let result = '';

  for (const character of value) {
    const code = character.charCodeAt(0);

    if (code > 0x20 && code !== 0x7f) {
      result += character;
    }
  }

  return result.toLowerCase();
};

const isSafeLinkUrl = (value: string): boolean =>
  !/^(?:javascript|vbscript|data):/.test(compactUrl(value));

const isSafeImageUrl = (value: string): boolean => {
  const compact = compactUrl(value);

  if (/^(?:javascript|vbscript):/.test(compact)) {
    return false;
  }

  if (/^data:/.test(compact)) {
    return /^data:image\/(?:png|jpe?g|gif|webp|avif|bmp);/.test(compact);
  }

  return true;
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const applyDocumentSelection = (range: Range | null) => {
  if (!range || typeof window === 'undefined' || typeof window.getSelection !== 'function') {
    return;
  }

  const selection = window.getSelection();

  if (!selection) {
    return;
  }

  selection.removeAllRanges();
  selection.addRange(range);
};

const selectTextRange = (node: Text, start: number, end: number) => {
  const documentRef = node.ownerDocument;

  if (!documentRef) {
    return;
  }

  const range = documentRef.createRange();
  const from = Math.max(0, Math.min(start, node.data.length));
  const to = Math.max(from, Math.min(end, node.data.length));

  range.setStart(node, from);
  range.setEnd(node, to);
  applyDocumentSelection(range);
};

const selectNodeContents = (node: Node) => {
  const documentRef = node.ownerDocument;

  if (!documentRef) {
    return;
  }

  const range = documentRef.createRange();
  range.selectNodeContents(node);
  applyDocumentSelection(range);
};

/** Places the caret after `offset` characters of `root`, clamped to its text. */
const placeCaretAtTextOffset = (root: Node, offset: number) => {
  const documentRef = root.ownerDocument;

  if (!documentRef) {
    return;
  }

  const range = documentRef.createRange();
  const walker = documentRef.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(offset, 0);
  let node = walker.nextNode() as Text | null;
  let last: Text | null = null;

  while (node) {
    last = node;

    if (remaining <= node.data.length) {
      range.setStart(node, remaining);
      range.collapse(true);
      applyDocumentSelection(range);
      return;
    }

    remaining -= node.data.length;
    node = walker.nextNode() as Text | null;
  }

  if (last) {
    range.setStart(last, last.data.length);
  } else {
    range.setStart(root, 0);
  }

  range.collapse(true);
  applyDocumentSelection(range);
};

/** Number of text characters between `root`'s start and the given position. */
const getTextOffsetWithin = (root: Node, container: Node, offset: number): number | null => {
  if (!root.contains(container)) {
    return null;
  }

  const documentRef = root.ownerDocument;

  if (!documentRef) {
    return null;
  }

  const range = documentRef.createRange();
  range.setStart(root, 0);
  range.setEnd(container, offset);

  return range.toString().length;
};

const createCodeBlockElement = (text: string): HTMLPreElement => {
  const pre = document.createElement('pre');
  const code = document.createElement('code');

  if (text) {
    code.textContent = text;
  }

  pre.appendChild(code);

  return pre;
};

const createParagraphFromCodeBlock = (text: string): HTMLParagraphElement => {
  const paragraph = document.createElement('p');

  text.split('\n').forEach((line, index) => {
    if (index > 0) {
      paragraph.appendChild(document.createElement('br'));
    }

    if (line) {
      paragraph.appendChild(document.createTextNode(line));
    }
  });

  return paragraph;
};

const collectTextMatches = (root: Node, query: string, caseSensitive: boolean): TextMatch[] => {
  if (!query) {
    return [];
  }

  const documentRef = root.ownerDocument ?? (typeof document === 'undefined' ? null : document);

  if (!documentRef) {
    return [];
  }

  const matches: TextMatch[] = [];
  const walker = documentRef.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;

  while (node) {
    let fromIndex = 0;
    let index = findText(node.data, query, { caseSensitive, fromIndex });

    while (index !== -1) {
      matches.push({ node, index, length: query.length });
      fromIndex = index + Math.max(query.length, 1);
      index = findText(node.data, query, { caseSensitive, fromIndex });
    }

    node = walker.nextNode() as Text | null;
  }

  return matches;
};

const selectTextMatch = (match: TextMatch) => {
  selectTextRange(match.node, match.index, match.index + match.length);
};

const _RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    placeholder,
    disabled,
    readOnly,
    toolbar,
    minHeight,
    maxHeight,
    ariaLabel,
    toolbarAriaLabel,
    labels: labelsProp,
    onImageUpload,
    onLinkClick,
    mentions,
    mentionTrigger,
    onMention,
    findable,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { disabled, readOnly, minHeight, maxHeight },
    { name: 'rich-text-editor', classNames, styles, unstyled }
  );
  const labels = useRichTextEditorLabels(labelsProp);
  const editorLabel = ariaLabel ?? labels.editorLabel;
  const toolbarLabel = toolbarAriaLabel ?? labels.formatting;
  const [html, setHtml] = useUncontrolled<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const linkAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const mergedRef = useMergedRef(ref, editorRef);
  const dialogId = useId();
  const dialogTitleId = `${dialogId}-title`;
  const mentionListId = `${dialogId}-mentions`;
  const [tableDialog, setTableDialog] = useState<TableDialogState | null>(null);
  const [imageDialog, setImageDialog] = useState<ImageDialogState | null>(null);
  const [linkDialog, setLinkDialog] = useState<LinkDialogState | null>(null);
  const [findDialog, setFindDialog] = useState<FindReplaceState | null>(null);
  const [mentionState, setMentionState] = useState<MentionPopupState | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const uploadRequestRef = useRef(0);
  // `useComponentDefaultProps` widens optional callbacks, so keep explicit
  // optional aliases to be able to check whether the consumer provided them.
  const imageUploadHandler = onImageUpload as ((file: File) => Promise<string>) | undefined;
  const linkClickHandler = onLinkClick as ((href: string) => void) | undefined;
  const mentionHandler = onMention as ((mention: RichTextMention) => void) | undefined;
  const mentionList = mentions ?? EMPTY_MENTIONS;
  const triggerCharacter = mentionTrigger || '@';

  const normalizedMentionQuery = mentionState ? mentionState.query.toLowerCase() : '';
  const filteredMentions = mentionState
    ? mentionList.filter((mention) =>
        `${mention.label} ${mention.id}`.toLowerCase().includes(normalizedMentionQuery)
      )
    : [];
  const activeMentionIndex =
    filteredMentions.length === 0
      ? -1
      : Math.min(Math.max(mentionActiveIndex, 0), filteredMentions.length - 1);
  const isMentionOpen = Boolean(mentionState) && filteredMentions.length > 0;

  useEffect(() => {
    const element = editorRef.current;

    if (element && element.innerHTML !== html) {
      element.innerHTML = html;
    }
  }, [html]);

  const emitChange = () => {
    const element = editorRef.current;

    if (element) {
      setHtml(element.innerHTML);
    }
  };

  const getEditorRange = (): Range | null => {
    if (typeof window === 'undefined' || typeof window.getSelection !== 'function') {
      return null;
    }

    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);

    return editor.contains(range.commonAncestorContainer) ? range : null;
  };

  const saveSelection = (): Range | null => {
    const range = getEditorRange();
    savedRangeRef.current = range ? range.cloneRange() : null;

    return savedRangeRef.current;
  };

  const insertMarkup = (markup: string, range: Range | null) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const selection = window.getSelection();
    const target =
      range && editor.contains(range.commonAncestorContainer) ? range : getEditorRange();
    const template = document.createElement('template');
    template.innerHTML = markup;

    if (target) {
      target.deleteContents();
      const lastNode = template.content.lastChild;
      target.insertNode(template.content);

      if (lastNode && selection) {
        const nextRange = document.createRange();
        nextRange.setStartAfter(lastNode);
        nextRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(nextRange);
      }
    } else {
      editor.appendChild(template.content);
    }

    editor.focus();
    emitChange();
  };

  const getNodeElement = (node: Node | null): Element | null =>
    node && node.nodeType === 1 ? (node as Element) : null;

  const getTableFromSelection = (): HTMLTableElement | null => {
    const editor = editorRef.current;

    if (!editor) {
      return null;
    }

    const range = getEditorRange();
    let node: Node | null = range ? range.startContainer : null;

    while (node && node !== editor) {
      const element = getNodeElement(node);

      if (element?.tagName === 'TABLE') {
        return element as HTMLTableElement;
      }

      node = node.parentNode;
    }

    const tables = editor.querySelectorAll('table');

    // Be forgiving when the caret is not inside a table: a single table in the
    // document is an unambiguous target.
    return tables.length === 1 ? (tables[0] as HTMLTableElement) : null;
  };

  const getRowIndexInTable = (table: HTMLTableElement): number | undefined => {
    const range = getEditorRange();
    let node: Node | null = range ? range.startContainer : null;

    while (node && node !== table) {
      const element = getNodeElement(node);

      if (element?.tagName === 'TR') {
        const row = element as HTMLTableRowElement;
        const body = row.parentElement;

        if (!body || body.tagName !== 'TBODY') {
          return undefined;
        }

        return Array.from(body.children)
          .filter((child) => child.tagName === 'TR')
          .indexOf(row);
      }

      node = node.parentNode;
    }

    return undefined;
  };

  const getColumnIndexInTable = (table: HTMLTableElement): number | undefined => {
    const range = getEditorRange();
    let node: Node | null = range ? range.startContainer : null;

    while (node && node !== table) {
      const element = getNodeElement(node);

      if (element?.tagName === 'TH' || element?.tagName === 'TD') {
        const row = element.parentElement;

        if (!row) {
          return undefined;
        }

        return Array.from(row.children)
          .filter((child) => child.tagName === 'TH' || child.tagName === 'TD')
          .indexOf(element);
      }

      node = node.parentNode;
    }

    return undefined;
  };

  const getAnchorFromSelection = (): HTMLAnchorElement | null => {
    const editor = editorRef.current;

    if (!editor) {
      return null;
    }

    const range = getEditorRange();
    let node: Node | null = range ? range.startContainer : null;

    while (node && node !== editor) {
      const element = getNodeElement(node);

      if (element?.tagName === 'A') {
        return element as HTMLAnchorElement;
      }

      node = node.parentNode;
    }

    const anchors = editor.querySelectorAll('a');

    return anchors.length === 1 ? (anchors[0] as HTMLAnchorElement) : null;
  };

  const closeDialog = () => {
    uploadRequestRef.current += 1;
    setTableDialog(null);
    setImageDialog(null);
    setLinkDialog(null);
    setFindDialog(null);
    setMentionState(null);
    linkAnchorRef.current = null;
    savedRangeRef.current = null;
  };

  const openTableDialog = () => {
    if (disabled || readOnly) {
      return;
    }

    saveSelection();
    setImageDialog(null);
    setLinkDialog(null);
    setTableDialog({ rows: '3', columns: '3', error: null });
  };

  const openImageDialog = () => {
    if (disabled || readOnly) {
      return;
    }

    saveSelection();

    if (imageUploadHandler) {
      fileInputRef.current?.click();
      return;
    }

    setTableDialog(null);
    setLinkDialog(null);
    setImageDialog({ loading: false, url: '', alt: '', error: null });
  };

  const openLinkDialog = () => {
    if (disabled || readOnly) {
      return;
    }

    const range = saveSelection();
    const anchor = getAnchorFromSelection();
    linkAnchorRef.current = anchor;
    setTableDialog(null);
    setImageDialog(null);
    setLinkDialog({
      url: anchor?.getAttribute('href') ?? '',
      text: anchor?.textContent ?? range?.toString() ?? '',
      error: null
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!imageUploadHandler) {
      return;
    }

    uploadRequestRef.current += 1;
    const requestId = uploadRequestRef.current;
    const defaultAlt = file.name.replace(/\.[^.]+$/, '');
    setImageDialog({ loading: true, url: '', alt: defaultAlt, error: null });

    try {
      const uploadedUrl = await imageUploadHandler(file);

      if (uploadRequestRef.current !== requestId) {
        return;
      }

      if (typeof uploadedUrl !== 'string' || uploadedUrl.trim() === '') {
        throw new Error('Image upload did not return a URL.');
      }

      setImageDialog({ loading: false, url: uploadedUrl, alt: defaultAlt, error: null });
    } catch (error) {
      if (uploadRequestRef.current !== requestId) {
        return;
      }

      setImageDialog({
        loading: false,
        url: '',
        alt: defaultAlt,
        error: error instanceof Error && error.message ? error.message : labels.imageUploadFailed
      });
    }
  };

  const handleImageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      handleImageUpload(file);
    }
  };

  const submitTableDialog = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tableDialog) {
      return;
    }

    const rows = Number(tableDialog.rows);
    const columns = Number(tableDialog.columns);

    if (
      !Number.isFinite(rows) ||
      !Number.isFinite(columns) ||
      rows < 1 ||
      rows > 20 ||
      columns < 1 ||
      columns > 20
    ) {
      setTableDialog({ ...tableDialog, error: labels.tableRangeError });
      return;
    }

    const range = savedRangeRef.current;
    const markup = insertTable('', { rows, columns });
    closeDialog();
    insertMarkup(markup, range);
  };

  const submitImageDialog = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!imageDialog || imageDialog.loading) {
      return;
    }

    const url = imageDialog.url.trim();

    if (!url) {
      setImageDialog({ ...imageDialog, error: labels.imageUrlRequired });
      return;
    }

    if (!isSafeImageUrl(url)) {
      setImageDialog({ ...imageDialog, error: labels.imageUrlInvalid });
      return;
    }

    const range = savedRangeRef.current;
    const markup = `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(
      imageDialog.alt
    )}" style="max-width: 100%" />`;
    closeDialog();
    insertMarkup(markup, range);
  };

  const submitLinkDialog = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!linkDialog) {
      return;
    }

    const url = linkDialog.url.trim();

    if (!url) {
      setLinkDialog({ ...linkDialog, error: labels.urlRequired });
      return;
    }

    if (!isSafeLinkUrl(url)) {
      setLinkDialog({ ...linkDialog, error: labels.urlInvalid });
      return;
    }

    const text = linkDialog.text.trim() || url;
    const external = isExternalUrl(url);
    const editor = editorRef.current;
    const anchor = linkAnchorRef.current;

    if (anchor && editor?.contains(anchor)) {
      anchor.setAttribute('href', url);

      if (external) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      } else {
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
      }

      anchor.textContent = text;
      closeDialog();
      editor.focus();
      emitChange();
      return;
    }

    const range = savedRangeRef.current;
    const markup = `<a href="${escapeAttribute(url)}"${
      external ? ' target="_blank" rel="noopener noreferrer"' : ''
    }>${escapeHtml(text)}</a>`;
    closeDialog();
    insertMarkup(markup, range);
  };

  const mutateSelectedTable = (transform: (table: HTMLTableElement) => string) => {
    const table = getTableFromSelection();

    if (!table) {
      return;
    }

    const template = document.createElement('template');
    template.innerHTML = transform(table);
    const nextTable = template.content.firstElementChild;

    if (!nextTable || nextTable.tagName !== 'TABLE') {
      return;
    }

    table.replaceWith(nextTable);
    editorRef.current?.focus();
    emitChange();
  };

  const removeSelectedLink = () => {
    const anchor = getAnchorFromSelection();

    if (!anchor) {
      return;
    }

    anchor.replaceWith(...Array.from(anchor.childNodes));
    editorRef.current?.focus();
    emitChange();
  };

  const getClosestElementFromSelection = (tagName: string): HTMLElement | null => {
    const editor = editorRef.current;

    if (!editor) {
      return null;
    }

    const range = getEditorRange();
    let node: Node | null = range ? range.startContainer : null;

    while (node && node !== editor) {
      const element = getNodeElement(node);

      if (element?.tagName === tagName) {
        return element as HTMLElement;
      }

      node = node.parentNode;
    }

    return null;
  };

  const getTopLevelBlockFromSelection = (range: Range): HTMLElement | null => {
    const editor = editorRef.current;

    if (!editor) {
      return null;
    }

    let node: Node = range.startContainer;

    if (node === editor) {
      const child = editor.childNodes[range.startOffset] ?? editor.lastChild;

      if (!child) {
        return null;
      }

      node = child;
    }

    while (node.parentNode && node.parentNode !== editor) {
      node = node.parentNode;
    }

    return node.parentNode === editor && node.nodeType === 1 ? (node as HTMLElement) : null;
  };

  /**
   * Detects `trigger + query` immediately before the caret. Mentions are only
   * opened at the start of a text node or after whitespace, so e-mail addresses
   * never trigger the suggestions.
   */
  const detectMention = (): MentionPopupState | null => {
    if (mentionList.length === 0) {
      return null;
    }

    const range = getEditorRange();

    if (!range || !range.collapsed || range.startContainer.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    const node = range.startContainer as Text;
    const before = node.data.slice(0, range.startOffset);
    const escapedTrigger = escapeRegExp(triggerCharacter);
    const pattern = new RegExp(`(?:^|\\s)${escapedTrigger}([^\\s${escapedTrigger}]*)$`);
    const match = pattern.exec(before);

    if (!match) {
      return null;
    }

    const query = match[1] ?? '';
    const start = Math.max(before.length - triggerCharacter.length - query.length, 0);
    const tokenRange = document.createRange();
    tokenRange.setStart(node, start);
    tokenRange.setEnd(node, range.startOffset);

    return { query, range: tokenRange };
  };

  const insertMention = (mention: RichTextMention) => {
    const state = mentionState;

    if (!state) {
      return;
    }

    const text = `${triggerCharacter}${mention.label}`;
    const markup =
      `<span data-mention-id="${escapeAttribute(mention.id)}" ` +
      `data-mention-label="${escapeAttribute(mention.label)}" ` +
      `contenteditable="false" title="${escapeAttribute(text)}">${escapeHtml(text)}</span>`;

    setMentionState(null);
    setMentionActiveIndex(0);
    insertMarkup(markup, state.range);
    mentionHandler?.(mention);
  };

  const handleEditorInput = () => {
    emitChange();

    if (mentionList.length === 0 || disabled || readOnly) {
      if (mentionState) {
        setMentionState(null);
      }

      return;
    }

    setMentionState(detectMention());
    setMentionActiveIndex(0);
  };

  const applyInlineCode = () => {
    if (disabled || readOnly) {
      return;
    }

    const editor = editorRef.current;
    const range = getEditorRange();

    if (!editor || !range) {
      return;
    }

    const existingCode = getClosestElementFromSelection('CODE');

    if (existingCode) {
      // Inline code does not nest inside a code block.
      if (existingCode.closest('pre')) {
        return;
      }

      // Toggle: a second activation removes the inline code and keeps the text.
      const textNode = document.createTextNode(existingCode.textContent ?? '');

      existingCode.replaceWith(textNode);
      editor.focus();
      selectTextRange(textNode, 0, textNode.data.length);
      emitChange();
      return;
    }

    const code = document.createElement('code');

    if (range.collapsed) {
      range.insertNode(code);
      editor.focus();
      placeCaretAtTextOffset(code, 0);
    } else {
      code.appendChild(range.extractContents());
      range.insertNode(code);
      editor.focus();
      selectNodeContents(code);
    }

    emitChange();
  };

  const applyCodeBlock = () => {
    if (disabled || readOnly) {
      return;
    }

    const editor = editorRef.current;
    const range = getEditorRange();

    if (!editor || !range) {
      return;
    }

    const existingPre = getClosestElementFromSelection('PRE');

    // Toggle: convert the code block back into a paragraph.
    if (existingPre) {
      const offset = getTextOffsetWithin(existingPre, range.startContainer, range.startOffset) ?? 0;
      const paragraph = createParagraphFromCodeBlock(existingPre.textContent ?? '');

      existingPre.replaceWith(paragraph);
      editor.focus();
      placeCaretAtTextOffset(paragraph, offset);
      emitChange();
      return;
    }

    if (!range.collapsed) {
      const pre = createCodeBlockElement(range.toString());
      const code = pre.firstElementChild ?? pre;

      range.deleteContents();
      range.insertNode(pre);
      editor.focus();
      placeCaretAtTextOffset(code, (pre.textContent ?? '').length);
      emitChange();
      return;
    }

    const block = getTopLevelBlockFromSelection(range);

    if (
      block &&
      block.tagName !== 'TABLE' &&
      block.tagName !== 'UL' &&
      block.tagName !== 'OL' &&
      CONVERTIBLE_BLOCK_TAGS.has(block.tagName)
    ) {
      const offset = getTextOffsetWithin(block, range.startContainer, range.startOffset);
      const pre = createCodeBlockElement(block.textContent ?? '');
      const code = pre.firstElementChild ?? pre;

      block.replaceWith(pre);
      editor.focus();
      placeCaretAtTextOffset(code, offset ?? (block.textContent ?? '').length);
      emitChange();
      return;
    }

    const pre = createCodeBlockElement('');
    const code = pre.firstElementChild ?? pre;

    range.insertNode(pre);
    editor.focus();
    placeCaretAtTextOffset(code, 0);
    emitChange();
  };

  const openFindDialog = () => {
    if (disabled || readOnly) {
      return;
    }

    saveSelection();
    setTableDialog(null);
    setImageDialog(null);
    setLinkDialog(null);
    setFindDialog({ find: '', replace: '', caseSensitive: false, activeIndex: -1, total: 0 });
  };

  const updateFindQuery = (find: string, caseSensitive: boolean) => {
    const editor = editorRef.current;
    const matches = editor ? collectTextMatches(editor, find, caseSensitive) : [];
    const total = matches.length;
    const activeIndex = total > 0 ? 0 : -1;

    setFindDialog((current) =>
      current ? { ...current, find, caseSensitive, total, activeIndex } : current
    );

    if (activeIndex >= 0) {
      selectTextMatch(matches[activeIndex]);
    }
  };

  const goToFindMatch = (step: number) => {
    const editor = editorRef.current;

    if (!findDialog || !editor) {
      return;
    }

    const matches = collectTextMatches(editor, findDialog.find, findDialog.caseSensitive);

    if (matches.length === 0) {
      setFindDialog({ ...findDialog, total: 0, activeIndex: -1 });
      return;
    }

    const base = findDialog.activeIndex < 0 ? (step > 0 ? -1 : 0) : findDialog.activeIndex;
    const nextIndex = (((base + step) % matches.length) + matches.length) % matches.length;

    setFindDialog({ ...findDialog, total: matches.length, activeIndex: nextIndex });
    selectTextMatch(matches[nextIndex]);
  };

  const replaceCurrentFindMatch = () => {
    const editor = editorRef.current;

    if (!findDialog || !editor || findDialog.activeIndex < 0) {
      return;
    }

    const matches = collectTextMatches(editor, findDialog.find, findDialog.caseSensitive);
    const match = matches[findDialog.activeIndex];

    if (!match) {
      return;
    }

    const { node } = match;

    node.data = `${node.data.slice(0, match.index)}${findDialog.replace}${node.data.slice(
      match.index + match.length
    )}`;

    const nextMatches = collectTextMatches(editor, findDialog.find, findDialog.caseSensitive);
    const total = nextMatches.length;
    const activeIndex = total === 0 ? -1 : Math.min(findDialog.activeIndex, total - 1);

    setFindDialog({ ...findDialog, total, activeIndex });

    if (activeIndex >= 0) {
      selectTextMatch(nextMatches[activeIndex]);
    }

    emitChange();
  };

  const replaceAllFindMatches = () => {
    const editor = editorRef.current;

    if (!findDialog || !editor || !findDialog.find) {
      return;
    }

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    let changed = false;

    while (node) {
      const nextData = replaceText(node.data, findDialog.find, findDialog.replace, {
        caseSensitive: findDialog.caseSensitive,
        all: true
      });

      if (nextData !== node.data) {
        node.data = nextData;
        changed = true;
      }

      node = walker.nextNode() as Text | null;
    }

    if (!changed) {
      return;
    }

    const matches = collectTextMatches(editor, findDialog.find, findDialog.caseSensitive);
    const total = matches.length;
    const activeIndex = total > 0 ? 0 : -1;

    setFindDialog({ ...findDialog, total, activeIndex });

    if (activeIndex >= 0) {
      selectTextMatch(matches[0]);
    }

    emitChange();
  };

  const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) {
      return;
    }

    if (isMentionOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setMentionActiveIndex((activeMentionIndex + 1) % filteredMentions.length);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setMentionActiveIndex(
          (activeMentionIndex - 1 + filteredMentions.length) % filteredMentions.length
        );
        return;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const mention = filteredMentions[activeMentionIndex];

        if (mention) {
          insertMention(mention);
        }

        return;
      }
    }

    if (mentionState && event.key === 'Escape') {
      event.preventDefault();
      setMentionState(null);
      return;
    }

    if (mentionState && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      setMentionState(null);
    }

    const modifier = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (modifier && event.shiftKey && key === 'e') {
      event.preventDefault();
      applyCodeBlock();
    } else if (modifier && !event.shiftKey && key === 'e') {
      event.preventDefault();
      applyInlineCode();
    } else if (modifier && !event.shiftKey && key === 'b') {
      event.preventDefault();
      runCommand('bold');
    } else if (modifier && !event.shiftKey && key === 'i') {
      event.preventDefault();
      runCommand('italic');
    } else if (modifier && !event.shiftKey && key === 'u') {
      event.preventDefault();
      runCommand('underline');
    } else if (modifier && !event.shiftKey && key === 'k') {
      event.preventDefault();
      openLinkDialog();
    } else if (modifier && !event.shiftKey && key === 'f') {
      event.preventDefault();
      openFindDialog();
    } else if (modifier && (event.shiftKey || event.altKey) && key === 't') {
      event.preventDefault();
      openTableDialog();
    }
  };

  const runToolbarAction = (action: RichTextToolbarAction) => {
    if (disabled || readOnly) {
      return;
    }

    switch (action) {
      case 'insertTable':
        openTableDialog();
        break;

      case 'addTableRow':
        mutateSelectedTable((table) => {
          const rowIndex = getRowIndexInTable(table);

          return addTableRow(
            table.outerHTML,
            rowIndex === undefined ? {} : { rowIndex: rowIndex + 1 }
          );
        });
        break;

      case 'removeTableRow':
        mutateSelectedTable((table) => {
          const rowIndex = getRowIndexInTable(table);

          return removeTableRow(table.outerHTML, rowIndex === undefined ? {} : { rowIndex });
        });
        break;

      case 'addTableColumn':
        mutateSelectedTable((table) => {
          const columnIndex = getColumnIndexInTable(table);

          return addTableColumn(
            table.outerHTML,
            columnIndex === undefined ? {} : { columnIndex: columnIndex + 1 }
          );
        });
        break;

      case 'removeTableColumn':
        mutateSelectedTable((table) => {
          const columnIndex = getColumnIndexInTable(table);

          return removeTableColumn(
            table.outerHTML,
            columnIndex === undefined ? {} : { columnIndex }
          );
        });
        break;

      case 'deleteTable': {
        const table = getTableFromSelection();

        if (!table) {
          break;
        }

        table.remove();
        editorRef.current?.focus();
        emitChange();
        break;
      }

      case 'insertImage':
        openImageDialog();
        break;

      case 'insertLink':
        openLinkDialog();
        break;

      case 'removeLink':
        removeSelectedLink();
        break;

      case 'inlineCode':
        applyInlineCode();
        break;

      case 'codeBlock':
        applyCodeBlock();
        break;

      case 'findReplace':
        openFindDialog();
        break;

      default:
        break;
    }
  };

  const runCommand = (command: RichTextCommand | 'formatBlock', commandValue?: string) => {
    if (disabled || readOnly) {
      return;
    }

    editorRef.current?.focus();

    if (typeof document === 'undefined' || typeof document.execCommand !== 'function') {
      return;
    }

    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) {
      return;
    }

    const clipboard = event.clipboardData;
    const pastedHtml = clipboard?.getData('text/html') ?? '';
    const plainText = clipboard?.getData('text/plain') ?? '';

    if (!pastedHtml) {
      if (plainText) {
        event.preventDefault();
        insertMarkup(escapeHtml(plainText).replace(/\r?\n/g, '<br />'), getEditorRange());
      }
      return;
    }

    event.preventDefault();

    const cleanHtml = sanitizeHtml(pastedHtml);
    const range = getEditorRange();

    if (cleanHtml.trim()) {
      insertMarkup(cleanHtml, range);
      return;
    }

    if (plainText) {
      insertMarkup(escapeHtml(plainText).replace(/\r?\n/g, '<br />'), range);
    }
  };

  const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!linkClickHandler) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const anchor = target?.closest?.('a');

    if (!anchor || !editorRef.current?.contains(anchor)) {
      return;
    }

    event.preventDefault();
    linkClickHandler(anchor.getAttribute('href') ?? '');
  };

  const dialogTitle = tableDialog
    ? labels.table
    : imageDialog
      ? labels.image
      : linkDialog
        ? labels.link
        : findDialog
          ? labels.find
          : '';
  const hasDialog = Boolean(tableDialog || imageDialog || linkDialog || findDialog);

  return (
    <div
      {...others}
      className={cx(classes.root, className)}
      aria-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
    >
      {toolbar && (
        <div className={cx(classes.toolbar)} role="toolbar" aria-label={toolbarLabel}>
          {toolbarItems
            .filter((action) => action.action !== 'findReplace' || findable)
            .map((action) => (
              <React.Fragment key={action.labelKey}>
                {action.separator && <span className={cx(classes.separator)} aria-hidden="true" />}
                <button
                  type="button"
                  className={cx(classes.toolbarButton)}
                  aria-label={labels[action.labelKey]}
                  title={labels[action.labelKey]}
                  disabled={disabled || readOnly}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    if (action.action) {
                      runToolbarAction(action.action);
                    } else if (action.command) {
                      runCommand(action.command, action.value);
                    }
                  }}
                >
                  <span
                    className={cx(classes.toolbarGlyph)}
                    data-glyph={typeof action.content === 'string' ? action.content : undefined}
                    aria-hidden="true"
                  >
                    {typeof action.content === 'string' ? null : action.content}
                  </span>
                </button>
              </React.Fragment>
            ))}
        </div>
      )}
      {isMentionOpen && (
        <div className={cx(classes.mentionPopup)}>
          <ul
            id={mentionListId}
            className={cx(classes.mentionList)}
            role="listbox"
            aria-label={labels.mentions}
          >
            {filteredMentions.map((mention, index) => (
              <li
                key={mention.id}
                id={`${mentionListId}-${index}`}
                role="option"
                aria-selected={index === activeMentionIndex}
                className={cx(
                  classes.mentionOption,
                  index === activeMentionIndex && classes.mentionOptionActive
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertMention(mention)}
              >
                {mention.avatar && (
                  <img
                    src={mention.avatar}
                    alt=""
                    aria-hidden="true"
                    className={cx(classes.mentionAvatar)}
                  />
                )}
                <span>
                  {triggerCharacter}
                  {mention.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        ref={mergedRef}
        className={cx(classes.editor)}
        role="textbox"
        aria-multiline="true"
        aria-label={editorLabel}
        aria-placeholder={placeholder}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        aria-autocomplete={mentionList.length > 0 ? 'list' : undefined}
        aria-controls={isMentionOpen ? mentionListId : undefined}
        aria-activedescendant={isMentionOpen ? `${mentionListId}-${activeMentionIndex}` : undefined}
        contentEditable={!disabled && !readOnly}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        tabIndex={disabled ? -1 : 0}
        onInput={handleEditorInput}
        onBlur={() => {
          setMentionState(null);
          emitChange();
        }}
        onClick={handleEditorClick}
        onPaste={handlePaste}
        onKeyDown={handleEditorKeyDown}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={cx(classes.fileInput)}
        aria-label={labels.uploadImage}
        tabIndex={-1}
        disabled={disabled || readOnly}
        onChange={handleImageInputChange}
      />
      {hasDialog && (
        <div className={cx(classes.dialogRoot)}>
          <button
            type="button"
            className={cx(classes.dialogBackdrop)}
            aria-label={labels.closeDialog}
            tabIndex={-1}
            onClick={closeDialog}
          />
          <div
            className={cx(classes.dialog)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                closeDialog();
              }
            }}
          >
            <h2 id={dialogTitleId} className={cx(classes.dialogTitle)}>
              {dialogTitle}
            </h2>

            {tableDialog && (
              <form noValidate onSubmit={submitTableDialog}>
                <div className={cx(classes.field)}>
                  <label className={cx(classes.label)} htmlFor={`${dialogId}-rows`}>
                    {labels.rows}
                  </label>
                  <input
                    id={`${dialogId}-rows`}
                    className={cx(classes.input)}
                    type="number"
                    min={1}
                    max={20}
                    value={tableDialog.rows}
                    autoFocus
                    onChange={(event) =>
                      setTableDialog({ ...tableDialog, rows: event.target.value, error: null })
                    }
                  />
                </div>
                <div className={cx(classes.field)}>
                  <label className={cx(classes.label)} htmlFor={`${dialogId}-columns`}>
                    {labels.columns}
                  </label>
                  <input
                    id={`${dialogId}-columns`}
                    className={cx(classes.input)}
                    type="number"
                    min={1}
                    max={20}
                    value={tableDialog.columns}
                    onChange={(event) =>
                      setTableDialog({ ...tableDialog, columns: event.target.value, error: null })
                    }
                  />
                </div>
                {tableDialog.error && (
                  <p className={cx(classes.error)} role="alert">
                    {tableDialog.error}
                  </p>
                )}
                <div className={cx(classes.dialogActions)}>
                  <button type="button" className={cx(classes.dialogButton)} onClick={closeDialog}>
                    {labels.cancel}
                  </button>
                  <button
                    type="submit"
                    className={cx(classes.dialogButton, classes.dialogPrimaryButton)}
                  >
                    {labels.insert}
                  </button>
                </div>
              </form>
            )}

            {imageDialog && (
              <form noValidate onSubmit={submitImageDialog}>
                {imageDialog.loading ? (
                  <p className={cx(classes.status)} role="status">
                    {labels.uploadingImage}
                  </p>
                ) : (
                  <>
                    <div className={cx(classes.field)}>
                      <label className={cx(classes.label)} htmlFor={`${dialogId}-image-url`}>
                        {labels.imageUrl}
                      </label>
                      <input
                        id={`${dialogId}-image-url`}
                        className={cx(classes.input)}
                        type="text"
                        value={imageDialog.url}
                        autoFocus
                        onChange={(event) =>
                          setImageDialog({
                            ...imageDialog,
                            url: event.target.value,
                            error: null
                          })
                        }
                      />
                    </div>
                    <div className={cx(classes.field)}>
                      <label className={cx(classes.label)} htmlFor={`${dialogId}-image-alt`}>
                        {labels.altText}
                      </label>
                      <input
                        id={`${dialogId}-image-alt`}
                        className={cx(classes.input)}
                        type="text"
                        value={imageDialog.alt}
                        onChange={(event) =>
                          setImageDialog({
                            ...imageDialog,
                            alt: event.target.value,
                            error: null
                          })
                        }
                      />
                    </div>
                  </>
                )}
                {imageDialog.error && (
                  <p className={cx(classes.error)} role="alert">
                    {imageDialog.error}
                  </p>
                )}
                <div className={cx(classes.dialogActions)}>
                  <button type="button" className={cx(classes.dialogButton)} onClick={closeDialog}>
                    {labels.cancel}
                  </button>
                  <button
                    type="submit"
                    className={cx(classes.dialogButton, classes.dialogPrimaryButton)}
                    disabled={imageDialog.loading}
                  >
                    {labels.insert}
                  </button>
                </div>
              </form>
            )}

            {linkDialog && (
              <form noValidate onSubmit={submitLinkDialog}>
                <div className={cx(classes.field)}>
                  <label className={cx(classes.label)} htmlFor={`${dialogId}-link-url`}>
                    {labels.url}
                  </label>
                  <input
                    id={`${dialogId}-link-url`}
                    className={cx(classes.input)}
                    type="text"
                    value={linkDialog.url}
                    autoFocus
                    onChange={(event) =>
                      setLinkDialog({ ...linkDialog, url: event.target.value, error: null })
                    }
                  />
                </div>
                <div className={cx(classes.field)}>
                  <label className={cx(classes.label)} htmlFor={`${dialogId}-link-text`}>
                    {labels.linkText}
                  </label>
                  <input
                    id={`${dialogId}-link-text`}
                    className={cx(classes.input)}
                    type="text"
                    value={linkDialog.text}
                    onChange={(event) =>
                      setLinkDialog({ ...linkDialog, text: event.target.value, error: null })
                    }
                  />
                </div>
                {linkDialog.error && (
                  <p className={cx(classes.error)} role="alert">
                    {linkDialog.error}
                  </p>
                )}
                <div className={cx(classes.dialogActions)}>
                  <button type="button" className={cx(classes.dialogButton)} onClick={closeDialog}>
                    {labels.cancel}
                  </button>
                  <button
                    type="submit"
                    className={cx(classes.dialogButton, classes.dialogPrimaryButton)}
                  >
                    {labels.insert}
                  </button>
                </div>
              </form>
            )}

            {findDialog && (
              <div>
                <div className={cx(classes.field)}>
                  <label className={cx(classes.label)} htmlFor={`${dialogId}-find`}>
                    {labels.findLabel}
                  </label>
                  <input
                    id={`${dialogId}-find`}
                    className={cx(classes.input)}
                    type="text"
                    placeholder={labels.findPlaceholder}
                    value={findDialog.find}
                    autoFocus
                    onChange={(event) =>
                      updateFindQuery(event.target.value, findDialog.caseSensitive)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        goToFindMatch(event.shiftKey ? -1 : 1);
                      }
                    }}
                  />
                </div>
                <div className={cx(classes.field)}>
                  <label className={cx(classes.label)} htmlFor={`${dialogId}-replace`}>
                    {labels.replace}
                  </label>
                  <input
                    id={`${dialogId}-replace`}
                    className={cx(classes.input)}
                    type="text"
                    placeholder={labels.replacePlaceholder}
                    value={findDialog.replace}
                    onChange={(event) =>
                      setFindDialog({ ...findDialog, replace: event.target.value })
                    }
                  />
                </div>
                <label className={cx(classes.checkboxField)} htmlFor={`${dialogId}-match-case`}>
                  <input
                    id={`${dialogId}-match-case`}
                    type="checkbox"
                    checked={findDialog.caseSensitive}
                    onChange={(event) => updateFindQuery(findDialog.find, event.target.checked)}
                  />
                  {labels.caseSensitive}
                </label>
                <p className={cx(classes.status)} role="status" aria-live="polite">
                  {formatNebularMessage(labels.matchStatus, {
                    current: findDialog.total === 0 ? 0 : Math.max(findDialog.activeIndex + 1, 0),
                    total: findDialog.total
                  })}
                </p>
                <div className={cx(classes.dialogActions)}>
                  <button
                    type="button"
                    className={cx(classes.dialogButton)}
                    onClick={() => goToFindMatch(-1)}
                  >
                    {labels.previous}
                  </button>
                  <button
                    type="button"
                    className={cx(classes.dialogButton)}
                    onClick={() => goToFindMatch(1)}
                  >
                    {labels.next}
                  </button>
                  <button
                    type="button"
                    className={cx(classes.dialogButton)}
                    onClick={replaceCurrentFindMatch}
                  >
                    {labels.replace}
                  </button>
                  <button
                    type="button"
                    className={cx(classes.dialogButton)}
                    onClick={replaceAllFindMatches}
                  >
                    {labels.replaceAll}
                  </button>
                  <button type="button" className={cx(classes.dialogButton)} onClick={closeDialog}>
                    {labels.close}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

_RichTextEditor.displayName = 'RichTextEditor';

export { _RichTextEditor as RichTextEditor };
