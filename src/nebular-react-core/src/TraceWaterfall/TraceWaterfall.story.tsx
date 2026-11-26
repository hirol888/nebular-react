import React, { useState } from 'react';
import { TraceWaterfall } from './TraceWaterfall';
import type { TraceWaterfallSpan } from './TraceWaterfall';

export default { title: 'TraceWaterfall', component: TraceWaterfall };

const spans: readonly TraceWaterfallSpan[] = [
  {
    id: 'request',
    name: 'GET /orders',
    service: 'gateway',
    startTime: 0,
    duration: 245,
    status: 'ok',
    attributes: { 'http.status_code': 200 }
  },
  {
    id: 'cache',
    parentId: 'request',
    name: 'Look up cached response',
    service: 'cache',
    startTime: 12,
    duration: 33,
    status: 'error',
    attributes: { 'cache.result': 'timeout' }
  },
  {
    id: 'orders',
    parentId: 'request',
    name: 'Fetch order summaries',
    service: 'orders',
    startTime: 47,
    duration: 182,
    status: 'ok'
  },
  {
    id: 'query',
    parentId: 'orders',
    name: 'Find recent orders',
    service: 'database',
    startTime: 59,
    duration: 118,
    attributes: { 'db.operation': 'SELECT', 'db.row_count': 12 }
  }
];

export function RequestTrace() {
  return <TraceWaterfall spans={spans} defaultSelectedId="request" />;
}

export function ControlledSelection() {
  const [selectedId, setSelectedId] = useState<string | null>('cache');

  return (
    <TraceWaterfall
      spans={spans}
      selectedId={selectedId}
      onSelectionChange={setSelectedId}
      defaultExpandedIds={['request']}
      renderDetails={(span) => (
        <>
          <strong>{span.name}</strong>
          <p>Span ID: {span.id}</p>
        </>
      )}
    />
  );
}
