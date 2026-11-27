import React from 'react';
import { Table } from './Table';

export default { title: 'Table', component: Table };

export function Showcase() {
  return (
    <Table striped highlightOnHover withBorder withColumnBorders>
      <Table.Caption>Usuários cadastrados</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Nome</Table.HeaderCell>
          <Table.HeaderCell>E-mail</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Ana Silva</Table.Cell>
          <Table.Cell>ana@example.com</Table.Cell>
          <Table.Cell>Ativo</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Bruno Costa</Table.Cell>
          <Table.Cell>bruno@example.com</Table.Cell>
          <Table.Cell>Inativo</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Carla Souza</Table.Cell>
          <Table.Cell>carla@example.com</Table.Cell>
          <Table.Cell>Ativo</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}
