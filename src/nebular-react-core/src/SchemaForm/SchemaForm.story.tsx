import React, { useState } from 'react';
import { SchemaForm } from './SchemaForm';
import type { SchemaFormField, SchemaFormValues } from './SchemaForm';

export default { title: 'SchemaForm', component: SchemaForm };

const signupFields: SchemaFormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  {
    name: 'delivery',
    label: 'Delivery',
    type: 'select',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'in-app', label: 'In-app notifications' }
    ],
    required: true
  },
  {
    name: 'email',
    label: 'Email address',
    type: 'text',
    required: true,
    visibleWhen: (values) => values.delivery === 'email',
    validate: (value) =>
      typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? undefined
        : 'Enter an email address such as name@example.com.'
  }
];

const bookingFields: SchemaFormField[] = [
  { name: 'date', label: 'Data da visita', type: 'date', required: true },
  {
    name: 'guests',
    label: 'Visitantes',
    type: 'number',
    required: true,
    validate: (value) =>
      typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 8
        ? undefined
        : 'Informe de 1 a 8 visitantes.'
  },
  {
    name: 'accessibility',
    label: 'Preciso de atendimento acessível',
    type: 'boolean'
  }
];

export function NewsletterSignup() {
  const [saved, setSaved] = useState<SchemaFormValues>();
  return (
    <div style={{ maxWidth: '32rem' }}>
      <SchemaForm fields={signupFields} labels={{ submit: 'Subscribe' }} onSubmit={setSaved} />
      {saved && <p role="status">Subscribed as {saved.name}.</p>}
    </div>
  );
}

export function ReserveAVisit() {
  const [values, setValues] = useState<SchemaFormValues>({ guests: 1 });
  const [saved, setSaved] = useState<SchemaFormValues>();
  return (
    <div style={{ maxWidth: '32rem' }}>
      <SchemaForm
        fields={bookingFields}
        value={values}
        onChange={setValues}
        onSubmit={setSaved}
        labels={{
          submit: 'Reservar visita',
          errorSummary: 'Revise os dados da reserva',
          required: (field) => `Preencha o campo ${field.label}.`
        }}
      />
      {saved && <p role="status">Reserva para {saved.guests} visitante(s).</p>}
    </div>
  );
}
