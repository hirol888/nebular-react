import React, { useState } from 'react';
import { Button } from '../Button';
import { Toolbar } from './Toolbar';

export default { title: 'Toolbar', component: Toolbar };

export function Formatting() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  return (
    <>
      <Toolbar aria-label="Formatting">
        <Toolbar.Item>
          <Button aria-pressed={bold} onClick={() => setBold(!bold)}>
            Bold
          </Button>
        </Toolbar.Item>
        <Toolbar.Item>
          <Button aria-pressed={italic} onClick={() => setItalic(!italic)}>
            Italic
          </Button>
        </Toolbar.Item>
        <Toolbar.Separator />
        <Toolbar.Item>
          <Button
            onClick={() => {
              setBold(false);
              setItalic(false);
            }}
          >
            Clear formatting
          </Button>
        </Toolbar.Item>
      </Toolbar>
      <p
        style={{ fontWeight: bold ? 'bold' : undefined, fontStyle: italic ? 'italic' : undefined }}
      >
        Format this paragraph.
      </p>
    </>
  );
}

export function ImageControls() {
  const [zoom, setZoom] = useState(100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Toolbar aria-label="Image controls" orientation="vertical">
        <Toolbar.Item>
          <Button onClick={() => setZoom(zoom + 25)} disabled={zoom >= 200}>
            Zoom in
          </Button>
        </Toolbar.Item>
        <Toolbar.Item>
          <Button onClick={() => setZoom(zoom - 25)} disabled={zoom <= 50}>
            Zoom out
          </Button>
        </Toolbar.Item>
        <Toolbar.Item>
          <Button onClick={() => setZoom(100)}>Reset zoom</Button>
        </Toolbar.Item>
      </Toolbar>
      <output>{zoom}%</output>
    </div>
  );
}
