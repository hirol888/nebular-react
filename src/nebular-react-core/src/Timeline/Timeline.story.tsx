import React from 'react';
import { Icon } from '../Icon';
import { Timeline } from './Timeline';

export default { title: 'Timeline', component: Timeline };

export function Showcase() {
  return (
    <Timeline
      items={[
        { title: 'Created', time: '09:00', description: 'User created the account.' },
        { title: 'Verified', time: '09:15', description: 'E-mail verified successfully.' },
        { title: 'Subscribed', time: '10:02', description: 'Plan upgraded to Pro.' }
      ]}
    />
  );
}

export function CustomBullets() {
  return (
    <Timeline
      items={[
        {
          title: 'Order placed',
          time: '10:20',
          description: 'Payment authorized by the provider.',
          icon: <Icon icon="checkmark-outline" pack="nebular-essentials" aria-hidden="true" />,
          color: '#00d68f'
        },
        {
          title: 'Packing',
          time: '12:05',
          description: 'Items collected from the warehouse.',
          icon: <Icon icon="cube-outline" pack="nebular-essentials" aria-hidden="true" />,
          color: '#3366ff'
        },
        {
          title: 'Delayed',
          time: '16:40',
          description: 'Carrier reported a route delay.',
          icon: <Icon icon="alert-triangle-outline" pack="nebular-essentials" aria-hidden="true" />,
          color: '#ff3d71'
        }
      ]}
    />
  );
}

export function CustomSize() {
  return (
    <Timeline
      bulletSize={36}
      lineWidth={4}
      items={[
        { title: 'Kick-off', time: 'Week 1', description: 'Scope agreed with stakeholders.' },
        { title: 'Prototype', time: 'Week 3', description: 'First interactive prototype ready.' },
        { title: 'Release', time: 'Week 8', description: 'Feature shipped to production.' }
      ]}
    />
  );
}
