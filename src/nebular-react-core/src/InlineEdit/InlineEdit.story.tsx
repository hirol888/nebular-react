import React, { useState } from 'react';
import { InlineEdit } from './InlineEdit';

export default { title: 'InlineEdit', component: InlineEdit };

export function DocumentTitle() {
  const [title, setTitle] = useState('Guide to community events');
  return (
    <section aria-label="Document details">
      <InlineEdit
        label="Document title"
        value={title}
        onChange={setTitle}
        validate={(value) => (value.trim() ? null : 'Enter a title.')}
        autoSelect
      />
    </section>
  );
}

export function CardDescription() {
  return (
    <section aria-label="Card details" style={{ maxWidth: '25rem' }}>
      <h3>Card description</h3>
      <InlineEdit
        label="Descrição do cartão"
        defaultValue="Compartilhe a pauta com o grupo antes da reunião."
        multiline
        labels={{
          edit: (label) => `Editar ${label}`,
          save: 'Salvar',
          cancel: 'Cancelar',
          saving: 'Salvando…',
          saveError: 'Falha ao salvar. Tente novamente.'
        }}
      />
    </section>
  );
}
