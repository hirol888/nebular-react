import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { EmptyState } from './EmptyState';

export default { title: 'EmptyState', component: EmptyState };

export function Showcase() {
  return (
    <EmptyState
      icon={<Icon icon="search-outline" pack="nebular-essentials" />}
      title="Nenhum resultado encontrado"
      description="Tente ajustar os filtros ou criar um novo registro."
      action={<Button status="primary">Criar registro</Button>}
    />
  );
}

export function Compact() {
  return (
    <EmptyState compact title="Sem itens" description="Não há itens para exibir nesta lista." />
  );
}
