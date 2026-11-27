import React from 'react';
import { BackTop } from './BackTop';

export default { title: 'BackTop', component: BackTop };

export function Basic() {
  return (
    <div style={{ minHeight: 1200, padding: '1rem' }}>
      <p>Scroll down more than 400px to reveal the back to top button.</p>
      <BackTop />
    </div>
  );
}

export function CustomLabel() {
  return (
    <div style={{ minHeight: 1200, padding: '1rem' }}>
      <p>Scroll down to reveal the labelled button at the bottom start corner.</p>
      <BackTop position="bottom-start" ariaLabel="Voltar ao topo">
        ↑ Top
      </BackTop>
    </div>
  );
}

export function CustomTarget() {
  const targetRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={targetRef}
      style={{
        height: 320,
        overflow: 'auto',
        border: '1px solid #e4e9f2',
        borderRadius: 8,
        padding: '1rem'
      }}
    >
      <p>Scroll inside this container to reveal the button.</p>
      <div style={{ height: 900 }} />
      <BackTop target={() => targetRef.current ?? window} visibilityHeight={100} />
    </div>
  );
}
