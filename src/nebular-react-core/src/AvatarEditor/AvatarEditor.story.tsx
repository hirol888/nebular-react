import React, { useState } from 'react';
import { AvatarEditor } from './AvatarEditor';

export default { title: 'AvatarEditor', component: AvatarEditor };

const image = 'https://picsum.photos/seed/nebula-avatar/800/800';

export function Showcase() {
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 280 }}>
      <AvatarEditor
        src={image}
        alt="Nebula avatar"
        ariaLabel="Avatar editor"
        size={200}
        zoom={zoom}
        onZoomChange={setZoom}
      />
      <span style={{ fontSize: '0.75rem' }}>Zoom: {Math.round(zoom * 100)}%</span>
    </div>
  );
}

export function Circle() {
  return (
    <div style={{ maxWidth: 280 }}>
      <AvatarEditor
        src={image}
        alt="Nebula avatar"
        ariaLabel="Circular avatar editor"
        shape="circle"
        size={240}
      />
    </div>
  );
}
