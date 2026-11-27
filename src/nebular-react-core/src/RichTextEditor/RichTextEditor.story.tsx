import React, { useState } from 'react';
import { NebularProvider } from '@nebular-react/styles';
import { RichTextEditor } from './RichTextEditor';
import { insertTable } from './tableHelpers';

export default { title: 'RichTextEditor', component: RichTextEditor };

export function Showcase() {
  return (
    <RichTextEditor
      defaultValue="<p>Hello <strong>world</strong>!</p>"
      placeholder="Write a description"
    />
  );
}

export function Controlled() {
  const [html, setHtml] = useState('<p>Initial content</p>');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RichTextEditor value={html} onChange={setHtml} minHeight={160} />
      <pre style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>{html}</pre>
    </div>
  );
}

export function ReadOnly() {
  return <RichTextEditor value="<p>This content is read only.</p>" readOnly toolbar={false} />;
}

export function Tables() {
  const [html, setHtml] = useState(insertTable('<p>Budget overview</p>', { rows: 3, columns: 3 }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RichTextEditor value={html} onChange={setHtml} minHeight={200} />
      <small>
        Use the table actions in the toolbar to insert a table at the caret, add or remove rows and
        columns, and delete the whole table.
      </small>
      <pre style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>{html}</pre>
    </div>
  );
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });

export function ImagesAndLinks() {
  const [html, setHtml] = useState(
    '<p>Select text and use the link action, or insert an image from your device.</p>'
  );
  const [lastLink, setLastLink] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RichTextEditor
        value={html}
        onChange={setHtml}
        onImageUpload={readFileAsDataUrl}
        onLinkClick={(href) => setLastLink(href)}
        minHeight={200}
      />
      <small>
        Images are inserted with an editable alt text and `max-width: 100%`; external links open in
        a new tab with `rel=&quot;noopener noreferrer&quot;`.
      </small>
      {lastLink && <small>Last clicked link: {lastLink}</small>}
    </div>
  );
}

export function PasteSanitization() {
  const [html, setHtml] = useState(
    '<p><strong>Paste rich content here.</strong> Scripts, iframes, event handlers and unsafe URLs are removed.</p>'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RichTextEditor value={html} onChange={setHtml} minHeight={160} />
      <small>
        Paste HTML copied from another page. Basic formatting is preserved; dangerous markup and
        attributes are stripped.
      </small>
      <pre style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>{html}</pre>
    </div>
  );
}

const PEOPLE = [
  { id: 'ana', label: 'Ana Souza', avatar: 'https://i.pravatar.cc/64?img=47' },
  { id: 'bruno', label: 'Bruno Lima', avatar: 'https://i.pravatar.cc/64?img=12' },
  { id: 'carla', label: 'Carla Dias' },
  { id: 'diego', label: 'Diego Alves', avatar: 'https://i.pravatar.cc/64?img=33' }
];

export function Mentions() {
  const [html, setHtml] = useState('<p>Hey </p>');
  const [lastMention, setLastMention] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RichTextEditor
        value={html}
        onChange={setHtml}
        mentions={PEOPLE}
        onMention={(mention) => setLastMention(mention.label)}
        minHeight={160}
      />
      <small>
        Type `@` to open the suggestions. Use ArrowUp/ArrowDown to move, Enter or Tab to insert and
        Escape to close. The inserted chip carries the mention id and is not editable.
      </small>
      {lastMention && <small>Last mention: {lastMention}</small>}
      <pre style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>{html}</pre>
    </div>
  );
}

export function CodeBlocks() {
  const [html, setHtml] = useState(
    '<p>Run <code>yarn test</code> before shipping.</p><pre><code>const answer = 42;</code></pre>'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RichTextEditor value={html} onChange={setHtml} minHeight={200} />
      <small>
        Use the toolbar toggles or Ctrl/Cmd+E (inline code) and Ctrl/Cmd+Shift+E (code block).
        Activating the same action again unwraps the code while preserving the text and caret.
      </small>
      <pre style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>{html}</pre>
    </div>
  );
}

export function FindAndReplace() {
  const [html, setHtml] = useState(
    '<p>Nebular makes it easy to build interfaces. Search for “Nebular” or replace it.</p>'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <RichTextEditor value={html} onChange={setHtml} findable minHeight={160} />
      <small>
        Open “Find and replace” in the toolbar (or press Ctrl/Cmd+F). Next/Previous cycle through
        the matches, the counter shows “x of y”, and changes can be limited to matching case. Escape
        closes the dialog.
      </small>
      <pre style={{ maxHeight: 180, overflow: 'auto', fontSize: 12 }}>{html}</pre>
    </div>
  );
}

export function Localized() {
  const [html, setHtml] = useState('<p>Olá <strong>mundo</strong>!</p>');

  return (
    <NebularProvider locale="pt-BR">
      <RichTextEditor value={html} onChange={setHtml} minHeight={160} />
    </NebularProvider>
  );
}
