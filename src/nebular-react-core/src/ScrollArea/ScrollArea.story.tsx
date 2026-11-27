import React from 'react';
import { ScrollArea } from './ScrollArea';

export default { title: 'ScrollArea', component: ScrollArea };

export function Showcase() {
  return (
    <ScrollArea maxHeight={160} offsetScrollbars aria-label="Scrollable list of rows">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: 20 }, (_, index) => (
          <div key={index}>Row {index + 1}</div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function Horizontal() {
  return (
    <ScrollArea
      maxWidth={320}
      maxHeight={120}
      offsetScrollbars
      scrollbarSize={12}
      aria-label="Scrollable table preview"
    >
      <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content' }}>
        {Array.from({ length: 16 }, (_, index) => (
          <div
            key={index}
            style={{
              minWidth: 80,
              padding: '0.75rem',
              border: '1px solid #e4e9f2',
              borderRadius: 4
            }}
          >
            Cell {index + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function AlwaysVisibleScrollbar() {
  return (
    <ScrollArea maxHeight={140} type="always" offsetScrollbars aria-label="Scrollable changelog">
      <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {Array.from({ length: 12 }, (_, index) => (
          <li key={index}>Release note {index + 1}</li>
        ))}
      </ol>
    </ScrollArea>
  );
}
