import React from 'react';
import { Icon } from '../Icon';
import { Stat } from './Stat';

export default { title: 'Stat', component: Stat };

export function Showcase() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Stat
        label="Active users"
        value="12,430"
        trend={{ value: '+12%', direction: 'up' }}
        hint="vs last month"
        icon={<Icon icon="people-outline" pack="nebular-essentials" aria-hidden="true" />}
      />
      <Stat
        label="Revenue"
        value="$48,900"
        trend={{ value: '+8%', direction: 'up' }}
        hint="vs last month"
        status="success"
        icon={<Icon icon="trending-up-outline" pack="nebular-essentials" aria-hidden="true" />}
      />
      <Stat
        label="Errors"
        value="18"
        trend={{ value: '-4%', direction: 'down' }}
        hint="vs last week"
        status="danger"
        icon={<Icon icon="alert-triangle-outline" pack="nebular-essentials" aria-hidden="true" />}
      />
    </div>
  );
}

export function Trends() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Stat label="Sessions" value="3,204" trend={{ value: '+6%', direction: 'up' }} />
      <Stat label="Bounce rate" value="42%" trend={{ value: '-3%', direction: 'down' }} />
      <Stat label="Churn" value="1.8%" trend={{ value: '0%', direction: 'flat' }} />
      <Stat label="Uptime" value="99.98%" hint="last 30 days" />
    </div>
  );
}

export function Statuses() {
  const statuses = ['primary', 'success', 'info', 'warning', 'danger'] as const;

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {statuses.map((status) => (
        <Stat key={status} label={status} value="1,024" hint="current period" status={status} />
      ))}
    </div>
  );
}
