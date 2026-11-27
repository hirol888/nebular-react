import React from 'react';
import { Skeleton } from './Skeleton';

export default { title: 'Skeleton', component: Skeleton };

export function Showcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
      <Skeleton height={20} />
      <Skeleton height={20} width="70%" />
      <Skeleton height={120} radius={8} />
      <Skeleton height={48} width={48} circle />
    </div>
  );
}

export function WithChildren() {
  return (
    <Skeleton visible={false}>
      <div>Conteúdo já carregado</div>
    </Skeleton>
  );
}
