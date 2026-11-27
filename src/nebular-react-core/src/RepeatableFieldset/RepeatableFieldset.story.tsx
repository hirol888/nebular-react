import React, { useRef, useState } from 'react';
import { Input } from '../Input';
import { FormControl } from '../FormControl';
import { RepeatableFieldset } from './RepeatableFieldset';

export default { title: 'RepeatableFieldset', component: RepeatableFieldset };

export function DeliveryAddresses() {
  const sequence = useRef(2);
  const [items, setItems] = useState([{ id: 1, street: 'Rua Bela Vista', city: 'São Paulo' }]);

  return (
    <RepeatableFieldset
      legend="Endereços de entrega"
      minItems={1}
      maxItems={5}
      items={items}
      getItemKey={(item) => item.id}
      createItem={() => ({ id: sequence.current++, street: '', city: '' })}
      onChange={setItems}
      labels={{
        add: 'Adicionar endereço',
        item: (position) => `Endereço ${position}`,
        remove: (position) => `Remover endereço ${position}`,
        moveUp: (position) => `Subir endereço ${position}`,
        moveDown: (position) => `Descer endereço ${position}`,
        up: 'Subir',
        down: 'Descer',
        removeVisible: 'Remover'
      }}
      renderItem={({ item, inputId, onChange }) => (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <FormControl label="Rua" htmlFor={`${inputId}-street`}>
            <Input
              id={`${inputId}-street`}
              value={item.street}
              onChange={(event) => onChange({ ...item, street: event.target.value })}
            />
          </FormControl>
          <FormControl label="Cidade" htmlFor={`${inputId}-city`}>
            <Input
              id={`${inputId}-city`}
              value={item.city}
              onChange={(event) => onChange({ ...item, city: event.target.value })}
            />
          </FormControl>
        </div>
      )}
    />
  );
}

export function WebhookEndpoints() {
  const sequence = useRef(1);
  const [items, setItems] = useState<{ id: number; url: string }[]>([]);

  return (
    <RepeatableFieldset
      legend="Webhook endpoints"
      description="Add one or more endpoints and use Move up and Move down to adjust their order."
      items={items}
      getItemKey={(item) => item.id}
      createItem={() => ({ id: sequence.current++, url: '' })}
      onChange={setItems}
      renderItem={({ item, inputId, onChange }) => (
        <FormControl label="URL" htmlFor={inputId}>
          <Input
            id={inputId}
            type="url"
            value={item.url}
            onChange={(event) => onChange({ ...item, url: event.target.value })}
          />
        </FormControl>
      )}
    />
  );
}
