import React, { useState } from 'react';
import { VersionHistory } from './VersionHistory';
import type { VersionHistoryRevision } from './VersionHistory';

export default { title: 'VersionHistory', component: VersionHistory };

const documents: VersionHistoryRevision[] = [
  {
    id: '3',
    label: 'Published draft',
    author: 'Avery',
    createdAt: '2025-03-20T14:00:00Z',
    content: 'Opening hours\nMonday–Saturday: 9 am to 6 pm\nSunday: 10 am to 4 pm'
  },
  {
    id: '2',
    label: 'Reviewed draft',
    author: 'Sam',
    createdAt: '2025-03-18T14:00:00Z',
    content: 'Opening hours\nMonday–Saturday: 9 am to 6 pm'
  },
  {
    id: '1',
    label: 'First draft',
    author: 'Sam',
    createdAt: '2025-03-17T14:00:00Z',
    content: 'Opening hours\nMonday–Friday: 9 am to 5 pm'
  }
];

export function DocumentRevisions() {
  const [currentId, setCurrentId] = useState('3');
  return (
    <VersionHistory
      revisions={documents}
      currentId={currentId}
      onRestore={(revision) => setCurrentId(revision.id)}
    />
  );
}

const templates: VersionHistoryRevision[] = [
  { id: '2', label: 'Novo tema', author: 'Ana', createdAt: '2025-03-20', content: '#3366ff' },
  { id: '1', label: 'Tema anterior', author: 'Rafa', createdAt: '2025-03-18', content: '#7649b5' }
];

export function ThemeConfiguration() {
  return (
    <VersionHistory
      revisions={templates}
      locale="pt-BR"
      labels={{
        history: 'Histórico de versões',
        revisions: 'Revisões',
        before: 'Antes',
        after: 'Depois'
      }}
      renderComparison={(before, after) => (
        <dl style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[before, after].map((revision) => (
            <div key={revision.id}>
              <dt>{revision.label}</dt>
              <dd style={{ marginInlineStart: 0 }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '1rem',
                    height: '1rem',
                    marginInlineEnd: '0.5rem',
                    background: revision.content
                  }}
                />
                <code>{revision.content}</code>
              </dd>
            </div>
          ))}
        </dl>
      )}
    />
  );
}
