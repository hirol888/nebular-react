import { useNebularLocale } from '@nebular-react/styles';

/**
 * Every user-facing string rendered by `RichTextEditor`, including the toolbar,
 * the insert/link/image/find dialogs and their accessible names.
 *
 * Values are resolved from the nearest `NebularProvider` (`richText.*` catalog,
 * with `common.*` for shared actions) and can be overridden per component
 * through the `labels` prop. `matchStatus` uses the `{current}` and `{total}`
 * placeholders.
 */
export interface RichTextEditorLabels {
  /** Accessible name of the editing surface. */
  editorLabel: string;
  /** Accessible name of the formatting toolbar. */
  formatting: string;
  bold: string;
  italic: string;
  underline: string;
  strikeThrough: string;
  heading1: string;
  heading2: string;
  bulletList: string;
  numberedList: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  undo: string;
  redo: string;
  clearFormatting: string;
  inlineCode: string;
  codeBlock: string;
  /** Toolbar action and dialog title for inserting a link. */
  link: string;
  /** Toolbar action that unwraps the selected link. */
  removeLink: string;
  /** Toolbar action and dialog title for inserting an image. */
  image: string;
  /** Toolbar action and dialog title for inserting a table. */
  table: string;
  /** Toolbar action and dialog title for find and replace. */
  find: string;
  /** Field label of the search input. */
  findLabel: string;
  /** Placeholder of the search input. */
  findPlaceholder: string;
  /** Field label and button that replaces the current match. */
  replace: string;
  /** Placeholder of the replacement input. */
  replacePlaceholder: string;
  caseSensitive: string;
  replaceAll: string;
  /** Primary action of the insert dialogs. */
  insert: string;
  cancel: string;
  close: string;
  previous: string;
  next: string;
  url: string;
  /** Field label for the visible text of a link. */
  linkText: string;
  imageUrl: string;
  altText: string;
  uploadingImage: string;
  /** Accessible name of the hidden image file input. */
  uploadImage: string;
  rows: string;
  columns: string;
  deleteTable: string;
  addRow: string;
  removeRow: string;
  addColumn: string;
  removeColumn: string;
  /** Accessible name of the mention suggestions list. */
  mentions: string;
  /** Accessible name of the dialog backdrop. */
  closeDialog: string;
  /** Find match counter (`{current}` of `{total}`). */
  matchStatus: string;
  tableRangeError: string;
  imageUrlRequired: string;
  imageUrlInvalid: string;
  urlRequired: string;
  urlInvalid: string;
  imageUploadFailed: string;
}

/** English defaults used when the provider catalog has no entry for a key. */
export const defaultRichTextEditorLabels: RichTextEditorLabels = {
  editorLabel: 'Rich text editor',
  formatting: 'Formatting',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikeThrough: 'Strike through',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  bulletList: 'Bullet list',
  numberedList: 'Numbered list',
  alignLeft: 'Align left',
  alignCenter: 'Align center',
  alignRight: 'Align right',
  undo: 'Undo',
  redo: 'Redo',
  clearFormatting: 'Clear formatting',
  inlineCode: 'Inline code',
  codeBlock: 'Code block',
  link: 'Insert link',
  removeLink: 'Remove link',
  image: 'Insert image',
  table: 'Insert table',
  find: 'Find and replace',
  findLabel: 'Find',
  findPlaceholder: 'Find…',
  replace: 'Replace',
  replacePlaceholder: 'Replace with…',
  caseSensitive: 'Match case',
  replaceAll: 'Replace all',
  insert: 'Insert',
  cancel: 'Cancel',
  close: 'Close',
  previous: 'Previous',
  next: 'Next',
  url: 'URL',
  linkText: 'Text',
  imageUrl: 'Image URL',
  altText: 'Alt text',
  uploadingImage: 'Uploading image…',
  uploadImage: 'Upload image',
  rows: 'Rows',
  columns: 'Columns',
  deleteTable: 'Delete table',
  addRow: 'Add row',
  removeRow: 'Remove row',
  addColumn: 'Add column',
  removeColumn: 'Remove column',
  mentions: 'Mentions',
  closeDialog: 'Close dialog',
  matchStatus: '{current} of {total}',
  tableRangeError: 'Rows and columns must be between 1 and 20.',
  imageUrlRequired: 'Enter an image URL.',
  imageUrlInvalid: 'Enter a valid image URL.',
  urlRequired: 'Enter a URL.',
  urlInvalid: 'Enter a valid URL.',
  imageUploadFailed: 'Image upload failed.'
};

/**
 * Resolves the editor labels for the current locale. Explicit `overrides`
 * always win over the provider catalog, which in turn wins over the English
 * defaults.
 */
