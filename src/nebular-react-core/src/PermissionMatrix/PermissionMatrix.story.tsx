import React, { useState } from 'react';
import {
  PermissionMatrix,
  PermissionMatrixChange,
  PermissionMatrixLabels,
  PermissionMatrixValue
} from './PermissionMatrix';

export default { title: 'PermissionMatrix', component: PermissionMatrix };

const resources = [
  { id: 'orders', label: 'Pedidos' },
  { id: 'invoices', label: 'Faturas' },
  { id: 'reports', label: 'Relatórios', disabled: true }
];
const actions = [
  { id: 'view', label: 'Consultar' },
  { id: 'edit', label: 'Editar' },
  { id: 'approve', label: 'Aprovar' }
];
const initial: PermissionMatrixValue = {
  orders: {
    view: { source: 'inherited', allowed: true },
    edit: { source: 'explicit', allowed: true },
    approve: { source: 'partial' }
  },
  invoices: {
    view: { source: 'explicit', allowed: true },
    edit: { source: 'explicit', allowed: false }
  },
  reports: {
    view: { source: 'inherited', allowed: false }
  }
};
const labels: PermissionMatrixLabels = {
  resource: 'Recurso',
  empty: 'Nenhuma permissão para exibir.',
  notSet: 'Indefinida',
  allowed: 'Permitida',
  denied: 'Negada',
  inheritedAllowed: 'Herdada: permitida',
  inheritedDenied: 'Herdada: negada',
  partial: 'Parcial'
};

function EditableMatrix() {
  const [value, setValue] = useState(initial);
  const applyPermission = ({ resourceId, actionId, allowed }: PermissionMatrixChange) => {
    setValue((current) => ({
      ...current,
      [resourceId]: {
        ...current[resourceId],
        [actionId]: { source: 'explicit', allowed }
      }
    }));
  };

  return (
    <PermissionMatrix
      caption="Permissões da equipe"
      resources={resources}
      actions={actions}
      labels={labels}
      value={value}
      onChange={applyPermission}
    />
  );
}

export function Showcase() {
  return <EditableMatrix />;
}

export function Mobile() {
  return (
    <div style={{ width: '100%', maxWidth: 390 }}>
      <EditableMatrix />
    </div>
  );
}

export function ReadOnly() {
  return (
    <PermissionMatrix
      caption="Permissões da equipe"
      resources={resources}
      actions={actions}
      labels={labels}
      value={initial}
      readOnly
    />
  );
}
