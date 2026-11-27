import React from 'react';
import { DiffViewer } from './DiffViewer';

export default { title: 'DiffViewer', component: DiffViewer };

const before = `export function greet(name: string) {
  const message = \`Hello \${name}\`;
  return message;
}`;

const after = `export function greet(name: string, punctuation = '!') {
  const message = \`Hello, \${name}\${punctuation}\`;
  console.log(message);
  return message;
}`;

export function Split() {
  return <DiffViewer before={before} after={after} title="greet.ts" />;
}

export function Unified() {
  return (
    <DiffViewer
      before={before}
      after={after}
      mode="unified"
      title="greet.ts"
      maxHeight={220}
      ariaLabel="Unified diff"
    />
  );
}

export function NoChanges() {
  return (
    <DiffViewer
      before={'alpha\nbeta\n  gamma'}
      after={'alpha\nbeta\n  gamma'}
      title="unchanged.txt"
    />
  );
}
