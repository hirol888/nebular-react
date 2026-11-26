import React, { useState } from 'react';
import { Divider } from '../Divider';
import { Breadcrumbs } from '../Breadcrumbs';
import { Stat } from '../Stat';
import { Timeline } from '../Timeline';
import { Descriptions } from '../Descriptions';
import { ScrollArea } from '../ScrollArea';
import { Spoiler } from '../Spoiler';
import { LoadingOverlay } from '../LoadingOverlay';
import { Button } from '../Button';
import { Icon } from '../Icon';

export default { title: 'Catalog/Display components' };

export function Dividers() {
  return (
    <div>
      <Divider />
      <Divider label="Section" labelPosition="left" />
      <Divider label="Another section" labelPosition="right" />
    </div>
  );
}

export function BreadcrumbsShowcase() {
  return (
    <Breadcrumbs
      items={[{ label: 'Home', href: '#' }, { label: 'Users', href: '#' }, { label: 'Details' }]}
    />
  );
}

export function StatShowcase() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Stat
        label="Active users"
        value="12,430"
        trend={{ value: '+12%', direction: 'up' }}
        hint="vs last month"
        icon={<Icon icon="people-outline" pack="nebular-essentials" />}
      />
      <Stat
        label="Errors"
        value="18"
        trend={{ value: '-4%', direction: 'down' }}
        hint="vs last week"
        status="danger"
        icon={<Icon icon="alert-triangle-outline" pack="nebular-essentials" />}
      />
    </div>
  );
}

export function TimelineShowcase() {
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

export function DescriptionsShowcase() {
  return (
    <Descriptions
      title="Account"
      bordered
      columns={2}
      items={[
        { label: 'Name', value: 'Alice Johnson' },
        { label: 'E-mail', value: 'alice@example.com' },
        { label: 'Role', value: 'Admin' },
        { label: 'Status', value: 'Active' },
        { label: 'Notes', value: 'Long-term customer.', span: 2 }
      ]}
    />
  );
}

export function ScrollAreaShowcase() {
  return (
    <ScrollArea maxHeight={160} offsetScrollbars>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: 20 }, (_, index) => (
          <div key={index}>Row {index + 1}</div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function SpoilerShowcase() {
  return (
    <Spoiler maxHeight={48} showLabel="Read more" hideLabel="Read less">
      <p>
        This content is longer than the collapsed height. Expand to read the full text and review
        the complete description of the record.
      </p>
    </Spoiler>
  );
}

export function LoadingOverlayShowcase() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button size="small" onClick={() => setVisible((current) => !current)}>
        Toggle loading
      </Button>
      <LoadingOverlay visible={visible} message="Loading data…">
        <div style={{ padding: '2rem', border: '1px solid #e4e9f2', borderRadius: 8 }}>
          Content behind the overlay
        </div>
      </LoadingOverlay>
    </div>
  );
}
