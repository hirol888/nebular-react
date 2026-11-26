import React, { useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { DockLayout, DockLayoutLabels, DockLayoutNode, DockLayoutPanel } from './DockLayout';

export default { title: 'DockLayout', component: DockLayout };

const initialLayout: DockLayoutNode = {
  id: 'root',
  type: 'split',
  orientation: 'horizontal',
  size: 60,
  first: {
    id: 'editor',
    type: 'group',
    label: 'Editor',
    panelIds: ['draft', 'tasks']
  },
  second: {
    id: 'right',
    type: 'split',
    orientation: 'vertical',
    size: 55,
    first: {
      id: 'inspector',
      type: 'group',
      label: 'Inspector',
      panelIds: ['details']
    },
    second: {
      id: 'spare',
      type: 'group',
      label: 'Spare',
      panelIds: []
    }
  }
};

const editorPanels: DockLayoutPanel[] = [
  {
    id: 'draft',
    title: 'Draft',
    content: (
      <div style={{ padding: '1rem' }}>
        <Textarea aria-label="Document draft" defaultValue="Write your notes here." fullWidth />
      </div>
    )
  },
  {
    id: 'tasks',
    title: 'Tasks',
    content: (
      <ul>
        <li>Review the draft</li>
        <li>Publish an update</li>
      </ul>
    )
  },
  {
    id: 'details',
    title: 'Details',
    content: (
      <div style={{ padding: '1rem' }}>
        <Input aria-label="Project name" defaultValue="Release notes" fullWidth />
      </div>
    )
  }
];

export function EditorWorkspace() {
  const [layout, setLayout] = useState(initialLayout);
  const [serializedLayout, setSerializedLayout] = useState('');

  return (
    <>
      <div style={{ minHeight: '28rem', height: '70vh', marginBlockEnd: '1rem' }}>
        <DockLayout layout={layout} panels={editorPanels} onLayoutChange={setLayout} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button onClick={() => setSerializedLayout(JSON.stringify(layout))}>Save layout</Button>
        <Button onClick={() => setLayout(initialLayout)} appearance="outline">
          Reset layout
        </Button>
        <Button
          onClick={() => setLayout(JSON.parse(serializedLayout))}
          disabled={!serializedLayout}
          appearance="outline"
        >
          Restore saved layout
        </Button>
      </div>
    </>
  );
}

const ptLabels: Partial<DockLayoutLabels> = {
  region: 'Área de análise',
  resize: 'Redimensionar painéis',
  moveTo: 'Mover para o grupo',
  movePanel: 'Mover painel ativo',
  chooseGroup: 'Escolha um grupo',
  empty: 'Sem painéis neste grupo.'
};

export function AnalysisWorkspace() {
  return (
    <div style={{ height: '22rem' }}>
      <DockLayout
        labels={ptLabels}
        defaultLayout={{
          id: 'analysis',
          type: 'split',
          orientation: 'horizontal',
          first: { id: 'data', type: 'group', label: 'Dados', panelIds: ['rows', 'summary'] },
          second: { id: 'view', type: 'group', label: 'Visualização', panelIds: ['chart'] }
        }}
        panels={[
          {
            id: 'rows',
            title: 'Registros',
            content: <p style={{ margin: '1rem' }}>128 registros.</p>
          },
          {
            id: 'summary',
            title: 'Resumo',
            content: <p style={{ margin: '1rem' }}>96% completos.</p>
          },
          {
            id: 'chart',
            title: 'Tendência',
            content: <p style={{ margin: '1rem' }}>Aumento de 12%.</p>
          }
        ]}
      />
    </div>
  );
}
