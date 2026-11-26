import React, { useState } from 'react';
import { SplitPane } from './SplitPane';

export default { title: 'SplitPane', component: SplitPane };

const panelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '10rem',
  backgroundColor: '#f7f9fc',
  color: '#222b45'
};

export function Horizontal() {
  return (
    <div style={{ height: '20rem' }}>
      <SplitPane>
        <div style={panelStyle}>First panel</div>
        <div style={panelStyle}>Second panel</div>
      </SplitPane>
    </div>
  );
}

export function Vertical() {
  return (
    <div style={{ height: '24rem' }}>
      <SplitPane orientation="vertical" defaultSize={35}>
        <div style={panelStyle}>Top panel</div>
        <div style={panelStyle}>Bottom panel</div>
      </SplitPane>
    </div>
  );
}

export function Controlled() {
  const [size, setSize] = useState<number>(50);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '22rem' }}>
      <span style={{ fontFamily: 'monospace' }}>First panel: {size}%</span>
      <div style={{ flex: 1, minHeight: 0 }}>
        <SplitPane size={size} onSizeChange={setSize} minSize={20} maxSize={80}>
          <div style={panelStyle}>Controlled panel</div>
          <div style={panelStyle}>Flexible panel</div>
        </SplitPane>
      </div>
    </div>
  );
}
