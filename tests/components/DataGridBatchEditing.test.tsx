import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataGrid, type DataGridColumn } from '@nebular-react/core';

const rows = [
  { id: 'a', name: 'Ada', code: 'A' },
  { id: 'b', name: 'Bia', code: 'B' }
];

const columns: DataGridColumn<(typeof rows)[number]>[] = [
  { key: 'name', title: 'Name', validateCell: (value) => (value ? null : 'Name is required') },
  { key: 'code', title: 'Code', editable: false }
];

it('keeps staged edits local and feeds the final changes to a single async commit', async () => {
  const user = userEvent.setup();
  const onCellEdit = jest.fn();
  const onCommit = jest
    .fn()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValueOnce(undefined);
  render(
    <DataGrid
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      batchEditing={{ onCommit }}
      onCellEdit={onCellEdit}
    />
  );

  await user.click(screen.getByRole('button', { name: 'Edit Name for row a' }));
  await user.clear(screen.getByRole('textbox', { name: 'Edit Name for row a' }));
  await user.type(screen.getByRole('textbox', { name: 'Edit Name for row a' }), 'Ana{Enter}');
  expect(screen.getByText('Ana')).toBeInTheDocument();
  expect(rows[0].name).toBe('Ada');
  expect(onCellEdit).not.toHaveBeenCalled();
  expect(onCommit).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: 'Apply changes' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not apply changes');
  expect(screen.getByText('Ana')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Apply changes' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Apply changes' })).toBeDisabled());
  expect(onCommit).toHaveBeenLastCalledWith([
    { rowId: 'a', row: rows[0], columnKey: 'name', before: 'Ada', value: 'Ana' }
  ]);
});

it('stages clipboard changes, skips read-only cells and validates or discards the set', async () => {
  const user = userEvent.setup();
  const onCommit = jest.fn();
  const onRangePaste = jest.fn();
  jest.spyOn(navigator.clipboard, 'readText').mockResolvedValue('\tZ\nCris\tY');
  render(
    <DataGrid
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      withRangeSelection
      batchEditing={{ onCommit }}
      onRangePaste={onRangePaste}
    />
  );
  const firstRow = screen.getAllByRole('row')[1];
  fireEvent.mouseDown(within(firstRow).getAllByRole('cell')[0], { button: 0 });
  fireEvent.keyDown(firstRow, { key: 'v', ctrlKey: true });
  expect(await screen.findByText('Cris')).toBeInTheDocument();
  expect(onRangePaste).not.toHaveBeenCalled();
  expect(within(firstRow).getByText('A')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Apply changes' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Name is required');
  expect(onCommit).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.getByText('Ada')).toBeInTheDocument();
  expect(screen.getByText('Bia')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).toBeNull();
});

it('fills cells with the staged source value and applies one change set', async () => {
  const user = userEvent.setup();
  const onCommit = jest.fn();
  const onRangeFill = jest.fn();
  render(
    <DataGrid
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      withRangeSelection
      withFillHandle
      batchEditing={{ onCommit }}
      onRangeFill={onRangeFill}
    />
  );

  await user.click(screen.getByRole('button', { name: 'Edit Name for row a' }));
  const editor = screen.getByRole('textbox', { name: 'Edit Name for row a' });
  await user.clear(editor);
  await user.type(editor, 'Ana{Enter}');
  fireEvent.mouseDown(within(screen.getAllByRole('row')[1]).getAllByRole('cell')[0], {
    button: 0
  });
  screen.getByRole('button', { name: 'Fill handle' }).focus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getAllByText('Ana')).toHaveLength(2);
  expect(onRangeFill).not.toHaveBeenCalled();

  await user.click(screen.getByRole('button', { name: 'Apply changes' }));
  expect(onCommit).toHaveBeenCalledWith([
    { row: rows[0], rowId: 'a', columnKey: 'name', before: 'Ada', value: 'Ana' },
    { row: rows[1], rowId: 'b', columnKey: 'name', before: 'Bia', value: 'Ana' }
  ]);
});
