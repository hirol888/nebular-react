import React from 'react';
import { DataMappingEditor } from './DataMappingEditor';

export default { title: 'DataMappingEditor', component: DataMappingEditor };

export function ContactPayload() {
  return (
    <DataMappingEditor
      sources={[
        { path: 'profile.fullName', label: 'Full name' },
        { path: 'profile.email', label: 'E-mail' },
        { path: 'consent.newsletter', label: 'Newsletter opt-in' }
      ]}
      destinations={[
        { path: 'contact.name', label: 'Contact name', required: true },
        { path: 'contact.address', label: 'Contact address', required: true },
        { path: 'subscribe', label: 'Subscribe' },
        { path: 'source', label: 'Source system' }
      ]}
      sample={{
        profile: { fullName: 'Ana Silva', email: 'ana@example.test' },
        consent: { newsletter: false }
      }}
      defaultValue={{
        'contact.name': { kind: 'field', path: 'profile.fullName' },
        'contact.address': { kind: 'field', path: 'profile.email' },
        subscribe: { kind: 'field', path: 'consent.newsletter' },
        source: { kind: 'constant', value: 'portal' }
      }}
      style={{ maxWidth: '44rem' }}
    />
  );
}
