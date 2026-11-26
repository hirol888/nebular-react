import React, { useState } from 'react';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { OverflowList } from './OverflowList';

export default { title: 'OverflowList', component: OverflowList };

const actions = ['Rename', 'Move', 'Share', 'Duplicate', 'Archive'];

export function FileActions() {
  const [action, setAction] = useState('');
  const [width, setWidth] = useState(245);
  return (
    <>
      <label>
        Available width{' '}
        <input
          type="range"
          min={100}
          max={540}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
        />
      </label>
      <div style={{ width, maxWidth: '100%', marginBlock: '1rem' }}>
        <OverflowList
          items={actions}
          getItemKey={(item) => item}
          renderItem={(item) => (
            <Button size="small" onClick={() => setAction(item)}>
              {item}
            </Button>
          )}
        />
      </div>
      {action && <p role="status">Action selected: {action}</p>}
    </>
  );
}

export function Topics() {
  return (
    <div style={{ width: '15rem', maxWidth: '100%' }}>
      <OverflowList
        items={['Acessibilidade', 'TypeScript', 'React', 'Componentes', 'Temas']}
        getItemKey={(item) => item}
        renderItem={(item) => (
          <Badge
            component="span"
            text={item}
            style={{ position: 'static', display: 'inline-block' }}
          />
        )}
        labels={{ more: (count) => `Mostrar mais ${count} tópicos`, overflow: 'Outros tópicos' }}
      />
    </div>
  );
}
