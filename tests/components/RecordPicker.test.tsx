import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordPicker } from '@nebular-react/core';
import type { RecordPickerPage, RecordPickerRequest } from '@nebular-react/core';

const first = { id: 'a', label: 'Alpha' };
const second = { id: 'b', label: 'Beta' };
const lookup = {
  getRecordId: (record: typeof first) => record.id,
  getRecordLabel: (record: typeof first) => record.label
};

it('keeps the detailed selection across pages and commits it only on apply', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  const searchRecords = jest.fn(async ({ page }: RecordPickerRequest) => ({
    records: page === 1 ? [first] : [second],
    total: 2
  }));

  render(
    <RecordPicker
      {...lookup}
      searchRecords={searchRecords}
      multiple
      pageSize={1}
      searchDelay={0}
      onChange={onChange}
    />
  );

  await user.click(screen.getByRole('button', { name: 'Browse records' }));
  const dialog = within(screen.getByRole('dialog', { name: 'Choose records' }));
  await user.click(await dialog.findByRole('checkbox', { name: 'Select Alpha' }));
  await user.click(dialog.getByRole('button', { name: 'Page 2' }));
  await user.click(await dialog.findByRole('checkbox', { name: 'Select Beta' }));
  expect(onChange).not.toHaveBeenCalled();
  await user.click(dialog.getByRole('button', { name: 'Apply selection' }));

  expect(onChange).toHaveBeenCalledWith([first, second]);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Remove Alpha' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Remove Beta' })).toBeInTheDocument();
});

it('aborts the superseded quick search and ignores its late result', async () => {
  let resolveOld: (page: RecordPickerPage<typeof first>) => void;
  let oldSignal: AbortSignal;
  const searchRecords = jest.fn(({ query, signal }: RecordPickerRequest) => {
    if (query === 'a') {
      oldSignal = signal;
      return new Promise<RecordPickerPage<typeof first>>((resolve) => {
        resolveOld = resolve;
      });
    }
    return Promise.resolve({ records: query === 'b' ? [second] : [], total: 1 });
  });
  const onChange = jest.fn();
  render(
    <RecordPicker {...lookup} searchRecords={searchRecords} searchDelay={0} onChange={onChange} />
  );
  const input = screen.getByRole('combobox', { name: 'Search records' });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'a' } });
  await screen.findByText('Loading records…');
  await waitFor(() =>
    expect(searchRecords).toHaveBeenCalledWith(expect.objectContaining({ query: 'a' }))
  );
  fireEvent.change(input, { target: { value: 'b' } });

  const beta = await screen.findByRole('option', { name: 'Beta' });
  expect(oldSignal!.aborted).toBe(true);
  await act(async () => resolveOld!({ records: [first], total: 1 }));
  expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();
  await userEvent.click(beta);
  expect(onChange).toHaveBeenCalledWith([second]);
});

it('keeps the page controls usable after a later page fails to load', async () => {
  const user = userEvent.setup();
  const searchRecords = jest.fn(async ({ page }: RecordPickerRequest) => {
    if (page === 2) throw new Error('Unavailable');
    return { records: [first], total: 2 };
  });
  render(<RecordPicker {...lookup} searchRecords={searchRecords} pageSize={1} searchDelay={0} />);
  await user.click(screen.getByRole('button', { name: 'Browse records' }));
  const dialog = within(screen.getByRole('dialog', { name: 'Choose records' }));
  await user.click(await dialog.findByRole('button', { name: 'Page 2' }));
  expect(await dialog.findByRole('alert')).toHaveTextContent('Records could not be loaded.');
  await user.click(dialog.getByRole('button', { name: 'Page 1' }));
  expect(await dialog.findByRole('button', { name: 'Select Alpha' })).toBeInTheDocument();
});

it('retries the quick search when the input loses focus to the retry button', async () => {
  const user = userEvent.setup();
  const searchRecords = jest
    .fn()
    .mockRejectedValueOnce(new Error('Unavailable'))
    .mockResolvedValue({ records: [second], total: 1 });
  render(<RecordPicker {...lookup} searchRecords={searchRecords} searchDelay={0} />);
  await user.click(screen.getByRole('combobox', { name: 'Search records' }));
  await user.click(await screen.findByRole('button', { name: 'Retry' }));
  expect(await screen.findByRole('option', { name: 'Beta' })).toBeInTheDocument();
});
