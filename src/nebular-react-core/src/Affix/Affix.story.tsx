import React from 'react';
import { Affix } from './Affix';

export default { title: 'Affix', component: Affix };

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  border: '1px solid #e4e9f2',
  borderRadius: 8,
  backgroundColor: '#ffffff'
};

export function Basic() {
  return (
    <div style={{ minHeight: 1200, padding: '1rem' }}>
      <p>Scroll down to pin the toolbar to the top of the viewport.</p>
      <Affix offsetTop={20}>
        <div style={toolbarStyle}>
          <strong>Affixed toolbar</strong>
          <span>Keeps its place in the document flow.</span>
        </div>
      </Affix>
      <div style={{ height: 1000 }} />
    </div>
  );
}

export function OffsetBottom() {
  return (
    <div style={{ minHeight: 1200, padding: '1rem' }}>
      <p>Scroll until the toolbar reaches the bottom offset.</p>
      <Affix offsetBottom={24}>
        <div style={toolbarStyle}>
          <strong>Bottom anchored toolbar</strong>
        </div>
      </Affix>
      <div style={{ height: 1000 }} />
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
      <p>Scroll inside this container to affix the toolbar.</p>
      <Affix target={() => targetRef.current} offsetTop={12}>
        <div style={toolbarStyle}>
          <strong>Container toolbar</strong>
        </div>
      </Affix>
      <div style={{ height: 800 }} />
    </div>
  );
}
