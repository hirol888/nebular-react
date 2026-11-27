import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { Button } from '../Button';
import { SegmentedControl } from '../SegmentedControl';
import { PageHeader } from './PageHeader';

export default { title: 'PageHeader', component: PageHeader };

const breadcrumbItems = [
  { label: 'Início', href: '#' },
  { label: 'Configurações', href: '#' },
  { label: 'Usuários' }
];

export function Showcase() {
  return (
    <PageHeader
      breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
      title="Usuários"
      description="Gerencie os usuários, permissões e acessos da aplicação."
    />
  );
}

export function WithActions() {
  return (
    <PageHeader
      breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
      title="Usuários"
      description="Gerencie os usuários, permissões e acessos da aplicação."
      actions={
        <>
          <Button appearance="outline">Exportar</Button>
          <Button status="primary">Novo usuário</Button>
        </>
      }
    />
  );
}

export function WithTabs() {
  return (
    <PageHeader
      breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
      title="Usuários"
      description="Gerencie os usuários, permissões e acessos da aplicação."
      actions={<Button status="primary">Novo usuário</Button>}
      tabs={
        <SegmentedControl
          data={['Visão geral', 'Permissões', 'Atividade']}
          ariaLabel="Seções do usuário"
        />
      }
      footer={<span>Exibindo 24 usuários</span>}
    />
  );
}
