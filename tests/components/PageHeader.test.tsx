import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PageHeader } from '@nebular-react/core';

describe('PageHeader', () => {
  it('renders the title as a level 1 heading and the description', () => {
    render(<PageHeader title="Usuários" description="Gerencie os usuários da aplicação." />);

    expect(screen.getByRole('heading', { level: 1, name: 'Usuários' })).toBeInTheDocument();
    expect(screen.getByText('Gerencie os usuários da aplicação.')).toBeInTheDocument();
  });

  it('renders breadcrumbs, actions, tabs and footer', () => {
    render(
      <PageHeader
        title="Usuários"
        breadcrumbs={<a href="/home">Início</a>}
        actions={<button type="button">Novo usuário</button>}
        tabs={<div>Visão geral</div>}
        footer={<span>Rodapé</span>}
      />
    );

    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('button', { name: 'Novo usuário' })).toBeInTheDocument();
    expect(screen.getByText('Visão geral')).toBeInTheDocument();
    expect(screen.getByText('Rodapé')).toBeInTheDocument();
  });

  it('renders a header element', () => {
    const { container } = render(<PageHeader title="Usuários" />);

    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários da aplicação."
        breadcrumbs={<a href="/home">Início</a>}
        actions={<button type="button">Novo usuário</button>}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
