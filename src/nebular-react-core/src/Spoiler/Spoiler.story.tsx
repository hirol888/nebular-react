import React, { useState } from 'react';
import { Button } from '../Button';
import { Spoiler } from './Spoiler';

export default { title: 'Spoiler', component: Spoiler };

export function Showcase() {
  return (
    <Spoiler maxHeight={48} showLabel="Read more" hideLabel="Read less">
      <p style={{ margin: 0 }}>
        This content is longer than the collapsed height. Expand the spoiler to read the full
        description of the record, including its history, ownership and the latest review notes
        provided by the support team.
      </p>
    </Spoiler>
  );
}

export function Controlled() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button size="small" onClick={() => setExpanded((current) => !current)}>
        {expanded ? 'Collapse from outside' : 'Expand from outside'}
      </Button>
      <Spoiler
        maxHeight={40}
        expanded={expanded}
        onChange={setExpanded}
        showLabel="Show details"
        hideLabel="Hide details"
      >
        <p style={{ margin: 0 }}>
          The expanded state is controlled by the parent component, so any external control can open
          or close this content. The spoiler also reports every change through its onChange
          callback.
        </p>
      </Spoiler>
      <span>Expanded: {expanded ? 'yes' : 'no'}</span>
    </div>
  );
}

export function CustomLabels() {
  return (
    <Spoiler
      maxHeight={56}
      transitionDuration={400}
      showLabel="Mostrar mais"
      hideLabel="Mostrar menos"
    >
      <p style={{ margin: 0 }}>
        Os rótulos do controle podem ser personalizados e a transição de abertura pode usar uma
        duração diferente. Todo o texto permanece acessível pelo botão com aria-expanded e
        aria-controls.
      </p>
    </Spoiler>
  );
}
