import React from 'react';
import { Anchor } from './Anchor';

export default { title: 'Anchor', component: Anchor };

const ITEMS = [
  { key: 'intro', label: 'Introdução', href: '#intro' },
  { key: 'install', label: 'Instalação', href: '#install' },
  { key: 'usage', label: 'Uso', href: '#usage' },
  { key: 'usage-props', label: 'Propriedades', href: '#usage-props', depth: 1 },
  { key: 'usage-events', label: 'Eventos', href: '#usage-events', depth: 1 },
  { key: 'api', label: 'API', href: '#api' }
];

export function Showcase() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <div style={{ minWidth: 200 }}>
        <Anchor items={ITEMS} ariaLabel="Seções da página" offset={96} />
      </div>

      <div style={{ flex: 1 }}>
        {ITEMS.map((item) => (
          <section key={item.key} id={item.href.slice(1)} style={{ minHeight: 240 }}>
            <h2>{item.label}</h2>
            <p>
              Conteúdo da seção usada para demonstrar a navegação por âncoras e o acompanhamento do
              item ativo.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function Horizontal() {
  return (
    <div style={{ padding: '0.75rem 0' }}>
      <Anchor items={ITEMS.slice(0, 3)} orientation="horizontal" ariaLabel="Seções horizontais" />
    </div>
  );
}
