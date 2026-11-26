import React, { useState } from 'react';
import { DashboardGrid, DashboardLayoutItem, DashboardWidget } from './DashboardGrid';

export default { title: 'DashboardGrid', component: DashboardGrid };

const widgets: DashboardWidget[] = [
  {
    id: 'revenue',
    title: 'Revenue',
    columnSpan: 6,
    rowSpan: 2,
    content: <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>$ 48,920</div>
  },
  {
    id: 'users',
    title: 'Active users',
    columnSpan: 3,
    content: <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>12,430</div>
  },
  {
    id: 'churn',
    title: 'Churn',
    columnSpan: 3,
    content: <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>2.1%</div>
  },
  {
    id: 'activity',
    title: 'Activity',
    columnSpan: 12,
    content: <div>Sign-ups and cancellations over the last 30 days.</div>
  }
];

const defaultLayout: DashboardLayoutItem[] = widgets.map((widget) => ({
  id: widget.id,
  columnSpan: widget.columnSpan ?? 1,
  rowSpan: widget.rowSpan ?? 1
}));

export function Showcase() {
  return <DashboardGrid widgets={widgets} />;
}

export function Editable() {
  const [layout, setLayout] = useState<DashboardLayoutItem[]>(defaultLayout);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <DashboardGrid
        widgets={widgets}
        layout={layout}
        editable
        onLayoutChange={setLayout}
        ariaLabel="Analytics board"
      />
      <pre
        style={{
          margin: 0,
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: '#f7f9fc',
          fontSize: '0.75rem'
        }}
      >
        {JSON.stringify(layout, null, 2)}
      </pre>
    </div>
  );
}
