import React, { useState } from 'react';
import { NebularProvider } from '@nebular-react/styles';
import { MarkdownEditor } from './MarkdownEditor';

export default { title: 'MarkdownEditor', component: MarkdownEditor };

const sample = [
  '## Release notes',
  '',
  'This release adds a **Markdown editor** with a *live preview*.',
  '',
  '- Toolbar actions that preserve the selection',
  '- `Ctrl/Cmd + B`, `I` and `K` shortcuts',
  '- Split, edit and preview modes',
  '',
  '> Everything is rendered with the existing safe `Markdown` component.',
  '',
  '```tsx',
  '<MarkdownEditor defaultValue={source} />',
  '```',
  '',
  '[Read the docs](https://example.com/docs)'
].join('\n');

export function Showcase() {
  const [value, setValue] = useState(sample);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <MarkdownEditor
        value={value}
        onChange={setValue}
        maxLength={2000}
        syncScroll
        placeholder="Write Markdown…"
      />
      <small>
        Use the toolbar or the Ctrl/Cmd + B, I and K shortcuts. The preview updates as you type and
        the panes stack on small screens.
      </small>
    </div>
  );
}

export function PreviewOnly() {
  return (
    <MarkdownEditor
      defaultValue={sample}
      previewMode="preview"
      toolbar={false}
      height={280}
      ariaLabel="Release notes"
    />
  );
}

export function ReadOnly() {
  return <MarkdownEditor value={sample} readOnly height={280} ariaLabel="Release notes" />;
}

export function Localized() {
  const [value, setValue] = useState(sample);

  return (
    <NebularProvider locale="pt-BR">
      <MarkdownEditor value={value} onChange={setValue} height={280} ariaLabel="Notas" />
    </NebularProvider>
  );
}
