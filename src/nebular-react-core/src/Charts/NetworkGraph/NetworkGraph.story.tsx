import React from 'react';
import { NetworkGraph } from './NetworkGraph';

export default { title: 'Charts/NetworkGraph', component: NetworkGraph };

const nodes = [
  { id: 'api', label: 'API', group: 'backend' },
  { id: 'web', label: 'Web', group: 'frontend' },
  { id: 'worker', label: 'Worker', group: 'backend' },
  { id: 'cache', label: 'Cache', group: 'data' },
  { id: 'db', label: 'Database', group: 'data' }
];

const edges = [
  { source: 'web', target: 'api', label: 'HTTPS' },
  { source: 'api', target: 'worker', weight: 2 },
  { source: 'api', target: 'cache', label: 'read' },
  { source: 'worker', target: 'db' },
  { source: 'cache', target: 'db', label: 'miss' }
];

export function Showcase() {
  return <NetworkGraph nodes={nodes} edges={edges} ariaLabel="Service topology" />;
}

export function ForceLayout() {
  return (
    <NetworkGraph
      nodes={nodes}
      edges={edges}
      layout="force"
      width={520}
      height={360}
      ariaLabel="Forced service topology"
    />
  );
}

export function Interactive() {
  return (
    <NetworkGraph
      nodes={nodes}
      edges={edges}
      ariaLabel="Interactive service topology"
      onNodeClick={() => undefined}
    />
  );
}
