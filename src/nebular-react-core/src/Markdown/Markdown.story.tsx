import React from 'react';
import { Markdown } from './Markdown';

const sample = [
  '## Release notes',
  '',
  'This release adds **Mentions**, *Markdown* and `SignaturePad` components.',
  '',
  '- Mentions with keyboard navigation',
  '- Markdown rendered without `dangerouslySetInnerHTML`',
  '',
  '1. Write a failing test',
  '2. Implement the component',
  '',
  '> Small steps keep the suite green.',
  '',
  '```tsx',
  '<Markdown value={source} />',
  '```',
  '',
  '[Read the docs](https://example.com/docs)',
  '',
  '---'
].join('\n');

export default { title: 'Markdown', component: Markdown };

export function Basic() {
  return <Markdown value={sample} ariaLabel="Release notes" />;
}

export function HeadingOffset() {
  const section = ['# Section', '', 'Text under the section.'].join('\n');

  return <Markdown value={section} headingOffset={2} />;
}

export function AllowedProtocols() {
  return (
    <Markdown
      value="[Internal](/docs) and [blocked](ftp://example.com/file)"
      allowedProtocols={['https']}
      ariaLabel="Links"
    />
  );
}
