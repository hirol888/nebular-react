import React, { useState } from 'react';
import { SortableList } from './SortableList';

export default { title: 'SortableList', component: SortableList };

const initialTracks = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro'];

export function Showcase() {
  const [tracks, setTracks] = useState(initialTracks);

  return (
    <div style={{ maxWidth: 360 }}>
      <SortableList<string>
        items={tracks}
        keyExtractor={(track) => track}
        onReorder={(next) => setTracks(next)}
        renderItem={(track, index) => (
          <span style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>{track}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>#{index + 1}</span>
          </span>
        )}
      />
    </div>
  );
}

export function CustomLabels() {
  const [tracks, setTracks] = useState(initialTracks);

  return (
    <div style={{ maxWidth: 360 }}>
      <SortableList<string>
        ariaLabel="Playlist"
        handleLabel="Move track"
        items={tracks}
        keyExtractor={(track) => track}
        onReorder={(next) => setTracks(next)}
        renderItem={(track) => <strong>{track}</strong>}
      />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ maxWidth: 360 }}>
      <SortableList<string>
        disabled
        items={initialTracks}
        keyExtractor={(track) => track}
        onReorder={() => undefined}
        renderItem={(track) => <span>{track}</span>}
      />
    </div>
  );
}
