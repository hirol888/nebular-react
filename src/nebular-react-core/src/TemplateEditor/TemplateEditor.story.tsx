import React from 'react';
import { TemplateEditor } from './TemplateEditor';

export default { title: 'TemplateEditor', component: TemplateEditor };

export function Notification() {
  return (
    <TemplateEditor
      defaultValue={'Olá, {{cliente.nome}}!\nO pedido {{pedido.numero}} foi liberado.'}
      variables={[
        { path: 'cliente.nome', label: 'Nome do cliente', sample: 'Ana' },
        { path: 'pedido.numero', label: 'Número do pedido', sample: 1384 },
        { path: 'pedido.entrega', label: 'Status da entrega', sample: 'Aguardando retirada' }
      ]}
      labels={{
        editor: 'Mensagem',
        variable: 'Variável',
        insert: 'Inserir variável',
        preview: 'Prévia',
        unknown: (paths) => `Variáveis desconhecidas: ${paths.join(', ')}`
      }}
      style={{ maxWidth: '42rem' }}
    />
  );
}
