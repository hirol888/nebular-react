import React, { useState } from 'react';
import { WorkflowDesigner, WorkflowEdge, WorkflowNode } from './WorkflowDesigner';
import { Button } from '../Button';

export default { title: 'WorkflowDesigner', component: WorkflowDesigner };

const initialNodes: WorkflowNode[] = [
  { id: 'draft', label: 'Draft', x: 0, y: 0, color: '#3366ff' },
  { id: 'review', label: 'Review', x: 220, y: 0 },
  { id: 'approve', label: 'Approve', x: 440, y: 0, color: '#00d68f' },
  { id: 'publish', label: 'Publish', x: 660, y: 0 }
];

const initialEdges: WorkflowEdge[] = [
  { id: 'draft-review', from: 'draft', to: 'review', label: 'submit' },
  { id: 'review-approve', from: 'review', to: 'approve' },
  { id: 'approve-publish', from: 'approve', to: 'publish', label: 'go live' }
];

export function Showcase() {
  const [selected, setSelected] = useState<string | null>('review');

  return (
    <WorkflowDesigner
      nodes={initialNodes}
      edges={initialEdges}
      selectedNodeId={selected}
      onSelectNode={setSelected}
      ariaLabel="Publishing workflow"
    />
  );
}

export function Editable() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [edges, setEdges] = useState<WorkflowEdge[]>(initialEdges);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <WorkflowDesigner
        nodes={nodes}
        edges={edges}
        editable
        gridSize={20}
        onNodesChange={setNodes}
        onConnect={(fromId, toId) =>
          setEdges((current) => [
            ...current,
            { id: `${fromId}-${toId}-${current.length}`, from: fromId, to: toId }
          ])
        }
        ariaLabel="Editable workflow"
      />
      <span>{`${nodes.length} nodes, ${edges.length} connections`}</span>
    </div>
  );
}

export function WithSelection() {
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <WorkflowDesigner
        nodes={initialNodes}
        edges={initialEdges}
        selectedNodeId={selected}
        onSelectNode={setSelected}
        zoom={zoom}
        onZoomChange={setZoom}
        showGrid
        ariaLabel="Workflow with controlled selection and zoom"
      />
      <span>
        Selected: {selected ?? 'none'} · Zoom: {Math.round(zoom * 100)}%
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {initialNodes.map((node) => (
          <button key={node.id} type="button" onClick={() => setSelected(node.id)}>
            {`Select ${node.id}`}
          </button>
        ))}
        <button type="button" onClick={() => setSelected(null)}>
          Clear selection
        </button>
      </div>
    </div>
  );
}

export function ValidatedEditor() {
  const [graph, setGraph] = useState({ nodes: initialNodes, edges: initialEdges });

  return (
    <WorkflowDesigner
      {...graph}
      ariaLabel="Editorial approval policy"
      defaultSelectedNodeId="draft"
      editable
      withHistory
      onGraphChange={setGraph}
      validateConnection={({ source, target, edges }) => {
        if (target.id === 'draft') {
          return 'Draft is the first step and cannot be a destination.';
        }
        if (edges.some((edge) => edge.from === source.id && edge.to === target.id)) {
          return 'These steps are already connected.';
        }
        return true;
      }}
      renderNodeProperties={({ node, readOnly, onChange }) => (
        <>
          <p>Selected step: {node.label}</p>
          <Button
            disabled={readOnly}
            onClick={() => onChange({ label: `${node.label} (optional)` })}
          >
            Mark as optional
          </Button>
        </>
      )}
    />
  );
}
