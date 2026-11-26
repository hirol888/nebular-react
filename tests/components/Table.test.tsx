import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Table } from '@nebular-react/core';

function renderTable() {
  return render(
    <Table striped highlightOnHover withBorder withColumnBorders>
      <Table.Caption>Users</Table.Caption>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Email</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Ana</Table.Cell>
          <Table.Cell>ana@example.com</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Bruno</Table.Cell>
          <Table.Cell>bruno@example.com</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}

describe('Table', () => {
  it('renders a semantic table with column headers', () => {
    renderTable();

    expect(screen.getByRole('table', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ana@example.com' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderTable();

    expect(await axe(container)).toHaveNoViolations();
  });
});
