import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { UploadQueue } from '@nebular-react/core';
import type { UploadQueueItem } from '@nebular-react/core';

const items: UploadQueueItem[] = [
  { id: 'active', name: 'relatorio.csv', status: 'uploading', progress: 35.4 },
  { id: 'failed', name: 'contrato.pdf', status: 'error', error: 'Conexão interrompida' },
  { id: 'ready', name: 'foto.png', status: 'success' },
  { id: 'waiting', name: 'backup.zip', status: 'queued' },
  { id: 'stopped', name: 'planilha.xlsx', status: 'cancelled' }
];

describe('UploadQueue', () => {
  it('renders file status, progress and a failure message', () => {
    render(<UploadQueue items={items} />);

    expect(screen.getByRole('list', { name: 'Upload queue' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'relatorio.csv' })).toHaveAttribute(
      'aria-valuenow',
      '35'
    );
    expect(screen.getByText('Conexão interrompida')).toBeVisible();
    expect(screen.getByText('Uploaded')).toBeVisible();
    expect(screen.getByText('Queued')).toBeVisible();
    expect(screen.getByText('Cancelled')).toBeVisible();
  });

  it('reports the id of the file the user cancels or retries by keyboard', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    const onRetry = jest.fn();
    render(<UploadQueue items={items} onCancel={onCancel} onRetry={onRetry} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel: relatorio.csv' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Retry: contrato.pdf' })).toHaveFocus();
    await user.keyboard(' ');
    await user.click(screen.getByRole('button', { name: 'Cancel: backup.zip' }));
    await user.click(screen.getByRole('button', { name: 'Retry: planilha.xlsx' }));

    expect(onCancel.mock.calls).toEqual([['active'], ['waiting']]);
    expect(onRetry.mock.calls).toEqual([['failed'], ['stopped']]);
    expect(screen.queryByRole('button', { name: /foto.png/ })).not.toBeInTheDocument();
  });

  it('passes accepted and rejected files to the application', () => {
    const onAddFiles = jest.fn();
    const onRejectFiles = jest.fn();
    render(
      <UploadQueue items={[]} onAddFiles={onAddFiles} onRejectFiles={onRejectFiles} accept=".csv" />
    );
    const allowed = new File(['header'], 'relatorio.csv', { type: 'text/csv' });
    const rejected = new File(['content'], 'contrato.pdf', { type: 'application/pdf' });

    fireEvent.drop(screen.getByRole('button', { name: 'Add files' }), {
      dataTransfer: { files: [allowed, rejected] }
    });

    expect(onAddFiles).toHaveBeenCalledWith([allowed]);
    expect(onRejectFiles).toHaveBeenCalledWith([rejected]);
    expect(screen.getByText('No files in the queue')).toBeVisible();
  });

  it('keeps disabled queues read-only and handles missing or out-of-range progress', () => {
    const onAddFiles = jest.fn();
    const onCancel = jest.fn();
    render(
      <UploadQueue
        items={[
          { ...items[0], progress: Number.NaN },
          { id: 'other', name: 'outro.zip', status: 'uploading', progress: 120 }
        ]}
        onAddFiles={onAddFiles}
        onCancel={onCancel}
        disabled
      />
    );

    const dropzone = screen.getByRole('button', { name: 'Add files' });
    expect(dropzone).toHaveAttribute('aria-disabled', 'true');
    fireEvent.drop(dropzone, { dataTransfer: { files: [new File([''], 'sample.txt')] } });
    const firstRow = screen.getByText('relatorio.csv').closest('li')!;
    const cancel = within(firstRow).getByRole('button', { name: 'Cancel: relatorio.csv' });
    expect(cancel).toBeDisabled();
    fireEvent.click(cancel);

    expect(within(firstRow).getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    expect(screen.getByRole('progressbar', { name: 'outro.zip' })).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    expect(onAddFiles).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('allows localized labels and passes the accessibility audit', async () => {
    const { container } = render(
      <UploadQueue
        items={items}
        onAddFiles={() => {}}
        onCancel={() => {}}
        onRetry={() => {}}
        labels={{ queue: 'Fila de envio', add: 'Adicionar arquivos', retry: 'Tentar de novo' }}
      />
    );

    expect(screen.getByRole('list', { name: 'Fila de envio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar arquivos' })).toHaveAccessibleDescription(
      'Drop files here or click to browse'
    );
    expect(
      screen.getByRole('button', { name: 'Tentar de novo: contrato.pdf' })
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
