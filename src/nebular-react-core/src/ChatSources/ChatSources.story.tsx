import React, { useState } from 'react';
import { Markdown } from '../Markdown';
import { ChatSources } from './ChatSources';

export default { title: 'ChatSources', component: ChatSources };

export function AssistantResponse() {
  return (
    <div style={{ maxWidth: '36rem' }}>
      <Markdown value="The theme defines named colors and other visual defaults for Nebular components." />
      <ChatSources
        items={[
          {
            id: 'provider',
            title: 'Getting started',
            href: 'https://hirol888.github.io/nebular-react/',
            excerpt: 'Set up the theme provider at the root of the React tree.'
          },
          {
            id: 'styles',
            title: 'Theme sources',
            href: 'https://github.com/hirol888/nebular-react/tree/develop/src/nebular-react-styles'
          }
        ]}
      />
    </div>
  );
}

export function SearchReferences() {
  const [active, setActive] = useState('');
  return (
    <section aria-label="Resultado da busca">
      <ChatSources
        defaultExpanded={false}
        label={(count) => `Fontes (${count})`}
        items={[
          {
            id: 'manual',
            title: 'Manual de edição',
            excerpt: 'Capítulo 4, revisão de documentos.'
          },
          { id: 'policy', title: 'Política de revisão' }
        ]}
        onSourceClick={(source) => setActive(source.title)}
      />
      {active && <p role="status">Fonte escolhida: {active}</p>}
    </section>
  );
}
