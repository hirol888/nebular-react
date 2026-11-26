import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataGrid, type DataGridColumn } from '@nebular-react/core';

interface Row {
  id: number;
  name: string;
}

const data: Row[] = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' }
];

const columns: DataGridColumn<Row>[] = [
  { key: 'name', title: 'Name' },
  { key: 'id', title: 'ID' }
];

describe('DataGrid density', () => {
  it('applies the compact density class', () => {
    const { container } = render(<DataGrid data={data} columns={columns} density="compact" />);

    expect(container.querySelector('[class*="densityCompact"]')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Data grid' })).toBeInTheDocument();
  });

  it('applies the spacious density class', () => {
    const { container } = render(<DataGrid data={data} columns={columns} density="spacious" />);

    expect(container.querySelector('[class*="densitySpacious"]')).toBeInTheDocument();
  });

  it('keeps the default density without a modifier class', () => {
    const { container } = render(<DataGrid data={data} columns={columns} />);

    expect(container.querySelector('[class*="densityCompact"]')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="densitySpacious"]')).not.toBeInTheDocument();
  });
});