export function useRichTextEditorLabels(
  overrides?: Partial<RichTextEditorLabels>
): RichTextEditorLabels {
  const { t } = useNebularLocale();

  return {
    editorLabel: t('richText.editorLabel', defaultRichTextEditorLabels.editorLabel),
    formatting: t('richText.formatting', defaultRichTextEditorLabels.formatting),
    bold: t('richText.bold', defaultRichTextEditorLabels.bold),
    italic: t('richText.italic', defaultRichTextEditorLabels.italic),
    underline: t('richText.underline', defaultRichTextEditorLabels.underline),
    strikeThrough: t('richText.strikeThrough', defaultRichTextEditorLabels.strikeThrough),
    heading1: t('richText.heading1', defaultRichTextEditorLabels.heading1),
    heading2: t('richText.heading2', defaultRichTextEditorLabels.heading2),
    bulletList: t('richText.bulletList', defaultRichTextEditorLabels.bulletList),
    numberedList: t('richText.numberedList', defaultRichTextEditorLabels.numberedList),
    alignLeft: t('richText.alignLeft', defaultRichTextEditorLabels.alignLeft),
    alignCenter: t('richText.alignCenter', defaultRichTextEditorLabels.alignCenter),
    alignRight: t('richText.alignRight', defaultRichTextEditorLabels.alignRight),
    undo: t('richText.undo', defaultRichTextEditorLabels.undo),
    redo: t('richText.redo', defaultRichTextEditorLabels.redo),
    clearFormatting: t('richText.clearFormatting', defaultRichTextEditorLabels.clearFormatting),
    inlineCode: t('richText.inlineCode', defaultRichTextEditorLabels.inlineCode),
    codeBlock: t('richText.codeBlock', defaultRichTextEditorLabels.codeBlock),
    link: t('richText.link', defaultRichTextEditorLabels.link),
    removeLink: t('richText.removeLink', defaultRichTextEditorLabels.removeLink),
    image: t('richText.image', defaultRichTextEditorLabels.image),
    table: t('richText.table', defaultRichTextEditorLabels.table),
    find: t('richText.find', defaultRichTextEditorLabels.find),
    findLabel: t('richText.findLabel', defaultRichTextEditorLabels.findLabel),
    findPlaceholder: t('richText.findPlaceholder', defaultRichTextEditorLabels.findPlaceholder),
    replace: t('richText.replace', defaultRichTextEditorLabels.replace),
    replacePlaceholder: t(
      'richText.replacePlaceholder',
      defaultRichTextEditorLabels.replacePlaceholder
    ),
    caseSensitive: t('richText.caseSensitive', defaultRichTextEditorLabels.caseSensitive),
    replaceAll: t('richText.replaceAll', defaultRichTextEditorLabels.replaceAll),
    insert: t('richText.insert', defaultRichTextEditorLabels.insert),
    cancel: t('common.cancel', defaultRichTextEditorLabels.cancel),
    close: t('common.close', defaultRichTextEditorLabels.close),
    previous: t('common.previous', defaultRichTextEditorLabels.previous),
    next: t('common.next', defaultRichTextEditorLabels.next),
    url: t('richText.url', defaultRichTextEditorLabels.url),
    linkText: t('richText.linkText', defaultRichTextEditorLabels.linkText),
    imageUrl: t('richText.imageUrl', defaultRichTextEditorLabels.imageUrl),
    altText: t('richText.altText', defaultRichTextEditorLabels.altText),
    uploadingImage: t('richText.uploadingImage', defaultRichTextEditorLabels.uploadingImage),
    uploadImage: t('richText.uploadImage', defaultRichTextEditorLabels.uploadImage),
    rows: t('richText.rows', defaultRichTextEditorLabels.rows),
    columns: t('richText.columns', defaultRichTextEditorLabels.columns),
    deleteTable: t('richText.deleteTable', defaultRichTextEditorLabels.deleteTable),
    addRow: t('richText.addRow', defaultRichTextEditorLabels.addRow),
    removeRow: t('richText.removeRow', defaultRichTextEditorLabels.removeRow),
    addColumn: t('richText.addColumn', defaultRichTextEditorLabels.addColumn),
    removeColumn: t('richText.removeColumn', defaultRichTextEditorLabels.removeColumn),
    mentions: t('richText.mentions', defaultRichTextEditorLabels.mentions),
    closeDialog: t('richText.closeDialog', defaultRichTextEditorLabels.closeDialog),
    matchStatus: t('richText.matchStatus', defaultRichTextEditorLabels.matchStatus),
    tableRangeError: t('richText.tableRangeError', defaultRichTextEditorLabels.tableRangeError),
    imageUrlRequired: t('richText.imageUrlRequired', defaultRichTextEditorLabels.imageUrlRequired),
    imageUrlInvalid: t('richText.imageUrlInvalid', defaultRichTextEditorLabels.imageUrlInvalid),
    urlRequired: t('richText.urlRequired', defaultRichTextEditorLabels.urlRequired),
    urlInvalid: t('richText.urlInvalid', defaultRichTextEditorLabels.urlInvalid),
    imageUploadFailed: t(
      'richText.imageUploadFailed',
      defaultRichTextEditorLabels.imageUploadFailed
    ),
    ...overrides
  };
}
