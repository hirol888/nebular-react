import React, { useRef, useState } from 'react';
import { MatrixField, MatrixFieldColumn, MatrixFieldRow } from './MatrixField';

export default { title: 'MatrixField', component: MatrixField };

const columns: MatrixFieldColumn[] = [
  {
    id: 'product',
    label: 'Produto',
    type: 'text',
    required: true,
    placeholder: 'Nome do produto'
  },
  { id: 'quantity', label: 'Quantidade', type: 'number', min: 1, step: 1, required: true },
  {
    id: 'unit',
    label: 'Unidade',
    type: 'select',
    options: [
      { label: 'Caixa', value: 'box' },
      { label: 'Pacote', value: 'pack' },
      { label: 'Unidade', value: 'unit' }
    ],
    required: true
  },
  { id: 'active', label: 'Disponível', type: 'checkbox' }
];

export function EditableTable() {
  const nextId = useRef(3);
  const [rows, setRows] = useState<MatrixFieldRow[]>([
    { id: '1', values: { product: 'Papel A4', quantity: 12, unit: 'pack', active: true } },
    { id: '2', values: { product: 'Etiquetas', quantity: 0, unit: 'box', active: true } }
  ]);

  return (
    <MatrixField
      label="Itens do pedido"
      columns={columns}
      value={rows}
      onChange={setRows}
      createRow={() => ({
        id: String(nextId.current++),
        values: { product: '', quantity: null, unit: '', active: true }
      })}
      getCellError={(row, column) =>
        column.id === 'quantity' && row.values.quantity === 0
          ? 'Informe uma quantidade maior que zero.'
          : undefined
      }
      minRows={1}
      maxRows={6}
      labels={{
        rowHeader: 'Item',
        row: (position) => `Item ${position}`,
        actions: 'Ações',
        add: 'Adicionar item',
        remove: 'Remover',
        removeRow: (row) => `Remover ${row}`,
        empty: 'Nenhum item',
        selectPlaceholder: 'Selecione'
      }}
    />
  );
}

export function Narrow() {
  return (
    <div style={{ width: '100%', maxWidth: 390, minWidth: 0 }}>
      <EditableTable />
    </div>
  );
}
