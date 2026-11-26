import { useNebularLocale } from '@nebular-react/styles';

/**
 * User-facing strings rendered by `MarkdownEditor`: toolbar actions, preview
 * mode options and their accessible names.
 *
 * Values are resolved from the nearest `NebularProvider` (`markdown.*`
 * catalog) and can be overridden per component through the `labels` prop.
 */
export interface MarkdownEditorLabels {
  bold: string;
  italic: string;
  insertLink: string;
  inlineCode: string;
  codeBlock: string;
  bulletList: string;
  quote: string;
  heading: string;
  /** Preview mode option that shows only the textarea. */
  edit: string;
  /** Preview mode option that shows both panes. */
  split: string;
  /** Preview mode option that shows only the rendered Markdown. */
  preview: string;
  /** Accessible name of the formatting toolbar. */
  formatting: string;
  /** Accessible name of the preview mode switcher. */
  previewMode: string;
}

/** English defaults used when the provider catalog has no entry for a key. */
export const defaultMarkdownEditorLabels: MarkdownEditorLabels = {
  bold: 'Bold',
  italic: 'Italic',
  insertLink: 'Insert link',
  inlineCode: 'Inline code',
  codeBlock: 'Code block',
  bulletList: 'Bullet list',
  quote: 'Quote',
  heading: 'Heading',
  edit: 'Edit',
  split: 'Split',
  preview: 'Preview',
  formatting: 'Markdown formatting',
  previewMode: 'Preview mode'
};

/**
 * Resolves the editor labels for the current locale. Explicit `overrides`
 * always win over the provider catalog, which in turn wins over the English
 * defaults.
 */
export function useMarkdownEditorLabels(
  overrides?: Partial<MarkdownEditorLabels>
): MarkdownEditorLabels {
  const { t } = useNebularLocale();

  return {
    bold: t('markdown.bold', defaultMarkdownEditorLabels.bold),
    italic: t('markdown.italic', defaultMarkdownEditorLabels.italic),
    insertLink: t('markdown.insertLink', defaultMarkdownEditorLabels.insertLink),
    inlineCode: t('markdown.inlineCode', defaultMarkdownEditorLabels.inlineCode),
    codeBlock: t('markdown.codeBlock', defaultMarkdownEditorLabels.codeBlock),
    bulletList: t('markdown.bulletList', defaultMarkdownEditorLabels.bulletList),
    quote: t('markdown.quote', defaultMarkdownEditorLabels.quote),
    heading: t('markdown.heading', defaultMarkdownEditorLabels.heading),
    edit: t('markdown.edit', defaultMarkdownEditorLabels.edit),
    split: t('markdown.split', defaultMarkdownEditorLabels.split),
    preview: t('markdown.preview', defaultMarkdownEditorLabels.preview),
    formatting: t('markdown.formatting', defaultMarkdownEditorLabels.formatting),
    previewMode: t('markdown.previewMode', defaultMarkdownEditorLabels.previewMode),
    ...overrides
  };
}
