import React, { useId, useRef } from 'react';
import { TableOfContents } from './TableOfContents';

export default { title: 'TableOfContents', component: TableOfContents };

export function Documentation() {
  const id = useId();
  const items = [
    { id: `${id}-overview`, label: 'Overview' },
    { id: `${id}-connect`, label: 'Connect your account', depth: 1 },
    { id: `${id}-review`, label: 'Review your settings', depth: 1 }
  ];
  return (
    <>
      <TableOfContents items={items} />
      <article>
        {items.map((item) => (
          <section key={item.id} style={{ minHeight: '28rem' }}>
            <h2 id={item.id}>{item.label}</h2>
            <p>Use the table of contents to jump to a section of this guide.</p>
          </section>
        ))}
      </article>
    </>
  );
}

export function ScrollablePolicy() {
  const id = useId();
  const scrollContainer = useRef<HTMLDivElement>(null);
  const items = [
    { id: `${id}-orders`, label: 'Orders' },
    { id: `${id}-returns`, label: 'Returns' },
    { id: `${id}-support`, label: 'Support' }
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(7rem, 1fr) 3fr', gap: '1rem' }}>
      <TableOfContents items={items} scrollContainerRef={scrollContainer} />
      <div
        ref={scrollContainer}
        role="region"
        aria-label="Store policy"
        style={{ height: '18rem', overflow: 'auto' }}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- This standalone scroll region needs to be reachable by keyboard.
        tabIndex={0}
      >
        {items.map((item) => (
          <section key={item.id} style={{ minHeight: '18rem' }}>
            <h2 id={item.id}>{item.label}</h2>
            <p>Read this part of the store policy in the scrollable panel.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
