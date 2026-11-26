import React from 'react';
import { FileManager, FileNode } from '../FileManager';
import { FilePreview } from './FilePreview';

export default { title: 'FilePreview', component: FilePreview };

const files: FileNode[] = [
  {
    id: 'photo',
    name: 'Mountain valley.jpg',
    type: 'file',
    url: 'https://picsum.photos/id/1018/960/540'
  },
  { id: 'summary', name: 'Trip notes.txt', type: 'file' }
];

export function InFileManager() {
  return (
    <FileManager
      items={files}
      preview
      defaultSelectedKeys={['photo']}
      renderPreview={(node) => (
        <FilePreview
          file={{
            name: node.name,
            url: node.url,
            text:
              node.id === 'summary' ? 'Trail opens at sunrise.\nBring water and a map.' : undefined
          }}
        />
      )}
    />
  );
}

export function JsonAttachment() {
  return (
    <FilePreview
      file={{
        name: 'preferences.json',
        mimeType: 'application/json',
        text: '{\n  "theme": "cosmic",\n  "notifications": true\n}',
        language: 'json'
      }}
      style={{ maxWidth: '36rem' }}
    />
  );
}

export function PdfAdapter() {
  const pdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
  return (
    <FilePreview
      file={{ name: 'Example research paper.pdf', url: pdfUrl, mimeType: 'application/pdf' }}
      pdf={{
        pageCount: 14,
        renderPage: ({ file, page, zoom }) => (
          <iframe
            key={`${page}:${zoom}`}
            title={`PDF page ${page}`}
            src={`${file.url}#page=${page}&zoom=${Math.round(zoom * 100)}`}
            style={{ display: 'block', width: '100%', height: '30rem', border: 0 }}
          />
        )
      }}
      style={{ maxWidth: '42rem' }}
    />
  );
}

const documentPages = [
  { title: 'Introduction', text: 'The trail follows the ridge above the valley.' },
  { title: 'Map', text: 'Follow the blue trail markers to the summit.' },
  { title: 'Equipment', text: 'Bring a map, water and a spare layer.' }
];

export function PdfNavigation() {
  return (
    <FilePreview
      file={{ name: 'Trail guide.pdf' }}
      style={{ maxWidth: '42rem' }}
      pdf={{
        pageCount: documentPages.length,
        outline: documentPages.map(({ title }, index) => ({ title, page: index + 1 })),
        renderThumbnail: ({ page }) => <span>{documentPages[page - 1].title}</span>,
        renderPage: ({ page, match }) => (
          <article style={{ padding: '1rem' }}>
            <h2>{documentPages[page - 1].title}</h2>
            <p>{match ? <mark>{match.text}</mark> : documentPages[page - 1].text}</p>
          </article>
        ),
        search: ({ query }) =>
          documentPages.flatMap(({ text }, index) =>
            text.toLowerCase().includes(query.toLowerCase()) ? [{ page: index + 1, text }] : []
          )
      }}
    />
  );
}
